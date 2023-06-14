import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-child-location',
  templateUrl: 'child-location.html',
})
export class ChildLocationPage {

  constructor(public navCtrl: NavController,
              public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChildLocationPage', this.navCtrl.name);
  }

  next() {
    alert('Dev Note: ???');

    this.navCtrl.setRoot('ChildHomePage')
      .catch((reason) => console.error(reason));
  }
}
