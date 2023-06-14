import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChildDetailsPage } from './child-details';
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  declarations: [
    ChildDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(ChildDetailsPage),
    TranslateModule.forChild(),
  ],
})
export class ChildDetailsPageModule {}
