import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PluginDeviceMotionPage } from './plugin-device-motion';
import { DeviceMotion } from '@ionic-native/device-motion';

@NgModule({
  declarations: [
    PluginDeviceMotionPage,
  ],
  imports: [
    IonicPageModule.forChild(PluginDeviceMotionPage),
  ],
  providers: [
    DeviceMotion
  ]
})
export class PluginDeviceMotionModule {}
