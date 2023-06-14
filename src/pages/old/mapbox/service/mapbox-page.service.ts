import { Injectable } from '@angular/core';
import { PathManager } from '../../../../core/paths/pathManager';
import { Dynamics } from '../../../../core/dynamics';
import { Subscription } from 'rxjs';
import { ActionSheetController, ModalController, Platform } from 'ionic-angular';
import { DANGER_ICON, TURN_ICON } from '../../../../assets/icon/index';
import { LatLng } from '@ionic-native/google-maps';
import { MapboxService } from '../../../../common/service/map/mapbox.service';
import { LngLat } from 'mapbox-gl';
import { PathNameModal } from '../components/path/path-name.modal';
import { TagPlaceModal } from '../components/places/tag-place.modal';
import { MockLocationService } from '../../../../common/service/location/mock/mock-location.service';
import { FindFriend } from '../components/find-friend/find-friend';


@Injectable()
export class MapBoxPageService {
    onDevice: boolean;
    private onMapClick: Subscription;
    private newPathMarkers = [];

    constructor(private mapboxService: MapboxService,
                private platform: Platform,
                private pathManager: PathManager,
                private dynamics: Dynamics,
                private modalCtrl: ModalController,
                private mockLocationService: MockLocationService,
                private actionsheetCtrl: ActionSheetController) {

        this.onDevice = this.platform.is('cordova');
    }

    onNewPath(): Promise<boolean> {

        return new Promise((resolve, reject) => {
            if (this.onDevice && !this.dynamics.HasValidLocation()) {
                resolve(false);
            }

            let modal = this.modalCtrl.create(PathNameModal);
            modal.present();
            modal.onDidDismiss(data => {
                if (data) {
                    const pathStart = this.pathManager.StartNewPath(data.name);
                    if (this.onDevice && null === pathStart) {
                        // TODO: issue message to user
                        resolve(false);
                    } else {
                        this.handleNewPath();
                        resolve(true);
                    }
                } else {
                    resolve(false);
                }
            });

        })
    }

    handleNewPath() {
        this.clearPath();
        this.mockLocationService.sendLocations();
        this.mapboxService.createNewPathSegments(() => this.onNewPathClick());
        this.onMapClick = this.mapboxService
            .onMapClick()
            .subscribe(position => {
                if (position && this.dynamics.HasValidLocation()) {
                    let currentPosition = this.dynamics.GetCurrentLocationProjection();
                    this.openControlMenuOnMapClick(new LatLng(currentPosition.lat, currentPosition.long));
                }
            });
    }

    donePathCalc() {
        this.pathManager.FinalizeNewPath();
        this.mockLocationService.clearLocations();
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
        this.mapboxService.clearNewPath();
        this.newPathMarkers.map(marker => marker.remove());
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
        const marker = this.mapboxService.addMarker({},
            new LngLat(position.lng, position.lat),
            (data, marker) => this.onPathMarkerClick(data, marker),
            type === 'danger' ? DANGER_ICON : TURN_ICON
        );

        this.mapboxService.addPointToNewPathSegments(position)

        this.newPathMarkers.push(marker);
    }

    onPathMarkerClick(data, marker) {
        let actionSheet = this.actionsheetCtrl.create({
            title: 'Marker Options',
            cssClass: 'action-sheets-basic-page',
            buttons: [
                {
                    text: 'Remove',
                    icon: 'ios-trash',
                    handler: () => marker.remove()
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
                    handler: () => this.mapboxService.removeLastPointFromNewPathSegments()
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

    onTagPlace(): Promise<boolean> {

        return new Promise((resolve, reject) => {
            if (this.onDevice && !this.dynamics.HasValidLocation()) {
                resolve(false);
            }

            let modal = this.modalCtrl.create(TagPlaceModal);
            modal.present();
            modal.onDidDismiss(data => {
                if (data) {
                    // TODO add places controller
                    console.log("added place tag: " + data.name);
                    resolve(true);
                    /*const pathStart = this.pathManager.StartNewPath(data.name);
                     if (this.onDevice && null === pathStart) {
                     // TODO: issue message to user
                     resolve(false);
                     } else {
                     this.handleNewPath();
                     resolve(true);
                     }*/
                } else {
                    resolve(false);
                }
            });

        })
    }

    findFriend() {
        let modal = this.modalCtrl.create(FindFriend);
        modal.present();
        modal.onDidDismiss(data => this.mapboxService.onFindFriedByEmail(data.email));
    }
}
