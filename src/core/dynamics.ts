import {Injectable} from '@angular/core';
import {LogService} from '../common/service/log/log.service';
import {BehaviorSubject} from 'rxjs';
import {LatLng} from '@ionic-native/google-maps';
import {LocationTracker} from '../common/service/location/location-tracker.service';
import {UserService} from '../common/service/user/user.service';
import {StorageService} from '../common/service/storage/storage.service';
import {sgtimestamp} from "../common";
import {TravelManagerStatus} from "./travel/travelManagerStateBase";

const ZERO_SPEED_GROUP = 0;
const LOW_SPEED_GROUP = 1;
const AVERAGE_SPEED_GROUP = 2;
const HIGH_SPEED_GROUP = 3;
const RACE_SPEED_GROUP = 4;

// List of DetectedActivity types that we monitor (based on Android Activity Detection API)
enum MonitoredActivitiesIndex{
    STILL,
    ON_FOOT,
    WALKING,
    RUNNING,
    ON_BICYCLE,
    IN_VEHICLE,
    TILTING,
    UNKNOWN
}

export interface ILocationEvent {
  id: number;
  provider: string;
  locationProvider: number;
  time: number;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number;
  altitude: number;
  bearing: number;
  isFromMockProvider: boolean;
  mockLocationsEnabled: boolean;
}

export interface IGeopositionData {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number;
    altitudeAccuracy: number;
    heading: number;
    speed: number;
  };
  timestamp: number;
}

export class GeopositionData implements IGeopositionData {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number;
    altitudeAccuracy: number;
    heading: number;
    speed: number;
  } = { latitude: 0.0, longitude: 0.0, accuracy: 0.0, altitude: 0.0, altitudeAccuracy: 0.0, heading: 0.0, speed: 0.0 };
  timestamp: number = 0;

  initWithLatLng({lat, lng}) {
    this.coords.latitude = lat;
    this.coords.longitude = lng;
  }

  initWithLocationEvent(location: ILocationEvent) {
    this.coords.latitude = location.latitude;
    this.coords.longitude = location.longitude;
    this.coords.accuracy = location.accuracy;
    this.coords.altitude = location.altitude;
    this.coords.altitudeAccuracy = 0.0;
    this.coords.heading = location.bearing;
    this.coords.speed = location.speed;
    this.timestamp = sgtimestamp(); //location.time is in mode of counting ms from ~1970
  }

  initWithGeopositionData(location: IGeopositionData) {
    this.coords.latitude = location.coords.latitude;
    this.coords.longitude = location.coords.longitude;
    this.coords.accuracy = location.coords.accuracy;
    this.coords.altitude = location.coords.altitude;
    this.coords.altitudeAccuracy = location.coords.altitudeAccuracy;
    this.coords.heading = location.coords.heading;
    this.coords.speed = location.coords.speed;
    this.timestamp = sgtimestamp(); //location.timestamp is in mode of counting ms from ~1970
  }
}


// used to hold two coordinates, 2d or lat/lng
export class XY {
    constructor(X: number, Y: number) {
        this.X = X;
        this.Y = Y;
    }

    X: number = 0.0;
    Y: number = 0.0;
}

// Dynamics internal location class to encapsulate calculation of movement and positioning parameters
export class LocationProjection {
    // lat/long, normalized and corrected have to be always in sync!
    lat: number = 0.0;
    long: number = 0.0;
    normalized: XY = new XY(0, 0); // normalized (0 .. 1) corrected coordinates
    corrected: XY;   // raw coordinates corrected (mercator projection) - could be a projection of raw on alien path, in case of slow objects
    raw: XY;   // mercator projection of raw signal as received in location update

    A: number = 0.0;
    B: number = 0.0;
    direction: boolean = true; // true - object moves along X in positive direction

    velocity: number = 0.0;
    velocity_group: number = ZERO_SPEED_GROUP;

    // auxiliary fields used in calculation optimization
    SUMX: number = 0.0;
    SUMY: number = 0.0;
    X2: number = 0.0;
    XY: number = 0.0;
    SUMX2: number = 0.0;
    SUMXY: number = 0.0;

    timestamp: number = 0; // msecs

