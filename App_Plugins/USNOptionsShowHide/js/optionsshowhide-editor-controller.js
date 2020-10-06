angular.module("umbraco").controller("USN.OptionShowHideController",

function ($scope, $q, $timeout, assetsService) {

    $scope.isLoaded = false;

    var await = [];



    await.push(assetsService.loadJs('/App_Plugins/USNOptionsShowHide/js/optionsshowhide-common.js', $scope));

    // Wait for queue to end
    $q.all(await).then(function () {

        // Check whether the model is initialized
        if (!$scope.model.value) {
                $scope.model.value = "";
        }

        // Remove any empty item from the list
        $scope.model.config.items.items = $scope.model.config.items.items.filter(function (item) {
            return item.key !== "" && item.text !== "";
        });

        // Populate the list
        $scope.items = $scope.model.config.items.items;

        $scope.isLoaded = true;
        // Change visibility/state of the tabs and properties depending on the dropdown list initial values
        $timeout(function () {
            changeVisibilityAllItems();
        }, 0);

        $scope.model.current = $scope.model.value;

        // Item click
        $scope.check = function (event) {

            //code to allow deselect of radio buttons
            if ($scope.model.current === event.target.value) {
                $scope.model.value = "";
                $scope.model.current = "";
            }
            else {
                $scope.model.value = event.target.value;
                $scope.model.current = event.target.value;
            }

            changeVisibilityAllItems();
        };

        function changeVisibilityAllItems() {
            //Hide all sections
            if (typeof $scope.model.config.hideTabs !== 'undefined') {
                
                var hideSections = $scope.model.config.hideTabs.split(",");

                angular.forEach(hideSections, function (value, key) {
                    var tabLabel = "group-" + value;
                    var dropDownText = value;
                    var tabControls = $("div[data-element^= 'group']");
                    var contentDropdowns = $("umb-editor-navigation-item li a");
                    // Hide the section
                    angular.forEach(tabControls, function (value, key) {
                        if ($(value).data("element") == tabLabel) {
                            $(value).hide();
                        }
                    });

                    angular.forEach(contentDropdowns, function (value, key) {
                        if ($(value).text().trim().indexOf(dropDownText.trim()) > -1) {
                            $(value).closest("li").hide();
                        }
                    });

                });
            }


            //Hide all fields
            if (typeof $scope.model.config.hideFields !== 'undefined') {
                
                var hideFields = $scope.model.config.hideFields.split(",");

                angular.forEach(hideFields, function (value, key) {
                    var propertyAlias = value;
                    var propertyControls = $("div[class*='umb-property']:has(ng-form)");
                    
                    angular.forEach(propertyControls, function (value, key) {
                        if ($(value).find(".control-label").attr("for") == propertyAlias) {
                            $(value).hide();
                        }
                    });
                });
            }

            if ($scope.model.value !== "") {
                angular.forEach($scope.items, function (value, key) {
                    // Check whether it is a currently selected value
                    if ($scope.model && $scope.model.value == value.key) {
                        optionsChangeVisibilityItem($scope, value);
                    }
                });
            }

        }

    });

});
