import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MapPage } from './map';
import {TranslateModule} from '@ngx-translate/core';
import {LeafletModule} from "@asymmetrik/angular2-leaflet";
import {ComponentsModule} from "../../components/components.module";

@NgModule({
  declarations: [
    MapPage,
  ],
  imports: [
    IonicPageModule.forChild(MapPage),
    TranslateModule.forChild(),
    LeafletModule,
    ComponentsModule
  ],
})
export class MapPageModule {}
