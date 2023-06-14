import {Storage} from '@ionic/storage';
import {Injectable} from '@angular/core';
import {UserProfileProvider} from "../user-profile/user-profile";
import {AuthProvider} from "../auth/auth";
import {Logger} from "../log-manager/log-manager";
import {UserTypes} from "../../models/user-profile";

const logger = new Logger('AppProvider');

@Injectable()
export class AppProvider {
  wasLaunched = false;
  isAuthorized = false;
  isConfigured = false;

  constructor(private storage: Storage,
              private auth: AuthProvider,
              private profile: UserProfileProvider) {
    console.log(logger.debug('Constructed'));
  }

  initialize() {
    return Promise.all([this.getWasLaunched(), this.auth.isAuthorized()])
      .then(values => {
        this.wasLaunched = !!values[0];
        this.isAuthorized = !!values[1];

        if (this.isAuthorized) {
          let observer = this.profile.getUserProfile(this.auth.currentUser);
          let promise = observer.take(1).toPromise();
          console.log(observer);
          console.log(promise);
          return promise
            .then((profile) => {
              this.isConfigured = !!(profile && profile.type !== UserTypes.Undefined);
            })
            .catch(reason => console.error(logger.error(reason)));
        }
      })
  }

  getInitialPage() {
    if (!this.wasLaunched) return 'WelcomePage';
    if (!this.isAuthorized) return 'LoginPage';
    if (!this.isConfigured) return 'SelectAccountPage';
    if (this.profile.currentProfile.type === UserTypes.Child) {
      return 'ChildHomePage';
    } else {
      return 'TabsPage';
    }
  }

  setWasLaunched(value: boolean): Promise<any> {
    return this.storage.set('wasLaunched', value);
  }

  getWasLaunched(): Promise<boolean> {
    return this.storage.get('wasLaunched').then((value) => !!value);
  }

  setIsAuthorized(value: boolean): Promise<any> {
    return this.storage.set('isAuthorized', value);
  }

  getIsAuthorized(): Promise<boolean> {
    return this.storage.get('isAuthorized').then((value) => !!value);
  }

  setIsConfigured(value: boolean): Promise<any> {
    return this.storage.set('isAuthorized', value);
  }

  getIsConfigured(): Promise<boolean> {
    return this.storage.get('isAuthorized').then((value) => !!value);
  }
}
