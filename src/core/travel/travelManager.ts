import { Geoposition } from '@ionic-native/geolocation';
// import { InjectUtils } from '../../common/utils/inject-utils';
import { LogService } from '../../common/service/log/log.service';
//import { Stepcounter } from '@ionic-native/stepcounter';
import { Dynamics, XY } from '../dynamics';
import { Injectable } from '@angular/core';
// import { LocationTracker } from '../../common/service/location/location-tracker.service';

import { TravelManagerStateBase, TravelManagerStatus, ITravelManagerState } from './travelManagerStateBase';
import { TravelManagerStillState } from './travelManagerStillState';
import { TravelManagerMovingState } from './travelManagerMovingState';
import { TravelManagerStoppedState } from './travelManagerStoppedState';
import { TransitionTypeOptions, ITravelManagerStateTransition } from './travelManagerStateTransitions';
import {IPedometerData} from "@ionic-native/pedometer";
import {sgtimestamp} from "../../common";



@Injectable()
export class TravelManager {

    constructor(private logService: LogService,
                //private stepcounter: Stepcounter,
                private dynamics: Dynamics) {

        TravelManagerStillState.sStillTravelState = new TravelManagerStillState();
        TravelManagerMovingState.sWalkingTravelState = new TravelManagerMovingState(TravelManagerStatus.OnFoot, TravelManagerStateBase.MAX_WALKING_SPEED);
        TravelManagerMovingState.sAccelleratedTravelState = new TravelManagerMovingState(TravelManagerStatus.Accelerated, TravelManagerStateBase.MAX_ACCELERATED_SPEED);
        TravelManagerMovingState.sVehicleTravelState = new TravelManagerMovingState(TravelManagerStatus.InVehicle, TravelManagerStateBase.TOP_SPEED);
        TravelManagerStoppedState.sStoppedTravelState = new TravelManagerStoppedState();

        try {
            TravelManagerStillState.sStillTravelState.onEntry();
        }
        catch (e) {
            // this should not happen. application restart probably is in place.
            this.logService.debug("Failed to enter initial still state");
        }
        this.states = [TravelManagerStillState.sStillTravelState];

        /*this.stepcounter.deviceCanCountSteps()
            .then(
                onSuccess => {
                    this.logService.debug("Step counter is available");
                    this.stepcounter.start(this.stepsStartingOffset)
                        .then(
                            onSuccess => {
                                this.isStepCounterAvailable = true;
                                this.logService.debug('TravelManager initialized (Step counter is started)');
                            },
                            onFailure => {
                                this.isStepCounterAvailable = false;
                                this.logService.debug('TravelManager initialized (Step counter failed to start)');
                            }
                        );
                },
                onFailure => this.logService.debug('TravelManager initialized (Step counter is not available)')
            );*/

      this.intervalHandler = setInterval(() => {
        try {
          this.updatePedometer(this.lastPedometerData);
        } catch (error) {
          console.error(this.prefix, 'Failed to check walking status. Error: ' + error.code + ', message: ' + error.message);
        }
      }, TravelManager.stepCheckInterval);

        this.dynamics.subscribeOnLocationChange()
            .subscribe(res => this.update(res));
    }

    isCollisionRelevant(): boolean {
        return this.isCollisionRel;
    }

    updatePedometer(data: IPedometerData) : boolean {
      try {
          if (null == data)
            return false;

          this.lastPedometerData = data;

        // filter updates by 2 sec
        let currentTime = sgtimestamp();
        //this.logService.debug("updatePedometer: " + currentTime + " - " + data.numberOfSteps);

        if (currentTime - this.stepCounterTime < 2000)
          return false;

        //this.logService.debug("enough time has passed since last steps were counted, checking if this is a real deal");
        if (this.stepCounterUpdateTime == 0) {
          //this.logService.debug("first update since last time we updated counter, keeping it aside for now");

            if (this.isWalking  &&
                currentTime - this.stepCounterTime > TravelManager.stepCheckInterval  &&
                this.stepCounterNum == data.numberOfSteps) {

                this.stepCounterTime = currentTime;
                this.isWalking = false;
                this.logService.debug("detected too long not walking: " + data.numberOfSteps);
            }

          this.stepCounterUpdateTime = currentTime;
          this.stepCounterUpdateNum = data.numberOfSteps;
        }
        else {
          if (currentTime - this.stepCounterUpdateTime > 1000) {
            if (!this.isWalking && this.stepCounterNum < this.stepCounterUpdateNum && this.stepCounterUpdateNum < data.numberOfSteps) {
              this.isWalking = true;
              this.logService.debug("detected walking: " + data.numberOfSteps);
            }
            else if (this.isWalking && this.stepCounterNum == this.stepCounterUpdateNum && this.stepCounterUpdateNum == data.numberOfSteps) {
              this.isWalking = false;
              this.logService.debug("detected not walking: " + data.numberOfSteps);
            }
            this.stepCounterNum = data.numberOfSteps;
            this.stepCounterTime = currentTime;
            this.stepCounterUpdateNum = 0;
            this.stepCounterUpdateTime = 0;
          }
        }
      }
      catch (e) {
        this.logService.debug((<Error>e).message)
        return false;
      }
      return true;
    }

