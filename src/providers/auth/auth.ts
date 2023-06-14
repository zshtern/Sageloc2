import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {GooglePlus} from '@ionic-native/google-plus';
import {Facebook} from '@ionic-native/facebook';
import {auth, User} from 'firebase/app';
import {Platform} from 'ionic-angular';
import {Logger} from "../log-manager/log-manager";
import {getError} from "../error/error";
export {User as FirebaseUser} from 'firebase/app';

const logger = new Logger('AuthProvider');

export class AuthForm {
  public email: string;
  public password: string;

  constructor() {
    this.email = '';
    this.password = '';
  }

  getError() {
    // ??? String
    if (this.isEmptyEmail()) return getError('email-empty');
    if (this.isInvalidEmail()) return getError('email-invalid');
    if (this.isEmptyPassword()) return getError('password-empty');
    if (this.isShortPassword()) return getError('password-too-short');
    return null;
  }

  private isEmptyEmail() {
    return this.email === '';
  }

  private isInvalidEmail() {
    return !(/\S+@\S+\.\S+/.test(this.email.toLowerCase()));
  }

  private isEmptyPassword() {
    return this.email === '';
  }

  private isShortPassword() {
    return !(/\S+@\S+\.\S+/.test(this.email.toLowerCase()));
  }
}

@Injectable()
export class AuthProvider {

  public currentUser: User = null;
  private isDeveloper = false;
  public Form = AuthForm;

  constructor(private afAuth: AngularFireAuth,
              private platform: Platform,
              private google: GooglePlus,
              private fb: Facebook) {
    console.log(logger.debug('Constructed'));
  }

  onAuthStateChanged(cb) {
    return this.afAuth.auth.onAuthStateChanged((user) => {
      this.currentUser = user;

      if (user) {
        // User is signed in.
        console.log(logger.debug('User:', user));
      } else {
        // No user is signed in.
        console.log(logger.debug('User:', null));
      }

      cb(user);
    });
  }

  login(provider, params?) {
    return this.smartLogin(provider, params)
      .then(response => {
        this.currentUser = response.user;
        return response;
      })
      .catch((reason) => {
        this.currentUser = null;
        console.error(logger.error(reason));
        return Promise.reject(reason);
      });
  }

  logout() {
    return this.smartLogout()
      .then(response => {
        this.currentUser = null;
        return response;
      })
      .catch((reason) => {
        console.error(logger.error(reason));
        return Promise.reject(reason);
      });
  }

  create(provider, params?) {
    return this.smartCreate(provider, params)
      .then(response => {
        this.currentUser = response.user;
        return response;
      })
      .catch((reason) => {
        this.currentUser = null;
        console.error(logger.error(reason));
        return Promise.reject(reason);
      });
  }

  resetPassword() {

  }

  private smartLogin(provider, params) {
    switch (provider) {
      case ('firebase'):
        return this.loginWithEmail(params);
      case ('password'):
        return this.loginWithEmail(params);
      case ('google.com'):
        return this.loginWithGoogle();
      case ('google'):
        return this.loginWithGoogle();
      case ('facebook.com'):
        return this.loginWithFacebook();
      case ('facebook'):
        return this.loginWithFacebook();
      case ('apple-id'):
        return Promise.reject(getError('not-implemented'));
      default:
        return Promise.reject(getError('unknown-auth-provider', provider));
    }
  }

  private loginWithEmail(form: AuthForm) {
    let error = form.getError();
    if (error) {
      return Promise.reject(error);
    } else {
      return this.afAuth.auth.signInWithEmailAndPassword(form.email, form.password);
    }
  }

  private loginWithGoogle() {
    if (this.platform.is('cordova')) {
      return this.google.login({})
        .then(response => {
          let credentials = auth.GoogleAuthProvider.credential(response.idToken);
          return this.afAuth.auth.signInWithCredential(credentials);
        });
    } else {
      return this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
    }
  }

