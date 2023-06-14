import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireFunctions} from '@angular/fire/functions';
import {of} from 'rxjs';
import * as moment from 'moment';
import {ModalController} from "ionic-angular";

export interface ICodeResponse {
  code: string;
  expired: number;
}

interface AddChildOptions {
  skippable: boolean;
}

@Injectable()
export class FriendshipProvider {

  data$;

  childCodeResponse: ICodeResponse;
  parentCodeResponse: ICodeResponse;

  // testing
  getChild$;
  getParent$;
  approveChild$;
  approveParent$;

  constructor(private afStore: AngularFirestore,
              private fns: AngularFireFunctions,
              private modalCtrl: ModalController) {
    console.log('Hello FriendshipProvider Provider');
  }

  test1() {
    console.log('Try firebase function 1');
    const callable = this.fns.httpsCallable('getCode');
    return callable({name: 'some-data'});
  }

  test2() {
    console.log('Try firebase function 2');
    const callable = this.fns.httpsCallable('app/hello');
    return callable({name: 'some-data'});
  }

  getCode(type) {
    void (this);
    let prefix = 'x';
    switch (type) {
      case 'add-parent':
        prefix = 'p';
        break;
      case 'add-child':
        prefix = 'c';
        break;
      case 'add-friend':
        prefix = 'f';
        break;
      default:
        prefix = 'x';
    }
    return of(prefix + FriendshipProvider.generateCode('numbers', 4));
  }

  static generateCode(type, n) {
    let chars = ['abcdefghijklmnopqrstuvwxyz'];
    let numbers = ['0123456789'];
    let symbols = [];

    switch (type) {
      case type === 'numbers':
        symbols = numbers;
        break;
      case type === 'chars':
        symbols = chars;
        break;
      case type === 'all':
      default:
        symbols = [].concat(numbers, chars);
        break;
    }

    let code = [];

    for (let i = 0; i < n; i++) {
      code.push(chars[chars.length * Math.random()]);
    }

    return {code: code, expired: moment().add(5, 'm')};
  }

  // sendRequest(friendshipId) {
  //   void (friendshipId);
  //   // return this.afStore.doc("")('users/' + )
  //   //   .set({});
  // }

  approve(code) {
    void (this);

    switch (code) {
      case code === 'c0001':
        return of({id: '1', type: 'parent', code: ''});
      case code === 'c0002':
        return of({error: {message: 'Expired code.'}});
      case code === 'p0001':
        return of({id: '2', type: 'child', code: ''});
      case code === 'p0002':
        return of({error: {message: 'Expired code.'}});
      case code === 'f0001':
        return of({id: '3', type: 'friend', code: ''});
      default:
        return of({error: {message: 'Invalid code.'}});
    }
  }

  getChildCode() {
    if (this.childCodeResponse && this.childCodeResponse.expired > Date.now()) {
      return Promise.resolve(this.childCodeResponse);
    }
    const callable = this.fns.httpsCallable('getChildCode');

    return callable({}).take(1).toPromise()
      .then(response => {
        this.childCodeResponse = response;
        return response;
      });
  }

  getParentCode(): Promise<ICodeResponse> {
    if (this.parentCodeResponse && this.parentCodeResponse.expired > Date.now()) {
      return Promise.resolve(this.parentCodeResponse);
    }
    const callable = this.fns.httpsCallable('getParentCode');

    return callable({}).take(1).toPromise()
      .then(response => {
        this.parentCodeResponse = response;
        return response;
      });
  }

  approveChildCode(code) {
    const callable = this.fns.httpsCallable('approveChildCode');
    return callable({code: code}).take(1).toPromise();
  }

  approveParentCode(code) {
    const callable = this.fns.httpsCallable('approveParentCode');
    return callable({code: code}).take(1).toPromise();
  }

  testGetChildCode() {
    this.getChild$ = this.getChildCode()
      .then(res => {
        this.childCodeResponse = res;
        console.log(res);
      })
      .catch(error => {
        console.error(error);
      });
  }

  testGetParentCode() {
    this.getParent$ = this.getParentCode()
      .then(res => {
        this.parentCodeResponse = res;
        console.log(res);
      })
      .catch(error => {
        console.error(error);
      });
  }

  testApproveChildCode() {
    if (!this.childCodeResponse) return;

    this.approveChild$ = this.approveChildCode(this.childCodeResponse.code)
      .then(res => {
        console.log(res);
      })
      .catch(error => {
        console.error(error);
      });
  }

  testApproveParentCode() {
    if (!this.parentCodeResponse) return;

    this.approveParent$ = this.approveParentCode(this.parentCodeResponse.code)
      .then(res => {
        console.log(res);
      })
      .catch(error => {
        console.error(error);
      });
  }

  static checkIsCodeValid(code: string): boolean {
    return (code && code.length === 20);
  }

  static getResponseTime(response) {
    if (response.expired) {
      return ' (' + ((response.expired - Date.now()) / 1000 / 60).toFixed(0) + ' minutes remained)';
    } else {
      return '';
    }
  }

  public addChild(options: AddChildOptions) {
    return new Promise((resolve, reject) => {
      let modal = this.modalCtrl.create('AddChildPage', options);
      modal.present().catch(reason => reject(reason));

      modal.onDidDismiss((data) => {
        if (data.status === 'approved' || data.status === 'skipped') {
          resolve(true);
        } else {
          resolve(false);
        }
      })
    });
  }

  public addParent() {
    return new Promise((resolve, reject) => {
      let modal = this.modalCtrl.create('AddParentPage');
      modal.present().catch(reason => reject(reason));

      modal.onDidDismiss((data) => {
        if (data.status === 'approved') {
          resolve(true);
        } else {
          resolve(false);
        }
      })
    });
  }
}
