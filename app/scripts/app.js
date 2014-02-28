'use strict';

angular.module('whattoexpectatApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  //'ngGPlaces',
  'ngGeocoder',
  'firebase',
  'geolocation',
  'xeditable',
  'LocalStorageModule'
])
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/search.html',
        controller: 'SearchCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .config(['localStorageServiceProvider', function(localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('whatToExpectAt');
  }])
  .run(function(editableOptions) {
    editableOptions.theme = 'bs3';
  });
