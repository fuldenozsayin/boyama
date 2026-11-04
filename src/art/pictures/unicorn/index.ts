import type { CategoryCover, Picture } from '../../types';
import { babyPortrait } from './baby-portrait';
import { birthdayParty } from './birthday-party';
import { moonDream } from './moon-dream';
import { rainbowHill } from './rainbow-hill';
import { skyFlight } from './sky-flight';

/** easiest first: 22 → 28 → 33 → 39 → 41 regions */
export const pictures: Picture[] = [babyPortrait, moonDream, skyFlight, birthdayParty, rainbowHill];

export const cover: CategoryCover = {
  pictureId: 'unicorn-baby-portrait',
  viewBox: [160, 60, 680, 680],
  hide: ['sky', 'star-1', 'star-2', 'heart-1', 'heart-2'],
};
