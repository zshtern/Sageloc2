import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import {UserProfileProvider} from "../../providers/user-profile/user-profile";
import {FriendshipProvider, ICodeResponse} from "../../providers/friendship/friendship";
import {Logger} from "../../providers/log-manager/log-manager";
import copy from 'copy-to-clipboard';
import {ToastProvider} from "../../providers/toast/toast";

const logger = new Logger('AddChildPage');

@IonicPage()
@Component({
  selector: 'page-add-child',
  templateUrl: 'add-child.html',
})
export class AddChildPage {

  childCode: string;
  parentCode: ICodeResponse;
  isReady = false;
  isLoaded = false;
  isSkippable = true;

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private profile: UserProfileProvider,
              private friend: FriendshipProvider,
              private toast: ToastProvider,
              private viewCtrl: ViewController) {
    console.log(logger.debug('Constructed'));

    this.isSkippable = this.navParams.get('skippable');

    this.parentCode = {
      code: 'loading...',
      expired: null
    }
  }

  ionViewCanEnter() {

  }

  ionViewWillEnter() {

  }

  ionViewDidLoad() {
    this.friend.getParentCode()
      .then(request => {
        if (request) {
          this.isLoaded = true;
          this.parentCode = request;
        }
      });

    console.log(logger.debug('ionViewDidLoad'));
  }

  public shareCode() {
    alert('Dev Note: This button should open action sheet with ability to share this code. ' +
      'Parent code: ' + this.parentCode + '.');
  }

  public approveCode() {
    if (this.isLoaded && this.isReady) {
      this.friend.approveChildCode(this.childCode)
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

  public skipCode() {
    return this.viewCtrl.dismiss({status: 'skipped'});
  }

  public closeView() {
    this.viewCtrl.dismiss({status: 'closed'})
      .catch((reason) => console.error(logger.error(reason)));
  }

  public copyCode() {
    if (copy(this.parentCode.code, {debug: true})) {
      this.toast.info('Copied!');
    } else {
      this.toast.error('Failed');
    }
  }

  public getTimeRemain() {
    return FriendshipProvider.getResponseTime(this.parentCode);
  }

  public onInputCode(code) {
    this.isReady = FriendshipProvider.checkIsCodeValid(code);
  }
}
