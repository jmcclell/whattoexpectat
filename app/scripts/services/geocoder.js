'use strict';

angular.module('ngGeocoder', []);
angular.module('ngGeocoder').value('gMaps', google.maps);

angular.module('ngGeocoder').
provider('ngGeocoderAPI', function() {

  this.$get = function($rootScope, $q, gMaps) {
    return {
      geocode: function(args) {
        var deferred = $q.defer();
        var service;

        function callback(result, status) {
            if (status == gMaps.GeocoderStatus.OK || status == gMaps.GeocoderStatus.ZERO_RESULTS) {
                $rootScope.$apply(function() {
                    return deferred.resolve(result);
                });
            } else {
                $rootScope.$apply(function() {
                  deferred.reject('There was a problem geocoding the request.');
                });
            }
        }

        service = new gMaps.Geocoder();
        service.geocode(args, callback);
        return deferred.promise;
      },

      latlng: function(lat, long) {
        return new gMaps.LatLng(lat, long);
      },

      parseReverseGeolocation: function(results, orderedTypePreference) {
      if (results.length < 1) {
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
    };
  };

    this.$get.$inject = ['$rootScope', '$q', 'gMaps'];
});
