import {Component} from '@angular/core';
import {IonicPage, ModalController, NavController, NavParams} from 'ionic-angular';

// Declare plugin object
declare var BackgroundGeolocation: any;


@IonicPage()
@Component({
  selector: 'page-plugin-background-geolocation',
  templateUrl: 'plugin-background-geolocation.html',
})
export class PluginBackgroundGeolocationPage {

  prefix = 'BackgroundGeolocation:';

  public settings = {};

  public isAvailable = false;
  public isRunning = false;
  public isEnabled = false;
  public isAuthorized = false;

  public selectedLog = 'sageloc';
  public sagelocLog: string[] = [];
  public pluginLog: string[] = [];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public modalCtrl: ModalController) {

    if (window['BackgroundGeolocation']) {
      this.isAvailable = true;

      this.addListeners();
      this.checkStatus();
      this.getConfig();
    }
  }

  initialize() {
    try {
      this.settings = {
        locationProvider: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
        desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
        stationaryRadius: 50,
        debug: false,
        distanceFilter: 50,
        stopOnTerminate: true,
        startOnBoot: false,
        interval: 10000,
        fastestInterval: 5000,
        activitiesInterval: 10000,
        stopOnStillActivity: true,
        notificationsEnabled: false,
        startForeground: false,
        // notificationTitle: 'Background tracking',
        // notificationText: 'enabled',
        // notificationIconColor: '#4CAF50',
        // notificationIconLarge: '',
        // notificationIconSmall: '',
        activityType: 'OtherNavigation',
        pauseLocationUpdates: false,
        saveBatteryOnBackground: false,
        // url: 'http://192.168.81.15:3000/location',
        // syncUrl: 'http://192.168.81.15:3000/location',
        // syncThreshold: "100",
        // httpHeaders: {
        //   'X-FOO': 'bar'
        // },
        // maxLocations: 10000,
        // // customize post properties
        // postTemplate: {
        //   lat: '@latitude',
        //   lon: '@longitude',
        //   foo: 'bar' // you can also add your own properties
        // }
      };

      this.configure(this.settings);
      this.getStationaryLocation();
      this.getLocations();
      this.getValidLocations();
      this.getLogEntries(50);
      this.getConfig();
      // this.getCurrentLocation({timeout: 20000, maximumAge: 30000, enableHighAccuracy: true});
      this.checkStatus();
      this.startTask();
      this.headlessTask();
      this.forceSync();
    } catch (e) {
      this.error(e);
    }
  }

  ionViewDidLoad() {
    this.log(this.prefix, 'ionViewDidLoad');
  }

  ionViewDidLeave() {
    this.log(this.prefix, 'ionViewDidLeave');
    BackgroundGeolocation.stop();
    BackgroundGeolocation.removeAllListeners();
  }

  log(...args: any[]) {
    this.sagelocLog.unshift((new Date()).toISOString() + ' - ' + args.join(' '));
    console.log(...args);
  }

  error(...args: any[]) {
    this.sagelocLog.unshift((new Date()).toISOString() + ' - ' + args.join(' '));
    console.error(...args
    )
    ;
  }

  onSuccess(name) {
    return (result?) => {
      this.log(this.prefix, name, JSON.stringify(result));
    }
  }

  onFail(name) {
    return (error?) => {
      this.error(this.prefix, name, JSON.stringify(error));
    }
  }

  configure(settings) {
    BackgroundGeolocation.configure(settings, this.onSuccess('configure'), this.onFail('configure'));
  }

  getConfig() {
    BackgroundGeolocation.getConfig((config) => {
      this.log(this.prefix, 'getConfig', config);
      this.settings = config;
    }, this.onFail('getConfig'));
  }

  start() {
    this.log(this.prefix, 'start');
    this.isRunning = true;
    BackgroundGeolocation.start();
    setTimeout(() => {
      this.checkStatus();
    }, 500);
  }

  stop() {
    this.log(this.prefix, 'stop');
    this.isRunning = false;
    BackgroundGeolocation.stop();
    setTimeout(() => {
      this.checkStatus();
    }, 500);
  }

  getCurrentLocation(options) {
    BackgroundGeolocation.getCurrentLocation(this.onSuccess('getCurrentLocation'), this.onFail('getCurrentLocation'), options);
  }

  checkStatus() {
    BackgroundGeolocation.checkStatus((status) => {
      this.isRunning = status.isRunning;
      this.isEnabled = status.locationServicesEnabled;
      this.isAuthorized = status.authorization;
      this.log(this.prefix, 'checkStatus', JSON.stringify(status));
    }, this.onFail('checkStatus'));
  }

  showAppSettings() {
    this.log(this.prefix, 'showAppSettings');
    BackgroundGeolocation.showAppSettings();
  }

  showLocationSettings() {
    this.log(this.prefix, 'showLocationSettings');
    BackgroundGeolocation.showLocationSettings();
  }

  getLocations() {
    BackgroundGeolocation.getLocations(this.onSuccess('getLocations'), this.onFail('getLocations'));
  }

  getValidLocations() {
    BackgroundGeolocation.getValidLocations(this.onSuccess('getValidLocations'), this.onFail('getValidLocations'));
  }

  deleteLocation(locationId) {
    BackgroundGeolocation.deleteLocation(locationId, this.onSuccess('deleteLocation'), this.onFail('deleteLocation'));
  }

  deleteAllLocations() {
    BackgroundGeolocation.deleteAllLocations(this.onSuccess('deleteAllLocations'), this.onFail('deleteAllLocations'));
  }

  switchMode(modeId) {
    this.log(this.prefix, 'switchMode', modeId);
    BackgroundGeolocation.switchMode(modeId, this.onSuccess('switchMode'), this.onFail('switchMode'));
  }

  forceSync() {
    this.log(this.prefix, 'forceSync');
    BackgroundGeolocation.forceSync();
  }

  getLogEntries(limit) {
    BackgroundGeolocation.getLogEntries(limit, null, "INFO", (items) => {
      this.pluginLog = items.map((item) => JSON.stringify(item));
      this.log(this.prefix, 'getLogEntries', items.length);
    }, this.onFail('getLogEntries'));
  }

  getStationaryLocation() {
    BackgroundGeolocation.getStationaryLocation(this.onSuccess('getStationaryLocation'), this.onFail('getStationaryLocation'));
  }


  startTask() {
    BackgroundGeolocation.startTask((taskKey) => {
      this.log(this.prefix, 'startTask', taskKey);
      BackgroundGeolocation.endTask(taskKey);
    });
  }

  headlessTask() {
    BackgroundGeolocation.headlessTask((event) => {
      this.log(this.prefix, 'headlessTask', JSON.stringify(event));
      return 'Processing event: ' + event.name; // will be logged
    });
  }

  addListeners() {
    BackgroundGeolocation.on('location', (location) => {
      this.log(this.prefix, 'on location', JSON.stringify(location));
    });

    BackgroundGeolocation.on('stationary', (location) => {
      this.log(this.prefix, 'on stationary', JSON.stringify(location));
    });

    BackgroundGeolocation.on('activity', (activity) => {
      this.log(this.prefix, 'on activity', JSON.stringify(activity));
    });

    BackgroundGeolocation.on('error', (error) => {
      this.log(this.prefix, 'on error', JSON.stringify(error));
    });

    BackgroundGeolocation.on('start', () => {
      this.log(this.prefix, 'on start');
    });

    BackgroundGeolocation.on('stop', () => {
      this.log(this.prefix, 'on stop');
    });

    BackgroundGeolocation.on('authorization', (status) => {
      this.log(this.prefix, 'on authorization', JSON.stringify(status));
    });

    BackgroundGeolocation.on('background', () => {
      this.log(this.prefix, 'on background');
    });

    BackgroundGeolocation.on('foreground', () => {
      this.log(this.prefix, 'on foreground');
    });

    BackgroundGeolocation.on('abort_requested', () => {
      this.log(this.prefix, 'on abort_requested');
    });

    BackgroundGeolocation.on('http_authorization', () => {
      this.log(this.prefix, 'on http_authorization');
    });
  }

  switchLog() {
    if (this.selectedLog === 'sageloc') {
      this.selectedLog = 'plugin';
      this.log(this.prefix, 'switchLog', this.selectedLog);
      return;
    }

    if (this.selectedLog === 'plugin') {
      this.selectedLog = 'sageloc';
      this.log(this.prefix, 'switchLog', this.selectedLog);
      return;
    }
  }

  setBackground() {
    this.switchMode(BackgroundGeolocation.BACKGROUND_MODE);
  }

  setForeground() {
    this.switchMode(BackgroundGeolocation.FOREGROUND_MODE)
  }

  clearSagelocLog() {
    this.sagelocLog = [];
  }

  presentSettingsModal() {
    let settingsModal = this.modalCtrl.create('PluginBackgroundGeolocationSettingsPage', { settings: this.settings });
    settingsModal.onDidDismiss((data) => {
      console.log(data);
      this.settings = data;
      if (this.isRunning) {
        this.stop();
        this.configure(this.settings);
        this.start();
      }
    });
    settingsModal.present();
  }


  setConfiguration () {
    this.configure(this.settings);
  }
}
