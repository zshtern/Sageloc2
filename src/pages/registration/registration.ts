import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {TranslateService} from "@ngx-translate/core";
import {ToastProvider} from "../../providers/toast/toast";
import {AuthProvider, AuthForm} from "../../providers/auth/auth";
import {UserProfileProvider} from '../../providers/user-profile/user-profile';
import {Logger} from "../../providers/log-manager/log-manager";

const logger = new Logger('RegistrationPage');

@IonicPage()
@Component({
  selector: 'page-registration',
  templateUrl: 'registration.html',
})
export class RegistrationPage {

  public form: AuthForm;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private translate: TranslateService,
              private auth: AuthProvider,
              private profile: UserProfileProvider,
              private toast: ToastProvider) {
    this.form = new this.auth.Form();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegistrationPage', this.navCtrl.name);
  }

  ionViewCanEnter() {
    // User can enter Login Page just if he is unauthorized.
    console.log('ionViewWillEnter RegistrationPage');
    return this.auth.isUnauthorized();
  }

  ionViewWillEnter() {
    void(this);
    console.log('ionViewWillEnter RegistrationPage');

    // this.translate$ = this.translate.get(['error.invalid-email-or-password', 'error.short-password'])
    //   .subscribe((res: string) => {
    //     this.errorMessage = res;
    //   });

    // !!! auth/too-many-requests

    // this.afAuth.auth.languageCode = 'fr';
    //
    // let unsubscribe = this.afAuth.auth.onAuthStateChanged((user) => {
    //   unsubscribe();
    //   if (user) {
    //     // User is signed in.
    //     let displayName = user.displayName;
    //     let email = user.email;
    //     let emailVerified = user.emailVerified;
    //     let photoURL = user.photoURL;
    //     let isAnonymous = user.isAnonymous;
    //     let uid = user.uid;
    //     let providerData = user.providerData;
    //     console.log(user);
    //     console.log(displayName, email, emailVerified, photoURL, isAnonymous, uid, providerData);
    //
    //     if (!emailVerified) {
    //       alert('Email is not verified!');
    //       // user.sendEmailVerification()
    //       //   .then(() => {
    //       //     // Email sent.
    //       //     this.showToast('Verification mail was sent.');
    //       //   })
    //       //   .catch((reason) => {
    //       //     // An error happened.
    //       //     this.toastr.error(reason);
    //       //   });
    //     }
    //
    //     this.afStore.doc<Item>('users/' + user.uid).set({name: 'test'})
    //       .then(() => {
    //         return this.navCtrl.setRoot('TabsPage');
    //       })
    //       .catch(reason => console.error(reason));
    //   } else {
    //     console.log(null);
    //     // No user is signed in.
    //   }
    // });
  }

  ionViewWillLeave() {
    void(this);
    console.log('ionViewWillLeave LoginPage');
  }

  registerWithEmail() {
    let error = this.form.getError();
    if (error) {
      this.toast.error(error);
    } else {
      this.auth.create('firebase', this.form)
        .then(response => {
          return this.profile.createProfile(response.user);
        })
        .then(profile => {
          void(profile);
          this.toast.info('Account is created');
          return this.navCtrl.setRoot('SelectAccountPage');
        })
        .catch(reason => this.toast.error(reason))
    }
  }

  registerWith(provider) {
    this.auth.create(provider)
      .then(response => {
        return this.profile.createProfile(response.user);
      })
      .then(profile => {
        void(profile);
        this.toast.info('Account is created');
        return this.navCtrl.setRoot('SelectAccountPage');
      })
      .catch(reason => this.toast.error(reason));
  }

  openLoginPage() {
    this.navCtrl.setRoot('LoginPage')
      .catch(reason => console.error(reason));
  }

  openDeveloperPage() {
    this.navCtrl.push('DeveloperPage')
      .catch(reason => console.error(logger.error(reason)));
  }
}