  private loginWithFacebook() {
    if (this.platform.is('cordova')) {
      return this.fb.login(['public_profile', 'email'])
        .then(response => {
          let credentials = auth.FacebookAuthProvider.credential(response.authResponse.accessToken);
          return this.afAuth.auth.signInWithCredential(credentials)});
    } else {
      return this.afAuth.auth.signInWithPopup(new auth.FacebookAuthProvider());
    }
  }

  private smartLogout() {
    if (!this.currentUser) {
      return Promise.reject(getError('not-logged-in'));
    }

    switch (this.currentUser.providerId) {
      case ('firebase'):
        return this.logoutFirebase();
      case ('password'):
        return this.logoutFirebase();
      case ('google.com'):
        return this.logoutGoogle();
      case ('google'):
        return this.logoutGoogle();
      case ('facebook.com'):
        return this.logoutFacebook();
      case ('facebook'):
        return this.logoutFacebook();
      case ('apple-id'):
        return Promise.reject(getError('not-implemented'));
      default:
        return Promise.reject(getError('unknown-auth-provider', this.currentUser.providerId));
    }
  }

  private logoutFirebase() {
    return this.afAuth.auth.signOut();
  }

  private logoutGoogle() {
    if (this.platform.is('cordova')) {
      return this.google.logout();
    } else {
      return this.afAuth.auth.signOut();
    }
  }

  private logoutFacebook() {
    if (this.platform.is('cordova')) {
      return this.fb.logout();
    } else {
      return this.afAuth.auth.signOut();
    }
  }

  onSignIn(googleUser) {
    console.log(logger.debug('Google Auth Response', googleUser));
    // We need to register an Observer on Firebase Auth to make sure auth is initialized.
    let unsubscribe = this.afAuth.auth.onAuthStateChanged((firebaseUser) => {
      unsubscribe();
      // Check if we are already signed-in Firebase with the correct user.
      if (!AuthProvider.isGoogleUserEqual(googleUser, firebaseUser)) {
        // Build Firebase credential with the Google ID token.
        let credential = auth.GoogleAuthProvider.credential(
          googleUser.getAuthResponse().id_token);
        // Sign in with credential from the Google user.
        this.afAuth.auth.signInWithCredential(credential).catch((error) => {
          // Handle Errors here.
          let errorCode = error.code;
          let errorMessage = error.message;
          // The email of the user's account used.
          let email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          let credential = error.credential;
          console.error(logger.error(errorCode, errorMessage, email, credential));
          // ...
        });
      } else {
        console.log(logger.debug('User already signed-in Firebase.'));
      }
    });
  }

  static isGoogleUserEqual(googleUser, firebaseUser) {
    console.log(logger.debug('Compare users', googleUser, firebaseUser));
    return false
  }

  changePassword() {
    if (!this.currentUser) {
      // ??? String
      return Promise.reject(getError('unauthorized'));

    }

    // ??? String
    let newPassword = window.prompt("New password?");

    return this.currentUser.updatePassword(newPassword)
      .catch(reason => {
        if (reason.code === 'auth/requires-recent-login') {
          return this.reauthenticate()
            .then(() => this.currentUser.updatePassword(newPassword))
        } else {
          return Promise.reject(reason);
        }
      })
      .then(() => {
        // ??? String
        alert('New password is ' + newPassword);
      })
      .catch((reason) => {
        console.error(logger.error(reason));
        return Promise.reject(reason);
      });
  }

  deleteAccount() {
    if (!this.currentUser) {
      return Promise.reject(getError('unauthorized'));
    }

    if (!this.isDeveloper) {
      return Promise.reject(getError('not-developer'));
    }

    this.currentUser.delete()
      .catch(reason => {
        if (reason.code === 'auth/requires-recent-login') {
          return this.reauthenticate()
            .then(() => this.currentUser.delete());
        } else {
          return Promise.reject(reason);
        }
      })
      .catch(reason => {
        console.error(logger.error(reason));
        return Promise.reject(reason);
      });
  }

  reauthenticate() {
    // ??? String
    alert('You need to re-authenticate a user.');

    return this.prompt()
      .then(result => this.currentUser.reauthenticateWithCredential(result.credential));
  }

