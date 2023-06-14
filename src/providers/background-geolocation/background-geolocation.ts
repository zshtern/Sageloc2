import {Injectable} from '@angular/core';
import {Device} from "@ionic-native/device";

import BackgroundGeolocation, {
  Location,
  LocationError,
  State
  // Location,
  // MotionChangeEvent,
  // MotionActivityEvent,
  // GeofenceEvent,
  // Geofence,
  // HttpEvent,
  // ConnectivityChangeEvent, ProviderChangeEvent, HeartbeatEvent, GeofencesChangeEvent, State, LocationError
} from "cordova-background-geolocation-lt";
import {Logger} from "../log-manager/log-manager";
import {AuthProvider} from "../auth/auth";
import {UserProfileProvider} from "../user-profile/user-profile";

const logger = new Logger('BackgroundGeolocationProvider');

@Injectable()
export class BackgroundGeolocationProvider {

  public state: State = null;

  public isInitialized = false;
  public isAvailable = false;
  public isReady = false;
  public isEnable = false;

  constructor(private device: Device,
              private auth: AuthProvider,
              private profile: UserProfileProvider) {
    console.log(logger.debug('Constructed'));
  }

  initialize() {
    this.isInitialized = true;

    if ((window as any).BackgroundGeolocation === undefined) {
      this.isAvailable = false;
      this.isReady = false;
      this.isEnable = false;
      console.error(logger.error('Background Geolocation plugin was not found.'));
      return Promise.resolve();
    }

    this.isAvailable = true;
    let config = this.getConfig();

    BackgroundGeolocation.onLocation(
      (location: Location) => {
        this.onLocation(location);
      },
      (error: LocationError) => {
        console.error(error);
      });

    return BackgroundGeolocation.ready(config)
      .then(state => {
        this.state = state;
        this.isReady = true;
        this.isEnable = state.enabled;

        console.log(logger.debug('Plugin is ready.'));
        console.log(logger.info('Plugin status', state.enabled));
      })
      .catch(error => {
        this.state = null;
        this.isReady = false;
        this.isEnable = false;

        console.error(logger.error('Plugin status', error));
      });
  }

  getConfig() {
    let username = '12470d9e-194f-4b17-878d-f241293cc303';

    return {
      // reset: true,
      debug: false,
      logLevel: BackgroundGeolocation.LOG_LEVEL_ERROR,
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 500, // meters
      stopOnTerminate: false,
      startOnBoot: true,
      stopTimeout: 1, // minutes
      foregroundService: true,
      heartbeatInterval: 60, // seconds
      url: 'http://tracker.transistorsoft.com/locations/' + username,
      params: BackgroundGeolocation.transistorTrackerParams(this.device),
      autoSync: true,
      // params: {
      //   foo: 'bar'
      // }
    };
  }

  onLocation(location: Location) {
    this.profile.updateLocation(location)
      .catch(reason => console.error(reason));
  }
}
