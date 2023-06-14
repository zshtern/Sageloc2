import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import {Logger, LogManagerProvider, LogMessage} from "../../providers/log-manager/log-manager";

@IonicPage()
@Component({
  selector: 'page-log-viewer',
  templateUrl: 'log-viewer.html',
})
export class LogViewerPage {

  private log: Logger;
  public messages: LogMessage[];
  public total: number;
  public selectedLogModule: string;
  public selectedLogLevel: string;
  public levels: any[];

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private viewCtrl: ViewController,
              private logManager: LogManagerProvider) {
    this.log = new Logger('LogViewerPage');
    this.levels = Logger.levels;
    this.selectedLogLevel = "0";
    this.selectedLogModule = 'all';
    this.total = 0;
  }

  ionViewDidLoad() {
    void (this);
    console.log(this.log.debug('ionViewDidLoad'));
    this.loadMessages();
  }

  loadMessages() {
    this.messages = this.logManager.get(this.selectedLogModule, parseInt(this.selectedLogLevel));
    this.total = Logger.messages.length;
  }

  onLevelChanged(event) {
    console.log(event);
    // this.selectedLogLevel = parseInt(event.value);
    this.loadMessages();
  }

  onModuleInput(event) {
    console.log(event);
    this.loadMessages();
  }

  dismiss() {
    this.viewCtrl.dismiss()
      .catch(reason => console.error(this.log.error(reason)));
  }

  doRefresh(refresher) {
    this.loadMessages();
    refresher.complete();
  }
}