  prompt() {
    let provider = AuthProvider.getUserProvider(this.currentUser);

    if (provider === 'unknown') {
      return Promise.reject(getError('unknown-auth-provider', 'unknown'));
    } else if (provider === 'firebase') {
      // ??? String
      let email = window.prompt("Email?");
      // ??? String
      let password = window.prompt("Password?");

      return this.afAuth.auth.signInWithEmailAndPassword(email, password);
    } else {
      return this.login(provider);
    }
  }

  isAuthorized() {
    return new Promise((resolve => {
      let unsubscribe = this.afAuth.auth.onAuthStateChanged((user) => {
        unsubscribe();
        this.currentUser = user;
        if (user) {
          // User is signed in.
          console.log(logger.debug('User is authorized!'));
          resolve(true);
        } else {
          console.log(logger.debug('User is unauthorized!'));
          resolve(false);
        }
      });
    }));
  }

  isUnauthorized() {
    return this.isAuthorized().then(status => !status);
  }

  private smartCreate(provider, params): Promise<auth.UserCredential> {
    switch (provider) {
      case ('firebase'):
        return this.createWithEmail(params);
      case ('password'):
        return this.createWithEmail(params);
      case ('google'):
        return this.createWithGoogle();
      case ('google.com'):
        return this.createWithGoogle();
      case ('facebook'):
        return this.createWithFacebook();
      case ('facebook.com'):
        return this.createWithFacebook();
      case ('apple-id'):
        return Promise.reject(getError('not-implemented'));
      default:
        return Promise.reject(getError('unknown-auth-provider', provider));
    }
  }

  createWithEmail(form: AuthForm) {
    let error = form.getError();
    if (error) {
      return Promise.reject(error);
    } else {
      return this.afAuth.auth.createUserWithEmailAndPassword(form.email, form.password);
    }
  }

  createWithGoogle() {
    return this.loginWithGoogle();
  }

  createWithFacebook() {
    return this.loginWithFacebook();
  }

  static getUserProvider(user: User): string {
    if (user) {
      if (user.providerData) return user.providerData[0].providerId;
      return user.providerId;
    } else {
      return 'unknown';
    }
  }

  // test() {
  //   // Step 1.
  //   // User tries to sign in to Google.
  //   this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider())
  //     .catch((error) => {
  //       // An error happened.
  //       if (error.code === 'auth/account-exists-with-different-credential') {
  //         // Step 2.
  //         // User's email already exists.
  //         // The pending Google credential.
  //         let pendingCred = error.credential;
  //         // The provider account's email address.
  //         let email = error.email;
  //         // Get sign-in methods for this email.
  //         this.afAuth.auth.fetchSignInMethodsForEmail(email)
  //           .then((methods) => {
  //             // Step 3.
  //             // If the user has several sign-in methods,
  //             // the first method in the list will be the "recommended" method to use.
  //             if (methods[0] === 'password') {
  //               // Asks the user their password.
  //               // In real scenario, you should handle this asynchronously.
  //               let password = this.promptUserForPassword(); // TODO: implement promptUserForPassword.
  //               this.afAuth.auth.signInWithEmailAndPassword(email, password)
  //                 .then((user) => {
  //                   // Step 4a.
  //                   return user.user.linkWithCredential(pendingCred);
  //                 })
  //                 .then(() => {
  //                   // Google account successfully linked to the existing Firebase user.
  //                   this.goToApp();
  //                 });
  //               return;
  //             }
  //             // All the other cases are external providers.
  //             // Construct provider object for that provider.
  //             // TODO: implement getProviderForProviderId.
  //             let provider = this.getProviderForProviderId(methods[0]);
  //             // At this point, you should let the user know that he already has an account
  //             // but with a different provider, and let him validate the fact he wants to
  //             // sign in with this provider.
  //             // Sign in to provider. Note: browsers usually block popup triggered asynchronously,
  //             // so in real scenario you should ask the user to click on a "continue" button
  //             // that will trigger the signInWithPopup.
  //             this.afAuth.auth.signInWithPopup(provider)
  //               .then((result) => {
  //                 // Remember that the user may have signed in with an account that has a different email
  //                 // address than the first one. This can happen as Firebase doesn't control the provider's
  //                 // sign in flow and the user is free to login using whichever account he owns.
  //                 // Step 4b.
  //                 // Link to Google credential.
  //                 // As we have access to the pending credential, we can directly call the link method.
  //                 result.user.linkWithCredential(pendingCred)
  //                   .then((userCredentials) => {
  //                     // Google account successfully linked to the existing Firebase user.
  //                     this.goToApp();
  //                   });
  //               });
  //           });
  //       }
  //     });
  // }
  //
  // promptUserForPassword() {
  //   return '';
  // }
  //
  // getProviderForProviderId(id) {
  //   if (id === 'google') {
  //     return new auth.GoogleAuthProvider();
  //   }
  //
  //   if (id === 'facebook') {
  //     return new auth.FacebookAuthProvider();
  //   }
  //
  //   return null;
  // }
  //
  // goToApp() {
  //   alert('Go to app.');
  // }

