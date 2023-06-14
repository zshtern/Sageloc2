import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {AngularFireDatabase} from '@angular/fire/database';

@IonicPage()
@Component({
  selector: 'page-angular-fire2',
  templateUrl: 'angular-fire2.html',
})
export class AngularFire2Page {

  itemsFS: Observable<any[]>;
  itemsFDB: Observable<any[]>;

  fsItems: any;
  fdbItems: any;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public fs: AngularFirestore,
              public fdb: AngularFireDatabase) {
    try {
      fs.collection('items').valueChanges()
        .subscribe((items) => this.fsItems = items, (err) => console.error(err));

      fdb.list('items').valueChanges()
        .subscribe((items) => this.fdbItems = items, (err) => console.error(err));
    } catch (e) {
      console.error(e);
    }
  }

  ionViewDidLoad() {
    void(this);
    console.log('ionViewDidLoad AngularFire2Page');
  }
}
