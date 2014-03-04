'use strict';

angular.module('whattoexpectatApp')
  .factory('PlaceService', ['configuration', '$firebase',
    function(configuration, $firebase) {
      var ref = new Firebase('https://' + configuration.firebase + '.firebaseio.com/places');
      return $firebase(ref);
    }    
  ]);
