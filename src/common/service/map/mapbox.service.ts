import {Injectable} from '@angular/core';
import {Loading, LoadingController, Platform} from 'ionic-angular';
import {BehaviorSubject} from 'rxjs';
import {MapScanner} from '../../components/map/scaner/map-scaner';
import {LocationTracker} from '../location/location-tracker.service';
import {Dynamics} from '../../../core/dynamics';

import * as mapboxgl from 'mapbox-gl';
import {GeoJSONSource, GeolocateControl, LngLat, Map, Marker, NavigationControl} from 'mapbox-gl';
import {NAVIGATION_ICON} from '../../../assets/icon/index';
import {MAP_USER_ID, MAPBOX_TOKEN} from './constants';
import {MapBoxGeolocationMarker} from '../../components/map/location/mapbox-location-marker';

import {MockLocationService} from '../location/mock/mock-location.service';


const ROUTE_SOURCE_ID = 'ROUTE_SOURCE';
const ROUTE_LAYER_ID = 'ROUTE_LAYER';

@Injectable()
export class MapboxService {

  private onDevice: boolean;
  private maps = {};
  private mapScanner: MapScanner;
  mapClickBehavior: BehaviorSubject<LngLat> = new BehaviorSubject(null);
  startScanBehavior: BehaviorSubject<boolean> = new BehaviorSubject(false);
  findFriendBehavior: BehaviorSubject<string> = new BehaviorSubject(null);
  checkPathToFollowBehavior: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private geolocationMarker: MapBoxGeolocationMarker;
  private newPathCoordinates = [];

  constructor(private platform: Platform,
              private locationTracker: LocationTracker,
              private loadingCtrl: LoadingController,
              private mockLocationService: MockLocationService,
              private dynamics: Dynamics) {

    this.onDevice = this.platform.is('cordova');
    console.log('Test 3');
    this.assign(mapboxgl, "accessToken", MAPBOX_TOKEN);
    console.log('Test 4');
  }

  loadMap(mapid): Promise<Map> {
    const loading: Loading = this.loadingCtrl.create({content: 'Please wait...',});
    console.log('Test');
    // @ts-ignore
    return loading.present()
      .then((val) => {
        console.log('Test 5');
        this.initMap(mapid, loading);
      });

  }

  initMap(mapid, loading) {
    return new Promise((resolve, reject) => {
      const {lng, lat} = this.locationTracker.getLocationLatLng();
      // this.mapScanner = new MapScanner(this.map);
      this.maps[mapid] = new Map({
        container: mapid,
        style: 'mapbox://styles/mapbox/streets-v9',
        zoom: 15,
        center: [lng, lat]
      });
      const map = this.maps[mapid];
      this.subscribeOnLocationChange(mapid);

      map.on('click', e => this.mapClickBehavior.next(e.lngLat));
      map.on('load', () => {
        this.geolocationMarker = new MapBoxGeolocationMarker(this.maps[mapid], lng, lat);
        map.addControl(new NavigationControl(), 'bottom-right');
        map.addControl(new GeolocateControl());
        this.addLocationControl();
        loading.dismiss();
        resolve(map);
      });

      map.on('error', (error) => {
        console.error(new Error('Can\'t load map!'));
        loading.dismiss();
        reject(error);
      });
    });
  }

  subscribeOnLocationChange(mapid) {
    if (mapid == MAP_USER_ID) {
      this.mockLocationService.sendLocations();
      this.dynamics.subscribeOnLocationChange()
        .subscribe(result => {
          if (result && this.geolocationMarker) {
            this.geolocationMarker.updatePosition(result.updatedLocation.coords);
            /*let travelStatus = this.travelManager.getStatus();
             if (travelStatus === TravelManagerStatus.Accelerated ||
             travelStatus === TravelManagerStatus.InVehicle)*/
            this.centerMap();
          }
        });
    }
  }

  onMapClick(): BehaviorSubject<LngLat> {
    return this.mapClickBehavior;
  }

