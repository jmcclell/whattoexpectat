'use strict';


angular.module('whattoexpectatApp')
  .factory('AuthService', ['$firebaseSimpleLogin', 'configuration',
    function($firebaseSimpleLogin, configuration) {
      var ref = new Firebase(
        'https://' + configuration.firebase + '.firebaseio.com/');
    
      var auth = $firebaseSimpleLogin(ref);
      
      return auth;
    }    
  ]);
