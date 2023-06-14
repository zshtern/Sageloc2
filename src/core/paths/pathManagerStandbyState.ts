import { InjectUtils } from '../../common/utils/inject-utils';
import { LogService } from '../../common/service/log/log.service';
import { Path, PathFollowingState } from './path';
import { Injectable } from '@angular/core';
import { LatLng } from '@ionic-native/google-maps';
import { Dynamics } from '../dynamics';
import { MapboxService } from '../../common/service/map/mapbox.service';

import { IPathManagerState, PathManagerStatus } from './pathManagerStateBase';
import { IPathManagerStateTransition, NoChangeTransition, PushTransition } from './pathManagerStateTransitions';
import { PathManagerFollowingState } from './pathManagerFollowingState';
import { PathManager } from './pathManager';
import { PathManagerDefiningState } from './pathManagerDefiningState';

@Injectable()
export class PathManagerStandbyState {
    
    static sTheInstance: PathManagerStandbyState = null;

    constructor(private pathManager: PathManager) {
        this.logService = InjectUtils.getService(LogService);
        this.dynamics = InjectUtils.getService(Dynamics);
        this.mapService = InjectUtils.getService(MapboxService);
    }

    GetStatus(): PathManagerStatus {
        return PathManagerStatus.Standby;
    }

    OnEntry(): void {
    }

    Update(): { pathFollowingState: PathFollowingState, transition: IPathManagerStateTransition } {
        const result = {pathFollowingState: PathFollowingState.NotApplicable, transition: new NoChangeTransition()};
        return result;
    }

    OnExit(): void {
    }

    // Path following
    StartPathFollowing(name: string): IPathManagerStateTransition {
        let pathToFollow: Path = InjectUtils.getService(PathManager).GetPath(name);//todo(dennis) BIG CRAPE MUST BE REMOVED!!!!
        if (null == pathToFollow)
            return new NoChangeTransition(); // TODO: notify user about not following

        PathManagerFollowingState.sTheInstance.SetPath(pathToFollow);
        return new PushTransition(PathManagerFollowingState.sTheInstance);
    }

    CancelPathFollowing(): IPathManagerStateTransition {
        return new NoChangeTransition();
    }

    // Path creation
    StartNewPath(name: string): IPathManagerStateTransition {
        PathManagerDefiningState.sTheInstance.SetPathName(name);
        return new PushTransition(PathManagerDefiningState.sTheInstance);
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

    GetLastControlPoint(): LatLng {
        return null;
    }

    protected logService: LogService;
    protected dynamics: Dynamics;
    protected mapService: MapboxService;
}
