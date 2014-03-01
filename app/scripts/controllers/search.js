'use strict';

angular.module('whattoexpectatApp')
  .controller('SearchCtrl', function($scope, LocationService, ngGPlacesAPI) {
    $scope.currentLocation = null;
    $scope.results = false;

    $scope.search = {
      term: '',
      locationInput: ''
    };

    /*
     * Attempt to load real location
     */
    // 
    LocationService.getCurrentLocation()
      .then(function(location) {
        $scope.currentLocation = location;
      });

    $scope.$watch('currentLocation', function(newLocation) {
      if (newLocation != null) {
        $scope.search.locationInput = newLocation.name;  
        console.log("Current location: " + newLocation.name);      
      }
    });

    /*
     * Perform search
     */
    $scope.doSearch = function() {
      if ($scope.search.term.trim() == '') {
        return;
      }
      var lat = $scope.currentLocation.coords.lat();
      var long = $scope.currentLocation.coords.lng();

      var results = ngGPlacesAPI.nearbySearch({
        latitude: lat,
        longitude: long,
        name: $scope.search.term
      }).then(
          function(data) {
            $scope.results = data;
          }, function(reason) {
            $scope.results = [];
          });
        };

    $scope.hasResults = function() {
      return ($scope.results === false || $scope.results.length > 0);
    };

    $scope.updateLocation = function(locationName) {
      locationName = locationName.trim();
      if (locationName == '') {
        return false;
      }

      $scope.currentLocation = null;
      LocationService.setCurrentLocationByName(locationName)
        .then(
          function(newLocation) {
            $scope.currentLocation = newLocation;
          }
        );
    };

    $scope.canSearch = function() {
      return $scope.currentLocation != null;
    };
  });
