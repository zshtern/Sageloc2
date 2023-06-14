import {Injectable} from '@angular/core';
import {CordovaFirebasePluginProvider} from "../cordova-firebase-plugin/cordova-firebase-plugin";
import {UserProfileProvider} from "../user-profile/user-profile";
import {Subscription} from "rxjs";
import {Storage} from '@ionic/storage';
import {Logger} from "../log-manager/log-manager";

@Injectable()
export class PushNotificationProvider {

  private readonly TOKEN_KEY = 'sgl-push-token';

  private token = '';
  private isEnabled = false;
  private refresh$: Subscription;
  private message$: Subscription;
  private log: Logger;

  constructor(private storage: Storage,
              private plugin: CordovaFirebasePluginProvider,
              private user: UserProfileProvider) {
    this.log = new Logger('PushNotificationProvider');
    console.log(this.log.debug('Constructed'));
  }

  initialize() {
    Promise.all([this.plugin.hasPermission(), this.plugin.getToken(), this.storage.get(this.TOKEN_KEY)])
      .then(results => {
        this.isEnabled = results[0];

        console.log(this.log.debug('subscribed for tokens.'));
        this.refresh$ = this.plugin.onTokenRefresh().subscribe({
          next: token => this.saveToken(token),
          error: error => console.error(this.log.error(error)),
          complete: () => console.log(this.log.debug('onTokenRefresh was completed'))
        });

        console.log(this.log.debug('subscribed for messages.'));
        this.message$ = this.plugin.onMessageReceived().subscribe({
          next: message => console.log(this.log.info('New push message'), JSON.stringify(message)),
          error: error => console.error(this.log.error(error)),
          complete: () => console.log(this.log.debug('onTokenRefresh was completed'))
        });
      })
      .catch(reason => {
        console.error(this.log.error(reason));
      });
  }

  onMessageReceived() {
    console.log(this.log.debug('call onMessageReceived'));
    return this.plugin.onMessageReceived();
  }

  grantPermission() {
    return this.plugin.grantPermission()
      .then(isEnabled => {
        console.log(this.log.info('permission was granted', isEnabled));
        this.isEnabled = isEnabled;
        return isEnabled;
      });
  }

  getToken() {
    return this.plugin.getToken()
      .then(token => {
        console.log(this.log.info('push token was received', token));
        return this.saveToken(token);
      });
  }

  unregister() {
    return this.plugin.unregister()
      .then(() => {
        console.log(this.log.info('unregistered'));
        this.refresh$.unsubscribe();
        this.message$.unsubscribe();
      });
  }

  private saveToken(token) {
    if (token !== this.token) {
      return this.user.savePushToken(token, this.token)
        .then(() => {
          console.log(this.log.info('Push token was saved'), token);
          this.token = token;
          return token;
        });
    } else {
      console.log(this.log.debug('Skip token saving due to same token.'), token);
      return token;
    }
  }
}
