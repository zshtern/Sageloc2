import { Component } from '@angular/core';
import {ViewController} from "ionic-angular";

@Component({
  selector: 'language-selector',
  templateUrl: 'language-selector.html'
})
export class LanguageSelectorComponent {

  text: string;

  constructor(public viewCtrl: ViewController) {
    console.log('Hello LanguageSelectorComponent Component');
    this.text = 'Hello World';
  }

  getLanguages() {

  }

  selectLanguage() {

  }

  dismiss() {
    let data = { 'foo': 'bar' };
    this.viewCtrl.dismiss(data);
  }

}
