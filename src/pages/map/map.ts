import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {MapMarket} from "../../components/leaflet-map/leaflet-map";
import {UserProfileProvider} from "../../providers/user-profile/user-profile";

@IonicPage({
  segment: 'map-tab'
})
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {

  public markers: MapMarket[];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private profile: UserProfileProvider) {
    console.log('MapPage constructed');

    this.markers = [];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MapPage');

    let profile = this.profile.currentProfile;

    if (profile && profile.children && profile.children.length) {
      console.log('ionViewDidLoad MapPage 1');
      this.markers = profile.children.map(child => {
        return <MapMarket>{
          id: child.id,
          name: child.name,
          icon: 'https://ui-avatars.com/api/?name=' + child.name + '&rounded=true&bold=true&size=32&background=ffffff',
          lat: 31.789065,
          lng: 35.202694,
          action: (id) => {
            console.log(id);
          }
        }
      });
    } else {
      console.log('ionViewDidLoad MapPage 2');
      this.markers = [
        {
          id: '1',
          name: 'Demo 1',
          icon: 'https://ui-avatars.com/api/?name=Demo+1&rounded=true&bold=true&size=32&background=ffffff',
          lat: 31.789065,
          lng: 35.202694,
          action: (id) => {
            console.log(id);
          }
        },
        {
          id: '2',
          name: 'Demo 2',
          icon: 'https://ui-avatars.com/api/?name=Demo+2&rounded=true&bold=true&size=32&background=ffffff',
          lat: 31.776055,
          lng: 35.227918,
          action: (id) => {
            console.log(id);
          }
        },
        {
          id: '3',
          name: 'Demo 3',
          icon: 'https://ui-avatars.com/api/?name=Demo+3&rounded=true&bold=true&size=32&background=ffffff',
          lat: 31.740685,
          lng: 35.182062,
          action: (id) => {
            console.log(id);
          }
        }
      ];
    }

    console.log('ionViewDidLoad MapPage 3');

    setInterval(() => {
      // console.log('Updated');
      this.markers.forEach(marker => {
        marker.lng += 0.001 * (Math.random() - 0.5);
        marker.lat += 0.001 * (Math.random() - 0.5);
      })
    }, 2000);
  }
}
