import { NavController, LoadingController } from 'ionic-angular';
import { Component } from '@angular/core';
import { AuthService } from '../../../../common/service/auth.service';
import { SignUpIfc } from '../../../../common/model/models';

@Component({
    templateUrl: 'sign-up.html',
    selector: 'sign-up',
})

export class SignUpPage {
    error: any;
    form: SignUpIfc = {email: '', password: '', firstName: '', lastName: ''};

    constructor(private navCtrl: NavController,
                private authService: AuthService,
                private loadingCtrl: LoadingController) {

    }

    openLoginPage(): void {
    }

    register() {
        let loading = this.loadingCtrl.create({content: 'Please wait.....'});
        loading.present();

        this.authService.signUp(this.form)
            .subscribe(
                registerData => {
                    console.log(registerData)
                    loading.dismiss();
                },
                registerError => {
                    loading.dismiss();
                    this.error = registerError;
                });
    }
}
