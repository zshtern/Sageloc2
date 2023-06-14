import {CallableContext} from "firebase-functions/lib/providers/https";
import * as errors from "./errors"
import * as admin from "firebase-admin";
import {IUserProfile} from "../../../models/user-profile";

const REQUEST_TTL = 10 * 60 * 1000;

const arrayUnion = admin.firestore.FieldValue.arrayUnion;

enum Status {
  PENDING,
  APPROVED
}

// interface ParentDocument extends FriendRequest {}

// interface ChildDocument extends FriendRequest {}

interface IFriendRequest {
  sender: string
  status: Status
  receiver: string
  created: number
}

function isExpiredRequest(doc: IFriendRequest) {
  return (doc.created + REQUEST_TTL > Date.now());
}

function isValidRequest(doc: IFriendRequest) {
  return !!doc.sender && doc.status === Status.PENDING && !doc.receiver;
}

export function getChildCode(data: any, context: CallableContext): any | Promise<any> {
  if (!context.auth) return Promise.reject(errors.Unauthorized);

  const request: IFriendRequest = {
    sender: context.auth.uid,
    created: Date.now(),
    status: Status.PENDING,
    receiver: ''
  };

  return admin.firestore().collection('children').add(request)
    .then(doc => ({code: doc.id, expired: Date.now() + REQUEST_TTL}))
    .catch(errors.parseError);
}

export function getParentCode(data: any, context: CallableContext): any | Promise<any> {
  if (!context.auth) return Promise.reject(errors.Unauthorized);

  const request: IFriendRequest = {
    sender: context.auth.uid,
    created: Date.now(),
    status: Status.PENDING,
    receiver: ''
  };

  return admin.firestore().collection('parents').add(request)
    .then(doc => ({code: doc.id, expired: Date.now() + REQUEST_TTL}))
    .catch(errors.parseError);
}

/**
 * unauthorized request
 * missing parameter: code
 * unknown child code
 * unknown user
 * expired child code
 * invalid child request
 * self friend
 * child already exists
 *
 * @param data
 * @param context
 */
export function approveChildCode(data: any, context: CallableContext): any | Promise<any> {
  let uid: string;
  if (!context.auth) return Promise.reject(errors.Unauthorized());
  else uid = context.auth.uid;

  if (!data.code) return Promise.reject(errors.MissingParameter('code'));

  // context.auth.uid
  // .where('capital', '==', true);
  return admin.firestore().collection('children').doc(data.code).get()
    .then(requestDoc => {
      if (!requestDoc.exists) return Promise.reject(errors.UnknownCode('child'));
      const request = <IFriendRequest>requestDoc.data();
      if (!isExpiredRequest(request)) return Promise.reject(errors.ExpiredCode('child'));
      if (!isValidRequest(request)) return Promise.reject(errors.InvalidRequest('child'));
      if (request.sender === uid) return Promise.reject(errors.SelfFriend());
      else return admin.firestore().collection('users').doc(uid).get()
        .then(userDoc => {
          if (!userDoc.exists) return Promise.reject(errors.NotFound('user'));
          const user = <IUserProfile>requestDoc.data();
          let results = user.children.filter((child) => child.id === request.sender);
          if (results.length > 0) return Promise.reject(errors.AlreadyExists('child'));
          return Promise.resolve(userDoc.ref);
        })
        .then(ref => ref.update({children: arrayUnion({id: request.sender, name: "Child"})}))
        .then(() => requestDoc.ref.update({receiver: uid, status: Status.APPROVED}));
    })
    .then(() => ({approved: true}))
    .catch(errors.parseError);
}

export function approveParentCode(data: any, context: CallableContext): any | Promise<any> {
  let uid: string;
  if (!context.auth) return Promise.reject(errors.Unauthorized());
  else uid = context.auth.uid;

  if (!data.code) return Promise.reject(errors.MissingParameter('code'));

  // context.auth.uid
  // .where('capital', '==', true);
  return admin.firestore().collection('parents').doc(data.code).get()
    .then(doc => {
      if (!doc.exists) return Promise.reject(errors.UnknownCode('parent'));
      const request = <IFriendRequest>doc.data();
      if (!isExpiredRequest(request)) return Promise.reject(errors.ExpiredCode('parent'));
      if (!isValidRequest(request)) return Promise.reject(errors.InvalidRequest('parent'));
      else return admin.firestore().collection('users').doc(uid)
        .update({parents: arrayUnion({id: request.sender, name: "Parent"})})
        .then(() => doc.ref.update({receiver: uid, status: Status.APPROVED}));
    })
    .then(() => ({approved: true}))
    .catch(errors.parseError);
}
