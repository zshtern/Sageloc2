import {Component} from '@angular/core';
import {IonicPage, ModalController, NavController, NavParams, Platform} from 'ionic-angular';

import {Device} from '@ionic-native/device';

// Import the SDK in addition to any desired interfaces:
import BackgroundGeolocation, {
  Location,
  MotionChangeEvent,
  MotionActivityEvent,
  GeofenceEvent,
  Geofence,
  HttpEvent,
  ConnectivityChangeEvent, ProviderChangeEvent, HeartbeatEvent, GeofencesChangeEvent, State, LocationError
} from "cordova-background-geolocation-lt";


@IonicPage()
@Component({
  selector: 'page-plugin-background-geolocation-lt',
  templateUrl: 'plugin-background-geolocation-lt.html',
})
export class PluginBackgroundGeolocationLtPage {

  prefix = 'BackgroundGeolocation:';

  public settings = {};

  public isAvailable = false;
  public isRunning = false;
  public isEnabled = false;
  public isAuthorized = false;

  public selectedLog = 'sageloc';
  public sagelocLog: string[] = [];
  public pluginLog: string[] = [];

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private modalCtrl: ModalController,
              private platform: Platform,
              private device: Device) {

    platform.ready().then(this.configureBackgroundGeolocation.bind(this));
  }

  ionViewDidLoad() {
    this.log(this.prefix, 'ionViewDidLoad');
  }

  ionViewDidLeave() {
    this.log(this.prefix, 'ionViewDidLeave');
  }

  log(...args: any[]) {
    this.sagelocLog.unshift((new Date()).toISOString() + ' - ' + args.join(' '));
    setTimeout(() => {
      console.log(...args);
    });
  }

  error(...args: any[]) {
    this.sagelocLog.unshift((new Date()).toISOString() + ' - ' + args.join(' '));
    setTimeout(() => {
      console.error(...args);
    });
  }

  configureBackgroundGeolocation() {
    this.log('[configure background location]');
    if (!window['BackgroundGeolocation']) return;

    this.isAvailable = true;

    this.log('[configure background location]');
    // 1. Listen to events (see the docs a list of all available events)
    BackgroundGeolocation.removeListeners(() => {
      this.log('[remove listeners] success');

      BackgroundGeolocation.onLocation(this.onLocation.bind(this), (error: LocationError) => {
        this.log('[on location] ERROR:', error);
      });
      BackgroundGeolocation.onMotionChange(this.onMotionChange.bind(this));
      BackgroundGeolocation.onHttp(this.onHttp.bind(this));
      BackgroundGeolocation.onActivityChange(this.onActivityChange.bind(this));
      BackgroundGeolocation.onProviderChange(this.onProviderChange.bind(this));
      BackgroundGeolocation.onHeartbeat(this.onHeartbeat.bind(this));
      BackgroundGeolocation.onGeofence(this.onGeofence.bind(this));
      BackgroundGeolocation.onGeofencesChange(this.onGeofencesChange.bind(this));
      BackgroundGeolocation.onSchedule(this.onSchedule.bind(this));
      BackgroundGeolocation.onConnectivityChange(this.onConnectivityChange.bind(this));
      BackgroundGeolocation.onPowerSaveChange(this.onPowerSaveChange.bind(this));
      BackgroundGeolocation.onEnabledChange(this.onEnabledChange.bind(this));
      BackgroundGeolocation.onNotificationAction(this.onNotificationAction.bind(this));
    }, (error) => {
      this.error('[remove listeners] ERROR:', error);
    });

    // 2. Configure the plugin
    let username = '12470d9e-194f-4b17-878d-f241293cc303';
    let config = {
      // reset: true,
      debug: true,
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 10,
      stopOnTerminate: false,
      startOnBoot: true,
      stopTimeout: 1,
      foregroundService: true,
      heartbeatInterval: 60,
      url: 'http://tracker.transistorsoft.com/locations/' + username,
      params: BackgroundGeolocation.transistorTrackerParams(this.device)
      // autoSync: true,
      // params: {
      //   foo: 'bar'
      // }
    };

    this.log('setting config...');

    BackgroundGeolocation.setConfig(config)
      .then((state) => {
        this.log('set config', state);
        // Note:  the SDK persists its own state -- it will auto-start itself after being terminated
        // in the enabled-state when configured with stopOnTerminate: false.
        // - The #onEnabledChange event has fired.
        // - The #onConnectivityChange event has fired.
        // - The #onProviderChange has fired (so you can learn the current state of location-services).

        if (!state.enabled) {
          // 3. Start the plugin.  In practice, you won't actually be starting the plugin in the #ready callback
          // like this.  More likely, you'll respond to some app or UI which event triggers tracking.  "Starting an order"
          // or "beginning a workout", for example.
          this.isRunning = false;
        } else {
          // If configured with stopOnTerminate: false, the plugin has already begun tracking now.
          // - The #onMotionChange location has been requested.  It will be arriving some time in the near future.
          this.isRunning = true;
        }
      })
      .catch((error) => {
        this.error('[set config]', error);
      });

    // Add geo fence
    BackgroundGeolocation.removeGeofences().then(success => {
      console.log('[remove geo fences] all geo fences have been destroyed');

      let home = [31.736716, 35.190539];
      BackgroundGeolocation.addGeofence({
        identifier: "Home",
        radius: 200,
        latitude: home[0],
        longitude: home[1],
        notifyOnEntry: true,
        notifyOnExit: true,
        extras: {
          route_id: 1234
        }
      }).then((success) => {
        console.log('[add geo fence] success');
      }).catch((error) => {
        console.log('[add geo fence] ERROR:', error);
      });
    }, (error: string) => {
      console.log('[ready] ERROR:', error);
    });

    // BackgroundGeolocation.removeListeners();
    // BackgroundGeolocation.stop();
  }


  onLocation(location: Location) {
    this.log('[on location] -', location.coords.latitude, ',', location.coords.longitude);
  }

  onMotionChange(event: MotionChangeEvent) {
    this.log('[on motion change] -', event.isMoving, JSON.stringify(event.location));
  }

  onActivityChange(event: MotionActivityEvent) {
    this.log('[on activity change] -', event.activity, event.confidence);
  }

  onProviderChange(event: ProviderChangeEvent) {
    this.log('[on provider change] -', event);
  }

  onHeartbeat(event: HeartbeatEvent) {
    this.log('[on heartbeat] -', event);
  }

  onGeofence(event: GeofenceEvent) {
    this.log('[on geo fence] -', event);
  }

  onGeofencesChange(event: GeofencesChangeEvent) {
    this.log('[on geo fences change] -', event);
  }

  onSchedule(state: State) {
    if (state.enabled) {
      this.log('[on schedule] - scheduled start tracking');
    } else {
      this.log('[on schedule] - scheduled stop tracking');
    }
  }

  onHttp(event: HttpEvent) {
    this.log('[on http] -', event.success, event.status, event.responseText);
  }

  onConnectivityChange(event: ConnectivityChangeEvent) {
    this.log('[on connectivity change] - connected?', event.connected);
  }

  onPowerSaveChange(isPowerSaveMode) {
    this.log('[on power save change] -', isPowerSaveMode);
  }

  onEnabledChange(enabled: boolean) {
    this.log('[on enabled change] - enabled?', enabled);
    this.isRunning = enabled;
  }

  onNotificationAction(buttonId: string) {
    this.log('[on notification action] -', buttonId);
  }

  presentSettingsModal() {
    let params = {settings: this.settings};
    let settingsModal = this.modalCtrl.create('PluginBackgroundGeolocationSettingsPage', params);
    settingsModal.onDidDismiss((data) => {
      console.log(data);
    });
    settingsModal.present()
      .catch(reason => console.error(reason));
  }

  start() {
    BackgroundGeolocation.start((state) => {
      this.isRunning = true;
      console.log('- Start success: ', state);
    });
  }

  stop() {
    BackgroundGeolocation.stop((state) => {
      this.isRunning = false;
      console.log('- Stop success: ', state);
    });
  }

  sendEmail() {
    BackgroundGeolocation.emailLog('s.panpurin@gmail.com', () => {
      console.log('[email log] success');
    }, (error) => {
      console.warn('[email log] error: ', error);
    });
  }

  getLog() {
    BackgroundGeolocation.getLog((log) => {
      console.log('[log] success: ', log);
    }, (error) => {
      console.warn('[log] error: ', error);
    });
  }

  clearSagelocLog() {
    this.sagelocLog = [];
  }

  resetConfiguration() {
    BackgroundGeolocation.reset();
  }
}
