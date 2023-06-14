import {HomePage, UserRowComponent} from './old/home';
import {LoginPage} from './old/auth/login/login.page';
import {SIGN_UP_PAGES} from './old/auth/sign-up';
import {ForgotPasswordPage} from './old/auth/forgot-password/forgot-password';
import {DevPage} from './dev/dev';
import {LogPage} from './old/log/log.page';
import {LmapPage} from './old/lmap/lmap.page';
import {MapboxPage} from './old/mapbox/mapbox.page';
import {PathNameModal} from './old/mapbox/components/path/path-name.modal';
import {TagPlaceModal} from './old/mapbox/components/places/tag-place.modal';
import {ConfPopoverPage} from './old/home/popover-page/conf-popover.page';
import {SelectPathPage} from './old/paths/select-path.page';
import {FindFriend} from './old/mapbox/components/find-friend/find-friend';
import {LocationPage} from './old/location/location.page';

export const appPages = [
  LoginPage,
  ForgotPasswordPage,
  HomePage,
  UserRowComponent,
  ...SIGN_UP_PAGES,
  DevPage,
  LogPage,
  LmapPage,
  MapboxPage,
  PathNameModal,
  TagPlaceModal,
  ConfPopoverPage,
  SelectPathPage,
  FindFriend,
  LocationPage,
];
