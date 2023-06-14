import { InjectUtils } from '../../common/utils/inject-utils';
import { LogService } from '../../common/service/log/log.service';
import { Path, PathFollowingState } from './path';
import { Injectable } from '@angular/core';
import { LatLng } from '@ionic-native/google-maps';
import { Dynamics } from '../dynamics';
import { MapboxService } from '../../common/service/map/mapbox.service';

import { IPathManagerState, PathManagerStatus } from './pathManagerStateBase';
import { IPathManagerStateTransition, NoChangeTransition, PopTransition } from './pathManagerStateTransitions';
import { PathManager } from './pathManager';

@Injectable()
export class PathManagerFollowingState {

    private currentPath: Path = null;
    static sTheInstance: PathManagerFollowingState = null;

    constructor() {
        this.logService = InjectUtils.getService(LogService);
        this.dynamics = InjectUtils.getService(Dynamics);
        this.mapService = InjectUtils.getService(MapboxService);
    }

    GetStatus(): PathManagerStatus {
        return PathManagerStatus.PathBeenFollowed;
    }

    SetPath(path: Path): void {
        if (null === path)
            throw new Error("Invalid path to follow");

        this.currentPath = path;
    }

    OnEntry(): void {
        if (null === this.currentPath)
            throw new Error("Invalid path to follow"); // has to be set through SetPath()

        this.currentPath.startFollowing();
    }

    Update(): { pathFollowingState: PathFollowingState, transition: IPathManagerStateTransition } {
        const result = {pathFollowingState: PathFollowingState.NotApplicable, transition: new NoChangeTransition()};

        if (null === this.currentPath)
            throw new Error("Invalid current path to follow - not updated");

        result.pathFollowingState = this.currentPath.checkProgress();
        if (PathFollowingState.OnTrack === result.pathFollowingState) {
            result.transition = new NoChangeTransition();
        } else if (PathFollowingState.Completed === result.pathFollowingState) {
            result.transition = new PopTransition();
        } else if (PathFollowingState.OutOfSchedule === result.pathFollowingState) {
            result.transition = new PopTransition();
        }
        return result;
    }

    OnExit(): void {
        this.currentPath = null;
    }

    // Path following
    StartPathFollowing(name: string): IPathManagerStateTransition {
        return new NoChangeTransition();
    }

    CancelPathFollowing(): IPathManagerStateTransition {
        if (null === this.currentPath)
            throw new Error("Invalid current path to follow - not canceled");

        this.currentPath.cancelFollowing();
        return new PopTransition();
    }

    // Path creation
    StartNewPath(name: string): IPathManagerStateTransition {
        return new NoChangeTransition();
    }

    AddNewPathControlPoint(name: string, position?: LatLng): IPathManagerStateTransition {
        return new NoChangeTransition();
    }

    FinalizeNewPath(): IPathManagerStateTransition {
        return new NoChangeTransition();
    }

    CancelNewPath(): IPathManagerStateTransition {
        return new NoChangeTransition();
    }

    // returns last control point passed on the path
    GetLastControlPoint(): LatLng {
        if (null === this.currentPath)
            return null;

        return this.currentPath.getLastControlPoint();
    }

    protected logService: LogService;
    protected dynamics: Dynamics;
    protected mapService: MapboxService;
}

