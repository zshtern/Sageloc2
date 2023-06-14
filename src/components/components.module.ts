import {NgModule} from '@angular/core';
import {SglTitleLogoComponent} from './sgl-title-logo/sgl-title-logo';
import {IonicModule} from "ionic-angular";
import {LanguageSelectorComponent} from './language-selector/language-selector';
import {TranslateModule} from "@ngx-translate/core";
import {LeafletMapComponent} from './leaflet-map/leaflet-map';
import {LeafletModule} from "@asymmetrik/angular2-leaflet";

@NgModule({
  declarations: [
    SglTitleLogoComponent,
    LanguageSelectorComponent,
    LeafletMapComponent
  ],
  imports: [
    IonicModule,
    TranslateModule.forChild(),
    LeafletModule
  ],
  exports: [
    SglTitleLogoComponent,
    LanguageSelectorComponent,
    LeafletMapComponent
  ]
})
export class ComponentsModule {
}
