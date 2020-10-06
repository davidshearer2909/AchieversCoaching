angular.module("umbraco").controller("USN.ThemeColors.Controller", function ($scope, overlayService) {

    $scope.isLoaded = false;


    //True will close tab
    $scope.generalTabStyle = true;
    $scope.contentTabStyle = true;
    $scope.buttonTabStyle = true;

    //FIX from here to understand JSON valueType
    //https://our.umbraco.com/forum/umbraco-8/96478-custom-property-editor-with-valuetype-json
    var initModelValue = $scope.$watch('model.value', function (model) {
        if (typeof model === 'string' && model.length == 0)
            $scope.model.value = {};
        initModelValue(); //Deregisters the watch so we wont waste resources
    });


    // Initialize the model
    if (!$scope.model.value) {
        $scope.model.value = {
            contentItems: [],
            buttonItems: [],
            bodyBackground: "#eeeeee",
            headerBackground: "#d8d8d8",
            footerBackground: "#d8d8d8",
            footerBorder: "#cccccc",
            footerHighlight: "#cccccc",
            headerBorder: "#cccccc",
            headerHighlight: "#000000",
            headerText: "#000000",
            footerText: "#000000",
            footerHeading: "#000000",
            mainNavigationLink: "#000000",
            mainNavigationLinkHover: "#6c6c6c",
            mainNavigationLinkActive: "#6c6c6c",
            mainNavDropdown: "#d8d8d8",
            mainNavDropdownLink: "#000000",
            mainNavDropdownLinkHover: "#6c6c6c",
            mainNavDropdownLinkActive: "#6c6c6c",
            secondaryNavLink: "#000000",
            secondaryNavLinkHover: "#6c6c6c",
            footerLink: "#000000",
            footerLinkHover: "#6c6c6c",
            contentBackground: "#ffffff",
            contentHeading: "#000000",
            contentSecondaryHeading: "#000000",
            contentText: "#000000",
            contentLink: "#000000",
            contentLinkHover: "#6c6c6c",
            contentBorder: "#000000",
            contentHighlightBackground: "#6c6c6c",
            contentHighlightText: "#ffffff",
            buttonBackground: "#cccccc",
            buttonText: "#000000",
            buttonBorder: "#000000",
            buttonBackgroundHover: "#d8d8d8",
            buttonTextHover: "#6c6c6c",
            buttonBorderHover: "#6c6c6c"
        };
    }
    else {
        //Loop contentItems and buttonItems to reset tabStyle to closed.
        $scope.model.value.contentItems.forEach(function (item, index) {
            item.tabStyle = true;
        });

        $scope.model.value.buttonItems.forEach(function (item, index) {
            item.tabStyle = true;
        });
    }

    // Add a new content item
    $scope.addContentItem = function () {
        $scope.model.value.contentItems.push({
            background: "#ffffff",
            heading: "#000000",
            secondaryHeading: "#000000",
            text: "#000000",
            link: "#000000",
            linkHover: "#000000",
            border: "#000000",
            highlightBackground: "#cccccc",
            highlightText: "#ffffff",
            tabStyle: false
        });
    }

    // Add a new button item
    $scope.addButtonItem = function () {
        $scope.model.value.buttonItems.push({
            background: "#ffffff",
            text: "#000000",
            border: "#000000",
            backgroundHover: "#ffffff",
            textHover: "#000000",
            borderHover: "#000000",
            tabStyle: false
        });
    }

    // Remove content item
    $scope.removeContentItem = function (index) {
        const overlay = {
            title: "Delete",
            content: "Are you sure you want to delete this item?",
            closeButtonLabel: "cancel",
            submitButtonLabel: "Yes, delete",
            submitButtonStyle: "danger",
            close: function () {
                overlayService.close();
            },
            submit: function () {
                $scope.model.value.contentItems.splice(index, 1);
                overlayService.close();
            }
        };

        overlayService.open(overlay);
       
    }

    // Remove button item
    $scope.removeButtonItem = function (index) {

        const overlay = {
            title: "Delete",
            content: "Are you sure you want to delete this item?",
            closeButtonLabel: "cancel",
            submitButtonLabel: "Yes, delete",
            submitButtonStyle: "danger",
            close: function () {
                overlayService.close();
            },
            submit: function () {
                $scope.model.value.buttonItems.splice(index, 1);
                overlayService.close();
            }
        };

        overlayService.open(overlay);  
    }

});



angular.module('umbraco').directive('colorpicker', function () {
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ngModel) {
            elem.spectrum();
            if (!ngModel) return;
            ngModel.$render = function () {

                var changeCalled;
                var originalColor;

                elem.spectrum({
                    showInput: true,
                    showInitial: true,
                    preferredFormat: "hex",
                    chooseText: "select",
                    color: ngModel.$viewValue,
                    show: function () {
                        changeCalled = false;
                        originalColor = ngModel.$viewValue;
                    },
                    move: function (c) {
                        scope.$apply(function () {
                            ngModel.$setViewValue(c.toHexString());
                        });
                    },
                    hide: function (c) {
                        if (!changeCalled) {
                            ngModel.$setViewValue(originalColor);
                        }
                    },
                    change: function (c) {
                        scope.$apply(function () {
                            changeCalled = true;
                            ngModel.$setViewValue(c.toHexString());
                        });
                    }
                    
                });
            };
            
        }
    }
});