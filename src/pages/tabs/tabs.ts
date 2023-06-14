import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {IonicPage, NavController, NavParams} from 'ionic-angular';

@IonicPage(
  {segment: 'tabs'}
)
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {

  tab1Root: any = 'MapPage';
  tab2Root: any = 'RoutesPage';
  tab3Root: any = 'FriendsPage';
  tab4Root: any = 'SettingsPage';

  tab1Title = "Tab 1";
  tab2Title = "Tab 2";
  tab3Title = "Tab 3";
  tab4Title = "Tab 4";

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private afAuth: AngularFireAuth,
              public translateService: TranslateService) {
    translateService.get(['tabs.map', 'tabs.routes', 'tabs.friends', 'tabs.settings'])
      .subscribe(values => {
        this.tab1Title = values['tabs.map'];
        this.tab2Title = values['tabs.routes'];
        this.tab3Title = values['tabs.friends'];
        this.tab4Title = values['tabs.settings'];
      });
  }

  ionViewDidLoad() {
    void(this);
    console.log('ionViewDidLoad TabsPage');
  }

  ionViewWillEnter() {
    let unsubscribe = this.afAuth.auth.onAuthStateChanged((user) => {
      unsubscribe();
      if (user) {
        // User is signed in.
        console.log(user);
      } else {
        // No user is signed in.
        console.log(null);
        this.navCtrl.setRoot('LoginPage')
          .catch(reason => console.error(reason));
      }
    });
  }

  ionViewWillLeave() {
    void(this);
    console.log('ionViewWillLeave TabsPage');
  }
}
