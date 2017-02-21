var app = angular.module('login', ['ngCookies']);

app.service('messages', function(){
    var warningMessage = "Warning Dummy";
    var successMessage = "Success Dummy";
    var warning = false;
    var success = false;

    showWarning = function(message){
        this.warningMessage = message;
        this.warning = true;
    };

    closeWarning = function(){
        this.warning=false;
    };

    showSuccess = function(message){
        this.successMessage = message;
        this.success = true;
    };

    closeSuccess = function(){
        this.success = false;
    }

    return {
        warningMessage: warningMessage,
        successMessage: successMessage,
        warning: warning,
        success: success,
        showWarning: showWarning,
        closeWarning: closeWarning
    };
});

app.directive('warningMessage', function(){
   return {
       templateUrl: "directives/warningmessage.html"
   } ;
});

app.controller('loginCtrl', function ($scope, $http, $cookies, $window, messages) {
    $scope.messages = messages;
    $scope.token = $cookies.get("token");
    if ($cookies.get("token") !== undefined) {
        $window.location = 'index.html';
    }
    $scope.login = function () {
        $http.put("http://46.101.204.215:1337/api/V1/login",{
            username: $scope.username,
            password: $scope.passwrod
        },{headers:{Authorization: $scope.token}}).then(function (response) {
            $scope.token = response.data.token;
            $cookies.put("token", $scope.token);
            $window.location = '/#/';
        }, function (response) {
            messages.showWarning("Login Fehlgeschlagen!Nutzername oder Passwort ist Falsch!");
        });
    };
});

