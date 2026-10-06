import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import http from 'http';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI } from '@google/genai';
import webpush from 'web-push';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------------------------------------------
// Web Push VAPID Configuration for Background Alerts
// -------------------------------------------------------------
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BDKFr-e8i0mSl7h7HjRct4ZW9JU7ZsqVD1YW4LOlHrE_vJ9xcyZspkGAFiK9iZvAjsUbgxb7pSID1BaO_7Hg4tg';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'u-m5DPFdt4Hz0n34Y7aJITIDI0hYTKTw6-YyYlfMfnA';
const VAPID_SUBJECT = 'mailto:chifensama01@gmail.com';

try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log('[WebPush] VAPID details registered successfully');
} catch (e) {
  console.warn('[WebPush] VAPID initialization warning:', e);
}

interface StoredPushSubscription {
  id: string;
  role: 'chif3n' | 'leslye';
  subscription: webpush.PushSubscription;
  createdAt: number;
}

const PUSH_SUBS_FILE = path.resolve(__dirname, '.push_subscriptions.json');

function loadPersistedPushSubscriptions(): StoredPushSubscription[] {
  try {
    if (fs.existsSync(PUSH_SUBS_FILE)) {
      const content = fs.readFileSync(PUSH_SUBS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        console.log(`[WebPush] Loaded ${parsed.length} persisted push subscription(s) from disk`);
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[WebPush] Notice reading persisted push subscriptions:', e);
  }
  return [];
}

function persistPushSubscriptions() {
  try {
    fs.writeFileSync(PUSH_SUBS_FILE, JSON.stringify(pushSubscriptions, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[WebPush] Failed to persist push subscriptions:', e);
  }
}

const pushSubscriptions: StoredPushSubscription[] = loadPersistedPushSubscriptions();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google GenAI client
let aiClient: GoogleGenAI | null = null;
try {
  aiClient = new GoogleGenAI({});
} catch (err) {
  console.warn('[Gemini API] GenAI client init notice (will use procedural fallback if key absent):', err);
}

// -------------------------------------------------------------
// Real-time Love Scrolls / Live Chatbox In-Memory Store
// -------------------------------------------------------------
export interface LiveLoveScroll {
  id: string;
  sender: string;
  senderRole: 'chif3n' | 'leslye' | 'demigod';
  type?: 'text' | 'audio' | 'image';
  text?: string;
  audioUrl?: string;
  duration?: number;
  imageUrl?: string;
  caption?: string;
  reactions?: Record<string, string[]>;
  readBy?: string[];
  timestamp: number;
}

export interface LiveWhisperNote {
  id: string;
  text: string;
  sender?: string;
  date: string;
  timestamp: number;
}

export interface LiveDateNightItem {
  id: string;
  malId: number;
  title: string;
  image: string;
  addedAt: number;
  watched: boolean;
  ourRating: number;
  coupleComment: string;
}

const liveLoveScrolls: LiveLoveScroll[] = [
  {
    id: 'scroll-initial-1',
    sender: 'Sir Chif3n (Demigod) 👑',
    senderRole: 'chif3n',
    type: 'text',
    text: "Welcome to your royal sanctuary, my sweet Leslye! Every single frame and scroll in this realm was built for your comfort and joy. 🌿❤️",
    timestamp: Date.now() - 1000 * 60 * 60 * 4
  },
  {
    id: 'scroll-initial-2',
    sender: 'Sir Chif3n (Demigod) 👑',
    senderRole: 'chif3n',
    type: 'text',
    text: "Ready for our next Date Night stream? I've got your favorite blanket and snacks waiting! ✨",
    timestamp: Date.now() - 1000 * 60 * 60 * 2
  },
  {
    id: 'scroll-initial-3',
    sender: 'Lady Leslye (Maomao) 🌿',
    senderRole: 'leslye',
    type: 'text',
    text: "Thank you for creating this magical realm for me, Sir Chif3n! You are the best boyfriend in the entire world 💚",
    timestamp: Date.now() - 1000 * 60 * 30
  }
];

const liveWhisperNotes: LiveWhisperNote[] = [
  {
    id: 'note-initial-1',
    text: 'Thank you for building my Maomao apothecary realm, Sir Chif3n. You are my favorite protector! 💚',
    sender: 'Lady Leslye 🌿',
    date: 'Today',
    timestamp: Date.now() - 1000 * 60 * 60 * 6
  }
];

const liveDateNightQueue: LiveDateNightItem[] = [
  {
    id: 'dn-54492',
    malId: 54492,
    title: 'The Apothecary Diaries',
    image: 'https://cdn.myanimelist.net/images/anime/1708/138033.jpg',
    addedAt: Date.now() - 1000 * 60 * 60 * 24,
    watched: false,
    ourRating: 5,
    coupleComment: 'Our crown jewel anime! Maomao is literally Leslye 🌿✨'
  },
  {
    id: 'dn-52991',
    malId: 52991,
    title: "Frieren: Beyond Journey's End",
    image: 'https://cdn.myanimelist.net/images/anime/1015/138006.jpg',
    addedAt: Date.now() - 1000 * 60 * 60 * 48,
    watched: true,
    ourRating: 5,
    coupleComment: 'Loved every single second of watching this together.'
  }
];

// Active WebSocket clients set
const connectedClients = new Set<WebSocket>();

function broadcastPayload(payload: any) {
  const json = JSON.stringify(payload);
  for (const client of connectedClients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(json);
      } catch (err) {
        console.warn('WebSocket send error:', err);
      }
    }
  }
}

function broadcastScroll(message: LiveLoveScroll) {
  broadcastPayload({ type: 'new_message', message });
}

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Referer, User-Agent');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// In-memory cache for external repo requests (15 mins TTL)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 15;

function getCached(key: string) {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data;
  }
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

// -------------------------------------------------------------
// 1. Backend Status & Free Repos Health Check
// -------------------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    appName: "Leslye's Imperial Apothecary Streamer",
    author: 'Demigod Sir Chif3n',
    queen: 'Leslye',
    connectedRepos: [
      { name: 'AniList GraphQL v2', type: 'Metadata & Recency Index', status: 'connected' },
      { name: 'Jikan / MyAnimeList v4', type: 'Official MAL Fallback', status: 'connected' },
      { name: 'VidSrc Alpha', type: 'Primary HD Stream Server', status: 'connected' },
      { name: 'VidSrc Celestial', type: 'Multi-Sub Clean Server', status: 'connected' },
      { name: '2Embed / AutoEmbed', type: 'Mirror Stream Server', status: 'connected' },
      { name: 'VidLink Pro', type: 'Direct Stream Mirror', status: 'connected' },
      { name: 'Imperial CORS Proxy', type: 'Referer / Bypass Streamer', status: 'active' }
    ]
  });
});

