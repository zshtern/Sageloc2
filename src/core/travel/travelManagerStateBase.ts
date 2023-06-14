import { InjectUtils } from '../../common/utils/inject-utils';
import { LogService } from '../../common/service/log/log.service';
import { Dynamics, XY } from '../dynamics';
import { Injectable } from '@angular/core';
import { ITravelManagerStateTransition, NoChangeTransition } from './travelManagerStateTransitions';
import {sgtimestamp} from "../../common";

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

export enum TravelManagerStatus {
    Still,          // no move for long period of time (like for a whole night)
    OnFoot,         // walking/running - speeds possible for human
    Accelerated,   // not real vehicles: rollers, bicycles, electric devices
    InVehicle,      // real vehicle reaching high speeds
    Stopped,         // temporary stops (for traffic lights etc)
    Unknown
}


export interface ITravelManagerState {
    getStatus(): TravelManagerStatus;

    onEntry(): void;
    update(isWalking: boolean, lowAccuracy: boolean): { travelStatus: TravelManagerStatus, transition: ITravelManagerStateTransition };
    onExit(): void;
}

export abstract class TravelManagerStateBase implements ITravelManagerState {
    static readonly MAX_WALKING_SPEED = 10.0; // m/s - bicycle, rollerblades, skateboard, electric devices
    static readonly MAX_ACCELERATED_SPEED = 30.0; // m/s
    static readonly TOP_SPEED = 2.998e+8; // m/s (light)

    protected constructor(protected status: TravelManagerStatus) {
        this.logService = InjectUtils.getService(LogService);
        this.dynamics = InjectUtils.getService(Dynamics);
    }

    getStatus(): TravelManagerStatus {
        return this.status;
    }

    onEntry(): void {
        this.entranceTime = sgtimestamp();
    }

    update(isWalking: boolean, lowAccuracy: boolean): { travelStatus: TravelManagerStatus, transition: ITravelManagerStateTransition } {
        const result = {travelStatus: this.status, transition: new NoChangeTransition()};

        return result;
    }

    onExit(): void {
    }

    protected entranceTime : number = 0;
    protected logService: LogService;
    protected dynamics: Dynamics;

}
