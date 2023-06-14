import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectLanguagePage } from './select-language';
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  declarations: [
    SelectLanguagePage,
  ],
  imports: [
    IonicPageModule.forChild(SelectLanguagePage),
    TranslateModule.forChild(),
  ],
})
export class SelectLanguagePageModule {}
