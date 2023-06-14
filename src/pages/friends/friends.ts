import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {Logger} from "../../providers/log-manager/log-manager";
import {UserProfileProvider} from "../../providers/user-profile/user-profile";
import {IUserFriend, IUserProfile} from "../../../models/user-profile";
import {FriendshipProvider} from "../../providers/friendship/friendship";

const logger = new Logger('FriendsPage');

interface IChild {
  id: string;
  name: string;
  avatar: string;
  location: string;
  battery: string;
  updated: string;
}

@IonicPage({
  segment: 'friends-tab'
})
@Component({
  selector: 'page-friends',
  templateUrl: 'friends.html',
})
export class FriendsPage {

  demoChild: IChild;
  children: IChild[];
  profile: IUserProfile;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private friend: FriendshipProvider,
              private profileManager: UserProfileProvider) {

    this.profile = this.profileManager.currentProfile;
    this.children = [];
    this.demoChild = {
      id: '1',
      name: '[Demo] David',
      avatar: 'https://ui-avatars.com/api/?name=David',
      location: 'Home',
      battery: '56%',
      updated: '3:43 pm'
    };

    console.log(logger.debug('Constructed'));
  }

  ionViewDidLoad() {
    void (this);
    this.children = this.profile.children.map(child => FriendsPage.createChildObject(child));
    console.log(logger.debug('ionViewDidLoad'));
  }

  openChild(child) {
    this.navCtrl.push('ChildDetailsPage', {id: child.id})
      .catch(reason => console.error(logger.error(reason)));
  }

  openAddChild() {
    this.friend.addChild({skippable: false})
      .catch(reason => console.error(logger.error(reason)));
  }

  static createChildObject(friend: IUserFriend): IChild {
    return {
      id: friend.id,
      name: friend.name,
      avatar: 'https://ui-avatars.com/api/?name=' + friend.name,
      location: '[D] Home',
      battery: '[D] 56%',
      updated: '[D] 3:43 pm'
    }
  }
}
