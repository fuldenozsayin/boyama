import type { CategoryCover, Picture } from '../../types';
import { bunnyMeadow } from './bunny-meadow';
import { kittenBasket } from './kitten-basket';
import { kittenYarn } from './kitten-yarn';
import { picnicFriends } from './picnic-friends';
import { puppyGarden } from './puppy-garden';

export const pictures: Picture[] = [kittenYarn, puppyGarden, bunnyMeadow, kittenBasket, picnicFriends];

export const cover: CategoryCover = {
  pictureId: 'pets-kitten-yarn',
  viewBox: [86, 150, 836, 836],
  hide: ['wall', 'floor'],
};
