import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, LoadingController} from 'ionic-angular';
import {AngularFireAuth} from '@angular/fire/auth';
import {ToastProvider} from "../../providers/toast/toast";
// import {auth} from 'firebase/app';

@IonicPage()
@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage {

  public isValid: boolean;
  public email: string;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private afAuth: AngularFireAuth,
              private toast: ToastProvider,
              private loadingCtrl: LoadingController) {
    this.isValid = false;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ForgotPasswordPage', this.navCtrl.name);
  }

  sendMail() {
    if (this.email) {
      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });

      loading.present()
        .catch(reason => console.error(reason));

      this.afAuth.auth.sendPasswordResetEmail(this.email)
        .then((result) => {
          console.log(result);
          this.toast.info('Mail was sent.');
          return this.navCtrl.pop();
        })
        .catch((reason) => {
          console.error(reason);
          this.toast.error(reason);
        })
        .finally(() => {
          loading.dismiss()
            .catch(reason => console.error(reason));
        });
    } else {
      this.toast.error('Entry your email.');
    }

  }
}
