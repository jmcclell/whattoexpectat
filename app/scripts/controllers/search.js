'use strict';

angular.module('whattoexpectatApp')
  .controller('SearchCtrl', function($scope, geolocation, ngGeocoderAPI, localStorageService) {

    var locations = {
      'New York, NY': ngGeocoderAPI.latlng(40.6700,  73.9400) // default location
    };

    var setLocation = function(name, latlng) {
      var location = {
        name: name,
        coords: latlng
      };
      locations[name] = latlng;
      $scope.location = location;
      localStorageService.set('location', {
        name: name,
        lat: latlng.latitude,
        long: latlng.longitude
      });
    };

    
    
    var storedLocation = localStorageService.get('location');

    if(storedLocation) {
      setLocation(storedLocation.name, ngGeocoderAPI.latlng(storedLocation.lat, storedLocation.long));
    } else {
      setLocation('New York, NY', locations['New York, NY']); // set default for now

      geolocation.getLocation().then(function(data) {
        console.log(data);
        var geoLocationLatLong = ngGeocoderAPI.latlng(data.coords.latitude, data.coords.longitude);
        ngGeocoderAPI.geocode({
          location: geoLocationLatLong
        }).then(function(reverseData) {
          console.log(reverseData);
          var bestMatch = ngGeocoderAPI.parseReverseGeolocation(reverseData, ['neighborhood', 'postal_code', 'street_address']);

          if (bestMatch == null) {
            setLocation(geoLocationLatLong.toString(), geosLocationLatLong);          
          } else {
            setLocation(bestMatch.formatted_address, geoLocationLatLong);
          }

        },function() {
          setLocation(geoLocationLatLong.toString(), geosLocationLatLong);           
        });
      });
    }

    $scope.$watch('location.name', function(newName, oldName) {
      if (locations[newName]) {
        $scope.location.coords = locations[newName];
      } else {
        ngGeocoderAPI.geocode({
          address: newName
        }).then(function(geocodeData) {
          console.log(geocodeData);
          if(geocodeData.length > 0) {
          	setLocation(newName, geocodeData[0].geometry.location);     
          } else {
          	// some kind of fail message?
            $scope.location.name = oldName;
          }          
        });
      }
    });

    $scope.doSearch = function() {
      
    };
  });
