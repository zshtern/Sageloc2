import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
// import {TranslateService} from "@ngx-translate/core";
import {ILanguage, LanguageProvider} from "../../providers/language/language";
import {Logger} from "../../providers/log-manager/log-manager";

const logger = new Logger('[Language Selector]');

@IonicPage()
@Component({
  selector: 'page-select-language',
  templateUrl: 'select-language.html',
})
export class SelectLanguagePage {

  public languages: ILanguage[];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewCtrl: ViewController,
              private language: LanguageProvider) {

    this.languages = this.language.getLanguages();
  }

  ionViewDidLoad() {
    void(this);
    console.log(logger.debug('ionViewDidLoad'));
  }

  selectLanguage(language) {
    console.log(logger.debug(language));
    this.language.useLanguage(language);
    this.dismiss();
  }

  dismiss() {
    this.viewCtrl.dismiss()
      .catch(error => console.error(error));
  }

  // onInput (event) {
  //   console.log('input', event.target.value);
  //   let val = event.target.value;
  //
  //   // if the value is an empty string don't filter the items
  //   if (val && val.trim() != '') {
  //     this.languages = this.language.getLanguages().filter((item) => {
  //       return (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
  //     })
  //   } else {
  //     this.languages = this.language.getLanguages();
  //   }
  // }
  //
  // onCancel (event) {
  //   console.log('cancel');
  //   this.languages = this.language.getLanguages();
  // }
}
