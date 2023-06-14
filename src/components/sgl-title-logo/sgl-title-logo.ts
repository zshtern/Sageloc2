import { Component } from '@angular/core';

@Component({
  selector: 'sgl-title-logo',
  templateUrl: 'sgl-title-logo.html'
})
export class SglTitleLogoComponent {

  text: string;

  constructor() {
    console.log('Hello SglTitleLogoComponent Component');
    this.text = 'Hello World';
  }

}
