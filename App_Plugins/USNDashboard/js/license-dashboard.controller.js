angular.module("umbraco").controller("USN.LicenseDashboard.Controller", function ($scope, $http, notificationsService, Upload) {

    $scope.isLoaded = false;


    var promise = $http.get('backoffice/api/LicenseDashboard/GetViewModel');

    promise.then(

        function (payload) {
            $scope.vm = payload.data;
            $scope.isLoaded = true;
        },
        function (errorPayLoad) {
            notificationsService.error("Error", "Issue getting license information");
            $scope.isLoaded = true;
        }
    );  

    $scope.buttonState = 'busy';
    $scope.handleFiles = handleFiles;
    $scope.upload = upload;

    function upload(file) {
        $scope.buttonState = 'busy';
        $scope.showInstallingMessage = true;
        Upload.upload({
            url: 'backoffice/api/LicenseDashboard/UploadLicenseToServer',
            fields: {
                'someId': 1234
            },
            file: file
        }).success(function (data, status, headers, config) {
            $scope.buttonState = 'success';

            var promise = $http.get('backoffice/api/LicenseDashboard/GetViewModel');

            promise.then(

                function (payload) {
                    $scope.vm = payload.data;
                    $scope.isLoaded = true;
                    $scope.showInstallingMessage = false;
                },
                function (errorPayLoad) {
                    notificationsService.error("Error", "Issue getting license information");
                    $scope.isLoaded = true;
                }
            );  

        }).error(function (data, status, headers, config) {
            $scope.buttonState = 'error';
            notificationsService.error('Upload Failed', data);
            $scope.showInstallingMessage = false;
            notificationsService.error("Error", "Issue getting license information");
        });
    }


    function handleFiles(files, event) {
        if (files && files.length > 0) {
            $scope.buttonState = 'init';
            $scope.file = files[0];
        }
    }

    $scope.showInstallingMessage = false;


});