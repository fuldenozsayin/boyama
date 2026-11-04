import type { CategoryCover, Picture } from '../../types';
import { princessBallGown } from './ball-gown';
import { princessCastle } from './castle';
import { princessGardenBunny } from './garden-bunny';
import { princessPortrait } from './portrait';
import { princessStarryBalcony } from './starry-balcony';

export const pictures: Picture[] = [
  princessPortrait,
  princessCastle,
  princessBallGown,
  princessGardenBunny,
  princessStarryBalcony,
];

export const cover: CategoryCover = {
  pictureId: 'princess-smiling-portrait',
  viewBox: [180, 126, 640, 640],
  hide: ['sky', 'cloud-left', 'cloud-right'],
};
