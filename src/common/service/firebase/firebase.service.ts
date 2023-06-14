import { Injectable } from '@angular/core';
import { handleError } from '../../utils/utils';
import { HttpClient } from '@angular/common/http';
import { SocketService } from '../socket/socket.service';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { StorageService } from '../storage/storage.service';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { UserModel } from '../../model/models';

@Injectable()
export class FirebaseService {
    private currentUser: firebase.User;
    public users: AngularFireList<any>;

    constructor(private http: HttpClient,
                private afdb: AngularFireDatabase,
                private afAuth: AngularFireAuth) {

        afAuth.authState.subscribe((user: firebase.User) => this.currentUser = user);
        this.users = afdb.list('/users');

    }

    getUsers(preserveSnapshot?: boolean): AngularFireList<any[]> {
        const opts = preserveSnapshot ? {preserveSnapshot} : {};
        return this.afdb.list('/users')
    }

    addUser(model: UserModel) {
        this.users.push(model);
    }

    getUserByEmail(email) {
        return this.afdb.list('/users')
            .valueChanges()
            .map(users => {
                const userByEmail = users.filter(user => user['email'] == email);
                return userByEmail[0];
            })
    }


}
