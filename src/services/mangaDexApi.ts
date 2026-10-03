import { MangaItem, MangaChapter } from '../types/anime';

// Cache for MangaDex searches
const mangaCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 15;

export const CURATED_MANGA: MangaItem[] = [
  {
    id: 'e6a88b14-8025-4b10-91a7-24ef07d722d3', // Kusuriya no Hitorigoto
    title: 'The Apothecary Diaries',
    altTitle: 'Kusuriya no Hitorigoto',
    coverUrl: 'https://uploads.mangadex.org/covers/e6a88b14-8025-4b10-91a7-24ef07d722d3/52b36a18-d77c-4735-86b3-6c8411b089c8.jpg',
    description: 'Maomao, a pharmacist daughter from the red-light district, is kidnapped and sold into the imperial palace. Using her curiosity and extensive apothecary wisdom, she solves royal poison mysteries while catching Jinshi’s watchful eye.',
    status: 'Ongoing',
    year: 2017,
    tags: ['Mystery', 'Historical', 'Drama', 'Romance'],
    chif3nNote: 'Sir Chif3n says: "The holy scripture of our sanctuary! Every page of Maomao’s wit reminds me of Leslye."'
  },
  {
    id: 'b0b721ff-c388-4486-aa0f-c8b0e49e5caa', // Frieren
    title: "Frieren: Beyond Journey's End",
    altTitle: 'Sousou no Frieren',
    coverUrl: 'https://uploads.mangadex.org/covers/b0b721ff-c388-4486-aa0f-c8b0e49e5caa/d2657eef-93f5-416b-a279-d59b20b22a01.jpg',
    description: 'The adventure is over, but life goes on for an elf mage just beginning to learn what living truly means. A breathtaking, emotional journey through time and memory.',
    status: 'Ongoing',
    year: 2020,
    tags: ['Adventure', 'Fantasy', 'Drama'],
    chif3nNote: 'Sir Chif3n says: "A poetic masterpiece. Read curled up together with hot tea."'
  },
  {
    id: 'a77742b1-b30d-4009-80b6-1264c76b92f4', // Horimiya
    title: 'Horimiya',
    altTitle: 'Hori-san to Miyamura-kun',
    coverUrl: 'https://uploads.mangadex.org/covers/a77742b1-b30d-4009-80b6-1264c76b92f4/8d5a6390-b181-42cb-b16a-ff553a6cbe70.jpg',
    description: 'Two seemingly opposite classmates harbor secret sides outside school. When their private worlds collide, a deeply honest and touching high school romance unfolds.',
    status: 'Completed',
    year: 2011,
    tags: ['Romance', 'Comedy', 'Slice of Life'],
    chif3nNote: 'Sir Chif3n says: "Our classic comfort manga. Maximum wholesome vibes for my queen."'
  },
  {
    id: '32d76d19-8a05-4db0-9fc2-e0b0648fe9d0', // Solo Leveling
    title: 'Solo Leveling',
    altTitle: 'Na Honjaman Rebeleop',
    coverUrl: 'https://uploads.mangadex.org/covers/32d76d19-8a05-4db0-9fc2-e0b0648fe9d0/3067eb22-f046-4351-ad09-eb5b01855e97.jpg',
    description: 'From the weakest E-rank hunter to the immortal Monarch of Shadows. Sung Jinwoo unlocks the singular secret to endless growth.',
    status: 'Completed',
    year: 2018,
    tags: ['Action', 'Fantasy', 'Supernatural'],
    chif3nNote: 'Sir Chif3n says: "Full-color god-tier art panels. Badass demigod action at its finest."'
  },
  {
    id: '801513ba-a712-4985-8cdd-c697798816b8', // Dandadan
    title: 'Dandadan',
    altTitle: 'Dan Da Dan',
    coverUrl: 'https://uploads.mangadex.org/covers/801513ba-a712-4985-8cdd-c697798816b8/84227df7-ee19-482a-9ca8-68e7b9f357aa.jpg',
    description: 'Ghosts, aliens, cursed balls, and heart-racing youth! Momo and Okarun team up in one of the most creatively unhinged and stylish manga ever penned.',
    status: 'Ongoing',
    year: 2021,
    tags: ['Action', 'Comedy', 'Supernatural', 'Romance'],
    chif3nNote: 'Sir Chif3n says: "Insane page spreads and hilarious comedy. You will adore Momo!"'
  },
  {
    id: '502f928e-f1a2-4a5f-b570-5807fa5041a7', // Spy x Family
    title: 'Spy x Family',
    altTitle: 'SPY×FAMILY',
    coverUrl: 'https://uploads.mangadex.org/covers/502f928e-f1a2-4a5f-b570-5807fa5041a7/d43be121-82df-424a-ae9c-f9e42125f4fb.jpg',
    description: 'A spy, an assassin, and a telepathic little girl form a counterfeit family to save world peace. Wholesome, comedic, and full of heartfelt action.',
    status: 'Ongoing',
    year: 2019,
    tags: ['Action', 'Comedy', 'Slice of Life'],
    chif3nNote: 'Sir Chif3n says: "Anya expressions will cure any bad day in seconds flat."'
  }
];