    constructor(geo: IGeopositionData) {
        this.lat = geo.coords.latitude;
        this.long = geo.coords.longitude;
        this.normalized = LocationProjection.ProjectMercatorGeodeticTo2dNormalized(new LatLng(this.lat, this.long));
        this.raw = LocationProjection.ScaleToEarth(this.normalized);
        this.corrected = this.raw;
        this.timestamp = geo.timestamp;
        this.X2 = Math.pow(this.corrected.X, 2);
        this.XY = this.corrected.X * this.corrected.Y;
        this.A = geo.coords.heading;
        this.velocity = geo.coords.speed;
    }

    // Canonicalize received latitude and longitude values such that:
    // -90 <= latitude <= +90 - 180 < longitude <= +180
    static Canonicalize(latLng: LatLng) {
        latLng.lat = (latLng.lat + 180) % 360;
        if (latLng.lat < 0) latLng.lat += 360;
        latLng.lat -= 180;

        if (latLng.lat > 90) {
            latLng.lat = 180 - latLng.lat;
            latLng.lng += 180;
        }
        else if (latLng.lat < -90) {
            latLng.lat = -180 - latLng.lat;
            latLng.lng += 180;
        }

        latLng.lng = ((latLng.lng + 180) % 360);
        if (latLng.lng <= 0) latLng.lng += 360;
        latLng.lng -= 180;
    }

    GetTileCoordinatesAtZoom(zoom: number) {
        if (zoom < 0 || zoom > Dynamics.MAX_ZOOM_LEVEL) {
            // console.log('Wrong zoom level: ' + zoom);
            return new XY(0, 0);
        }
        let scale = 1 << zoom;
        return new XY(Math.floor(this.normalized.X * scale), Math.floor(this.normalized.Y * scale));
    }

    GetTileCoordinatesAtMaxZoom() {
        return this.GetTileCoordinatesAtZoom(Dynamics.MAX_ZOOM_LEVEL);
    }

    // https://msdn.microsoft.com/en-us/library/bb259689.aspx
    GetQuadkey() {
        let tileCoord = this.GetTileCoordinatesAtMaxZoom();
        let quadKey = "";
        tileCoord.Y = (2 ** Dynamics.MAX_ZOOM_LEVEL - 1) - tileCoord.Y;

        for (let i = Dynamics.MAX_ZOOM_LEVEL; i > 0; --i) {
            let digit = 0;
            let mask = 1 << (i - 1);

            if ((tileCoord.X & mask) != 0)
                digit += 1;

            if ((tileCoord.Y & mask) != 0)
                digit += 2;

            quadKey += digit.toString();
        }

        return quadKey;
    }

    static ScaleToEarth(normalized: XY) {
        return new XY(Dynamics.EARTH_RADIUS * normalized.X, Dynamics.EARTH_RADIUS * normalized.Y);
    }

    static Normalize(earth: XY) {
        return new XY(earth.X / Dynamics.EARTH_RADIUS, earth.Y / Dynamics.EARTH_RADIUS);
    }

    static ProjectMercatorGeodeticTo2d(geoLocation: LatLng): XY {
        let normalized: XY = LocationProjection.ProjectMercatorGeodeticTo2dNormalized(geoLocation);
        return LocationProjection.ScaleToEarth(normalized);
    }

    static ProjectMercatorGeodeticTo2dNormalized(geoLocation: LatLng): XY {
        let latRadians = Math.min(Math.max(geoLocation.lat, -89.91728), 89.91728); // tan is undefined at +/- pi/2
        latRadians = latRadians * Math.PI / 180;

        let normalizedX = 0.5 + geoLocation.lng / 360; // 0 .. 1
        let normalizedY = 0.5 - Math.log(Math.tan(Math.PI / 4 + latRadians / 2)) / (2 * Math.PI); // 0 .. 1

        return new XY(normalizedX, normalizedY);
    }

    static ProjectMercator2dToGeodetic(projectedLocation: XY): LatLng {
        let normalized: XY = LocationProjection.Normalize(projectedLocation);
        return LocationProjection.ProjectMercator2dNormalizedToGeodetic(normalized);
    }

    static ProjectMercator2dNormalizedToGeodetic(projectedNormalizedLocation: XY): LatLng {
        let latRadians = 2 * Math.atan(Math.pow(Math.E, 2 * Math.PI * (0.5 - projectedNormalizedLocation.Y))) - Math.PI / 2;

        let result: LatLng = new LatLng(latRadians / Math.PI * 180, (projectedNormalizedLocation.X - 0.5) * 360);
        LocationProjection.Canonicalize(result);

        return result;
    }

