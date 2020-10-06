angular.module("umbraco").controller("USN.ValueShowHideController",

    function ($scope, $q, $timeout, assetsService, notificationsService, $http, $routeParams) {

    $scope.isLoaded = false;

    var await = [];

    await.push(assetsService.loadJs('/App_Plugins/USNValueShowHide/js/valueshowhide-common.js', $scope));

    // Wait for queue to end
    $q.all(await).then(function () {

        //hide setting field
        optionsHideShowProperties("-" + $scope.model.alias);

        // Change visibility/state of the tabs and properties depending on the dropdown list initial values
        $timeout(function () {
            changeVisibilityAllItems();
        }, 0);

        
        function changeVisibilityAllItems() {

            // Remove any empty item from the list
            $scope.model.config.items.items = $scope.model.config.items.items.filter(function (item) {
                return item.field !== "";
            });

            // Populate the list
            $scope.items = $scope.model.config.items.items;

            //Get field value
            var promise = $http.get('backoffice/api/USNValueShowHide/GetOptionValue',
                {
                    params: {
                        currentNodeID: $routeParams.id,
                        fieldAlias: $scope.model.config.fieldAlias
                    }
                }
            );

            promise.then(

                function (payload) {
                    $scope.vm = payload.data;
                    $scope.model.value = $scope.vm.pageLayout;

                    if ($scope.model.value !== "") {
                        angular.forEach($scope.items, function (value, key) {
                            // Check whether it is a currently selected value
                            if ($scope.model && $scope.model.value == value.field) {
                                optionsChangeVisibilityItem($scope, value);
                            }
                        });
                    }

                },
                function (errorPayLoad) {
                    notificationsService.error("Error", "Issue getting parent value.");
                    $scope.model.value = "";
                }
            );

            

            $scope.isLoaded = true;


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

            

        }

    });

});
