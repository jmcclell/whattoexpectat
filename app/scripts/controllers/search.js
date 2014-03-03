'use strict';

angular.module('whattoexpectatApp')
  .controller('SearchCtrl', ['$scope', 'SearchService', '$routeParams', '$location', 
    function($scope, SearchService, $routeParams, $location) {
      $scope.isSearching = false;

      $scope.search = {
        term: '',
      };

      var urlQuery = $location.search().q;

      $scope.doSearch = function() {
        var term = $scope.search.term;
        var searchPromise = SearchService.search(term);

        if (searchPromise === false) {
          return;
        }

        $scope.isSearching = true;
        $location.search('q', term);
        searchPromise.then(function() {
          $scope.isSearching = false;
        });

      };

      if(urlQuery) {
        $scope.search.term = urlQuery;
        $scope.doSearch();
      }

      $scope.getResults = function() {
        return SearchService.getCurrentSearchResults();
      };

      $scope.getResultCount = function() {
        return SearchService.getCurrentSearchResultCount();
      }

      $scope.hasResults = function() {
        return (!SearchService.hasSearched() ||
         SearchService.getCurrentSearchResultCount() > 0);
      };

      $scope.hasSearched = function() {
        return SearchService.hasSearched();
      }
    }
  ]);
