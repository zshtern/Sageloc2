import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectAccountPage } from './select-account';
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  declarations: [
    SelectAccountPage,
  ],
  imports: [
    IonicPageModule.forChild(SelectAccountPage),
    TranslateModule.forChild(),
  ],
})
export class SelectAccountPageModule {}
