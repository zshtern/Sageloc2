import { PathManager } from '../paths/pathManager';
import { PathManagerStatus } from '../paths/pathManagerStateBase';
import { Dynamics, XY } from '../dynamics';
import { TravelManager } from '../travel/travelManager';
import { Geoposition } from '@ionic-native/geolocation';
import { InjectUtils } from '../../common/utils/inject-utils';
import { LogService } from '../../common/service/log/log.service';
import {
    MessageService,
    UserService,
    UtilsService
} from '../../common/service';

export class LocationTest {
    static count: number = 0;

    // recursive function to clone an object. If a non object parameter
    // is passed in, that parameter is returned and no recursion occurs.
    static cloneObject(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
    
        var temp = obj.constructor(); // give temp the original obj's constructor
        for (var key in obj) {
            temp[key] = LocationTest.cloneObject(obj[key]);
        }
    
        return temp;
    }
            
    static advance(location: Geoposition) {
        const logService: LogService = InjectUtils.getService(LogService);
        const utilsService: UtilsService = InjectUtils.getService(UtilsService);
        const messageService: MessageService = InjectUtils.getService(MessageService);
        const userService: UserService = InjectUtils.getService(UserService);
        const dynamics: Dynamics = InjectUtils.getService(Dynamics);
        const pathManager: PathManager = InjectUtils.getService(PathManager);
        const travelManager: TravelManager = InjectUtils.getService(TravelManager);

        let originalLocation = LocationTest.cloneObject(location);
        originalLocation.coords.latitude = location.coords.latitude;
        originalLocation.coords.longitude = location.coords.longitude;

        let zoom = 18;
        const dynamicsResult: {validUpdate: boolean, isSignificantChange: boolean, quadkey: string, tileXY: XY, updatedLocation: Geoposition} = 
            dynamics.updateLocation(location);

        if (dynamicsResult.isSignificantChange)
        {
            const qk = dynamicsResult.quadkey;
            const x = location.coords.latitude;
            const y = location.coords.longitude;
            const z = location.coords.altitude;
            const tx = dynamicsResult.tileXY.X;
            const ty = dynamicsResult.tileXY.Y;
            messageService.getIds()
                .then(ids => userService.sendUserLocation({uid: ids.userId, qk, x, y, z, tx, ty})
                    .subscribe(users => console.log(users))
                );
            pathManager.update();
        }
        
        let distance = Dynamics.DistanceBetweenGeodetic(originalLocation, location);
        console.log("Original location: " + originalLocation.coords.latitude + ", " + originalLocation.coords.longitude + 
                    ", updated location: " + location.coords.latitude + ", " + location.coords.longitude + ", distance: " + distance);

        if (++LocationTest.count < 8)
            return;

        try {
            if (LocationTest.count == 15) {
                pathManager.StartNewPath("School");
                return;
            }
            if (LocationTest.count == 25) {
                pathManager.AddNewPathControlPoint("Danger");
                return;
            }
            if (LocationTest.count == 35) {
                pathManager.AddNewPathControlPoint("Road");
                return;
            }
            if (LocationTest.count == 45) {
                pathManager.FinalizeNewPath();
                return;
            }

            if (LocationTest.count > 45) {
                let status = pathManager.GetStatus();
                if (PathManagerStatus.PathBeenFollowed !== status) 
                {
                    let pathNames: string[] = [];
                    if (pathManager.IsAtPathsStart(pathNames)) {
                        let pathToFollow = pathNames[0];
                        pathManager.StartPathFollowing(pathToFollow);
                    }
                }
            }

/*            let currentProbability = Math.random();
            if (currentProbability > 0.9) {
                pathManager.StartNewPath("School");
            }
            else if (currentProbability > 0.8) {
                pathManager.AddNewPathControlPoint("Danger");
            }
            else if (currentProbability > 0.7) {
                pathManager.CancelNewPath();
            }
            else if (currentProbability > 0.6) {
                pathManager.FinalizeNewPath();
            }
            else if (currentProbability > 0.5) {
                let pathNames: string[] = [];
                if (pathManager.IsAtPathsStart(pathNames)) {
                    let pathToFollow = pathNames[0];
                    pathManager.StartPathFollowing(pathToFollow);
                }
            }
            else if (currentProbability > 0.4) {
                pathManager.CancelPathFollowing();
            }
*/
            let result = travelManager.update(dynamicsResult);
            console.log('travelManager: isCollisionRelevant: ' + result.isCollRel + ', status: ' + result.travelStatus);
        }
        catch (e) {
            logService.debug((<Error>e).message)
        }
    }

    /*
     runTest() {
     this.id = setInterval(() => {
     this.advance();
     }, 1000);
     }

     stopTest() {
     clearInterval(this.id)
     }
     */
}