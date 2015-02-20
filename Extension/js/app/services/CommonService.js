/**
 * Created by ChzMo on 2015-02-20.
 */
(function() {
    "use strict";

    angular
        .module('histree')
        .factory('common', common);

    common.$inject = ['$http', 'baseUrl'];

    function common($http, baseUrl) {
        var service = {
            parseURL: parseURL,
            isStringInArray: isStringInArray
        };


        return service;

        ///////////////////////////

        // [서비스로 분리 부분]
        function findTab(tabId) {
            var refreshBlog = $scope.refreshBlogHash[tabId];
            var newTab = $scope.newTabHash[tabId]; // by onCreated manually new tab
            var newTabOpener = $scope.newTabOpenerHash[tabId]; // by onCreated TabopnerId
            var tabChild = $scope.tabChildHash[tabId]; // by CreatedNavigation
            var newTabList = $scope.newTabListHash[tabId]; // by onCreated on clicking list
            var tab = $scope.tabHash[tabId]; // total
            var directTab = $scope.directHash[tabId];
            var replaceTab = $scope.replaceTabHash[tabId];

            if (refreshBlog) {
                return {
                    hash: 'refreshBlogHash',
                    node: refreshBlog
                }
            }
            else if (newTab) {
                return {
                    hash: 'newTabHash',
                    node: newTab
                }
            }
            else if (newTabOpener) {
                return {
                    hash: 'newTabOpenerHash',
                    node: newTabOpener
                }
            }
            else if (tabChild) {
                return {
                    hash: 'tabChildHash',
                    node: tabChild
                }
            }
            else if (newTabList) {
                return {
                    hash: 'newTabListHash',
                    node: newTabList
                }
            }
            else if (directTab) {
                return {
                    hash: 'directHash',
                    node: directTab
                }
            }
            else if (replaceTab) {
                return {
                    hash: 'replaceHash',
                    node: replaceTab
                }
            }
            else if (tab) {
                return {
                    hash: 'tabHash',
                    node: tab
                }
            }
            else
                return undefined;
        }


        function pushToTree(newNode) {
            //var targetElement = document.querySelector("[ng-id='" + newChildNode.parent +"']");

            $log.debug("APPEND NODE TO LIST!!!!!!!!!!!!!!!!!!!!!!");
            if (newNode.parent == newNode._id) {
                $scope.list.push(newNode);
            }
            else {
                var targetNode = pickNodeAsEle(newNode.parent);

                if (targetNode)
                    targetNode.children.push(newNode);
                else {
                    alert("to push node into tree error");

                }
            }

            //if (newNode.active)
            //    document.getElementById(newNode._id).scrollIntoView();
        }


        function popFromTree(removedNode) {
            $log.debug("popFromTree occured");
            var targetElement = document.getElementById(removedNode._id);
            $log.debug(targetElement);
            if (targetElement) {
                var targetScope = angular.element(targetElement).scope();
                $log.debug(targetScope);
                var target = targetScope.$modelValue;
                $log.debug(target);

                var parentTarget = targetScope.$parentNodeScope.$modelValue;
                $log.debug(target);

                //부모의 리스트에 있는 걸 splice하면
                var position = $.inArray(target, parentTarget.children);
                if (~position) parentTarget.children.splice(position, 1);
            }
        }

        function addCount() {
            $scope.total.num = $scope.total.num + 1;
            return $scope.total.num;
        }

        function subCount() {
            $scope.total.num = $scope.total.num - 1;
            return $scope.total.num;
        }

        function getCount() {
            return $scope.total.num;
        }




        function pickNodeAsEle(Id) {
            var targetElement = document.getElementById(Id);
            var targetScope = {};
            if (targetElement)
                targetScope = angular.element(targetElement).scope();
            else
                return undefined;

            return targetScope.$modelValue;
        }


        function isStringInArray(str, strArray) {
            for (var j = 0; j < strArray.length; j++) {
                if (strArray[j].match(str)) return true;
            }
            return false;
        }


        function parseURL(url) {
            var parser = document.createElement('a'),
                searchObject = {},
                queries, split, i;
            // Let the browser do the work
            parser.href = url;
            // Convert query string to object
            queries = parser.search.replace(/^\?/, '').split('&');
            for (i = 0; i < queries.length; i++) {
                split = queries[i].split('=');
                searchObject[split[0]] = split[1];
            }
            return {
                protocol: parser.protocol,
                host: parser.host,
                hostname: parser.hostname,
                port: parser.port,
                pathname: parser.pathname,
                search: parser.search,
                searchObject: searchObject,
                hash: parser.hash
            };
        }
    }
}) ();