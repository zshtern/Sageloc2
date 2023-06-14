/**
 * This class implements user profile model.
 */

export interface IUserProfile {
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
  location: [number, number];

  // constructor(id: string, details: IUserDetails, settings: IUserSettings, friends: IUserFriend[], routes: IUserRoute[]);

  // static decode(data: IEncodedUserProfile): IUserProfile;

  // static encode(data: IUserProfile): IEncodedUserProfile;

  // static createProfile(email: string, name: string);

  setType(type: UserTypes): void;

  isDetailsDefined(): boolean;

  isTypeDefined(): boolean;

  addChild(id: string, name: string): void;

  removeChild(id: string): void;

  addParent(id: string, name: string): void;
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
  location: [number, number]
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
}

// export class Parent extends IUserProfile {
//
// }
//
// export class Child extends IUserProfile {
//
// }
