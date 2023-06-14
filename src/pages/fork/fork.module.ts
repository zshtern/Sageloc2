import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {ForkPage} from './fork';
import {ComponentsModule} from "../../components/components.module";
import {FriendshipProvider} from "../../providers/friendship/friendship";

@NgModule({
  declarations: [
    ForkPage,
  ],
  imports: [
    IonicPageModule.forChild(ForkPage),
    ComponentsModule
  ],
  providers: [
    FriendshipProvider
  ]
})
export class ForkPageModule {
}
