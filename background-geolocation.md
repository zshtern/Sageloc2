### Background Location Error (iOS)
```

=================================================================
Main Thread Checker: UI API called on a background thread: -[UIApplication scheduleLocalNotification:]
PID: 4219, TID: 1400459, Thread name: (none), Queue name: com.apple.root.default-qos, QoS: 0
Backtrace:
4   Sageloc                             0x0000000104cd731c -[LocationManager notify:] + 304
5   Sageloc                             0x0000000104cd4820 -[LocationManager sync:] + 568
6   Sageloc                             0x0000000104cd3c24 -[LocationManager flushQueue] + 728
7   Sageloc                             0x0000000104cd45c8 -[LocationManager stopBackgroundTask] + 216
8   Sageloc                             0x0000000104cd2850 -[LocationManager finish] + 148
9   Sageloc                             0x0000000104c9a584 __35-[CDVBackgroundGeolocation finish:]_block_invoke + 68
10  libdispatch.dylib                   0x0000000105f2f6f0 _dispatch_call_block_and_release + 24
11  libdispatch.dylib                   0x0000000105f30c74 _dispatch_client_callout + 16
12  libdispatch.dylib                   0x0000000105f33ad4 _dispatch_queue_override_invoke + 876
13  libdispatch.dylib                   0x0000000105f41dc8 _dispatch_root_queue_drain + 372
14  libdispatch.dylib                   0x0000000105f427ac _dispatch_worker_thread2 + 156
15  libsystem_pthread.dylib             0x000000019a28d1b4 _pthread_wqthread + 464
16  libsystem_pthread.dylib             0x000000019a28fcd4 start_wqthread + 4
```

### Cordova Location Relaunch Modifications

#### Fix `platforms/ios/CordovaLib/Classes/Public/CDVAppDelegate.h`
```
- @interface CDVAppDelegate : NSObject <UIApplicationDelegate>{}
+ @interface CDVAppDelegate : UIResponder <UIApplicationDelegate, CLLocationManagerDelegate>

+ @property (nonatomic, strong) CLLocationManager * locationManager;
+ @property (nonatomic, strong) CLLocation *currentLocation;
```

#### Fix `platforms/ios/CordovaLib/Classes/Public/CDVAppDelegate.m`

Add to `didFinishLaunchingWithOptions`:
```
    // Override point for customization after application launch.
    NSLog(@"app did finish launching");

    UNUserNotificationCenter *center2 = [UNUserNotificationCenter currentNotificationCenter];

    UNAuthorizationOptions options = UNAuthorizationOptionAlert + UNAuthorizationOptionSound;

    [center2 requestAuthorizationWithOptions:options completionHandler:^(BOOL granted, NSError * _Nullable error) {
        if (!granted) {
            NSLog(@"Something went wrong");
        } else {
            NSLog(@"local notification granted");
        }
    }];

    UNMutableNotificationContent* content = [[UNMutableNotificationContent alloc] init];
    content.title = [NSString localizedUserNotificationStringForKey:@"Launching!" arguments:nil];
    content.body = [NSString localizedUserNotificationStringForKey:@"Launching" arguments:nil];
    content.sound = [UNNotificationSound defaultSound];
    content.threadIdentifier = @"new location";

    // Deliver the notification in five seconds.
    UNTimeIntervalNotificationTrigger* trigger = [UNTimeIntervalNotificationTrigger triggerWithTimeInterval:1 repeats:NO];
    UNNotificationRequest* request = [UNNotificationRequest requestWithIdentifier:@"launcing" content:content trigger:trigger];

    // Schedule the notification.
    UNUserNotificationCenter* center1 = [UNUserNotificationCenter currentNotificationCenter];
    [center1 addNotificationRequest:request withCompletionHandler:^(NSError * _Nullable error) {
        if (error != nil) {
            NSLog(@"Something went wrong: %@",error);
        } else {
            NSLog(@"notification sent");
        }
    }];

    if([CLLocationManager locationServicesEnabled]){
        NSLog(@"location service enabaled");
        _currentLocation = [[CLLocation alloc] init];
        _locationManager = [[CLLocationManager alloc] init];
        _locationManager.delegate = self;

        /* Pinpoint our location with the following accuracy:
         *
         *     kCLLocationAccuracyBestForNavigation  highest + sensor data
         *     kCLLocationAccuracyBest               highest
         *     kCLLocationAccuracyNearestTenMeters   10 meters
         *     kCLLocationAccuracyHundredMeters      100 meters
         *     kCLLocationAccuracyKilometer          1000 meters
         *     kCLLocationAccuracyThreeKilometers    3000 meters
         */
        self.locationManager.desiredAccuracy = kCLLocationAccuracyBestForNavigation;

        /* Notify changes when device has moved x meters.
         * Default value is kCLDistanceFilterNone: all movements are reported.
         */
        self.locationManager.distanceFilter = 0.0f;

        [_locationManager requestAlwaysAuthorization];
        _locationManager.pausesLocationUpdatesAutomatically = false;
        _locationManager.allowsBackgroundLocationUpdates = true;
        [_locationManager startUpdatingLocation];
        [_locationManager startMonitoringSignificantLocationChanges];
    } else {
        NSLog(@"location service disabled");
    }

    if([CLLocationManager significantLocationChangeMonitoringAvailable]){
        NSLog(@"location significant location change is available");
    } else {
        NSLog(@"location significant location change is not available");
    }
```

