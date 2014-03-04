'use strict';

angular.module('whattoexpectatApp')
  .factory('StatisticsService', [
    function() {
      return {
        ConfidenceIntervalLowerBound: function(ratingTypeCount, totalRatingCount) {
          if (totalRatingCount == 0) {
            return 0;
          }

          var z = 1.96; // translates to 95% confidence (pnormaldist(1-(1-0.95)/2)
          var phat = 1.0 * pos / n;
          return (phat + z * z / (2 * n) - z * Math.sqrt((phat * (1 - phat) + z * z / (4 *n )) /n)) / (1 + z * z / n);
        }
      };
    }
  ]);
