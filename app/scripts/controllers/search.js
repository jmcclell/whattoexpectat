'use strict';

angular.module('whattoexpectatApp')
  .controller('SearchCtrl', function($scope, geolocation, ngGeocoderAPI) {

    var locations = {
      'New York, NY': ngGeocoderAPI.latlng(40.6700,  73.9400) // default location
    };

    function parseReverseGeolocation(results, orderedTypePreference) {
      if (results.length < 1) {
      	console.log('No data.');
      	return null;
      }

      var bestMatchIndex = null;
      var bestMatch = null;
      for (var curResult in results) {
      	var result = results[curResult];
        for (var curType in result['types']) {
          var type = result['types'][curType];          
          var index = $.inArray(type, orderedTypePreference);          
          if (index >= 0) {
            if (bestMatchIndex == null || index < bestMatchIndex) {
              bestMatchIndex = index;
              bestMatch = result;
            }
          }
        }
      }

      if (bestMatch == null) {
        // couldn't find one that we wanted so take the most specific
        bestMatch = results[0];
      } 

      return bestMatch;
    }

    $scope.location = {name: 'New York, NY', coords: locations['New York, NY']};

    geolocation.getLocation().then(function(data) {
      console.log(data);

      var geoLocationLatLong = ngGeocoderAPI.latlng(data.coords.latitude, data.coords.longitude);

      $scope.location = geoLocationLatLong;

      ngGeocoderAPI.geocode({
        location: ngGeocoderAPI.latlng(data.coords.latitude, data.coords.longitude)
      }).then(function(reverseData) {
      	console.log(reverseData);
      	var bestMatch = parseReverseGeolocation(reverseData, ['neighborhood', 'postal_code', 'street_address']);

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


    $scope.doSearch = function() {
      
    };
  });
