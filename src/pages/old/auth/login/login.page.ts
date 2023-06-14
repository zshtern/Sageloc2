import {Component} from '@angular/core';
import {NavController, Platform} from 'ionic-angular';
import {SignUpEmailPage} from '../sign-up/email/email.page';
import {StorageService} from '../../../../common/service';
import {AuthService} from '../../../../common/service';
import {MapboxPage} from '../../mapbox/mapbox.page';
import {DevPage} from "../../../dev/dev";

@Component({
  selector: 'login-page',
  templateUrl: 'login.html',
})

export class LoginPage {

  private form = {email: '', password: ''};
  private error;
  public isDevMode = true;

  constructor(private navController: NavController,
              public platform: Platform,
              public authService: AuthService,
              public storageService: StorageService) {
    // this.storageService.getLocal('user')
    //   .then(user => this.rootPage = user ? MapboxPage : LoginPage);
  }

  openForgotPasswordPage(): void {
    alert('Not implemented');
  }

  openSignUpPage(): void {
    this.navController.push(SignUpEmailPage);
  }
  openDevPage() {
    this.navController.push(DevPage);
  }

  login() {
    const {email, password} = this.form;
    this.authService
      .loginAF(email, password)
      .subscribe(
        user => {
          if (user) {
            this.storageService
              .storeLocal('user', user)
              .then(data => this.navController.push(MapboxPage));
          } else {
            this.error = 'Error: User not found!';
            console.log("login error!!!!");
          }

        },
        err => {
          this.error = err;
          console.log(err);
        });

  }

  loginUserWithFacebook() {
    alert('Not implemented');
  }

  loginUserWithGoogle() {
    alert('Not implemented');
  }
}
