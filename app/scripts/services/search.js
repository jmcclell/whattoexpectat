'use strict';

angular.module('whattoexpectatApp')
  .factory('SearchService', function(LocationService, ngGPlacesAPI, $q, Slug) {
    var currentSearchTerm = null;    
    var currentSearchResults = null;
    var currentSearchResultsIndex = [];
    var currentSearchResultCount = 0;
    var hasSearched = false; 


    var indexSearchResults = function(results) {
      console.log(results);

      currentSearchResultsIndex = []; // reset

      for (var index in results) {
        var result = results[index];
        result.slug = Slug.slugify(result.name + ' ' + result.vicinity); // add slug to each result
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

        LocationService.getCurrentLocation()
          .then(function(location) {
            var lat = location.coords.lat();
            var long = location.coords.lng();

            var results = ngGPlacesAPI.nearbySearch({
              latitude: lat,
              longitude: long,
              name: term
            }).then(
              function(data) {
                setSearchResults(data); 
                searchPromise.resolve(currentSearchResults);          
              }, function(reason) {
                setSearchResults([]);
                searchPromise.resolve(currentSearchResults);
            });          
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
      }
    };
  });
