import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {LoginPage} from "../old/auth/login/login.page";

@IonicPage()
@Component({
  selector: 'page-developer',
  templateUrl: 'developer.html',
})
export class DeveloperPage {

  constructor(public navCtrl: NavController,
              public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DeveloperPage', this.navCtrl.name);
  }

  openOldVersion() {
    this.navCtrl.setRoot(LoginPage)
      .then(isEntered => {
        if (!isEntered) console.log('Can\'t enter next page.');
      })
      .catch(reason => console.error(reason));
  }

  openNewVersion() {
    this.navCtrl.setRoot('WelcomePage')
      .then(isEntered => {
        if (!isEntered) console.log('Can\'t enter next page.');
      })
      .catch(reason => console.error(reason));
  }

  openRoutePlayground() {
    this.navCtrl.push('RoutePlaygroundPage')
      .catch((reason) => {
        console.error(reason);
      });
  }

  openFirebasePlayground() {
    this.navCtrl.push('AngularFire2Page')
      .catch((reason) => {
        console.error(reason);
      });
  }

  openWebPlayground() {
    this.navCtrl.push('WebInterfacesPage')
      .catch((reason) => {
        console.error(reason);
      });
  }

  openCordovaPlayground() {
    this.navCtrl.push('CordovaPluginsPage')
      .catch((reason) => {
        console.error(reason);
      });
  }
}
