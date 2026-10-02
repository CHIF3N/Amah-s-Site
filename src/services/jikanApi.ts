import { AnimeItem } from '../types/anime';
import { CURATED_ANIME } from '../data/curatedData';

const cache = new Map<string, { data: AnimeItem[]; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 15; // 15 mins

export function sortAnimeByRecent(list: AnimeItem[]): AnimeItem[] {
  return [...list].sort((a, b) => {
    const yearA = a.year || (a.status === 'Currently Airing' ? 2025 : 2020);
    const yearB = b.year || (b.status === 'Currently Airing' ? 2025 : 2020);
    if (yearB !== yearA) {
      return yearB - yearA; // Newest year first
    }
    // Secondary tie-breaker by score
    return (b.score || 0) - (a.score || 0);
  });
}

function searchCurated(query: string): AnimeItem[] {
  const q = query.toLowerCase().trim();
  const matched = CURATED_ANIME.filter(item => {
    return (
      item.title.toLowerCase().includes(q) ||
      (item.title_english && item.title_english.toLowerCase().includes(q)) ||
      item.genres?.some(g => g.name.toLowerCase().includes(q)) ||
      (item.synopsis && item.synopsis.toLowerCase().includes(q))
    );
  });
  return sortAnimeByRecent(matched);
}

// 1. Search Anime (Hits our backend first, with multi-repo fallback)
export async function searchAnime(query: string): Promise<AnimeItem[]> {
  const cacheKey = `search_${query.toLowerCase().trim()}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Attempt 1: Call our backend /api/anime/search
  try {
    const res = await fetch(`/api/anime/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        const sorted = sortAnimeByRecent(json.data);
        cache.set(cacheKey, { data: sorted, timestamp: Date.now() });
        return sorted;
      }
    }
  } catch (backendErr) {
    console.warn('Backend search route failed, using direct client fallback:', backendErr);
  }

  // Attempt 2: Direct AniList GraphQL Query
  try {
    const gqlRes = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query ($search: String) {
            Page(page: 1, perPage: 24) {
              media(search: $search, type: ANIME, isAdult: false) {
                id
                idMal
                title { romaji english native }
                coverImage { large extraLarge }
                startDate { year }
                episodes
                status
                averageScore
                genres
                description
              }
            }
          }
        `,
        variables: { search: query }
      })
    });
    if (gqlRes.ok) {
      const gqlJson = await gqlRes.json();
      const media = gqlJson.data?.Page?.media || [];
      if (media.length > 0) {
        const results = media.map((m: any) => ({
          mal_id: m.idMal || m.id,
          title: m.title.romaji || m.title.english,
          title_english: m.title.english || m.title.romaji,
          title_japanese: m.title.native,
          images: {
            jpg: { image_url: m.coverImage.large, large_image_url: m.coverImage.extraLarge || m.coverImage.large }
          },
          score: m.averageScore ? m.averageScore / 10 : null,
          episodes: m.episodes,
          status: m.status === 'RELEASING' ? 'Currently Airing' : 'Finished Airing',
          synopsis: m.description ? m.description.replace(/<[^>]*>?/gm, '') : '',
          year: m.startDate?.year || 2024,
          genres: (m.genres || []).map((name: string, i: number) => ({ mal_id: i, name })),
        }));
        const sorted = sortAnimeByRecent(results);
        cache.set(cacheKey, { data: sorted, timestamp: Date.now() });
        return sorted;
      }
    }
  } catch (gqlErr) {
    console.warn('Direct AniList client search failed:', gqlErr);
  }

  // Attempt 3: Jikan MyAnimeList API Fallback
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=24&sfw=true`);
    if (res.ok) {
      const json = await res.json();
      const results: AnimeItem[] = (json.data || []).map((raw: any) => ({
        mal_id: raw.mal_id,
        title: raw.title,
        title_english: raw.title_english || raw.title,
        title_japanese: raw.title_japanese,
        images: raw.images,
        trailer: raw.trailer,
        score: raw.score,
        scored_by: raw.scored_by,
        rank: raw.rank,
        popularity: raw.popularity,
        episodes: raw.episodes,
        status: raw.status,
        rating: raw.rating,
        synopsis: raw.synopsis,
        year: raw.year || raw.aired?.prop?.from?.year,
        genres: raw.genres || [],
        studios: raw.studios || [],
      }));

      const sorted = sortAnimeByRecent(results);
      cache.set(cacheKey, { data: sorted, timestamp: Date.now() });
      return sorted;
    }
  } catch (err) {
    console.warn('Jikan search error, falling back to curated library:', err);
  }

  return searchCurated(query);
}

