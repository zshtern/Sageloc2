import { Injectable } from '@angular/core';
import 'rxjs/add/operator/filter';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { MOCK_LOCATIONS } from './mock-locations';


@Injectable()
export class MockLocationService {

    private _geolocation: BehaviorSubject<Geoposition> = null;
    private lastLocation: Geoposition;
    private options: any;
    onDevice: boolean;
    index = 1;
    private intervalId;

    constructor(private geolocation: Geolocation, private platform: Platform) {
        this.onDevice = this.platform.is('cordova');
        if (!this.onDevice) {
            this.lastLocation = this.cloneObject(MOCK_LOCATIONS[0]);
            this.lastLocation.timestamp = new Date().getTime();
            this.lastLocation.coords.altitude = 100;
            this._geolocation = new BehaviorSubject(this.lastLocation);
        } else {
            // I have some problem in iOS due to plugin loading time
            this.lastLocation = this.cloneObject(MOCK_LOCATIONS[0]);
            this.lastLocation.timestamp = new Date().getTime();
            this.lastLocation.coords.altitude = 100;
            this._geolocation = new BehaviorSubject(this.lastLocation);
        }
    }

    // recursive function to clone an object. If a non object parameter
    // is passed in, that parameter is returned and no recursion occurs.
    cloneObject(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        let temp = obj.constructor(); // give temp the original obj's constructor
        for (let key in obj) {
            temp[key] = this.cloneObject(obj[key]);
        }
        return temp;
    }

    watchPosition(options): Observable<Geoposition> {
        this.options = options;
        return this._geolocation
    }

    getCurrentPosition(options): Promise<Geoposition> {
        let location = this.cloneObject(MOCK_LOCATIONS[0]);
        location.timestamp = new Date().getTime();
        location.coords.altitude = 100;
        return Promise.resolve(location);
    }

    sendLocations() {
        if (!this.onDevice && this.options) {
            this.intervalId = setInterval(() => {
                const location = MOCK_LOCATIONS[this.index];
                if (location) {
                    let date = new Date();
                    let currentLocation = this.cloneObject(location);
                    currentLocation.timestamp = date.getTime();
                    currentLocation.coords.altitude = 100;
                    this.lastLocation = currentLocation;
                    this._geolocation.next(currentLocation);
                    if (++this.index == MOCK_LOCATIONS.length) {
                        this.index = 0;
                    }

                } else {
                    this._geolocation.next(this.lastLocation)
                }
            }, this.options.timeout)
        }
    }

    clearLocations() {
        this.index = 0;
        if (this.intervalId) {
            clearTimeout(this.intervalId)
        }
    }
}