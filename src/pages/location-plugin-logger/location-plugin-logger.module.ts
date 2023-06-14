import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LocationPluginLoggerPage } from './location-plugin-logger';

@NgModule({
  declarations: [
    LocationPluginLoggerPage,
  ],
  imports: [
    IonicPageModule.forChild(LocationPluginLoggerPage),
  ],
})
export class LocationPluginLoggerPageModule {}
