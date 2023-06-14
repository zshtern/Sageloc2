import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {UserLocationIfc} from '../../model/models';
import {from, Observable, of, throwError} from 'rxjs';
import {flatMap, catchError, map} from 'rxjs/operators';
import {MockService} from '../mock/mock-service';
import {StorageService} from '../storage/storage.service';
import {SocketService} from '../socket/socket.service';
import {FirebaseService} from '../firebase/firebase.service';
import {CONNECTION_STATE} from '../../../pages/old/home/connection/user-connection-state.enum';

@Injectable()
export class UserService {
  user: any = null;
  sendLocations: boolean = false; // just for test;

  constructor(private http: HttpClient,
              private mockService: MockService,
              private socketService: SocketService,
              private firebaseService: FirebaseService,
              private storageService: StorageService) {


  }

  sendUserLocation(userLocation: UserLocationIfc): Observable<any> {
    return this.getUser().pipe(
      flatMap(user => {
        if (this.sendLocations) {
          userLocation.uid = user.uid;
          return this.http.post(`${this.socketService.wsApiUrl}/users/gps-update`, userLocation);
        } else {
          return of([]);
        }
      }),
      catchError(this.handleError)
    )
  }


  getUsersOnScan(): Observable<Array<any>> {
    return this.firebaseService.getUsers(true).valueChanges()
      .pipe(
        map(users => {
          const usersValues = [];
          users.forEach(user => {
            user['connectionState'] = CONNECTION_STATE.NONE;
            usersValues.push(user)
          });
          return usersValues
        }),
        catchError(this.handleError)
      )
  }


  findFriendByEmail(email) {
    return this.firebaseService.getUserByEmail(email)
      .pipe(
        flatMap(user => !user ? Observable.of(false) : this.sendConnectionRequest(user)),
        catchError(this.handleError)
      )


    // return this.getUser()
    //     .flatMap(user => {
    //         return this.http
    //             .post(`${this.socketService.wsApiUrl}/users/connection-request-by-email`,
    //                 {
    //                     email,
    //                     from: {name: 'firstUser', uid: user.uid}
    //                 })
    //     })
    //     .map(res => res.json())
    //     .catch(this.handleError)
  }


  sendConnectionRequest(to) {
    return this.getUser()
      .pipe(
        flatMap(from => this.http.post(`${this.socketService.wsApiUrl}/users/connection-request`, {from, to})),
        catchError(this.handleError)
      )
  }

  sendConnectionApprove(userToNotify) {
    return this.getUser()
      .pipe(
        flatMap(user => {
          const url = `${this.socketService.wsApiUrl}/users/connection-approve`;
          return this.http.post(url, {from: user, to: userToNotify})
        }),
        map(res => console.log(res)),
        catchError(this.handleError)
      )
  }

  sendConnectionDeny(userToNotify) {
    return this.getUser()
      .pipe(
        flatMap(user => {
          const url = `${this.socketService.wsApiUrl}/users/connect-request-deny`;
          return this.http.post(url, {from: user, to: userToNotify});
        }),
        map(res => console.log(res)),
        catchError(this.handleError)
      )
  }


  userOnRoute(atStart) {
    return this.getUser()
      .pipe(
        flatMap(user => {
          const url = `${this.socketService.wsApiUrl}/users/user-on-route`;
          return this.http.post(url, {user, atStart})
        }),
        catchError(this.handleError)
      );
  }


  private getUser(): Observable<any> {
    if (this.user) {
      return of(this.user)
    } else {

      let promise = this.storageService
        .getLocal('user')
        .then(user => this.user = user);
      return from(promise);
    }
  }

  private handleError(error: HttpErrorResponse) {
    console.log(error);
    return throwError(error.status || 'Server error');
  }
}
