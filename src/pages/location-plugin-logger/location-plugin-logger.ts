import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import * as moment from "moment";

// Declare plugin object
declare var BackgroundGeolocation: any;

@IonicPage()
@Component({
  selector: 'page-location-plugin-logger',
  templateUrl: 'location-plugin-logger.html',
})
export class LocationPluginLoggerPage {

  private styles = {
    'ERROR': 'error',
    'WARN': 'warn',
    'INFO': 'info',
    'TRACE': 'info',
    'DEBUG': 'debug',
  };

  private lastEventId = 0;
  public eventLimit = 100;
  public eventLevel = 'DEBUG';
  private timeFormat: string = "DD/MM/YY hh:mm:ss";

  public events = [];

  public levels = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR"];

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    void(this);
    console.log('ionViewDidLoad LocationPluginLoggerPage');

    this.loadLog()
      .then(events => this.addNewEvents(events))
      .catch(reason => console.error(reason))
  }

  doRefresh(refresher) {
    this.lastEventId = 0;
    this.events = [];

    this.loadLog()
      .then(events => this.addNewEvents(events))
      .catch(reason => console.error(reason))
      .then(() => refresher.complete());
  }

  doInfinite(scroll) {
    if (this.lastEventId < 0) {
      scroll.complete();
    }

    this.loadLog()
      .then(events => this.addNewEvents(events))
      .catch(reason => console.error(reason))
      .then(() => scroll.complete());
  }

  changeLevel() {
    this.lastEventId = 0;
    this.events = [];

    this.loadLog()
      .then(events => this.addNewEvents(events))
      .catch(reason => console.error(reason));
  }

  close() {
    this.viewCtrl.dismiss()
      .catch(reason => console.error(reason));
  }

  loadLog(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (window['BackgroundGeolocation']) {
        BackgroundGeolocation.getLogEntries(this.eventLimit, this.lastEventId, this.eventLevel,
          newEvents => resolve(newEvents),
          error => reject(error)
        );
      } else {
        resolve(this.getMockLog(100));
      }
    });
  }

  addNewEvents(newEvents) {
    if (newEvents.length > 0) {
      this.lastEventId = newEvents.length > 0 ? newEvents[newEvents.length - 1].id : -1;
      this.events = this.events.concat(newEvents.map(event => {
        let text = moment(event.timestamp).format(this.timeFormat) + ': ' + event.level + ' '
          + event.message + (event.stackTrace ? ' [' + event.stackTrace + ']' : '');

        return {
          id: event.id,
          style: this.styles[event.level] || this.styles['INFO'],
          text: text
        }
      }));
    }
  }

  getMockLog(n) {
    return new Array(n).fill(0).map((item, i) => {
      let level = ['ERROR', 'WARN', 'INFO', 'TRACE', 'DEBUG'][Math.floor(5 * Math.random())];
      return {
        id: Math.random(),
        timestamp: Date.now(),
        level: level,
        message: i + ' test test test test test test test test test test test test test test test ' +
          'test test test test test test test test test test test test test ' + level,
        stackTrace: 'test',
      };
    })
  }
}
