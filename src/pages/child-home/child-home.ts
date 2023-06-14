import { Component } from '@angular/core';
import {App, IonicPage, NavController, NavParams} from 'ionic-angular';
import {UserProfileProvider} from "../../providers/user-profile/user-profile";
import {Logger} from "../../providers/log-manager/log-manager";
import {FriendshipProvider} from "../../providers/friendship/friendship";
import {IUserProfileImpl, UserTypes} from "../../models/user-profile";
import {AuthProvider} from "../../providers/auth/auth";
import {ToastProvider} from "../../providers/toast/toast";

const logger = new Logger('ChildHomePage');

@IonicPage()
@Component({
  selector: 'page-child-home',
  templateUrl: 'child-home.html',
})
export class ChildHomePage {

  private profile: IUserProfileImpl;
  public parents;

  constructor(private app: App,
              public navCtrl: NavController,
              public navParams: NavParams,
              private auth: AuthProvider,
              private friend: FriendshipProvider,
              private toast: ToastProvider,
              private profileManager: UserProfileProvider) {
    this.parents = [];
    this.profile = this.profileManager.currentProfile;
  }

  ionViewDidLoad() {
    if (this.profile) {
      this.parents = this.profile.parents.map(child => child);
    }
    console.log(logger.debug('ionViewDidLoad'));
  }

  openAddParent() {
    this.friend.addParent()
      .catch(reason => console.error(logger.error(reason)));
  }

  logout() {
    if (this.profile.type === UserTypes.Child) {
      alert('[Dev] Child should enter special code to confirm action.');
    }

    this.auth.logout()
      .then(() => this.toast.info('Signed out.'))
      .then(() => this.app.getRootNav().setRoot('LoginPage'))
      .catch(reason => this.toast.error(reason));
  }
}