// Search Manga via MangaDex API
export async function searchMangaDex(query: string): Promise<MangaItem[]> {
  const cleanQ = query.trim().toLowerCase();
  const cacheKey = `mangadex_search_${cleanQ}`;
  const cached = mangaCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const res = await fetch(`https://api.mangadex.org/manga?title=${encodeURIComponent(query)}&limit=16&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive`);
    if (!res.ok) throw new Error(`MangaDex returned ${res.status}`);
    const json = await res.json();
    const data = json.data || [];

    const results: MangaItem[] = data.map((item: any) => {
      const titleObj = item.attributes?.title || {};
      const title = titleObj.en || Object.values(titleObj)[0] || 'Unknown Manga';
      const descObj = item.attributes?.description || {};
      const description = descObj.en || Object.values(descObj)[0] || 'No synopsis available.';
      
      // Find cover file
      const coverRel = item.relationships?.find((r: any) => r.type === 'cover_art');
      const fileName = coverRel?.attributes?.fileName;
      const coverUrl = fileName 
        ? `https://uploads.mangadex.org/covers/${item.id}/${fileName}.256.jpg`
        : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400';

      const tags = (item.attributes?.tags || []).map((t: any) => t.attributes?.name?.en).filter(Boolean);

      return {
        id: item.id,
        title,
        coverUrl,
        description: description.replace(/\[\/?\w+.*?\]/g, '').slice(0, 300) + '...',
        status: item.attributes?.status || 'Unknown',
        year: item.attributes?.year,
        tags: tags.slice(0, 4)
      };
    });

    mangaCache.set(cacheKey, { data: results, timestamp: Date.now() });
    return results;
  } catch (err) {
    console.warn('MangaDex API search failed, falling back to curated list:', err);
    return CURATED_MANGA.filter(m => m.title.toLowerCase().includes(cleanQ) || (m.altTitle && m.altTitle.toLowerCase().includes(cleanQ)));
  }
}

// Fetch Latest Updates from MangaDex
export async function fetchLatestMangaUpdates(): Promise<MangaItem[]> {
  const cacheKey = 'mangadex_latest_updates';
  const cached = mangaCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const res = await fetch('https://api.mangadex.org/manga?limit=18&order[updatedAt]=desc&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive');
    if (!res.ok) throw new Error(`MangaDex returned ${res.status}`);
    const json = await res.json();
    const data = json.data || [];

    const results: MangaItem[] = data.map((item: any) => {
      const titleObj = item.attributes?.title || {};
      const title = titleObj.en || Object.values(titleObj)[0] || 'Unknown Manga';
      const descObj = item.attributes?.description || {};
      const description = descObj.en || Object.values(descObj)[0] || 'Recently updated on MangaDex.';

      const coverRel = item.relationships?.find((r: any) => r.type === 'cover_art');
      const fileName = coverRel?.attributes?.fileName;
      const coverUrl = fileName 
        ? `https://uploads.mangadex.org/covers/${item.id}/${fileName}.256.jpg`
        : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400';

      const tags = (item.attributes?.tags || []).map((t: any) => t.attributes?.name?.en).filter(Boolean);

      return {
        id: item.id,
        title,
        coverUrl,
        description: description.replace(/\[\/?\w+.*?\]/g, '').slice(0, 300) + '...',
        status: item.attributes?.status || 'Ongoing',
        year: item.attributes?.year,
        tags: tags.slice(0, 4)
      };
    });

    if (results.length > 0) {
      mangaCache.set(cacheKey, { data: results, timestamp: Date.now() });
      return results;
    }
    return CURATED_MANGA;
  } catch (err) {
    console.warn('MangaDex latest updates error, using curated:', err);
    return CURATED_MANGA;
  }
}

// Fetch Chapters for a Manga
export async function fetchMangaChapters(mangaId: string): Promise<MangaChapter[]> {
  const cacheKey = `mangadex_chapters_${mangaId}`;
  const cached = mangaCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const res = await fetch(`https://api.mangadex.org/manga/${mangaId}/feed?translatedLanguage[]=en&order[chapter]=asc&limit=96&contentRating[]=safe&contentRating[]=suggestive`);
    if (!res.ok) throw new Error(`MangaDex chapters returned ${res.status}`);
    const json = await res.json();
    const data = json.data || [];

    const chapters: MangaChapter[] = data.map((ch: any) => ({
      id: ch.id,
      chapter: ch.attributes?.chapter || '1',
      title: ch.attributes?.title || `Chapter ${ch.attributes?.chapter || ''}`,
      volume: ch.attributes?.volume,
      publishAt: ch.attributes?.publishAt || '',
      pages: ch.attributes?.pages || 20
    }));

    mangaCache.set(cacheKey, { data: chapters, timestamp: Date.now() });
    return chapters;
  } catch (err) {
    console.warn('MangaDex chapter fetch error:', err);
    // Provide sample chapters so reader opens smoothly
    return [
      { id: 'sample-1', chapter: '1', title: 'Chapter 1: The Imperial Apothecary', publishAt: '2024' },
      { id: 'sample-2', chapter: '2', title: 'Chapter 2: The Concubine’s Curse', publishAt: '2024' },
      { id: 'sample-3', chapter: '3', title: 'Chapter 3: Night at the Jade Pavilion', publishAt: '2024' }
    ];
  }
}

// Fetch Chapter Page Images (At-Home Server)
export async function fetchChapterPages(chapterId: string): Promise<string[]> {
  if (chapterId.startsWith('sample-')) {
    // High quality sample pages
    return [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800'
    ];
  }

  try {
    const res = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);
    if (!res.ok) throw new Error('At-home server error');
    const json = await res.json();
    const baseUrl = json.baseUrl;
    const hash = json.chapter?.hash;
    const dataFiles = json.chapter?.data || [];

    return dataFiles.map((file: string) => `${baseUrl}/data/${hash}/${file}`);
  } catch (err) {
    console.warn('MangaDex page image fetch error:', err);
    return [];
  }
}
