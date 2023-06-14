import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-web-interfaces',
  templateUrl: 'web-interfaces.html',
})
export class WebInterfacesPage {
  plugins = [
    {name: 'web-device-motion', page: 'WebDeviceMotionPage'},
    ];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    void(this);
    console.log('ionViewDidLoad WebInterfacesPage');
  }

}
