'use strict';

angular.module('whattoexpectatApp')
  .factory('SearchService', function($q, Slug, $window) {
    var currentSearchTerm = null;    
    var currentSearchResults = null;
    var currentSearchResultsIndex = [];
    var currentSearchResultCount = 0;
    var hasSearched = false; 
    var dummyMap = $window.document.createElement('div');
    var placesService = 
      new google.maps.places.PlacesService(dummyMap);


    var indexSearchResults = function(results) {
      console.log(results);

      currentSearchResultsIndex = []; // reset

      for (var index in results) {
        var result = results[index];
        result.slug = Slug.slugify(result.name + ' ' + result.formatted_address); // add slug to each result
        currentSearchResultsIndex[result.slug] = index;
      }
      console.log(currentSearchResultsIndex);
    }
    var setSearchResults = function(results) {
      currentSearchResults = results;
      indexSearchResults(results);
      currentSearchResultCount = results.length;
      hasSearched = true;
    }


    return {
      hasSearched: function() {
        return hasSearched;
      },
      search: function(term) {
        term = term.trim();
        if (term == '') {
          return false;
        }

        var searchPromise = $q.defer();
        currentSearchTerm = term;

        var results = placesService.textSearch({
          query: term
        }, function(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
              setSearchResults(results); 
              searchPromise.resolve(currentSearchResults); 
            } else {
              setSearchResults([]);
              searchPromise.resolve(currentSearchResults);
            }
        });       

        return searchPromise.promise;
      },
      getCurrentSearchResults: function() {
        return currentSearchResults;
      },
      getCurrentSearchTerm: function() {
        return currentSearchTerm;
      },
      getCurrentSearchResultCount: function() {
        if (currentSearchResults != null) {
          return currentSearchResultCount;
        }

        return 0;
      },
      getSearchResultByIndexKey: function(key) {
        var index = currentSearchResultsIndex[key];
        if (index) {
          return currentSearchResults[index];
        } else {
          return null;
        }
      },
      getPlaceDetailByGRef: function(gref) {
        var deferred = $q.defer();
        placesService.getDetails({
          reference: gref
        }, function(result, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
              deferred.resolve(result); 
            } else {
              deferred.reject('Could not load data.');
            }
        });

        return deferred.promise;
      }
    };
  });
