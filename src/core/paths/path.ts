import { Dynamics, XY, LocationProjection } from '../../core';
import { InjectUtils } from '../../common/utils/inject-utils';
import { LogService } from '../../common/service/log/log.service';
import { LatLng } from '@ionic-native/google-maps';
import { MapboxService } from '../../common/service/map/mapbox.service';
import {sgtimestamp} from "../../common";

export class PathControlPoint {
    constructor(public name: string) {
    }

    // point - two representations have to be always in sync
    geoLocation: LatLng = null; // recieved from UI
    projectedLocation: XY = null; // projection of geoLocation, needed to optimize calculations - it is much cheeper to check distances on this one

    EAT: number = 0; // msecs
    tags: string[];
    media: any;
}

enum PathStates {
    Undefined,
    BeenDefined,
    Defined,
    BeenFollowed
}

export enum PathFollowingState {
    NotApplicable,
    OnTrack,
    OutOfSchedule,
    OutOfPath,
    Completed
}

export interface PathDataIfc {
    name: string;
    type: string;
    controlPoints: PathControlPoint[];
}

export class Path {
    static readonly TIME_TO_LATE = 30000; // millisec - time to allow for a late arrival to a control point
    static readonly DISTANCE_TO_LOOSE = 50; // m - max allowed distance between current location and path segment which is followed now

    constructor(private name: string) {
        this.logService = InjectUtils.getService(LogService);
        this.dynamics = InjectUtils.getService(Dynamics);
        this.mapService = InjectUtils.getService(MapboxService);
    }

    getName(): string {
        return this.name;
    }

    getState(): PathStates {
        return this.state;
    }

    getData(): PathDataIfc {
        return { 
            name: this.name, 
            type: 'path',
            controlPoints: this.pathControlPoints
        };
    }

    setData(pathData: PathDataIfc): void {
        this.name = pathData.name;
        this.pathControlPoints = pathData.controlPoints;
        this.resetPath();
    }

    // Definition
    startDefinition() {
        if (this.state != PathStates.Undefined)
            return;

        this.state = PathStates.BeenDefined;
        this.addControlPoint("Start");
    }

    handleControlPoint(name: string, currentLocation?: LatLng) {
        if (this.state != PathStates.BeenDefined)
            return;

        this.addControlPoint(name, currentLocation);
    }

    update() {
        if (this.state != PathStates.BeenDefined)
            return;

        this.checkAndAddControlPoint();
    }

    finalizeDefinition() {
        if (this.state != PathStates.BeenDefined)
            return;

        this.addControlPoint("Finish");
        this.state = PathStates.Defined;
    }

    private addControlPoint(name: string, currentLocation?: LatLng) {
        let pcp = new PathControlPoint(name);
        if (currentLocation === undefined) {
            if (!this.dynamics.HasValidLocation())
                throw new Error("Invalid current location - control point is not added");

            pcp.geoLocation = new LatLng(this.dynamics.GetCurrentLocationProjection().lat, this.dynamics.GetCurrentLocationProjection().long);
        }
        else {
            pcp.geoLocation = currentLocation;
        }
        pcp.projectedLocation = LocationProjection.ProjectMercatorGeodeticTo2d(pcp.geoLocation);

        if (null === pcp.geoLocation)
            throw new Error("Invalid current location - control point is not added");

        let currentTime = sgtimestamp();
        if (this.pathControlPoints.length === 0) {
            pcp.EAT = 0;
        } else {
            pcp.EAT = currentTime - this.lastControlPointTime;
        }
        this.lastControlPointTime = currentTime;
        this.pathControlPoints.push(pcp);
        this.mapService.addPointToNewPathSegments({lng: pcp.geoLocation.lng, lat: pcp.geoLocation.lat});
        this.logService.debug("Successfully added control point: " + pcp.name);
    }

    private checkAndAddControlPoint() {
        let currentLocation = this.dynamics.GetCurrentLocationProjection();
        if (null === currentLocation)
            throw new Error("Invalid current location - control point is not added");

        if (this.pathControlPoints.length < 1)
            throw new Error("Invalid control point index");

        let lastControlPoint = this.pathControlPoints[this.pathControlPoints.length - 1];
        if (Dynamics.DistanceBetween2d(lastControlPoint.projectedLocation, currentLocation.corrected) > Dynamics.GPS_ACCURACY_THRESHOLD) {
            this.addControlPoint("internal on distance", new LatLng(currentLocation.lat, currentLocation.long));
        }
        else if (this.lastControlPointTime + 10000 < currentLocation.timestamp) {
            this.addControlPoint("internal on time", new LatLng(currentLocation.lat, currentLocation.long));
        }
    }

