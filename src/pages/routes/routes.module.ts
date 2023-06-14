import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RoutesPage } from './routes';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [
    RoutesPage,
  ],
  imports: [
    IonicPageModule.forChild(RoutesPage),
    TranslateModule.forChild(),
  ],
})
export class RoutesPageModule {}
