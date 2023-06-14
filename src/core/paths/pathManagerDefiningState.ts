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
export class PathManagerDefiningState {

    private currentPathName: string;
    private currentPath: Path = null;
    static sTheInstance: PathManagerDefiningState = null;

    constructor(private pathManager: PathManager) {
        this.logService = InjectUtils.getService(LogService);
        this.dynamics = InjectUtils.getService(Dynamics);
        this.mapService = InjectUtils.getService(MapboxService);
    }

    GetStatus(): PathManagerStatus {
        return PathManagerStatus.PathBeenDefined;
    }

    SetPathName(name: string): void {
        this.currentPathName = name;
    }

    OnEntry(): void {
        this.currentPath = new Path(this.currentPathName);
        this.currentPath.startDefinition();
    }

    Update(): { pathFollowingState: PathFollowingState, transition: IPathManagerStateTransition } {
        const result = {pathFollowingState: PathFollowingState.NotApplicable, transition: new NoChangeTransition()};

        //check here if moved far enough from last control point and then add it to the path, informing subscribers

        if (null === this.currentPath)
            throw new Error("Invalid current path to update");

        try {
            this.currentPath.update();
        }
        catch (e) {
            this.logService.debug('PM: update has failed, path definition canceled (' + (<Error>e).message + ')');
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
        return new NoChangeTransition();
    }

    // Path creation
    StartNewPath(name: string): IPathManagerStateTransition {
        return new NoChangeTransition();
    }

    // TODO: pass additional information about the control point
    AddNewPathControlPoint(name: string, position?: LatLng): IPathManagerStateTransition {
        if (null === this.currentPath)
            throw new Error("PM: Invalid current path to define - control point has not added");

        try {
            this.currentPath.handleControlPoint(name, position);
        }
        catch (e) {
            this.logService.debug('PM: AddNewPathControlPoint has failed, path definition canceled (' + (<Error>e).message + ')');
            return new PopTransition();
        }
        return new NoChangeTransition();
    }

    FinalizeNewPath(): IPathManagerStateTransition {
        if (null === this.currentPath)
            throw new Error("Invalid current path to define - not finalized");

        try {
            this.currentPath.finalizeDefinition();
        }
        catch (e) {
            this.logService.debug('PM: FinalizeNewPath has failed, path definition canceled (' + (<Error>e).message + ')');
            return new PopTransition();
        }

        this.pathManager.AddPath(this.currentPath);
        return new PopTransition();
    }

    CancelNewPath(): IPathManagerStateTransition {
        return new PopTransition();
    }

    // returns last defined control point
    GetLastControlPoint(): LatLng {
        if (null === this.currentPath)
            return null;

        return this.currentPath.getLastControlPoint();
    }

    protected logService: LogService;
    protected dynamics: Dynamics;
    protected mapService: MapboxService;
}

