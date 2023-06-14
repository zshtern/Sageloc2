import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class UtilsService {

    inBackground: boolean = false;

    constructor(private http: HttpClient) {
      console.log(this.http);
    }

    startWatchBackgroundState() {
        document.addEventListener("resume", () => this.inBackground = false, false);
        document.addEventListener("pause", () => this.inBackground = true, false);
    }

    isInBackground() {
        return this.inBackground;
    }

}
