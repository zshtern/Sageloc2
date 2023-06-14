import {IUserProfile} from "../../models/user-profile";

/**
 * This class implements user profile model.
 */

export class IUserProfileImpl implements IUserProfile {
  // User identifier
  id: string;
  // User email
  email: string;
  // User name
  name: string;
  // Type of user account: parent or child
  type: UserTypes;
  // User settings
  settings: object;
  // List of  friends
  friends: IUserFriend[];
  // User parents
  parents: IUserFriend[];
  // User children
  children: IUserFriend[];
  // List of routes
  routes: IUserRoute[];
  // Last location
  location: [number, number];

  constructor(id: string,
              details: IUserDetails,
              settings: IUserSettings,
              friends: IUserFriend[],
              routes: IUserRoute[],
              parents: IUserFriend[],
              children: IUserFriend[],
              location: [number, number]) {
    this.id = id || 'unknown';

    this.email = details.email || 'unknown';
    this.name = details.name || 'unknown';
    this.type = details.type || UserTypes.Undefined;

    this.settings = settings || {};
    this.friends = friends || [];
    this.routes = routes || [];
    this.parents = parents || [];
    this.children = children || [];
    this.location = location || [null, null];
  }

  static decode(data: IEncodedUserProfile): IUserProfileImpl {

    let details;
    try {
      // text = JSON.parse(decodeURIComponent(atob(data.text)));
      details = data.details;
    } catch (e) {
      console.error(e);
      details = {
        email: 'corrupted',
        name: 'corrupted',
        type: UserTypes.Undefined
      }
    }

    return new IUserProfileImpl(data.id, details, data.settings, data.friends, data.routes, data.parents,
      data.children, data.location);
  }

  static encode(data: IUserProfile): IEncodedUserProfile {
    return {
      id: data.id,
      text: btoa(encodeURIComponent(JSON.stringify({email: data.email, name: data.name, type: data.type}))),
      details: {email: data.email, name: data.name, type: data.type},
      settings: data.settings,
      parents: data.parents,
      children: data.children,
      friends: data.friends,
      routes: data.routes,
      location: data.location
    };
  }

  static createProfile(email: string, name: string): IUserProfileImpl {
    let details = {
      email: email,
      name: name,
      type: UserTypes.Undefined
    };
    return new IUserProfileImpl('', details, {}, [], [], [], [], [null, null]);
  }

  setType(type: UserTypes) {
    this.type = type;
  }

  isDetailsDefined() {
    return !!this.email && !!this.name;
  }

  isTypeDefined() {
    return !!this.type;
  }

  addChild(id: string, name: string) {
    this.children.push({
      id: id,
      name: name,
      location: [null, null]
    });
  }

  removeChild(id: string) {
    this.friends = this.friends.filter(friend => friend.id !== id);
  }

  addParent(id: string, name: string) {
    this.parents.push({
      id: id,
      name: name,
      location: [null, null]
    });
  }
}

export enum UserTypes {
  Undefined = 0,
  Child = 1,
  Parent = 2
}

interface IUserDetails {
  email: string;
  name: string;
  type: UserTypes;
}

interface IUserSettings {

}

export interface UserParent {
  id: string;
  name: string;
}

export interface IUserFriend {
  id: string;
  name: string;
  location: [number, number];
}

interface IUserRoute {

}

export interface IEncodedUserProfile {
  // User identifier
  id: string
  // User details
  details: IUserDetails;
  // Private data
  text: string;
  // User settings
  settings: IUserSettings;
  // List of  friends
  friends: IUserFriend[];
  // User parents
  children: IUserFriend[];
  // User children
  parents: IUserFriend[];
  // List of routes
  routes: IUserRoute[];
  //
  location: [number, number]
}

// export class Parent extends IUserProfile {
//
// }
//
// export class Child extends IUserProfile {
//
// }
