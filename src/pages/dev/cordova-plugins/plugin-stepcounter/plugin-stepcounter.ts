import {Component, OnDestroy} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {Stepcounter} from "@ionic-native/stepcounter";
import {interval} from 'rxjs/observable/interval';
import {from, Observable} from "rxjs";
import {flatMap} from "rxjs/operators";

/**
 * https://www.npmjs.com/package/cordova-plugin-stepcounter
 */

@IonicPage()
@Component({
  selector: 'page-plugin-stepcounter',
  templateUrl: 'plugin-stepcounter.html',
})
export class PluginStepcounterPage {

  public settings = {period: 5000};
  public stepCount = 0;
  public isSupported = false;
  public isRunning = false;
  private updateSubscription;
  public messages: string[] = [];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private stepcounter: Stepcounter) {

    try {
      this.log('constructing');
      this.stepcounter.deviceCanCountSteps()
        .then(success => {
          this.isSupported = success;
          this.log('deviceCanCountSteps', success)
        })
        .catch(error => {
          this.isSupported = false;
          this.error('deviceCanCountSteps', error)
        });
    } catch (e) {
      this.error('constructing', e);
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PluginStepcounterPage');
  }

  ionViewDidLeave() {
    this.stopUpdates();
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
    this.settings.period = value;
  }

  startCount() {
    try {
      this.log('starting');
      this.stepcounter.start(this.stepCount)
        .then(result => {
          this.isRunning = true;
          this.startUpdates();
          this.log('start', result);
        })
        .catch(error => {
          this.isRunning = false;
          this.error('start', error);
        });
    } catch (e) {
      this.error('starting', e);
    }
  }

  stopCount() {
    try {
      this.log('stopping');
      this.stepcounter.stop()
        .then(onSuccess => {
          this.isRunning = false;
          this.stopUpdates();
          this.log('stop', onSuccess)
        })
        .catch(onFailure => {
          this.isRunning = false;
          this.error('stop', onFailure)
        });
    } catch (e) {
      this.error('stopping', e);
    }
  }

  startUpdates() {
    try {
      this.log('start updating');
      this.updateSubscription = interval(this.settings.period)
        .pipe(flatMap((i) => from(this.stepcounter.getStepCount())))
        .subscribe((val) => {
          this.log('getStepCount', val);
          this.stepCount = val;
        }, (error) => {
          this.error('getStepCount', error);
        });
    } catch (e) {
      this.error('start updating', e);
    }
  }

  stopUpdates() {
    try {
      this.log('stop updating');
      if (this.updateSubscription && this.updateSubscription.unsubscribe) {
        this.updateSubscription.unsubscribe();
      }
    } catch (e) {
      this.error('stop updating', e);
    }
    this.log('stop updating');
    this.updateSubscription.unsubscribe();
  }

  resetStepCount() {
    this.log('resetting');
    this.stopCount();
    this.stepCount = 0;
  }

  getTodayStepCount() {
    try {
      this.log('today steps loading');
      this.stepcounter.getTodayStepCount()
        .then(history => this.log('getTodayStepCount', history))
        .catch(error => this.error('getTodayStepCount', error));
    } catch (e) {
      this.error('today steps loading', e);
    }
  }

  getHistory() {
    try {
    this.log('history loading');
    this.stepcounter.getHistory()
      .then(history => this.log('getHistory', history))
      .catch(error => this.error('getHistory', error));
    } catch (e) {
      this.error('history loading', e);
    }
  }
}
