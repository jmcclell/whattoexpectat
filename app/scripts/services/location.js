'use strict';

angular.module('whattoexpectatApp')
  .factory('LocationService', function($q, localStorageService, $cacheFactory,
    geolocation, ngGeocoderAPI) {

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
              setLocation(name, geocodeData[0].geometry.location);
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
