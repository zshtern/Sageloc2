import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Vibration } from '@ionic-native/vibration';

@IonicPage()
@Component({
  selector: 'page-plugin-vibration',
  templateUrl: 'plugin-vibration.html',
})
export class PluginVibrationPage {

  public messages: string[] = [];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private vibration: Vibration) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PluginVibrationPage');
  }

  ionViewDidLeave() {
    console.log('ionViewDidLeave PluginVibrationPage');
  }

  log(...args: any[]) {
    this.messages.unshift((new Date()).toISOString() + ' - ' + args.join(' '));
    console.log(...args);
  }

  error(...args: any[]) {
    this.messages.unshift((new Date()).toISOString() + ' - ' + args.join(' '));
    console.error(...args);
  }

  vibrate () {
    this.vibration.vibrate(1000);
    this.log('vibration done');
  }
}
