import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
    selector: 'find-friend',
    templateUrl: './find-friend.html'
})

export class FindFriend {

    email: string;

    constructor(public viewCtrl: ViewController) {
    }

    closeModal() {
        this.viewCtrl.dismiss({});
    }

    onSubmit() {
        if (!this.email) {
            console.log("no valid email")
        } else {
            this.viewCtrl.dismiss({email: this.email});
        }

    }
}
