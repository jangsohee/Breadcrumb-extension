/**
 * Created by ChzMo on 2015-02-18.
 */

(function () {
    "use strict";

    angular
        .module('histree')
        .controller('UserCtrl', UserCtrl);

    UserCtrl.$inject = ['$modal', '$log', 'Com'];

    function UserCtrl($modal, $log, Com) {
        var vm = this;

        vm.logout = logout;
        vm.showOptionForm = showOptionForm;

        ///////////////////////////

        function logout() {
            Com.clearToken();
        }


        function showOptionForm() {
            var modalInstance = $modal.open({
                templateUrl: '../templates/option-form.html',
                controller: 'OptionModalInstanceCtrl',
                controllerAs: 'optModal'
            });

            modalInstance.result.catch(function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }
    }
}) ();