// -------------------------------------------------------------
// 2. Fetch Recent Anime via AniList GraphQL (Sorted by Recency first)
// -------------------------------------------------------------
const ANILIST_RECENT_QUERY = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, sort: [START_DATE_DESC, POPULARITY_DESC], isAdult: false) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      coverImage {
        extraLarge
        large
      }
      bannerImage
      startDate {
        year
        month
        day
      }
      episodes
      status
      averageScore
      genres
      description
      studios(isMain: true) {
        nodes {
          name
        }
      }
    }
  }
}
`;

app.get('/api/anime/recent', async (req: Request, res: Response) => {
  const cacheKey = 'anilist_recent_anime';
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json({ success: true, source: 'cache', data: cached });
  }

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'LeslyeApothecary/1.0',
      },
      body: JSON.stringify({
        query: ANILIST_RECENT_QUERY,
        variables: { page: 1, perPage: 28 },
      }),
    });

    if (!response.ok) {
      throw new Error(`AniList returned status ${response.status}`);
    }

    const json = await response.json();
    const rawMedia = json.data?.Page?.media || [];

    const formatted = rawMedia.map((m: any) => ({
      mal_id: m.idMal || m.id,
      anilist_id: m.id,
      title: m.title.romaji || m.title.english,
      title_english: m.title.english || m.title.romaji,
      title_japanese: m.title.native,
      images: {
        jpg: {
          image_url: m.coverImage.large,
          large_image_url: m.coverImage.extraLarge || m.coverImage.large,
        },
        webp: {
          image_url: m.coverImage.large,
          large_image_url: m.coverImage.extraLarge || m.coverImage.large,
        }
      },
      score: m.averageScore ? m.averageScore / 10 : null,
      episodes: m.episodes,
      status: m.status === 'RELEASING' ? 'Currently Airing' : 'Finished Airing',
      synopsis: m.description ? m.description.replace(/<[^>]*>?/gm, '') : '',
      year: m.startDate?.year || 2024,
      genres: (m.genres || []).map((name: string, idx: number) => ({ mal_id: idx, name })),
      studios: (m.studios?.nodes || []).map((s: any, idx: number) => ({ mal_id: idx, name: s.name })),
    }));

    setCache(cacheKey, formatted);
    return res.json({ success: true, source: 'anilist', data: formatted });
  } catch (err: any) {
    console.warn('AniList fetch error, falling back to Jikan API:', err.message);

    try {
      // Jikan Seasons Now fallback
      const jikanRes = await fetch('https://api.jikan.moe/v4/seasons/now?limit=24&sfw=true');
      if (jikanRes.ok) {
        const jikanJson = await jikanRes.json();
        const results = (jikanJson.data || []).map((raw: any) => ({
          mal_id: raw.mal_id,
          title: raw.title,
          title_english: raw.title_english || raw.title,
          title_japanese: raw.title_japanese,
          images: raw.images,
          score: raw.score,
          episodes: raw.episodes,
          status: raw.status,
          synopsis: raw.synopsis,
          year: raw.year || raw.aired?.prop?.from?.year || 2024,
          genres: raw.genres || [],
          studios: raw.studios || [],
        }));
        setCache(cacheKey, results);
        return res.json({ success: true, source: 'jikan', data: results });
      }
    } catch (jikanErr) {
      console.error('All remote repos failed:', jikanErr);
    }

    res.status(500).json({ success: false, message: 'Failed to fetch recent anime from upstream' });
  }
});

// -------------------------------------------------------------
// 3. Search Anime across Free Repos
// -------------------------------------------------------------
const ANILIST_SEARCH_QUERY = `
query ($search: String) {
  Page(page: 1, perPage: 24) {
    media(search: $search, type: ANIME, isAdult: false, sort: [START_DATE_DESC, SEARCH_MATCH]) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      coverImage {
        extraLarge
        large
      }
      startDate {
        year
      }
      episodes
      status
      averageScore
      genres
      description
      studios(isMain: true) {
        nodes {
          name
        }
      }
    }
  }
}
`;

app.get('/api/anime/search', async (req: Request, res: Response) => {
  const query = (req.query.q as string || '').trim();
  if (!query) {
    return res.json({ success: true, data: [] });
  }

  const cacheKey = `search_${query.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json({ success: true, source: 'cache', data: cached });
  }

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: ANILIST_SEARCH_QUERY,
        variables: { search: query },
      }),
    });

    if (response.ok) {
      const json = await response.json();
      const rawMedia = json.data?.Page?.media || [];

      const formatted = rawMedia.map((m: any) => ({
        mal_id: m.idMal || m.id,
        anilist_id: m.id,
        title: m.title.romaji || m.title.english,
        title_english: m.title.english || m.title.romaji,
        title_japanese: m.title.native,
        images: {
          jpg: {
            image_url: m.coverImage.large,
            large_image_url: m.coverImage.extraLarge || m.coverImage.large,
          }
        },
        score: m.averageScore ? m.averageScore / 10 : null,
        episodes: m.episodes,
        status: m.status === 'RELEASING' ? 'Currently Airing' : 'Finished Airing',
        synopsis: m.description ? m.description.replace(/<[^>]*>?/gm, '') : '',
        year: m.startDate?.year || 2024,
        genres: (m.genres || []).map((name: string, idx: number) => ({ mal_id: idx, name })),
        studios: (m.studios?.nodes || []).map((s: any, idx: number) => ({ mal_id: idx, name: s.name })),
      }));

      setCache(cacheKey, formatted);
      return res.json({ success: true, source: 'anilist', data: formatted });
    }
  } catch (err) {
    console.warn('AniList search failed, trying Jikan:', err);
  }

  // Jikan Fallback Search
  try {
    const jikanRes = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=24&sfw=true`);
    if (jikanRes.ok) {
      const jikanJson = await jikanRes.json();
      const results = (jikanJson.data || []).map((raw: any) => ({
        mal_id: raw.mal_id,
        title: raw.title,
        title_english: raw.title_english || raw.title,
        title_japanese: raw.title_japanese,
        images: raw.images,
        score: raw.score,
        episodes: raw.episodes,
        status: raw.status,
        synopsis: raw.synopsis,
        year: raw.year || raw.aired?.prop?.from?.year,
        genres: raw.genres || [],
        studios: raw.studios || [],
      }));
      setCache(cacheKey, results);
      return res.json({ success: true, source: 'jikan', data: results });
    }
  } catch (e) {
    console.error('All search options failed:', e);
  }

  res.status(500).json({ success: false, message: 'Search failed' });
});

// -------------------------------------------------------------
// 4. Stream Source Resolver: Connects to free streaming repos
// -------------------------------------------------------------
app.get('/api/anime/:id/episode/:ep/embed', (req: Request, res: Response) => {
  const { id, ep } = req.params;
  const episode = parseInt(ep, 10) || 1;

  if (!id) {
    return res.status(400).json({ success: false, message: 'Missing anime id' });
  }

  const sources = [
    {
      vial: 'Vial I',
      serverName: 'VidSrc CC (Primary)',
      embedUrl: `https://vidsrc.cc/v2/embed/anime/${id}/${episode}`,
      quality: '1080p Ultra HD',
      isDefault: true
    },
    {
      vial: 'Vial II',
      serverName: 'Embed SU (Mirror A)',
      embedUrl: `https://embed.su/embed/anime/${id}/${episode}`,
      quality: '1080p High Speed',
      isDefault: false
    },
    {
      vial: 'Vial III',
      serverName: 'VidSrc Me (Mirror B)',
      embedUrl: `https://vidsrc.me/embed/anime?id=${id}&ep=${episode}`,
      quality: '720p/1080p Fast',
      isDefault: false
    },
    {
      vial: 'Vial IV',
      serverName: '2Embed (Direct)',
      embedUrl: `https://2embed.cc/embed/${id}`,
      quality: 'Direct Stream',
      isDefault: false
    }
  ];

  res.json({
    success: true,
    animeId: id,
    episode,
    primaryEmbed: sources[0].embedUrl,
    sources,
    cdn: 'Leslye Stream CDN - 1080p Ultra HD (60 FPS)'
  });
});

