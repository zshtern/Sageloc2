import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-cordova-plugins',
  templateUrl: 'cordova-plugins.html',
})
export class CordovaPluginsPage {
  plugins = [
    {name: 'cordova-plugin-vibration', page: 'PluginVibrationPage'},
    {name: 'cordova-plugin-stepcounter', page: 'PluginStepcounterPage'},
    {name: 'cordova-plugin-pedometer', page: 'PluginPedometerPage'},
    {name: 'cordova-plugin-device-motion', page: 'PluginDeviceMotionPage'},
    {name: 'cordova-plugin-mauron85-background-geolocation', page: 'PluginBackgroundGeolocationPage'},
    {name: 'cordova-plugin-background-geolocation-lt', page: 'PluginBackgroundGeolocationLtPage'},
    {name: 'route-playground', page: 'RoutePlaygroundPage'},
    // {name: 'cordova-plugin-device-orientation', page: 'PluginPedometerPage'},
    // {name: 'cordova-plugin-gyroscope', page: 'PluginPedometerPage'},
    // {name: 'cordova-plugin-battery-status', page: 'PluginPedometerPage'}
    ];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    void(this);
    console.log('ionViewDidLoad CordovaPluginsPage');
  }

  ionViewDidLeave() {
    void(this);
    console.log('ionViewDidLeave CordovaPluginsPage');
  }

}