    // Projects this on a given line. Modifies all location related fields accordingly!
    //
    // from: http://www.cleverstudents.ru/line_and_plane/projection_of_point_onto_line.html
    // (to implement with dot/cross products of vectors see: https://www.topcoder.com/community/data-science/data-science-tutorials/geometry-concepts-basic-concepts/#line_point_distance)
    // given line formula y = Ax + B, or Ax - y + B = 0, and a point (a, b) to project on the line:
    // projection point (px, py) will be defined as follows:
    //  px = (-A(B - b) + a) : (1 + A*A)
    //  py = Ax + B
    // (in case p does not belong to line; this test is done with accuracy of 1cm - should be sufficient for our needs)
    //
    // arguments
    //  lp - line definition by LocationProjection.A/B
    //
    // action
    //  in case this already belongs to the line defined by lp - this is not changed
    //  otherwise this will hold the projected point
    CalculatePointProjectionOnLine(lp: LocationProjection) {
        // check if p belongs to the line
        let yLine = lp.A * this.corrected.X + lp.B;
        if (Math.abs(yLine - this.corrected.Y) < 0.01)
            return;

        this.corrected.X = (-lp.A * (lp.B - this.corrected.Y) + this.corrected.X) / (1 + Math.pow(lp.A, 2));
        this.corrected.Y = lp.A * this.corrected.X + lp.B;

        this.normalized = LocationProjection.Normalize(this.corrected);
        let geodetic: LatLng = LocationProjection.ProjectMercator2dNormalizedToGeodetic(this.normalized);
        this.lat = geodetic.lat;
        this.long = geodetic.lng;
    }
}

@Injectable()
export class Dynamics {

    constructor(private storageService: StorageService,
                private logService: LogService, 
                private locationTracker: LocationTracker,
                private userService: UserService) {

            /* temporarily commented out as background location plugin is tested via its "on()" method
            this.locationTracker.watchPosition()
                .subscribe(position => {
                    const {validUpdate, isSignificantChange, quadkey, tileXY} = this.updateLocation(position);
                    if (validUpdate && isSignificantChange) {
                        // no point to update server if not a significant change
                        const {latitude, longitude, altitude} = position.coords;
                        this.updateServerWithLocation(quadkey, latitude, longitude, altitude, tileXY);
                    }
                });
            */
            this.logService.debug('Dynamics initialized')
    }

    static readonly PIover180 = Math.PI / 180;
    static readonly EARTH_RADIUS = 6378137; // meters
    static readonly MAX_ZOOM_LEVEL = 23;

    static readonly MIN_NON_ZERO_SPEED = 1.0; // m/s
    static readonly LOW_SPEED = 4.0; // m/s
    static readonly AVERAGE_SPEED = 8.0; // m/s
    static readonly HIGH_SPEED = 16.0; // m/s
    static readonly USEIN_BOLT = 12.4; // m/s
    static readonly BRAKING_BAD = 4.572; // m/s

    static readonly MAX_LOCATION_ACC = 1.0; // m - max distance between two locations to consider them the same
    static readonly GPS_ACCURACY_THRESHOLD = 15.0; // m - above this accuracy location updates will be ignored

    static readonly LOW_GPS_ACCURACY_DISTANCE = 50.0; // m - above this distance, covered with last valid speed, last good location is no longer valid
    static readonly LOW_GPS_ACCURACY_FAST_OBJECT_TO = 2.0; // s - above this time, fast objects will have no valid location in case of low acc

    static readonly MAX_DISTANCE_TO_CHECK_COLLISION = 200; // meters - distance between two aliens to check possible collisions
    static readonly MAX_ANGLE_DELTA_TO_ASSUME_SAME_DIR = Math.tan(Math.PI/10); // 18 degrees
    static readonly MAX_DISTANCE_BETWEEN_PARALLEL_PATHS = Dynamics.MAX_ANGLE_DELTA_TO_ASSUME_SAME_DIR * Dynamics.MAX_DISTANCE_TO_CHECK_COLLISION; // ~65 m

    private lastLocation: GeopositionData = null;

    private lastLocations: LocationProjection[] = [];
    static readonly NUMBER_LOCATIONS_FOR_BEARING_CALCULATION = 8;

    currentActivity: MonitoredActivitiesIndex = MonitoredActivitiesIndex.ON_FOOT;
    locationChangeBehavior: BehaviorSubject<any> = new BehaviorSubject(null);

    private user: any = null;

    // Calculations
    static DistanceBetween2d(pointStart: XY, pointEnd: XY) {
        return Math.sqrt(Math.pow(pointEnd.X - pointStart.X, 2) + Math.pow(pointEnd.Y - pointStart.Y, 2));
    }

