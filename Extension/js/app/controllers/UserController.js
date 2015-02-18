/**
 * Created by ChzMo on 2015-02-18.
 */

(function () {
    "use strict";

    angular
        .module('histree')
        .controller('UserController', UserController);

    UserController.$inject = ['$scope', '$modal', '$http', '$log', 'Com', 'Blacklist', 'baseUrl'];

    function UserController($scope, $modal, $http, $log, Com, Blacklist, baseUrl) {
        $scope.Logout = function () {
            Com.clearToken();
        };

        $scope.showSignForm = function () {
            $scope.message = "Show Form Button Clicked";
            console.log($scope.message);

            var modalInstance = $modal.open({
                templateUrl: '../templates/sign-form.html',
                controller: SignModalInstanceCtrl,
                scope: $scope,
                resolve: {
                    signForm: function () {
                        return $scope.signForm;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };


        $scope.showLoginForm = function () {
            $scope.message = "Show Form Button Clicked";
            console.log($scope.message);

            var modalInstance = $modal.open({
                templateUrl: '../templates/login-form.html',
                controller: LoginModalInstanceCtrl,
                scope: $scope,
                resolve: {
                    loginForm: function () {
                        return $scope.loginForm;
                    }
                },
                backdrop: 'static'
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }


        $scope.showOptionForm = function () {
            $scope.message = "Show Form Button Clicked";
            console.log($scope.message);

            var modalInstance = $modal.open({
                templateUrl: '../templates/option-form.html',
                controller: OptionModalInstanceCtrl,
                scope: $scope,
                resolve: {
                    optionForm: function () {
                        return $scope.optionForm;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };


        var initService = function (items) {
            // [Breadcrumb]
            return;
            if (items.token) {
                console.log("You have a token");
                console.log(items.token);
                Com.setToken(items.token);
            }
            else {
                console.log("You don't have a token");
                $scope.showLoginForm();
            }
        };

        chrome.storage.local.get('token', initService);

        var SignModalInstanceCtrl = function ($scope, $modalInstance, Com, signForm, $http, baseUrl) {
            $scope.btnLabel = "OK";
            $scope.form = {};
            $scope.signSubmitForm = function () {
                console.log($scope.account);

                if ($scope.form.signForm.$valid) {
                    $scope.btnLabel = "Process...";

                    var reqConfig = {
                        method: 'POST',
                        url: baseUrl + 'api/users',
                        data: $scope.account
                    };
                    var reqPromise = $http(reqConfig);


                    reqPromise.success(function (data, status, headers, config) {
                        if (status == 201) {
                            var token = data.data.token;
                            console.log("Sign up is finished.");
                            console.log(token);
                        }
                        else {
                            alert('to sign up account to server success but unknown behavior.');
                            console.log(JSON.stringify(data));
                        }

                        $scope.btnLabel = "OK";

                        alert("Success to sign up! Please Login!")
                        $modalInstance.close('closed');
                    });


                    reqPromise.error(function (data, status, headers, config) {
                        alert('to sign up account to server error :' + status);

                        if (status == 404) {
                            // TODO: Error 404 Implement
                        }
                        else if (status == 422) {
                            alert(data.message);
                        }
                        else {
                            alert('to sign up account to server unknown error : ' + status);
                        }

                        console.log(JSON.stringify(data));

                        $scope.btnLabel = "OK";
                    });
                } else {
                    console.log('signForm is not in scope');
                }
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };

        var LoginModalInstanceCtrl = function ($scope, $modalInstance, Com, loginForm, $http, baseUrl) {
            $scope.form = {};
            $scope.submitForm = function () {
                if ($scope.form.loginForm.$valid) {
                    var reqConfig = {
                        method: 'POST',
                        url: baseUrl + 'auth/local',
                        data: $scope.account
                    };
                    var reqPromise = $http(reqConfig);

                    reqPromise.success(function (data, status, headers, config) {
                        if (status == 201) {
                            var token = data.data.token;
                            chrome.storage.local.set({'token': token, 'user': data.data.user});
                            // Server Communication start --
                            Com.setToken(token);
                            $modalInstance.close('closed');
                        }
                        else {
                            alert('to login account to server success but unknown behavior.');
                            console.log(JSON.stringify(data));
                        }
                    });


                    reqPromise.error(function (data, status, headers, config) {
                        alert('to login account to server error :' + status);
                        console.log($scope.account);
                        if (status == 401 || status == 403) {
                            alert(data.message);
                        }
                        else {
                            alert('to login account to server unknown error : ' + status);
                        }

                        console.log(JSON.stringify(data));
                    });
                } else {
                    console.log('loginForm is not in scope');
                }
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };

        var OptionModalInstanceCtrl = function ($scope, $modalInstance, optionForm, Blacklist) {
            $scope.blacklist = Blacklist.getBlacklistByString();

            $scope.form = {};
            $scope.submitForm = function () {
                Blacklist.setBlacklist($scope.blacklist);
                $modalInstance.close('closed');
            };
        };
    }
}) ();