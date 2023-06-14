import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ModalController} from 'ionic-angular';
import {IPedometerData, Pedometer} from "@ionic-native/pedometer";
import {PathManager} from '../../../../core/paths/pathManager';
import {PathManagerStatus} from '../../../../core/paths/pathManagerStateBase';
import {Dynamics, GeopositionData, IGeopositionData, XY} from '../../../../core';
import {TravelManager} from '../../../../core/travel/travelManager';
import {LogService} from '../../../../common/service/log/log.service';
import {Geoposition} from "@ionic-native/geolocation";
import {TravelManagerStatus} from "../../../../core/travel/travelManagerStateBase";
import * as L from 'leaflet';
import 'leaflet.locatecontrol';
import {NAVIGATION_ICON} from '../../../../assets/icon/index';
import {inlineTemplate} from "@ionic/app-scripts/dist/template";
import {GeolocateControl, NavigationControl} from "mapbox-gl";
import {sgtimestamp} from "../../../../common";

// Declare plugin object
declare var BackgroundGeolocation: any;

@IonicPage()
@Component({
  selector: 'page-route-playground',
  templateUrl: 'route-playground.html',
})
export class RoutePlaygroundPage {
  private prefix = 'Route:';

  public nLocation = 0;
  public nStationary = 0;

  public locationSettings = {};
  public isLocationAvailable = false;
  public isLocationRunning = false;
  public isLocationEnabled = false;
  public isLocationAuthorized = 0;

  public steps = {number: 0, distance: 0, up: 0, down: 0};
  public isStepAvailable = false;
  public isStepRunning = false;
  public isPathDefining = false;
  public isPathFollowing = false;

  public lastTravelManagerStatus: TravelManagerStatus = TravelManagerStatus.Unknown;
  public lastLocation: L.LatLng = L.latLng({lat: 31.736605, lng: 35.189889});
  public lastLocationTime: number = 0;
  public lastIsCollRelevant: boolean = false;

  public messages: string[] = [];

