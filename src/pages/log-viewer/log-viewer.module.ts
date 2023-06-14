import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LogViewerPage } from './log-viewer';

@NgModule({
  declarations: [
    LogViewerPage,
  ],
  imports: [
    IonicPageModule.forChild(LogViewerPage),
  ],
})
export class LogViewerPageModule {}
