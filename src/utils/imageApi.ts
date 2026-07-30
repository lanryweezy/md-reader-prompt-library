export interface PlaceholderImage {
  id: string;
  title: string;
  category: 'technology' | 'nature' | 'workspace' | 'architecture' | 'abstract' | 'business' | 'design';
  unsplashId: string;
  author: string;
  authorUrl: string;
}

export const CURATED_UNSPLASH_IMAGES: PlaceholderImage[] = [
  // Technology
  {
    id: 'tech-1',
    title: 'Developer Setup with Code Editor',
    category: 'technology',
    unsplashId: 'photo-1555066931-4365d14bab8c',
    author: 'Unsplash Tech',
    authorUrl: 'https://unsplash.com',
  },
  {
    id: 'tech-2',
    title: 'Abstract Circuit Board & Microchips',
    category: 'technology',
    unsplashId: 'photo-1518770660439-4636190af475',
    author: 'Alexandre Debiève',
    authorUrl: 'https://unsplash.com',
  },
  {
    id: 'tech-3',
    title: 'Modern Workstation & Dual Monitors',
    category: 'technology',
    unsplashId: 'photo-1517694712202-14dd9538aa97',
    author: 'Clement H',
    authorUrl: 'https://unsplash.com',
  },
  {
    id: 'tech-4',
    title: 'Cyberpunk Neon Code Matrix',
    category: 'technology',
    unsplashId: 'photo-1526374965328-7f61d4dc18c5',
    author: 'Markus Spiske',
    authorUrl: 'https://unsplash.com',
  },
  {
    id: 'tech-5',
    title: 'UI UX Wireframe Design Sketches',
    category: 'technology',
    unsplashId: 'photo-1531403009284-440f080d1e12',
    author: 'Studio Republic',
    authorUrl: 'https://unsplash.com',
  },

  // Nature
  {
    id: 'nature-1',
    title: 'Misty Alpine Mountain Ridge',
    category: 'nature',
    unsplashId: 'photo-1470071459604-3b5ec3a7fe05',
    author: 'Kalen Emsley',
    authorUrl: 'https://unsplash.com',
  },
  {
    id: 'nature-2',
    title: 'Sunbeams in Dense Pine Forest',
    category: 'nature',
    unsplashId: 'photo-1441974231531-c6227db76b6e',
    author: 'Sebastian Unrau',
    authorUrl: 'https://unsplash.com',
  },
  {
    id: 'nature-3',
    title: 'Tropical Ocean Sunset Beach',
    category: 'nature',
    unsplashId: 'photo-1507525428034-b723cf961d3e',
    author: 'Sean Oulashin',
    authorUrl: 'https://unsplash.com',
  },
  {
    id: 'nature-4',
    title: 'Autumn Mountain Valley River',
    category: 'nature',
    unsplashId: 'photo-1472214103451-9374bd1c798e',
    author: 'Luca Bravo',
    authorUrl: 'https://unsplash.com',
  },

  // Workspace
  {
    id: 'work-1',
    title: 'Minimalist Wooden Desk with Notebook & Coffee',
    category: 'workspace',
    unsplashId: 'photo-1499750310107-5fef28a66643',
    author: 'Andrew Neel',
    authorUrl: 'https://unsplash.com',
  },
  {
    id: 'work-2',
    title: 'Sleek Laptop & Succulent Plant',
    category: 'workspace',
    unsplashId: 'photo-1517842645767-c639042777db',
    author: 'Anya Mirek',
    authorUrl: 'https://unsplash.com',
  },
  {
    id: 'work-3',
    title: 'Creative Studio Meeting Space',
    category: 'workspace',
    unsplashId: 'photo-1486312338219-ce68d2c6f44d',
    author: 'Firmbee',
    authorUrl: 'https://unsplash.com',
  },

  // Architecture
  {
    id: 'arch-1',
    title: 'Glass Facade Skyscraper Geometry',
    category: 'architecture',
    unsplashId: 'photo-1486406146926-c627a92ad1ab',
    author: 'Sean Pollock',
    authorUrl: 'https://unsplash.com',
  },
  {
    id: 'arch-2',
    title: 'Modern Interior Architectural Lighting',
    category: 'architecture',
    unsplashId: 'photo-1513694203232-719a280e022f',
    author: 'Spacejoy',
    authorUrl: 'https://unsplash.com',
  },

  // Abstract & Design
  {
    id: 'abstract-1',
    title: '3D Fluid Gradient Waves',
    category: 'abstract',
    unsplashId: 'photo-1618005182384-a83a8bd57fbe',
    author: 'Milad Fakurian',
    authorUrl: 'https://unsplash.com',
  },
  {
    id: 'abstract-2',
    title: 'Vibrant Acrylic Paint Waves',
    category: 'abstract',
    unsplashId: 'photo-1541701494587-cb58502866ab',
    author: 'Lucas Benjamin',
    authorUrl: 'https://unsplash.com',
  },
  {
    id: 'abstract-3',
    title: 'Geometric Holographic Mesh',
    category: 'abstract',
    unsplashId: 'photo-1579783902614-a3fb3927b675',
    author: 'Steve Johnson',
    authorUrl: 'https://unsplash.com',
  },

  // Business
  {
    id: 'biz-1',
    title: 'Financial Charts & Analytics Dashboard',
    category: 'business',
    unsplashId: 'photo-1460925895917-afdab827c52f',
    author: 'Carlos Muza',
    authorUrl: 'https://unsplash.com',
  },
  {
    id: 'biz-2',
    title: 'Strategy Meeting & Sticky Notes',
    category: 'business',
    unsplashId: 'photo-1551836022-d5d88e9218df',
    author: 'You X Ventures',
    authorUrl: 'https://unsplash.com',
  },
];

