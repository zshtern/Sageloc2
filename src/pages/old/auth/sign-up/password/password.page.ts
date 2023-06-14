import { LoadingController, NavController } from 'ionic-angular';
import { Component, ViewChild } from '@angular/core';
import { AuthService } from '../../../../../common/service/auth.service';
import { SignUpIfc } from '../../../../../common/model/models';
import { Keyboard } from '@ionic-native/keyboard';
import { StorageService } from '../../../../../common/service/storage/storage.service';
import { MapboxPage } from '../../../mapbox/mapbox.page';

@Component({
    templateUrl: 'password.html',
    selector: 'sign-up-ls-name',
})

export class SignUpPassword {

    @ViewChild('input')
    input;

    form: SignUpIfc;

    constructor(private navCtrl: NavController,
                private loadingCtrl: LoadingController,
                private keyboard: Keyboard,
                private storageService: StorageService,
                private authService: AuthService) {
        this.form = authService.signUpModel;
    }

    ionViewDidEnter() {
        setTimeout(() => {
            this.input.setFocus();
            this.keyboard.show();
        }, 0);

    }

    register() {
        let loading = this.loadingCtrl.create({content: 'Please wait.....'});
        loading.present();

        this.authService.registerUser(this.form)
            .subscribe(userModel => {
                    loading.dismiss();
                    console.log(userModel)
                    this.storageService
                        .storeLocal('user', userModel)
                        .then(data => this.navCtrl.push(MapboxPage))
                },
                err => {
                    console.log(err)
                    loading.dismiss();
                });
    }
}
