var app = angular.module('app', ['ngCookies', 'ngRoute'])


app.service('shared', function(){
    var datenJS = [];
    var chapterFlagPath = "";
    var profiles = [];
    var selectedProfile = "";
    var placeholder = [];

    return{
        datenJS: datenJS,
        chapterFlagPath: chapterFlagPath,
        profiles: profiles,
        selectedProfile: selectedProfile,
        placeholder: placeholder
    }
});

app.config(function($routeProvider){
   $routeProvider.when("/", {
       templateUrl : "main.htm"
   }).when("/ford", {
       templateUrl : "foerder.htm"
   }).when("/changepassword", {
       templateUrl : "changePassword.html"
   }).when("/changeprofile", {
       templateUrl : "changeprofile.html"
   }).when("/deleteprofile", {
     templateUrl : "deleteprofile.html"
   });
});

app.controller('MainController', function ($scope, $cookies, $window, $http, shared) {
    $scope.setBackgroundImage = function (id, linkActive, linkInactive) {
        $(id).css("background-image", "url(" + linkInactive + ")");
        $(id).hover(function () {
            $(this).css("background-image", "url(" + linkActive + ")");
        }, function () {
            $(this).css("background-image", "url(" + linkInactive + ")");
        });
    };

    $scope.changeCompetence = function(id){
        $window.location = "#/"
        $cookies.put("currentChapter", id);
        $scope.currentChapter = id;
        $("#backplate").css("background-color", $scope.chapters[$scope.currentChapter-1].weakcolor);
        shared.chapterFlagPath = "/images/chapter";
        if($scope.currentChapter < 10){
            shared.chapterFlagPath += "0";
        }
        shared.chapterFlagPath += ($scope.currentChapter) + "/littleChapterFlag.png";
        fillDatenJS();
    };

    function fillDatenJS(){
        $http.get("http://46.101.204.215:1337/api/V1/studentcompetence?chapterId=" + $scope.currentChapter,
            {headers:{Authorization: $scope.token}}).then(function(response){
            shared.datenJS = response.data;
            shared.datenJS.sort(function(b,a){
                return (new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime());
            });
            for(var i = 0; i<shared.datenJS.length; i++){
                chapterId = shared.datenJS[i].chapterId;
                if(chapterId < 10) {
                    shared.datenJS[i].img = "/images/chapter0";
                }else{
                    shared.datenJS[i].img = "/images/chapter"
                }
                if(shared.datenJS[i].checked){
                    shared.datenJS[i].img += chapterId + "/competenceDone.png";
                }else{
                    shared.datenJS[i].img +=  chapterId + "/competenceUndone.png";
                }
            }
        });
    };

    $scope.logout = function () {
        $cookies.remove('token');
        $window.location = 'login.html';
    };

    // Code
    $scope.shared = shared;

    if ($cookies.get("token") == undefined) {
        $window.location = 'login.html';
    } else {
        $scope.token = $cookies.get("token");
    }

    $http.get("http://46.101.204.215:1337/api/V1/chapter",
        {headers:{Authorization:$scope.token}}).then(function(response){
        $scope.chapters = response.data;
        $scope.currentChapter = $cookies.get("currentChapter");
        if($scope.currentChapter === undefined){
            $scope.currentChapter = 1;
            $cookies.put("currentChapter", 1);
        }
        $("#backplate").css("background-color", $scope.chapters[$scope.currentChapter-1].weakcolor);
        shared.chapterFlagPath = "/images/chapter";
        if($scope.currentChapter < 10){
            shared.chapterFlagPath += "0";
        }
        shared.chapterFlagPath += ($scope.currentChapter) + "/littleChapterFlag.png";
    });


    // Placeholder


    $http.get("http://46.101.204.215:1337/api/V1/student",
        {headers:{Authorization: $scope.token}}).then(function(response){
        $scope.student = response.data;
        $scope.student.school.street = $scope.student.school.address.split(",")[0];
        $scope.student.school.city = $scope.student.school.address.split(",")[1];
            $http.get("http://46.101.204.215:1337/api/V1/avatar",
                {headers:{Authorization: $scope.token}}).then(function(response){
            $scope.avatars = response.data;
            $scope.setBackgroundImage("#school", $scope.student.school.imageUrl, $scope.student.school.imageUrlInactive);
            $scope.setBackgroundImage("#studyGroup", $scope.student.studyGroups.imageUrl, $scope.student.studyGroups.imageUrlInactive);
            $scope.setBackgroundImage("#student", $scope.avatars[$scope.student.avatarId].avatarUrl, $scope.avatars[$scope.student.avatarId].avatarInactiveUrl);
            fillDatenJS();
            console.log(shared.datenJS);
        });
    });



});

app.controller('passwordController', function($scope, $http, $cookies){
    $scope.token = $cookies.get('token');
    $scope.changePassword = function(){
        if($scope.newPassword === $scope.passwordConfirmation && $scope.newPassword !== $scope.currentPassword && $scope.newPassword !== undefined){
            console.log("Go");
            $http.put("http://46.101.204.215:1337/api/V1/requestPasswordRecovery", {
                'newpassword':$scope.newPassword,
                'password':$scope.currentPassword
            }, {
                headers:{
                    'Authorization':$scope.token
                }
            });
        }
    };
});

app.controller('fordController', function($scope){

});

app.controller('profileChangeCtrl', function($scope, $http, $cookies, shared){
    $scope.shared = shared;
    $scope.token = $cookies.get('token');
    shared.selectedProfile = "0";
    shared.profiles = {};
    $scope.selectProfile = function(profile){
        for(var i = 0; i<12; i++){
            if(shared.profiles[i] == profile){
                shared.selectedProfile = i;
                break;
            }
        }
    };
    $scope.changeProfile = function(){
        $http.put("http://46.101.204.215:1337/api/V1/avatar/:" + shared.selectedProfile, "", {
            headers:{
                'Authorization':$scope.token
            }
        });
    };
    $http.get("http://46.101.204.215:1337/api/V1/avatar", {
        headers:{
            'Authorization':$scope.token
        }
    }).then(function(response){
        for(var i = 0; i<12; i++){
            shared.profiles[i] = response.data[i].avatarBigUrl;
            console.log(shared.profiles[i]);
        }
    });
    shared.placeholder = {};
    for(var i = 0; i<36; i++){
        shared.placeholder[i] = "";
    }
});

app.controller('deleteCtrl', function($scope, $http, $cookies){
  $scope.token = $cookies.get("token");
  $scope.deleteProfile = function(){
    $http.delete("http://46.101.204.215:1337/api/V1/student", {
        headers:{
            'Authorization':$scope.token
        }
  }).then(function(response){
  });
};
});
