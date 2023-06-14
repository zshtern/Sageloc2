import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {Logger} from "../../providers/log-manager/log-manager";

const logger = new Logger('RoutesPage');

interface IRoute {
  id: string;
  name: string;
  origin: IWaypoint;
  destination: IWaypoint;
  duration: string;
  distance: string;
}

interface IWaypoint {
  name: string;
  address: string;
}

@IonicPage({
  segment: 'routes-tab'
})
@Component({
  selector: 'page-routes',
  templateUrl: 'routes.html',
})
export class RoutesPage {

  public routes: IRoute[];
  public demoRoute: IRoute;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.routes = [];
    this.demoRoute = {
      id: '1',
      name: '[Demo] Route #1',
      origin: {name: 'Home', address: '11 N. Way St, Madison, WI 53703'},
      destination: {name: 'School', address: '14 S. Hop Avenue, Madison, WI 53703'},
      duration: '18 min',
      distance: '2.6 mi'
    };

    console.log(logger.debug('Constructed'));
  }

  ionViewDidLoad() {
    void (this);
    console.log(logger.debug('ionViewDidLoad'));
  }

  openAddRoute() {
    alert('Not Implemented');
  }
}
