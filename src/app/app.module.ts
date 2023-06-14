//This is a main angular module of application

import {APP_INITIALIZER, ErrorHandler, NgModule} from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {AppComponent} from './app.component';
import {appPages} from '../pages';
import {GoogleMapComponent} from '../common/components';
import {
  AuthService,
  GlMapService,
  LocationNativeService,
  LocationTracker,
  LogService,
  MessageService,
  MockService,
  ModalService,
  SideMenuService,
  SocketService,
  StorageService,
  UserService,
  UtilsService,
  FirebaseService
} from '../common/service';

import {GlLoader} from '../common/components';
import {HomeService} from '../pages/old/home/service/home.service';
import {Dynamics, PathManager, TravelManager} from '../core';
import {IonicStorageModule} from '@ionic/storage';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {Stepcounter} from '@ionic-native/stepcounter';
import {Geolocation} from '@ionic-native/geolocation';
import {BackgroundGeolocation} from '@ionic-native/background-geolocation';
import {Keyboard} from '@ionic-native/keyboard';
import {File} from '@ionic-native/file';

import {LeafletModule} from '@asymmetrik/angular2-leaflet';
import {MapboxService} from '../common/service/map/mapbox.service';
import {MapBoxPageService} from '../pages/old/mapbox/service/mapbox-page.service';
import {MockLocationService} from '../common/service/location/mock/mock-location.service';
import {AngularFireModule} from 'angularfire2';
// import {FIREBSE_CONFIG} from './config';
import {AngularFireDatabaseModule} from 'angularfire2/database';
import {AngularFireAuthModule} from 'angularfire2/auth';
import {AngularFireFunctionsModule, FUNCTIONS_REGION, FUNCTIONS_ORIGIN} from '@angular/fire/functions';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {AngularFireMessagingModule} from '@angular/fire/messaging';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {environment} from '../environments/environment';

// Internationalization support
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {ComponentsModule} from "../components/components.module";
import {LanguageProvider} from '../providers/language/language';
import {ToastProvider} from '../providers/toast/toast';
import {GooglePlus} from '@ionic-native/google-plus';
import {Facebook} from '@ionic-native/facebook';
import {AuthProvider} from '../providers/auth/auth';
import {UserProfileProvider} from '../providers/user-profile/user-profile';
import {FriendshipProvider} from '../providers/friendship/friendship';
import { Device } from '@ionic-native/device';
import {PushNotificationProvider} from "../providers/push-notification/push-notification";
import {CordovaFirebasePluginProvider} from "../providers/cordova-firebase-plugin/cordova-firebase-plugin";
import {ErrorProvider} from "../providers/error/error";
import {BackgroundGeolocationProvider} from "../providers/background-geolocation/background-geolocation";
import {LogManagerProvider} from "../providers/log-manager/log-manager";
import {AppProvider} from "../providers/app/app";

// The translate loader needs to know where to load i18n files
// in Ionic's static asset pipeline.
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function appInitializer(storageService: StorageService, authService: AuthService): () => Promise<any> {
  return () => {
    return storageService.init()
      .then(() => authService.loadConfig())
  };
}

let providers: any[] = [
  StatusBar,
  SplashScreen,
  Stepcounter,
  BackgroundGeolocation,
  Geolocation,
  Keyboard,
  SideMenuService,
  AuthService,
  GlMapService,
  LocationTracker,
  LocationNativeService,
  UtilsService,
  MessageService,
  UserService,
  SocketService,
  MockService,
  ModalService,
  LogService,
  HomeService,
  Dynamics,
  TravelManager,
  PathManager,
  File,
  StorageService,
  MapboxService,
  MapBoxPageService,
  MockLocationService,
  FirebaseService,
  GooglePlus,
  Facebook,
  {provide: ErrorHandler, useClass: IonicErrorHandler},
  {
    provide: APP_INITIALIZER, useFactory: appInitializer,
    deps: [StorageService, AuthService],
    multi: true
  },
  AppProvider,
  LanguageProvider,
  ToastProvider,
  AuthProvider,
  UserProfileProvider,
  FriendshipProvider,
  PushNotificationProvider,
  CordovaFirebasePluginProvider,
  BackgroundGeolocationProvider,
  ErrorProvider,
  LogManagerProvider,
  Device,
];

if (environment.fire.functions.region) {
  providers.push({provide: FUNCTIONS_REGION, useValue: environment.fire.functions.region});
}

if (environment.fire.functions.origin) {
  providers.push({provide: FUNCTIONS_ORIGIN, useValue: environment.fire.functions.origin});
}

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot(AppComponent, {
      locationStrategy: 'hash',
      scrollAssist: false,
      autoFocusAssist: false,
      // mode: 'ios'
    }),
    IonicStorageModule.forRoot({name: '__livelocaldb',}),

    LeafletModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireFunctionsModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireMessagingModule,
    ComponentsModule
  ],
  declarations: [
    AppComponent,
    GoogleMapComponent,
    GlLoader,
    ...appPages,
  ],
  entryComponents: [
    AppComponent,
    GlLoader,
    ...appPages,
  ],
  exports: [
    GlLoader
  ],
  providers: providers,
  bootstrap: [IonicApp]
})

export class AppModule {
}
