import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { SideMenuService } from '../../common/service/menu.service';

import { UtilsService } from '../../common/service/util/utils.service';
import { UserService } from '../../common/service/user/user.service';
import 'rxjs/add/operator/filter';
import { MessageService } from '../../common/service/message/message.service';
import { SocketService } from '../../common/service/socket/socket.service';
import { testingNavigator } from '../../core/testing/geomock';
import { LocationTest } from '../../core/testing/Testing';
import { LogService } from '../../common/service/log/log.service';
import { TravelManager } from '../../core/travel/travelManager';
import { TravelManagerStatus } from '../../core/travel/travelManagerStateBase';
import { Stepcounter } from '@ionic-native/stepcounter';

declare var google;

@Component({
    selector: 'page-dev',
    templateUrl: 'dev.html',
})
export class DevPage {


    positions: any = [];
    startingOffset = 0;
    private steps: number | any;
    private geolocationTimer: number;
    private travelStatus: string | any;

    constructor(private viewController: ViewController,
                private stepcounter: Stepcounter,
                private logService: LogService,
                private socketService: SocketService,
                private messageService: MessageService,
                private utilsService: UtilsService,
                private userService: UserService,
                private sideMenuService: SideMenuService,
                private travelManager: TravelManager) {

    }

    ionViewDidEnter() {

        // this.messageService
        //     .notificationReceived()
        //     .subscribe((notification: OSNotification) => {
        //         console.log(notification);
        //         this.positions.push({date: Date.now(), x: notification})
        //     });


    }

    startStepCounter() {
        this.stepcounter.start(this.startingOffset)
            .then(
                onSuccess => console.log('stepcounter-start success', onSuccess),
                onFailure => console.log('stepcounter-start error', onFailure)
            );
    }

    stopStepCounter() {
        this.stepcounter.stop();


        this.userService
            .sendUserLocation({uid: 'someUserId', x: 1, y: 1, qk: '11', tx: 1, ty: 1, z: 1})
            .subscribe(users => users)


    }

    getStepCount() {
        this.stepcounter.getStepCount().then(steps => {
            this.steps = steps
        });
    }

    startTracking() {
        // this.locationTracker.startTracking(location => this.positions.push(location))
    }

    stopTracking() {
        // this.locationTracker.stopTracking()
    }

    updateTravelStatus(newStatus: string) {
        this.travelStatus = newStatus;
    }

    startLocationsTesting() {

        var latlng = new google.maps.LatLng(31, 31);
        var myOptions = {
            zoom: 18,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var map_elem = document.getElementById("map_canvas");
        map_elem.style.height = window.innerHeight + "px";

        var map = new google.maps.Map(map_elem, myOptions);
        var marker = new google.maps.Marker({position: latlng});
        marker.setMap(map);

        let route1 = new google.maps.Polyline({
            path: [],
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2,
            editable: false,
            map: map
        });

        let route2 = new google.maps.Polyline({
            path: [],
            geodesic: true,
            strokeColor: '#0000FF',
            strokeOpacity: 1.0,
            strokeWeight: 2,
            editable: false,
            map: map
        });

        let basicSuccessHandler = (location) => {
            latlng = new google.maps.LatLng(location.coords.latitude, location.coords.longitude);
            map.panTo(latlng);
            marker.setPosition(latlng);
            route1.getPath().push(latlng);
            LocationTest.advance(location);

            this.travelStatus = TravelManagerStatus[this.travelManager.getStatus()];

            latlng = new google.maps.LatLng(location.coords.latitude, location.coords.longitude);
            route2.getPath().push(latlng);
        };

        var basicErrorHandler = function (msg) {
            console.log("Geolocation error:", msg);
        };

        this.geolocationTimer = testingNavigator.geolocation.watchPosition(basicSuccessHandler, basicErrorHandler);
    }

    stopLocationsTesting() {
        testingNavigator.geolocation.clearWatch(this.geolocationTimer);
    }

    addLog() {
        // this.logService.debug({text: `message ${Date.now()}`}).subscribe(res => console.log(res))
    }
}
