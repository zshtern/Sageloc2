import { Injectable } from '@angular/core';
import { Loading, LoadingController, Platform } from 'ionic-angular';
import { MapDefConfig } from '../../components/map/options/map-options';
import { loadMapScript } from '../../utils/utils';
import { BehaviorSubject } from 'rxjs';
import { MapScanner } from '../../components/map/scaner/map-scaner';
import { LocationTracker } from '../location/location-tracker.service';
import { LatLng } from '@ionic-native/google-maps';
import { GeolocationMarker } from '../../components/map/location/location-marker';
import { TravelManager } from '../../../core/travel/travelManager';
import { TravelManagerStatus } from '../../../core/travel/travelManagerStateBase';
import { Dynamics } from '../../../core/dynamics';
import { MapControl } from '../../components/map/control/map-control';

declare var google;

@Injectable()
export class GlMapService {

    private onDevice: boolean;
    private map: any;
    private directionsService = new google.maps.DirectionsService();
    private mapScanner: MapScanner;
    mapClickBehavior: BehaviorSubject<any> = new BehaviorSubject(null);
    startScanBehavior: BehaviorSubject<boolean> = new BehaviorSubject(false);
    directionsDisplay = new google.maps.DirectionsRenderer();
    private geolocationMarker: GeolocationMarker;
    private newPathSegments = null;

    constructor(private platform: Platform,
                private locationTracker: LocationTracker,
                private loadingCtrl: LoadingController,
                private travelManager: TravelManager,
                private dynamics: Dynamics) {

        this.onDevice = this.platform.is('cordova');
    }

    loadMap(mapElement, locationOpt?: any) {
        const loading: Loading = this.loadingCtrl.create({content: 'Please wait...',});
        return loading.present()
            .then(val => {
                return this.platformReady()
                    .then(() => this.initMap(mapElement, loading));
            })

    }

    initMap(mapElement, loading) {
        const locationLatLng = this.locationTracker.getLocationLatLng();
        const mapDefConfig = new MapDefConfig(locationLatLng);
        this.map = new google.maps.Map(mapElement, mapDefConfig.getMapConfig());
        this.directionsDisplay.setMap(this.map);
        this.mapScanner = new MapScanner(this.map);
        this.addLocationControl();
        this.geolocationMarker = new GeolocationMarker(this.map, locationLatLng);
        
        /*this.locationTracker
            .watchPosition()
            .subscribe(position => {
                this.geolocationMarker.updatePosition(position);
                let travelStatus = this.travelManager.getStatus();
                if (travelStatus === TravelManagerStatus.Accelerated || travelStatus === TravelManagerStatus.InVehicle)
                    this.centerMap();
            });*/

        this.locationTracker.watchPosition();
        this.dynamics.subscribeOnLocationChange()
            .subscribe(result => {
                if (result !== null) {
                    this.geolocationMarker.updatePosition(result.updatedLocation);
                    let travelStatus = this.travelManager.getStatus();
                    if (travelStatus === TravelManagerStatus.Accelerated || travelStatus === TravelManagerStatus.InVehicle)
                        this.centerMap();
                }
            });

        this.map.addListener('click', e => this.mapClickBehavior.next(new LatLng(e.latLng.lat(), e.latLng.lng())));
        loading.dismiss();
        return this.map;
    }

    setClickable(clickable: boolean) {
        if (this.onDevice) {
            this.map.setClickable(clickable);
        }
    }

    platformReady() {
        if (this.onDevice) {
            this.platform.ready();

        }
        return new Promise((resole, reject) => {
            if (typeof google == "undefined" || typeof google.maps == "undefined") {
                loadMapScript(null);//todo fix it
                window['mapInit'] = () => resole(true);
            } else {
                resole(true);
            }
        });
    }

    setRoute(start: LatLng, dest: LatLng) {
        const req = {origin: start, destination: dest, travelMode: google.maps.TravelMode.WALKING};
        this.directionsService.route(req, (res, status) => {
            if (status == google.maps.DirectionsStatus.OK) {
                this.directionsDisplay.setDirections(res);
            }
        })
    }

    onMapClick(): BehaviorSubject<LatLng> {
        return this.mapClickBehavior;
    }

    addMarker(data, position: LatLng, onMarkerCallback, icon) {
        const marker = new google.maps.Marker({
            position: position,
            title: 'Sageloc',
            map: this.map,
            draggable: true,
            animation: google.maps.Animation.DROP,
            optimized: false,
            zIndex: 300,
            markerData: {data},
            icon: {
                size: new google.maps.Size(36, 36),
                scaledSize: new google.maps.Size(32, 32),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(16, 16),
                url: icon,
            }
        });
        // marker.info = new google.maps.InfoWindow({content: userName});
        // marker.info.open(this.map, marker);
        marker.addListener('click', data => {
            onMarkerCallback(data, marker);
        });
        return marker;
        // this.map.setCenter(this.getCenter());
    }

    createNewPathSegments(onLineSegmentCallback) {
        this.newPathSegments = new google.maps.Polyline({
            geodesic: true,
            strokeColor: '#00FF00',
            strokeOpacity: 2.0,
            strokeWeight: 4,
            editable: false,
            map: this.map
        });
        this.newPathSegments.addListener('click', () => onLineSegmentCallback());
    }

    addPointToNewPathSegments(position: LatLng) {
        if (this.newPathSegments) {
            this.newPathSegments.getPath().push(new google.maps.LatLng(position.lat, position.lng));
        }
    }

    removeLastPointFromNewPathSegments() {
        if (this.newPathSegments) {
            this.newPathSegments.getPath().pop();
        }
    }

    getZoomLevel() {
        //todo(dennis) fix it
        return !this.map ? 17 : this.map.getZoom();
    }

    subscribeOnScan(): BehaviorSubject<boolean> {
        return this.startScanBehavior;
    }

    startScan() {
        this.centerMap();
        this.mapScanner.startScan(this.getCenterPosition());
        this.startScanBehavior.next(true);
    }

    stopScan() {
        this.mapScanner.stopScan();
        this.startScanBehavior.next(false);
    }

    addLocationControl() {
        const locationControl = new MapControl('location-control', 'location-control', '', this.map);
        locationControl.onClick(() => this.centerMap());
        this.map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(locationControl.getControlDiv());
    }

    onNewPath() {

        this.stopScan();
        // const turnControl = new MapControl('turn-control', 'turn-control', 'turn', this.map);
        // turnControl.onClick(() => this.mapPathBehavior.next('turn'));
        // this.map.controls[google.maps.ControlPosition.LEFT_CENTER].push(turnControl.getControlDiv());
        //
        // const dangerControl = new MapControl('danger-control', 'danger-control', 'danger', this.map);
        // dangerControl.onClick(() => this.mapPathBehavior.next('danger'));
        // this.map.controls[google.maps.ControlPosition.LEFT_CENTER].push(dangerControl.getControlDiv());

    }

    clearNewPath() {
        // this.map.controls[google.maps.ControlPosition.LEFT_CENTER].clear();
        this.mapClickBehavior.next(null);
        this.stopScan();
    }

    getCenterPosition() {
        const {coords: {latitude, longitude}} = this.locationTracker.location;
        return new LatLng(latitude, longitude);
    }

    centerMap() {
        this.map.setCenter(this.getCenterPosition());
    }

}
