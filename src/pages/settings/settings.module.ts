import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {SettingsPage} from './settings';
import {TranslateModule} from '@ngx-translate/core';
import {AppVersion} from '@ionic-native/app-version';

@NgModule({
  declarations: [
    SettingsPage,
  ],
  imports: [
    IonicPageModule.forChild(SettingsPage),
    TranslateModule.forChild(),
  ],
  providers: [
    AppVersion
  ]
})
export class SettingsPageModule {
}