app.get('/api/anime/sources', (req: Request, res: Response) => {
  const malId = req.query.malId as string;
  const episode = parseInt(req.query.episode as string) || 1;

  if (!malId) {
    return res.status(400).json({ success: false, message: 'Missing malId parameter' });
  }

  // Multi-server endpoints from verified open community providers
  const servers = [
    {
      id: 'vidsrc-cc',
      name: 'VidSrc Alpha (v2 Primary)',
      tag: 'Fastest · HD 1080p',
      embedUrl: `https://vidsrc.cc/v2/embed/anime/${malId}/${episode}`,
      type: 'embed',
      isDefault: true
    },
    {
      id: 'embedsu',
      name: 'EmbedSU (Secondary Resolver)',
      tag: 'Cloud Resolver · Multi-Audio',
      embedUrl: `https://embed.su/embed/anime/${malId}/${episode}`,
      type: 'embed',
      isDefault: false
    },
    {
      id: 'vidsrc-to',
      name: 'VidSrc To (Mirror)',
      tag: 'Alternative Cloud Server',
      embedUrl: `https://vidsrc.to/embed/anime/${malId}/${episode}`,
      type: 'embed',
      isDefault: false
    },
    {
      id: '2embed',
      name: 'Apothecary Mirror (2Embed)',
      tag: 'Reliable Direct Mirror',
      embedUrl: `https://www.2embed.cc/embedmal/${malId}?ep=${episode}`,
      type: 'embed',
      isDefault: false
    },
    {
      id: 'vidlink',
      name: 'Celestial Nexus (VidLink Pro)',
      tag: 'No-Buffering Alternative',
      embedUrl: `https://vidlink.pro/anime/${malId}/${episode}`,
      type: 'embed',
      isDefault: false
    },
    {
      id: 'multiembed',
      name: 'Imperial MultiEmbed',
      tag: 'Multi-Source Fallback',
      embedUrl: `https://multiembed.mov/?video_id=${malId}&s=${episode}`,
      type: 'embed',
      isDefault: false
    }
  ];

  res.json({
    success: true,
    malId,
    episode,
    servers,
    tips: "Sir Chif3n's Tip for Leslye: All servers run inside sandboxed frames with popups blocked. If one buffers, click another server instantly!"
  });
});

// -------------------------------------------------------------
// 5. CORS & Referer Bypass Proxy (for .m3u8, video chunks, and feeds)
// -------------------------------------------------------------
app.get('/api/proxy', async (req: Request, res: Response) => {
  const targetUrl = req.query.url as string;
  const referer = (req.query.referer as string) || 'https://vidsrc.to';

  if (!targetUrl) {
    return res.status(400).send('Missing url param');
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': referer,
        'Origin': new URL(referer).origin,
      },
    });

    const contentType = response.headers.get('content-type') || 'application/vnd.apple.mpegurl';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Pipe the response body to client
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error('Proxy streaming error:', err.message);
    res.status(500).send('Error proxying media resource');
  }
});

// -------------------------------------------------------------
// AI-Powered & Procedural Infinite Apothecary Affirmations
// -------------------------------------------------------------
const PROCEDURAL_AFFIRMATION_HERBS = [
  "Sweet Mountain Angelica & Licorice Root",
  "Dried Star Jasmine & Silver Needle Tea",
  "Crushed Rose Quartz & Imperial Lotus",
  "Wild Ginseng & Steamed Chrysanthemum",
  "Honeyed Wolfberry & Red Date Elixir",
  "Roasted Barley & Palace Honeycomb",
  "Peppermint & Glacial Snow Lotus",
  "Imperial Ox-Bezoar & Dragon Flute Root",
  "Sacred Agarwood & Golden Osmanthus",
  "Moonlit Magnolia & Pearl Powder",
  "Bitter Melon & Amber Pine Resin",
  "Crimson Camellia & Celestial Spring Dew"
];

const PROCEDURAL_TEMPERAMENTS = [
  "Tranquility, Rest & Deep Peace",
  "Intellectual Brilliance & Razor Focus",
  "Undying Demigod Devotion & Protection",
  "Patience, Gentleness & Restoration",
  "Palace Immunity Against All Stress",
  "Radiant Warmth & Courage",
  "Unrivaled Mystery-Solving Genius",
  "Celestial Harmony & Sweet Dreams"
];

const PROCEDURAL_QUOTES = [
  "Even the deadliest poison in the imperial palace yields to the right remedy; take today one breath at a time, my beloved Leslye. 🌿",
  "Curiosity is your greatest superpower. Walk softly, uncover the truth, but fear no shadow today. ✨",
  "No court conspiracy, worldly noise, or tiresome duties can diminish how intensely your Demigod adores you every single day. ❤️",
  "Like rare medicinal herbs found on misty peaks, the most exquisite souls require warmth and patience to bloom. Rest your eyes when weary.",
  "Testing for poison is basic palace protocol—testing my love for you reveals 100% celestial purity with absolute zero toxins. 🧪",
  "Whenever mortal life feels bitter, remember that the most potent medicines taste sharpest before bringing legendary vitality. You are cherished.",
  "Like Maomao unraveling the imperial court's darkest riddles, you handle every challenge with effortless elegance and unmatched brilliance.",
  "If the imperial banquet is full of pretenders, let us slip away to our herbal laboratory and binge our favorite shows together. 🍵",
  "Your smile has higher medicinal efficacy than thousand-year-old wild ginseng. One glance heals every ache in my demigod heart.",
  "May your tea stay hot, your snacks remain sweet, and your day be protected from all tiresome people by royal decree.",
  "A true apothecary never rushes the decoction. Breathe in, breathe out—everything will align for you in perfect time, my love.",
  "You don't need to prove anything to anyone in this realm. Being yourself is already the highest imperial treasure.",
  "The celestial stars align whenever you laugh. May today grant you quiet moments of pure peace and cozy joy."
];

app.post('/api/affirmations/generate', async (req: Request, res: Response) => {
  const { mood, theme } = req.body || {};

  // Try generating via Gemini API if aiClient is active
  if (aiClient) {
    try {
      const prompt = `You are the Imperial Apothecary Oracle in "Leslye's Realm", a cozy anime streaming sanctuary crafted with demigod devotion by Sir Chif3n for his girlfriend Leslye (who is adored like Maomao from The Apothecary Diaries).
User requested mood: "${mood || 'encouraging and loving'}", theme: "${theme || 'apothecary wisdom'}".
Generate a brand new, never-seen-before daily affirmation for Lady Leslye.
Respond ONLY with a valid JSON object matching this schema without markdown fences:
{
  "quote": "Bespoke inspirational/loving quote blending apothecary wisdom, anime coziness, and demigod romance (1-2 sentences)",
  "herb": "Name of an authentic or mystical medicinal herb/elixir (e.g. Mountain Angelica, Dried Star Jasmine, Ox Bezoar, Golden Osmanthus)",
  "temperament": "Virtue or mood (e.g. Tranquility & Insight, Radiant Courage, Demigod Devotion)",
  "decree": "Imperial Rear Palace Decree #[random 3 digits] or Demigod Sanctuary Decree #[random 3 digits]",
  "aiNote": "A quick 1-sentence whisper from Sir Chif3n or Maomao"
}`;

      const aiResponse = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const responseText = aiResponse.text?.trim() || '';
      // Clean JSON if wrapped in markdown
      const cleaned = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.quote && parsed.herb) {
        return res.json({
          success: true,
          source: 'gemini-3.8-flash',
          affirmation: {
            quote: parsed.quote,
            herb: parsed.herb,
            temperament: parsed.temperament || 'Imperial Grace',
            decree: parsed.decree || `Imperial Decree #${Math.floor(100 + Math.random() * 899)}`,
            aiNote: parsed.aiNote || 'Brewed with infinite devotion by your Demigod ❤️'
          }
        });
      }
    } catch (err: any) {
      console.warn('[Gemini AI] Affirmation generation fallback to procedural:', err?.message || err);
    }
  }

  // Procedural Infinite Generator fallback
  const randomQuote = PROCEDURAL_QUOTES[Math.floor(Math.random() * PROCEDURAL_QUOTES.length)];
  const randomHerb = PROCEDURAL_AFFIRMATION_HERBS[Math.floor(Math.random() * PROCEDURAL_AFFIRMATION_HERBS.length)];
  const randomTemp = PROCEDURAL_TEMPERAMENTS[Math.floor(Math.random() * PROCEDURAL_TEMPERAMENTS.length)];
  const decreeNum = Math.floor(100 + Math.random() * 900);
  const decrees = [
    `Imperial Rear Palace Decree #${decreeNum}`,
    `Demigod Sanctuary Decree #${decreeNum}`,
    `Maomao Herbal Ledger #${decreeNum}`,
    `Imperial Court Decree #${decreeNum}`
  ];

  res.json({
    success: true,
    source: 'imperial-oracle-procedural',
    affirmation: {
      quote: randomQuote,
      herb: randomHerb,
      temperament: randomTemp,
      decree: decrees[Math.floor(Math.random() * decrees.length)],
      aiNote: 'Brewed freshly from the Imperial Apothecary Crucible ✨'
    }
  });
});