    static DistanceBetweenLocationProjections(pointStart: LocationProjection, pointEnd: LocationProjection) {
        return Math.sqrt(Math.pow(pointEnd.corrected.X - pointStart.corrected.X, 2) + Math.pow(pointEnd.corrected.Y - pointStart.corrected.Y, 2));
    }

    static DegreesToRadians(degrees: number) {
        return degrees * Dynamics.PIover180;
    }

    static RadiansToDegrees(radians: number) {
        return radians / Dynamics.PIover180;
    }

    /**
     * Returns the (initial) bearing from pointStart to pointEnd.
     *
     * @param   {IGeopositionData} geoStart - Latitude/longitude of destination point.
     * @param   {IGeopositionData} geoEnd - Latitude/longitude of destination point.
     * @returns {number} Initial bearing in degrees from north.
     *
     * @example
     *     double p1 = new LatLon(52.205, 0.119), p2 = new LatLon(48.857, 2.351);
     *     double b1 = p1.bearingTo(p2); // b1.toFixed(1): 156.2
     */
    static BearingGeodeticToGeodetic(geoStart: IGeopositionData, geoEnd: IGeopositionData) {
        let pointStart = new XY(geoStart.coords.latitude, geoStart.coords.longitude);
        let pointEnd = new XY(geoEnd.coords.latitude, geoEnd.coords.longitude);

        let fi1 = Dynamics.DegreesToRadians(pointStart.X), fi2 = Dynamics.DegreesToRadians(pointEnd.X);
        let delta_gamma = Dynamics.DegreesToRadians(pointEnd.Y - pointStart.Y);

        // see http://mathforum.org/library/drmath/view/55417.html
        let y = Math.sin(delta_gamma) * Math.cos(fi2);
        let x = Math.cos(fi1) * Math.sin(fi2) - Math.sin(fi1) * Math.cos(fi2) * Math.cos(delta_gamma);
        let theta = Math.atan2(y, x);

        return (Dynamics.RadiansToDegrees(theta) + 360) % 360;
    }

