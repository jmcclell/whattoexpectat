'use strict';

angular.module('whattoexpectatApp')
  .factory('ReviewService', ['$q', 'configuration', '$firebase',
    function($q, configuration, $firebase) {
      return {
        findReviewsByPlaceId: function(placeId) {
          var deferred = $q.defer();
          setTimeout(function() {
            deferred.resolve([{
                review: {
                  id: 1,
                  userId: 1,
                  placeId: 1,
                  review: 'I had to ask for limes. Twice'
                },
                user: {
                  id: 1,
                  name: 'Niles Rowland'
                }
              },
              {
                review: {
                  id: 2,
                  userId: 2,
                  placeId: 1,
                  review: 'Pooping here is a nightmare.'
                },
                user: {
                  id: 2,
                  name: 'Sunny Patel'
                }
              }]);
          }, 2000);

          return deferred.promise;
        },
        findReviewsByUserId: function(userId) {
          var deferred = $q.defer();
          setTimeout(function() {
            deferred.resolve([]);
          }, 1000);

          return deferred.promise;
        }
      };
    }
  ]);
