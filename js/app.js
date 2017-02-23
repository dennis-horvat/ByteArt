function showDropdownOf(element) {
    var content = $("#" + element.id);
    if (content.next().css("display") === "none") {
        $(".dropdown-button").next().css("display", "none");
        content.next().css('display', 'block');
    } else {
        content.next().css('display', 'none');
    }

}


var app = angular.module('app', ['ngCookies', 'ngRoute'])

app.service('messages', function () {
    var warningMessage = "Warning Dummy";
    var successMessage = "Success Dummy";
    var warning = false;
    var success = false;

    showWarning = function (message) {
        this.warningMessage = message;
        this.warning = true;
    };

    closeWarning = function () {
        this.warning = false;
    };

    showSuccess = function (message) {
        this.successMessage = message;
        this.success = true;
    };

    closeSuccess = function () {
        this.success = false;
    }

    return {
        warningMessage: warningMessage,
        successMessage: successMessage,
        warning: warning,
        success: success,
        showWarning: showWarning,
        closeWarning: closeWarning,
        showSuccess: showSuccess,
        closeSuccess: closeSuccess
    };
});


app.service('shared', function () {
    var datenJS = [];
    var chapterFlagPath = "";
    var profiles = [];
    var selectedProfile = "";
    var placeholder = [];
    var allCompetences = [];
    var currentChapter = "";

    return {
        datenJS: datenJS,
        chapterFlagPath: chapterFlagPath,
        profiles: profiles,
        selectedProfile: selectedProfile,
        placeholder: placeholder,
        allCompetences: allCompetences,
        currentChapter: currentChapter
    }
});

app.directive('warningMessage', function () {
    return {
        templateUrl: "directives/warningmessage.html"
    };
});

app.directive('successMessage', function () {
    return {
        templateUrl: "directives/successmessage.html"
    };
});

app.config(function ($routeProvider) {
    $routeProvider.when("/", {
        templateUrl: "views/main.html"
    }).when("/educationalplan", {
        templateUrl: "views/educational.html"
    }).when("/changepassword", {
        templateUrl: "views/changepassword.html"
    }).when("/changeprofile", {
        templateUrl: "views/changeprofile.html"
    }).when("/deleteprofile", {
        templateUrl: "views/deleteprofile.html"
    });
});

app.service('educational', function () {
    var educationalPlans = [];
    educationalPlans[0] = {
        competence: []
    };
    educationalPlans[1] = {
        competence: []
    };
    educationalPlans[2] = {
        competence: []
    };
    var currentEducationalPlan = educationalPlans[0];


    return {
        educationalPlans: educationalPlans,
        currentEducationalPlan: currentEducationalPlan
    };
});

