import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import {saveLocations} from "./location";
import {approveChildCode, approveParentCode, getChildCode, getParentCode} from "./friendship";

const app = express();

const validateFirebaseIdToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log('Check if request is authorized with Firebase ID token');

    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
            'Make sure you authorize your request by providing the following HTTP header:',
            'Authorization: Bearer <Firebase ID Token>',
            'or by passing a "__session" cookie.');
        res.status(403).send('Unauthorized');
        return;
    }

    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        console.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else if (req.cookies) {
        console.log('Found "__session" cookie');
        // Read the ID Token from cookie.
        idToken = req.cookies.__session;
    } else {
        // No cookie
        res.status(403).send('Unauthorized');
        return;
    }

    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        console.log('ID Token correctly decoded', decodedIdToken);
        // @ts-ignore
        req.user = decodedIdToken;
        next();
        return;
    } catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        res.status(403).send('Unauthorized');
        return;
    }
};

app.use(cors({origin: true}));
app.use(cookieParser());
app.use(validateFirebaseIdToken);
app.get('/hello', (req, res) => {
    // @ts-ignore
    res.send(`Hello ${req.user.email}`);
});
app.post('/hello', (req, res) => {
    // @ts-ignore
    res.send(`Hello ${req.user.email}`);
});

app.post('/location/sync', (req, res) => {
    console.log(req.body);
    res.send('OK');
});

exports.app = functions.https.onRequest(app);

exports.getChildCode = functions.https.onCall(getChildCode);
exports.getParentCode = functions.https.onCall(getParentCode);
exports.approveChildCode = functions.https.onCall(approveChildCode);
exports.approveParentCode = functions.https.onCall(approveParentCode);

exports.location = functions.https.onRequest(saveLocations);
exports.synchronization = functions.https.onRequest(saveLocations);

// [START addMessage]
// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
// [START addMessageTrigger]
exports.addMessage = functions.https.onRequest(async (req, res) => {
// [END addMessageTrigger]
  // Grab the text parameter.
  const original = req.query.text;
  // [START adminSdkPush]
  // Push the new message into the Realtime Database using the Firebase Admin SDK.
  const snapshot = await admin.database().ref('/messages').push({original: original});
  // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
  res.redirect(303, snapshot.ref.toString());
  // [END adminSdkPush]
});
// [END addMessage]

// [START makeUppercase]
// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.makeUppercase = functions.database.ref('/messages/{pushId}/original')
  .onCreate((snapshot, context) => {
    // Grab the current value of what was written to the Realtime Database.
    const original = snapshot.val();
    console.log('Uppercasing', context.params.pushId, original);
    const uppercase = original.toUpperCase();
    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to the Firebase Realtime Database.
    // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
    if (snapshot.ref.parent)
      return snapshot.ref.parent.child('uppercase').set(uppercase);
    else
      return null;
  });
// [END makeUppercase]
// [END all]
