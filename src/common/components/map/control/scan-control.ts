export class ScanControl {
    id: string;
    map: any;
    cssClass: string;
    controlUI: any;
    controlDiv: any;


    constructor(id: string, cssClass: string, map) {
        this.id = id;
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
        this.controlDiv.className = this.cssClass;
    }

    addInner() {
        this.controlUI = document.createElement('div');
        this.controlUI.style.backgroundColor = '#fff';
        this.controlUI.style.borderRadius = '3px';
        this.controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        this.controlUI.style.cursor = 'pointer';
        this.controlUI.className = `${this.cssClass}-inner`;
        this.controlDiv.appendChild(this.controlUI);

    }

    addText() {
        const controlText = document.createElement('div');
        controlText.style.color = 'rgb(25,25,25)';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
        controlText.style.fontSize = '16px';
        controlText.style.lineHeight = '38px';
        controlText.style.paddingLeft = '5px';
        controlText.style.paddingRight = '5px';
        controlText.className = `${this.cssClass}-text`;
        controlText.innerHTML = 'Scan';
        this.controlUI.appendChild(controlText);
    }

    onClick(callback) {
        this.controlUI.addEventListener('click', () => {
            callback();
        });
    }

    getControlDiv(){
        return this.controlDiv;
    }



}