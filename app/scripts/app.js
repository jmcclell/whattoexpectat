'use strict';

angular.module('whattoexpectatApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngGPlaces',
  'ngGeocoder',
  'firebase',
  'geolocation',
  'xeditable',
  'LocalStorageModule',
  'slugifier',
  'ui.bootstrap',
  'google-maps'
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
  .config(['localStorageServiceProvider', function(localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('whatToExpectAt');
  }])
  .config(['ngGPlacesAPIProvider', 'configuration', function(ngPlacesAPIProvider, configuration) {
    var searchKeys = [
      'name',
      'reference',
      'vicinity',
      'photos',      
      'rating',
      'price_level'
    ];

    var detailKeys = searchKeys.concat([
      'formatted_address',
      'formatted_phone_number',
      'website'
    ]);

    ngPlacesAPIProvider.setDefaults({
      key: configuration.google_api_key,
      nearbySearchKeys: searchKeys,
      placeDetailsKeys: detailKeys,
      radius: 50000,
      types: ["cafe", "bar", "restaurant", "food", "establishment"]
    });
  }])
  .run(function(editableOptions) {
    editableOptions.theme = 'bs3';
  });
