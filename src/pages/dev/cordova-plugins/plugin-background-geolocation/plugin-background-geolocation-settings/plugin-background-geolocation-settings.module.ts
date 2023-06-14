import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PluginBackgroundGeolocationSettingsPage } from './plugin-background-geolocation-settings';

@NgModule({
  declarations: [
    PluginBackgroundGeolocationSettingsPage,
  ],
  imports: [
    IonicPageModule.forChild(PluginBackgroundGeolocationSettingsPage),
  ],
})
export class PluginBackgroundGeolocationSettingsPageModule {}
