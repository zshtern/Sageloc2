import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
    selector: 'path-name-modal',
    templateUrl: 'path-name.modal.html'
})
export class PathNameModal {

    name: string;

    constructor(public viewCtrl: ViewController) {
    }

    closeModal() {
        this.viewCtrl.dismiss();
    }

    onSubmit() {
        if (!this.name) {
            this.closeModal();
        } else {
            this.viewCtrl.dismiss({name: this.name});
        }

    }
}
