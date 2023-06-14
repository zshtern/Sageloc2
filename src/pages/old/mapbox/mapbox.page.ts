import {Component} from '@angular/core';
import {LocationTracker} from '../../../common';

import {CONNECTION_STATE} from '../home/connection/user-connection-state.enum';
import {ConfPopoverPage} from '../home/popover-page/conf-popover.page';
import {StorageService} from '../../../common/service/storage/storage.service';

import {LngLat, Map} from 'mapbox-gl';
import {MapboxService} from '../../../common/service/map/mapbox.service';
import {PopoverController, ViewController} from 'ionic-angular';
import {ModalService} from '../../../common/service/modal/modal.service';
import {SocketService} from '../../../common/service/socket/socket.service';
import {UserService} from '../../../common/service/user/user.service';
import {MALE_ICON} from '../../../assets/icon/index';
import {StateEnum} from '../home/state/state.enum';
import {MapBoxPageService} from './service/mapbox-page.service';

import {PathManager} from '../../../core/paths/pathManager';
import {PathManagerStatus} from '../../../core/paths/pathManagerStateBase';
import {MAP_USER_ID} from '../../../common/service/map/constants';

@Component({
  selector: 'mapbox-page',
  templateUrl: 'mapbox.page.html',
})
export class MapboxPage {

  users: Array<any> = [];
  user;
  private showUsers: boolean;
  private showPathControls: boolean;
  private showPathList: boolean;

  map: Map;
  mapId = MAP_USER_ID;
  userConnectionMarkers = {};

  constructor(private storageService: StorageService,
              private popoverCtrl: PopoverController,
              private viewCtrl: ViewController,
              private modalService: ModalService,
              private socketService: SocketService,
              private userService: UserService,
              private mapBoxPageService: MapBoxPageService,
              private locationTracker: LocationTracker,
              private mapboxService: MapboxService,
              private pathManager: PathManager) {
    console.log('Mapbox Component was constructed!');
  }

  ionViewCanEnter() {
    return this.storageService.getLocal('user')
      .then((user) => {
        if (user) {
          console.log('User was loaded!');
          this.user = user;

          try {
            let result = this.locationTracker.getLocation();
            if (result && result.catch) {
              result.catch(reason => {
                console.log('Can\'t get location: ', reason);
              });
            }
          } catch (e) {
            console.error(e);
          }

          return true;
        } else {
          console.log('User not found!');
          return false;
        }
      })
      .catch((reason) => {
        console.error(reason);
        return false;
      });
  }

  ionViewWillEnter() {

    this.viewCtrl.showBackButton(false);
    this.socketService.connectToWSServer();

    this.mapboxService.subscribeOnScan()
      .subscribe(val => this.onScan(val), err => console.error(err));

    this.mapboxService.subscribeOnFindFriend()
      .subscribe(val => this.onFindFriend(val), err => console.error(err));

    this.mapboxService.subscribeOnCheckPathsToFollow()
      .subscribe(val => this.onFollowPath(val), err => console.error(err));

    this.mapboxService.loadMap(MAP_USER_ID)
      .then(map => this.onMapInit(map))
      .catch(function (error) {
        console.error(error);
        alert('Can\'t load map! Error:' + error.message);
      })
  }

  onMapInit(map) {
    this.map = map;
    this.socketService.onConnectUserRequest()
      .subscribe(data => this.handleOnConnectUserRequest(data), err => console.error(err));

    this.socketService.onConnectUserRequestApprove()
      .subscribe(data => this.handleOnConnectUserRequestApprove(data), err => console.error(err));

    this.socketService.onConnectUserRequestDeny()
      .subscribe(item => this.handleOnConnectUserRequestDeny(item), err => console.error(err));

    this.socketService.onConnectUserOnMove()
      .subscribe(data => this.handleOnConnectUserOnMove(data), err => console.error(err));
  }

  openAccount() {
    alert('not implemented')
  }

  openPopOverMenu(event) {
    const popover = this.popoverCtrl.create(ConfPopoverPage);
    popover.present({ev: event});
    popover.onDidDismiss((popoverData) => {
      if (popoverData == StateEnum.NewPath) {
        this.onRouteCalc();
      }
    })
  }

  onFindFriend(email) {
    if (email) {
      this.userService.findFriendByEmail(email)
        .subscribe(res => {
          if (!res) {
            this.modalService
              .create()
              .setTitle('Sorry No User With This Email')
              .setMessage('Please insert new email')
              .show();
          }
        }, err => console.error(err))
    }
  }

