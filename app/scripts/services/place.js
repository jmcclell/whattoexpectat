'use strict';

angular.module('whattoexpectatApp')
  .factory('PlaceService', ['configuration', '$firebase',
    function(configuration, $firebase) {
      
      return {
        getPlaceBySlug: function(slug) {
          var ref = new Firebase(
        'https://' + configuration.firebase + '.firebaseio.com/places/' + slug);
          var fb = $firebase(ref);
          console.log(fb);
          return fb;
        },
        addPlace: function(slug, gref, recommendationModifier) {
          // TODO how do we check if it already exists? Confusing API. We don't want to leave this code as is 
          // otherwise anyone can just come wreck our data. Then again, can't they just always? /sigh
          var ref = new Firebase(
        'https://' + configuration.firebase + '.firebaseio.com/places/' + slug);
          var fb = $firebase(ref);
          fb.$set({
            slug: slug,
            gref: gref,
            recommendationModifier: recommendationModifier,
            recommendationScore: generateRecommendationScore(1, recommendationModifier);
          });
          return fb;
        }
      }
    }
  ]);
