import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
    selector: 'tag-place-modal',
    templateUrl: 'tag-place.modal.html'
})
export class TagPlaceModal {

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
