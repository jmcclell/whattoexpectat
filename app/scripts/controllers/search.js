'use strict';

angular.module('whattoexpectatApp')
  .controller('SearchCtrl', function($scope, LocationService, SearchService, $routeParams, $location) {
    $scope.currentLocation = null;
    $scope.isSearching = false;

    $scope.search = {
      term: '',
      locationInput: ''
    };

    var urlQuery = $location.search().q;
    var urlLocation = $location.search().l;

    console.log("location provided in url: " + urlLocation);

    if(urlQuery) {
      $scope.search.term = urlQuery;
    }
    
    if (urlLocation) {
      LocationService.setCurrentLocationByName(urlLocation)
        .then(function(location) {
          $scope.currentLocation = location;
        });
    } else {
      LocationService.getCurrentLocation()
        .then(function(location) {
          $scope.currentLocation = location;
        });
    }

    $scope.$watch('currentLocation', function(newLocation) {      
      if (newLocation != null && newLocation != '') {
        $scope.search.locationInput = newLocation.name;        
        console.log('Current location: ' + newLocation.name);
        $location.search('l', newLocation.name);
        if($scope.search.term != '') {
          $scope.doSearch();
        }
      }
    });

    $scope.doSearch = function() {
      var term = $scope.search.term;
      var searchPromise = SearchService.search(term);

      if (searchPromise === false) {
        return;
      }

      $scope.isSearching = true;
      $location.search('q', term);
      searchPromise.then(function() {
        $scope.isSearching = false;
      });

    };

    $scope.getResults = function() {
      return SearchService.getCurrentSearchResults();
    };

    $scope.getResultCount = function() {
      return SearchService.getCurrentSearchResultCount();
    }

    $scope.hasResults = function() {
      return (!SearchService.hasSearched() ||
       SearchService.getCurrentSearchResultCount() > 0);
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

    $scope.hasSearched = function() {
      return SearchService.hasSearched();
    }
  });
