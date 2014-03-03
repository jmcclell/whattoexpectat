'use strict';

angular.module('whattoexpectatApp')
  .controller('ReviewCtrl',
             ['$scope', '$routeParams', '$location', 'SearchService', '$window', '$q',
              '$modal', 'ReviewService', '$rootScope', 'AuthService',
    function($scope, $routeParams, $location, SearchService, $window, $q,
             $modal, ReviewService, $rootScope, AuthService) {

      var slug = $routeParams.slug;
      var gref = $location.search().gref;

      var mapDefer = $q.defer();

      $scope.searchContext = SearchService;
    
      if (!gref) {
        // do we have a search result to get it from?
        // we may want to not do this actually, it makes things weird for users
        var searchResult = SearchService.getSearchResultByIndexKey(slug);
        if (searchResult && searchResult.reference) {
          gref = searchResult.reference;
        } else { 
          $location.url('/?q=' + slug.split('-').join(' '));
          return;
        }
      }

      SearchService.getPlaceDetailByGRef(gref)
        .then(function(placeDetail) {
          $scope.review = {
            placeDetail: placeDetail,
            place: null,
            reviews: []
          };

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

          // this code must run inside the .then() of a promise
          // which retrieves the place from the database
          // which means we need a place service that isn't
          // our search service
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

      $scope.openNewReviewModal = function () {
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
            }
          }             
        });
      };

      $scope.backToSearchResults = function() {
        $window.history.back();
      };
    }
  ])
  .controller('ReviewModalCtrl', ['$scope', '$modalInstance', 'place', 'placeDetail',
    function($scope, reviewModal, place, placeDetail) {
      console.log(placeDetail);
      $scope.placeDetail = placeDetail;
      $scope.review = {
        text: ''
      };

      $scope.form = {
        reviewForm: null,
        enabled: true
      }

      $scope.submitReview = function() {
        var review = $scope.review.text;
        if (review.length < 8 || review.length > 140) {
          return false;
        }

        ReviewService.addReview(placeId, userId, review);

        console.log('Save new review: ' + review);

      };
    }
  ]);
