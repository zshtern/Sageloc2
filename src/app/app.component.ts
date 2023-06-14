import {Component, ViewChild} from '@angular/core';
import {Nav, Platform} from 'ionic-angular';

// import {MessageService, SideMenuService, UtilsService} from '../common/service';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {Keyboard} from '@ionic-native/keyboard';

// import {StorageService} from '../common/service';
// import {AuthService} from '../common/service';
// import {AngularFireAuth} from '@angular/fire/auth';

// Pages
// import {LoginPage} from '../pages/old/auth/login/login.page';
// import {LogPage} from '../pages/old/log/log.page';
// import {HomePage} from '../pages/old/home';
// import {LmapPage} from '../pages/old/lmap/lmap.page';
// import {MapboxPage} from '../pages/old/mapbox/mapbox.page';
// import {SelectPathPage} from '../pages/old/paths/select-path.page';
// import {LocationPage} from '../pages/old/location/location.page';

// Internationalization support
import {LanguageProvider} from "../providers/language/language";
import {PushNotificationProvider} from "../providers/push-notification/push-notification";
import {UserProfileProvider} from "../providers/user-profile/user-profile";
import {BackgroundGeolocationProvider} from "../providers/background-geolocation/background-geolocation";
import {Logger} from "../providers/log-manager/log-manager";
import {AppProvider} from "../providers/app/app";

@Component({
  templateUrl: 'app.html'
})

export class AppComponent {

  @ViewChild(Nav) nav: Nav;
  rootPage: any;
  private log: Logger;

  constructor(public platform: Platform,
              private app: AppProvider,
              // private messageService: MessageService,
              // private utilsService: UtilsService,
              // private sideMenuService: SideMenuService,
              private statusBar: StatusBar,
              private keyboard: Keyboard,
              // private storageService: StorageService,
              // private authService: AuthService,
              // private afAuth: AngularFireAuth,
              private splashScreen: SplashScreen,
              private language: LanguageProvider,
              private push: PushNotificationProvider,
              private user: UserProfileProvider,
              private location: BackgroundGeolocationProvider) {

    this.log = new Logger('AppComponent');
    this.platform.ready().then(() => this.initializeApp());
  }

  ionViewDidLoad() {
    void (this);
    console.log(this.log.debug('ionViewDidLoad'));
  }

  ionViewCanEnter() {
    void (this);
    console.log(this.log.debug('ionViewCanEnter'));
    return true;
  }

  ionViewWillEnter() {
    void (this);
    console.log(this.log.debug('ionViewWillEnter'));
  }

  // noinspection JSUnusedGlobalSymbols
  ionViewWillLeave() {
    void (this);
    console.log(this.log.debug('ionViewWillLeave'));
  }

  initializeApp() {
    Promise.resolve()
      .then(() => this.language.initialize())
      .then(() => this.app.initialize())
      .then(() => this.user.initialize())
      .then(() => this.push.initialize())
      .then(() => this.location.initialize())
      .then(() => {
        this.statusBar.styleDefault();
        this.splashScreen.hide();
        this.keyboard.disableScroll(false);
        this.keyboard.hideKeyboardAccessoryBar(true);
        // this.keyboard.hideFormAccessoryBar(true);

        this.rootPage = this.app.getInitialPage();

        /* For future use (Id is our real one)
         GoogleAnalytics.startTrackerWithId('UA-69854996-1')
         .then(() => { // Tracker is ready })
         .catch(e => console.log('Error starting GoogleAnalytics', e));
         */

        // this.messageService.notificationReceived()
        //   .subscribe(message => console.log(message));
        //
        // this.utilsService.startWatchBackgroundState();
        // // this.locationTracker.watchPosition();

        // this.afAuth.auth.getRedirectResult()
        //   .then((result) => {
        //     console.log(result);
        //     if (result.credential) {
        //       // This gives you a Google Access Token.
        //       // You can use it to access the Google API.
        //       let token = result.credential;
        //       // The signed-in user info.
        //       let user = result.user;
        //       // ...
        //     }
        //   })
        //   .catch((error) => {
        //     console.error(error);
        //     // Handle Errors here.
        //     let errorCode = error.code;
        //     let errorMessage = error.message;
        //   });
      });
  }

  // onMenuOpen() {
  //   this.sideMenuService.menuOpen();
  // }
  //
  // onMenuClose() {
  //   this.sideMenuService.menuClose();
  // }
  //
  // signOut() {
  //   this.authService.signOut()
  //     .then(() => this.nav.setRoot(LoginPage));
  // }
  //
  // showLog() {
  //   this.nav.setRoot(LogPage)
  //     .catch((reason) => console.error(reason));
  // }
  //
  // showHomePage() {
  //   this.nav.setRoot(HomePage)
  //     .catch((reason) => console.error(reason));
  // }
  //
  // showLeafletMapPage() {
  //   this.nav.setRoot(LmapPage)
  //     .catch((reason) => console.error(reason));
  // }
  //
  // showMapBoxPage() {
  //   this.nav.setRoot(MapboxPage)
  //     .catch((reason) => console.error(reason));
  // }
  //
  // selectPathPage() {
  //   this.nav.setRoot(SelectPathPage)
  //     .catch((reason) => console.error(reason));
  // }
  //
  // showLocationPage() {
  //   this.nav.setRoot(LocationPage)
  //     .catch((reason) => console.error(reason));
  // }
  //
  // openIonicPage(pageName: String) {
  //   this.nav.push(pageName)
  //     .catch((reason) => console.error(reason));
  // }
}
