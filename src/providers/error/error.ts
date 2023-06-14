import {Injectable} from '@angular/core';

let errors = {
  'not-implemented': 'Not implemented yet',
  'plugin-undefined': 'Cordova Plugin is not defined',
  'unauthorized': 'User is nor authenticated',
  'email-empty': 'Email is required',
  'email-invalid': 'Invalid email',
  'password-empty': 'Password is required',
  'password-too-short': 'Password is too short. Minimum length is 6',
  'unknown': 'Unknown error',
  'unknown-auth-provider': 'Unknown authentication provider: ',
  'not-logged-in': 'User is not logged in',
  'not-developer': 'Just developers have access to this feature',
};

export function getError(code: string, text = ''): Error {
  return new Error((errors[code] || 'Unknown error code') + text + '.');
}


@Injectable()
export class ErrorProvider {

  constructor() {
    console.log('Hello ErrorProvider Provider');
  }

  get(...args: any[]) {
    return (errors[args[0]] + '.' || 'Undefined error code.') + ' ' + args.slice(1).join(' ');
  }
}
