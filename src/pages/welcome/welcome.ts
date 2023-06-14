import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ModalController} from 'ionic-angular';
import {ILanguage, LanguageProvider} from "../../providers/language/language";
import {AppProvider} from "../../providers/app/app";

@IonicPage()
@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html',
})
export class WelcomePage {

  currentLanguage: ILanguage;

  constructor(private app: AppProvider,
              public navCtrl: NavController,
              public navParams: NavParams,
              public modalCtrl: ModalController,
              private lang: LanguageProvider) {
    this.currentLanguage = this.lang.currentLanguage();
  }

  ionViewDidLoad() {
    void(this);
    console.log('ionViewDidLoad WelcomePage');
  }

  openLanguageSelector(event) {
    void(event);
    let profileModal = this.modalCtrl.create('SelectLanguagePage');
    profileModal.onDidDismiss(data => {
      void(data);
      this.currentLanguage = this.lang.currentLanguage();
    });
    profileModal.present()
      .catch(reason => console.error(reason));
  }

  next() {
    this.navCtrl.setRoot('LoginPage')
      .then(() => this.app.setWasLaunched(true))
      .catch(reason => console.error(reason));
  }
}
