export class MapControl {
    id: string;
    map: any;
    cssClass: string;
    controlUI: any;
    controlDiv: any;
    name: string;


    constructor(id: string, cssClass: string, name: string, map) {
        this.id = id;
        this.name = name;
        this.map = map;
        this.cssClass = cssClass;

        this.createControlDiv();
        this.addInner();
        this.addText();

    }

    createControlDiv() {
        this.controlDiv = document.createElement('div');
        this.controlDiv.id = this.id;
        this.controlDiv['index'] = 1;
        this.controlDiv.className = `map-control ${this.cssClass}`;
    }

    addInner() {
        this.controlUI = document.createElement('div');
        this.controlUI.className = `map-control-inner ${this.cssClass}-inner`;
        this.controlDiv.appendChild(this.controlUI);

    }

    addText() {
        const controlText = document.createElement('div');
        const controlTextSpan = document.createElement('div');
        const controlImage = document.createElement('div');
        controlText.className = `map-control-text-container ${this.cssClass}-text-container`;
        controlTextSpan.innerHTML = this.name;
        controlText.appendChild(controlTextSpan);
        controlImage.className = `map-control-image ${this.cssClass}-image`;
        controlText.appendChild(controlImage);
        this.controlUI.appendChild(controlText);
    }

    onClick(callback) {
        this.controlUI.addEventListener('click', () => {
            callback();
        });
    }

    getControlDiv() {
        return this.controlDiv;
    }
}
