export interface AnimeImageSet {
  image_url: string;
  small_image_url?: string;
  large_image_url?: string;
}

export interface AnimeImages {
  jpg: AnimeImageSet;
  webp?: AnimeImageSet;
}

export interface AnimeTrailer {
  youtube_id?: string | null;
  url?: string | null;
  embed_url?: string | null;
}

export interface AnimeGenre {
  mal_id: number;
  name: string;
}

export interface AnimeStudio {
  mal_id: number;
  name: string;
}

export interface AnimeItem {
  mal_id: number;
  title: string;
  title_english?: string | null;
  title_japanese?: string | null;
  images: AnimeImages;
  trailer?: AnimeTrailer;
  score?: number | null;
  scored_by?: number | null;
  rank?: number | null;
  popularity?: number | null;
  episodes?: number | null;
  status?: string;
  rating?: string | null;
  synopsis?: string | null;
  year?: number | null;
  genres?: AnimeGenre[];
  studios?: AnimeStudio[];
  chif3nNote?: string; // Special demigod note from Sir Chif3n to Leslye
}

export interface WatchHistoryItem {
  malId: number;
  title: string;
  image: string;
  episode: number;
  totalEpisodes: number | null;
  lastWatchedAt: number;
  server: string;
  notes?: string;
}

export interface DateNightItem {
  malId: number;
  title: string;
  image: string;
  addedAt: number;
  watched: boolean;
  ourRating?: number; // 1 to 5 stars
  coupleComment?: string;
}

export interface DemigodScroll {
  id: string;
  title: string;
  content: string;
  mood: 'romantic' | 'protective' | 'humorous' | 'date-night' | 'encouraging';
  dateStr: string;
  isFavorite?: boolean;
}

export interface ApothecaryPrescription {
  id: string;
  remedyName: string;
  ingredient: string;
  symptom: string;
  statementFromChif3n: string;
  recommendedAnime: string;
  colorTheme: string;
}

export interface DailyWatchActivity {
  day: string;
  fullDate: string;
  episodes: number;
}
