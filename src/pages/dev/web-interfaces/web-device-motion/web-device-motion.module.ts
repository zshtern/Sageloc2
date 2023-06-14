import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WebDeviceMotionPage } from './web-device-motion';

@NgModule({
  declarations: [
    WebDeviceMotionPage,
  ],
  imports: [
    IonicPageModule.forChild(WebDeviceMotionPage),
  ],
  providers: []
})
export class WebDeviceMotionModule {}
