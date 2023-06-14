import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {PluginBackgroundGeolocationLtPage} from './plugin-background-geolocation-lt';

@NgModule({
  declarations: [
    PluginBackgroundGeolocationLtPage
  ],
  imports: [
    IonicPageModule.forChild(PluginBackgroundGeolocationLtPage),
  ],
  providers: []
})
export class PluginBackgroundGeolocationModule {
}
