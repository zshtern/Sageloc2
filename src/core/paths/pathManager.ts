import { LogService } from '../../common/service/log/log.service';
import { Path, PathFollowingState } from './path';
import { Injectable } from '@angular/core';
import { LatLng } from '@ionic-native/google-maps';
import { Dynamics } from '../dynamics';
import { MapboxService } from '../../common/service/map/mapbox.service';

import { IPathManagerState, PathManagerStatus } from './pathManagerStateBase';
import { IPathManagerStateTransition, TransitionTypeOptions } from './pathManagerStateTransitions';
import { PathManagerDefiningState } from './pathManagerDefiningState';
import { PathManagerFollowingState } from './pathManagerFollowingState';
import { PathManagerStandbyState } from './pathManagerStandbyState';
import { StorageService } from '../../common/service/storage/storage.service';

@Injectable()
export class PathManager {

    constructor(private logService: LogService,
                private dynamics: Dynamics,
                private mapboxService: MapboxService,
                private storageService: StorageService) {

        PathManagerDefiningState.sTheInstance = new PathManagerDefiningState(this);
        PathManagerFollowingState.sTheInstance = new PathManagerFollowingState();
        PathManagerStandbyState.sTheInstance = new PathManagerStandbyState(this);
        this.states = [PathManagerStandbyState.sTheInstance];
        this.paths = new Map<string, Path>();

        this.dynamics.subscribeOnLocationChange()
            .subscribe(res => this.handleLocationChange(res))

        this.loadPaths();
    }

    loadPaths() {
        return this.storageService.getByType('path')
            .then(data => {
                let pathsCount = 0;
                data.docs.forEach(doc => {
                    if (doc) {
                        console.log(doc)
                        let path: Path = new Path("");
                        path.setData(doc);
                        this.AddPath(path, false);
                        ++pathsCount;
                    }

                });
                this.logService.debug('PM: PathManager initialized: ' + pathsCount);
            });
    }

    GetStatus(): PathManagerStatus {
        return this.GetCurrentState().GetStatus();
    }

    HasPaths(): boolean {
        return this.paths.size > 0;
    }

    IsAtPathsStart(pathNames: string[]): boolean {
        let result: boolean = false;
        pathNames.length = 0;
        this.paths.forEach((path: Path, name: string) => {
            if (path.isAtStartPoint()) {
                pathNames.push(name);
                result = true;
            }
        });
        return result;
    }

    handleLocationChange(res) {
        if (res) {
            const {validUpdate} = res;
            if (validUpdate) {
                this.update();
            }
        }
    }


    // to be called on every dynamics update
    update(): PathFollowingState {
        this.logService.debug(PathManagerStatus[this.GetCurrentState().GetStatus()] + " -> update...");

        let result = this.GetCurrentState().Update();
        this.ApplyTransition(result.transition);
        return result.pathFollowingState;
    }

    // Path following
    StartPathFollowing(pathName: string) {
        this.logService.debug(PathManagerStatus[this.GetCurrentState().GetStatus()] + " -> StartPathFollowing...");
        this.ApplyTransition(this.GetCurrentState().StartPathFollowing(pathName));
    }

    CancelPathFollowing() {
        this.logService.debug(PathManagerStatus[this.GetCurrentState().GetStatus()] + " -> CancelPathFollowing...");
        this.ApplyTransition(this.GetCurrentState().CancelPathFollowing());
    }

    // Path creation

    // returns location of starting point if path definition started successfully, otherwise - null
    StartNewPath(name: string): LatLng {
        this.logService.debug(PathManagerStatus[this.GetCurrentState().GetStatus()] + " -> StartNewPath...");
        this.ApplyTransition(this.GetCurrentState().StartNewPath(name));

        return this.GetCurrentState().GetLastControlPoint();
    }

    // TODO: pass additional information about the control point
    AddNewPathControlPoint(name: string, position?: LatLng) {
        this.logService.debug(PathManagerStatus[this.GetCurrentState().GetStatus()] + " -> AddNewPathControlPoint...");
        this.ApplyTransition(this.GetCurrentState().AddNewPathControlPoint(name, position));
    }

