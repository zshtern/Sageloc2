import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WebInterfacesPage } from './web-interfaces';

@NgModule({
  declarations: [
    WebInterfacesPage,
  ],
  imports: [
    IonicPageModule.forChild(WebInterfacesPage),
  ],
})
export class PluginsPageModule {}
