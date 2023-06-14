import { LocationTest } from '../../core/testing/Testing';

export const testingNavigator:any = {geolocation : {}};
testingNavigator.geolocation.delay = 1000;
testingNavigator.geolocation.shouldFail = false;
testingNavigator.geolocation.failsAt = -1;
testingNavigator.geolocation.errorMessage = "There was an error retrieving the position!";
testingNavigator.geolocation.currentTimeout = -1;
testingNavigator.geolocation.lastPosReturned = 0;

testingNavigator.geolocation._sanitizeLastReturned = function() {
  if (this.lastPosReturned > this.waypoints.length - 1) {
    return this.lastPosReturned = 0;
  }
};

testingNavigator.geolocation._geoCall = function(method, success, error) {
  let _this = this;
  let methodToCall:any = window[method];
  if (this.shouldFail && (error != null)) {
    return this.currentTimeout = methodToCall.call(null, function() {
      return error(testingNavigator.geolocation.errorMessage);
    }, this.delay);
  } else {
    if (success != null) {
      return this.currentTimeout = methodToCall.call(null, function() {
        let date = new Date();
        console.log(testingNavigator.geolocation.lastPosReturned);
        let currentLocation = LocationTest.cloneObject(testingNavigator.geolocation.waypoints[testingNavigator.geolocation.lastPosReturned++]);
        currentLocation.timestamp = date.getTime();
        success(currentLocation);
        return testingNavigator.geolocation._sanitizeLastReturned();
      }, this.delay);
    }
  }
};
testingNavigator.geolocation.getCurrentPosition = function(success, error) {
  return testingNavigator.geolocation._geoCall("setTimeout", success, error);
};
testingNavigator.geolocation.watchPosition = function(success, error) {
  testingNavigator.geolocation._geoCall("setInterval", success, error);
  return this.currentTimeout;
};

testingNavigator.geolocation.clearWatch = function(id) {
  return clearInterval(id);
};

