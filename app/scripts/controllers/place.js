'use strict';

angular.module('whattoexpectatApp')
  .controller('PlaceCtrl', function($scope, $routeParams, ngGPlacesAPI) {
    ngGPlacesAPI.placeDetails({
      reference: $routeParams.place_id
    }).then(function(result) {
      console.log(result);
      $scope.place = result;
    });
  });
