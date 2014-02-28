'use strict';

angular.module('whattoexpectatApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  //'ngGPlaces',
  'ngGeocoder',
  'firebase',
  'geolocation'
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
  });
