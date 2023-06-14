import { ViewController } from 'ionic-angular';
import { Component } from '@angular/core';
import { GlMapService } from '../../../../common/service';
import { PathManager } from '../../../../core/paths/pathManager';
import { StateEnum } from '../state/state.enum';
import { MapboxService } from '../../../../common/service/map/mapbox.service';
import { MapBoxPageService } from '../../mapbox/service/mapbox-page.service';

@Component({
    templateUrl: './conf-popover.html'
})
export class ConfPopoverPage {
    isScan: boolean;

    constructor(public viewCtrl: ViewController,
                private glMapService: GlMapService,
                private mapboxService: MapboxService,
                private mapboxPageService: MapBoxPageService,
                private pathManager: PathManager) {

        this.mapboxService
            .subscribeOnScan()
            .subscribe(isScan => this.isScan = isScan)
    }

    startScan() {
        this.mapboxService.startScan();
        this.viewCtrl.dismiss();
    }

    findFriend(){
        this.mapboxPageService.findFriend();
        this.viewCtrl.dismiss();
    }

    stopScan() {
        this.mapboxService.stopScan();
        this.viewCtrl.dismiss();
    }

    newPath() {
        this.viewCtrl.dismiss(StateEnum.NewPath);
    }

    tagPlace() {
        /*let status = this.pathManager.GetStatus();
        if (PathManagerStatus.PathBeenDefined === status) {
            // TODO: get tag from user (and pass it to AddNewPathControlPoint here)
            this.pathManager.AddNewPathControlPoint("Road");
        }
        else {
            // TODO: add new method to pathManager to tag places - will wrap AddNewPathControlPoint in case of path definition state and
            //      will add new POI in other cases
        }*/
        this.mapboxPageService.onTagPlace();
        this.viewCtrl.dismiss();
    }

    followPath() {
        this.mapboxService.checkPathsToFollow();
        this.viewCtrl.dismiss();
    }

    close() {
        this.viewCtrl.dismiss();
    }
}
