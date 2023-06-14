import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-plugin-background-geolocation-settings',
  templateUrl: 'plugin-background-geolocation-settings.html',
})
export class PluginBackgroundGeolocationSettingsPage {

  public settings;

  constructor(private params: NavParams,
              private viewCtrl: ViewController,) {
    console.log('settings', params.get('settings'));

    this.settings = JSON.parse(JSON.stringify(params.get('settings')));
    this.settings.httpHeaders = JSON.stringify(this.settings.httpHeaders);
    this.settings.postTemplate = JSON.stringify(this.settings.postTemplate);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PluginBackgroundGeolocationSettingsPage');
  }

  dismiss() {
    let settings = JSON.parse(JSON.stringify(this.settings));

    try {
      if (settings.httpHeaders) settings.httpHeaders = JSON.parse(settings.httpHeaders);
      if (settings.postTemplate) settings.postTemplate = JSON.parse(settings.postTemplate);
    } catch (e) {
      console.error(e);
      alert('Invalid JSON');
    }

    this.viewCtrl.dismiss(settings)
      .catch((error) => {
        console.error(error);
      });
  }
}
