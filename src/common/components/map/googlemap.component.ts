import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Platform } from 'ionic-angular';
import { LatLng } from '@ionic-native/google-maps';
import { GlMapService } from '../../service/map/map.service';
import { BehaviorSubject } from 'rxjs';
declare var google;

@Component({
    selector: 'live-google-map',
    templateUrl: 'googlemap.html'
})
export class GoogleMapComponent implements AfterViewInit {
    @Input() id: string = 'map';
    @Input() height: string = '100%';
    @Input() width: string = '100%';
    @Output() init: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('map') mapElement: ElementRef;

    public map: any;
    private onDevice: boolean;

    constructor(private platform: Platform, private glMapService: GlMapService) {
        this.onDevice = this.platform.is('cordova');
    }

    ngAfterViewInit(): void {
        const {nativeElement} = this.mapElement;
        this.glMapService.loadMap(nativeElement).then(map => {
            this.map = map;
            this.init.emit({map: map})
        });
    }

    setClickable(clickable: boolean) {
        this.glMapService.setClickable(clickable);
    }

    setRoute(end: LatLng, start?: LatLng) {
        // let {coords: {latitude, longitude}} = this.glMapService.getCurrentPosition();
        // this.glMapService.setRoute(start || new GoogleMapsLatLng(latitude, longitude), end)
    }

    onMapClick(): BehaviorSubject<any> {
        return this.glMapService.onMapClick();
    }

    stopScan() {
        this.glMapService.stopScan();
    }

    onNewPath() {
        this.glMapService.stopScan();
        return this.glMapService.onNewPath();
    }

    getZoomLevel() {
        return this.map.getZoom();
    }

    getCenter() {
        return this.glMapService.getCenterPosition();
    }


}