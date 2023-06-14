import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {DeviceMotion, DeviceMotionAccelerationData} from '@ionic-native/device-motion';

@IonicPage()
@Component({
  selector: 'page-plugin-device-motion',
  templateUrl: 'plugin-device-motion.html',
})
export class PluginDeviceMotionPage {

  public settings = {frequency: 5000};

  public data: DeviceMotionAccelerationData = {
    x: 0,
    y: 0,
    z: 0,
    timestamp: 0,
  };

  public subscription = null;
  public isAvailable = false;
  public isRunning = false;
  public messages: string[] = [];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private deviceMotion: DeviceMotion) {

    try {
      this.isAvailable = true;
    } catch (e) {
      this.error('constructing', e);
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PluginPedometerPage');
  }

  ionViewDidLeave() {
    this.stopWatching();
  }

  log(...args: any[]) {
    this.messages.unshift((new Date()).toISOString() + ' - ' + args.join(' '));
    console.log(...args);
  }

  error(...args: any[]) {
    this.messages.unshift((new Date()).toISOString() + ' - ' + args.join(' '));
    console.error(...args);
  }

  setPeriod(value) {
    this.log('setPeriod', value);
    this.settings.frequency = value;
  }

  startWatching() {
    try {
      this.log('starting');
      this.isRunning = true;
      this.subscription = this.deviceMotion.watchAcceleration({frequency: this.settings.frequency})
        .subscribe((data: DeviceMotionAccelerationData) => {
            this.data.x = data.x;
            this.data.y = data.y;
            this.data.z = data.z;

            this.log('watchAcceleration', JSON.stringify(data));
          },
          (error) => {
            this.error('watchAcceleration', error);
          },
          () => {
            this.log('watchAcceleration finished');
          });
    } catch (e) {
      this.error('starting', e);
    }
  }

  stopWatching() {
    try {
      this.log('stopping');
      this.isRunning = false;
      if (this.subscription && this.subscription.unsubscribe) this.subscription.unsubscribe();
    } catch (e) {
      this.error('stopping', e);
    }
  }

  getCurrentAcceleration() {
    try {
      this.log('getting');
      // Get the device current acceleration
      this.deviceMotion.getCurrentAcceleration()
        .then((acceleration: DeviceMotionAccelerationData) => {
          this.log('getCurrentAcceleration', JSON.stringify(acceleration));
        })
        .catch((error: any) => this.error('getCurrentAcceleration', error));
    } catch (e) {
      this.error('getting', e);
    }
  }

}
