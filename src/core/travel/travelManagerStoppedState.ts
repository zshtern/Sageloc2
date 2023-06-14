import { Injectable } from '@angular/core';
import { InjectUtils } from '../../common/utils/inject-utils';
import { LogService } from '../../common/service/log/log.service';
import { Dynamics, XY } from '../dynamics';
import { TravelManagerStateBase, TravelManagerStatus } from './travelManagerStateBase';
import { TravelManagerMovingState } from './travelManagerMovingState';
import { NoChangeTransition, PopTransition, PopAndReplaceTransition, DoublePopTransition, ITravelManagerStateTransition } from './travelManagerStateTransitions';
import {sgtimestamp} from "../../common";

@Injectable()
export class TravelManagerStoppedState extends TravelManagerStateBase {
    static readonly MAX_STOPPAGE_TIME = 120000; // 2m (ms)
    static sStoppedTravelState: TravelManagerStoppedState;

    constructor() {
        super(TravelManagerStatus.Stopped);
    }

    update(isWalking: boolean, lowAccuracy: boolean): { travelStatus: TravelManagerStatus, transition: ITravelManagerStateTransition } {
        let result = {travelStatus: this.status, transition: new NoChangeTransition()};
        result = super.update(isWalking, lowAccuracy);

        if (isWalking) {
            this.logService.debug("TM: Stopped: walking");
            result.transition = new PopAndReplaceTransition(TravelManagerMovingState.sWalkingTravelState);
            // step counter can lie in vehicle, so we need to check speed too => no: return result;
        }

        if (lowAccuracy) {
            // for now if we only know that accuracy is low - do no gps based checks
            return result;
        }

        let currentVelocity = this.dynamics.GetCurrentLocationProjection().velocity;
        if (currentVelocity == 0.0) {
            let now = sgtimestamp();
            if (now - this.entranceTime > TravelManagerStoppedState.MAX_STOPPAGE_TIME) {
                this.logService.debug("TM: Stopped: too long -> still");
                result.transition = new DoublePopTransition(); // getting back to still
            }
        } else {
            this.logService.debug("TM: Stopped: moving");
            // back to last moving state
            result.transition = new PopTransition();
        }

        return result;
    }
}
