'use strict';

angular.module('whattoexpectatApp')
  .factory('ChatService', ['configuration', '$firebase',
    function(configuration, $firebase) {
      var ref = new Firebase(
        'https://' + configuration.firebase + '.firebaseio.com/chat');
      return $firebase(ref);
    }
  ]);
