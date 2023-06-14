import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PluginPedometerPage } from './plugin-pedometer';
import {Pedometer} from "@ionic-native/pedometer";

@NgModule({
  declarations: [
    PluginPedometerPage,
  ],
  imports: [
    IonicPageModule.forChild(PluginPedometerPage),
  ],
  providers: [
    Pedometer
  ]
})
export class PluginPedometerPageModule {}