// 2. Fetch Recent Releases (Hits our backend first, returns newest anime first)
export async function fetchRecentAnime(): Promise<AnimeItem[]> {
  const cacheKey = 'recent_season_anime';
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Attempt 1: Call our backend /api/anime/recent
  try {
    const res = await fetch('/api/anime/recent');
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        // Merge with curated anime so The Apothecary Diaries is guaranteed front and center
        const mergedMap = new Map<number, AnimeItem>();
        CURATED_ANIME.forEach(item => mergedMap.set(item.mal_id, item));
        json.data.forEach((item: AnimeItem) => {
          if (!mergedMap.has(item.mal_id)) {
            mergedMap.set(item.mal_id, item);
          }
        });
        const sorted = sortAnimeByRecent(Array.from(mergedMap.values()));
        cache.set(cacheKey, { data: sorted, timestamp: Date.now() });
        return sorted;
      }
    }
  } catch (backendErr) {
    console.warn('Backend /api/anime/recent failed, using client fallback:', backendErr);
  }

  // Attempt 2: Jikan Seasons Now
  try {
    const res = await fetch('https://api.jikan.moe/v4/seasons/now?limit=24&sfw=true');
    if (res.ok) {
      const json = await res.json();
      const results: AnimeItem[] = (json.data || []).map((raw: any) => ({
        mal_id: raw.mal_id,
        title: raw.title,
        title_english: raw.title_english || raw.title,
        title_japanese: raw.title_japanese,
        images: raw.images,
        trailer: raw.trailer,
        score: raw.score,
        episodes: raw.episodes,
        status: raw.status,
        rating: raw.rating,
        synopsis: raw.synopsis,
        year: raw.year || raw.aired?.prop?.from?.year || 2024,
        genres: raw.genres || [],
        studios: raw.studios || [],
      }));

      const mergedMap = new Map<number, AnimeItem>();
      CURATED_ANIME.forEach(item => mergedMap.set(item.mal_id, item));
      results.forEach(item => {
        if (!mergedMap.has(item.mal_id)) {
          mergedMap.set(item.mal_id, item);
        }
      });

      const sorted = sortAnimeByRecent(Array.from(mergedMap.values()));
      cache.set(cacheKey, { data: sorted, timestamp: Date.now() });
      return sorted;
    }
  } catch (err) {
    console.warn('Recent anime fetch error, returning curated list:', err);
  }

  return sortAnimeByRecent(CURATED_ANIME);
}

export interface StreamingServer {
  id: string;
  name: string;
  tag: string;
  getUrl: (malId: number, ep: number) => string;
}

export const STREAMING_SERVERS: StreamingServer[] = [
  {
    id: 'vidsrc-to',
    name: 'Jade Palace (VidSrc)',
    tag: 'Fastest · HD',
    getUrl: (malId, ep) => `https://vidsrc.to/embed/anime/${malId}/${ep}`
  },
  {
    id: '2embed',
    name: 'Apothecary Mirror (2Embed)',
    tag: 'Clean · 2Embed.cc',
    getUrl: (malId) => `https://2embed.cc/embed/${malId}`
  },
  {
    id: 'vidsrc-cc',
    name: 'Imperial Archive (VidSrc Celestial)',
    tag: 'Multi-Sub · Celestial',
    getUrl: (malId, ep) => `https://vidsrc.cc/v2/embed/anime/${malId}/${ep}`
  },
  {
    id: 'vidlink',
    name: 'Celestial Nexus (VidLink)',
    tag: 'No-Buffer Alternative',
    getUrl: (malId, ep) => `https://vidlink.pro/anime/${malId}/${ep}`
  },
  {
    id: 'multiembed',
    name: 'Imperial MultiEmbed',
    tag: 'Universal Mirror',
    getUrl: (malId, ep) => `https://multiembed.mov/?video_id=${malId}&s=${ep}`
  }
];

export async function checkBackendHealth() {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // offline or booting
  }
  return null;
}
