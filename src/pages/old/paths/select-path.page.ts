import { Component } from '@angular/core';
import { StorageService } from '../../../common/service/storage/storage.service';

import { Map } from 'mapbox-gl';
import { MapboxService } from '../../../common/service/map/mapbox.service';
import { MapBoxPageService } from '../mapbox/service/mapbox-page.service';
import { MAP_SELECT_PATH_ID } from '../../../common/service/map/constants';

@Component({
    selector: 'select-path-page',
    templateUrl: './select-path.page.html',
})
export class SelectPathPage {

    map: Map;
    mapId = MAP_SELECT_PATH_ID;
    selectedPath;
    paths: Array<any> = [];

    constructor(private storageService: StorageService,
                private mapboxService: MapboxService) {

    }

    //noinspection JSUnusedGlobalSymbols
    ionViewWillEnter() {
        this.storageService
            .getByType('path')
            .then(res => {
                console.log(res);
                this.paths = res.docs;
            });

        this.mapboxService
            .loadMap(MAP_SELECT_PATH_ID)
            .then(map => this.map = map);
    }

    onPathSelect() {
        this.mapboxService.clearPathSegment(this.map);
        this.mapboxService.drawPath(MAP_SELECT_PATH_ID, this.getPathCoords());
        this.mapboxService.updateGeoLocationMarker(this.getStartPosition());
    }

    getPathCoords() {
        const coords = [];
        const {controlPoints} = this.selectedPath;
        controlPoints.forEach(point => {
            const {geoLocation: {lat, lng}} = point;
            coords.push([lng, lat])
        });
        return coords;
    }

    getStartPosition() {
        const {controlPoints} = this.selectedPath;
        const point = controlPoints.filter(point => point.name == 'Start')[0];
        if (point) {
            const {geoLocation: {lat: latitude, lng: longitude}} = point;
            return {latitude, longitude};
        }
        return {latitude: 0, longitude: 0} // todo fix it

    }
}
