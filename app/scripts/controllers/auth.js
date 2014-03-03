'use strict';

angular.module('whattoexpectatApp')
  .controller('AuthCtrl', ['$scope', 'AuthService', '$modalInstance', '$modal', 
    function($scope, AuthService, authModal) {
      
      $scope.authUser = {
        email: '',
        password: ''
      };

      $scope.form = {
        authForm: null,
        enabled: true,
        badPassword: false
      };

      var signIn = function() {
        $scope.form.enabled = false;
        $scope.form.badPassword = false;
        console.log('Signing in!');
        AuthService.$login('password', {
          email: $scope.authUser.email,
          password: $scope.authUser.password
         }).then(function(user) {
          console.log('User signed in:');
          console.log(user);
          authModal.close(user);
        }, function(error) {
          console.log(error);
          if (error.code == 'INVALID_USER') {
            console.log('New user, trying to sign them up instead...');
            signUp();          
          } else if (error.code == 'INVALID_PASSWORD') {
            console.log('Invalid password');
            console.log($scope);
            $scope.form.badPassword = true;
          } else {
            console.log('Other error during sign in: ' + error);            
          }
        }).finally(function() {
          $scope.form.enabled = true;
        });
      };

      var signUp = function() {
        console.log(AuthService);
        AuthService.$createUser($scope.authUser.email, $scope.authUser.password)
          .then(function(user) {
            console.log("New user created:");
            console.log(user);
            signIn();            
          }, function(error) {
            console.log('Could not create user: ' + error);
          });
      };

      $scope.authSubmit = signIn;

      /*
       * -1 = missing email
       * 0 = uninitiated
       * 1 = initiated
       * 2 = confirmed
       * 3 = sent
       */
      $scope.passwordResetConfirmationState = 0;

      $scope.resetPassword = function(state) {
        $scope.passwordResetConfirmationState = state;

        switch(state) {
          case 1:
            if ($scope.form.authForm.email.$pristine || $scope.form.authForm.email.$invalid) {
              $scope.passwordResetConfirmationState = -1;
            }
            break;s
          case 2:
            AuthService.$sendPasswordResetEmail($scope.authUser.email)
            .then(function() {
              $scope.passwordResetConfirmationState = 3;
            });
            break;
        }
      };
    }
  ]);