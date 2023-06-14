import { Injector } from '@angular/core';

// Static Injector
let appInjectorRef: Injector;

export const setInjector = (injector?: Injector) => {
    if (injector) {
        appInjectorRef = injector;
    }
};


export const getInjector = (): Injector => {
    return appInjectorRef;
};


export class InjectUtils {
    static getService(service) {
        return appInjectorRef.get(service);
    }
}
