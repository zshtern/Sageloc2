import { IPathManagerState } from './pathManagerStateBase';

export enum TransitionTypeOptions {
    NoChange,
    Pop,
    Push,
    Replace
}

export interface IPathManagerStateTransition {
    GetTransitionType(): TransitionTypeOptions;
    GetNewState(): IPathManagerState;
}

export class NoChangeTransition {
    GetTransitionType(): TransitionTypeOptions {
        return TransitionTypeOptions.NoChange;
    }

    GetNewState(): IPathManagerState {
        return null;
    }
}

export class PopTransition {
    GetTransitionType(): TransitionTypeOptions {
        return TransitionTypeOptions.Pop;
    }

    GetNewState(): IPathManagerState {
        return null;
    }
}

export class PushTransition {
    constructor(private state: IPathManagerState) {
        if (!state) {
            throw new Error("state may not be null for a Push Transition");
        }
    }

    GetTransitionType(): TransitionTypeOptions {
        return TransitionTypeOptions.Push;
    }

    GetNewState(): IPathManagerState {
        return this.state;
    }
}

export class ReplaceTransition {
    constructor(private state: IPathManagerState) {
        if (!state) {
            throw new Error("state may not be null for a Replace Transition");
        }
    }

    GetTransitionType(): TransitionTypeOptions {
        return TransitionTypeOptions.Replace;
    }

    GetNewState(): IPathManagerState {
        return this.state;
    }
}
/*
 export class TimeBasedTransitiveState {
 constructor(
 private status: StatusOptions,
 private timeSlicesToWaitFor: number,
 private nextTransition: IAmAStateTransition) {
 if (!nextTransition) {
 throw new Error("nextTransition may not be null for a Push Transition");
 }
 if (timeSlicesToWaitFor <= 0) {
 throw new Error("timeSlicesToWaitFor must be a positive value");
 }
 }
 GetStatus(): StatusOptions {
 return this.status;
 }
 update(): IAmAStateTransition {
 if (this.timeSlicesToWaitFor === 1) {
 return this.nextTransition;
 }
 return new ReplaceTransition(
 new TimeBasedTransitiveState(
 this.status,
 this.timeSlicesToWaitFor - 1,
 this.nextTransition
 )
 );
 }
 }
 */
