function optionsChangeVisibilityItem(scope, item) {
    // Find the item
    var index = scope.items.indexOf(item);
    // Hide/show tabs/properties
    if (index > -1) {
        var tabs = scope.items[index].tabs;
        var fields = scope.items[index].fields;
        optionsHideShowSections(tabs);
        optionsHideShowContentDropdowns(tabs);
        optionsHideShowProperties(fields);
    }
}

function optionsHideShowSections(tabsList) {
    if (tabsList && tabsList !== '') {
        var tabLabels = tabsList.split(",");
        angular.forEach(tabLabels, function (value, key) {
            // Remove the first charater which contains the action (+ show, - Hide)
            var tabLabel = "group-" + value.substring(1, value.length);
            var action = value.charAt(0);
            // Look for the tab control
            var tabControls = $("div[data-element^= 'group']");
            // Show/hide the control
            angular.forEach(tabControls, function (value, key) {
                if ($(value).data("element") == tabLabel) {
                    switch (action) {
                        case '+':
                            $(value).show();
                            break;
                        case '-':
                            $(value).hide();
                            break;
                        default:
                    }
                }
            });
        });
    }
}

function optionsHideShowContentDropdowns(tabsList) {
    if (tabsList && tabsList !== '') {
        var tabLabels = tabsList.split(",");
        angular.forEach(tabLabels, function (value, key) {
            // Remove the first charater which contains the action (+ show, - Hide)
            var tabLabel = value.substring(1, value.length).trim();
            var action = value.charAt(0);
            // Look for the tab control
            var tabControls = $("umb-editor-navigation-item li a");
            // Show/hide the control
            angular.forEach(tabControls, function (value, key) {
                if ($(value).text().trim() == tabLabel) {
                    switch (action) {
                        case '+':
                            $(value).closest("li").show();
                            break;
                        case '-':
                            $(value).closest("li").hide();
                            break;
                        default:
                    }
                }
            });
        });
    }
}

function optionsHideShowProperties(fieldsList) {
    if (fieldsList && fieldsList !== '') {
        var fieldLabels = fieldsList.split(",");
        angular.forEach(fieldLabels, function (value, key) {
            // Remove the first charater which contains the action (+ show, - Hide)
            var propertyAlias = value.substring(1, value.length);
            var action = value.charAt(0);
            // Look for the property controls
            var propertyControls = $("div[class*='umb-property']:has(ng-form)");
            // Show/hide the control
            angular.forEach(propertyControls, function (value, key) {
                if ($(value).find(".control-label").attr("for") == propertyAlias) {
                    switch (action) {
                        case '+':
                            $(value).show();
                            break;
                        case '-':
                            $(value).hide();
                            break;
                        default:
                    }
                }
            });
        });
    }
}

