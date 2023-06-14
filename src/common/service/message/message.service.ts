import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SignUpIfc, UserIfc } from '../../model/models';
import { Observable } from 'rxjs';
import { Platform } from 'ionic-angular';

@Injectable()
export class MessageService {
    private onDevice: boolean;

    constructor(private http: HttpClient,
                public platform: Platform) {
        this.onDevice = this.platform.is('cordova');
    }

    notificationReceived(): Observable<any> {
        // if (this.onDevice) {
        //     this.oneSignal.startInit('797ff090-8ae6-4e93-98f7-bd9a06ab9869', '751614806703');
        //     this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.None);
        //     let notification: any = this.oneSignal.handleNotificationReceived();
        //     this.oneSignal.endInit();
        //     return notification;
        // }
        return Observable.of('not on device');
    }

    getIds() {
        // if (this.onDevice) {
        //     return this.oneSignal.getIds();
        // }
        return Promise.resolve({userId: 'userId', pushToken: 'pushToken'});
    }

}
