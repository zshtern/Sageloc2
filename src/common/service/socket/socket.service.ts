import { Observable, NEVER, of } from 'rxjs';
import * as io from 'socket.io-client';
import { WS_API_URL } from '../../../app/config/index';
import { Injectable } from '@angular/core';
import { IO_CONNECT_USER, IO_CONNECT_USER_APPROVE, IO_CONNECT_USER_DENY, IO_CONNECTION_ON_MOVE } from './events/';
import { StorageService } from '../storage/storage.service';

let BASE_URL = "http://sageloc.xyz";

/**
 * Changes:
 *
 * 2019-05-25 by Sergey
 *  - Due to the fact that the server was not working, I temporarily disabled the SocketService to prevent errors.
 */
@Injectable()
export class SocketService {
    private isEnabled = false;
    private socket;
    private name: string;
    public wsApiUrl: string;

    constructor(private storageService: StorageService) {
    }

    setUrl(conf) {
        console.log(conf);
        this.wsApiUrl = BASE_URL + ':3001';
    }

    connectToWSServer() {
        if (!this.isEnabled) return;

        if (!this.socket) {
            this.storageService
                .getLocal('user')
                .then(user => {
                    console.log(user);
                    this.socket = io(this.wsApiUrl || 'http://sageloc.xyz:3001', {query: `userId=${user.uid}`})
                })
                .catch(reason => {
                    console.log(reason);
                })
        }
    }

    // Get items observable
    get(name: string): Observable<any> {
        if (!this.isEnabled) return Observable.of({});

        this.name = name;
        this.socket.on("connect", () => this.connect());
        this.socket.on("disconnect", () => this.disconnect());
        this.socket.on("error", (error: string) => console.log(`ERROR: "${error}" (${WS_API_URL})`));

        return Observable.create((observer: any) => {
            this.socket.on("create", (item: any) => observer.next({action: "create", item: item}));
            this.socket.on(IO_CONNECT_USER, (item: any) => observer.next({action: "connectUser", item: item}));
            return () => this.socket.close();
        });
    }

    onConnectUserRequest(): Observable<any> {
        if (!this.isEnabled) return NEVER;

        return new Observable(observer => {
            this.socket.on(IO_CONNECT_USER, (data) => observer.next(data));
            return () => this.socket.disconnect();
        });
    }


    onConnectUserRequestApprove(): Observable<any> {
        if (!this.isEnabled) return NEVER;

        return new Observable(observer => {
            this.socket.on(IO_CONNECT_USER_APPROVE, (data) => observer.next(data));
            return () => this.socket.disconnect();
        });

    }

    onConnectUserRequestDeny(): Observable<any> {
        if (!this.isEnabled) return NEVER;

        return new Observable(observer => {
            this.socket.on(IO_CONNECT_USER_DENY, (data) => observer.next(data));
            return () => this.socket.disconnect();
        });

    }

    onConnectUserOnMove(): Observable<any> {
        if (!this.isEnabled) return of({payload: {uid:1, x:1, y:1}});

        return new Observable(observer => {
            this.socket.on(IO_CONNECTION_ON_MOVE, (data) => observer.next(data));
            return () => this.socket.disconnect();
        });

    }

    // Create signal
    connectUserReq(user) {
        if (!this.isEnabled) return ;

        this.socket.emit("connectUserReq", user);
    }

    // Remove signal
    remove(name: string) {
        if (!this.isEnabled) return ;

        this.socket.emit("remove", name);
    }

    // Handle connection opening
    private connect() {
        console.log(`Connected to "${this.name}"`);
        // this.socket.emit("list");
    }

    // Handle connection closing
    private disconnect() {
        console.log(`Disconnected from "${this.name}"`);
    }


}
