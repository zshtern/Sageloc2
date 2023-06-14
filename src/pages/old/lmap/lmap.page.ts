import { Component } from '@angular/core';
import { GlMapService, LocationTracker } from '../../../common';

import { CONNECTION_STATE } from '../home/connection/user-connection-state.enum';
import { ConfPopoverPage } from '../home/popover-page/conf-popover.page';
import { HomeService } from '../home/service/home.service';
import { StateEnum } from '../home/state/state.enum';
import { StorageService } from '../../../common/service/storage/storage.service';

import * as L from 'leaflet';
import { NAVIGATION_ICON } from '../../../assets/icon/index';
import Marker = L.Marker;

@Component({
    selector: 'lmap-page',
    templateUrl: 'lmap.html',
})
export class LmapPage {

    user;
    leafletOptions = {
        layers: [
            L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 18,
                    attribution: 'Open Street Map'
                }
            )
        ],
        zoom: 18,
    };
    mapCenter: L.LatLng = L.latLng({lat: 38.991709, lng: -76.886109});
    map: L.Map;

    constructor(private locationTracker: LocationTracker,
                private storageService: StorageService,
                private glMapService: GlMapService) {

    }


    //noinspection JSUnusedGlobalSymbols
    ionViewCanEnter() {
        return new Promise((resolve, reject) => {
            Promise.all([this.locationTracker.getLocation(), this.storageService.getLocal('user')])
                .then(values => {
                    this.user = values[1];
                    resolve(true)
                })
                .catch(err => reject(err))
        })
    }

    //noinspection JSUnusedGlobalSymbols
    ionViewWillEnter() {
        const {lng, lat} = this.locationTracker.getLocationLatLng();
        this.mapCenter = L.latLng({lat, lng});
    }


    onMapReady(map: L.Map) {
        this.map = map;
        const {lng, lat} = this.locationTracker.getLocationLatLng();
        const marker: Marker = L.marker([lat, lng], {icon: this.getIcon()})
            .addTo(map)
            .on('click', (data) => {
                console.log(data)
            });
    }

    getIcon() {
        return L.icon({
            iconUrl: NAVIGATION_ICON,
            iconSize: [38, 45], // size of the icon
            iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
            shadowAnchor: [4, 62],  // the same for the shadow
            popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
        });
    }
}
