import * as express from "express";
import * as admin from "firebase-admin";

interface ILocation {
    accuracy: number;
    altitude: number;
    altitudeAccuracy: number;
    bearing: number;
    latitude: number;
    locationProvider: string;
    longitude: number;
    provider: string;
    radius: number;
    speed: number;
    time: number;
    user: string;
}

export function saveLocations(req: express.Request, res: express.Response) {
    console.log(JSON.stringify(req.body));

    const batch = admin.firestore().batch();

    const locations: ILocation[] = req.body || [];

    locations.forEach((location) => {
        batch.set(admin.firestore().collection('location').doc(), {
            accuracy: location.accuracy || 0,
            altitude: location.altitude || 0,
            altitudeAccuracy: location.altitudeAccuracy || 0,
            bearing: location.bearing || 0,
            latitude: location.latitude || 0,
            locationProvider: location.locationProvider || '',
            longitude: location.longitude || 0,
            provider: location.provider || '',
            radius: location.radius || 0,
            speed: location.speed || 0,
            time: location.time || 0,
            user: location.user || ''
        });
    });

    batch.commit()
        .then(() => {
            console.log('Saved');
            res.end('OK');
        })
        .catch((error) => {
            console.error(error);
            res.end();
        });

}