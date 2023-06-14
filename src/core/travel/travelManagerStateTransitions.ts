import { ITravelManagerState } from './travelManagerStateBase';

/* future use
 enum WeekDays {
 Sunday,
 Monday,
 Tuesday,
 Wednesday,
 Thursday,
 Friday,
 Saturday
 }

 class PeriodOfDay {
 constructor(public weekDay: WeekDays, public startTime: number, public endTime: number) {
 }
 }

 class Place {
 constructor(public name: string) {
 }

 location = new XY(0, 0);
 radius: number = 50; // meters
 periodOfDays: PeriodOfDay[] = [];
 tags: string[];
 media: any;
 }
 */

export enum TransitionTypeOptions {
    NoChange,
    Pop,
    Push,
    Replace,
    PopAndReplace,
    DoublePop
}

export interface ITravelManagerStateTransition {
    GetTransitionType(): TransitionTypeOptions;
    GetNewState(): ITravelManagerState;
}

export class NoChangeTransition {
    GetTransitionType(): TransitionTypeOptions {
        return TransitionTypeOptions.NoChange;
    }

    GetNewState(): ITravelManagerState {
        return null;
    }
}

export class PopTransition {
    GetTransitionType(): TransitionTypeOptions {
        return TransitionTypeOptions.Pop;
    }

    GetNewState(): ITravelManagerState {
        return null;
    }
}

export class PushTransition {
    constructor(private state: ITravelManagerState) {
        if (!state) {
            throw new Error("state may not be null for a Push Transition");
        }
    }

    GetTransitionType(): TransitionTypeOptions {
        return TransitionTypeOptions.Push;
    }

    GetNewState(): ITravelManagerState {
        return this.state;
    }
}

export class ReplaceTransition {
    constructor(private state: ITravelManagerState) {
        if (!state) {
            throw new Error("state may not be null for a Replace Transition");
        }
    }

    GetTransitionType(): TransitionTypeOptions {
        return TransitionTypeOptions.Replace;
    }

    GetNewState(): ITravelManagerState {
        return this.state;
    }
}

export class PopAndReplaceTransition {
    constructor(private state: ITravelManagerState) {
        if (!state) {
            throw new Error("state may not be null for a PopAndReplace Transition");
        }
    }

    GetTransitionType(): TransitionTypeOptions {
        return TransitionTypeOptions.PopAndReplace;
    }

    GetNewState(): ITravelManagerState {
        return this.state;
    }
}

export class DoublePopTransition {
    GetTransitionType(): TransitionTypeOptions {
        return TransitionTypeOptions.DoublePop;
    }

    GetNewState(): ITravelManagerState {
        return null;
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
