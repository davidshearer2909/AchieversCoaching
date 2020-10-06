function trueFalseChangeVisibilityItem(scope) {
    var tabs = "";
    var fields = "";
    // Hide/show tabs/properties
    if (scope.model.value == 0) {
        tabs = scope.model.config.falseTabs;
        fields = scope.model.config.falseFields; 
    }
    else {
        tabs = scope.model.config.trueTabs;
        fields = scope.model.config.trueFields;
    }

    trueFalseHideShowSections(tabs);
    trueFalseHideShowContentDropdowns(tabs);
    trueFalseHideShowProperties(fields);
}

function trueFalseHideShowSections(tabsList) {
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

function trueFalseHideShowContentDropdowns(tabsList) {
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

function trueFalseHideShowProperties(fieldsList) {
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

