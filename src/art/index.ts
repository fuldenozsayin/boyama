import { CANVAS, type Category, type CategoryId, type Picture } from './types';
import { rect, region } from './dsl';
import * as princess from './pictures/princess';
import * as unicorn from './pictures/unicorn';
import * as pets from './pictures/pets';
import * as fairy from './pictures/fairy';
import * as mermaid from './pictures/mermaid';
import * as butterfly from './pictures/butterfly';

export const CATEGORIES: Category[] = [
  {
    id: 'princess',
    title: 'Prensesler ve Şatolar',
    color: '#FFD3E6',
    accent: '#FF7EB0',
    cover: princess.cover,
    pictures: princess.pictures,
  },
  {
    id: 'unicorn',
    title: 'Unicornlar ve Gökkuşakları',
    color: '#E7DCFF',
    accent: '#9C7BEA',
    cover: unicorn.cover,
    pictures: unicorn.pictures,
  },
  {
    id: 'pets',
    title: 'Kediler, Köpekler ve Tavşanlar',
    color: '#FFF3BF',
    accent: '#F2B92B',
    cover: pets.cover,
    pictures: pets.pictures,
  },
  {
    id: 'fairy',
    title: 'Periler ve Sihirli Ormanlar',
    color: '#CDF5E3',
    accent: '#3FBF8A',
    cover: fairy.cover,
    pictures: fairy.pictures,
  },
  {
    id: 'mermaid',
    title: 'Deniz Kızları ve Deniz Dünyası',
    color: '#D3EAFF',
    accent: '#5DA8F0',
    cover: mermaid.cover,
    pictures: mermaid.pictures,
  },
  {
    id: 'butterfly',
    title: 'Kelebekler ve Çiçekler',
    color: '#FFE2D1',
    accent: '#FF9468',
    cover: butterfly.cover,
    pictures: butterfly.pictures,
  },
];

/** Blank page for free drawing: a single paper region covering the canvas. */
export const FREE_PICTURE: Picture = {
  id: 'free',
  category: 'free',
  title: 'Serbest Çizim',
  items: [region('paper', rect(0, 0, CANVAS, CANVAS), { outline: false, hint: '#FFFFFF' })],
  celebrate: { sound: 'chime', particles: 'rainbow' },
};

const byId = new Map<string, Picture>();
for (const c of CATEGORIES) for (const p of c.pictures) byId.set(p.id, p);

export const ALL_PICTURES: Picture[] = CATEGORIES.flatMap((c) => c.pictures);

export function isFreeId(id: string) {
  return id === 'free' || id.startsWith('free-');
}

export function getPicture(id: string): Picture | undefined {
  if (isFreeId(id)) return FREE_PICTURE;
  return byId.get(id);
}

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === (id as CategoryId));
}

/** next picture in the same category (wraps around), for "play next" */
export function nextPicture(id: string): Picture | undefined {
  const p = byId.get(id);
  if (!p) return undefined;
  const cat = getCategory(p.category);
  if (!cat) return undefined;
  const i = cat.pictures.findIndex((x) => x.id === id);
  return cat.pictures[(i + 1) % cat.pictures.length];
}
