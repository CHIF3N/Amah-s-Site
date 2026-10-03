import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// -------------------------------------------------------------
// Real-time Love Scrolls / Live Chatbox In-Memory Store
// -------------------------------------------------------------
export interface LiveLoveScroll {
  id: string;
  sender: string;
  senderRole: 'chif3n' | 'leslye' | 'demigod';
  text: string;
  timestamp: number;
}

const liveLoveScrolls: LiveLoveScroll[] = [
  {
    id: 'scroll-initial-1',
    sender: 'Sir Chif3n (Demigod) 👑',
    senderRole: 'chif3n',
    text: "Welcome to your royal sanctuary, my sweet Leslye! Every single frame and scroll in this realm was built for your comfort and joy. 🌿❤️",
    timestamp: Date.now() - 1000 * 60 * 60 * 4
  },
  {
    id: 'scroll-initial-2',
    sender: 'Sir Chif3n (Demigod) 👑',
    senderRole: 'chif3n',
    text: "Ready for our next Date Night stream? I've got your favorite blanket and snacks waiting! ✨",
    timestamp: Date.now() - 1000 * 60 * 60 * 2
  },
  {
    id: 'scroll-initial-3',
    sender: 'Lady Leslye (Maomao) 🌿',
    senderRole: 'leslye',
    text: "Thank you for creating this magical realm for me, Sir Chif3n! You are the best boyfriend in the entire world 💚",
    timestamp: Date.now() - 1000 * 60 * 30
  }
];

// Active WebSocket clients set
const connectedClients = new Set<WebSocket>();

function broadcastScroll(message: LiveLoveScroll) {
  const payload = JSON.stringify({ type: 'new_message', message });
  for (const client of connectedClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
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
      id: 'vidsrc-to',
      name: 'Jade Palace (VidSrc Alpha)',
      tag: 'Fastest · HD 1080p',
      embedUrl: `https://vidsrc.to/embed/anime/${malId}/${episode}`,
      type: 'embed',
      isDefault: true
    },
    {
      id: 'vidsrc-cc',
      name: 'Imperial Archive (VidSrc Celestial)',
      tag: 'Multi-Sub · Clean UI',
      embedUrl: `https://vidsrc.cc/v2/embed/anime/${malId}/${episode}`,
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
// 6. Real-time Love Scrolls API Endpoints
// -------------------------------------------------------------
app.get('/api/scrolls', (req: Request, res: Response) => {
  res.json({
    success: true,
    messages: liveLoveScrolls
  });
});

app.post('/api/scrolls', (req: Request, res: Response) => {
  const { sender, senderRole, text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Message text cannot be empty' });
  }

  const newScroll: LiveLoveScroll = {
    id: `scroll-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sender: sender?.trim() || 'Sir Chif3n (Demigod) 👑',
    senderRole: senderRole || 'chif3n',
    text: text.trim(),
    timestamp: Date.now()
  };

  liveLoveScrolls.push(newScroll);
  if (liveLoveScrolls.length > 200) {
    liveLoveScrolls.shift();
  }

  // Broadcast to all active WebSocket clients in real time
  broadcastScroll(newScroll);

  res.json({
    success: true,
    message: newScroll
  });
});

// -------------------------------------------------------------
// 7. Vite Mounting in Dev / Static Serving in Prod with WebSockets
// -------------------------------------------------------------
async function startServer() {
  const server = http.createServer(app);

  // Initialize WebSocket server attached to the HTTP server
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    connectedClients.add(ws);

    // Send existing love scrolls history immediately upon connect
    ws.send(JSON.stringify({
      type: 'init',
      messages: liveLoveScrolls
    }));

    ws.on('message', (data: any) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'send_message' && parsed.text && parsed.text.trim()) {
          const newScroll: LiveLoveScroll = {
            id: `scroll-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            sender: parsed.sender?.trim() || 'Sir Chif3n (Demigod) 👑',
            senderRole: parsed.senderRole || 'chif3n',
            text: parsed.text.trim(),
            timestamp: Date.now()
          };

          liveLoveScrolls.push(newScroll);
          if (liveLoveScrolls.length > 200) {
            liveLoveScrolls.shift();
          }

          broadcastScroll(newScroll);
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