  addMarker(data, position: LngLat, onMarkerCallback, icon, map?): Marker {
    const markerElement = MapboxService.getMarkerElement(icon, '');

    const marker = new Marker(markerElement, {offset: [-25, -25]})
      .setLngLat(position)
      .addTo(map ? map : this.maps[MAP_USER_ID]);

    markerElement.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      onMarkerCallback(data, marker)
    });
    return marker;
  }

  createNewPathSegments(onLineSegmentCallback) {
    this.clearPathSegment(this.maps[MAP_USER_ID]);
    const {lat, lng} = this.locationTracker.getLocationLatLng();
    this.newPathCoordinates = [[lng, lat], [lng, lat]];
    this.drawPath(MAP_USER_ID, this.newPathCoordinates)
  }

  drawPath(mapId, coordinates) {
    const sourceData = MapboxService.getSourceData(coordinates);
    this.maps[mapId].addSource(ROUTE_SOURCE_ID, {"type": "geojson", "data": sourceData});

    this.maps[mapId].addLayer({
      "id": ROUTE_LAYER_ID,
      "type": "line",
      'source': ROUTE_SOURCE_ID,
      "layout": {"line-join": "round", "line-cap": "round"},
      "paint": {"line-color": "#00B300", "line-width": 8}
    });
  }

  updateGeoLocationMarker(position) {
    this.geolocationMarker.updatePosition(position);
  }

  clearPathSegment(map) {
    const source = map.getSource(ROUTE_SOURCE_ID);
    const layer = map.getLayer(ROUTE_LAYER_ID);
    if (layer) {
      map.removeLayer(ROUTE_LAYER_ID);
    }
    if (source) {
      map.removeSource(ROUTE_SOURCE_ID);
    }
  }


  addPointToNewPathSegments({lng, lat}) {
    const source = <GeoJSONSource>this.maps[MAP_USER_ID].getSource(ROUTE_SOURCE_ID);
    if (source) {
      this.newPathCoordinates = [...this.newPathCoordinates, [lng, lat]];
      source.setData(MapboxService.getSourceData(this.newPathCoordinates));
    }
  }

  removeLastPointFromNewPathSegments() {
    // if (this.newPathCoordinates) {
    //     this.newPathCoordinates.getPath().pop();
    // }
  }

  getZoomLevel() {
    //todo(dennis) fix it
    return !this.maps[MAP_USER_ID] ? 17 : this.maps[MAP_USER_ID].getZoom();
  }

  subscribeOnScan(): BehaviorSubject<boolean> {
    return this.startScanBehavior;
  }

  subscribeOnFindFriend(): BehaviorSubject<string> {
    return this.findFriendBehavior;
  }

  subscribeOnCheckPathsToFollow(): BehaviorSubject<boolean> {
    return this.checkPathToFollowBehavior;
  }


  onFindFriedByEmail(email) {
    if (email) {
      this.findFriendBehavior.next(email)
    }
  }

  startScan() {
    this.centerMap();
    // this.mapScanner.startScan(this.locationTracker.getLocationLatLng());
    this.startScanBehavior.next(true);
  }

  stopScan() {
    // this.mapScanner.stopScan();
    this.startScanBehavior.next(false);
  }

  checkPathsToFollow() {
    this.checkPathToFollowBehavior.next(true);
  }

  addLocationControl() {
    // const locationControl = new MapControl('location-control', 'location-control', '', this.map);
    // locationControl.onClick(() => this.centerMap());
    // this.map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(locationControl.getControlDiv());
  }

  onNewPath() {
    this.stopScan();
  }

  clearNewPath() {
    this.mapClickBehavior.next(null);
    this.stopScan();
    this.clearPathSegment(this.maps[MAP_USER_ID]);
  }

  centerMap() {
    const {lng, lat} = this.locationTracker.getLocationLatLng();
    this.maps[MAP_USER_ID].flyTo({center: new LngLat(lng, lat)});
  }

  private static getSourceData(coordinates): any {
    return {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "LineString",
        "coordinates": coordinates
      }
    }
  }

  private static getMarkerElement(icon, className) {
    const el = document.createElement('div');
    el.className = className;
    el.style.backgroundImage = `url(${icon})`;
    el.style.width = '50px';
    el.style.height = '50px';
    el.style.backgroundSize = 'cover';
    return el;
  }

  private assign(obj: any, prop: any, value: any) {
    if (typeof prop === "string")
      prop = prop.split(".");

    if (prop.length > 1) {
      let e = prop.shift();
      this.assign(obj[e] =
          Object.prototype.toString.call(obj[e]) === "[object Object]"
            ? obj[e]
            : {},
        prop,
        value);
    } else
      obj[prop[0]] = value;
  }


}
