import { AnimeItem, DemigodScroll, ApothecaryPrescription } from '../types/anime';

export const MAOMAO_STATEMENTS_FOR_LESLYE = [
  "\"Just like Maomao's obsession with rare herbs, my devotion to you is deep, incurable, and my favorite mystery in every realm.\"",
  "\"You are the brilliant Maomao to my Jinshi: impossibly clever, naturally gorgeous, and the only soul in the Imperial Court who holds total power over me.\"",
  "\"If your love were a lethal poison, Lady Leslye, I would gladly drink three flagons without ever asking for an antidote.\"",
  "\"Official Imperial Decree from Sir Chif3n: Let no mortal troubles distress my Queen. Your demigod protector stands guard at your side forever.\"",
  "\"No concubine in the Jade, Crystal, Garnet, or Diamond Pavilions could ever compare to your grace, wit, and beauty.\"",
  "\"Your smile is the purest medicine, curing any heavy heart with a single glance.\"",
  "\"Even in a court full of palace intrigue, my only goal is making sure my girl Leslye is smiling, safe, and snacking happily.\""
];

export const APOTHECARY_PRESCRIPTIONS: ApothecaryPrescription[] = [
  {
    id: 'rx-1',
    remedyName: "Maomao's Incurable Love Tonic",
    ingredient: 'Night-blooming Jasmine, Crushed Jade Pearl, Demigod Devotion',
    symptom: 'Sudden warmth in the chest, heart fluttering whenever thinking of Sir Chif3n',
    statementFromChif3n: 'Leslye, you have completely conquered this demigod. I adore every quirk, smile, and laugh of yours.',
    recommendedAnime: 'The Apothecary Diaries',
    colorTheme: 'from-emerald-900/60 to-teal-950/80 border-emerald-500/40 text-emerald-300'
  },
  {
    id: 'rx-2',
    remedyName: 'Imperial Stress-Relief Brew',
    ingredient: 'Dried Chrysanthemum, Lotus Seeds, Warm Blanket Hugs',
    symptom: 'Long day in the mortal realm, tired shoulders, need for cozy cuddles',
    statementFromChif3n: 'Leave the heavy burdens behind, my Empress. Slip into your coziest clothes and let me pamper you tonight.',
    recommendedAnime: "Frieren: Beyond Journey's End",
    colorTheme: 'from-amber-950/60 to-stone-900/80 border-amber-500/40 text-amber-300'
  },
  {
    id: 'rx-3',
    remedyName: 'The Date Night Cuddle Elixir',
    ingredient: 'Freshly Popped Corn, Chilled Milk Tea, 100% Blanket Entitlement',
    symptom: 'Craving laughter, sweet romance, and cute anime moments side-by-side',
    statementFromChif3n: 'By demigod decree, at least 85% of the blanket and all the sweet treats belong unconditionally to Leslye.',
    recommendedAnime: 'Horimiya',
    colorTheme: 'from-rose-950/60 to-red-950/80 border-rose-500/40 text-rose-300'
  },
  {
    id: 'rx-4',
    remedyName: 'High-Octane Celestial Essence',
    ingredient: 'Shadow Extraction Vials, Astral Lightning, Unstoppable Energy',
    symptom: 'Need for pulse-pounding hype, epic fight animation, and badass heroes',
    statementFromChif3n: 'Watch Jinwoo conquer whole monarch armies—knowing your demigod boyfriend would move heaven and earth for you the same way.',
    recommendedAnime: 'Solo Leveling',
    colorTheme: 'from-indigo-950/60 to-violet-950/80 border-indigo-500/40 text-indigo-300'
  },
  {
    id: 'rx-5',
    remedyName: 'The Golden Laughter Tincture',
    ingredient: 'Ghost Chillies, Alien Gizmos, Pure Chaos & Wit',
    symptom: 'Need for contagious belly laughs and wildly inventive supernatural comedy',
    statementFromChif3n: 'Whenever you giggle, the entire imperial sky lights up. Never stop laughing, my darling.',
    recommendedAnime: 'Dan Da Dan',
    colorTheme: 'from-cyan-950/60 to-emerald-950/80 border-cyan-500/40 text-cyan-300'
  }
];

