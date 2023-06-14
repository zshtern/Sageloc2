import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ViewController, Platform } from 'ionic-angular';
import { PathManager } from '../../../../core/paths/pathManager';


@Component({
    selector: 'user-row',
    templateUrl: 'user-row.html',
})
export class UserRowComponent {

    @Input() user;
    @Output() connect: EventEmitter<any> = new EventEmitter<any>();
    @Output() routeCalc: EventEmitter<any> = new EventEmitter<any>();

    constructor(private platform: Platform, private viewCtrl: ViewController,private pathManager: PathManager) {
    }

    ionViewWillEnter() {
    }

    onConnect() {
        this.connect.emit(this.user);
    }

    createNewPath() {
        // TODO: ask for the path name (school, etc...)
        this.pathManager.StartNewPath("School");
        // TODO: replace "New Path" button by "Add Turn", "Add Danger", Finish Path" and "Cancel Path" buttons
        this.routeCalc.emit(this.user);
    }


}
