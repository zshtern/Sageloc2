import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FriendsPage } from './friends';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [
    FriendsPage,
  ],
  imports: [
    IonicPageModule.forChild(FriendsPage),
    TranslateModule.forChild(),
  ],
})
export class FriendsPageModule {}
