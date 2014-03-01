'use strict';

angular.module('whattoexpectatApp')
  .factory('LocationService', function($q, localStorageService, $cacheFactory,
    geolocation, ngGeocoderAPI) {

    //http://www.merriampark.com/ld.htm, http://www.mgilleland.com/ld/ldjavascript.htm, Damerau–Levenshtein distance (Wikipedia)
    // TODO This should go in some kind of StringService or something
    var levDist = function(s, t) {
        var d = []; //2d matrix

        // Step 1
        var n = s.length;
        var m = t.length;

        if (n == 0) return m;
        if (m == 0) return n;

        //Create an array of arrays in javascript (a descending loop is quicker)
        for (var i = n; i >= 0; i--) d[i] = [];

        // Step 2
        for (var i = n; i >= 0; i--) d[i][0] = i;
        for (var j = m; j >= 0; j--) d[0][j] = j;

        // Step 3
        for (var i = 1; i <= n; i++) {
            var s_i = s.charAt(i - 1);

            // Step 4
            for (var j = 1; j <= m; j++) {

                //Check the jagged ld total so far
                if (i == j && d[i][j] > 4) return n;

                var t_j = t.charAt(j - 1);
                var cost = (s_i == t_j) ? 0 : 1; // Step 5

                //Calculate the minimum
                var mi = d[i - 1][j] + 1;
                var b = d[i][j - 1] + 1;
                var c = d[i - 1][j - 1] + cost;

                if (b < mi) mi = b;
                if (c < mi) mi = c;

                d[i][j] = mi; // Step 6

                //Damerau transposition
                if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
                    d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
                }
            }
        }

        // Step 7
        return d[n][m];
    }

    var locationCache = $cacheFactory('locationCache');

    var currentLocation = null;

    var getLocationFromLocalStorage = function() {
      var storedLocation = localStorageService.get('currentLocation');

      if (storedLocation) {
        console.log('Found location in local storage.');
        return {
          name: storedLocation.name,
          coords: coordsToLatLng(storedLocation.lat, storedLocation.long)
        };
      }

      return null;
    };

    var getMostRelevantLocationName = function(geocodeData, name) {
      var curLowestDistance = null;
      var curBestMatch = null;

      for (var index in geocodeData) {
        var place = geocodeData[index];
        var distance = levDist(place.formatted_address, name);

        if (curLowestDistance == null || distance < curLowestDistance) {
          curLowestDistance = distance;
          curBestMatch = place.formatted_address;
        }
      }

      if (curBestMatch == null) {
        curBestMatch = name;
      }

      return curBestMatch;
    }

    var coordsToLatLng = function(lat, long) {
      return new google.maps.LatLng(lat, long);
    };

    var setLocation = function(name, coords) {
      currentLocation = {
        name: name,
        coords: coords
      };

      locationCache.put(name, currentLocation);

      localStorageService.set('currentLocation', {
        name: currentLocation.name,
        lat: currentLocation.coords.lat(),
        long: currentLocation.coords.lng()
      });      

      return currentLocation;
    };

    return {
      getCurrentLocation: function() {
        var deferred = $q.defer();

        if (!currentLocation) {
          // is the location in local storage?
          currentLocation = getLocationFromLocalStorage();
          if (currentLocation) {
            deferred.resolve(currentLocation);
          } else {
            // let's get it from geolocation
            var geoLocationPromise = geolocation.getLocation();

            geoLocationPromise.then(function(data) {
              var coords = coordsToLatLng(data.coords.latitude,
               data.coords.longitude);

              var geocoderPromise = ngGeocoderAPI.geocode({
                location: coords
              });

              geocoderPromise.then(function(reverseData) {
                var bestMatch = ngGeocoderAPI.parseReverseGeolocation(
                  reverseData,
                  ['neighborhood', 'postal_code', 'street_address']);

                if (bestMatch == null) {
                  setLocation(geoLocationLatLong.toString(), coords);
                } else {
                  setLocation(bestMatch.formatted_address, coords);
                }
                deferred.resolve(currentLocation);
              },function() {
                setLocation(geoLocationLatLong.toString(), coords);
                deferred.resolve(currentLocation);
              });
            });
          }
        } else {          
          deferred.resolve(currentLocation);
        }

        return deferred.promise;
      },
      setCurrentLocationByName: function(name) {
        var deferred = $q.defer();

        var location = locationCache.get(name);
        if (location) {
          setLocation(location.name, location.coords);
          deferred.resolve(currentLocation);
        } else {
          var geocoderPromise = ngGeocoderAPI.geocode({
            address: name
          });

          geocoderPromise.then(function(geocodeData) {
            if (geocodeData.length > 0) {
              console.log(geocodeData);
              var mostRelevantName = getMostRelevantLocationName(geocodeData, name);
              setLocation(mostRelevantName, geocodeData[0].geometry.location);
              deferred.resolve(currentLocation);
            } else {
              deferred.reject(currentLocation);
            }
          });
        }

        return deferred.promise;
      },
      setCurrentLocation: function(name, lat, long) {
        var deferred = $q.defer();
        var coords = coordsToLatLng(lat, long);
        setLocation(name, coords);
        deferred.resolve(currentLocation);
        return deferred.promise;
      }
    };
  });
