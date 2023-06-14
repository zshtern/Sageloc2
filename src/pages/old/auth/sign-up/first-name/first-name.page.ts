import { NavController } from 'ionic-angular';
import { Component, ViewChild } from '@angular/core';
import { AuthService } from '../../../../../common/service/auth.service';
import { SignUpIfc } from '../../../../../common/model/models';
import { Keyboard } from '@ionic-native/keyboard';
import { SignUpLastName } from '../last-name/last-name.page';

@Component({
    templateUrl: 'first-name.html',
    selector: 'sign-up-first-name',
})

export class SignUpFirstName {

    @ViewChild('firstName')
    firstName;

    form: SignUpIfc;

    constructor(private navCtrl: NavController,
                private keyboard: Keyboard,
                private authService: AuthService) {
        this.form = authService.signUpModel;
    }

    ionViewDidEnter() {
        setTimeout(() => {
            this.firstName.setFocus();
            this.keyboard.show();
        }, 0);

    }

    next() {
        console.log(this.authService.signUpModel)
        this.navCtrl.push(SignUpLastName, {}, {animation: 'slide'})
    }
}
