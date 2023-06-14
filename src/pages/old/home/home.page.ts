import { Component } from '@angular/core';
import { PopoverController, ViewController } from 'ionic-angular';
import { LatLng } from '@ionic-native/google-maps';
import { GlMapService, LocationTracker, ModalService, SocketService, StorageService, UserService } from '../../../common';

import { CONNECTION_STATE } from './connection/user-connection-state.enum';
import { ConfPopoverPage } from './popover-page/conf-popover.page';
import { HomeService } from './service/home.service';
import { MALE_ICON } from '../../../assets/icon/index';
import { StateEnum } from './state/state.enum';

declare let google;

@Component({
    selector: 'home-page',
    templateUrl: 'home.page.html',
})
export class HomePage {

    users: Array<any> = [];
    user;
    private showUsers: boolean;
    private showPathControls: boolean;

    constructor(private storageService: StorageService,
                private popoverCtrl: PopoverController,
                private homeService: HomeService,
                private viewCtrl: ViewController,
                private modalService: ModalService,
                private socketService: SocketService,
                private userService: UserService,
                private locationTracker: LocationTracker,
                private glMapService: GlMapService) {

    }

    //
    // //noinspection JSUnusedGlobalSymbols
    // ionViewCanEnter() {
    //     return new Promise((resolve, reject) => {
    //         Promise.all([this.locationTracker.getLocation(), this.storageService.getLocal('user')])
    //             .then(values => {
    //                 console.log(values);
    //                 this.user = values[1];
    //                 resolve(true)
    //             })
    //             .catch(err => reject(err))
    //     })
    // }
    //
    // //noinspection JSUnusedGlobalSymbols
    // ionViewWillEnter() {
    //     this.viewCtrl.showBackButton(false);
    //
    //     this.socketService.connectToWSServer();
    //
    //     this.glMapService
    //         .subscribeOnScan()
    //         .subscribe(val => this.onScan(val))
    //
    // }
    //
    // openPopOverMenu(ev) {
    //     const popover = this.popoverCtrl.create(ConfPopoverPage);
    //     popover.present({ev});
    //     popover.onDidDismiss((popoverData) => {
    //         if (popoverData == StateEnum.NewPath) {
    //             this.onRouteCalc();
    //         }
    //     })
    // }
    //
    onMapInit() {}
    // onMapInit() {
    //     this.socketService
    //         .onConnectUserRequest()
    //         .subscribe(data => this.handleOnConnectUserRequest(data));
    //
    //     this.socketService
    //         .onConnectUserRequestApprove()
    //         .subscribe(item => this.handleOnConnectUserRequestApprove(item));
    //
    //     this.socketService
    //         .onConnectUserRequestDeny()
    //         .subscribe(item => this.handleOnConnectUserRequestDeny(item));
    //
    //     this.glMapService.centerMap();
    // }
    //
    // onScan(scan) {
    //     //todo for 2 min :get users => draw them on map => add them to users => stop scan
    //     if (scan) {
    //         this.showUsers = true;
    //         this.showPathControls = false;
    //         this.userService.getUsersOnScan(this.locationTracker.location)
    //             .subscribe(users => {
    //                 this.users = users;
    //                 this.handleNearByUsers(users)
    //             })
    //     }
    // }
    //
    // onRouteCalc() {
    //     //todo(dennis) remove this
    //     this.showUsers = false;
    //     this.showPathControls = true;
    //     const pathStart = this.homeService.onNewPath();
    //     if (pathStart) {
    //         this.showUsers = false;
    //         this.showPathControls = true;
    //     }
    //
    // }
    //
    // donePathCalc() {
    //     this.homeService.donePathCalc();
    //     this.showPathControls = false;
    // }
    //
    // cancelPathCalc() {
    //     this.homeService.cancelPathCalc();
    //     this.showPathControls = false;
    // }
    //
    // sendConnectUserRequest(toUser) {
    //     toUser.connectionState = CONNECTION_STATE.CONNECTING;
    //     this.storageService.getLocal('user')
    //         .then(fromUser => {
    //
    //         });
    // }
    //
    // handleOnConnectUserRequest(data) {
    //     const {fromUser, toUser} = data;
    //     this.modalService.create()
    //         .setTitle('New Friend!')
    //         .setMessage(`Your friend, ${fromUser.userName}, send you connect request!`)
    //         .setApproveCallback(() => this.handleConnectionApproveClick(fromUser, toUser))
    //         .setDenyCallback(() => this.handleConnectionDenyClick(fromUser, toUser))
    //         .show();
    // }
    //
    // handleConnectionApproveClick(fromUser, toUser) {
    //     // this.userService.sendConnectionApprove(fromUser, toUser).subscribe(res => console.log(res));
    // }
    //
    // handleConnectionDenyClick(fromUser, toUser) {
    //     // this.userService.sendConnectionDeny(fromUser, toUser).subscribe(res => console.log(res));
    // }
    //
    // handleOnConnectUserRequestApprove(wsUser) {
    //     const {user: {userId}} = wsUser;
    //     const filtered = this.users.filter(user => user.id == userId);
    //     filtered[0].connectionState = CONNECTION_STATE.CONNECTION_APPROVE;
    // }
    //
    // handleOnConnectUserRequestDeny(wsUser) {
    //     wsUser.connectionState = CONNECTION_STATE.CONNECTION_DENY
    // }
    //
    // handleNearByUsers(users: Array<any>) {
    //     let i = 1;
    //     users.forEach(user => {
    //         user.connectionState = CONNECTION_STATE.NONE;
    //         this.addMarkerWithTimeOut(user, i * 200);
    //         i++;
    //     })
    // }
    //
    // addMarkerWithTimeOut(user, timeout) {
    //     setTimeout(() => {
    //         const {x, y} = user;
    //         const position = new LatLng(x, y);
    //         this.glMapService.addMarker(user,
    //             position,
    //             (data, marker) => this.onUserMarkerClick(data, marker),
    //             MALE_ICON
    //         )
    //     }, timeout)
    // }
    //
    // onUserMarkerClick(data, marker) {
    //     console.log(data);
    //     this.homeService.onUserMarkerClick(marker, this.sendConnectUserRequest.bind(this));
    // }
}
