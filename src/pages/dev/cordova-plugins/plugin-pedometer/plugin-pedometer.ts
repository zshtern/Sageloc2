import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {IPedometerData, Pedometer} from "@ionic-native/pedometer";

@IonicPage()
@Component({
  selector: 'page-plugin-pedometer',
  templateUrl: 'plugin-pedometer.html',
})
export class PluginPedometerPage {

  public settings = {
    startDate: '2019-06-15T18:00:00.000Z',
    endDate: '2019-06-15T18:30:00.000Z'
  };

  public data: IPedometerData = {
    numberOfSteps: 0,
    distance: 0,
    floorsAscended: 0,
    floorsDescended: 0,
  };

  public isStepCountingAvailable = false;
  public isDistanceAvailable = false;
  public isFloorCountingAvailable = false;
  public isRunning = false;
  public messages: string[] = [];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private pedometer: Pedometer) {

    try {
      // Checks availability
      this.pedometer.isStepCountingAvailable()
        .then((available: boolean) => {
          this.log('isStepCountingAvailable', available);
          this.isStepCountingAvailable = available;
        })
        .catch((error: any) => this.error('isStepCountingAvailable', error));

      // Never available in Android
      this.pedometer.isDistanceAvailable()
        .then((available: boolean) => {
          this.log('isDistanceAvailable', available);
          this.isDistanceAvailable = available;
        })
        .catch((error: any) => this.error('isDistanceAvailable', error));

      // Never available in Android
      this.pedometer.isFloorCountingAvailable()
        .then((available: boolean) => {
          this.log('isFloorCountingAvailable', available);
          this.isFloorCountingAvailable = available;
        })
        .catch((error: any) => this.error('isFloorCountingAvailable', error));
    } catch (e) {
      this.error('constructing', e);
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PluginPedometerPage');
  }

  ionViewDidLeave() {
    this.stopCounting();
  }

  log(...args: any[]) {
    this.messages.unshift((new Date()).toISOString() + ' - ' + args.join(' '));
    console.log(...args);
  }

  error(...args: any[]) {
    this.messages.unshift((new Date()).toISOString() + ' - ' + args.join(' '));
    console.error(...args);
  }

  startCounting() {
    try {
      this.log('starting');
      this.isRunning = true;
      this.pedometer.startPedometerUpdates()
        .subscribe((data: IPedometerData) => {
            this.data.numberOfSteps = data.numberOfSteps;
            this.data.distance = data.distance;
            this.data.floorsAscended = data.floorsAscended;
            this.data.floorsDescended = data.floorsDescended;

            this.log('startPedometerUpdates', JSON.stringify(data));
          },
          (error) => {
            this.error('startPedometerUpdates', error);
          },
          () => {
            this.log('startPedometerUpdates finished');
          });
    } catch (e) {
      this.error('starting', e);
    }
  }

  stopCounting() {
    try {
      this.log('stopping');
      this.pedometer.stopPedometerUpdates()
        .then((data) => {
          this.isRunning = false;
          this.log('stopPedometerUpdates', data);
        })
        .catch((error) => {
          this.error('stopPedometerUpdates', error);
        });
    } catch (e) {
      this.error('stopping', e);
    }
  }

  queryHistoricalData() {
    try {
      let options = {
        "startDate": new Date(this.settings.startDate),
        "endDate": new Date(this.settings.endDate)
      };

      this.pedometer.queryData(options)
        .then((data: IPedometerData) => {
          this.log('queryData', JSON.stringify(data));
        })
        .catch((error) => {
          this.error('queryData', error);
        });
    } catch (e) {
      this.error('startCounting', e);
    }
  }

}
