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
        var grefRef = $scope.review.place.$child('gref');
        grefRef.$on('loaded', function(data) {
          gref = data;
          if(!gref) {
            console.log('no gref');
            $location.url('/?q=' + slug.split('-').join(' '));         //
          } else {
            initializeWithGref();
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
      }

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
  .controller('ReviewModalCtrl', ['$scope', '$modalInstance', 'ReviewService', 'AuthService', 'place', 'placeDetail',
    function($scope, reviewModal, ReviewService, AuthService, place, placeDetail) {
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
        $scope.form.enabled = false;
        var reviewText = $scope.review.text.substring(0, 140); //doubly enforce 140char max
        var recommendationModifier = $scope.review.recommendationModifier;
        var userId = AuthService.user.id;
        var placeId = 1;
       
        ReviewService.addReview(placeId, userId, reviewText, recommendationModifier)
          .then(function(review){
            console.log('New review promise returned.');
            console.log(review);
            $scope.form.enabled = true;
          });
      };
    }
  ]);
