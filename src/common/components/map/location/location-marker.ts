import {NAVIGATION_ICON} from '../../../../assets/icon/index';

//!!! It could ne undefined
declare var google;

export class GeolocationMarker {
  private position: any;
  private map: any;
  private marker: any;
  private circle: any;
  private watchId: any = -1;
  private accuracy: number;

  private markerOpts = {
    'map': null,
    'clickable': false,
    'cursor': 'pointer',
    'draggable': false,
    'flat': true,
    'icon': {
      'url': NAVIGATION_ICON,
      'size': new google.maps.Size(36, 36),
      'scaledSize': new google.maps.Size(32, 32),
      'origin': new google.maps.Point(0, 0),
      'anchor': new google.maps.Point(16, 16)
    },
    // This marker may move frequently - don't force canvas tile redraw
    'optimized': false,
    'position': new google.maps.LatLng(0, 0),
    'title': 'Current location',
    'zIndex': 2,
  };

  private circleOpts = {
    'map': null,
    'clickable': false,
    'radius': 50,
    'strokeColor': '1bb6ff',
    'strokeOpacity': .4,
    'fillColor': '61a0bf',
    'fillOpacity': .4,
    'strokeWeight': 1,
    'zIndex': 1
  };

  constructor(map, position) {
    this.map = map;
    this.position = position;
    this.markerOpts.position = position;
    this.markerOpts.map = map;
    // circleOpts.map = map;
    this.marker = new google.maps.Marker(this.markerOpts);
    // this.circle = new google.maps.Circle(circleOpts);
    // this.circle.bindTo('center', this.marker, 'position');
  }

  clearMap(map) {
    this.marker.unbind('position');
    this.circle.unbind('center');
    this.circle.unbind('radius');
    this.position = null;
    this.accuracy = null;
    this.watchId = -1;
    this.marker.setMap(null);
  }

  updatePosition(position) {
    const {latitude, longitude, accuracy} = position.coords;
    const newPosition = new google.maps.LatLng(latitude, longitude);
    this.marker.setPosition(newPosition);
    this.position = newPosition;
  }

}

