import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChildHomePage } from './child-home';
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  declarations: [
    ChildHomePage,
  ],
  imports: [
    IonicPageModule.forChild(ChildHomePage),
    TranslateModule.forChild(),
  ],
})
export class ChildHomePageModule {}
