import {Injectable, NgZone} from '@angular/core';
import 'rxjs/add/operator/filter';
import {XY} from '../../../core';
import {LatLng} from '@ionic-native/google-maps';
import {Geoposition} from '@ionic-native/geolocation';
import {
    BackgroundGeolocation,
    BackgroundGeolocationConfig,
    BackgroundGeolocationResponse
} from '@ionic-native/background-geolocation';
import {MOCK_POSITION} from '../mock/index';
import {LocationNativeService} from './location-native.service';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {LogService} from '../log/log.service';

declare const cordova;

@Injectable()
export class LocationTracker {
    locationWatcher: Observable<Geoposition>;
    positionSubscription: Subscription;
    public location: Geoposition = MOCK_POSITION;

    constructor(private zone: NgZone,
                private backgroundGeolocation: BackgroundGeolocation,
                private locationService: LocationNativeService,
                private logService: LogService) {
    }

    getLocationLatLng() {
        const {coords: {latitude, longitude}} = this.location;
        return new LatLng(latitude, longitude);

    }

    startTracking(onChange?: Function) {

        let config: BackgroundGeolocationConfig = {
            desiredAccuracy: 0,
            stationaryRadius: 10,
            distanceFilter: 10,
            startOnBoot: false,
            stopOnTerminate: false,
            startForeground: true,
            debug: true,
            pauseLocationUpdates: false,
            saveBatteryOnBackground: false
        };

        // @ts-ignore
        this.backgroundGeolocation.configure(config).subscribe((location: BackgroundGeolocationResponse) => {
            console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);
            this.location = LocationTracker.convertBackgroundGeolocationResponseToGeoposition(location);
            this.zone.run(() => onChange(location));
            console.log('BackgroundGeolocation:  finished');
            this.backgroundGeolocation.finish(); // FOR IOS ONLY
        });

        this.backgroundGeolocation.start();
    }

    static convertBackgroundGeolocationResponseToGeoposition(response: BackgroundGeolocationResponse): Geoposition {
        let coords: Coordinates = {
            latitude: response.latitude,
            longitude: response.longitude,
            accuracy: response.accuracy,
            altitude: response.altitude,
            altitudeAccuracy: 0,
            heading: response.bearing,
            speed: response.speed,
        };
        return {coords: coords, timestamp: response.time};
    }

    stopTracking() {
        this.backgroundGeolocation.stop();
        this.positionSubscription.unsubscribe();
        this.locationWatcher = null;
    }

    getLocation(): Promise<Geoposition> {
        if (this.location) {
            return Promise.resolve(this.location)
        }

        return this.locationService.getCurrentPosition()
            .then((position: Geoposition) => {
                console.log(position);
                return position;
            })
            .then((position: Geoposition) => {
                if ((position as Geoposition).coords) {
                    console.log('Got position:', position);
                    this.location = position;
                    this.watchPosition();
                    return position;
                } else {
                    console.log('Error ' + position['code'] + ': ' + position['message']);
                    throw new Error('Error ' + position['code'] + ': ' + position['message'])
                }

            })
            .catch(e => {
                this.location = MOCK_POSITION;
                console.log('Error ' + e['code'] + ': ' + e['message']);
                throw new Error('Error ' + e['code'] + ': ' + e['message'])
            })
    }

    watchPosition(): Observable<Geoposition> {
        if (this.locationWatcher) {
            return this.locationWatcher;
        }

        this.locationWatcher = this.locationService.watchGeoPosition()
            .filter((p) => p && p.coords !== undefined);

        this.positionSubscription = this.locationWatcher
            .subscribe((position: Geoposition) => this.handleLocationChange(position));

        return this.locationWatcher;

    }

    handleLocationChange(position: Geoposition) {
        this.location = position;
        this.logService.debug(
            'handleLocationChange; t: ' + position.timestamp +
            ', a: ' + position.coords.accuracy +
            ', lat: ' + position.coords.latitude +
            ', lng: ' + position.coords.longitude +
            ', s: ' + position.coords.speed +
            ', h: ' + position.coords.heading +
            ', alt: ' + position.coords.altitude /* not printing alt acc as it always null in current implementation +
             ', aa: ' + position.coords.altitudeAccuracy */
        );
    }

    updateLocation(qk, x, y, z, tileXY: XY) {
        const tx = tileXY.X;
        const ty = tileXY.Y;
        /* TODO: uncomment once server is ready: 
         this.userService
         .sendUserLocation({uid: 'someUserId', qk, x, y, z, tx, ty})
         .subscribe(users => console.log(users))*/
    }

}