export interface ImageOptions {
  provider: 'unsplash' | 'picsum';
  category?: string;
  width: number;
  height: number;
  altText: string;
  caption?: string;
  grayscale?: boolean;
  blur?: number;
  format: 'markdown' | 'html' | 'figure';
  specificUnsplashId?: string;
}

export function getUnsplashUrl(
  unsplashId: string,
  width: number = 1200,
  height: number = 675
): string {
  return `https://images.unsplash.com/${unsplashId}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}

export function getPicsumUrl(
  width: number = 800,
  height: number = 500,
  options?: { randomId?: number; grayscale?: boolean; blur?: number }
): string {
  let url = `https://picsum.photos/${width}/${height}`;
  const params: string[] = [];

  if (options?.randomId !== undefined) {
    params.push(`random=${options.randomId}`);
  }
  if (options?.grayscale) {
    params.push('grayscale');
  }
  if (options?.blur && options.blur > 0) {
    params.push(`blur=${Math.min(10, Math.max(1, options.blur))}`);
  }

  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  return url;
}

export function getRandomPlaceholderImage(category?: string): PlaceholderImage {
  let pool = CURATED_UNSPLASH_IMAGES;
  if (category && category !== 'all') {
    pool = CURATED_UNSPLASH_IMAGES.filter((img) => img.category === category);
  }
  if (pool.length === 0) {
    pool = CURATED_UNSPLASH_IMAGES;
  }
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

export function generateImageSnippet(opts: ImageOptions): { url: string; snippet: string } {
  let url = '';

  if (opts.provider === 'unsplash') {
    let imgObj: PlaceholderImage;
    if (opts.specificUnsplashId) {
      imgObj =
        CURATED_UNSPLASH_IMAGES.find((img) => img.unsplashId === opts.specificUnsplashId) ||
        getRandomPlaceholderImage(opts.category);
    } else {
      imgObj = getRandomPlaceholderImage(opts.category);
    }
    url = getUnsplashUrl(imgObj.unsplashId, opts.width, opts.height);
  } else {
    const randomSeed = Math.floor(Math.random() * 1000);
    url = getPicsumUrl(opts.width, opts.height, {
      randomId: randomSeed,
      grayscale: opts.grayscale,
      blur: opts.blur,
    });
  }

  const titleAttr = opts.caption ? ` "${opts.caption}"` : '';

  let snippet = '';
  if (opts.format === 'markdown') {
    snippet = `![${opts.altText || 'Placeholder Image'}](${url}${titleAttr})`;
  } else if (opts.format === 'html') {
    snippet = `<img src="${url}" alt="${opts.altText || 'Placeholder Image'}" width="${opts.width}" height="${opts.height}" style="border-radius: 8px; max-width: 100%; height: auto;" />`;
  } else if (opts.format === 'figure') {
    snippet = `<figure align="center">\n  <img src="${url}" alt="${opts.altText || 'Placeholder Image'}" style="border-radius: 8px; max-width: 100%; shadow: 0 4px 12px rgba(0,0,0,0.1);" />\n${
      opts.caption ? `  <figcaption><em>${opts.caption}</em></figcaption>\n` : ''
    }</figure>`;
  }

  return { url, snippet };
}
