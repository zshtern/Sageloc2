import {Injectable} from '@angular/core';
import {handleError} from '../utils/utils';
import {HttpClient} from '@angular/common/http';
import {SignUpIfc, UserIfc, UserModel} from '../model/models';
import {Observable, from} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {SocketService} from './socket/socket.service';
import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import {StorageService} from './storage/storage.service';
import {FirebaseService} from './firebase/firebase.service';

let BASE_URL = "https://sageloc.xyz";

@Injectable()
export class AuthService {
  signUpModel: SignUpIfc = {email: '', password: '', firstName: '', lastName: ''};

  constructor(private http: HttpClient,
              private socketService: SocketService,
              private storageService: StorageService,
              private firebaseService: FirebaseService,
              private afAuth: AngularFireAuth) {

  }

  signUp(data: SignUpIfc): Observable<UserIfc> {
    return this.http.post(BASE_URL + '/api/user/create', data)
      .pipe(catchError(handleError))
      .map(res => res as UserIfc);
  }

  registerUser(userForm: SignUpIfc): Observable<any> {
    const {lastName, firstName, password, email} = userForm;
    let uid = '';
    return from(
      this.afAuth.auth.createUserWithEmailAndPassword(email, password)
        .then((result: firebase.auth.UserCredential) => {
          console.log(result);
          uid = result.user.uid;
          return result.user.updateProfile({displayName: `${firstName} ${lastName}`, photoURL: null})
        })
        .then(res => {
          const model = new UserModel(uid, firstName, lastName, email);
          this.firebaseService.addUser(model);
          return model
        })
        .catch((error) => {
          throw error;
        }));
  }

  login(email, password): Observable<UserModel> {
    return this.http.post(BASE_URL + '/api/user/login_email', {email, password})
      .pipe(catchError(handleError))
      .map(res => {
        // const {success, uid} = res.json();
        return !res['success'] ? null : new UserModel(res['uid'], "testFname", 'testLname', email);
      });
  }

  loginAF(email, password) {
    let promise = this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then((result: firebase.auth.UserCredential) => {
        console.log(result);
        const [fname, lname] = (result.user.displayName || 'A B').split(' ');
        return new UserModel(result.user.uid, fname, lname, email)
      })
      .catch((error) => {
        throw error;
      });

    return from(promise);
  }

  signOut(): Promise<any> {
    return this.afAuth.auth.signOut()
      .then(d => this.storageService.storeLocal('user', null));
  }

  loadConfig() {
    return this.http.get('https://cfg.sageloc.xyz/')
      .map(data => {
        console.log(data);
        this.socketService.setUrl(data)
      })
      .toPromise()
      .catch(handleError)
  }
}
