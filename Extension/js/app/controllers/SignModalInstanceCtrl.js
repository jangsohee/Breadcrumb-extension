/**
 * Created by ChzMo on 2015-02-19.
 */

(function () {
    "use strict";

    angular
        .module('histree')
        .controller('SignModalInstanceCtrl', SignModalInstanceCtrl);

    SignModalInstanceCtrl.$inject = ['$scope', '$modalInstance', '$http', '$q', 'accountService', 'Com', 'baseUrl'];

    function SignModalInstanceCtrl($scope, $modalInstance, $http, $q, accountService, Com, baseUrl) {
        var vm = this;

        vm.submitLbl = "OK";
        vm.cancel = cancel;
        vm.submitSignForm = submitSignForm;

        //////////////////////////////////

        function cancel() {
            $modalInstance.dismiss('cancel');
        }


        function submitSignForm() {
            console.log(vm.account);

            if ($scope.form.signForm.$valid) {
                vm.submitLbl = "Process...";

                return signUp(vm.account)
                    .then(function (token) {
                        $modalInstance.close();
                        return token;
                    })
                    .catch(function () {
                        console.log('sign up is canceling.');
                    })
                    .finally(function () {
                        vm.submitLbl = "OK";
                    });
            }
            else {
                console.log('signForm is not in scope');
            }
        }


        function signUp(account) {
            return accountService.signUp(account)
                .then(function(token) {
                    alert("Success to sign up! Please Login!");
                    return token;
                })
                .catch(function () {
                    console.log('Fail to sign up. Please retry...');
                    return $q.reject();
                });
        }

    }
}) ();