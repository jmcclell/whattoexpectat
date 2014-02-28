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
      }
    };
  };

    this.$get.$inject = ['$rootScope', '$q', 'gMaps'];
});
