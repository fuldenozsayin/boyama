import type { CategoryCover, Picture } from '../../types';
import { flowerCrown } from './flower-crown';
import { mushroomHouse } from './mushroom-house';
import { flowerSeat } from './flower-seat';
import { enchantedTree } from './enchanted-tree';
import { moonDance } from './moon-dance';

/** Periler ve sihirli ormanlar – easiest first. */
export const pictures: Picture[] = [flowerCrown, mushroomHouse, flowerSeat, enchantedTree, moonDance];

export const cover: CategoryCover = {
  pictureId: 'fairy-flower-crown',
  viewBox: [125, 145, 750, 750],
  hide: ['sky'],
};
