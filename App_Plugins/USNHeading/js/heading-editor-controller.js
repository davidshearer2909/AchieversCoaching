angular.module("umbraco").controller("USN.HeadingController", function ($scope) {

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
            text : "",
            headingtag : ""
        };
    }

    $scope.model.currentHeadingTag = $scope.model.value.headingtag;

    //code to allow deselect of radio buttons
    $scope.check = function (event) {

        if ($scope.model.currentHeadingTag === event.target.value) {
            $scope.model.value.headingtag = "";
            $scope.model.currentHeadingTag = "";
        }
        else {
            $scope.model.value.headingtag = event.target.value;
            $scope.model.currentHeadingTag = event.target.value;
        }
    }

});