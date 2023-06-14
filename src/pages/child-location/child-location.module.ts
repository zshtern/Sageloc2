import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChildLocationPage } from './child-location';
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  declarations: [
    ChildLocationPage,
  ],
  imports: [
    IonicPageModule.forChild(ChildLocationPage),
    TranslateModule.forChild(),
  ],
})
export class ChildLocationPageModule {}
