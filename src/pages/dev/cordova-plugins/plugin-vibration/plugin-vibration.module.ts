import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PluginVibrationPage } from './plugin-vibration';
import {Vibration} from "@ionic-native/vibration";

@NgModule({
  declarations: [
    PluginVibrationPage,
  ],
  imports: [
    IonicPageModule.forChild(PluginVibrationPage),
  ],
  providers: [
    Vibration
  ]
})
export class PluginVibrationPageModule {}
