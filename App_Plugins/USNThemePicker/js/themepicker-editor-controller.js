angular.module("umbraco").controller("USN.ThemePicker.Controller", function ($scope, $http, notificationsService) {

    $http({
        method: 'GET',
        url: 'backoffice/api/USNThemePicker/GetThemes'
    }).then(function (response) {
        $scope.themes = response.data;
        if ($scope.themes.length == 1) {
            $scope.model.label = "Selected theme";
            $scope.model.value = $scope.themes[0];
        }
        else if ($scope.themes.length == 0) {
            $scope.model.value = '';
        }
    }, function (error) {
            notificationsService.error("Error", "Issue getting available themes.");
    });

});