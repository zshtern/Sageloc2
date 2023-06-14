import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-web-device-motion',
  templateUrl: 'web-device-motion.html',
})
export class WebDeviceMotionPage {

  public motion = {
    acceleration: {x: 0, y: 0, z: 0},
    accelerationIncludingGravity: {x: 0, y: 0, z: 0},
    rotationRate: {alpha: 0, beta: 0, gamma: 0},
    interval: 0
  };

  public orientation = {alpha: 0, beta: 0, gamma: 0};

  public isDeviceOrientationAvailable = false;
  public isDeviceMotionAvailable = false;
  public isRunning = false;
  public messages: string[] = [];

  private deviceMotionListener = null;
  private deviceOrientationListener = null;

  constructor(public navCtrl: NavController,
              public navParams: NavParams) {

    try {
      window.addEventListener("compassneedscalibration", function (event) {
        // ask user to wave device in a figure-eight motion.
        alert('Wave device in a figure-eight motion!');
        event.preventDefault();
      }, true);

      // @ts-ignore
      if (window.navigation && window.navigation.permissions) {
        // @ts-ignore
        window.navigation.permissions.query({name: "gyroscope"}) // For DeviceOrientationEvents
          .then((permissionStatus) => {
            this.log("gyroscope", permissionStatus);
          })
          .catch((error) => {
            this.error("gyroscope", error)
          });

        // @ts-ignore
        window.navigation.permissions.request({name: "gyroscope"}) // For DeviceOrientationEvents
          .then((permissionStatus) => {
            this.log("gyroscope", permissionStatus);
          })
          .catch((error) => {
            this.error("gyroscope", error)
          });

        // @ts-ignore
        window.navigation.permissions.query({name: "accelerometer"}) // For DeviceMotionEvents
          .then((permissionStatus) => {
            this.log("accelerometer", permissionStatus);
          })
          .catch((error) => {
            this.error("accelerometer", error)
          });
        // @ts-ignore
        window.navigation.permissions.request({name: "accelerometer"}) // For DeviceMotionEvents
          .then((permissionStatus) => {
            this.log("accelerometer", permissionStatus);
          })
          .catch((error) => {
            this.error("accelerometer", error)
          });
      }

      // @ts-ignore
      if (window.DeviceOrientationEvent) {
        console.log("DeviceOrientation is supported");
        this.isDeviceOrientationAvailable = true;
      }

      // @ts-ignore
      if (window.DeviceMotionEvent) {
        console.log("DeviceMotion is supported");
        this.isDeviceMotionAvailable = true;
      }
    } catch (e) {
      this.error('constructing', e);
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WebDeviceMotionPage');
  }

  ionViewDidLeave() {
    this.stopListening();
  }

  log(...args: any[]) {
    this.messages.unshift((new Date()).toISOString() + ' - ' + args.join(' '));
    console.log(...args);
  }

  error(...args: any[]) {
    this.messages.unshift((new Date()).toISOString() + ' - ' + args.join(' '));
    console.error(...args);
  }

  startListening() {
    try {
      this.log('starting');
      this.isRunning = true;

      this.deviceMotionListener = this.deviceMotionHandler.bind(this);
      this.deviceOrientationListener = this.deviceOrientationHandler.bind(this);
      window.addEventListener("devicemotion", this.deviceMotionListener, false);
      window.addEventListener('deviceorientation', this.deviceOrientationListener, false);
    } catch (e) {
      this.error('starting', e);
    }
  }

  deviceMotionHandler(event) {
    try {
      this.log('device motion', JSON.stringify(event.acceleration));

      // process the event object
      if (event.acceleration) {
        this.motion.acceleration.x = event.acceleration.x;
        this.motion.acceleration.y = event.acceleration.y;
        this.motion.acceleration.z = event.acceleration.z;
      }

      if (event.accelerationIncludingGravity) {
        this.motion.accelerationIncludingGravity.x = event.accelerationIncludingGravity.x;
        this.motion.accelerationIncludingGravity.y = event.accelerationIncludingGravity.y;
        this.motion.accelerationIncludingGravity.z = event.accelerationIncludingGravity.z;
      }

      if (event.rotationRate) {
        this.motion.rotationRate.alpha = event.rotationRate.alpha;
        this.motion.rotationRate.beta = event.rotationRate.beta;
        this.motion.rotationRate.gamma = event.rotationRate.gamma;
      }

      this.motion.interval = event.interval;
    } catch (e) {
      this.error('device motion', e);
    }
  }

  deviceOrientationHandler(event) {
    try {
      this.log('device orientation', JSON.stringify(event));
      this.orientation.alpha = event.alpha;
      this.orientation.beta = event.beta;
      this.orientation.gamma = event.gamma;
    } catch (e) {
      this.error('device orientation', e);
    }
  }

  stopListening() {
    try {
      this.log('stopping');
      this.isRunning = false;

      if (this.deviceMotionListener) {
        window.removeEventListener("devicemotion", this.deviceMotionListener);
        this.deviceMotionListener = null;
      }

      if (this.deviceOrientationListener) {
        window.removeEventListener("deviceorientation", this.deviceOrientationListener);
        this.deviceOrientationListener = null;
      }

    } catch (e) {
      this.error('stopping', e);
    }
  }
}