  onScan(scan) {
    //todo for 2 min :get users => draw them on map => add them to users => stop scan
    if (scan) {
      this.showUsers = true;
      this.showPathControls = false;
      this.showPathList = false;
      this.userService.getUsersOnScan()
        .subscribe((users) => {
          this.users = users;
          /** this.handleNearByUsers(users) */
        }, (err) => console.error(err));
    }
  }

  onFollowPath(path) {
    if (path) {
      this.userService.sendLocations = !this.userService.sendLocations;
      this.showUsers = false;
      this.showPathControls = false;
      this.showPathList = true;

      // TODO: if state is following/defining - we need to ask user if it is ok to cancel it, before starting to follow another path
      //       this should be done inside path manager. for that it should get a UI callback
      let status = this.pathManager.GetStatus();
      if (PathManagerStatus.Standby === status) {
        let pathNames: string[] = [];
        if (this.pathManager.IsAtPathsStart(pathNames)) {
          // show list of paths and get user to select which path to follow
          this.selectPathToFollow(pathNames);
        }
      }
    }
  }

  onRouteCalc() {
    this.mapBoxPageService.onNewPath()
      .then(newPath => {
        if (newPath) {
          this.showUsers = false;
          this.showPathControls = true;
          this.showPathList = false;
        }
      });
  }

  donePathCalc() {
    this.mapBoxPageService.donePathCalc();
    this.showPathControls = false;
  }

  cancelPathCalc() {
    // this.homeService.cancelPathCalc();
    this.showPathControls = false;
  }

  sendConnectUserRequest(toUser) {
    toUser.connectionState = CONNECTION_STATE.CONNECTING;
    this.userService
      .sendConnectionRequest(toUser)
      .subscribe(res => console.log(res), err => console.error(err))
  }

  handleOnConnectUserRequest(data) {
    const {from, message} = data;
    this.modalService.create()
      .setTitle('New Friend!')
      .setMessage(message)
      .setApproveCallback(() => this.handleConnectionApproveClick(from))
      .setDenyCallback(() => this.handleConnectionDenyClick(from))
      .show();
  }

  handleConnectionApproveClick(userToNotify) {
    const obs = this.userService.sendConnectionApprove(userToNotify);
    obs.subscribe(res => console.log(res), err => console.error(err));
    this.storageService
      .getLocal('user')
      .then(user => {
        console.log(user);
        console.log(userToNotify);
      });

    return obs;
  }

  handleConnectionDenyClick(userToNotify) {
    this.userService.sendConnectionDeny(userToNotify).subscribe(res => console.log(res), err => console.error(err));
  }

  handleOnConnectUserRequestApprove(data) {
    const {from, message} = data;
    this.modalService
      .create()
      .setTitle('New Friend Approve!')
      .setMessage(message)
      .show();
    const filtered = this.users.filter(user => user.uid == from.uid);
    if (filtered && filtered.length > 0) {
      filtered[0].connectionState = CONNECTION_STATE.CONNECTION_APPROVE;
    }
  }

  handleOnConnectUserRequestDeny(wsUser) {
    wsUser.connectionState = CONNECTION_STATE.CONNECTION_DENY
  }

  handleOnConnectUserOnMove(data) {
    console.log(data);
    const {payload: {uid, x, y}} = data;

    const currMarker = this.userConnectionMarkers[uid];
    if (currMarker) {
      currMarker.remove();
    }

    this.userConnectionMarkers[uid] = this.mapboxService.addMarker(
      data,
      new LngLat(y + 0.0001, x + 0.0002),
      (data, marker) => {

      },
      MALE_ICON
    );
  }

  handleNearByUsers(users: Array<any>) {
    let i = 1;
    users.forEach(user => {
      user.connectionState = CONNECTION_STATE.NONE;
      this.addMarkerWithTimeOut(user, i * 200);
      i++;
    })
  }

  addMarkerWithTimeOut(user, timeout) {
    setTimeout(() => {
      const {x, y} = user;
      this.mapboxService.addMarker(user,
        new LngLat(x, y),
        (data, marker) => this.onUserMarkerClick(data, marker),
        MALE_ICON
      )
    }, timeout)
  }

  onUserMarkerClick(data, marker) {
    console.log(data);
    this.mapBoxPageService.onUserMarkerClick(marker, this.sendConnectUserRequest.bind(this));
  }

  selectPathToFollow(pathNames: Array<any>) {
    // present a list with all path names and get user selection
    let i = 1;
    pathNames.forEach(pathName => {
      // TODO: add line with pathName
      i++;
    })
    // TODO: get user selection and start path following:
    /*let pathToFollow = ...
     this.pathManager.StartPathFollowing(pathToFollow);*/
  }
}
