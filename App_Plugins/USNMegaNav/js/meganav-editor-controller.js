function USNMegaNav($scope, angularHelper, localizationService, entityResource, iconHelper, editorService, $http, assetsService, notificationsService, $routeParams, overlayService) {

    if ($scope.preview) {
        return;
    }

    var vm = {
        labels: {
            general_recycleBin: ""
        }
    };

    $scope.renderModel = [];
    $scope.icons = [];
    $scope.pattern = '<i class="{0}"></i>';
    var theme = "";

    var getIcons = () => {

        var matches = [];

        var promise = $http.get('backoffice/api/USNMultiUrlPicker/GetThemePath',
            {
                params: {
                    currentNodeID: $routeParams.id
                }
            }
        );

        promise.then(

            function (payload) {
                $scope.vm = payload.data;
                theme = $scope.vm.themepath;

                var stylePath = "/css/usn_" + theme + "/icons.css",
                    styleRegexPattern = $scope.model.config.styleRegex,
                    styleRegex = new RegExp(styleRegexPattern, 'g'),
                    isError = false;

                // Get the class names from the specified stylesheet,
                // use angular http request to make a cached request for the stylesheet content.
                $http({
                    method: 'GET',
                    url: stylePath,
                    cache: true
                })
                    .then((response, status, headers, config) => {
                        var hasMatches = styleRegex.test(response.data);

                        //reset regex
                        styleRegex.compile(styleRegexPattern, "g");

                        if (hasMatches) {
                            var match = styleRegex.exec(response.data);

                            while (match !== null) {
                                match = styleRegex.exec(response.data);

                                // check if match has populated array
                                if (match !== null && match.length > 1) {

                                    //c heck if array already contains match and not on exclude list
                                    if (!(matches.indexOf(match[1]) > 0)) {
                                        matches.push(match[1]);
                                        hasMatches = true;
                                    }
                                }
                            }
                        }

                        matches.sort();

                        if (!hasMatches && !isError) {
                            isError = true;
                            notificationsService.error('ERROR:', 'No matches in stylesheet for regex: ' + styleRegexPattern);
                        }
                    })
                    .catch((data, status, headers, config) => {
                        notificationsService.error('ERROR:', 'file ' + stylePath + ' not found.');
                        isError = true;
                    });

                // Load the supplied css stylesheet using the umbraco assetsService
                assetsService.loadCss(stylePath);

            },
            function (errorPayLoad) {
                notificationsService.error("Error", "Issue getting theme path");
            }
        );


        return matches;
    };

    if (!Array.isArray($scope.model.value)) {
        $scope.model.value = [];
    }

    var currentForm = angularHelper.getCurrentForm($scope);

    $scope.model.value.forEach(function (item) {

        //if link empty dont add to renderModel
        if (item.link.length > 0) {
            $scope.renderModel.push(item);
        }
    });

    $scope.$on("formSubmitting", function () {
        $scope.model.value = $scope.renderModel;
    });

    $scope.$watch(
        function () {
            return $scope.renderModel.length;
        }
    );

    $scope.openIconPicker = function (item) {
        $scope.iconOverlay.show = true;
        $scope.iconOverlay.icons = $scope.icons;
        $scope.iconOverlay.render = $scope.render;
        $scope.iconOverlay.item = item;
    };

    $scope.openLinkPicker = function (item, link) {
        var target = link ? {
            name: link.name,
            anchor: link.queryString,
            udi: link.udi,
            url: link.url,
            target: link.target
        } : null;

        var linkPicker = {
            currentTarget: target,
            dataTypeKey: $scope.model.dataTypeKey,
            ignoreUserStartNodes: $scope.model.config.ignoreUserStartNodes,
            submit: function (model) {
                if (model.target.url || model.target.anchor) {
                    // if an anchor exists, check that it is appropriately prefixed
                    if (model.target.anchor && model.target.anchor[0] !== '?' && model.target.anchor[0] !== '#') {
                        model.target.anchor = (model.target.anchor.indexOf('=') === -1 ? '#' : '?') + model.target.anchor;
                    }
                    if (link) {
                        link.udi = model.target.udi;
                        link.name = model.target.name || model.target.url || model.target.anchor;
                        link.queryString = model.target.anchor;
                        link.target = model.target.target;
                        link.url = model.target.url;
                    } else {
                        link = {
                            name: model.target.name || model.target.url || model.target.anchor,
                            queryString: model.target.anchor,
                            target: model.target.target,
                            udi: model.target.udi,
                            url: model.target.url
                        };
                        item.link = [];
                        item.link.push(link);
                    }

                    if (link.udi) {
                        var entityType = model.target.isMedia ? "Media" : "Document";

                        entityResource.getById(link.udi, entityType).then(function (data) {
                            link.icon = iconHelper.convertFromLegacyIcon(data.icon);
                            link.published = (data.metaData && data.metaData.IsPublished === false && entityType === "Document") ? false : true;
                            link.trashed = data.trashed;
                            if (link.trashed) {
                                item.url = vm.labels.general_recycleBin;
                            }
                        });
                    } else {
                        link.icon = "icon-link";
                        link.published = true;
                    }

                    currentForm.$setDirty();
                }
                editorService.close();
            },
            close: function () {
                editorService.close();
            }
        };
        editorService.linkPicker(linkPicker);
    };

    // Add a new link item
    $scope.addItem = function () {
        $scope.renderModel.push({
            icon: "",
            link: [],
            subPages: []
        });
    };

    $scope.render = function (currentClassName) {
        return $scope.pattern.replace("{0}", currentClassName);
    };

    //Add a new icon to the item
    $scope.iconOverlay = {
        title: "Select an icon",
        view: "/App_Plugins/USNMegaNav/views/meganav-iconpicker.html",
        size: "small",
        show: false,
        pickIcon: function (item, icon) {
            $scope.iconOverlay.show = false;
            item.icon = icon;
        },
        close: function () {
            $scope.iconOverlay.show = false;
        }
    };


    // remove link
    $scope.removeLink = function (item) {
        item.link = [];
    };

    $scope.removeIcon = function (item) {
        item.icon = "";
    };

    //delete item
    $scope.deleteItem = function (item) {

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
                $scope.renderModel.splice($index, 1);
                currentForm.$setDirty();
                overlayService.close();
            }
        };

        overlayService.open(overlay);
    };


    $scope.icons = getIcons();


    $scope.isEmpty = function (obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    };

    function init() {
        localizationService.localizeMany(["general_recycleBin"])
            .then(function (data) {
                vm.labels.general_recycleBin = data[0];
            });
    }

    init();

    //var items = [{
    //    'title': 'Home',
    //    'nodes': [
    //        {
    //            'title': 'About',
    //            'nodes': [
    //                {
    //                    'title': 'Staff',
    //                    'nodes': []
    //                }
    //            ]
    //        },
    //        {
    //            'title': 'Contact',
    //            'nodes': []
    //        }
    //    ]
    //}];

    //$scope.items = items;

    //$scope.toggle = function (scope) {
    //    scope.toggle();
    //};

    //$scope.addItem = function (scope) {

    //    $scope.items.push({
    //        title: 'New item',
    //        nodes: []
    //    });
    //};
}

angular.module("umbraco").controller("USN.MegaNav.Controller", USNMegaNav);

app.requires.push("ui.tree");