app.controller('MainController', function ($scope, $cookies, $window, $http, shared, educational) {
    $scope.hideAllDropdowns = function () {
        $(".dropdown-button").next().css("display", "none");
    };

    $scope.changeEducationalPlan = function (id) {
        educational.currentEducationalPlan = educational.educationalPlans[id];
        $scope.hideAllDropdowns();
    }
    ;

    $scope.setBackgroundImage = function (id, linkActive, linkInactive) {
        $(id).css("background-image", "url(" + linkInactive + ")");
        $(id).hover(function () {
            $(this).css("background-image", "url(" + linkActive + ")");
        }, function () {
                $(this).css("background-image", "url(" + linkInactive + ")");
        });
    };

    $scope.changeCompetence = function (id, checked) {
        if(checked === undefined){
            checked = false;
        }
        $cookies.put("currentChapter", id);
        shared.currentChapter = id;
        if(shared.currentChapter > 0) {
            var usedColor = $scope.chapters[shared.currentChapter - 1].weakcolor;
        }else{
            var usedColor = "#8da6d6";
        }
        $("#backplate").css("background-color", usedColor);
        $("#K" + id).css("background-color", usedColor);

        if(shared.currentChapter > 0) {
            shared.chapterFlagPath = "/images/chapter";
            if (shared.currentChapter < 10) {
                shared.chapterFlagPath += "0";
            }
            shared.chapterFlagPath += (shared.currentChapter) + "/littleChapterFlag.png";
        }
        fillDatenJS(checked);
        $scope.hideAllDropdowns();
    };

    function fillDatenJS(checked) {
        $http.get("http://46.101.204.215:1337/api/V1/studentcompetence?chapterId=" + shared.currentChapter + "&checked=" + checked,
            {headers: {Authorization: $scope.token}}).then(function (response) {
            shared.datenJS = response.data;
            shared.datenJS.sort(function (b, a) {
                return (new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime());
            });

            for (var i = 0; i < shared.datenJS.length; i++) {
                chapterId = shared.datenJS[i].chapterId;
                if (chapterId < 10) {
                    shared.datenJS[i].img = "/images/chapter0";
                } else {
                    shared.datenJS[i].img = "/images/chapter"
                }
                if (shared.datenJS[i].checked) {
                    shared.datenJS[i].img += chapterId + "/competenceDone.png";
                } else {
                    shared.datenJS[i].img += chapterId + "/competenceUndone.png";
                }

                shared.datenJS.dateText

                if(shared.datenJS[i].fromDate!==null){
                    var date = shared.datenJS[i].fromDate.split("-");
                    shared.datenJS[i].dateText = "Du hast diese Kompetenz am " + date[2] + "." + date[1] + "." + date[0] + " Erreicht!"
                }
                shared.datenJS[i].showTooltip = false;

            }
        });
    };

    $scope.logout = function () {
        $cookies.remove('token');
        $scope.hideAllDropdowns();
    };

    // Code
    $scope.educational = educational;
    $scope.shared = shared;
    if ($cookies.get("token") == undefined) {
        $window.location = 'login.html';
    } else {
        $scope.token = $cookies.get("token");
    }


    $http.get("http://46.101.204.215:1337/api/V1/chapter",
        {headers: {Authorization: $scope.token}}).then(function (response) {
        $scope.chapters = response.data;
        shared.currentChapter = $cookies.get("currentChapter");
        if (shared.currentChapter === undefined) {
            shared.currentChapter = 1;
        }
        $scope.changeCompetence(shared.currentChapter);
    });

    $http.get("http://46.101.204.215:1337/api/V1/student",
        {headers: {Authorization: $scope.token}}).then(function (response) {
        $scope.student = response.data;
        $scope.student.school.street = $scope.student.school.address.split(",")[0];
        $scope.student.school.city = $scope.student.school.address.split(",")[1];
        $http.get("http://46.101.204.215:1337/api/V1/avatar",
            {headers: {Authorization: $scope.token}}).then(function (response) {
            $scope.avatars = response.data;
            $scope.setBackgroundImage("#school", $scope.student.school.imageUrl, $scope.student.school.imageUrlInactive);
            $scope.setBackgroundImage("#studyGroup", $scope.student.studyGroups.imageUrl, $scope.student.studyGroups.imageUrlInactive);
            $scope.setBackgroundImage("#student", $scope.avatars[$scope.student.avatarId].avatarUrl, $scope.avatars[$scope.student.avatarId].avatarInactiveUrl);
        });
    });


});
function isValid(str) {
    return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str);
}
app.controller('passwordController', function ($scope, $http, $cookies, messages) {
    $scope.messages = messages
    $scope.token = $cookies.get('token');
    $scope.changePassword = function () {
        if ($scope.newPassword === undefined || $scope.newPassword === "") {
            messages.showWarning("Das Passwort darf nicht leer sein!");
        } else if ($scope.newPassword === $scope.currentPassword) {
            messages.showWarning("Das Passwort darf nicht das Alte Passwort sein!")
        } else if ($scope.newPassword !== $scope.passwordConfirmation) {
            messages.showWarning("Das Passwort und die Bestätigung müssen übereinstimmen!")
        } else if ($scope.newPassword.length < 7) {
            messages.showWarning("Das neue Passwort muss mindestens 7 Zeichen lang sein!");
        } else if ($scope.newPassword.split(/[A-Z]/).length <= 1) {
            messages.showWarning("Das neue Passwort benötigt mindestens einen Großbuchstaben!");
        } else if ($scope.newPassword.split(/[0-9]/).length <= 1) {
            messages.showWarning("Das neue Passwort benötigt mindestens eine Ziffer!");
        } else if (isValid($scope.newPassword)) {
            messages.showWarning("Das neue Passwort benötigt mindestens ein Sonderzeichen!");
        } else {
            $http.put("http://46.101.204.215:1337/api/V1/requestPasswordRecovery", {
                'newpassword': $scope.newPassword,
                'password': $scope.currentPassword
            }, {
                headers: {
                    'Authorization': $scope.token
                }
            }).then(function (response) {
                messages.showSuccess(response.data.message);
            });
        }
    };
});


