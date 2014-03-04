'use strict';

angular.module('whattoexpectatApp')
  .factory('ReviewService', ['configuration', '$firebase',
    function(configuration, $firebase) {
      var ref = new Firebase('https://' + configuration.firebase + '.firebaseio.com/reviews');
        return $firebase(ref);
    }
  ]);