export const DEMIGOD_SCROLLS: DemigodScroll[] = [
  {
    id: 'scroll-1',
    title: 'The Imperial Apothecary Treaty',
    content: 'To my brilliant apothecary Leslye: Just as Maomao inspects every herb in the rear palace with fierce dedication, I have examined every corner of this universe and confirmed you are the finest treasure in existence.',
    mood: 'romantic',
    dateStr: 'Sealed with the Imperial Jade Seal',
    isFavorite: true,
  },
  {
    id: 'scroll-2',
    title: 'The Poison Tester Vow',
    content: 'If there is ever cold tea, burnt food, or bitter medicine in this life, your demigod boyfriend will gladly taste-test it first so that Lady Leslye receives only the sweetest portions.',
    mood: 'protective',
    dateStr: 'Rear Palace Protocol',
    isFavorite: true,
  },
  {
    id: 'scroll-3',
    title: 'The Jinshi & Maomao Clause',
    content: 'No matter how proud or high-ranking a demigod appears to the rest of the world, in front of you I am just a boy completely enchanted by your emerald eyes and quick wit.',
    mood: 'romantic',
    dateStr: 'Courtyard Whisper',
    isFavorite: true,
  },
  {
    id: 'scroll-4',
    title: 'Imperial Prescription for a Tough Day',
    content: 'Whenever mortal life tests your patience, remember you possess imperial dignity and divine protection. Breathe in the soothing aroma of jasmine, put on our favorite series, and lean on me.',
    mood: 'encouraging',
    dateStr: 'Inner Court Sanctuary',
    isFavorite: false,
  },
  {
    id: 'scroll-5',
    title: 'Unconditional Date Night Accord',
    content: 'Article 1: Leslye picks the anime. Article 2: Sir Chif3n provides warm snacks. Article 3: Cuddling during cliffhangers is mandatory and legally binding in all dimensions.',
    mood: 'date-night',
    dateStr: 'Eternal Consecration',
    isFavorite: true,
  }
];