    /**
     * Returns the distance from pointStart to pointEnd (using haversine formula).
     *
     * @param   {IGeopositionData} geoStart - Latitude/longitude of start point.
     * @param   {IGeopositionData} geoEnd - Latitude/longitude of destination point.
     * @returns {number} Distance between this point and destination point, in same units as earth radius.
     *
     * @example
     *     double p1 = new LatLon(52.205, 0.119), p2 = new LatLon(48.857, 2.351);
     *     double d = p1.distanceTo(p2); // Number(d.toPrecision(4)): 404300
     */
    static DistanceBetweenGeodetic(geoStart: IGeopositionData, geoEnd: IGeopositionData) {
        let pointStart = new XY(geoStart.coords.latitude, geoStart.coords.longitude);
        let pointEnd = new XY(geoEnd.coords.latitude, geoEnd.coords.longitude);

        let fi1 = Dynamics.DegreesToRadians(pointStart.X);
        let gamma1 = Dynamics.DegreesToRadians(pointStart.Y);
        let fi2 = Dynamics.DegreesToRadians(pointEnd.X);
        let gamma2 = Dynamics.DegreesToRadians(pointEnd.Y);
        let delta_fi = fi2 - fi1;
        let delta_gamma = gamma2 - gamma1;

        let a = Math.sin(delta_fi / 2) * Math.sin(delta_fi / 2) + Math.cos(fi1) * Math.cos(fi2) * Math.sin(delta_gamma / 2) * Math.sin(delta_gamma / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Dynamics.EARTH_RADIUS * c;
    }

    // https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
    static distancePointToLine2d(a: number, b: number, point: XY): number
    {
        // formula below is for ax + by + c = 0, in our case we work with y = ax + b
        // so converting it to the first representation we get ax - y + b = 0

        let div = Math.sqrt(Math.pow(a, 2) + 1);
        if (div == 0)
            div = 1e-10;

        return Math.abs(a * point.X - point.Y + b) / div;
    }

    /* 
    Checks if two locationProjections belong to close parallel paths. 
    Relevant to objects located not farther than MAX_DISTANCE_TO_CHECK_COLLISION.
    This still does not work for object on same path, but with a greater distance one from another.
    */
    areTwoPathsCloseAndParallel(first: LocationProjection, second: LocationProjection): boolean {
        if (Math.abs(first.A - second.A) < Dynamics.MAX_ANGLE_DELTA_TO_ASSUME_SAME_DIR) {
            this.logService.debug("Close directions");

            let firstDistanceToSecondPath = Dynamics.distancePointToLine2d(second.A, second.B, first.corrected);
            let secondDistanceToFirstPath = Dynamics.distancePointToLine2d(first.A, first.B, second.corrected);
            if (firstDistanceToSecondPath < Dynamics.MAX_DISTANCE_BETWEEN_PARALLEL_PATHS  &&
                    secondDistanceToFirstPath < Dynamics.MAX_DISTANCE_BETWEEN_PARALLEL_PATHS) {

                this.logService.debug("Close paths");

                /* For future needs

                // check what is the order between the aliens 
                if ((first.XY[0] < second.XY[0] && second.direction) ||
                        (second.XY[0] < first.XY[0] && !second.direction)) {
                    this.logService.debug("Current alien " + first.ID + " follows second " + second.ID);

                    return true;
                }
                */
                return true;
            }
        }
        return false;
    }

    GetCurrentLocationGeodetic() {
        return this.lastLocation;
    }

    HasValidLocation(): boolean {

        if (this.lastLocations.length != Dynamics.NUMBER_LOCATIONS_FOR_BEARING_CALCULATION) {
            this.logService.debug("dynamics.HasValidLocation: not enough updates: " + this.lastLocations.length);
            return false;
        }

        if (this.lastLocation === null || this.lastLocation.coords === null) {
            this.logService.debug("dynamics.HasValidLocation: last location is not initialized");
            return false;
        }

        // make sure last location is not too old:
        let currentTime = sgtimestamp();
        let timeDelta = (this.lastLocation.timestamp - currentTime) / 1000;
        if (this.lastLocation.coords.speed == 0) {
            let tooOld: boolean = timeDelta > Dynamics.LOW_GPS_ACCURACY_DISTANCE; // 50 sec for slow objects (assuming the speed is less than 1 m/s)
            if (tooOld) {
                this.logService.debug("Slow object location is too old: " + timeDelta);
                return false;
            }
        }
        else if (this.lastLocation.coords.speed > Dynamics.LOW_GPS_ACCURACY_DISTANCE / Dynamics.LOW_GPS_ACCURACY_FAST_OBJECT_TO) {
            let tooOld: boolean = timeDelta > Dynamics.LOW_GPS_ACCURACY_FAST_OBJECT_TO;
            if (tooOld) {
                this.logService.debug("Fast object location is too old: " + timeDelta);
                return false;
            }
        }

        let distance: number = this.lastLocation.coords.speed * timeDelta;
        let tooFarAway: boolean = distance > Dynamics.LOW_GPS_ACCURACY_DISTANCE;
        if (tooFarAway) {
            this.logService.debug("Object location is too far away: " + distance);
        }

        return !tooFarAway;
    }

    private HasValidLocationHistory(): boolean {
        return this.lastLocations.length == Dynamics.NUMBER_LOCATIONS_FOR_BEARING_CALCULATION;
    }

    GetCurrentLocationProjection() {
        if (!this.HasValidLocationHistory())
            return null;

        return this.lastLocations[Dynamics.NUMBER_LOCATIONS_FOR_BEARING_CALCULATION - 1];
    }

    // returns current corrected 2d location
    GetCurrentLocation() {
        let currentLP = this.GetCurrentLocationProjection();
        if (null == currentLP)
            return null;

        return currentLP.corrected;
    }

    GetPreviousLocationProjection() {
        if (!this.HasValidLocationHistory())
            return null;

        return this.lastLocations[Dynamics.NUMBER_LOCATIONS_FOR_BEARING_CALCULATION - 2];
    }

    subscribeOnLocationChange() {
        return this.locationChangeBehavior;

    }

    updateLocation(location: IGeopositionData): { validUpdate: boolean, isSignificantChange: boolean, quadkey: string, tileXY: XY, updatedLocation: IGeopositionData } {
        //this.logService.debug("dynamics.updateLocation: " + JSON.stringify((location)));

        const result = {
            validUpdate: false,
            isSignificantChange: false,
            quadkey: '',
            tileXY: new XY(0, 0),
            updatedLocation: location
        };
        let zoom = 17;//todo(dennis) fix it

        // Ignore too rough locations - based on accuracy first
        let accuracy = location.coords.accuracy;
        if (accuracy > Dynamics.GPS_ACCURACY_THRESHOLD) {
            // not issuing to UI as proved to happen from time to time with Google Play services location (jumps from 10 to 96)
            //this.logService.debug("Skipping update with bad accuracy: " + accuracy)
            return result;
        }

        let isCoherentData = this.CalculateBearingAndSpeedBasedOnLastLocations(location);
        if (!isCoherentData) {
            this.logService.debug("Skipping update with wrong velocity");
            return result;
        }

        if (!this.HasValidLocationHistory()) {
            return result;
        }

        result.validUpdate = true;
        result.isSignificantChange = true;

        let currentLP = this.GetCurrentLocationProjection();
        result.updatedLocation.coords.latitude = currentLP.lat;
        result.updatedLocation.coords.longitude = currentLP.long;

        // not clear, if this really needed - anyway this is only for representation on host device
        if (null != this.lastLocation && 0.0 == currentLP.velocity) {
            result.updatedLocation.coords.heading = Dynamics.BearingGeodeticToGeodetic(this.lastLocation, location);
        }

        let prevLP = this.GetPreviousLocationProjection();
        if (prevLP.velocity == 0.0 && currentLP.velocity == 0.0) {
            if (null != this.lastLocation) {
                let distanceToLast = Dynamics.DistanceBetween2d(prevLP.corrected, currentLP.corrected);

                // no point to make frequent updates if object does not move
                if (distanceToLast < Dynamics.MAX_LOCATION_ACC) {
                    result.isSignificantChange = false;
                }
            }
        }

        this.lastLocation = new GeopositionData();
        this.lastLocation.initWithGeopositionData(result.updatedLocation);
        result.quadkey = currentLP.GetQuadkey();
        result.tileXY = currentLP.GetTileCoordinatesAtZoom(zoom);
        this.locationChangeBehavior.next(result);

        return result;
    }

    static calculateLineThroughPoints(firstPoint: XY, secondPoint: XY): { slope: number, yint: number, dir: boolean } {
        const result = {
            slope: 0,
            yint: 0,
            dir: false
        };

        // line formula (y = slope * x + yint)
        let div = secondPoint.X - firstPoint.X;
        if (0.0 == div)
            div = 0.0000001; // arbitrary small to get high slope. this is the case of line of formula: x = XMean

        result.slope = (secondPoint.Y - firstPoint.Y) / div;
        result.yint = secondPoint.Y - result.slope * secondPoint.X;
        result.dir = firstPoint.X < secondPoint.X;

        return result;
    }

    CalculateBearingAndSpeedBasedOnLastLocations(location: IGeopositionData) {
        // convert geodetic coordinates to 2d
        let currentInformation = new LocationProjection(location);
        //this.logService.debug("Raw velocity - cv: " + currentInformation.velocity);

        if ((MonitoredActivitiesIndex.IN_VEHICLE == this.currentActivity ||
            MonitoredActivitiesIndex.ON_BICYCLE == this.currentActivity)
            && this.HasValidLocationHistory()) {
            // ignore not reasonable drops in vehicle velocity, based on stopping distance calculation formula
            // see http://www.csgnetwork.com/stopdistcalc.html
            //      http://www.csgnetwork.com/stopdistinfo.html
            //      http://www.softschools.com/formulas/physics/stopping_distance_formula/89/
            // we assume that normally velocity can decrease at rate of 4.572 m/s (15 feet/s)
            let prevLP = this.GetCurrentLocationProjection();
            let timeDelta = (currentInformation.timestamp - prevLP.timestamp) / 1000; // sec
            if (prevLP.velocity > Dynamics.LOW_SPEED &&
                prevLP.velocity > currentInformation.velocity &&
                timeDelta * Dynamics.BRAKING_BAD < prevLP.velocity - currentInformation.velocity) {
                this.logService.debug("Not reasonable velocity drop: dt: " + timeDelta + ", pv: " + prevLP.velocity + ", cv: " + currentInformation.velocity);
                return false;
            }
        }

        let lastRelevantIndex = 0;
        if (currentInformation.velocity > Dynamics.HIGH_SPEED) {
            currentInformation.velocity_group = RACE_SPEED_GROUP;
            lastRelevantIndex = Dynamics.NUMBER_LOCATIONS_FOR_BEARING_CALCULATION - 1;
        }
        else if (currentInformation.velocity > Dynamics.AVERAGE_SPEED) {
            currentInformation.velocity_group = HIGH_SPEED_GROUP;
            lastRelevantIndex = Dynamics.NUMBER_LOCATIONS_FOR_BEARING_CALCULATION - 2;
        }
        else if (currentInformation.velocity > Dynamics.LOW_SPEED) {
            currentInformation.velocity_group = AVERAGE_SPEED_GROUP;
            lastRelevantIndex = Dynamics.NUMBER_LOCATIONS_FOR_BEARING_CALCULATION - 3;
        }
        else if (currentInformation.velocity > Dynamics.MIN_NON_ZERO_SPEED) {
            currentInformation.velocity_group = LOW_SPEED_GROUP;
        }
        else {
            //this.logService.debug("Almost zero velocity cv: " + currentInformation.velocity);
            currentInformation.velocity = 0.0;
        }

        let previousActivity = this.currentActivity;
        if (this.currentActivity == MonitoredActivitiesIndex.STILL) {
            // we are in STILL case, however if the change in location is too big - we will not trust detected activity -
            // it takes few seconds to correctly adjust the detected activity, we can't wait for so long - for example,
            // in case of high acceleration
            let bigJump = false;
            if (null != this.lastLocation && null != this.lastLocations && this.lastLocations.length > 0) {
                let prevLP = this.lastLocations[this.lastLocations.length - 1];
                let distanceToLast = Dynamics.DistanceBetween2d(prevLP.corrected, currentInformation.corrected);
                if (location.coords.accuracy + this.lastLocation.coords.accuracy < distanceToLast)
                    bigJump = true;
            }

            if (!bigJump) {
                this.logService.debug("On foot with no big jump -> zeroing velocity cv: " + currentInformation.velocity);
                currentInformation.velocity = 0.0;
                currentInformation.velocity_group = ZERO_SPEED_GROUP;
            }
        }
        if (currentInformation.velocity > Dynamics.USEIN_BOLT) {
            this.currentActivity = MonitoredActivitiesIndex.IN_VEHICLE;
        }
        if (previousActivity != this.currentActivity) {
            this.logService.debug("detected activity dynamics: " + MonitoredActivitiesIndex[this.currentActivity]);
        }

        if (this.lastLocations.length == 0) {
            currentInformation.SUMX = currentInformation.raw.X;
            currentInformation.SUMY = currentInformation.raw.Y;
            currentInformation.SUMX2 = currentInformation.X2;
            currentInformation.SUMXY = currentInformation.XY;
        }
        else if (this.lastLocations.length < Dynamics.NUMBER_LOCATIONS_FOR_BEARING_CALCULATION) {
            let newestInformation = this.lastLocations[this.lastLocations.length - 1];

            currentInformation.SUMX = newestInformation.SUMX + currentInformation.raw.X;
            currentInformation.SUMY = newestInformation.SUMY + currentInformation.raw.Y;
            currentInformation.SUMX2 = newestInformation.SUMX2 + currentInformation.X2;
            currentInformation.SUMXY = newestInformation.SUMXY + currentInformation.XY;
        }
        else // we have enough information to build the approximation
        {
            // calculate best fit line for the last location information
            let oldestInformation = this.lastLocations[0];
            let newestInformation = this.GetCurrentLocationProjection();

            currentInformation.SUMX = newestInformation.SUMX + currentInformation.raw.X - oldestInformation.raw.X;
            currentInformation.SUMY = newestInformation.SUMY + currentInformation.raw.Y - oldestInformation.raw.Y;
            currentInformation.SUMX2 = newestInformation.SUMX2 + currentInformation.X2 - oldestInformation.X2;
            currentInformation.SUMXY = newestInformation.SUMXY + currentInformation.XY - oldestInformation.XY;

            if (ZERO_SPEED_GROUP == currentInformation.velocity_group || LOW_SPEED_GROUP == currentInformation.velocity_group) {
                let XMean = currentInformation.SUMX / Dynamics.NUMBER_LOCATIONS_FOR_BEARING_CALCULATION;
                let YMean = currentInformation.SUMY / Dynamics.NUMBER_LOCATIONS_FOR_BEARING_CALCULATION;

                // line formula (y = slope * x + yint)
                let div = currentInformation.SUMX2 - currentInformation.SUMX * XMean;
                if (0.0 == div)
                    div = 0.0000001; // arbitrary small to get high slope. this is the case of line of formula: x = XMean

                let Slope = (currentInformation.SUMXY - currentInformation.SUMX * YMean) / div;
                let YInt = YMean - Slope * XMean;

                currentInformation.A = Slope;
                currentInformation.B = YInt;

                // handle direction
                if (ZERO_SPEED_GROUP == currentInformation.velocity_group)
                    currentInformation.direction = oldestInformation.raw.X < currentInformation.raw.X;
                else
                    currentInformation.direction = newestInformation.raw.X < currentInformation.raw.X;

                // in case of not moving - double check it - find distance covered during last NUMBER_LOCATIONS_FOR_BEARING_CALCULATION
                // along found above line and calculate speed. This will override above based on monitored activities decision (when STILL was detected with high confidence).
                if (ZERO_SPEED_GROUP == currentInformation.velocity_group && ZERO_SPEED_GROUP == oldestInformation.velocity_group) {
                    let timeDelta = (currentInformation.timestamp - oldestInformation.timestamp) / 1000; // sec
                    if (0 != timeDelta) {
                        oldestInformation.CalculatePointProjectionOnLine(currentInformation);
                        currentInformation.CalculatePointProjectionOnLine(currentInformation);

                        let distanceToOldest = Dynamics.DistanceBetween2d(oldestInformation.corrected, currentInformation.corrected);
                        currentInformation.velocity = distanceToOldest / timeDelta;
                        //this.logService.debug("Calculated velocity cv: " + currentInformation.velocity);
                        // even if real velocity is not zero, for our needs it does not matter once it is less than MIN_NON_ZERO_SPEED -
                        // such objects can be treated as STILL
                        if (currentInformation.velocity < Dynamics.MIN_NON_ZERO_SPEED) {
                            currentInformation.velocity = 0.0;
                        }
                    }
                }
            }
            else {
                let lastRelevant = this.lastLocations[lastRelevantIndex];

                const {slope, yint, dir} = Dynamics.calculateLineThroughPoints(lastRelevant.corrected, currentInformation.corrected);
                currentInformation.A = slope;
                currentInformation.B = yint;
                currentInformation.direction = dir;
            }

            this.lastLocations.shift();
        }

        this.lastLocations.push(currentInformation);
        return true;
    }

     updateServerWithLocation(qk, x, y, z, tileXY: XY) {
        const tx = tileXY.X;
        const ty = tileXY.Y;
        this.userService
            .sendUserLocation({qk, x, y, z, tx, ty})
            .subscribe(users => users)
    }


  static convertAndroidActivityToTravelManagerStatus(androidActivity: MonitoredActivitiesIndex): TravelManagerStatus {
      switch(androidActivity) {
        case MonitoredActivitiesIndex.STILL:
          return TravelManagerStatus.Still;

        case MonitoredActivitiesIndex.ON_FOOT:
          return TravelManagerStatus.OnFoot;

        case MonitoredActivitiesIndex.WALKING:
          return TravelManagerStatus.OnFoot;

        case MonitoredActivitiesIndex.RUNNING:
          return TravelManagerStatus.OnFoot;

        case MonitoredActivitiesIndex.ON_BICYCLE:
          return TravelManagerStatus.Accelerated;

        case MonitoredActivitiesIndex.IN_VEHICLE:
          return TravelManagerStatus.InVehicle;

        case MonitoredActivitiesIndex.TILTING:
            return TravelManagerStatus.Unknown;

        case MonitoredActivitiesIndex.UNKNOWN:
            return TravelManagerStatus.Unknown;

          default:
              return TravelManagerStatus.Unknown;
      }
  }

  static convertTravelManagerStatusToAndroidActivity(travelStatus: TravelManagerStatus): MonitoredActivitiesIndex {
        switch (travelStatus) {
            case TravelManagerStatus.Still:
                return MonitoredActivitiesIndex.STILL;

            case TravelManagerStatus.OnFoot:
                return MonitoredActivitiesIndex.ON_FOOT;

            case TravelManagerStatus.Accelerated:
                return MonitoredActivitiesIndex.ON_BICYCLE;

            case TravelManagerStatus.InVehicle:
                return MonitoredActivitiesIndex.ON_BICYCLE;

            case TravelManagerStatus.Stopped:
                return MonitoredActivitiesIndex.UNKNOWN;

            case TravelManagerStatus.Unknown:
                return MonitoredActivitiesIndex.UNKNOWN;

            default:
                return MonitoredActivitiesIndex.UNKNOWN;
        }
  }

  setCurrentActivity(travelStatus: TravelManagerStatus) {
    this.currentActivity = Dynamics.convertTravelManagerStatusToAndroidActivity(travelStatus);
  }
}
