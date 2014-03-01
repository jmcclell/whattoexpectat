'use strict';

angular.module('whattoexpectatApp')
  .controller('SearchCtrl', function($scope, LocationService, ngGPlacesAPI) {

    LocationService.setCurrentLocation('New York, NY', 40.67, 73.94, false);
    $scope.search = {
      location: 'New York, NY'
    };

    // attempt to find real location (or last saved location)
    LocationService.getCurrentLocation(true)
      .then(function(location) {
        console.log('Found current location: ' + location.name);
        $scope.search.location = location.name;
      });

    $scope.$watch('search.location', function(newName, oldName) {
      if (oldName == newName || !oldName) {
        return;
      }

      console.log('Switching location to ' + newName);
      LocationService.setCurrentLocationByName(newName)
        .then(
          function(newLocation) {
            $scope.currentLocation = newLocation;
          },
          function(reason) {
            // failure
            $scope.search.location = oldName;
          }
        );
    });

    $scope.doSearch = function() {
      var lat = $scope.currentLocation.coords.lat();
      var long = $scope.currentLocation.coords.lng();

      var results = ngGPlacesAPI.nearbySearch({
        latitude: lat,
        longitude: long,
        name: $scope.term
      }).then(
          function(data) {
            console.log(data);
            $scope.results = data;
          }, function(reason) {
            $scope.results = [];
          });
        };
  });
