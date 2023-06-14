import { Injectable } from '@angular/core';
import { InjectUtils } from '../../common/utils/inject-utils';
import { LogService } from '../../common/service/log/log.service';
import { Dynamics, XY } from '../dynamics';
import { TravelManagerStateBase, TravelManagerStatus } from './travelManagerStateBase';
import { TravelManagerMovingState } from './travelManagerMovingState';
import { NoChangeTransition, PushTransition, ITravelManagerStateTransition } from './travelManagerStateTransitions';

@Injectable()
export class TravelManagerStillState extends TravelManagerStateBase  {

    static sStillTravelState: TravelManagerStillState;

    constructor() {
        super(TravelManagerStatus.Still);
    }

    update(isWalking: boolean, lowAccuracy: boolean): { travelStatus: TravelManagerStatus, transition: ITravelManagerStateTransition } {
        let result = {travelStatus: this.status, transition: new NoChangeTransition()};
        result = super.update(isWalking, lowAccuracy);

        if (lowAccuracy) {
            if (isWalking) {
                this.logService.debug("TM: Still: walking at low acc");
                result.transition = new PushTransition(TravelManagerMovingState.sWalkingTravelState);
            }

            // for now if we only know that accuracy is low - do nothing
            return result;
        }

        // good location and steps => walking
        if (isWalking) {
            this.logService.debug("TM: Still: walking at good acc");
            result.transition = new PushTransition(TravelManagerMovingState.sWalkingTravelState);
        }

        // if we have too high speed - this will override walking
        let currentVelocity = this.dynamics.GetCurrentLocationProjection().velocity;
        if (currentVelocity > TravelManagerStateBase.MAX_ACCELERATED_SPEED) {
            this.logService.debug("TM: Still: vehicle velocity: " + currentVelocity);
            result.transition = new PushTransition(TravelManagerMovingState.sVehicleTravelState);
        }
        else if (currentVelocity > TravelManagerStateBase.MAX_WALKING_SPEED) {
            this.logService.debug("TM: Still: accelerated velocity: " + currentVelocity);
            result.transition = new PushTransition(TravelManagerMovingState.sAccelleratedTravelState);
        }
        return result;
    }
}