    // Following
    isAtStartPoint(): boolean {
        if (this.state != PathStates.Defined)
            return false;

        let currentLocation = this.dynamics.GetCurrentLocationProjection();
        if (null === currentLocation)
            return false;

        let start = this.pathControlPoints[0].projectedLocation;
        return Dynamics.DistanceBetween2d(start, currentLocation.corrected) < Dynamics.GPS_ACCURACY_THRESHOLD;
    }

    startFollowing() {
        if (this.state !== PathStates.Defined)
            throw new Error("Can't start following an undefined path.");

        this.state = PathStates.BeenFollowed;
        this.controlPointIndex = 0;
        if (this.checkControlPoint() !== PathFollowingState.OnTrack)
            throw new Error("Not at start location - can't start following the path.");
    }

    checkProgress(): PathFollowingState {
        if (this.state != PathStates.BeenFollowed)
            throw new Error("Can't update path if not been followed");

        return this.checkControlPoint();
    }

    cancelFollowing() {
        this.resetPath();
    }

    // works both for defining and following states
    getLastControlPoint(): LatLng {
        if (this.state === PathStates.BeenDefined) {
            return this.pathControlPoints[this.pathControlPoints.length - 1].geoLocation;
        }
        if (this.state === PathStates.BeenFollowed) {
            return this.pathControlPoints[this.controlPointIndex - 1].geoLocation;
        }
        return null;
    }

    private checkControlPoint(): PathFollowingState {
        if (this.controlPointIndex < 0 || this.pathControlPoints.length <= this.controlPointIndex)
            throw new Error("Invalid control point index");

        let currentLocation = this.dynamics.GetCurrentLocationProjection();
        if (null === currentLocation)
            return PathFollowingState.NotApplicable;

        let nextControlPoint = this.pathControlPoints[this.controlPointIndex];
        if (Dynamics.DistanceBetween2d(nextControlPoint.projectedLocation, currentLocation.corrected) < Dynamics.GPS_ACCURACY_THRESHOLD) {
            // we've got to next control point

            // TODO: notify with pcp.media
            this.logService.debug("Successfully arrived to next control point: " + nextControlPoint.name);

            if (this.controlPointIndex === this.pathControlPoints.length - 1) {
                this.logService.debug("Path completed");
                this.resetPath();
                return PathFollowingState.Completed;
            }

            // increment control points
            this.lastControlPointTime = sgtimestamp();
            ++this.controlPointIndex;

        } else {
            // not at control point, checking timeout
            let now = sgtimestamp();
            if (this.lastControlPointTime + nextControlPoint.EAT + Path.TIME_TO_LATE < now) {
                // we are late
                // TODO: issue warning to parent
                this.logService.debug("Late to arrive to next control point: " + nextControlPoint.name);
                this.resetPath();
                return PathFollowingState.OutOfSchedule;
            }
            else if (this.isOutOfPath(currentLocation)) {
                // time out not elapsed, checking out of path
                // TODO: issue warning to parent
                this.logService.debug("Out of path before control point: " + nextControlPoint.name);
                this.resetPath();
                return PathFollowingState.OutOfPath;
            }
        }

        return PathFollowingState.OnTrack;
    }

    isOutOfPath(currentLocation: LocationProjection): boolean {
        if (this.controlPointIndex < 1)
            return false; // error realy, the method should not be called when not in path following mode

        const {slope, yint, dir} = Dynamics.calculateLineThroughPoints(
            this.pathControlPoints[this.controlPointIndex - 1].projectedLocation, 
            this.pathControlPoints[this.controlPointIndex].projectedLocation
            );

        return Dynamics.distancePointToLine2d(slope, yint, currentLocation.corrected) > Path.DISTANCE_TO_LOOSE;
    }

    // reset to defined state
    private resetPath() {
        this.state = PathStates.Defined;
        this.controlPointIndex = 0;
    }

    private state: PathStates = PathStates.Undefined;
    private pathControlPoints: PathControlPoint[] = [];

    // used in path following - points on next control point to come
    private controlPointIndex: number = 0;

    private lastControlPointTime: number = 0;

    protected logService: LogService;
    protected dynamics: Dynamics;
    protected mapService: MapboxService;
}

