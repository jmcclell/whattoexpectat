'use strict';

angular.module('whattoexpectatApp')
  .factory('PlaceService', ['configuration', '$firebase', '$q',
    function(configuration, $firebase, $q) {
        var ref = new Firebase('https://' + configuration.firebase + '.firebaseio.com/places');
        return $firebase(ref);
      }
    }
  ]);
