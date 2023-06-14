import { NavController } from 'ionic-angular';
import { Component, ViewChild } from '@angular/core';
import { AuthService } from '../../../../../common/service/auth.service';
import { SignUpIfc } from '../../../../../common/model/models';
import { Keyboard } from '@ionic-native/keyboard';
import { SignUpFirstName } from '../first-name/first-name.page';

@Component({
    templateUrl: 'email.html',
    selector: 'sign-up-email',
})

export class SignUpEmailPage {

    @ViewChild('email')
    private email;

    private form: SignUpIfc;

    constructor(private navCtrl: NavController,
                private keyboard: Keyboard,
                private authService: AuthService) {
        this.form = authService.signUpModel;

    }

    ionViewDidEnter() {
        setTimeout(() => {
            this.email.setFocus();
            this.keyboard.show();
        }, 0);

    }

    next() {
        console.log(this.authService.signUpModel);
        this.navCtrl.push(SignUpFirstName, {}, {animation: 'slide', keyboardClose: false})
    }
}
