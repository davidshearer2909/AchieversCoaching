angular.module("umbraco")
    .controller("USN.ValueShowHideTabs.prevaluesController",
    function ($scope, $timeout, assetsService) {

        // Initialize the model
        if (!$scope.model.value) {
            $scope.model.value = {
                items: []
            };
        }

        // Load the css file with the grid's styles
        assetsService.loadCss("/App_Plugins/USNValueShowHide/css/valueshowhide-prevalues.css");

        // Add a new item
        $scope.addItem = function () {
            $scope.model.value.items.push({
                field: "",
                tabs: "",
                fields: ""
            });
        }

        // Remove an item
        $scope.removeItem = function (index) {
            $scope.model.value.items.splice(index, 1);
        }

    });