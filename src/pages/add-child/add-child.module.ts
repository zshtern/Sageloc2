import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {AddChildPage} from './add-child';
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  declarations: [
    AddChildPage,
  ],
  imports: [
    IonicPageModule.forChild(AddChildPage),
    TranslateModule.forChild(),
  ],
})
export class AddChildPageModule {
}
