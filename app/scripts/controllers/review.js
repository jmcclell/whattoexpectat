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
              place: PlaceService.getPlaceBySlug(slug),
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

            ReviewService.findReviewsByPlaceId(1)
              .then(function(reviews) {
                $scope.hasLoadedReviews = true;
                $scope.review.reviews = reviews;
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
              gref: function() {
                return gref;
              }
            }
          });
        };
      }

      $scope.backToSearchResults = function() {
        $window.history.back();
      };
    }
  ])
  .controller('ReviewModalCtrl', ['$scope', '$modalInstance', 'ReviewService', 'AuthService', 'PlaceService', 'place', 'placeDetail',
    function($scope, reviewModal, ReviewService, AuthService, PlaceService, place, placeDetail, gref) {
      $scope.placeDetail = placeDetail;
      $scope.review = {
        text: ''
      };

      $scope.form = {
        reviewForm: null,
        enabled: true
      };

      $scope.submitReview = function() {
        $scope.form.enabled = false;

        var reviewText = $scope.review.text.substring(0, 140); //doubly enforce 140char max
        var recommendationModifier = $scope.review.recommendationModifier;
        var userId = AuthService.user.id;

        
        PlaceService.updatePlace({
          slug: placeDetail.slug,
          name: placeDetail.name,
          gref: gref
        }, recommendationModifier).then(function() {
            ReviewService.addReview(placeId, userId, reviewText, recommendationModifier)
              .then(function(review) {
                console.log('New review promise returned.');
                console.log(review);
                $scope.form.enabled = true;
              });
          };
          });

        if (!$scope.review.place.gref) {
          // This place isn't saved yet, so let's initialize it
          PlaceService.addPlace(placeDetail.slug, gref);
        }
      };
    }
  ]);
