declare var google;

export class MapScanner {
    private map;
    private scanCircleMarker: any;
    private scanLineMarker: any;
    private animationId;

    constructor(map) {
        this.map = map;
    }

    startScan(center) {
        this.stopScan();
        this.addScanCircleMarker(center);
        this.addScanLineMarker(center);
        this.startAnimation();
    }

    stopScan() {
        if (this.animationId) {
            clearInterval(this.animationId)
        }
        if (this.scanCircleMarker) {
            this.scanCircleMarker.setMap(null);
        }
        if (this.scanLineMarker) {
            this.scanLineMarker.setMap(null);
        }
    }

    addScanCircleMarker(center) {
        this.scanCircleMarker = new google.maps.Marker({
            position: center,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 100,
                strokeWeight: 1,
                fillColor: '#08a0ff',
                strokeOpacity: 0,
                fillOpacity: .2,
                optimized: false,
                zIndex: 100
            },
            map: this.map
        });
    }

    addScanLineMarker(center) {
        this.scanLineMarker = new google.maps.Marker({
            position: center,
            icon: {
                path: ['M0 0 ', (Math.cos(0 / 180)), (Math.sin(0 / 180))].join(' '),
                scale: 100,
                strokeWeight: 1,
                strokeColor: '#1242ff',
                optimized: false,
                zIndex: 100
            },
            map: this.map
        });
    }

    startAnimation() {
        let angle = 0;
        this.animationId = setInterval(() => {
            angle = (angle + 5) % 360;
            let icon = this.scanLineMarker.get('icon');
            icon.path = ['M0 0 ', (Math.cos(Math.PI * angle / 180)), (Math.sin(Math.PI * angle / 180))].join(' ');
            this.scanLineMarker.set('icon', icon);
        }, 100)
    }

}

