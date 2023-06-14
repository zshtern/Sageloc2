import { PathFollowingState } from './path';
import { LatLng } from '@ionic-native/google-maps';

import { IPathManagerStateTransition } from './pathManagerStateTransitions';

export enum PathManagerStatus {
    Standby,
    PathBeenDefined,
    PathBeenFollowed
}

export interface IPathManagerState {
    GetStatus(): PathManagerStatus;

    OnEntry(): void;
    Update(): { pathFollowingState: PathFollowingState, transition: IPathManagerStateTransition };
    OnExit(): void;

    // Path following
    StartPathFollowing(pathName: string): IPathManagerStateTransition;
    CancelPathFollowing(): IPathManagerStateTransition;

    // Path creation
    StartNewPath(name: string): IPathManagerStateTransition;
    AddNewPathControlPoint(name: string, position?: LatLng): IPathManagerStateTransition;
    FinalizeNewPath(): IPathManagerStateTransition;
    CancelNewPath(): IPathManagerStateTransition;

    // works both for defining and following states
    GetLastControlPoint(): LatLng;
}
