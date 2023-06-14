import {Injectable} from '@angular/core';
import {ToastController} from "ionic-angular";
import {Debuggable, ProfileableMethod} from '../../core/debug'

// This provider implement simpler and common interface to show toasts.
@Injectable()
export class ToastProvider extends Debuggable {

  private defaultDuration = 3000;
  private defaultPosition = 'top';

  constructor(private toastCtrl: ToastController) {
    super('ToastProvider');
    console.log('Hello ToastProvider Provider');
  }

  @ProfileableMethod
  info(message: any) {
    this.debug(`info ${message}`);

    let toast = this.toastCtrl.create({
      message: message.toString(),
      duration: this.defaultDuration,
      position: this.defaultPosition,
      cssClass: 'toast-info'
    });

    toast.present()
      .catch(reason => console.error(reason));
  }

  @ProfileableMethod
  warn(message: any) {
    this.debug(`warn ${message}`);
    let toast = this.toastCtrl.create({
      message: message.toString(),
      duration: this.defaultDuration,
      position: this.defaultPosition,
      cssClass: 'toast-warn'
    });

    toast.present()
      .catch(reason => console.error(reason));
  }

  @ProfileableMethod
  error(message: any) {
    this.debug(`${message}`);
    console.error(message);

    let text = '';
    if (typeof message === 'string')
      text = message;
    else if (message instanceof Error)
      text = message.toString();
    else
      text = 'Unknown error: ' + JSON.stringify(message);

    let toast = this.toastCtrl.create({
      message: text,
      duration: this.defaultDuration,
      position: this.defaultPosition,
      cssClass: 'toast-error'
    });

    toast.present()
      .catch(reason => console.error(reason));
  }

  @ProfileableMethod
  action(message: any, button: string, cb: Function) {
    this.debug(`action ${message}, ${button}, ${cb.name}`);

    let toast = this.toastCtrl.create({
      message: message.toString(),
      duration: this.defaultDuration,
      showCloseButton: true,
      closeButtonText: button,
      position: this.defaultPosition,
      cssClass: 'toast-action'
    });

    toast.onDidDismiss(() => {
      this.debug('dismissed');
      if (typeof cb === 'function') {
        cb();
      }
    });

    toast.present()
      .catch(reason => console.error(reason));
  }
}
