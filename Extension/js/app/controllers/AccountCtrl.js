/**
 * Created by ChzMo on 2015-02-18.
 */

(function () {
    "use strict";

    angular
        .module('histree')
        .controller('AccountCtrl', AccountCtrl);

    AccountCtrl.$inject = ['$modal', '$log', 'account', 'Com'];

    function AccountCtrl($modal, $log, account, Com) {
        var vm = this;

        vm.logout = logout;
        vm.showOptionForm = showOptionForm;

        ///////////////////////////

        function logout() {
            account.logout();
            location.reload(true);
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