// Curated list ranked STRICTLY by more recent anime first (2024 -> 2023 -> 2022 -> etc.)
export const CURATED_ANIME: AnimeItem[] = [
  {
    mal_id: 54492,
    title: 'Kusuriya no Hitorigoto',
    title_english: 'The Apothecary Diaries',
    title_japanese: '薬屋のひとりごと',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1708/138033.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1708/138033l.jpg'
      }
    },
    trailer: {
      youtube_id: 'aTfgXp1yv0k',
      embed_url: 'https://www.youtube.com/embed/aTfgXp1yv0k'
    },
    score: 8.91,
    episodes: 24,
    status: 'Finished Airing',
    rating: 'PG-13 - Teens 13 or older',
    synopsis: 'Maomao, a curious apothecary\'s daughter from the pleasure district, is sold into the imperial rear palace. Using her deep knowledge of poisons and medicine, she solves imperial intrigues while captivating the enchanting master of the inner court, Jinshi.',
    year: 2024,
    genres: [{ mal_id: 8, name: 'Drama' }, { mal_id: 7, name: 'Mystery' }, { mal_id: 13, name: 'Historical' }],
    studios: [{ mal_id: 28, name: 'OLM' }, { mal_id: 87, name: 'TOHO animation STUDIO' }],
    chif3nNote: 'Sir Chif3n says: "The centerpiece of our sanctuary! Maomao\'s sharp mind, herbal curiosity, and beauty remind me endlessly of my Leslye."'
  },
  {
    mal_id: 57334,
    title: 'Dandadan',
    title_english: 'Dan Da Dan',
    title_japanese: 'ダンダダン',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1939/144675.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1939/144675l.jpg'
      }
    },
    trailer: {
      youtube_id: 'iI_O_3bZ36Y',
      embed_url: 'https://www.youtube.com/embed/iI_O_3bZ36Y'
    },
    score: 8.52,
    episodes: 12,
    status: 'Finished Airing',
    rating: 'R - 17+',
    synopsis: 'When ghost-believer Momo Ayase and alien-enthusiast Okarun test each other\'s supernatural theories, they awaken wild yokai curses, high-speed battles, and an unexpected tender romance.',
    year: 2024,
    genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 4, name: 'Comedy' }, { mal_id: 37, name: 'Supernatural' }],
    studios: [{ mal_id: 1591, name: 'Science SARU' }],
    chif3nNote: 'Sir Chif3n says: "2024 sensation! Wild animation and super cute dynamic between Momo & Okarun."'
  },
  {
    mal_id: 52299,
    title: 'Ore dake Level Up na Ken',
    title_english: 'Solo Leveling',
    title_japanese: '俺だけレベルアップな件',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1912/140955.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1912/140955l.jpg'
      }
    },
    trailer: {
      youtube_id: '91Adux_Fq_8',
      embed_url: 'https://www.youtube.com/embed/91Adux_Fq_8'
    },
    score: 8.42,
    episodes: 12,
    status: 'Finished Airing',
    rating: 'R - 17+',
    synopsis: 'Known as the Weakest Hunter of All Mankind, Sung Jinwoo undergoes a divine awakening in a perilous double dungeon, granting him the solitary ability to level up without limits.',
    year: 2024,
    genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 10, name: 'Fantasy' }],
    studios: [{ mal_id: 56, name: 'A-1 Pictures' }],
    chif3nNote: 'Sir Chif3n says: "Pure demigod energy. Jinwoo\'s shadow army is cool, but my loyalty is only to Lady Leslye."'
  },
  {
    mal_id: 54970,
    title: 'Wind Breaker',
    title_english: 'Wind Breaker',
    title_japanese: 'ウィンドブレイカー',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1208/141885.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1208/141885l.jpg'
      }
    },
    trailer: {
      youtube_id: 'eG6qD-B912Y',
      embed_url: 'https://www.youtube.com/embed/eG6qD-B912Y'
    },
    score: 8.05,
    episodes: 13,
    status: 'Finished Airing',
    rating: 'PG-13 - Teens 13 or older',
    synopsis: 'Haruka Sakura wants nothing to do with weaklings—he\'s only interested in fighting the strongest. Enrolling at Furin High, he discovers the delinquent students use their strength to defend the town with honor.',
    year: 2024,
    genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 8, name: 'Drama' }],
    studios: [{ mal_id: 1835, name: 'CloverWorks' }],
    chif3nNote: 'Sir Chif3n says: "Clean CloverWorks fight animation with chivalrous protector vibes."'
  },
  {
    mal_id: 54744,
    title: 'Kaijuu 8-gou',
    title_english: 'Kaiju No. 8',
    title_japanese: '怪獣8号',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1487/141443.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1487/141443l.jpg'
      }
    },
    trailer: {
      youtube_id: '7n_mFVPEApw',
      embed_url: 'https://www.youtube.com/embed/7n_mFVPEApw'
    },
    score: 8.24,
    episodes: 12,
    status: 'Finished Airing',
    rating: 'PG-13 - Teens 13 or older',
    synopsis: 'Kafka Hibino, a 32-year-old kaiju clean-up worker, accidentally ingests a small monster and gains the colossal power of a humanoid kaiju, pursuing his childhood promise to join the Defense Force.',
    year: 2024,
    genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 24, name: 'Sci-Fi' }],
    studios: [{ mal_id: 10, name: 'Production I.G' }],
    chif3nNote: 'Sir Chif3n says: "Hilarious and packed with heavy monster-punching hype for our weekend binge."'
  },
  {
    mal_id: 52991,
    title: 'Sousou no Frieren',
    title_english: 'Frieren: Beyond Journey\'s End',
    title_japanese: '葬送のフリーレン',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1015/138006.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg'
      }
    },
    trailer: {
      youtube_id: 'qgQunxD0qMo',
      embed_url: 'https://www.youtube.com/embed/qgQunxD0qMo'
    },
    score: 9.32,
    episodes: 28,
    status: 'Finished Airing',
    rating: 'PG-13 - Teens 13 or older',
    synopsis: 'Elven mage Frieren embarks on a nostalgic pilgrimage to the realm of souls, learning to treasure the fleeting, precious warmth of human connections and mortal love.',
    year: 2023,
    genres: [{ mal_id: 2, name: 'Adventure' }, { mal_id: 10, name: 'Fantasy' }, { mal_id: 8, name: 'Drama' }],
    studios: [{ mal_id: 11, name: 'Madhouse' }],
    chif3nNote: 'Sir Chif3n says: "The highest rated anime of all time. Watching this with you made me cherish every heartbeat."'
  },
  {
    mal_id: 54112,
    title: 'Horimiya: Piece',
    title_english: 'Horimiya: The Missing Pieces',
    title_japanese: 'ホリミヤ -piece-',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1769/136706.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1769/136706l.jpg'
      }
    },
    trailer: {
      youtube_id: 'H7hYm-c8g-U',
      embed_url: 'https://www.youtube.com/embed/H7hYm-c8g-U'
    },
    score: 8.23,
    episodes: 13,
    status: 'Finished Airing',
    rating: 'PG-13 - Teens 13 or older',
    synopsis: 'Beloved slice-of-life chapters adapted with extra warmth, sports festivals, school trips, and tender secret moments between Hori, Miyamura, and their close circle.',
    year: 2023,
    genres: [{ mal_id: 22, name: 'Romance' }, { mal_id: 4, name: 'Comedy' }],
    studios: [{ mal_id: 1835, name: 'CloverWorks' }],
    chif3nNote: 'Sir Chif3n says: "The comfiest couple romance. Always guaranteed to put a sweet smile on Leslye\'s face."'
  },
  {
    mal_id: 51009,
    title: 'Jujutsu Kaisen 2nd Season',
    title_english: 'Jujutsu Kaisen Season 2',
    title_japanese: '呪術廻戦 懐玉・玉折 / 渋谷事変',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1792/138042.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1792/138042l.jpg'
      }
    },
    trailer: {
      youtube_id: 'O6qVieflwqs',
      embed_url: 'https://www.youtube.com/embed/O6qVieflwqs'
    },
    score: 8.78,
    episodes: 23,
    status: 'Finished Airing',
    rating: 'R - 17+',
    synopsis: 'Exploring Gojo and Geto\'s youth during the Hidden Inventory arc before plunging into the cataclysmic, non-stop Shibuya Incident in Halloween Tokyo.',
    year: 2023,
    genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 37, name: 'Supernatural' }],
    studios: [{ mal_id: 569, name: 'MAPPA' }],
    chif3nNote: 'Sir Chif3n says: "MAPPA went all out. Sukuna vs Mahoraga and Gojo\'s domain are breathtaking."'
  },
  {
    mal_id: 52034,
    title: 'Oshi no Ko',
    title_english: '【OSHI NO KO】',
    title_japanese: '【推しの子】',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1812/134736.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1812/134736l.jpg'
      }
    },
    trailer: {
      youtube_id: 'g3bbIXffG70',
      embed_url: 'https://www.youtube.com/embed/g3bbIXffG70'
    },
    score: 8.65,
    episodes: 11,
    status: 'Finished Airing',
    rating: 'PG-13 - Teens 13 or older',
    synopsis: 'A country doctor is reincarnated as the twin son of his favorite pop idol Ai Hoshino, embarking on a suspenseful journey through Japan\'s ruthless entertainment industry.',
    year: 2023,
    genres: [{ mal_id: 8, name: 'Drama' }, { mal_id: 37, name: 'Supernatural' }],
    studios: [{ mal_id: 95, name: 'Doga Kobo' }],
    chif3nNote: 'Sir Chif3n says: "Plot twists at every turn, incredible music, and gorgeous eye art."'
  },
  {
    mal_id: 44511,
    title: 'Chainsaw Man',
    title_english: 'Chainsaw Man',
    title_japanese: 'チェンソーマン',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1806/126216.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1806/126216l.jpg'
      }
    },
    trailer: {
      youtube_id: 'jk7QSGwupPA',
      embed_url: 'https://www.youtube.com/embed/jk7QSGwupPA'
    },
    score: 8.47,
    episodes: 12,
    status: 'Finished Airing',
    rating: 'R - 17+',
    synopsis: 'Denji merges with the Chainsaw Devil Pochita to become Chainsaw Man, joining the Public Safety Devil Hunters under the mysterious and calculating Makima.',
    year: 2022,
    genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 37, name: 'Supernatural' }],
    studios: [{ mal_id: 569, name: 'MAPPA' }],
    chif3nNote: 'Sir Chif3n says: "Cinematic fever dream. Power and Pochita are so iconic."'
  },
  {
    mal_id: 50265,
    title: 'Spy x Family',
    title_english: 'Spy x Family',
    title_japanese: 'SPY×FAMILY',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/1441/122795.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/1441/122795l.jpg'
      }
    },
    trailer: {
      youtube_id: 'ofXigq9aIpo',
      embed_url: 'https://www.youtube.com/embed/ofXigq9aIpo'
    },
    score: 8.50,
    episodes: 25,
    status: 'Finished Airing',
    rating: 'PG-13 - Teens 13 or older',
    synopsis: 'To keep world peace, spy Twilight creates a fabricated family: telepathic daughter Anya and assassin wife Yor, with adorable chaos ensuing at every dinner.',
    year: 2022,
    genres: [{ mal_id: 4, name: 'Comedy' }, { mal_id: 1, name: 'Action' }],
    studios: [{ mal_id: 858, name: 'Wit Studio' }, { mal_id: 1835, name: 'CloverWorks' }],
    chif3nNote: 'Sir Chif3n says: "Anya\'s peanut obsession matches our snack cravings."'
  },
  {
    mal_id: 37999,
    title: 'Kaguya-sama wa Kokurasetai: Tensai-tachi no Renai Zunousen',
    title_english: 'Kaguya-sama: Love is War',
    title_japanese: 'かぐや様は告らせたい～天才たちの恋愛頭脳戦～',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/3/90100.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/3/90100l.jpg'
      }
    },
    trailer: {
      youtube_id: 'rZ8Ua_2L0mQ',
      embed_url: 'https://www.youtube.com/embed/rZ8Ua_2L0mQ'
    },
    score: 8.87,
    episodes: 12,
    status: 'Finished Airing',
    rating: 'PG-13 - Teens 13 or older',
    synopsis: 'Two geniuses at Shuchiin Academy orchestrate mind games to force each other to confess first in a hilarious war of pride, intellect, and secret infatuation.',
    year: 2019,
    genres: [{ mal_id: 4, name: 'Comedy' }, { mal_id: 22, name: 'Romance' }],
    studios: [{ mal_id: 56, name: 'A-1 Pictures' }],
    chif3nNote: 'Sir Chif3n says: "Unlike Kaguya and Shirogane, I have zero pride: I confess my love to Leslye first every single day."'
  }
];
