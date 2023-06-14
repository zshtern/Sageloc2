import { Component } from '@angular/core';
import 'rxjs/add/operator/filter';
import { LogService } from '../../../common/service/log/log.service';

declare var google;
const logBulk = 20;


@Component({
    selector: 'log-page',
    templateUrl: 'log.html',
})
export class LogPage {


    log: any = [];
    index = 0;

    constructor(private logService: LogService) {

    }

    ionViewDidEnter() {
        // this.getLog(true);

    }


    addLogMessage() {
        this.logService.debug(`some message`)
    }

    doInfinite(infiniteScroll) {
        return this.getLog();

    }


    getLog(clear?) {
        if (clear) {
            this.logService.clearCache();
        }
        return this.logService.getLog(this.index, logBulk)
            .then(log => {
                this.log = [...this.log, ...log];
                this.index++;
                return this.log;
            })
    }

    deleteLog() {
        this.logService.deleteLog()
            .then(res => this.log = [])
    }
}
