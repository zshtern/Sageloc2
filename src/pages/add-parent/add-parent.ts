import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import copy from "copy-to-clipboard";
import {FriendshipProvider, ICodeResponse} from "../../providers/friendship/friendship";
import {ToastProvider} from "../../providers/toast/toast";
import {Logger} from "../../providers/log-manager/log-manager";
import {UserProfileProvider} from "../../providers/user-profile/user-profile";

const logger = new Logger('AddParentPage');

@IonicPage()
@Component({
  selector: 'page-add-parent',
  templateUrl: 'add-parent.html',
})
export class AddParentPage {

  childCode: ICodeResponse;
  parentCode: string;
  isReady = false;
  isLoaded = false;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private friend: FriendshipProvider,
              private profile: UserProfileProvider,
              private toast: ToastProvider,
              private viewCtrl: ViewController) {

    this.childCode = {
      code: 'loading...',
      expired: null
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddParentPage', this.navCtrl.name);

    this.friend.getChildCode()
      .then(request => {
        if (request) {
          this.isLoaded = true;
          this.childCode = request;
        }
      });
  }

  public shareCode() {
    alert('Dev Note: This button should open action sheet with ability to share this code. ' +
      'Parent code: ' + this.parentCode + '.');
  }

  public approveCode() {
    if (this.isLoaded && this.isReady) {
      this.friend.approveParentCode(this.parentCode)
        .then(response => {
          if (response && response.approved) {
            return this.viewCtrl.dismiss({status: 'approved'});
          } else {
            this.toast.error('Not approved. Try again.');
          }
        })
        .catch(reason => {
          console.error(logger.error(reason));
          this.toast.error('Failed');
        });
    }
  }

  public closeView() {
    this.viewCtrl.dismiss({status: 'closed'})
      .catch((reason) => console.error(logger.error(reason)));
  }

  public copyCode() {
    if (copy(this.childCode.code, {debug: true})) {
      this.toast.info('Copied!');
    } else {
      this.toast.error('Failed');
    }
  }

  public getTimeRemain() {
    return FriendshipProvider.getResponseTime(this.childCode);
  }

  public onInputCode(code) {
    this.isReady = FriendshipProvider.checkIsCodeValid(code);
  }
}
