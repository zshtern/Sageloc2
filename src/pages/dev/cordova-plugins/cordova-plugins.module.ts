import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CordovaPluginsPage } from './cordova-plugins';

@NgModule({
  declarations: [
    CordovaPluginsPage,
  ],
  imports: [
    IonicPageModule.forChild(CordovaPluginsPage),
  ],
})
export class PluginsPageModule {}