  public map: L.Map;
  public mapOptions: any;
  public mapCenter: L.LatLng;
  public path: L.Polyline;
  private pointsList = [];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private pedometer: Pedometer,
              private dynamics: Dynamics,
              private pathManager: PathManager,
              private travelManager: TravelManager,
              private logService: LogService,
              private modalCtrl: ModalController) {

    this.initializeLeaflet();

    if (window['BackgroundGeolocation']) {
      this.isLocationAvailable = true;
      this.log(this.prefix, 'Location available:', true);
      this.locationSettings = {
        locationProvider: BackgroundGeolocation.RAW_PROVIDER,
        desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
        stationaryRadius: 5,
        debug: false,
        distanceFilter: 0,
        stopOnTerminate: false,
        startOnBoot: true,
        interval: 2000,
        fastestInterval: 1000,
        activitiesInterval: 10000,
        stopOnStillActivity: true,
        notificationsEnabled: false,
        startForeground: false,
        notificationTitle: 'SAGELOC background tracking',
        notificationText: 'enabled',
        // notificationIconColor: '#4CAF50',
        // notificationIconLarge: '',
        // notificationIconSmall: '',
        activityType: 'OtherNavigation',
        pauseLocationUpdates: false,
        saveBatteryOnBackground: true,
        url: 'https://us-central1-sageloc-70f8e.cloudfunctions.net/location',
        syncUrl: 'https://us-central1-sageloc-70f8e.cloudfunctions.net/synchronization',
        // syncThreshold: "100",
        // httpHeaders: {
        //   'X-FOO': 'bar'
        // },
        // maxLocations: 10000,
        // customize post properties
        postTemplate: {
          accuracy: "@accuracy",
          altitude: "@altitude",
          altitudeAccuracy: "@altitudeAccuracy",
          bearing: "@bearing",
          latitude: "@latitude",
          locationProvider: "@locationProvider",
          longitude: "@longitude",
          provider: "@provider",
          radius: "@radius",
          speed: "@speed",
          time: "@time",
          user: "unknown"
        }
      };
    }

    // Checks availability
    this.pedometer.isStepCountingAvailable()
      .then((available: boolean) => {
        this.log(this.prefix, 'Location available:', available);
        this.isStepAvailable = available;
      })
      .catch((error: any) => this.error(this.prefix, 'step available', error));
  }

  ionViewDidLoad() {
    void(this);
    console.log('ionViewDidLoad RoutePlaygroundPage');
  }

  ionViewDidLeave() {
    this.stopLocation();
    this.stopStepCounting();
  }

  log(...args: any[]) {
    this.messages.unshift((new Date()).toISOString() + ' - ' + args.join(' '));
    console.log(...args);
  }

  error(...args: any[]) {
    this.messages.unshift((new Date()).toISOString() + ' - ' + args.join(' '));
    console.error(...args
    )
    ;
  }

  initializeLeaflet() {
    this.mapOptions = {
      layers: [
        L.tileLayer('https://{s}tile.sageloc.xyz/{z}/{x}/{y}.png', {maxZoom: 18, attribution: '...'})
      ],
      zoom: 18,
      center: L.latLng({lat: 31.736605, lng: 35.189889})
    };
  }

  onMapReady(map: L.Map) {
    this.mapCenter = this.lastLocation;
    console.log('On Map Ready', map, this.mapCenter, this.mapOptions);
    this.map = map;
    const marker: L.Marker = L.marker(this.mapCenter, {icon: this.getIcon()})
      .addTo(map)
      .on('click', (data) => {
        console.log(data)
      });

    this.path = new L.Polyline(this.pointsList, {color: 'red', weight: 3, opacity: 0.5, smoothFactor: 1})
      .addTo(map)
      .on('click', (data) => {
        console.log(data)
      });

    L.control.locate().addTo(map);

    setInterval(() => {
      if (this.lastLocation.lat != this.mapCenter.lat ||
        this.lastLocation.lng != this.mapCenter.lng) {

        marker.setLatLng(this.lastLocation);

        let pathManagerStatus = this.pathManager.GetStatus();
        if (PathManagerStatus.PathBeenDefined === pathManagerStatus) {
          this.pointsList.push(this.lastLocation);
        }
        //let travelStatus = this.travelManager.getStatus();
        //if (travelStatus === TravelManagerStatus.Accelerated || travelStatus === TravelManagerStatus.InVehicle) {
        this.mapCenter = this.lastLocation;
        this.map.setView(this.mapCenter, this.map.getZoom());
        //}
      }
    }, 2000)
  }

  getIcon() {
    return L.icon({
      iconUrl: NAVIGATION_ICON,
      iconSize: [32, 32], // size of the icon
      iconAnchor: [16, 32], // point of the icon which will correspond to marker's location
      //popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
    });
  }

  start() {
    this.configureLocation(this.locationSettings);
    this.startLocation();
    this.startStepCounting();
  }

  stop() {
    this.stopLocation();
    this.stopStepCounting();
  }

  configureLocation(settings) {
    BackgroundGeolocation.configure(settings, () => {
      this.log(this.prefix, 'configureLocation');
    }, (error) => {
      this.error(this.prefix, 'configureLocation', error)
    });
  }

  handleLocation(location, isStationary: boolean) {
    try {
      BackgroundGeolocation.startTask((taskKey) => {

        if (!(location && typeof location.latitude === 'number')) {
          console.log('latitude not found');
          return;
        }
        if (typeof location.time !== 'number') {
          console.log('time not found');
          return;
        }
        // RAW PROVIDER calls us twice with same data
        if (location.time === this.lastLocationTime)
          return;

        this.lastLocationTime = location.time;

        // we update last location in any case here, even if it has low accuracy - in order to have the map correctly centered.
        this.lastLocation = L.latLng(location.latitude, location.longitude);

        let originalLocation = new GeopositionData();
        originalLocation.initWithLocationEvent(location);

        let zoom = 18;
        const dynamicsResult: { validUpdate: boolean, isSignificantChange: boolean, quadkey: string, tileXY: XY, updatedLocation: IGeopositionData } =
          this.dynamics.updateLocation(originalLocation);

        let distance = Dynamics.DistanceBetweenGeodetic(originalLocation, dynamicsResult.updatedLocation);
        if (0 != distance)
          this.logService.debug(/*"Original location: " + originalLocation.coords.latitude + ", " + originalLocation.coords.longitude +
                      ", updated location: " + dynamicsResult.updatedLocation.coords.latitude + ", " + dynamicsResult.updatedLocation.coords.longitude + ", */"distance: " + distance);

        if (dynamicsResult.isSignificantChange) {
          const qk = dynamicsResult.quadkey;
          const x = dynamicsResult.updatedLocation.coords.latitude;
          const y = dynamicsResult.updatedLocation.coords.longitude;
          const z = dynamicsResult.updatedLocation.coords.altitude;
          const tx = dynamicsResult.tileXY.X;
          const ty = dynamicsResult.tileXY.Y;
          /*messageService.getIds()
            .then(ids => userService.sendUserLocation({uid: ids.userId, qk, x, y, z, tx, ty})
              .subscribe(users => console.log(users))
            );*/

          this.lastLocation = L.latLng(dynamicsResult.updatedLocation.coords.latitude, dynamicsResult.updatedLocation.coords.longitude);
        }

        let intervalToSet = 0;
        if (!isStationary && TravelManagerStatus.Still === this.lastTravelManagerStatus) {
          intervalToSet = 2000;
        } else if (isStationary && TravelManagerStatus.Still !== this.lastTravelManagerStatus) {
          intervalToSet = 10000;
        }

        if (0 != intervalToSet) {
          // per documentation, changes are applied immediately, and it seems we don't need to stop/start service for that. this.stopLocation();
          BackgroundGeolocation.configure({
            interval: intervalToSet
          });
          //this.startLocation();
        }

        BackgroundGeolocation.endTask(taskKey);
      });
    }
    catch (e) {
      this.logService.debug((<Error>e).message)
    }
  }

  startLocation() {
    this.log(this.prefix, 'startLocation');

    this.configureLocation(this.locationSettings);

    BackgroundGeolocation.on('location', (location) => {
      try {
        this.nLocation += 1;

        this.logService.debug("BackgroundGeolocation on location: " + JSON.stringify(location));

        this.handleLocation(location, false);
      }
      catch (e) {
        this.logService.debug((<Error>e).message)
      }
    });

    BackgroundGeolocation.on('stationary', (stationary) => {
      try {
        this.nStationary += 1;

        this.logService.debug("BackgroundGeolocation on stationary: " + JSON.stringify(stationary));

        this.handleLocation(stationary, true);
      }
      catch (e) {
        this.logService.debug((<Error>e).message)
      }
    });

    BackgroundGeolocation.on('background', () => {
      this.log(this.prefix, 'App is in background');
      // you can also reconfigure service (changes will be applied immediately)
      BackgroundGeolocation.configure({debug: true});
    });

    BackgroundGeolocation.on('foreground', () => {
      this.log(this.prefix, 'App is in foreground');
      BackgroundGeolocation.configure({debug: false});
    });

    this.isLocationRunning = true;
    BackgroundGeolocation.start();
    setTimeout(() => {
      this.checkLocationStatus();
    }, 500);


    setInterval(() => {
      try {
        let travelStatus = this.travelManager.getStatus();
        let isCollRel = this.travelManager.isCollisionRelevant();
        if (travelStatus !== this.lastTravelManagerStatus || isCollRel !== this.lastIsCollRelevant) {
          this.log(this.prefix, 'relevant: ' + isCollRel + ', status: ' + TravelManagerStatus[travelStatus]);
          this.lastTravelManagerStatus = travelStatus;
          this.lastIsCollRelevant = isCollRel;
          this.dynamics.setCurrentActivity(travelStatus);
        }
      } catch (error) {
        console.error(this.prefix, 'Failed to check location status. Error: ' + error.code + ', message: ' + error.message);
      }
    }, 2000);
  }

  stopLocation() {
    this.isLocationRunning = false;
    if (window['BackgroundGeolocation']) {
      BackgroundGeolocation.stop();
      BackgroundGeolocation.removeAllListeners();
    }
    setTimeout(() => {
      this.checkLocationStatus();
    }, 500);
  }

  checkLocationStatus() {
    if (window['BackgroundGeolocation']) {
      BackgroundGeolocation.checkStatus((status) => {
        this.isLocationRunning = status.isRunning;
        this.isLocationEnabled = status.locationServicesEnabled;
        this.isLocationAuthorized = status.authorization;
        this.log(this.prefix, 'checkLocationStatus', JSON.stringify(status));
      }, () => {
        this.error(this.prefix, 'checkLocationStatus')
      });
    }
  }

  startStepCounting() {
    this.log(this.prefix, 'startStepCounting');
    this.isStepRunning = true;
    this.pedometer.startPedometerUpdates()
      .subscribe((data: IPedometerData) => {
          this.steps.number = data.numberOfSteps;
          this.steps.distance = data.distance;
          this.steps.up = data.floorsAscended;
          this.steps.down = data.floorsDescended;

          let updated = this.travelManager.updatePedometer(data);
          //if (updated)
          //  this.log(this.prefix, 'steps: ' + data.numberOfSteps);
        },
        (error) => {
          this.error(this.prefix, 'startPedometerUpdates', error);
        },
        () => {
          this.log(this.prefix, 'startPedometerUpdates finished');
        });
  }

  stopStepCounting() {
    this.log(this.prefix, 'stopStepCounting');
    this.pedometer.stopPedometerUpdates()
      .then((data) => {
        this.isStepRunning = false;
        this.log(this.prefix, 'stopPedometerUpdates', data);
      })
      .catch((error) => {
        this.error(this.prefix, 'stopPedometerUpdates', error);
      });
  }

  clearLog() {
    this.messages = [];
  }

  // recursive function to clone an object. If a non object parameter
  // is passed in, that parameter is returned and no recursion occurs.
  static cloneObject(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    let temp = obj.constructor(); // give temp the original obj's constructor
    for (let key in obj) {
      temp[key] = this.cloneObject(obj[key]);
    }

    return temp;
  }

  beginPath() {
    this.pathManager.StartNewPath("ToSchool");
    this.isPathDefining = true;
  }

  endPath() {
    this.pathManager.FinalizeNewPath();
    this.isPathDefining = false;
  }

  followPath() {
    this.pathManager.StartPathFollowing("ToSchool");
    this.isPathFollowing = true;
  }

  deletePath() {
    console.log("not implemented");
  }

  openPluginLog() {
    let profileModal = this.modalCtrl.create('LocationPluginLoggerPage');
    profileModal.present()
      .catch(reason => console.error(reason));
  }
}
