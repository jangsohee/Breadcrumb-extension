  /**
 * @author ChzMo
 */

(function() {
    "use strict";

    var app = angular.module('histree', ['ui.tree', 'ui.bootstrap']);

    app.value('projectName', 'Breadcrumb');
    app.value('baseUrl', 'http://210.118.74.170:9000/');
    app.value('defaultBlacklist', ['http://*bank*, http://*privacy*, http://*account*, http://*my*page*']);
    //app.value('baseUrl', 'http://121.135.191.219:9000/')

    app.run(['$modal', '$log', 'accountService', 'Com', function ($modal, $log, accountService, Com) {
        initService();

        /////////////////////////////

        function initService() {
            // [Breadcrumb]
            //return;

            var userInfo = accountService.getUserInfo();

            if (userInfo.token) {
                console.log("You have a token");
                console.log(userInfo.token);
                Com.requestTree(userInfo.token);
            }
            else {
                console.log("You don't have a token");
                showLoginForm();
            }
        }


        function showLoginForm() {
            var modalInstance = $modal.open({
                templateUrl: '../templates/login-form.html',
                controller: 'LoginModalInstanceCtrl',
                controllerAs: 'loginModal',
                backdrop: 'static',
                keyboard: false
            });

            modalInstance.result.catch(function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }
    }]);
})();
