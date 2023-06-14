import {Component} from '@angular/core';
import {App, IonicPage, ModalController, NavController, NavParams, Platform} from 'ionic-angular';
import {AppVersion} from '@ionic-native/app-version';
import * as appConfig from '../../app/app.config'
import {LanguageProvider} from "../../providers/language/language";
import {ToastProvider} from "../../providers/toast/toast";
import {AuthProvider, FirebaseUser} from '../../providers/auth/auth';
import {UserProfileProvider} from "../../providers/user-profile/user-profile";
import {Subscription} from "rxjs";
import {IUserProfileImpl, UserTypes} from "../../models/user-profile";
import {Logger, LogManagerProvider} from "../../providers/log-manager/log-manager";

const logger = new Logger('SettingsPage');

@IonicPage({
  segment: 'settings-tab'
})
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  public user: FirebaseUser;
  public userProfile: IUserProfileImpl;
  public accountTypes = UserTypes;
  public language: string = 'Unknown';
  public platforms: string = 'Unknown';
  public appName: string = 'Unknown';
  public appVersion: string = 'Unknown';
  public clientVersion: string = 'Unknown';
  public serverVersion: string = 'Unknown';

  private profile$: Subscription;

  constructor(private app: App,
              private navCtrl: NavController,
              private navParams: NavParams,
              private modalCtrl: ModalController,
              private plt: Platform,
              private auth: AuthProvider,
              private profile: UserProfileProvider,
              private version: AppVersion,
              private lang: LanguageProvider,
              private toast: ToastProvider,
              private log: LogManagerProvider) {

    this.user = this.auth.currentUser;
    this.profile$ = this.profile.getUserProfile(this.user)
      .subscribe({
        next: profile => {
          console.log(logger.debug('User profile:', profile));
          this.userProfile = profile;
        },
        error: error => {
          console.error(logger.error(error));
        },
        complete: () => {
          console.log(logger.debug('Profile subscription completed.'));
        }
      });
    this.language = this.lang.currentLanguage().name;
    this.platforms = this.plt.platforms().join(', ');
    this.clientVersion = appConfig.sglVersion;

    if (this.plt.is('cordova')) {
      let promises = [
        this.version.getAppName(),
        this.version.getPackageName(),
        this.version.getVersionCode(),
        this.version.getVersionNumber()
      ];

      Promise.all(promises)
        .then((result) => {
          this.appName = result[0] + ' (' + result[1] + ')';
          this.appVersion = result[3] + ' (' + result[2] + ')';
        })
        .catch(reason => {
          console.error(logger.error(reason));
        });
    } else {
      this.appName = 'Sageloc (web)';
      this.appVersion = this.clientVersion;
    }
  }

  ionViewDidLoad() {
    void (this);
    console.log(logger.debug('ionViewDidLoad'));
  }

  ionViewWillEnter() {
    void (this);
    console.log(logger.debug('ionViewWillEnter'));
  }

  ionViewWillLeave() {
    void (this);
    console.log(logger.debug('ionViewWillLeave'));
  }

  openLanguageSelector(event) {
    void (event);
    let profileModal = this.modalCtrl.create('SelectLanguagePage');
    profileModal.onDidDismiss(data => {
      void (data);
      this.language = this.lang.currentLanguage().name;
    });
    profileModal.present()
      .catch(reason => console.error(logger.error(reason)));
  }

  updateProfile() {
    this.userProfile.email = this.user.email;
    this.userProfile.name = this.user.displayName;
    this.profile.setUserProfile(this.userProfile)
      .then(() => console.log(logger.debug('User profile updated.')))
      .catch(reason => console.error(logger.error(reason)));
  }

  changePassword() {
    this.auth.changePassword()
      .then(() => this.toast.info('Password was updated.'))
      .catch(reason => this.toast.error(reason));
  }

  deleteAccount() {
    this.auth.deleteAccount()
      .then(() => this.toast.info('Account was deleted.'))
      .then(() => this.app.getRootNav().setRoot('WelcomePage'))
      .catch(reason => this.toast.error(reason));
  }

  unsetAccountType() {
    this.profile.setType(UserTypes.Undefined)
      .then(() => this.toast.info('Account type moved to undefined.'))
      .then(() => this.app.getRootNav().setRoot('SelectAccountPage'))
      .catch(reason => console.error(logger.error(reason)));
  }

  logout() {
    if (this.userProfile.type === UserTypes.Child) {
      alert('[Dev] Child should enter special code to confirm action.');
    }

    this.auth.logout()
      .then(() => this.toast.info('Signed out.'))
      .then(() => this.app.getRootNav().setRoot('LoginPage'))
      .catch(reason => this.toast.error(reason));
  }

  openSupport() {
    this.navCtrl.push('SupportPage')
      .catch(reason => console.error(logger.error(reason)));
  }

  sendFeedback() {
    void (this);
    alert('[Not Implemented] Send feedback mail.');
  }

  rateApp() {
    void (this);
    alert('[Not Implemented] Open App Store or Google Play to give user ability to rate our application.');
  }

  openDeveloperPage() {
    this.navCtrl.push('DeveloperPage')
      .catch(reason => console.error(logger.error(reason)));
  }

  openLog() {
    this.log.show()
      .catch(reason => console.error(logger.error(reason)));
  }
}
