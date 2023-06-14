import {throwError} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {Logger} from "../../providers/log-manager/log-manager";

const logger = new Logger('[Utils]');

// ???
export function loadMapScript(apiKey) {
  const script = document.createElement("script");
  const apiKeyQuery = apiKey ? `key=${apiKey}&` : '';
  console.log(logger.debug(apiKeyQuery));
  script.id = "googleMaps";
  script.src = `http://maps.google.com/maps/api/js?callback=mapInit`;
  document.body.appendChild(script);
}


export function handleError(error: HttpErrorResponse) {
  console.log(logger.error(error));
  return throwError(error.status || 'Server error');
}

// This function returns a DOMHighResTimeStamp, measured in milliseconds.
// The returned value represents the time elapsed since the time origin.
// It can be fell back to Date.now().
export let sgtimestamp = (): number => Date.now();
if (window.performance.now) {
  sgtimestamp = () => window.performance.now();
  document.addEventListener("deviceready", () => {
    console.log(logger.debug("Using high performance timer"));
  }, false);
} else {
  document.addEventListener("deviceready", () => {
    console.log(logger.debug("Using low performance timer"));
  }, false);
}
