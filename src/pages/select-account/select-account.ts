import {Component} from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams} from 'ionic-angular';
import {TranslateService} from "@ngx-translate/core";
import {AuthProvider, FirebaseUser} from "../../providers/auth/auth";
import {Logger} from "../../providers/log-manager/log-manager";
import {UserProfileProvider} from "../../providers/user-profile/user-profile";
import {UserTypes} from "../../models/user-profile";
import {FriendshipProvider} from "../../providers/friendship/friendship";

const logger = new Logger('SelectAccountPage');

@IonicPage()
@Component({
  selector: 'page-select-account',
  templateUrl: 'select-account.html',
})
export class SelectAccountPage {

  public user: FirebaseUser;

  constructor(private auth: AuthProvider,
              private navCtrl: NavController,
              private navParams: NavParams,
              private alertCtrl: AlertController,
              private friend: FriendshipProvider,
              private translate: TranslateService,
              private profile: UserProfileProvider) {
    this.user = this.auth.currentUser;
    console.log(this.profile);
  }

  ionViewDidLoad() {
    void (this);
    console.log(logger.debug('ionViewDidLoad'));
  }

  // Public
  public selectParentAccount() {
    this.showAgeConfirmation()
      .then((isConfirmed) => {
        if (!isConfirmed) return;

        return this.addChild()
          .then((isSuccess) => {
            if (isSuccess) {
              return this.profile.setType(UserTypes.Parent)
                .then(() => this.navCtrl.push('TabsPage'));
            }
          })
      })
      .catch(reason => console.error(logger.error(reason)));
  }

  public selectChildAccount() {
    this.addParent()
      .then((isSuccess) => {
        if (isSuccess) {
          return this.profile.setType(UserTypes.Child)
            .then(() => this.navCtrl.push('ChildLocationPage'));
        }
      })
      .catch(reason => console.error(logger.error(reason)));
  }

  public logout() {
    this.auth.logout()
      .then(() => this.navCtrl.setRoot('LoginPage'))
      .catch(reason => console.error(logger.error(reason)));
  }

  // Private
  private addParent() {
    return this.friend.addParent();
  }

  private addChild() {
    return this.friend.addChild({skippable: true});
  }

  private showAgeConfirmation() {
    return new Promise((resolve, reject) => {
      let alert = this.alertCtrl.create({
        title: this.translate.instant('alert.confirm-age.title'),
        message: this.translate.instant('alert.confirm-age.message'),
        buttons: [
          {
            text: this.translate.instant('text.no'),
            role: 'cancel',
            handler: () => {
              console.log(logger.debug('No'));
              resolve(false);
            }
          },
          {
            text: this.translate.instant('text.yes'),
            handler: () => {
              console.log(logger.debug('Yes'));
              resolve(true);
            }
          }
        ]
      });

      alert.present().catch(reason => reject(reason));
    });
  }
}
