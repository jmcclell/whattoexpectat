'use strict';

angular.module('whattoexpectatApp')
  .controller('ReviewCtrl', function($scope, $routeParams, $location, SearchService, $window) {
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

    SearchService.getPlaceDetailByGRef(gref)
      .then(function(place) {
        $scope.review = {
          place: place
        };
      });   

    $scope.backToSearchResults = function() {
      $window.history.back();
    }
  });
