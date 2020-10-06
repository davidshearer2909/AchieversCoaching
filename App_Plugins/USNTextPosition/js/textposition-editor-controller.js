angular.module("umbraco").controller("USN.TextPosition.Controller", function ($scope) {

    //Only set values if in edit mode
    if (!$scope.preview) {
        $scope.model.currentPosition = $scope.model.value;
    }

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