testingNavigator.geolocation.waypoints = [
  {
    coords: {
      latitude: 52.5168000,
      longitude: 13.38890,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 1000
  }, {
    coords: {
      latitude: 52.5167990,
      longitude: 13.38901,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 2000
  }, {
    coords: {
      latitude: 52.5168000,
      longitude: 13.38910,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 3000
  }, {
    coords: {
      latitude: 52.5168000,
      longitude: 13.38921,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 4000
  }, {
    coords: {
      latitude: 52.5167990,
      longitude: 13.38930,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 5000
  }, {
    coords: {
      latitude: 52.5167990,
      longitude: 13.38940,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 6000
  }, {
    coords: {
      latitude: 52.5167990,
      longitude: 13.38949,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 7000
  }, {
    coords: {
      latitude: 52.5168000,
      longitude: 13.38960,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 8000
  }, {
    coords: {
      latitude: 52.5167990,
      longitude: 13.38969,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 9000
  }, {
    coords: {
      latitude: 52.5167990,
      longitude: 13.38978,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 10000
  }, {
    coords: {
      latitude: 52.5167980,
      longitude: 13.38989,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 11000
  }, {
    coords: {
      latitude: 52.5167970,
      longitude: 13.38999,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 12000
  }, {
    coords: {
      latitude: 52.5167960,
      longitude: 13.39009,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 13000
  }, {
    coords: {
      latitude: 52.5167970,
      longitude: 13.39020,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 14000
  }, {
    coords: {
      latitude: 52.5167980,
      longitude: 13.39030,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 15000
  }, {
    coords: {
      latitude: 52.5167980,
      longitude: 13.39039,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 16000
  }, {
    coords: {
      latitude: 52.5167980,
      longitude: 13.39050,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 17000
  }, {
    coords: {
      latitude: 52.5167980,
      longitude: 13.39061,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 18000
  }, {
    coords: {
      latitude: 52.5167990,
      longitude: 13.39071,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 19000
  }, {
    coords: {
      latitude: 52.5168000,
      longitude: 13.39082,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 20000
  }, {
    coords: {
      latitude: 52.5168010,
      longitude: 13.39092,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 21000
  }, {
    coords: {
      latitude: 52.5168000,
      longitude: 13.39101,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 22000
  }, {
    coords: {
      latitude: 52.5167990,
      longitude: 13.39112,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 23000
  }, {
    coords: {
      latitude: 52.5168000,
      longitude: 13.39122,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 24000
  }, {
    coords: {
      latitude: 52.5168000,
      longitude: 13.39133,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 25000
  }, {
    coords: {
      latitude: 52.5168000,
      longitude: 13.39144,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 26000
  }, {
    coords: {
      latitude: 52.5168000,
      longitude: 13.39155,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 27000
  }, {
    coords: {
      latitude: 52.5167990,
      longitude: 13.39164,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 28000
  }, {
    coords: {
      latitude: 52.5167980,
      longitude: 13.39174,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 29000
  }, {
    coords: {
      latitude: 52.5167980,
      longitude: 13.39183,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 30000
  }, {
    coords: {
      latitude: 52.5168490,
      longitude: 13.39182,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 31000
  }, {
    coords: {
      latitude: 52.5168990,
      longitude: 13.39182,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 32000
  }, {
    coords: {
      latitude: 52.5169500,
      longitude: 13.39182,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 33000
  }, {
    coords: {
      latitude: 52.5169990,
      longitude: 13.39182,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 34000
  }, {
    coords: {
      latitude: 52.5170500,
      longitude: 13.39182,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 35000
  }, {
    coords: {
      latitude: 52.5171010,
      longitude: 13.39181,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 36000
  }, {
    coords: {
      latitude: 52.5171500,
      longitude: 13.39182,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 37000
  }, {
    coords: {
      latitude: 52.5171990,
      longitude: 13.39183,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 38000
  }, {
    coords: {
      latitude: 52.5172480,
      longitude: 13.39184,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 39000
  }, {
    coords: {
      latitude: 52.5172990,
      longitude: 13.39184,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 40000
  }, {
    coords: {
      latitude: 52.5173500,
      longitude: 13.39184,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 41000
  }, {
    coords: {
      latitude: 52.5174000,
      longitude: 13.39184,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 42000
  }, {
    coords: {
      latitude: 52.5174510,
      longitude: 13.39184,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 43000
  }, {
    coords: {
      latitude: 52.5175010,
      longitude: 13.39185,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 44000
  }, {
    coords: {
      latitude: 52.5175510,
      longitude: 13.39186,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 45000
  }, {
    coords: {
      latitude: 52.5176000,
      longitude: 13.39187,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 46000
  }, {
    coords: {
      latitude: 52.5176510,
      longitude: 13.39187,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 47000
  }, {
    coords: {
      latitude: 52.5177020,
      longitude: 13.39188,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 48000
  }, {
    coords: {
      latitude: 52.5177530,
      longitude: 13.39188,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 49000
  }, {
    coords: {
      latitude: 52.5178040,
      longitude: 13.39188,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 50000
  }, {
    coords: {
      latitude: 52.5178530,
      longitude: 13.39188,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 51000
  }, {
    coords: {
      latitude: 52.5179020,
      longitude: 13.39189,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 52000
  }, {
    coords: {
      latitude: 52.5179520,
      longitude: 13.39188,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 53000
  }, {
    coords: {
      latitude: 52.5180030,
      longitude: 13.39189,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 54000
  }, {
    coords: {
      latitude: 52.5180540,
      longitude: 13.39189,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 55000
  }, {
    coords: {
      latitude: 52.5181040,
      longitude: 13.39189,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 56000
  }, {
    coords: {
      latitude: 52.5181540,
      longitude: 13.39188,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 57000
  }, {
    coords: {
      latitude: 52.5182050,
      longitude: 13.39187,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 58000
  }, {
    coords: {
      latitude: 52.5182560,
      longitude: 13.39186,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 59000
  }, {
    coords: {
      latitude: 52.5183050,
      longitude: 13.39185,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 60000
  }, {
    coords: {
      latitude: 52.5183040,
      longitude: 13.39175,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 61000
  }, {
    coords: {
      latitude: 52.5183050,
      longitude: 13.39164,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 62000
  }, {
    coords: {
      latitude: 52.5183060,
      longitude: 13.39154,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 63000
  }, {
    coords: {
      latitude: 52.5183060,
      longitude: 13.39143,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 64000
  }, {
    coords: {
      latitude: 52.5183050,
      longitude: 13.39132,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 65000
  }, {
    coords: {
      latitude: 52.5183040,
      longitude: 13.39121,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 66000
  }, {
    coords: {
      latitude: 52.5183030,
      longitude: 13.39110,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 67000
  }, {
    coords: {
      latitude: 52.5183020,
      longitude: 13.39099,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 68000
  }, {
    coords: {
      latitude: 52.5183010,
      longitude: 13.39090,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 69000
  }, {
    coords: {
      latitude: 52.5183000,
      longitude: 13.39080,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 70000
  }, {
    coords: {
      latitude: 52.5183010,
      longitude: 13.39069,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 71000
  }, {
    coords: {
      latitude: 52.5183020,
      longitude: 13.39058,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 72000
  }, {
    coords: {
      latitude: 52.5183020,
      longitude: 13.39047,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 73000
  }, {
    coords: {
      latitude: 52.5183030,
      longitude: 13.39038,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 74000
  }, {
    coords: {
      latitude: 52.5183040,
      longitude: 13.39027,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 75000
  }, {
    coords: {
      latitude: 52.5183040,
      longitude: 13.39016,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 76000
  }, {
    coords: {
      latitude: 52.5183050,
      longitude: 13.39006,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 77000
  }, {
    coords: {
      latitude: 52.5183040,
      longitude: 13.38997,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 78000
  }, {
    coords: {
      latitude: 52.5183050,
      longitude: 13.38988,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 79000
  }, {
    coords: {
      latitude: 52.5183040,
      longitude: 13.38977,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 80000
  }, {
    coords: {
      latitude: 52.5183040,
      longitude: 13.38966,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 81000
  }, {
    coords: {
      latitude: 52.5183050,
      longitude: 13.38957,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 82000
  }, {
    coords: {
      latitude: 52.5183060,
      longitude: 13.38948,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 83000
  }, {
    coords: {
      latitude: 52.5183060,
      longitude: 13.38939,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 84000
  }, {
    coords: {
      latitude: 52.5183060,
      longitude: 13.38929,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 85000
  }, {
    coords: {
      latitude: 52.5183060,
      longitude: 13.38920,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 86000
  }, {
    coords: {
      latitude: 52.5183050,
      longitude: 13.38909,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 87000
  }, {
    coords: {
      latitude: 52.5183060,
      longitude: 13.38900,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 88000
  }, {
    coords: {
      latitude: 52.5183070,
      longitude: 13.38889,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 89000
  }, {
    coords: {
      latitude: 52.5183070,
      longitude: 13.38878,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 90000
  }, {
    coords: {
      latitude: 52.5182560,
      longitude: 13.38878,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 91000
  }, {
    coords: {
      latitude: 52.5182070,
      longitude: 13.38878,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 92000
  }, {
    coords: {
      latitude: 52.5181570,
      longitude: 13.38877,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 93000
  }, {
    coords: {
      latitude: 52.5181070,
      longitude: 13.38876,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 94000
  }, {
    coords: {
      latitude: 52.5180580,
      longitude: 13.38875,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 95000
  }, {
    coords: {
      latitude: 52.5180070,
      longitude: 13.38876,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 96000
  }, {
    coords: {
      latitude: 52.5179570,
      longitude: 13.38877,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 97000
  }, {
    coords: {
      latitude: 52.5179080,
      longitude: 13.38876,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 98000
  }, {
    coords: {
      latitude: 52.5178570,
      longitude: 13.38877,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 99000
  }, {
    coords: {
      latitude: 52.5178070,
      longitude: 13.38878,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 100000
  }, {
    coords: {
      latitude: 52.5177570,
      longitude: 13.38878,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 101000
  }, {
    coords: {
      latitude: 52.5177070,
      longitude: 13.38879,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 102000
  }, {
    coords: {
      latitude: 52.5176580,
      longitude: 13.38879,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 103000
  }, {
    coords: {
      latitude: 52.5176080,
      longitude: 13.38879,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 104000
  }, {
    coords: {
      latitude: 52.5175580,
      longitude: 13.38880,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 105000
  }, {
    coords: {
      latitude: 52.5175080,
      longitude: 13.38881,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 106000
  }, {
    coords: {
      latitude: 52.5174570,
      longitude: 13.38880,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 107000
  }, {
    coords: {
      latitude: 52.5174060,
      longitude: 13.38881,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 108000
  }, {
    coords: {
      latitude: 52.5173550,
      longitude: 13.38881,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 109000
  }, {
    coords: {
      latitude: 52.5173060,
      longitude: 13.38881,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 110000
  }, {
    coords: {
      latitude: 52.5172550,
      longitude: 13.38882,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 111000
  }, {
    coords: {
      latitude: 52.5172060,
      longitude: 13.38883,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 112000
  }, {
    coords: {
      latitude: 52.5171550,
      longitude: 13.38883,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 113000
  }, {
    coords: {
      latitude: 52.5171050,
      longitude: 13.38882,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 114000
  }, {
    coords: {
      latitude: 52.5170550,
      longitude: 13.38883,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 115000
  }, {
    coords: {
      latitude: 52.5170050,
      longitude: 13.38884,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 116000
  }, {
    coords: {
      latitude: 52.5169540,
      longitude: 13.38883,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 117000
  }, {
    coords: {
      latitude: 52.5169040,
      longitude: 13.38883,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 118000
  }, {
    coords: {
      latitude: 52.5168550,
      longitude: 13.38882,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 119000
  }, {
    coords: {
      latitude: 52.5168040,
      longitude: 13.38882,
      accuracy: 10,
      speed: 5,
      heading: 1
    },
    timestamp: 120000
  }
];