  // test2() {
  //   this.afAuth.auth.getRedirectResult()
  //     .then((result) => {
  //       if (result.credential) {
  //         // This gives you a Facebook Access Token. You can use it to access the Facebook API.
  //         // let token = result.credential.accessToken;
  //         // ...
  //       }
  //       // The signed-in user info.
  //       let user = result.user;
  //     })
  //     .catch((error) => {
  //       // Handle Errors here.
  //       let errorCode = error.code;
  //       let errorMessage = error.message;
  //       // The email of the user's account used.
  //       let email = error.email;
  //       // The firebase.auth.AuthCredential type that was used.
  //       let credential = error.credential;
  //       // ...
  //     });
  // }
  //
  // googleLogin() {
  //   this.google.login({})
  //     .then(res => console.log(res))
  //     .catch(err => console.error(err))
  // }
  //
  // googleTrySilentLogin() {
  //   this.google.trySilentLogin({})
  //     .then(res => console.log(res))
  //     .catch(err => console.error(err))
  // }
  //
  // googleLogout() {
  //   this.google.logout()
  //     .then(res => console.log(res))
  //     .catch(err => console.error(err))
  // }
  //
  // googleDisconnect() {
  //   this.google.disconnect()
  //     .then(res => console.log(res))
  //     .catch(err => console.error(err))
  // }
  //
  // facebookLogin() {
  //   this.fb.login(['public_profile', 'email'])
  //     .then((res: FacebookLoginResponse) => console.log('Logged into Facebook!', res.status, JSON.stringify(res.authResponse)))
  //     .catch(e => console.log('Error logging into Facebook', e));
  // }
  //
  // facebookLogout() {
  //   this.fb.logout()
  //     .then(() => console.log('Logged out!'))
  //     .catch(e => console.log('Error logging into Facebook', e));
  // }
  //
  // facebookGetStatus() {
  //   this.fb.getLoginStatus()
  //     .then((res) => console.log('Get Status!', res.status, JSON.stringify(res.authResponse)))
  //     .catch(e => console.log('Error logging into Facebook', e));
  // }

  // presentPrompt() {
  //   let alert = this.alertCtrl.create({
  //     title: 'Login',
  //     inputs: [
  //       {
  //         name: 'username',
  //         placeholder: 'Username'
  //       },
  //       {
  //         name: 'password',
  //         placeholder: 'Password',
  //         type: 'password'
  //       }
  //     ],
  //     buttons: [
  //       {
  //         text: 'Cancel',
  //         role: 'cancel',
  //         handler: data => {
  //           console.log('Cancel clicked');
  //         }
  //       },
  //       {
  //         text: 'Login',
  //         handler: data => {
  //           if (User.isValid(data.username, data.password)) {
  //             // logged in!
  //           } else {
  //             // invalid login
  //             return false;
  //           }
  //         }
  //       }
  //     ]
  //   });
  //   alert.present();
  // }
}
