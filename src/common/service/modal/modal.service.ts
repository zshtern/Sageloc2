import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';

@Injectable()
export class ModalService {

    constructor(private alertCtrl: AlertController) {
    }

    create() {
        return new ConfirmContainer(this.alertCtrl);
    }
}


class ConfirmContainer {
    title;
    message;
    approveCallback = null;
    denyCallback = null;
    private alertCtrl;

    constructor(alertCtrl) {
        this.alertCtrl = alertCtrl;

    }

    setTitle(title) {
        this.title = title;
        return this;

    }

    setMessage(message) {
        this.message = message;
        return this;

    }

    setApproveCallback(approveCallback) {
        this.approveCallback = approveCallback;
        return this;

    }

    setDenyCallback(denyCallback) {
        this.denyCallback = denyCallback;
        return this;

    }

    show() {
        let confirm = this.alertCtrl.create({
            title: this.title,
            message: this.message,
            buttons: [
                {
                    text: 'Disagree',
                    handler: () => {
                        // let navTransition = confirm.dismiss();
                        if (this.denyCallback) {
                            this.denyCallback();
                        }
                        return false;
                    }
                },
                {
                    text: 'Agree',
                    handler: () => {
                        confirm.dismiss();
                        // let navTransition = confirm.dismiss();
                        if (this.approveCallback) {
                            this.approveCallback();
                        }
                        return false;
                    }
                }
            ]
        });

        confirm.present();
        return confirm;
    }


}