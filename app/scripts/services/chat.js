'use strict';

angular.module('services.chat', ['services.config', 'firebase'])
  .factory('ChatService', function(configuration, $firebase) {
    var ref = new Firebase(
      'https://' + configuration.firebase + '.firebaseio.com/chat');
    return $firebase(ref);
  });