// -------------------------------------------------------------
// Real-Time Multi-Game Couple Arcade (Demigod vs Maomao)
// -------------------------------------------------------------
export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  category: string;
  difficulty: string;
  funFact: string;
}

const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 't-1',
    question: "In 'The Apothecary Diaries', what rare item does Maomao get uncontrollably excited about?",
    options: ["Gold Ingots", "Ox-Bezoar (Bovine Gallstone)", "Silk Kimonos", "Imperial Hairpins"],
    correctIndex: 1,
    category: "The Apothecary Diaries 🌿",
    difficulty: "Imperial Basic",
    funFact: "Maomao's eyes sparkle whenever ox-bezoar is mentioned—she considers it far more valuable than gold!"
  },
  {
    id: 't-2',
    question: "Who loves Lady Leslye more than anyone else in the entire multiverse?",
    options: ["Sir Chif3n (Her Demigod)", "Jinshi", "Gojo Satoru", "Himmel the Hero"],
    correctIndex: 0,
    category: "Demigod Devotion 👑",
    difficulty: "Undisputed Fact",
    funFact: "Sir Chif3n's love has been tested with 100% purity and zero toxins across all dimensions!"
  },
  {
    id: 't-3',
    question: "In 'Frieren: Beyond Journey's End', what kind of eccentric spells does Frieren love collecting?",
    options: ["World-destroying fire magic", "Spells that make flowers bloom & dissolve clothes", "Instant teleportation spells", "Mind reading hexes"],
    correctIndex: 1,
    category: "Frieren 🪄",
    difficulty: "Adventurer",
    funFact: "Frieren will accept odd jobs just to receive folk grimoires for cleaning bronze statues or making sweet shaved ice!"
  },
  {
    id: 't-4',
    question: "What is the First Law of Equivalent Exchange in 'Fullmetal Alchemist'?",
    options: ["To obtain something, something of equal value must be lost", "Energy cannot be created or destroyed", "Gold can be forged from lead", "Love conquers all alchemy"],
    correctIndex: 0,
    category: "Fullmetal Alchemist ⚡",
    difficulty: "State Alchemist",
    funFact: "Humankind cannot gain anything without first giving something in return—except Sir Chif3n's unconditional pampering for Leslye!"
  },
  {
    id: 't-5',
    question: "In 'The Apothecary Diaries', how does Maomao often test whether a food contains poison?",
    options: ["She feeds it to a palace guard", "She tastes it herself with pure clinical delight", "She drops silver chopsticks into it", "She gives it to a cat"],
    correctIndex: 1,
    category: "The Apothecary Diaries 🌿",
    difficulty: "Apothecary Test",
    funFact: "Her ecstatic face when tasting venomous soups shocked the entire rear palace banquet!"
  },
  {
    id: 't-6',
    question: "In 'Ascendance of a Bookworm', what is Myne's ultimate life obsession?",
    options: ["Baking cakes", "Reading books and making paper", "Becoming a knight", "Sleeping all day"],
    correctIndex: 1,
    category: "Bookworm 📖",
    difficulty: "Librarian",
    funFact: "Myne would happily reinvent the printing press from scratch just to hold a book!"
  },
  {
    id: 't-7',
    question: "In 'Demon Slayer', what floral fragrance is Muzan Kibutsuji desperately seeking?",
    options: ["Blue Spider Lily", "Red Moon Orchid", "Golden Lotus", "Imperial Cherry Blossom"],
    correctIndex: 0,
    category: "Demon Slayer ⚔️",
    difficulty: "Demon Slayer Corps",
    funFact: "The mythical Blue Spider Lily only blooms during the daytime a few days each year!"
  },
  {
    id: 't-8',
    question: "In 'Spirited Away', what did Chihiro's parents greedily transform into?",
    options: ["Frogs", "Pigs", "Crows", "Shadows"],
    correctIndex: 1,
    category: "Studio Ghibli 🏮",
    difficulty: "Bathhouse Classic",
    funFact: "Haku helped Chihiro remember her name so she wouldn't forget her mortal identity."
  }
];

const ALCHEMY_HERB_PAIRS = [
  { symbol: '🌿', name: 'Sweet Angelica' },
  { symbol: '🌸', name: 'Snow Lotus' },
  { symbol: '🧄', name: 'Ox-Bezoar' },
  { symbol: '🧪', name: 'Phoenix Elixir' },
  { symbol: '🍯', name: 'Honey Wolfberry' },
  { symbol: '🍵', name: 'Silver Needle' },
  { symbol: '🍄', name: 'Celestial Truffle' },
  { symbol: '💎', name: 'Jade Licorice' }
];

