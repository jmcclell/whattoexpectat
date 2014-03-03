'use strict';

angular.module('whattoexpectatApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'firebase',
  'slugifier',
  'ui.bootstrap',
  'google-maps',
  'xeditable'
])
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/search.html',
        controller: 'SearchCtrl'
      })
      .when('/reviews/:slug', {
        templateUrl: 'views/review.html',
        controller: 'ReviewCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(function(editableOptions) {
    editableOptions.theme = 'bs3';
  })
  .run(function($rootScope, $modal, AuthService) {
    $rootScope.auth = AuthService;
    
    $rootScope.openAuthModal = function () {
      if (AuthService.user) {
        console.log("There is already a user logged in. Not showing auth modal.");
        return false;
      }
      
      return $modal.open({
        templateUrl: 'views/auth-form.html',
        controller: 'AuthCtrl'      
      });
    }
    
  });
