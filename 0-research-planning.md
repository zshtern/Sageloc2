# 0 - Research and Planning

## 1. Cross platform solution

We will try to create our solution using Ionic Framework. It will give us ability to use same codebase for Android, iOS and Web.

Currently we use Ionic v3.9.6 (Angular v4.4.3). Last version of Ionic is 4.4.2.

**! Note:** We should think about ability to upgrade Ionic version.
[Guide for Migrating](https://blog.ionicframework.com/a-guide-for-migrating-to-ionic-4-0/)

## 2. Background location updates

Our application should support foreground and background location updates.

### Ionic/Cordova

Currently we use [Cordova Background Geolocation Plugin](https://github.com/mauron85/cordova-plugin-background-geolocation) to get location updates in foreground and background.

**! Note:** This plugin doesn't work if application was terminated.

This plugin can be used to create our own solution.

[Web Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)

### iOS

[CLLocationManager](https://developer.apple.com/documentation/corelocation/cllocationmanager) is a keystone of iOS implementation of background updates.

### Android

???

## 3. Activity detector native API research

Activity is a type of user motion: walking, cycling or driving.

### Ionic/Cordova

[DeviceMotionEvent](https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent)

### iOS

We should check this class [CMMotionActivity](https://developer.apple.com/documentation/coremotion/cmmotionactivity).

### Android

[Web DetectedActivity](https://developers.google.com/android/reference/com/google/android/gms/location/DetectedActivity)

[Web LinearAccelerationSensor](https://developer.mozilla.org/en-US/docs/Web/API/LinearAccelerationSensor)

## 4. Acceleration sensor native API research

### Ionic/Cordova

[Web DeviceAcceleration](https://developer.mozilla.org/en-US/docs/Web/API/DeviceAcceleration)

### iOS

???

### Android

???

## 5. Step detector/counter native API research

### Ionic/Cordova

???

### iOS

???

### Android

???

## 6. Connection between native and ionic parts

https://cordova.apache.org/docs/en/latest/guide/hybrid/plugins/

## 7. Push notifications

OneSignal?

## 8. Direct connection between devices

???

## 9. Minimize handling

???

## 10. Restart handling

???

## 11. Service kill handling