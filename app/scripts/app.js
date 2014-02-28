'use strict';

angular.module('whattoexpectatApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'services.config',
  'services.chat'
]);
  /*.config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });*/
