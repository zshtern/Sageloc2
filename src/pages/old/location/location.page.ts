import {Component, NgZone} from '@angular/core';
import {LocationTracker} from "../../../common/service";
import {Platform} from 'ionic-angular';
import {Geoposition} from "@ionic-native/geolocation";
import {BackgroundGeolocationResponse} from "@ionic-native/background-geolocation";

@Component({
    selector: 'location-page',
    templateUrl: 'location.page.html',
})

export class LocationPage {

    isDebug: boolean = true;
    public log: any = [];

    constructor(public locationTracker: LocationTracker,
                private platform: Platform,
                private zone: NgZone) {

        this.platform.ready().then(() => {
            console.log('Platform is ready!')
        });
    }

    ionViewDidEnter() {
        if (this.isDebug) console.log('Location Page:', 'Ionic view was entered.');
    }

    startTracking() {
        try {
            this.locationTracker.startTracking(this.onLocationChange.bind(this));
            if (this.isDebug) console.log('Location Page:', 'Start tracking.');
            this.log.push('Start tracking.');
        } catch (e) {
            console.error(e);
            this.log.push(e);
        }
    }

    stopTracking() {
        try {
            this.locationTracker.stopTracking();
            if (this.isDebug) console.log('Location Page:', 'Stop tracking.');
            this.log.push('Stop tracking.');
        } catch (e) {
            console.error(e);
            this.log.push(e);
        }
    }

    onLocationChange(location: BackgroundGeolocationResponse) {
        let message = (new Date()).toTimeString() + ' - ' + location.latitude + ', ' + location.latitude + ' - ' + location.speed;
        console.log(message);
        this.zone.run(() => {
            this.log.push(message);
        });
    }
}
