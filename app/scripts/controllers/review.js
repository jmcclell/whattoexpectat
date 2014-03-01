'use strict';

angular.module('whattoexpectatApp')
  .controller('ReviewCtrl', function($scope, $routeParams, ngGPlacesAPI, $location, SearchService, $window, LocationService) {
    /*ngGPlacesAPI.placeDetails({
      reference: $routeParams.place_id
    }).then(function(result) {
      console.log(result);
      $scope.place = result;
    });*/

    var slug = $routeParams.slug;
    var gref = $location.search().gref;

    var partialPlace = SearchService.getSearchResultByIndexKey(slug);

    $scope.cameFromSearch = !!partialPlace;

    $scope.map = {
        center: {
          latitude: 0,
          longitude: 0
        },
        zoom: 8
      };

    var locationPromise = LocationService.getCurrentLocation();

    locationPromise.then(function(location) {
      console.log('Switching map center to ' + location.coords.lat() + ', ' + location.coords.lng());      
      $scope.map.control.refresh({latitude: location.coords.lat(), longitude: location.coords.lng()});
    });

    

    // we need a gref to load the details, was one passed in?
    
    if (!gref) {
      // do we have a partial place to get it from?
      if (partialPlace && partialPlace.reference) {
        gref = partialPlace.reference;
      }
    }

    // We still can't find gref, we're out of options
    if (!gref) {
      $location.url('/');
    }

    ngGPlacesAPI.placeDetails({
          reference: gref
        }).then(function(place) {
          $scope.review = {
            place: place
          };         

          

          console.log(place);
        });

    $scope.backToSearchResults = function() {
      $window.history.back();
    }
  });
