import { Injectable } from '@angular/core';
import { PathManager } from '../../../../core/paths/pathManager';
import { Dynamics } from '../../../../core/dynamics';
import { Subscription } from 'rxjs';
import { GlMapService } from '../../../../common';
import { ActionSheetController } from 'ionic-angular';
import { DANGER_ICON, TURN_ICON } from '../../../../assets/icon/index';
import { LatLng } from '@ionic-native/google-maps';

declare var google;

@Injectable()
export class HomeService {

    private onMapClick: Subscription;
    private newPathMarkers = [];

    constructor(private glMapService: GlMapService,
                private pathManager: PathManager,
                private dynamics: Dynamics,
                private actionsheetCtrl: ActionSheetController) {
    }

    onNewPath() {
        this.clearPath();

        if (!this.dynamics.HasValidLocation())
            return null;
        
        this.glMapService.createNewPathSegments(() => this.onNewPathClick());
        // TODO: provide real name for the new path
        const pathStart = this.pathManager.StartNewPath("School");
        if (null === pathStart) {
            // TODO: issue message to user
            return null;
        }

        this.onMapClick = this.glMapService
            .onMapClick()
            .subscribe(position => {
                // ignoring position here on purpose - we still want to associate the new control point with current position
                if (position !== null  &&  this.dynamics.HasValidLocation()) {
                    let currentPosition = this.dynamics.GetCurrentLocationProjection();
                    this.openControlMenuOnMapClick(new google.maps.LatLng(currentPosition.lat, currentPosition.long));
                }
            });
        return 1;
    }

    donePathCalc() {
        this.pathManager.FinalizeNewPath();
        this.clearPath();
    }

    cancelPathCalc() {
        this.pathManager.CancelNewPath();
        this.clearPath();

    }

    private clearPath() {
        if (this.onMapClick) {
            this.onMapClick.unsubscribe();
        }
        this.glMapService.clearNewPath();
        this.newPathMarkers.map(marker => marker.setMap(null));
        this.newPathMarkers = [];
    }


    openControlMenuOnMapClick(position: LatLng) {
        let actionSheet = this.actionsheetCtrl.create({
            title: 'Add Marker:',
            cssClass: 'control-add-menu',
            buttons: [
                {
                    text: 'Danger',
                    icon: 'ios-warning-outline',
                    handler: () => this.onControlMarkerAdd('danger', position)
                },
                /*{
                    text: 'Turn',
                    icon: 'ios-return-right',
                    handler: () => this.onControlMarkerAdd('turn', position)
                },*/
                {
                    text: 'Cancel',
                    role: 'cancel',
                    icon: 'close',
                    handler: () => console.log('Cancel clicked')
                }
            ]
        });
        actionSheet.present();
    }

    onControlMarkerAdd(type: string, position: LatLng) {
        this.pathManager.AddNewPathControlPoint(type, position);
        const marker = this.glMapService.addMarker({},
            position,
            (data, marker) => this.onPathMarkerClick(data, marker),
            type === 'danger' ? DANGER_ICON : TURN_ICON
        );
        this.newPathMarkers.push(marker);
        //todo(dennis) remove this
        //this.glMapService.addPointToNewPathSegments(position)
    }

    onPathMarkerClick(data, marker) {
        let actionSheet = this.actionsheetCtrl.create({
            title: 'Marker Options',
            cssClass: 'action-sheets-basic-page',
            buttons: [
                {
                    text: 'Remove',
                    icon: 'ios-trash',
                    handler: () => marker.setMap(null)
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    icon: 'close',
                    handler: () => console.log('Cancel clicked')
                }
            ]
        });
        actionSheet.present();
    }

    onUserMarkerClick(marker: any, connectCallback) {
        const {markerData: {data}} = marker;
        let actionSheet = this.actionsheetCtrl.create({
            title: data.name(),
            cssClass: 'action-sheets-basic-page',
            buttons: [
                {
                    text: 'Connect',
                    icon: 'contacts',
                    handler: () => connectCallback(data)
                },
                {
                    text: 'Favorite',
                    icon: 'heart-outline',
                    handler: () => console.log('Favorite clicked')
                },
                {
                    text: 'Cancel',
                    role: 'cancel', // will always sort to be on the bottom
                    icon: 'close',
                    handler: () => console.log('Cancel clicked')
                }
            ]
        });
        actionSheet.present();
    }

    onNewPathClick() {
        let actionSheet = this.actionsheetCtrl.create({
            title: 'New Path Options',
            cssClass: 'action-sheets-basic-page',
            buttons: [
                {
                    text: 'Remove',
                    icon: 'ios-trash',
                    handler: () => this.glMapService.removeLastPointFromNewPathSegments()
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    icon: 'close',
                    handler: () => console.log('Cancel clicked')
                }
            ]
        });
        actionSheet.present();
    }

}