Add before `@end`:
```
-(void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray<CLLocation *> *)locations {
    NSInteger n = [locations count];
    CLLocation *l = locations[n-1];
    CLLocationDistance d = [_currentLocation distanceFromLocation: l];
    CLLocationCoordinate2D c = l.coordinate;
    _currentLocation = l;
    NSString *message = [NSString stringWithFormat:@"n:%ld; l:%f, %f, d:%f (%f); a: %f (%f)", n, c.latitude, c.longitude, d, l.horizontalAccuracy, l.altitude, l.verticalAccuracy];

    NSLog(@"%@", message);
    UNMutableNotificationContent* content = [[UNMutableNotificationContent alloc] init];
    content.title = [NSString localizedUserNotificationStringForKey:@"New Location!" arguments:nil];
    content.body = [NSString localizedUserNotificationStringForKey:message arguments:nil];
    content.sound = [UNNotificationSound defaultSound];
    content.threadIdentifier = @"new location";

    // Deliver the notification in five seconds.
//    UNTimeIntervalNotificationTrigger* trigger = [UNTimeIntervalNotificationTrigger triggerWithTimeInterval:5 repeats:NO];
    NSString *norificationId = [NSString stringWithFormat:@"location-%@", l.timestamp];
    UNNotificationRequest* request = [UNNotificationRequest requestWithIdentifier:norificationId content:content trigger:nil];

    // Schedule the notification.
    UNUserNotificationCenter* center = [UNUserNotificationCenter currentNotificationCenter];
    [center addNotificationRequest:request withCompletionHandler:^(NSError * _Nullable error) {
        if (error != nil) {
            NSLog(@"Something went wrong: %@",error);
        }
    }];
}

- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error {
    NSLog(@"Locatioin Error: %@", error);
}

- (void)locationManager:(CLLocationManager *)manager didFinishDeferredUpdatesWithError:(NSError *)error {
    NSLog(@"Locatioin Error: %@", error);
}
```

#### Fix `platforms/ios/Sageloc/Plugins/cordova-plugin-mauron85-background-geolocation/LocationManager.m`

Remove all `stopMonitoringSignificantLocationChanges`

### Relaunch

https://stackoverflow.com/questions/33368607/ios9-startmonitoringsignificantlocationchanges-doesnt-launch-app-when-terminate
https://stackoverflow.com/questions/31000387/customizing-ioss-applicationdidfinishlaunchingwithoptions-method-in-a-cordova
https://developer.apple.com/documentation/uikit/core_app/managing_your_app_s_life_cycle/responding_to_the_launch_of_your_app

https://stackoverflow.com/questions/31000387/customizing-ioss-applicationdidfinishlaunchingwithoptions-method-in-a-cordova