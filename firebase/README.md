
# Functions

[Official Documentation](https://firebase.google.com/docs/functions)

## Installation

[Official Documentation](https://firebase.google.com/docs/functions/get-started)

At first you should install firebase-tools. According to documentation Node.js 8 is strongly recommended.

    npm install -g firebase-tools
    firebase login

Project name: `sageloc-70f8e`

Developers: 
 - captain@shterns.com
 - keksov@gmail.com
 - s.panpurin@gmail.com

## TypeScript

[Official Documentation](https://firebase.google.com/docs/functions/typescript)

Run `npm run build` inside your functions directory to compile TypeScript code.

## Emulating

To test functions locally use one of next commands:

    cd functions
    npm run serve
    firebase serve --only functions
    firebase emulators:start --only functions
    firebase functions:shell --only functions
    
## Run emulator

    export GOOGLE_APPLICATION_CREDENTIALS="path/to/key.json"
    firebase emulators:start --only functions
    firebase serve --only functions
    
## Deploy

    firebase deploy --only functions
    
## Testing

    npm install --save-dev firebase-functions-test
    npm install --save-dev mocha
    
## Debug

    npm install -g @google-cloud/functions-emulator
    
    functions inspect getChildCode --port 6000
    
    curl -d '{"key1":"value1", "key2":"value2"}' -H "Content-Type: application/json" -X POST http://localhost:8010/sageloc-70f8e/us-central1/getChildCode
    
    https://medium.com/@mwebler/debugging-firebase-functions-with-vs-code-3afab528bb36
    https://medium.com/@david_mccoy/build-and-debug-firebase-functions-in-vscode-73efb76166cf
