import { Injectable } from '@angular/core';
import { InjectUtils } from '../../common/utils/inject-utils';
import { LogService } from '../../common/service/log/log.service';
import { Dynamics, XY } from '../dynamics';
import { TravelManagerStateBase, TravelManagerStatus } from './travelManagerStateBase';
import { TravelManagerStoppedState } from './travelManagerStoppedState';
import { NoChangeTransition, PushTransition, ReplaceTransition, ITravelManagerStateTransition } from './travelManagerStateTransitions';

@Injectable()
export class TravelManagerMovingState extends TravelManagerStateBase {

    static sWalkingTravelState: TravelManagerMovingState;
    static sAccelleratedTravelState: TravelManagerMovingState;
    static sVehicleTravelState: TravelManagerMovingState;

    constructor(status: TravelManagerStatus, protected topSpeed: number) {
        super(status);
    }

    // basic assumptions:
    //  1) we can't change state from a faster moving to a slower moving without going through stopped and walked. So once for example vehicle is detected, 
    //     we stay in this state until stopped and walked states occurred.
    update(isWalking: boolean, lowAccuracy: boolean): { travelStatus: TravelManagerStatus, transition: ITravelManagerStateTransition } {
        let result = {travelStatus: this.status, transition: new NoChangeTransition()};
        result = super.update(isWalking, lowAccuracy);

        let alreadyInWalkingState: boolean = this.getStatus() === TravelManagerStatus.OnFoot;
        if (lowAccuracy) {
            /*if (isWalking && !alreadyInWalkingState) {
                this.logService.debug("TM: Moving: walking at low acc");
                result.transition = new ReplaceTransition(sWalkingTravelState);
            }*/

            // for now if we only know that accuracy is low - do nothing
            return result;
        }

        let currentVelocity = this.dynamics.GetCurrentLocationProjection().velocity;
        // good location and steps => walking
        /*if (isWalking && !alreadyInWalkingState && currentVelocity < TravelManagerMovingState.MAX_WALKING_SPEED) {
            this.logService.debug("TM: Moving: walking at good acc");
            result.transition = new ReplaceTransition(sWalkingTravelState);
        }*/

        // if we have too high speed - overriding with correct state
        if (currentVelocity > this.topSpeed) {
            if (currentVelocity > TravelManagerStateBase.MAX_ACCELERATED_SPEED) {
                this.logService.debug("TM: Moving: vehicle velocity: " + currentVelocity);
                result.transition = new ReplaceTransition(TravelManagerMovingState.sVehicleTravelState);
            }
            else if (currentVelocity > TravelManagerStateBase.MAX_WALKING_SPEED) {
                this.logService.debug("TM: Moving: accelerated velocity: " + currentVelocity);
                result.transition = new ReplaceTransition(TravelManagerMovingState.sAccelleratedTravelState);
            }
            return result;
        }

        // speed is not too high for this state, check for stoppage
        if (currentVelocity == 0.0 && !isWalking) {
            this.logService.debug("TM: Moving: zero velocity and not walking");
            result.transition = new PushTransition(TravelManagerStoppedState.sStoppedTravelState);
        }
        return result;
    }
}
