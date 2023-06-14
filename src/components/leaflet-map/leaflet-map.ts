import {Component, DoCheck, Input, IterableDiffer, IterableDiffers, OnChanges, OnDestroy, OnInit} from '@angular/core';
import * as L from "leaflet";
import 'leaflet.locatecontrol';
// import {PathManagerStatus} from "../../core/paths/pathManagerStateBase";
import {Logger} from "../../providers/log-manager/log-manager";
import {NAVIGATION_ICON} from "../../assets/icon";

const logger = new Logger('LeafletMapComponent');

export interface MapMarket {
  id: string,
  name: string,
  icon: string,
  lat: number,
  lng: number,
  action: (id: string) => void
}

@Component({
  selector: 'leaflet-map',
  templateUrl: 'leaflet-map.html'
})
export class LeafletMapComponent implements OnInit, OnDestroy, OnChanges, DoCheck {

  @Input() markers: MapMarket[];

  private tileServer = 'https://{s}tile.sageloc.xyz/{z}/{x}/{y}.png';

  public map: L.Map;
  public mapOptions: any;
  public mapCenter: L.LatLng;

  public lastLocation: L.LatLng = L.latLng({lat: 31.736605, lng: 35.189889});
  public path: L.Polyline;
  private pointsList = [];
  private LeafletMarkers = [];

  private markersDif: IterableDiffer<MapMarket>;

  constructor(private differs: IterableDiffers) {
    console.log(logger.debug('Constructed'));
    this.initializeLeaflet();
  }

  ngOnInit() {
    console.log('TEST #2', this.markers);

    this.markersDif = this.differs.find([]).create(null);

    setInterval(() => {
      if (this.markers.length) {
        if (this.LeafletMarkers.length !== this.markers.length) {
          this.updateMarkers();
        } else if (this.LeafletMarkers.length) {
          this.LeafletMarkers.forEach((marker, i) => {
            marker.setLatLng([this.markers[i].lat, this.markers[i].lng]);
          });
        }
      }
    }, 2000);
  }

  ngOnDestroy() {
    console.log('TEST #3');
  }

  ngOnChanges(changes) {
    for (let change in changes) {
      if (change === 'markers') {
        console.log('Test');
      }
    }
  }

  ngDoCheck() {
    // console.log('Do Check');
    let changes = this.markersDif.diff(this.markers);
    if (changes) {
      console.log('Changes detected!');
    }
  }

  initializeLeaflet() {
    this.mapOptions = {
      layers: [L.tileLayer(this.tileServer, {maxZoom: 18, attribution: '...'})],
      zoom: 18,
      center: L.latLng({lat: 31.736605, lng: 35.189889})
    };
  }

  onMapReady(map: L.Map) {
    // this.mapCenter = this.lastLocation;
    console.log('On Map Ready', map, this.mapCenter, this.mapOptions);
    this.map = map;

    console.log('TEST #1', this.markers);

    let lc = L.control.locate().addTo(map);
    // lc.start();

    this.updateMarkers();

    let customControl = L.Control.extend({
      options: {
        position: 'topleft'
      },

      onAdd: (map) => {
        let container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

        let link = L.DomUtil.create('a', 'leaflet-bar-part leaflet-bar-part-single', container);
        L.DomUtil.create('i', 'fa fa-users', link);

        // container.style.backgroundColor = 'white';
        // container.style.backgroundImage = "url(http://t1.gstatic.com/images?q=tbn:ANd9GcR6FCUMW5bPn8C4PbKak2BJQQsmC-K9-mbYBeFZm1ZM2w2GRy40Ew)";
        // container.style.backgroundSize = "30px 30px";
        // container.style.width = '30px';
        // container.style.height = '30px';

        // container.onclick = () => {
        //   console.log('buttonClicked');
        //   let group = L.featureGroup(this.LeafletMarkers);
        //   map.fitBounds(group.getBounds());
        // };

        L.DomEvent
          .on(link, 'click', L.DomEvent.stopPropagation)
          .on(link, 'click', L.DomEvent.preventDefault)
          .on(link, 'click', () => {
            console.log('buttonClicked');
            if (this.LeafletMarkers && this.LeafletMarkers.length) {
              let group = L.featureGroup(this.LeafletMarkers);
              map.fitBounds(group.getBounds());
            }
          })
          .on(link, 'dblclick', L.DomEvent.stopPropagation);

        return container;
      }
    });

    this.map.addControl(new customControl());
    // const marker: L.Marker = L.marker(this.mapCenter, {icon: this.getIcon()})
    //   .addTo(map)
    //   .on('click', (data) => {
    //     console.log(data)
    //   });

    // this.path = new L.Polyline(this.pointsList, {color: 'red', weight: 3, opacity: 0.5, smoothFactor: 1})
    //   .addTo(map)
    //   .on('click', (data) => {
    //     console.log(data)
    //   });

    // setInterval(() => {
    //   if (this.lastLocation.lat != this.mapCenter.lat ||
    //     this.lastLocation.lng != this.mapCenter.lng) {
    //
    //     marker.setLatLng(this.lastLocation);
    //
    //     // let pathManagerStatus = this.pathManager.GetStatus();
    //     // if (PathManagerStatus.PathBeenDefined === pathManagerStatus) {
    //     //   this.pointsList.push(this.lastLocation);
    //     // }
    //     //let travelStatus = this.travelManager.getStatus();
    //     //if (travelStatus === TravelManagerStatus.Accelerated || travelStatus === TravelManagerStatus.InVehicle) {
    //     this.mapCenter = this.lastLocation;
    //     this.map.setView(this.mapCenter, this.map.getZoom());
    //     //}
    //   }
    // }, 2000)
  }

  updateMarkers() {
    if (this.markers && this.markers.length) {
      this.LeafletMarkers = this.markers.map((marker: MapMarket) => {
        return L.marker([marker.lat, marker.lng], {icon: this.getIcon(marker.icon)}).addTo(this.map)
          .bindPopup(marker.name);
        // .on('click', (data) => {
        //   console.log(data)
        // });
      });
    }
  }

  getIcon(url: string): L.Icon {
    return L.icon({
      className: 'friend-marker',
      // iconUrl: NAVIGATION_ICON,
      iconUrl: url || 'assets/img/man.png',
      iconSize: [32, 32], // size of the icon
      iconAnchor: [16, 32], // point of the icon which will correspond to marker's location
      popupAnchor: [0, -16] // point from which the popup should open relative to the iconAnchor
    });
  }
}
