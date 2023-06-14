// This file is a main entry point of the application

// import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';
import { setInjector } from '../common';

// Customize default bootstrap to initialize static injector.
platformBrowserDynamic().bootstrapModule(AppModule)
    .then((app) => setInjector(app.injector));

// if (build.mode === 'prod') {
//   enableProdMode();
// }
//
// if (build.target === 'cordova') {
//   document.addEventListener('deviceready', () => bootstrap());
// } else {
//   bootstrap();
// }
