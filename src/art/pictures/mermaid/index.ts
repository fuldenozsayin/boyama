import type { CategoryCover, Picture } from '../../types';
import { clamCastle } from './clam-castle';
import { rockWave } from './rock-wave';
import { seahorseSwim } from './seahorse-swim';
import { treasureFriends } from './treasure-friends';
import { turtleBubbles } from './turtle-bubbles';

/** card colour of the category (used by the preview tool for the cover) */
export const color = '#D3EAFF';

export const pictures: Picture[] = [turtleBubbles, rockWave, seahorseSwim, treasureFriends, clamCastle];

export const cover: CategoryCover = {
  pictureId: 'mermaid-clam-castle',
  viewBox: [250, 214, 568, 568],
};
