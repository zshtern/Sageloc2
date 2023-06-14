import { Subject } from 'rxjs/Subject';
import { Injectable } from '@angular/core';

@Injectable()
export class SideMenuService {

    menuEventSource = new Subject<boolean>();
    onMenuEvent$ = this.menuEventSource.asObservable();

    constructor() {
    }

    menuClose() {
        this.menuEventSource.next(false);
    }

    menuOpen() {
        this.menuEventSource.next(true);
    }

}