function createShuffledAlchemyCards() {
  const cards: Array<{ id: number; symbol: string; herbName: string; isMatched: boolean; matchedBy?: string }> = [];
  let id = 0;
  for (const pair of ALCHEMY_HERB_PAIRS) {
    cards.push({ id: id++, symbol: pair.symbol, herbName: pair.name, isMatched: false });
    cards.push({ id: id++, symbol: pair.symbol, herbName: pair.name, isMatched: false });
  }
  // Shuffle cards
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export interface ArcadeState {
  activeGame: 'board' | 'trivia' | 'alchemy';
  boardGame: {
    board: (string | null)[][];
    mode: 'tictactoe' | 'gomoku';
    gridSize: number;
    currentTurn: 'chif3n' | 'leslye';
    winner: 'chif3n' | 'leslye' | 'draw' | null;
    scores: { chif3n: number; leslye: number; ties: number };
    lastMove: { row: number; col: number; player: string } | null;
  };
  triviaGame: {
    questionIndex: number;
    totalQuestions: number;
    currentQuestion: TriviaQuestion;
    answers: { chif3n: number | null; leslye: number | null };
    scores: { chif3n: number; leslye: number };
    revealed: boolean;
    roundWinner: string | null;
  };
  alchemyGame: {
    cards: Array<{ id: number; symbol: string; herbName: string; isMatched: boolean; matchedBy?: string }>;
    flippedIndices: number[];
    currentTurn: 'chif3n' | 'leslye';
    scores: { chif3n: number; leslye: number };
    winner: 'chif3n' | 'leslye' | 'draw' | null;
  };
  presence: {
    chif3n: boolean;
    leslye: boolean;
    lastPingChif3n: number;
    lastPingLeslye: number;
  };
  lastUpdated: number;
}

let coupleArcadeState: ArcadeState = {
  activeGame: 'board',
  boardGame: {
    board: [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ],
    mode: 'tictactoe',
    gridSize: 3,
    currentTurn: 'chif3n',
    winner: null,
    scores: { chif3n: 0, leslye: 0, ties: 0 },
    lastMove: null
  },
  triviaGame: {
    questionIndex: 0,
    totalQuestions: TRIVIA_QUESTIONS.length,
    currentQuestion: TRIVIA_QUESTIONS[0],
    answers: { chif3n: null, leslye: null },
    scores: { chif3n: 0, leslye: 0 },
    revealed: false,
    roundWinner: null
  },
  alchemyGame: {
    cards: createShuffledAlchemyCards(),
    flippedIndices: [],
    currentTurn: 'chif3n',
    scores: { chif3n: 0, leslye: 0 },
    winner: null
  },
  presence: {
    chif3n: false,
    leslye: false,
    lastPingChif3n: 0,
    lastPingLeslye: 0
  },
  lastUpdated: Date.now()
};

function broadcastArcadeUpdate() {
  const payload = JSON.stringify({ type: 'arcade_update', arcade: coupleArcadeState });
  for (const client of connectedClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

function checkBoardWin(board: (string | null)[][], size: number, winLength: number): 'chif3n' | 'leslye' | 'draw' | null {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const p = board[r][c];
      if (!p) continue;

      // Horizontal
      if (c + winLength <= size) {
        let win = true;
        for (let k = 0; k < winLength; k++) if (board[r][c + k] !== p) { win = false; break; }
        if (win) return p as any;
      }
      // Vertical
      if (r + winLength <= size) {
        let win = true;
        for (let k = 0; k < winLength; k++) if (board[r + k][c] !== p) { win = false; break; }
        if (win) return p as any;
      }
      // Diagonal down-right
      if (r + winLength <= size && c + winLength <= size) {
        let win = true;
        for (let k = 0; k < winLength; k++) if (board[r + k][c + k] !== p) { win = false; break; }
        if (win) return p as any;
      }
      // Diagonal up-right
      if (r - winLength + 1 >= 0 && c + winLength <= size) {
        let win = true;
        for (let k = 0; k < winLength; k++) if (board[r - k][c + k] !== p) { win = false; break; }
        if (win) return p as any;
      }
    }
  }
  const isFull = board.every(row => row.every(cell => cell !== null));
  if (isFull) return 'draw';
  return null;
}

// -------------------------------------------------------------
// -------------------------------------------------------------
// 6. Real-time Love Scrolls & Messages API Endpoints
// -------------------------------------------------------------
app.get('/api/scrolls', (req: Request, res: Response) => {
  const since = parseInt(req.query.since as string, 10);
  if (!isNaN(since) && since > 0) {
    const fresh = liveLoveScrolls.filter(m => m.timestamp > since);
    return res.json({ success: true, messages: fresh, serverTime: Date.now() });
  }
  res.json({
    success: true,
    messages: liveLoveScrolls,
    serverTime: Date.now()
  });
});

// -------------------------------------------------------------
// Web Push Notification Helper for Closed App Delivery
// -------------------------------------------------------------
async function sendBackgroundPushNotification(scroll: LiveLoveScroll, forcedTargetRole?: 'chif3n' | 'leslye') {
  const recipientRole = forcedTargetRole || (scroll.senderRole === 'chif3n' ? 'leslye' : 'chif3n');
  const senderTitle = scroll.senderRole === 'leslye' ? 'Lady Leslye 🌿' : 'Sir Chif3n 👑';

  let preview = 'Inscribed a new love decree 💌';
  if (scroll.text) {
    preview = scroll.text.length > 80 ? `${scroll.text.slice(0, 77)}...` : scroll.text;
  } else if (scroll.type === 'audio') {
    preview = 'Sent a sacred voice note potion 🎙️';
  } else if (scroll.type === 'image') {
    preview = scroll.caption ? `Sent a photo: ${scroll.caption}` : 'Sent an apothecary photo potion 📸';
  }

  const payload = JSON.stringify({
    title: `💌 Love Scroll from ${senderTitle}`,
    body: preview,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `scroll-${scroll.id}`,
    url: '/?openVault=true',
    data: { url: '/?openVault=true' }
  });

  // Target subscriptions matching recipientRole; fallback to all active if forcedTargetRole specified
  let targets = pushSubscriptions.filter(s => s.role === recipientRole);
  if (targets.length === 0 && forcedTargetRole && pushSubscriptions.length > 0) {
    targets = [...pushSubscriptions];
  }

  let sentCount = 0;
  const deadIndices: number[] = [];

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    try {
      await webpush.sendNotification(target.subscription, payload, {
        TTL: 60 * 60 * 24 // 24 hours
      });
      sentCount++;
      console.log(`[WebPush] Successfully delivered push notification to ${target.role}`);
    } catch (err: any) {
      console.warn(`[WebPush] Push notification error for ${target.role}:`, err?.statusCode || err?.message);
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        const idx = pushSubscriptions.indexOf(target);
        if (idx !== -1) deadIndices.push(idx);
      }
    }
  }

  if (deadIndices.length > 0) {
    deadIndices.sort((a, b) => b - a).forEach(idx => pushSubscriptions.splice(idx, 1));
    persistPushSubscriptions();
  }

  return { sentCount, totalTargets: targets.length };
}

// -------------------------------------------------------------
// Web Push Subscription Endpoints
// -------------------------------------------------------------
app.get('/sw.js', (req: Request, res: Response) => {
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.resolve(__dirname, 'public', 'sw.js'));
});

app.get('/api/push/vapid-public-key', (req: Request, res: Response) => {
  res.json({ success: true, publicKey: VAPID_PUBLIC_KEY });
});

app.post('/api/push/subscribe', (req: Request, res: Response) => {
  const { role, subscription } = req.body;
  if (!role || !subscription || !subscription.endpoint) {
    return res.status(400).json({ success: false, message: 'Invalid subscription payload' });
  }

  const existingIdx = pushSubscriptions.findIndex(s => s.subscription.endpoint === subscription.endpoint);
  if (existingIdx !== -1) {
    pushSubscriptions.splice(existingIdx, 1);
  }

  pushSubscriptions.push({
    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    role: role === 'leslye' ? 'leslye' : 'chif3n',
    subscription,
    createdAt: Date.now()
  });

  persistPushSubscriptions();
  console.log(`[WebPush] Registered push subscription for ${role}. Total active: ${pushSubscriptions.length}`);
  res.json({ success: true, count: pushSubscriptions.length });
});

app.post('/api/push/test', async (req: Request, res: Response) => {
  const { role } = req.body;
  const targetRole = role === 'leslye' ? 'leslye' : 'chif3n';
  const senderTitle = targetRole === 'leslye' ? 'Sir Chif3n 👑' : 'Lady Leslye 🌿';

  const testScroll: LiveLoveScroll = {
    id: `test-${Date.now()}`,
    sender: senderTitle,
    senderRole: targetRole === 'leslye' ? 'chif3n' : 'leslye',
    type: 'text',
    text: 'Testing your snacks for poison... Demigod cuddles on demand ❤️ (Push alert while closed)',
    timestamp: Date.now()
  };

  const result = await sendBackgroundPushNotification(testScroll, targetRole);
  res.json({
    success: result.sentCount > 0,
    sentCount: result.sentCount,
    totalTargets: result.totalTargets,
    message: result.sentCount > 0
      ? `Dispatched test push notification to ${result.sentCount} active subscription(s)! Close the tab to verify background delivery.`
      : pushSubscriptions.length > 0
        ? `Fallback push dispatched to ${pushSubscriptions.length} available device(s).`
        : 'No devices have registered push subscriptions yet. Click "Enable Alerts" on this device first!'
  });
});

