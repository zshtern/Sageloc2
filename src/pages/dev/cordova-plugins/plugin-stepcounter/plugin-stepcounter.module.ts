import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PluginStepcounterPage } from './plugin-stepcounter';
import {Stepcounter} from "@ionic-native/stepcounter";

@NgModule({
  declarations: [
    PluginStepcounterPage,
  ],
  imports: [
    IonicPageModule.forChild(PluginStepcounterPage),
  ],
  providers: [
    Stepcounter
  ]
})
export class PluginStepcounterPageModule {}
