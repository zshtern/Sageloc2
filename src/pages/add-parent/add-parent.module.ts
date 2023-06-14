import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {AddParentPage} from './add-parent';
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  declarations: [
    AddParentPage,
  ],
  imports: [
    IonicPageModule.forChild(AddParentPage),
    TranslateModule.forChild(),
  ],
})
export class AddParentPageModule {
}