    update(dynamicsResult: { validUpdate: boolean, isSignificantChange: boolean, quadkey: string, tileXY: XY, updatedLocation: Geoposition }): { travelStatus: TravelManagerStatus, isCollRel: boolean } {
        let lastTravelStatus = this.getCurrentState().getStatus();
        let myResult = {travelStatus: lastTravelStatus, isCollRel: false};

        if (null === dynamicsResult  ||  !dynamicsResult.validUpdate)
            return myResult;

        // step counter check
        /*if (this.isStepCounterAvailable) {
            let previousStepsCounter = this.stepCounterNum;
            this.stepcounter.getStepCount().then(steps => {
                this.stepCounterNum = steps;
                // +5 - an arbitrary number of steps - it has observed that step counter can have false positives while device is in still state (on a table),
                // or in vehicle
                if (previousStepsCounter + 5 < this.stepCounterNum) {
                    this.logService.debug("previousStepsCounter: " + previousStepsCounter + ", this.stepCounterNum: " + this.stepCounterNum);
                    this.isWalking = true;
                }
                else {
                    this.isWalking = false;
                }
            });
        }*/

        // accuracy check
        let lowAccuracy: boolean = !this.dynamics.HasValidLocation();
        this.isCollisionRel = myResult.isCollRel = !lowAccuracy;

        /* future use
        // known non travelling places check
        let currentLocation = this.dynamics.GetCurrentLocation();
        if (null !== currentLocation) {
            let isAtKnownPlace: boolean = false;
            this.knownNonTravellingPlaces.forEach((place: Place) => {
                let distance = Dynamics.DistanceBetween2d(currentLocation, place.location);
                if (distance < place.radius) {
                    // we are at known place
                    // TODO: update known place period of day
                    this.isCollisionRelevant = false;
                    return;
                }
            });
        }
        */

        let result = this.getCurrentState().update(this.isWalking, lowAccuracy);
        this.applyTransition(result.transition);
        myResult.travelStatus = result.travelStatus;

        this.logService.debug("travelManager.update: lowAccuracy: " + lowAccuracy + ', collisionRel: ' + this.isCollisionRel + ' ' + TravelManagerStatus[this.getCurrentState().getStatus()]);

        return myResult;
    }

    getStatus(): TravelManagerStatus {
        return this.getCurrentState().getStatus();
    }

