import type { CategoryCover, Picture } from '../../types';
import { happyButterfly } from './happy-butterfly';
import { sunflowerVisit } from './sunflower-visit';
import { flowerGarden } from './flower-garden';
import { rainbowDance } from './rainbow-dance';
import { butterflyGarden } from './butterfly-garden';

export const pictures: Picture[] = [happyButterfly, sunflowerVisit, flowerGarden, rainbowDance, butterflyGarden];

export const cover: CategoryCover = {
  pictureId: 'butterfly-happy-wings',
  viewBox: [120, 126, 760, 760],
  hide: ['sky', 'sun', 'cloud', 'hill', 'stem-left', 'flower-left', 'flower-left-mid', 'stem-right', 'flower-right', 'flower-right-mid'],
};
