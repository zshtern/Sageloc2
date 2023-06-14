import { NavController } from 'ionic-angular';
import { Component, ViewChild } from '@angular/core';
import { AuthService } from '../../../../../common/service/auth.service';
import { SignUpIfc } from '../../../../../common/model/models';
import { Keyboard } from '@ionic-native/keyboard';
import { SignUpPassword } from '../password/password.page';

@Component({
    templateUrl: 'last-name.html',
    selector: 'sign-up-ls-name',
})

export class SignUpLastName {

    @ViewChild('input')
    input;

    form: SignUpIfc;

    constructor(private navCtrl: NavController,
                private keyboard: Keyboard,
                private authService: AuthService) {
        this.form = authService.signUpModel;
    }


    ionViewDidEnter() {
        setTimeout(() => {
            this.input.setFocus();
            this.keyboard.show();
        }, 0);

    }

    next() {
        console.log(this.authService.signUpModel)
        this.navCtrl.push(SignUpPassword, {}, {animation: 'slide'})
    }
}
