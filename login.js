var mod = angular.module('testApi', ['ngCookies']);

mod.controller('apiCtrl', function ($scope, $http, $cookies, $window) {
    $scope.token = $cookies.get("token");
    if ($cookies.get("token") !== undefined) {
        $window.location = 'index.html';
    }

    $scope.warning=false;
    $scope.success=false;

    $scope.closeWarning = function(){
      $scope.warning=false;
    };

    $scope.login = function () {
        $http.put("http://46.101.204.215:1337/api/V1/login",{
            username: $scope.username,
            password: $scope.passwrod
        },{headers:{Authorization: $scope.token}}).then(function (response) {
            $scope.token = response.data.token;
            $cookies.put("token", $scope.token);
            $scope.warning=true;
            $window.location = 'index.html';
        }, function (response) {
            $scope.warning=true;
        });
    };
});
