export interface SignUpIfc {
    email;
    password;
    firstName;
    lastName;
}

export interface UserIfc {
    uid;
    name;
}

export interface UserLocationIfc {
    uid?: string;
    qk: string,
    x: number,
    y: number,
    z: number,
    tx: number,
    ty: number
}

export const DB_ENTITIES_TYPES = {
    USER: 'USER',
    PATH: 'PATH'
};

export class UserModel {

    private firstName;
    private lastName;
    private email;
    private uid;

    constructor(uid, firstName, lastName, email) {
        this.uid = uid;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;

    }

    get name() {
        return `${this.firstName} ${this.lastName}`
    }

}