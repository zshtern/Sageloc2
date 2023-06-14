# Ionic 3 Sageloc

## Usage

### Clone This Project

Simply clone this project and use it as it is, or rename it to whatever you like.
```
git clone https://zshtern.visualstudio.com/DefaultCollection/Aliens/_git/Sageloc2
```

### Install Dependencies

Install all the dependencies (this only needs to be done once)

```
install nodejs + npm
npm i -g webpack webpack-dev-server ionic cordova
cd Sageloc2
npm install
```

### Local Development Server

To start a local development web server with automatic refresh type:
```
ionic serve
```


### Update Dependencies

It's possible to use `npm update` to update current dependencies according to package.json settings. See [about-semantic-versioning](https://docs.npmjs.com/about-semantic-versioning).

Command `npm outdated` can help to see outdated packages.

### Upgrade Dependencies

Sometimes it may be necessary to update the dependency to a later version. The following command can be used for this: `npm i -s package@latest` or `npm i -s package@a.b.c`.

### NPM Issues

New version of `npm` generate `package-lock.json` file. It should help to optimize npm dependencies, but sometimes it could cause merge conflicts.
See [documentaion](https://docs.npmjs.com/files/package-lock.json) for more details.

### Prepare resources

Ionic CLI has a special command for preparing application resources: an icon and a splash screen. It must be run once before building the application. You may need to run it again if the Ionic CLI has been updated.

```
ionic cordova resources
```

See [documentation](https://ionicframework.com/docs/cli/commands/cordova-resources)

### Build iOS version

Xcode 10 has a new build system. It is not compatible with current version of Cordova. Legacy mode should be used.

```
Xcode Files -> Project/Workspace Settings -> Legacy Build System

ionic cordova build ios -- --buildFlag="-UseModernBuildSystem=0"
```

### Build Android application

It's required JDK 1.8 and Gradle 4.1 (-5.4.1-).

```
ionic cordova platform rm android
ionic cordova platform add android
ionic cordova build android
```

```
Known issues

1. Missing toolchain

Symptom:
"A problem occurred configuring project ':CordovaLib'. No toolchains found in the NDK toolchains folder for ABI with prefix: mips64el-linux-android"

Root cause:
NDK changed toolchains structure.

Solution:
Duplicate existing toolchains (either links, or real copy), links for MAC:
at .../sdk/ndk-bundle/toolchains
ln -s aarch64-linux-android-4.9 mips64el-linux-android
ln -s arm-linux-androideabi-4.9 mipsel-linux-android

Reference:
https://stackoverflow.com/questions/35128229/error-no-toolchains-found-in-the-ndk-toolchains-folder-for-abi-with-prefix-llv



2. Failure to install on android

Symptom:
"During ionic run android: Failure [INSTALL_FAILED_UPDATE_INCOMPATIBLE]"

Root cause:
Previous version of the same application is already installed on device.

Solution:
Has to remove previous version of the app (if adb below is not found look for it at: ...sdk\platform-tools):

To get list of installed apps: 
   adb shell pm list packages > c:\packages.txt

Look for “sageloc”, should be present in the txt file - copy the package name (com.sageloc.app)

Remove the app from device by:
		adb uninstall com.sageloc.app

Get the packages again and double check that the app is removed.
```



### Ionic Info

Command `ionic info` prints project, system, and environment information. It could be useful for troubleshooting.

```
Ionic:

   ionic (Ionic CLI)  : 4.2.1 (/usr/local/lib/node_modules/ionic)
   Ionic Framework    : ionic-angular 2.0.0
   @ionic/app-scripts : 1.3.12

Cordova:

   cordova (Cordova CLI) : 8.1.2 (cordova-lib@8.1.1)
   Cordova Platforms     : ios 5.0.1
   Cordova Plugins       : no whitelisted plugins (6 plugins total)

System:

   ios-deploy : 1.9.4
   ios-sim    : 8.0.1
   NodeJS     : v8.11.3 (/usr/local/bin/node)
   npm        : 6.4.1
   OS         : macOS
   Xcode      : Xcode 10.2.1 Build version 10E1001
```


### Cordova Plugins

List of current plugins:
```
cordova-plugin-compat 1.2.0 "Compat"
cordova-plugin-customurlscheme 4.4.0 "Custom URL scheme"
cordova-plugin-device 1.1.7 "Device"
cordova-plugin-file 4.3.3 "File"
cordova-plugin-geolocation 4.0.1 "Geolocation"
cordova-plugin-inappbrowser 2.0.2 "InAppBrowser"
cordova-plugin-ionic-webview 1.2.1 "cordova-plugin-ionic-webview"
cordova-plugin-locationservices 2.1.0 "Google Location Services for Cordova - Android"
cordova-plugin-mauron85-background-geolocation 2.3.6 "CDVBackgroundGeolocation"
cordova-plugin-safariviewcontroller 1.6.0 "SafariViewController"
cordova-plugin-splashscreen 4.1.0 "Splashscreen"
cordova-plugin-statusbar 2.4.2 "StatusBar"
cordova-plugin-vibration 2.1.6 "Vibration"
cordova-plugin-whitelist 1.3.3 "Whitelist"
cordova-sqlite-storage 2.6.0 "Cordova sqlite storage plugin"
ionic-plugin-keyboard 2.2.1 "Keyboard"
```

### Old Cordova plugins

During project refreshing part of plugins was removed from project:
```
cordova-plugin-console (deprecated)

onesignal-cordova-plugin (temporary disabled)
net.texh.cordovapluginstepcounter@https://github.com/Slidee/cordova-plugin-stepcounter (temporary disabled)
cordova-plugin-googlemaps (temporary disabled)
com.googlemaps.ios (temporary disabled)
```

### Auth0 installation

Auth0 provides authentication and authorization as a service. [website](http://auth0.com/)

Account connected to s.panpurin@gmail.com. We need two applications. One for native application, another for web version.

Authorization require next plugins:

cordova-plugin-inappbrowser - open login dialog
cordova-plugin-safariviewcontroller - open login dialog on iOS
cordova-plugin-customurlscheme - handle custom url scheme
cordova-plugin-ionic-webview - add web view for cordova (not sure that it's necessary)

Plugin cordova-plugin-customurlscheme requires some parameters. It should take it from config.xml. It something gone wrong it may be necessary to reinstall plugin.

```
ionic cordova plugin remove cordova-plugin-customurlscheme
ionic cordova plugin add cordova-plugin-customurlscheme --variable URL_SCHEME=com.sageloc.app --variable ANDROID_SCHEME=com.sageloc.app --variable ANDROID_HOST=sageloc.auth0.com --variable ANDROID_PATHPREFIX=/cordova/com.sageloc.app/callback
```

Additional settings should be added to next file `/src/services/auth.config.ts`

Web version of Auth0 requires callback URL. It has a next format: `domain.name/callback#access-data`. By default `ionic serve` does not support this kind of routes (dev server try to load assets instead of redirection to application). This issue can be fixed by using proxy settings of ionic.config.json.

```
"proxies": [
    {
      "path": "/callback",
      "proxyUrl": "http://localhost:8100/#/callback"
    }
  ]
```

Callback route is implemented via IonicPageModule and Lazy Loading concept.

### Ionic CLI

[Ionic CLI (GitHub)](https://github.com/ionic-team/ionic-cli), [Ionic CLI (Doc)](https://ionicframework.com/docs/cli), 

I suggest to use `ionic generate` to generate new components.

### Ionic CLI Ionic App Scripts

[Ionic App Scripts (GitHub)](https://github.com/ionic-team/ionic-app-scripts), [Ionic App Scripts (Doc)](https://ionicframework.com/docs/v3/developer-resources/app-scripts/)

### Production Mode

Best way to enable production mode is to add --prod flag.

```
ionic serve --prod
ionic build --prod
ionic cordova build --prod ios
```


https://forum.ionicframework.com/t/origin-is-ionic-not-http/157763/13

ionic cordova plugin add cordova-plugin-facebook4 --variable APP_ID="725677517850440" --variable APP_NAME="Sageloc"
npm install --save @ionic-native/facebook@4
ionic cordova plugin add cordova-plugin-googleplus --variable REVERSED_CLIENT_ID=com.googleusercontent.apps.593470457740-0g0399pbodm322igvo5n4iniap982rhk
npm install --save @ionic-native/google-plus@4

    FacebookAutoLogAppEventsEnabled
    FacebookAdvertiserIDCollectionEnabled
    
2019-08-07 22:54:29.943714+0300 1Sageloc[4072:1403619] WARN: Native: tried calling Keyboard.hideKeyboardAccessoryBar, but the Keyboard plugin is not installed.
2019-08-07 22:54:29.944060+0300 1Sageloc[4072:1403619] WARN: Install the Keyboard plugin: 'ionic cordova plugin add ionic-plugin-keyboard'


    ANDROID_PLAY_SERVICES_TAGMANAGER_VERSION => com.google.android.gms:play-services-tagmanager
    ANDROID_FIREBASE_CORE_VERSION => com.google.firebase:firebase-core
    ANDROID_FIREBASE_MESSAGING_VERSION => com.google.firebase:firebase-messaging
    ANDROID_FIREBASE_CONFIG_VERSION => com.google.firebase:firebase-config
    ANDROID_FIREBASE_PERF_VERSION => com.google.firebase:firebase-perf
    ANDROID_FIREBASE_AUTH_VERSION => com.google.firebase:firebase-auth
    ANDROID_CRASHLYTICS_VERSION => com.crashlytics.sdk.android:crashlytics
    ANDROID_CRASHLYTICS_NDK_VERSION => com.crashlytics.sdk.android:crashlytics-ndk
    ANDROID_SHORTCUTBADGER_VERSION => me.leolin:ShortcutBadger

    IOS_FIREBASE_CORE_VERSION => Firebase/Core
    IOS_FIREBASE_AUTH_VERSION => Firebase/Auth
    IOS_FIREBASE_MESSAGING_VERSION => Firebase/Messaging
    IOS_FIREBASE_PERFORMANCE_VERSION => Firebase/Performance
    IOS_FIREBASE_REMOTECONFIG_VERSION => Firebase/RemoteConfig
    IOS_FABRIC_VERSION => Fabric
    IOS_CRASHLYTICS_VERSION => Crashlytics

    cordova plugin add cordova-plugin-firebasex \
        --variable ANDROID_PLAY_SERVICES_TAGMANAGER_VERSION=17.0.0 \
        --variable ANDROID_FIREBASE_CORE_VERSION=17.0.0 \
        --variable ANDROID_FIREBASE_MESSAGING_VERSION=19.0.0 \
        --variable ANDROID_FIREBASE_CONFIG_VERSION=18.0.0 \
        --variable ANDROID_FIREBASE_PERF_VERSION=18.0.0 \
        --variable ANDROID_FIREBASE_AUTH_VERSION=18.0.0 \
        --variable ANDROID_CRASHLYTICS_VERSION=2.10.1 \
        --variable ANDROID_CRASHLYTICS_NDK_VERSION=2.1.0 \
        --variable ANDROID_SHORTCUTBADGER_VERSION=1.1.22 \
        --variable IOS_FIREBASE_CORE_VERSION=5.20.2 \
        --variable IOS_FIREBASE_AUTH_VERSION=5.20.2 \
        --variable IOS_FIREBASE_MESSAGING_VERSION=5.20.2 \
        --variable IOS_FIREBASE_PERFORMANCE_VERSION=5.20.2 \
        --variable IOS_FIREBASE_REMOTECONFIG_VERSION=5.20.2 \
        --variable IOS_FABRIC_VERSION=1.9.0 \
        --variable IOS_CRASHLYTICS_VERSION=3.12.0

2019-08-24 21:06:46.285024+0300 1Sageloc[5866:1421160] Error in Success callbackId: FirebasePlugin882276730 : TypeError: undefined is not an object (evaluating 'this.isStopped')
2019-08-24 21:06:46.285178+0300 1Sageloc[5866:1421160] next@ionic://localhost/build/vendor.js:25072:18
ionic://localhost/build/main.js:6361:21
callbackFromNative@ionic://localhost/cordova.js:288:63
ionic://localhost/plugins/cordova-plugin-ionic-webview/src/www/ios/ios-wkwebview-exec.js:129:35
run@ionic://localhost/build/polyfills.js:3:10149
ionic://localhost/build/polyfills.js:3:20245
runTask@ionic://localhost/build/polyfills.js:3:10844
o@ionic://localhost/build/polyfills.js:3:7901
promiseReactionJob@[native code]
2019-08-24 21:06:46.288527+0300 1Sageloc[5866:1421160] ERROR: Unhandled Promise rejection: undefined is not an object (evaluating 'this.isStopped') ; Zone: <root> ; Task: Promise.then ; Value: TypeError: undefined is not an object (evaluating 'this.isStopped') next@ionic://localhost/build/vendor.js:25072:18
ionic://localhost/build/main.js:6361:21
callbackFromNative@ionic://localhost/cordova.js:288:63
ionic://localhost/plugins/cordova-plugin-ionic-webview/src/www/ios/ios-wkwebview-exec.js:129:35
run@ionic://localhost/build/polyfills.js:3:10149
ionic://localhost/build/polyfills.js:3:20245
runTask@ionic://localhost/build/polyfills.js:3:10844
o@ionic://localhost/build/polyfills.js:3:7901
promiseReactionJob@[native code]

keytool -genkey -v -keystore sageloc-release.keystore -alias sageloc-release -validity 10000
keytool -list -v -keystore sageloc-release.keystore -alias sageloc-release

ionic cordova build android --release -- --keystore=~/Development/GeoProject/sageloc/sageloc-release.keystore --storePassword=MK2018!mk --alias=sageloc-release --password=MK2018!mk

