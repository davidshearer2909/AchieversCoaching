angular.module("umbraco").controller("USN.HorizontalPosition.Controller", function ($scope) {

    if ($scope.preview) {
        return;
    }

    $scope.model.currentPosition = $scope.model.value;

    //code to allow deselect of radio buttons
    $scope.checkPosition = function (event) {

        if ($scope.model.currentPosition == event.target.value) {
            $scope.model.value = "";
            $scope.model.currentPosition = "";
        }
        else {
            $scope.model.currentPosition = event.target.value;
            $scope.model.value = event.target.value;
        }
    };

});