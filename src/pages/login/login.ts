import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {TranslateService} from "@ngx-translate/core";
import {ToastProvider} from "../../providers/toast/toast";
import {AuthProvider, AuthForm} from "../../providers/auth/auth";
import {Logger} from "../../providers/log-manager/log-manager";

const logger = new Logger('LoginPage');

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  public form: AuthForm;

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private translate: TranslateService,
              private auth: AuthProvider,
              private toast: ToastProvider,) {

    this.form = new this.auth.Form();
  }

  ionViewDidLoad() {
    void(this);
    console.log('ionViewDidLoad LoginPage');
  }

  ionViewCanEnter() {
    // User can enter Login Page just if he is unauthorized.
    console.log('ionViewCanEnter LoginPage');
    return this.auth.isAuthorized()
      .then(isAuthorized => {
        if (isAuthorized) setTimeout(() => this.navCtrl.setRoot('TabsPage'));
        return !isAuthorized;
      });
  }

  ionViewWillEnter() {
    void(this);
    console.log('ionViewWillEnter LoginPage');
  }

  // noinspection JSUnusedGlobalSymbols
  ionViewWillLeave() {
    void(this);
    console.log('ionViewWillLeave LoginPage');
  }

  loginWithEmail() {
    this.auth.login('firebase', this.form)
      .then((response) => {
        console.log(response);
        return this.navCtrl.setRoot('TabsPage');
      })
      .catch(reason => this.toast.error(reason));
  }

  loginWith(provider) {
    this.auth.login(provider)
      .then((response) => {
        console.log(response);
        return this.navCtrl.setRoot('TabsPage');
      })
      .catch(reason => this.toast.error(reason));
  }

  resetPassword() {
    this.navCtrl.push('ForgotPasswordPage')
      .catch(reason => console.error(reason));
  }

  openRegistrationPage() {
    this.navCtrl.setRoot('RegistrationPage')
      .catch(reason => console.error(reason));
  }

  openDeveloperPage() {
    this.navCtrl.push('DeveloperPage')
      .catch(reason => console.error(logger.error(reason)));
  }
}