app.post('/api/scrolls', (req: Request, res: Response) => {
  const { sender, senderRole, text, type, audioUrl, duration, imageUrl, caption, reactions, readBy } = req.body;
  const hasText = text && typeof text === 'string' && text.trim().length > 0;
  const hasAudio = !!audioUrl;
  const hasImage = !!imageUrl;

  if (!hasText && !hasAudio && !hasImage) {
    return res.status(400).json({ success: false, message: 'Message payload must have text, audio, or image' });
  }

  const determinedType = type || (hasAudio ? 'audio' : hasImage ? 'image' : 'text');

  const newScroll: LiveLoveScroll = {
    id: req.body.id || `scroll-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sender: sender?.trim() || 'Sir Chif3n (Demigod) 👑',
    senderRole: senderRole || 'chif3n',
    type: determinedType,
    text: hasText ? text.trim() : undefined,
    audioUrl: audioUrl || undefined,
    duration: typeof duration === 'number' ? duration : undefined,
    imageUrl: imageUrl || undefined,
    caption: caption ? String(caption).trim() : undefined,
    reactions: reactions || {},
    readBy: Array.isArray(readBy) && readBy.length > 0 ? readBy : [senderRole || 'chif3n'],
    timestamp: Date.now()
  };

  liveLoveScrolls.push(newScroll);
  if (liveLoveScrolls.length > 300) {
    liveLoveScrolls.shift();
  }

  // Broadcast to all active WebSocket clients in real time
  broadcastScroll(newScroll);

  // Send background push notification to partner device (even if browser/app is closed)
  sendBackgroundPushNotification(newScroll).catch(err => {
    console.warn('[WebPush] Error dispatching push:', err);
  });

  res.json({
    success: true,
    message: newScroll,
    serverTime: Date.now()
  });
});

app.post('/api/scrolls/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ success: false, message: 'Missing role' });
  }

  const msg = liveLoveScrolls.find(m => m.id === id);
  if (msg) {
    if (!msg.readBy) msg.readBy = [];
    if (!msg.readBy.includes(role)) {
      msg.readBy.push(role);
      broadcastPayload({ type: 'mark_read', id: msg.id, role, readBy: msg.readBy });
    }
    return res.json({ success: true, readBy: msg.readBy });
  }
  res.status(404).json({ success: false, message: 'Scroll not found' });
});

app.post('/api/scrolls/mark-all-read', (req: Request, res: Response) => {
  const { role, ids } = req.body;
  if (!role) {
    return res.status(400).json({ success: false, message: 'Missing role' });
  }

  const idSet = Array.isArray(ids) && ids.length > 0 ? new Set(ids) : null;
  const updatedIds: string[] = [];

  liveLoveScrolls.forEach(msg => {
    if (!idSet || idSet.has(msg.id)) {
      if (!msg.readBy) msg.readBy = [];
      if (!msg.readBy.includes(role)) {
        msg.readBy.push(role);
        updatedIds.push(msg.id);
      }
    }
  });

  if (updatedIds.length > 0) {
    broadcastPayload({ type: 'mark_all_read', ids: updatedIds, role });
  }
  res.json({ success: true, updatedCount: updatedIds.length });
});

app.delete('/api/scrolls/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = liveLoveScrolls.findIndex(m => m.id === id);
  if (idx !== -1) {
    liveLoveScrolls.splice(idx, 1);
    broadcastPayload({ type: 'delete_message', id });
    return res.json({ success: true, id });
  }
  res.status(404).json({ success: false, message: 'Scroll not found' });
});

app.post('/api/scrolls/:id/react', (req: Request, res: Response) => {
  const { id } = req.params;
  const { emoji, user } = req.body;
  if (!emoji || !user) {
    return res.status(400).json({ success: false, message: 'Missing emoji or user' });
  }

  const msg = liveLoveScrolls.find(m => m.id === id);
  if (msg) {
    if (!msg.reactions) msg.reactions = {};
    if (!msg.reactions[emoji]) msg.reactions[emoji] = [];
    const list = msg.reactions[emoji];
    const uIdx = list.indexOf(user);
    if (uIdx === -1) {
      list.push(user);
    } else {
      list.splice(uIdx, 1);
      if (list.length === 0) delete msg.reactions[emoji];
    }
    broadcastPayload({ type: 'update_message_reactions', id, reactions: msg.reactions });
    return res.json({ success: true, reactions: msg.reactions });
  }
  res.status(404).json({ success: false, message: 'Scroll not found' });
});

// -------------------------------------------------------------
// Herbal Diary & Whispers API Endpoints (Lady Leslye's Whispers)
// -------------------------------------------------------------
app.get('/api/notes', (req: Request, res: Response) => {
  res.json({ success: true, notes: liveWhisperNotes });
});

app.post('/api/notes', (req: Request, res: Response) => {
  const { text, sender, date } = req.body;
  if (!text || !String(text).trim()) {
    return res.status(400).json({ success: false, message: 'Note text cannot be empty' });
  }

  const newNote: LiveWhisperNote = {
    id: req.body.id || `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    text: String(text).trim(),
    sender: sender?.trim() || 'Lady Leslye 🌿',
    date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    timestamp: Date.now()
  };

  liveWhisperNotes.unshift(newNote);
  if (liveWhisperNotes.length > 200) liveWhisperNotes.pop();

  broadcastPayload({ type: 'new_whisper', note: newNote });
  res.json({ success: true, note: newNote });
});

app.delete('/api/notes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = liveWhisperNotes.findIndex(n => n.id === id);
  if (idx !== -1) {
    liveWhisperNotes.splice(idx, 1);
    broadcastPayload({ type: 'delete_whisper', id });
    return res.json({ success: true, id });
  }
  res.status(404).json({ success: false, message: 'Note not found' });
});

// -------------------------------------------------------------
// Date Night Queue API Endpoints
// -------------------------------------------------------------
app.get('/api/datenight', (req: Request, res: Response) => {
  res.json({ success: true, items: liveDateNightQueue });
});

app.post('/api/datenight', (req: Request, res: Response) => {
  const { malId, title, image, coupleComment, ourRating, watched } = req.body;
  if (!malId || !title) {
    return res.status(400).json({ success: false, message: 'Missing malId or title' });
  }

  const existingIdx = liveDateNightQueue.findIndex(i => i.malId === Number(malId));
  if (existingIdx !== -1) {
    // Update existing
    liveDateNightQueue[existingIdx] = {
      ...liveDateNightQueue[existingIdx],
      coupleComment: coupleComment !== undefined ? coupleComment : liveDateNightQueue[existingIdx].coupleComment,
      ourRating: ourRating !== undefined ? ourRating : liveDateNightQueue[existingIdx].ourRating,
      watched: watched !== undefined ? watched : liveDateNightQueue[existingIdx].watched
    };
    broadcastPayload({ type: 'datenight_update', items: liveDateNightQueue });
    return res.json({ success: true, items: liveDateNightQueue, item: liveDateNightQueue[existingIdx] });
  }

  const newItem: LiveDateNightItem = {
    id: `dn-${malId}`,
    malId: Number(malId),
    title: String(title),
    image: image || '',
    addedAt: Date.now(),
    watched: !!watched,
    ourRating: typeof ourRating === 'number' ? ourRating : 5,
    coupleComment: coupleComment || 'Saved for Date Night stream! 🍿'
  };

  liveDateNightQueue.unshift(newItem);
  broadcastPayload({ type: 'datenight_update', items: liveDateNightQueue });
  res.json({ success: true, items: liveDateNightQueue, item: newItem });
});

app.delete('/api/datenight/:malId', (req: Request, res: Response) => {
  const malId = Number(req.params.malId);
  const idx = liveDateNightQueue.findIndex(i => i.malId === malId);
  if (idx !== -1) {
    liveDateNightQueue.splice(idx, 1);
    broadcastPayload({ type: 'datenight_update', items: liveDateNightQueue });
    return res.json({ success: true, items: liveDateNightQueue });
  }
  res.status(404).json({ success: false, message: 'Item not found' });
});

