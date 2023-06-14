import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {IEncodedUserProfile, IUserProfileImpl, UserTypes} from "../../models/user-profile";
import {AuthProvider, FirebaseUser} from "../auth/auth";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {AlertController, ModalController} from "ionic-angular";
import {Logger} from "../log-manager/log-manager";
import {Location} from "cordova-background-geolocation-lt";
import {AngularFireFunctions} from "@angular/fire/functions";

const logger = new Logger('UserProfileProvider');

@Injectable()
export class UserProfileProvider {

  public currentProfile: IUserProfileImpl;

  constructor(private afStore: AngularFirestore,
              private alertCtrl: AlertController,
              private modalCtrl: ModalController,
              private fns: AngularFireFunctions,
              private auth: AuthProvider) {
    console.log(logger.debug('Constructed'));
    this.currentProfile = null;
  }

  initialize() {
    void (this);
    return new Promise((resolve, reject) => {
      void (reject);
      resolve();
    })
  }

  getUserProfile(user: FirebaseUser): Observable<IUserProfileImpl> {
    return this.afStore.doc<IEncodedUserProfile>('users/' + user.uid).valueChanges()
      .pipe(map(data => {
        if (data) {
          this.currentProfile = IUserProfileImpl.decode(data);
        } else {
          // Profile should be created during registration
          this.currentProfile = IUserProfileImpl.createProfile(this.auth.currentUser.email, this.auth.currentUser.displayName);
        }

        return this.currentProfile;
      }));
  }

  setUserProfile(profile: IUserProfileImpl): Promise<void> {
    return this.afStore.doc<IEncodedUserProfile>('users/' + this.auth.currentUser.uid)
      .set(IUserProfileImpl.encode(profile));
  }

  createProfile(user) {
    user = user || this.auth.currentUser;

    let profile = IUserProfileImpl.createProfile(user.email, user.displayName);

    this.currentProfile = profile;

    return this.setUserProfile(profile);
  }

  fillProfileDetails(profile: IUserProfileImpl) {
    return new Promise((resolve, reject) => {
      let modal = this.modalCtrl.create('AccountPage');
      modal.onDidDismiss(data => {
        void (data);
        resolve(profile);
      });
      modal.present()
        .catch(reason => reject(reason));
    });
  }

  selectProfileType(profile: IUserProfileImpl) {
    return new Promise((resolve, reject) => {
      let modal = this.modalCtrl.create('SelectAccountPage');
      modal.onDidDismiss(data => {
        void (data);
        resolve(profile);
      });
      modal.present()
        .catch(reason => reject(reason));
    });
  }

  public setType(type: UserTypes) {
    if (this.currentProfile === null) {
      // TODO Initialize new profile !!!
    }
    this.currentProfile.setType(type);
    return this.setUserProfile(this.currentProfile);
  }

  createChild(id, name) {
    this.currentProfile.addParent(id, name);
    this.currentProfile.setType(UserTypes.Child);
    return this.setUserProfile(this.currentProfile);
  }

  createParent() {
    this.currentProfile.setType(UserTypes.Parent);
    return this.setUserProfile(this.currentProfile);
  }

  addChild(id, name) {
    this.currentProfile.addChild(id, name);
    return this.setUserProfile(this.currentProfile);
  }

  removeChild(id) {
    this.currentProfile.removeChild(id);
    return this.setUserProfile(this.currentProfile);
  }

  updateLocation(location: Location) {
    if (this.currentProfile && this.currentProfile.type === UserTypes.Child && this.currentProfile.parents.length) {
      this.currentProfile.location = [location.coords.longitude, location.coords.latitude];
      return this.setUserProfile(this.currentProfile);
    } else {
      return Promise.resolve();
    }
  }

  savePushToken(current, previous) {
    void (current);
    void (previous);

    return new Promise(((resolve, reject) => {
      void (reject);
      resolve();
    }));
  }
}
