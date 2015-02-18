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
})();