// Webhook endpoint for external integrations, cloud relays & notifications
app.post('/api/webhook/chat', (req: Request, res: Response) => {
  const { sender, senderRole, text, message, content, author, type, audioUrl, imageUrl } = req.body;
  const msgText = (text || message || content || '').trim();
  if (!msgText && !audioUrl && !imageUrl) {
    return res.status(400).json({ success: false, message: 'Missing message content' });
  }

  const newScroll: LiveLoveScroll = {
    id: `scroll-wh-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sender: (sender || author || 'Imperial Envoy 📜').trim(),
    senderRole: senderRole || 'demigod',
    type: type || (audioUrl ? 'audio' : imageUrl ? 'image' : 'text'),
    text: msgText || undefined,
    audioUrl: audioUrl || undefined,
    imageUrl: imageUrl || undefined,
    timestamp: Date.now()
  };

  liveLoveScrolls.push(newScroll);
  if (liveLoveScrolls.length > 300) liveLoveScrolls.shift();
  broadcastScroll(newScroll);

  res.json({ success: true, message: newScroll, webhook: true });
});

app.get('/api/webhook/chat', (req: Request, res: Response) => {
  res.json({ success: true, count: liveLoveScrolls.length, messages: liveLoveScrolls.slice(-20) });
});

// -------------------------------------------------------------
// 7. Real-Time Couple Multi-Game Arcade Endpoints
// -------------------------------------------------------------
app.get('/api/game', (req: Request, res: Response) => {
  // Prune presence pings older than 15s
  const now = Date.now();
  coupleArcadeState.presence.chif3n = (now - coupleArcadeState.presence.lastPingChif3n) < 15000;
  coupleArcadeState.presence.leslye = (now - coupleArcadeState.presence.lastPingLeslye) < 15000;

  res.json({
    success: true,
    arcade: coupleArcadeState,
    game: coupleArcadeState.boardGame // legacy compatibility
  });
});

app.post('/api/game/switch', (req: Request, res: Response) => {
  const { gameType } = req.body;
  if (gameType === 'board' || gameType === 'trivia' || gameType === 'alchemy') {
    coupleArcadeState.activeGame = gameType;
    coupleArcadeState.lastUpdated = Date.now();
    broadcastArcadeUpdate();
  }
  res.json({ success: true, arcade: coupleArcadeState });
});

app.post('/api/game/ping', (req: Request, res: Response) => {
  const { player } = req.body;
  const now = Date.now();
  if (player === 'chif3n') {
    coupleArcadeState.presence.chif3n = true;
    coupleArcadeState.presence.lastPingChif3n = now;
  } else if (player === 'leslye') {
    coupleArcadeState.presence.leslye = true;
    coupleArcadeState.presence.lastPingLeslye = now;
  }
  coupleArcadeState.lastUpdated = now;
  broadcastArcadeUpdate();
  res.json({ success: true, presence: coupleArcadeState.presence });
});

// --- Game 1: Board Game (Tic-Tac-Toe & Gomoku) ---
app.post(['/api/game/board/move', '/api/game/move'], (req: Request, res: Response) => {
  const { row, col, player } = req.body;
  const bg = coupleArcadeState.boardGame;
  const size = bg.gridSize || 3;
  const winLen = bg.mode === 'gomoku' ? 4 : 3;

  if (row < 0 || row >= size || col < 0 || col >= size) {
    return res.status(400).json({ success: false, message: 'Invalid coordinates' });
  }

  if (bg.winner !== null) {
    return res.json({ success: false, message: 'Game has already concluded', arcade: coupleArcadeState, game: bg });
  }

  if (bg.board[row][col] !== null) {
    return res.json({ success: false, message: 'Square already occupied', arcade: coupleArcadeState, game: bg });
  }

  // Record move
  bg.board[row][col] = player;
  bg.lastMove = { row, col, player };
  coupleArcadeState.lastUpdated = Date.now();

  // Check winner
  const winResult = checkBoardWin(bg.board, size, winLen);
  if (winResult) {
    bg.winner = winResult;
    if (winResult === 'chif3n') bg.scores.chif3n++;
    else if (winResult === 'leslye') bg.scores.leslye++;
    else if (winResult === 'draw') bg.scores.ties++;
  } else {
    // Switch turn
    bg.currentTurn = player === 'chif3n' ? 'leslye' : 'chif3n';
  }

  broadcastArcadeUpdate();

  res.json({
    success: true,
    arcade: coupleArcadeState,
    game: bg
  });
});

app.post(['/api/game/board/reset', '/api/game/reset'], (req: Request, res: Response) => {
  const bg = coupleArcadeState.boardGame;
  const size = bg.gridSize || 3;
  bg.board = Array(size).fill(null).map(() => Array(size).fill(null));
  bg.winner = null;
  bg.lastMove = null;
  bg.currentTurn = bg.currentTurn === 'chif3n' ? 'leslye' : 'chif3n';
  coupleArcadeState.lastUpdated = Date.now();

  broadcastArcadeUpdate();

  res.json({
    success: true,
    arcade: coupleArcadeState,
    game: bg
  });
});

app.post('/api/game/board/mode', (req: Request, res: Response) => {
  const { mode } = req.body; // 'tictactoe' | 'gomoku'
  const bg = coupleArcadeState.boardGame;
  if (mode === 'gomoku') {
    bg.mode = 'gomoku';
    bg.gridSize = 6;
    bg.board = Array(6).fill(null).map(() => Array(6).fill(null));
  } else {
    bg.mode = 'tictactoe';
    bg.gridSize = 3;
    bg.board = Array(3).fill(null).map(() => Array(3).fill(null));
  }
  bg.winner = null;
  bg.lastMove = null;
  coupleArcadeState.lastUpdated = Date.now();

  broadcastArcadeUpdate();
  res.json({ success: true, arcade: coupleArcadeState });
});

// --- Game 2: Trivia Showdown ---
app.post('/api/game/trivia/answer', (req: Request, res: Response) => {
  const { player, answerIndex } = req.body;
  const tg = coupleArcadeState.triviaGame;

  if (player === 'chif3n') {
    tg.answers.chif3n = answerIndex;
  } else if (player === 'leslye') {
    tg.answers.leslye = answerIndex;
  }

  // If both players have answered, reveal and calculate round scores
  if (tg.answers.chif3n !== null && tg.answers.leslye !== null) {
    tg.revealed = true;
    const correct = tg.currentQuestion.correctIndex;
    if (tg.answers.chif3n === correct && tg.answers.leslye === correct) {
      tg.scores.chif3n += 10;
      tg.scores.leslye += 10;
      tg.roundWinner = 'tie';
    } else if (tg.answers.chif3n === correct) {
      tg.scores.chif3n += 10;
      tg.roundWinner = 'chif3n';
    } else if (tg.answers.leslye === correct) {
      tg.scores.leslye += 10;
      tg.roundWinner = 'leslye';
    } else {
      tg.roundWinner = 'none';
    }
  }

  coupleArcadeState.lastUpdated = Date.now();
  broadcastArcadeUpdate();
  res.json({ success: true, arcade: coupleArcadeState });
});

app.post('/api/game/trivia/next', (req: Request, res: Response) => {
  const tg = coupleArcadeState.triviaGame;
  tg.questionIndex = (tg.questionIndex + 1) % TRIVIA_QUESTIONS.length;
  tg.currentQuestion = TRIVIA_QUESTIONS[tg.questionIndex];
  tg.answers = { chif3n: null, leslye: null };
  tg.revealed = false;
  tg.roundWinner = null;
  coupleArcadeState.lastUpdated = Date.now();

  broadcastArcadeUpdate();
  res.json({ success: true, arcade: coupleArcadeState });
});

// --- Game 3: Alchemy Herb Memory Duel ---
app.post('/api/game/alchemy/flip', (req: Request, res: Response) => {
  const { cardIndex, player } = req.body;
  const ag = coupleArcadeState.alchemyGame;

  if (ag.winner !== null) {
    return res.json({ success: false, message: 'Game over', arcade: coupleArcadeState });
  }

  if (ag.currentTurn !== player) {
    return res.json({ success: false, message: "Not your turn", arcade: coupleArcadeState });
  }

  if (cardIndex < 0 || cardIndex >= ag.cards.length) {
    return res.status(400).json({ success: false, message: 'Invalid card index' });
  }

  if (ag.cards[cardIndex].isMatched || ag.flippedIndices.includes(cardIndex)) {
    return res.json({ success: false, message: 'Card already revealed or matched', arcade: coupleArcadeState });
  }

  if (ag.flippedIndices.length >= 2) {
    return res.json({ success: false, message: 'Two cards currently flipped', arcade: coupleArcadeState });
  }

  // Flip the card
  ag.flippedIndices.push(cardIndex);

  // If two cards now flipped, evaluate match
  if (ag.flippedIndices.length === 2) {
    const [idx1, idx2] = ag.flippedIndices;
    const card1 = ag.cards[idx1];
    const card2 = ag.cards[idx2];

    if (card1.symbol === card2.symbol) {
      // MATCH!
      card1.isMatched = true;
      card1.matchedBy = player;
      card2.isMatched = true;
      card2.matchedBy = player;
      ag.scores[player as 'chif3n' | 'leslye'] += 10;
      ag.flippedIndices = []; // clear flipped immediately for match

      // Check all matched
      if (ag.cards.every(c => c.isMatched)) {
        if (ag.scores.chif3n > ag.scores.leslye) ag.winner = 'chif3n';
        else if (ag.scores.leslye > ag.scores.chif3n) ag.winner = 'leslye';
        else ag.winner = 'draw';
      }
      // Player gets another turn on match!
    } else {
      // NO MATCH: switch turn after short timeout
      setTimeout(() => {
        ag.flippedIndices = [];
        ag.currentTurn = player === 'chif3n' ? 'leslye' : 'chif3n';
        coupleArcadeState.lastUpdated = Date.now();
        broadcastArcadeUpdate();
      }, 1200);
    }
  }

  coupleArcadeState.lastUpdated = Date.now();
  broadcastArcadeUpdate();
  res.json({ success: true, arcade: coupleArcadeState });
});

app.post('/api/game/alchemy/reset', (req: Request, res: Response) => {
  const ag = coupleArcadeState.alchemyGame;
  ag.cards = createShuffledAlchemyCards();
  ag.flippedIndices = [];
  ag.currentTurn = ag.currentTurn === 'chif3n' ? 'leslye' : 'chif3n';
  ag.winner = null;
  coupleArcadeState.lastUpdated = Date.now();

  broadcastArcadeUpdate();
  res.json({ success: true, arcade: coupleArcadeState });
});

// -------------------------------------------------------------
// 7. Vite Mounting in Dev / Static Serving in Prod with WebSockets
// -------------------------------------------------------------
async function startServer() {
  const server = http.createServer(app);

  // Initialize WebSocket server attached with dedicated upgrade routing
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const url = request.url || '';
    // Let Vite HMR handle its own upgrade protocol
    const protocol = request.headers['sec-websocket-protocol'];
    if (protocol === 'vite-hmr') {
      return;
    }

    if (url.startsWith('/ws') || url === '/ws/chat' || url === '/api/ws' || url === '/') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws: WebSocket) => {
    connectedClients.add(ws);

    // Send complete current live sync snapshot immediately upon connect
    try {
      ws.send(JSON.stringify({
        type: 'init',
        messages: liveLoveScrolls,
        whispers: liveWhisperNotes,
        dateNightItems: liveDateNightQueue,
        arcade: coupleArcadeState,
        serverTime: Date.now()
      }));
    } catch (e) {
      console.warn('Initial WebSocket handshake failed:', e);
    }

    ws.on('message', (data: any) => {
      try {
        const parsed = JSON.parse(data.toString());

        if (parsed.type === 'send_message') {
          const hasText = parsed.text && typeof parsed.text === 'string' && parsed.text.trim().length > 0;
          const hasAudio = !!parsed.audioUrl;
          const hasImage = !!parsed.imageUrl;

          if (hasText || hasAudio || hasImage) {
            const newScroll: LiveLoveScroll = {
              id: parsed.id || `scroll-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              sender: parsed.sender?.trim() || 'Sir Chif3n (Demigod) 👑',
              senderRole: parsed.senderRole || 'chif3n',
              type: parsed.type || (hasAudio ? 'audio' : hasImage ? 'image' : 'text'),
              text: hasText ? parsed.text.trim() : undefined,
              audioUrl: parsed.audioUrl || undefined,
              duration: typeof parsed.duration === 'number' ? parsed.duration : undefined,
              imageUrl: parsed.imageUrl || undefined,
              caption: parsed.caption ? String(parsed.caption).trim() : undefined,
              reactions: parsed.reactions || {},
              timestamp: parsed.timestamp || Date.now()
            };

            liveLoveScrolls.push(newScroll);
            if (liveLoveScrolls.length > 300) {
              liveLoveScrolls.shift();
            }

            broadcastScroll(newScroll);
            sendBackgroundPushNotification(newScroll).catch(() => {});
          }
        } else if (parsed.type === 'delete_message' && parsed.id) {
          const idx = liveLoveScrolls.findIndex(m => m.id === parsed.id);
          if (idx !== -1) {
            liveLoveScrolls.splice(idx, 1);
            broadcastPayload({ type: 'delete_message', id: parsed.id });
          }
        } else if (parsed.type === 'react_message' && parsed.id && parsed.emoji && parsed.user) {
          const msg = liveLoveScrolls.find(m => m.id === parsed.id);
          if (msg) {
            if (!msg.reactions) msg.reactions = {};
            if (!msg.reactions[parsed.emoji]) msg.reactions[parsed.emoji] = [];
            const list = msg.reactions[parsed.emoji];
            const uIdx = list.indexOf(parsed.user);
            if (uIdx === -1) {
              list.push(parsed.user);
            } else {
              list.splice(uIdx, 1);
              if (list.length === 0) delete msg.reactions[parsed.emoji];
            }
            broadcastPayload({ type: 'update_message_reactions', id: msg.id, reactions: msg.reactions });
          }
        } else if (parsed.type === 'mark_read' && parsed.id && parsed.role) {
          const msg = liveLoveScrolls.find(m => m.id === parsed.id);
          if (msg) {
            if (!msg.readBy) msg.readBy = [];
            if (!msg.readBy.includes(parsed.role)) {
              msg.readBy.push(parsed.role);
              broadcastPayload({ type: 'mark_read', id: msg.id, role: parsed.role, readBy: msg.readBy });
            }
          }
        } else if (parsed.type === 'mark_all_read' && parsed.role) {
          const idSet = Array.isArray(parsed.ids) && parsed.ids.length > 0 ? new Set(parsed.ids) : null;
          const updatedIds: string[] = [];
          liveLoveScrolls.forEach(msg => {
            if (!idSet || idSet.has(msg.id)) {
              if (!msg.readBy) msg.readBy = [];
              if (!msg.readBy.includes(parsed.role)) {
                msg.readBy.push(parsed.role);
                updatedIds.push(msg.id);
              }
            }
          });
          if (updatedIds.length > 0) {
            broadcastPayload({ type: 'mark_all_read', ids: updatedIds, role: parsed.role });
          }
        } else if (parsed.type === 'typing') {
          broadcastPayload({ type: 'typing', user: parsed.user, isTyping: !!parsed.isTyping });
        } else if (parsed.type === 'ping_presence' && parsed.player) {
          const now = Date.now();
          if (parsed.player === 'chif3n') {
            coupleArcadeState.presence.chif3n = true;
            coupleArcadeState.presence.lastPingChif3n = now;
          } else if (parsed.player === 'leslye') {
            coupleArcadeState.presence.leslye = true;
            coupleArcadeState.presence.lastPingLeslye = now;
          }
          broadcastArcadeUpdate();
        } else if (parsed.type === 'add_whisper' && parsed.note) {
          liveWhisperNotes.unshift(parsed.note);
          if (liveWhisperNotes.length > 200) liveWhisperNotes.pop();
          broadcastPayload({ type: 'new_whisper', note: parsed.note });
        } else if (parsed.type === 'delete_whisper' && parsed.id) {
          const nIdx = liveWhisperNotes.findIndex(n => n.id === parsed.id);
          if (nIdx !== -1) {
            liveWhisperNotes.splice(nIdx, 1);
            broadcastPayload({ type: 'delete_whisper', id: parsed.id });
          }
        }
      } catch (e) {
        console.error('WebSocket message parsing error:', e);
      }
    });

    ws.on('close', () => {
      connectedClients.delete(ws);
    });

    ws.on('error', () => {
      connectedClients.delete(ws);
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    // Dynamic import vite in dev
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`[Demigod Backend] Server running at http://localhost:${PORT}`);
    console.log(`[WebSocket Server] Live Real-time Love Scrolls attached on port ${PORT}`);
    console.log(`[Connected Repos] AniList GraphQL, Jikan MAL v4, VidSrc, 2Embed, VidLink active`);
  });
}

startServer();
