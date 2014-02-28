'use strict';

angular.module('whattoexpectatApp')
  .controller('SearchCtrl', function($scope, geolocation, ngGeocoderAPI) {

    var locations = {
      'New York, NY': ngGeocoderAPI.latlng(40.6700,  73.9400) // default location
    };

    $scope.location = {name: 'New York, NY', coords: locations['New York, NY']};

    geolocation.getLocation().then(function(data) {
      console.log(data);

      var geoLocationLatLong = ngGeocoderAPI.latlng(data.coords.latitude, data.coords.longitude);

      $scope.location = geoLocationLatLong;

      ngGeocoderAPI.geocode({
        location: ngGeocoderAPI.latlng(data.coords.latitude, data.coords.longitude)
      }).then(function(reverseData) {
        console.log(reverseData);
        var bestMatch = ngGeocoderAPI.parseReverseGeolocation(reverseData, ['neighborhood', 'postal_code', 'street_address']);

        if (bestMatch == null) {
          $scope.location = {name: geoLocationLatLong.toString(), coords: geoLocationLatLong};          
        } else {

          locations[bestMatch.formatted_address] = geoLocationLatLong;
          $scope.location = {name: bestMatch.formatted_address, coords: locations['dude sweet']};
        }

      },function() {
        $scope.location = {name: geoLocationLatLong.toString(), coords: geoLocationLatLong};
      });
    });

    $scope.$watch('location.name', function(newName, oldName) {
      if (locations[newName]) {
        $scope.location.coords = locations[newName];
      } else {
        ngGeocoderAPI.geocode({
          address: newName
        }).then(function(geocodeData) {
          console.log(geocodeData);
          if(geocodeData.length > 0) {
          	locations[newName] = geocodeData[0].geometry.location;
          	$scope.location.coords = locations[newName];
          } else {
          	$scope.location.name = oldName;
          }          
        });
      }
    });

    $scope.doSearch = function() {
      
    };
  });
