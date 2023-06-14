import { NAVIGATION_ICON } from '../../../../assets/icon/index';
import { LngLat, Map, Marker } from 'mapbox-gl';


export class MapBoxGeolocationMarker {
    private map: Map;
    private marker: Marker;

    constructor(map, lng, lat) {
        this.map = map;

        const el = this.getElement();
        this.marker = new Marker(el, {offset: [-25, -25]})
            .setLngLat([lng, lat])
            .addTo(this.map);
    }

    private getElement() {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundImage = `url(${NAVIGATION_ICON})`;
        el.style.width = '50px';
        el.style.height = '50px';
        el.style.backgroundSize = 'cover';
        el.addEventListener('click', (data) => this.map.rotateTo(10));
        return el;
    }

    updatePosition({latitude, longitude}) {
        if (this.marker) {
            this.marker.setLngLat(new LngLat(longitude, latitude))
        }
    }

}