    FinalizeNewPath() {
        this.logService.debug(PathManagerStatus[this.GetCurrentState().GetStatus()] + " -> FinalizeNewPath...");
        this.ApplyTransition(this.GetCurrentState().FinalizeNewPath());
    }

    CancelNewPath() {
        this.logService.debug(PathManagerStatus[this.GetCurrentState().GetStatus()] + " -> CancelNewPath...");
        this.ApplyTransition(this.GetCurrentState().CancelNewPath());
    }

    AddPath(path: Path, shouldStore: boolean = true) {
        if (null === path || undefined === path)
            return;

        let pathName = path.getName();
        if (pathName === "")
            return;

        this.paths.set(pathName, path);
        if (shouldStore) {
            const data = path.getData();
            this.storageService
                .store(data)
                .then(res => {
                    console.log(res);
                });
        }
    }

    // will return undefined if no path with such name exists
    GetPath(name: string): Path {
        return this.paths.get(name);
    }

    private ApplyTransition(transition: IPathManagerStateTransition): void {
        if (transition.GetTransitionType() === TransitionTypeOptions.NoChange) {
            //this.logService.debug("PM: No change in path manager state");
            return;
        }
        else if (transition.GetTransitionType() === TransitionTypeOptions.Pop) {
            if (this.states.length <= 1) {
                throw new Error("Invalid transition - may not remove last state in the stack");
            }
            try {
                this.GetCurrentState().OnExit();
            }
            catch (e) {
                this.logService.debug("PM: Failed to exit state " + PathManagerStatus[this.GetCurrentState().GetStatus()] + " (" + (<Error>e).message + ")");
                return;
            }
            let prevState: IPathManagerState = this.states.pop();
            try {
                this.GetCurrentState().OnEntry();
            }
            catch (e) {
                this.logService.debug("PM: Failed to enter state " + PathManagerStatus[this.GetCurrentState().GetStatus()] + " (" + (<Error>e).message + ")");
                this.states.push(prevState);
                return;
            }
            this.logService.debug("PM: Changed state to " + PathManagerStatus[this.GetCurrentState().GetStatus()]);
        }
        else if (transition.GetTransitionType() === TransitionTypeOptions.Push) {
            try {
                this.GetCurrentState().OnExit();
            }
            catch (e) {
                this.logService.debug("PM: Failed to exit state " + PathManagerStatus[this.GetCurrentState().GetStatus()] + " (" + (<Error>e).message + ")");
                return;
            }
            try {
                transition.GetNewState().OnEntry();
            }
            catch (e) {
                this.logService.debug("PM: Failed to enter state " + PathManagerStatus[transition.GetNewState().GetStatus()] + " (" + (<Error>e).message + ")");
                return;
            }
            this.states.push(transition.GetNewState());
            this.logService.debug("PM: Changed state to " + PathManagerStatus[this.GetCurrentState().GetStatus()]);
        }
        else if (transition.GetTransitionType() === TransitionTypeOptions.Replace) {
            try {
                this.GetCurrentState().OnExit();
            }
            catch (e) {
                this.logService.debug("PM: Failed to exit state " + PathManagerStatus[this.GetCurrentState().GetStatus()] + " (" + (<Error>e).message + ")");
                return;
            }
            try {
                transition.GetNewState().OnEntry();
            }
            catch (e) {
                this.logService.debug("PM: Failed to enter state " + PathManagerStatus[transition.GetNewState().GetStatus()] + " (" + (<Error>e).message + ")");
                return;
            }
            this.states[this.states.length - 1] = transition.GetNewState();
            this.logService.debug("PM: Changed state to " + PathManagerStatus[this.GetCurrentState().GetStatus()]);
        }
        else {
            throw new Error("Unsupported transition type: " + transition.GetTransitionType());
        }
    }

    private GetCurrentState() {
        return this.states[this.states.length - 1];
    }

    private states: IPathManagerState[] = null;
    private paths: Map<string, Path> = null;
}


