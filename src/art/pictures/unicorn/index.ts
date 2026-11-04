import type { CategoryCover, Picture } from '../../types';
import { rainbowHill } from './rainbow-hill';

export const pictures: Picture[] = [rainbowHill];

export const cover: CategoryCover = {
  pictureId: 'unicorn-rainbow-hill',
  viewBox: [140, 180, 720, 720],
  hide: [],
};
