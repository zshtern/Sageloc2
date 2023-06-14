import { LoadingController } from 'ionic-angular';
import { Component } from '@angular/core';

// Providers

@Component({
  templateUrl: 'forgot-password.html',
  selector: 'forgot-password'
})

export class ForgotPasswordPage {
  error: any;
  form: any;

  constructor(private loadingCtrl: LoadingController) {
    this.form = {
      email: ''
    }
  }

  reset() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();

    // this.auth.sendPasswordResetEmail(this.form.email).subscribe(data => {
    //   this.error = 'Soon you will receive an email to change your password.';
    //   loading.dismiss();
    // }, error => {
    //   this.error = error;
    //   loading.dismiss();
    // })
  }
}
