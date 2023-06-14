import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RoutePlaygroundPage } from './route-playground';
import {Pedometer} from "@ionic-native/pedometer";
import {LeafletModule} from '@asymmetrik/angular2-leaflet';

@NgModule({
  declarations: [
    RoutePlaygroundPage
  ],
  imports: [
    IonicPageModule.forChild(RoutePlaygroundPage),
    LeafletModule
  ],
  providers: [
    Pedometer
  ]
})
export class RoutePlaygroundPageModule {}
