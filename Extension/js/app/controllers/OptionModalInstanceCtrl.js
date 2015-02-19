/**
 * Created by ChzMo on 2015-02-19.
 */

(function () {
    "use strict";

    angular
        .module('histree')
        .controller('OptionModalInstanceCtrl', OptionModalInstanceCtrl);

    OptionModalInstanceCtrl.$inject = ['$modalInstance', 'Blacklist'];

    function OptionModalInstanceCtrl($modalInstance, Blacklist) {
        var vm = this;

        vm.blacklist = Blacklist.getBlacklistByString();

        vm.submitOptionForm = submitOptionForm;

        /////////////////////////////////

        function submitOptionForm() {
            Blacklist.setBlacklist(vm.blacklist);
            $modalInstance.close();
        }
    }
}) ();