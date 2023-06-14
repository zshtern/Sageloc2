import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {PluginBackgroundGeolocationPage} from './plugin-background-geolocation';

@NgModule({
  declarations: [
    PluginBackgroundGeolocationPage
  ],
  imports: [
    IonicPageModule.forChild(PluginBackgroundGeolocationPage),
  ],
  providers: []
})
export class PluginBackgroundGeolocationModule {
}
