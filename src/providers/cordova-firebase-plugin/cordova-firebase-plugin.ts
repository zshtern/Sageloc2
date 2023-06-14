import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {Platform} from "ionic-angular";
import {ErrorProvider} from "../error/error";

export interface FirebasePlugin {
  getToken(success: (token: string) => void, failure: (error: Error) => void);

  onTokenRefresh(success: (token: string) => void, failure: (error: Error) => void);

  onMessageReceived(success: (message: PushMessage) => void, failure: (error) => void);

  grantPermission(success: (hasPermission: boolean) => void);

  hasPermission(success: (hasPermission: boolean) => void);

  unregister();

  setBadgeNumber(n: number);

  getBadgeNumber(success: (n: number) => void);

  clearAllNotifications();

  subscribe(topic: string);

  unsubscribe(topic: string);
}

export interface PushMessage {
  messageType: 'notification' | 'data';
  tap: 'foreground' | 'background';
}

@Injectable()
export class CordovaFirebasePluginProvider {

  isInitialized = false;
  isSupported = false;
  initialize: Promise<boolean>;
  plugin: FirebasePlugin;

  constructor(private platform: Platform,
              private err: ErrorProvider) {
    console.log('Hello CordovaFirebasePluginProvider Provider');

    this.initialize = this.platform.ready().then(() => {
      this.isInitialized = true;
      if (!!(<any>window).FirebasePlugin) {
        this.isSupported = true;
        this.plugin = (<any>window).FirebasePlugin;
        return true;
      } else {
        this.isSupported = true;
        // return Promise.reject(err.get('plugin-undefined', '[FirebasePlugin]'));
        return false;
      }
    });
  }

  makePromise(cb): Promise<any> {
    return this.initialize.then((isSupported) => {
      if (isSupported)
        return new Promise(cb);
      else
        return  Promise.reject(this.err.get('plugin-undefined', '[FirebasePlugin]'));
    });
  }

  makeObservable(cb): Observable<any> {
    return new Observable(observer => {
      cb(observer.next, observer.error, observer.complete);
    });
  }

  getToken(): Promise<string> {
    return this.makePromise((resolve, reject) => {
      this.plugin.getToken(token => {
        // save this server-side and use it to push notifications to this device
        console.log('Token was received. New token:', token);
        resolve(token);
      }, error => {
        console.error(error);
        reject(error);
      });
    });
  }

  onTokenRefresh(): Observable<string> {
    return this.makeObservable((next, error, complete) => {
      void (complete);
      this.plugin.onTokenRefresh(token => {
        // save this server-side and use it to push notifications to this device
        console.log('Token was refreshed. New token:', token);
        next(token);
      }, reason => {
        console.error(reason);
        error(error);
      });
    });
  }

  onMessageReceived(): Observable<PushMessage> {
    return this.makeObservable((next, error, complete) => {
      void (complete);
      this.plugin.onMessageReceived((message) => {
        console.log('New message:', message.messageType, message.tap);
        next(message);
      }, reason => {
        console.error(reason);
        error(reason);
      });
    });
  }

  hasPermission(): Promise<boolean> {
    return this.makePromise((resolve, reject) => {
      void (reject);
      this.plugin.hasPermission(hasPermission => {
        console.log("Permission is " + (hasPermission ? "granted" : "denied"));
        resolve(hasPermission);
      });
    });
  }

  grantPermission(): Promise<boolean> {
    return this.makePromise((resolve, reject) => {
      void (reject);
      this.plugin.grantPermission(hasPermission => {
        console.log("Permission was " + (hasPermission ? "granted" : "denied"));
        resolve(hasPermission);
      });
    });
  }

  unregister():Promise<void> {
    return this.makePromise((resolve, reject) => {
      void(reject);
      this.plugin.unregister();
      resolve();
    });
  }

  setBadgeNumber(n: number): Promise<void> {
    return this.makePromise((resolve, reject) => {
      void(reject);
      this.plugin.setBadgeNumber(n);
      resolve();
    });
  }

  getBadgeNumber(): Promise<number> {
    return this.makePromise((resolve, reject) => {
      void(reject);
      this.plugin.getBadgeNumber(n => {
        resolve(n);
      });
    });
  }

  clearAllNotifications() {
    return this.makePromise((resolve, reject) => {
      void(reject);
      this.plugin.clearAllNotifications();
      resolve();
    });
  }

  subscribe(topic: string) {
    return this.makePromise((resolve, reject) => {
      void(reject);
      this.plugin.subscribe(topic);
      resolve();
    });
  }

  unsubscribe(topic: string) {
    return this.makePromise((resolve, reject) => {
      void(reject);
      this.plugin.unsubscribe(topic);
      resolve();
    });
  }
}
