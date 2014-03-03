'use strict';

angular.module('whattoexpectatApp')
  .controller('ChatCtrl', ['$scope', 'ChatService', function($scope, ChatService) {
    $scope.user = 'Guest ' + Math.round(Math.random() * 101);
    $scope.messages = ChatService;
    $scope.addMessage = function() {
      $scope.messages.$add({from: $scope.user, content: $scope.message});
      $scope.message = '';
    };
  }]);
