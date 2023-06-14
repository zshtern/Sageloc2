import { LatLng } from '@ionic-native/google-maps';
declare var google;

const NATIVE_MAP_CONFIG = {
    'backgroundColor': 'white',
    // 'mapType': plugin.google.maps.MapTypeId.HYBRID,
    'controls': {
        'compass': true,
        'myLocationButton': true,
        'indoorPicker': true,
        'zoom': true
    },
    'gestures': {
        'scroll': true,
        'tilt': true,
        'rotate': true,
        'zoom': true
    }
};

export class MapDefConfig {
    private position: LatLng;

    constructor(position: LatLng) {
        this.position = position;
    }

    setPosition(position: LatLng) {
        this.position = position;
    }

    getConfig() {
        return {
            'backgroundColor': 'white',
            'controls': {
                'compass': true,
                'myLocationButton': true,
                'indoorPicker': true,
                'zoom': true
            },
            'gestures': {
                'scroll': true,
                'tilt': true,
                'rotate': true,
                'zoom': true
            },
            'camera': {
                'latLng': this.position,
                'tilt': 30,
                'zoom': 17,
                'bearing': 50
            }
        }
    }

    getMapConfig() {
        return {
            target: this.position,
            center: this.position,
            zoom: 16,
            tilt: 30,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: true,
            rotateControl: true,
            fullscreenControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
    }

}