    private applyTransition(transition: ITravelManagerStateTransition): void {
        if (transition.GetTransitionType() === TransitionTypeOptions.NoChange) {
            //this.logService.debug("No change in travel manager state");
            return;
        }
        else if (transition.GetTransitionType() === TransitionTypeOptions.Pop) {
            if (this.states.length <= 1) {
                throw new Error("TM: Invalid transition - may not remove last state in the stack");
            }
            try {
                this.getCurrentState().onExit();
            }
            catch (e) {
                this.logService.debug("TM: Failed to exit state " + TravelManagerStatus[this.getCurrentState().getStatus()] + " (" + (<Error>e).message + ")");
                return;
            }
            let prevState: ITravelManagerState = this.states.pop();
            try {
                this.getCurrentState().onEntry();
            }
            catch (e) {
                this.logService.debug("TM: Failed to enter state " + TravelManagerStatus[this.getCurrentState().getStatus()] + " (" + (<Error>e).message + ")");
                this.states.push(prevState); // should call OnEntry again? or OnReEntry?
                return;
            }
            this.logService.debug("TM: Changed state to " + TravelManagerStatus[this.getCurrentState().getStatus()]);
        }
        else if (transition.GetTransitionType() === TransitionTypeOptions.Push) {
            try {
                this.getCurrentState().onExit();
            }
            catch (e) {
                this.logService.debug("TM: Failed to exit state " + TravelManagerStatus[this.getCurrentState().getStatus()] + " (" + (<Error>e).message + ")");
                return;
            }
            try {
                transition.GetNewState().onEntry();
            }
            catch (e) {
                this.logService.debug("TM: Failed to enter state " + TravelManagerStatus[transition.GetNewState().getStatus()] + " (" + (<Error>e).message + ")");
                return;
            }
            this.states.push(transition.GetNewState());
            this.logService.debug("TM: Changed state to " + TravelManagerStatus[this.getCurrentState().getStatus()]);
        }
        else if (transition.GetTransitionType() === TransitionTypeOptions.Replace) {
            try {
                this.getCurrentState().onExit();
            }
            catch (e) {
                this.logService.debug("TM: Failed to exit state " + TravelManagerStatus[this.getCurrentState().getStatus()] + " (" + (<Error>e).message + ")");
                return;
            }
            try {
                transition.GetNewState().onEntry();
            }
            catch (e) {
                this.logService.debug("TM: Failed to enter state " + TravelManagerStatus[transition.GetNewState().getStatus()] + " (" + (<Error>e).message + ")");
                return;
            }
            this.states[this.states.length - 1] = transition.GetNewState();
            this.logService.debug("TM: Changed state to " + TravelManagerStatus[this.getCurrentState().getStatus()]);
        }
        else if (transition.GetTransitionType() === TransitionTypeOptions.PopAndReplace) {
            if (this.states.length <= 1) {
                throw new Error("Invalid transition - may not remove last state in the stack");
            }
            // exit current and pop it
            try {
                this.getCurrentState().onExit();
            }
            catch (e) {
                this.logService.debug("TM: Failed to exit state " + TravelManagerStatus[this.getCurrentState().getStatus()] + " (" + (<Error>e).message + ")");
                return;
            }
            let prevState: ITravelManagerState = this.states.pop();

            // now replace current, if it different from the new state
            if (this.getCurrentState() === transition.GetNewState()) {
                this.logService.debug("TM: Not replacing - already in state " + TravelManagerStatus[this.getCurrentState().getStatus()]);
                return;
            }

            try {
                this.getCurrentState().onExit();
            }
            catch (e) {
                this.logService.debug("TM: Failed to exit state " + TravelManagerStatus[this.getCurrentState().getStatus()] + " (" + (<Error>e).message + ")");
                return;
            }
            try {
                transition.GetNewState().onEntry();
            }
            catch (e) {
                this.logService.debug("TM: Failed to enter state " + TravelManagerStatus[transition.GetNewState().getStatus()] + " (" + (<Error>e).message + ")");
                return;
            }
            this.states[this.states.length - 1] = transition.GetNewState();
            this.logService.debug("TM: Changed state to " + TravelManagerStatus[this.getCurrentState().getStatus()]);
        }
        else if (transition.GetTransitionType() === TransitionTypeOptions.DoublePop) {
            if (this.states.length <= 2) {
                throw new Error("Invalid transition - may not remove 2 last states in the stack");
            }

            // remove first
            try {
                this.getCurrentState().onExit();
            }
            catch (e) {
                this.logService.debug("TM: Failed to exit state " + TravelManagerStatus[this.getCurrentState().getStatus()] + " (" + (<Error>e).message + ")");
                return;
            }
            this.states.pop();

            // remove second
            try {
                this.getCurrentState().onExit();
            }
            catch (e) {
                this.logService.debug("TM: Failed to exit state " + TravelManagerStatus[this.getCurrentState().getStatus()] + " (" + (<Error>e).message + ")");
                return;
            }
            let prevState: ITravelManagerState = this.states.pop();
            try {
                this.getCurrentState().onEntry();
            }
            catch (e) {
                this.logService.debug("TM: Failed to enter state " + TravelManagerStatus[this.getCurrentState().getStatus()] + " (" + (<Error>e).message + ")");
                this.states.push(prevState); // should call OnEntry again? or OnReEntry?
                return;
            }
            this.logService.debug("TM: Changed state to " + TravelManagerStatus[this.getCurrentState().getStatus()]);
        }
        else {
            throw new Error("Unsupported transition type: " + transition.GetTransitionType());
        }
    }

    private getCurrentState() {
        return this.states[this.states.length - 1];
    }

    readonly prefix = '[TM]';

    private static stepCheckInterval = 5000; //ms
    private intervalHandler;

    private states: ITravelManagerState[] = null;

    private isCollisionRel: boolean = false;
    private isWalking: boolean = false;

    /* future use
     onPath: boolean = false;
     knownNonTravellingPlaces: Place[] = [];
     */

    isStepCounterAvailable: boolean = false;
    stepsStartingOffset: number = 0;
    stepCounterNum: number = 0;
    stepCounterTime: number = 0;
    stepCounterUpdateNum: number = 0;
    stepCounterUpdateTime: number = 0;
    walking: boolean = false;
    lastPedometerData = null;

    locationAccuracy: number = 0;
    lowAccuracy: boolean = true;
}
