angular.module("umbraco").controller("USN.BackgroundOptions.Controller", function ($scope) {

    if ($scope.preview) {
        return;
    }

    //FIX from here to understand JSON valueType
    //https://our.umbraco.com/forum/umbraco-8/96478-custom-property-editor-with-valuetype-json
    var initModelValue = $scope.$watch('model.value', function (model) {
        if (typeof model === 'string' && model.length == 0)
            $scope.model.value = {};
        initModelValue(); //Deregisters the watch so we wont waste resources
    });

    if (!$scope.model.value) {
        $scope.model.value = {
            currentStyle: "",
            currentPosition: ""
        };
    }

    $scope.model.currentStyle = $scope.model.value.style;
    $scope.model.currentPosition = $scope.model.value.position;

    //code to allow deselect of radio buttons
    $scope.checkStyle = function (event) {

        if ($scope.model.currentStyle == event.target.value) {
            $scope.model.value.style = "";
            $scope.model.currentStyle = "";
        }
        else {
            $scope.model.currentStyle = event.target.value;
            $scope.model.value.style = event.target.value;
        }
    };

    $scope.checkPosition = function (event) {

        if ($scope.model.currentPosition == event.target.value) {
            $scope.model.value.position = "";
            $scope.model.currentPosition = "";
        }
        else {
            $scope.model.currentPosition = event.target.value;
            $scope.model.value.position = event.target.value;
        }
    };

});