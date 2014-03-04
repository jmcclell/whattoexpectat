'use strict';

angular.module('whattoexpectatApp')
  .controller('ReviewCtrl',
             ['$scope', '$routeParams', '$location', 'SearchService', '$window', '$q',
              '$modal', 'ReviewService', '$rootScope', 'AuthService', 'PlaceService',
    function($scope, $routeParams, $location, SearchService, $window, $q,
             $modal, ReviewService, $rootScope, AuthService, PlaceService) {

      var slug = $routeParams.slug;
      var gref = $location.search().gref;
      var mapDefer = $q.defer();

      $scope.searchContext = SearchService;

      $scope.review = {
              placeDetail: null,
              place: PlaceService.$child(slug),
              reviews: [],
              recommendationModifier: 0
            };

      if (gref) {
        initializeWithGref();
      } else {
        $scope.review.place.$on('loaded', function(snapshot) {
          console.log('Place loaded');
          if (snapshot && snapshot.gref) {
            console.log('gref came from stored Place');
            gref = snapshot.gref;
            initializeWithGref();
          } else {
            console.log('Can\'t find a gref');
            $location.url('/?q=' + slug.split('-').join(' '));
          }
        });
      }

      function initializeWithGref() {
        SearchService.getPlaceDetailByGRef(gref)
          .then(function(placeDetail) {
            $scope.review.placeDetail = placeDetail;

            $scope.map = {
              center: {
                latitude: placeDetail.geometry.location.lat(),
                longitude: placeDetail.geometry.location.lng()
              },
              zoom: 18
            };

            $scope.placemarker = {
              location: {
                latitude: placeDetail.geometry.location.lat(),
                longitude: placeDetail.geometry.location.lng()
              }
            };

            $scope.hasLoadedReviews = false;

            $scope.review.reviews = ReviewService.$child(slug);
            $scope.review.reviews.$on('loaded', function(reviews) {
                console.log(reviews);
                $scope.hasLoadedReviews = true;
            });

            console.log(placeDetail);
          }, function(error) {
            $location.url('/?q=' + slug.split('-').join(' '));
            return;
          });

        $scope.openNewReviewModal = function() {
          if (!AuthService.user) {
            $rootScope.openAuthModal().result.then(function(user) {
              console.log('Auth Modal promise returned:');
              console.log(user);
              $scope.openNewReviewModal();
            });
            return;
          }
          var modalInstance = $modal.open({
            templateUrl: 'views/review-form.html',
            controller: 'ReviewModalCtrl',
            resolve: {
              placeDetail: function() {
                return $scope.review.placeDetail;
              },
              place: function() {
                return $scope.review.place;
              },
              reviews: function() {
                return $scope.review.reviews;
              }
            }
          });
        };

        $scope.deleteReviewState = {};

        $scope.deleteReview = function(reviewId, state) {
          $scope.deleteReviewState[reviewId] = state;
          switch ($scope.deleteReviewState[reviewId]) {
            case 2:              
              $scope.deleteReviewState[reviewId] = 3;
              $scope.review.reviews.$remove(reviewId).then(function() {
                $scope.deleteReviewState[reviewId] = 0;
              });
          }          
        };

        $scope.vote = function(reviewId, vote) {
          var review = $scope.review.reviews.$child(reviewId);

          review.$transaction(function(lockedReview) {
            console.log(lockedReview);
            if (!lockedReview.votes) {
              lockedReview.votes = {};
            }
            var curVote = lockedReview.votes[AuthService.user.id];
            
            if (curVote === true) {         
              lockedReview.upvotes = (lockedReview.upvotes || 1) - 1;
            } else if (curVote === false) {
              lockedReview.downvotes = (lockedReview.downvotes || 1) - 1;
            } else {
              lockedReview.total_votes = (lockedReview.total_votes || 0) + 1;
            }

            if (vote === true && curVote !== true) {
              lockedReview.upvotes = (lockedReview.upvotes || 0) + 1;
            } else if (vote === false && curVote !== false) {
              lockedReview.downvotes = (lockedReview.downvotes || 0) + 1;
            }

            if (curVote === vote) {
              lockedReview.total_votes = (lockedReview.total_votes || 1) - 1;
              delete(lockedReview.votes[AuthService.user.id]);
            } else {
              lockedReview.votes[AuthService.user.id] = vote;
            }

            return lockedReview;
          });
        };
      }

      $scope.backToSearchResults = function() {
        $window.history.back();
      };
    }
  ])
  .controller('ReviewModalCtrl', ['$scope', '$modalInstance', 'AuthService', 'reviews', 'place', 'placeDetail',
    function($scope, reviewModal, AuthService, reviews, place, placeDetail) {
      var SCORE_HATE = -1;
      var SCORE_MEH = 0;
      var SCORE_LOVE = 1;

      var reviewText = '';
      if (reviews[AuthService.user.id] && reviews[AuthService.user.id].review) {
        reviewText = reviews[AuthService.user.id].review;
      }
      $scope.placeDetail = placeDetail;
      $scope.review = {
        text: reviewText
      };

      $scope.review.recommendationModifier = 0;



      $scope.form = {
        reviewForm: null,
        enabled: true
      };

      $scope.submitReview = function() {
        $scope.form.enabled = false;

        var reviewText = $scope.review.text.substring(0, 140); //doubly enforce 140char max
        var recommendationModifier = $scope.review.recommendationModifier;
        var userId = AuthService.user.id;

        var review = reviews.$child(userId);

        review.$on('loaded', function() {
          // Update the base details of the place
          place.$update({
            slug: placeDetail.slug,
            name: placeDetail.name,
            gref: placeDetail.gref
          }).then(function() {
              // Use a transaction to adjust the score of the place 
              console.log('place is:');
              console.log(place);           
              var transPromise = place.$transaction(function(lockedPlace) {
                // if we have an existing review for this user, undo the previous recommendation first
                console.log(review);
                if (review.user_id) {
                  switch (review.recommendation_modifier) {
                    case SCORE_HATE:
                      lockedPlace.hate_review_count = (lockedPlace.hate_review_count || 1) - 1; // default to 1 so that when we subtract 1 we are at 0
                      break;
                    case SCORE_MEH:
                      lockedPlace.meh_review_count = (lockedPlace.meh_review_count || 1) - 1;
                      break;
                    case SCORE_LOVE:
                      lockedPlace.love_review_count = (lockedPlace.love_review_count || 1) - 1;
                      break;
                  };

                  lockedPlace.total_review_count = (lockedPlace.total_review_count || 1) - 1;
                }
                // no we we can add our new score (i'm tired but this looks like pretty horrible code)
                switch (recommendationModifier) {
                  case SCORE_HATE:
                    lockedPlace.hate_review_count = (lockedPlace.hate_review_count || 0) + 1;
                    break;
                  case SCORE_MEH:
                    lockedPlace.meh_review_count = (lockedPlace.meh_review_count || 0) + 1;
                    break;
                  case SCORE_LOVE:
                    lockedPlace.love_review_count = (lockedPlace.love_review_count || 0) + 1;
                    break;
                };

                lockedPlace.total_review_count = (lockedPlace.total_review_count || 0) + 1;

                return lockedPlace;
              }).then(function(resultSnapshot) {  
                // upvote by default new comments  
                var voteObj = {};
                voteObj[AuthService.user.id] = true;

                review.$update({
                  user_id: AuthService.user.id,
                  username: AuthService.user.email,
                  review: reviewText,
                  recommendation_modifier: recommendationModifier,
                  upvotes: 1,
                  total_votes: 1,
                  votes: voteObj
                }).then(function() {                
                    reviewModal.close(review);
                  });
              });
            });
        });        
      };
    }
  ]);
