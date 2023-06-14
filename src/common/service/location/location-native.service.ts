import { Injectable } from '@angular/core';
import 'rxjs/add/operator/filter';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { MockLocationService } from './mock/mock-location.service';

const options = {
    maximumAge: 1000,
    timeout: 1000,
    enableHighAccuracy: true,
    priority: 100,
    interval: 1000,
    fastInterval: 1000
};

@Injectable()
export class LocationNativeService {

    private isMockLocation = false;
    public location;

    constructor(private geolocation: Geolocation,
                private mockLocationService: MockLocationService,
                private platform: Platform) {
        // this.isMockLocation = !this.platform.is('cordova');
    }

    watchGeoPosition(): Observable<Geoposition> {
        if (this.isMockLocation) {
            return this.mockLocationService.watchPosition({enableHighAccuracy: true, maximumAge: 0, timeout: 1000})
        } else {
            return this.geolocation.watchPosition(options);
            // const cordova = window['cordova'];
            // if (cordova && cordova.plugins.locationServices) {
            //     const {geolocation} = cordova.plugins.locationServices;
            // return new Observable(function (observer) {
            //     let watchId = this.geolocation.watchPosition(
            //         position => observer.next(position),
            //         err => observer.next(err),
            //         options);
            //     return () => geolocation.clearWatch(watchId);
            // });
            // }
        }
    }

    getCurrentPosition(): Promise<any> {
        if (this.isMockLocation) {
            return this.mockLocationService.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 60000,
                maximumAge: 75000
            })
        } else {
            if (this.platform.is('cordova')) {
                try {
                    return this.geolocation.getCurrentPosition(options);
                } catch (e) {
                    console.error(e);
                    return Promise.reject(e);
                }
            } else {
                return Promise.reject(new Error('Cordova is not defined!'))
            }
        }

        // const cordova = window['cordova'];
        // if (cordova && cordova.plugins && cordova.plugins.locationServices) {
        //     return new Promise((resolve, reject) => {
        //         this.platform
        //             .ready()
        //             .then(() => {
        //                 cordova.plugins
        //                     .locationServices
        //                     .geolocation
        //                     .getCurrentPosition(
        //                         position => resolve(position),
        //                         error => {
        //                             console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
        //                             reject(error)
        //                         },
        //                         options)
        //             })
        //     })
        // }
    }
}