app.controller('profileChangeCtrl', function ($scope, $http, $cookies, shared, messages) {

    $scope.changeProfile = function () {
        $http.put("http://46.101.204.215:1337/api/V1/avatar/:" + shared.selectedProfile, "", {
            headers: {
                'Authorization': $scope.token
            }
        }).then(function (response) {
            messages.showSuccess("Profilbild wurde erfolgreich geändert!");
        });
    };
    $scope.messages = messages;
    $scope.shared = shared;
    $scope.token = $cookies.get('token');
    shared.selectedProfile = "0";
    shared.profiles = {};
    $scope.selectProfile = function (profile) {
        for (var i = 0; i < 12; i++) {
            if (shared.profiles[i] == profile) {
                shared.selectedProfile = i;
                break;
            }
        }
    };

    $http.get("http://46.101.204.215:1337/api/V1/avatar", {
        headers: {
            'Authorization': $scope.token
        }
    }).then(function (response) {
        for (var i = 0; i < 12; i++) {
            shared.profiles[i] = response.data[i].avatarBigUrl;
        }
    });
    shared.placeholder = {};
    for (var i = 0; i < 36; i++) {
        shared.placeholder[i] = "";
    }
});

app.controller('deleteCtrl', function ($scope, $http, $cookies, messages) {
    $scope.messages = messages;
    $scope.token = $cookies.get("token");
    $scope.deleteProfile = function () {
        $http.delete("http://46.101.204.215:1337/api/V1/student", {
            headers: {
                'Authorization': $scope.token
            }
        }).then(function (response) {
            messages.showSuccess("Das Profil wurde erfolgreich gelöscht!");
        });
    };
});

app.controller('educationalController', function ($scope, $http, educational, shared) {
    $scope.educational = educational;

    $scope.showTooltip = function (competence) {
        competence.showTooltip = true;
    };

    $scope.closeTooltip = function (competence) {
        competence.showTooltip = false;
    };


    $http.get("http://46.101.204.215:1337/api/V1/studentcompetence",
        {headers: {Authorization: $scope.token}}).then(function (response) {
        shared.allCompetences = response.data;

        $scope.buildPlan(1);
        $scope.buildPlan(2);
        $scope.buildPlan(3);


    });

    $scope.buildPlan = function (id) {
        $http.get("http://46.101.204.215:1337/api/V1/educationalPlan/:" + id,
            {headers: {Authorization: $scope.token}}).then(function (response) {
            var competenceIndex = 0;
            for (var i = 0; i < response.data[0].competences.length; i++) {
                var currentCompetence = shared.allCompetences[response.data[0].competences[i].competenceId];
                var educationalCompetence = educational.educationalPlans[id - 1].competence[competenceIndex];
                educationalCompetence = {
                    studentText: "",
                    note: "",
                    fromDate: "",
                    dateText: "",
                    img: "",
                    showTooltip: false
                };
                educationalCompetence.studentText = currentCompetence.studentText;
                educationalCompetence.fromDate = currentCompetence.fromDate;
                if(educationalCompetence.fromDate !== null){
                    var date = educationalCompetence.fromDate.split("-");
                    educationalCompetence.dateText = "Du hast diese Kompetenz am " + date[2] + "." + date[1] + "." + date[0] + " Erreicht!"
                }else

                    console.log(educationalCompetence.dateText);
                educationalCompetence.note = response.data[0].competences[i].note;
                if (currentCompetence.checked) {
                    if (currentCompetence.chapterId < 10) {
                        educationalCompetence.img = "images/chapter0" + currentCompetence.chapterId + "/competenceDone.png";
                    } else {
                        educationalCompetence.img = "images/chapter" + currentCompetence.chapterId + "/competenceDone.png";
                    }
                } else {
                    educationalCompetence.img = "images/isInEducationalPlan.png";
                }

                educational.educationalPlans[id - 1].competence[competenceIndex] = educationalCompetence;
                educational.educationalPlans[id - 1].competence.sort(function (a, b) {
                    return (new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime());
                });
                competenceIndex++;
            }
        });
    }

});