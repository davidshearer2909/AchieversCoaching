
angular.module("umbraco").controller("USN.TrueFalseShowHide.Controller", function ($scope, $timeout, angularHelper, assetsService, $q) {

    var alreadyDirty = false;

    var await = [];

    await.push(assetsService.loadJs('/App_Plugins/USNTrueFalseShowHide/js/truefalseshowhide-common.js', $scope));

    // Wait for queue to end
    $q.all(await).then(function () {

        $scope.model.textRight = "";

        if ($scope.model.value === null || $scope.model.value === "") {
            $scope.enabled = 0;
        } else {
            $scope.enabled = $scope.model.value == 1;
        }

        $scope.$watch('enabled', function (newval, oldval) {

            $scope.model.value = newval === true ? 1 : 0;

            if ($scope.model.value == 1) {
                $scope.model.textRight = "Yes";

            }
            else {
                $scope.model.textRight = "No";
            }

            changeVisibilityAllItems();

            if (newval !== oldval) {

                //run after DOM is loaded
                $timeout(function () {
                    if (!alreadyDirty) {
                        var currForm = angularHelper.getCurrentForm($scope);
                        currForm.$setDirty();
                        alreadyDirty = true;
                    }


                }, 0);

                changeVisibilityAllItems();
            }

        }, true);


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
                        if ($(value).text().trim() == dropDownText.trim()) {
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

            
            trueFalseChangeVisibilityItem($scope);
            

        }

    });


});