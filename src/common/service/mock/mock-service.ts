import { UserLocationIfc } from '../../model/models';
import { Injectable } from '@angular/core';

@Injectable()
export class MockService {
    constructor() {

    }

    getUsers(userLocation: UserLocationIfc, usersData: Array<any>) {
        const mockUsers = [];
        const {x, y} = userLocation;
        let i = 0;
        usersData.forEach(userId => {
            let user = {
                id: userId,
                firstName: userId,
                lastName: userId,
                x: x + ((i + 1) / 1000),
                y: y + (i + 1) / 1000,
                userId: userId,
                name: function () {
                    return `${this.firstName} - ${this.lastName}`
                }

            };
            i++;
            mockUsers.push(user)
        });
        return mockUsers;
    }
}

