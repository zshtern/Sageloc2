import {HttpsError} from "firebase-functions/lib/providers/https";

export function parseError(error: any): Promise<never> {
    if (error instanceof HttpsError) {
        return Promise.reject(error);
    } else if (error instanceof Error) {
        return Promise.reject(new HttpsError('unknown', error.message, ''));
    } else {
        return Promise.reject(error);
    }
}

function capitalize(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// General
export function NotFound(name: string) {
    return new HttpsError('not-found', capitalize(name) + ' was not found', capitalize(name) + ' was not found');
}

export function Unauthorized() {
  return new HttpsError('unauthenticated', 'Unauthenticated', 'Unauthenticated access.');
}

export function AlreadyExists(name: string) {
  return new HttpsError('already-exists', 'Already Exists', capitalize(name) + 'already exists.');
}

export function MissingParameter(name: string) {
    return new HttpsError('invalid-argument', 'Invalid argument', 'Missing parameter: ' + name);
}

// Friends
export function UnknownCode(type: string) {
    return new HttpsError('not-found', 'Unknown ' + type + ' code', 'Unknown ' + type + ' code');
}

export function ExpiredCode(type: string) {
    return new HttpsError('invalid-argument', 'Expired ' + type + ' code', 'Expired ' + type + ' code');
}

export function InvalidRequest(type: string) {
    return new HttpsError('invalid-argument', 'Invalid ' + type + ' request', 'Invalid ' + type + ' request');
}

export function SelfFriend() {
    return new HttpsError('invalid-argument', 'Self Friend', 'Friends should be different persons');
}
