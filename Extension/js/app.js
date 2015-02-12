  /**
 * @author ChzMo
 */

(function() {
    var app = angular.module('histree', ['ui.tree', 'ui.bootstrap']);

    //app.config(["$provide",function($provide) {
    //    $provide.decorator("$log", function ($delegate, shadowLogger) {
    //        return shadowLogger($delegate);
    //    });
    //}]);
    //
    //app.factory("shadowLogger", function(){
    //
    //    return function($delegate){
    //
    //        return  {
    //
    //            log: function() {
    //                // dist version
    //            },
    //
    //            info: function(){},
    //
    //            error: function() {
    //                // dist version
    //            },
    //
    //            warn:function(){
    //                // dist version
    //            }
    //
    //        };
    //
    //    };
    //
    //});

    app.value('baseUrl', 'http://210.118.74.170:9000/');
    //app.value('baseUrl', 'http://121.135.191.219:9000/')
    app.value('projectName', 'Breadcrumb');

    app.factory('Com', ['$http', 'baseUrl', function ($http, baseUrl) {
        var token;
        var treeData = [];
        var mainCallback;

        var convertToServer = function (node) {
            if (!node._id || !node.title || !node.url) { // || !node.body  || !node.parent
                // dist version
                return undefined;
            }

            //waitHash[node._id] = node;

            var serverNode = {
                title: node.title,
                //link: node.linkText,
                url: node.url,
                body: node.body
            };

            if (node._id != node.parent)
                serverNode.parent = node.parent;

            return serverNode;
        };


        var convertToClient = function (sNode, node) {
            if (!node) {
                // dist version
                return undefined;
            }

            for (child in node.children) {
                child.parent = node._id;
            }



            node.title = sNode.title;
            node.url = sNode.url;
            if (!node.keyword)
                node.keyword = sNode.keyword ? sNode.keyword : ":block";

            return node;
        };


        var requestNodeId = function (node) {
            // Error process
            if (!node) {
                // dist version
                return undefined;
            }


            var reqConfig = {
                method: 'POST',
                url: baseUrl + 'api/histories',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            };
            var reqPromise = $http(reqConfig);


            reqPromise.success(function (data, status, headers, config) {
                if (status == 201) {
                    if (node._id == node.parent)
                        node.parent = data.data._id;
                    node._id = data.data._id;
                    //sendNode(node);
                }
                else {
                    // dist version
                    // dist version
                }
            });


            reqPromise.error(function (data, status, headers, config) {
                // dist version

                if (status == 404) {
                    // TODO: Error 404 Implement
                }
                else if (status == 422) {
                    // TODO: Error 422 Implement and Check code
                }
                else {
                    // dist version
                }

                // dist version
            });

            return node;
        };


        var sendNode = function (node) {
            // Error process
            var sNode = convertToServer(node);

            if (!sNode) {
                // dist version
                return undefined;
            }


            var reqConfig = {
                method: 'PUT',
                url: baseUrl + 'api/histories/' + node._id,
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                data: sNode
            };
            var reqPromise = $http(reqConfig);


            reqPromise.success(function (data, status, headers, config) {
                if (status == 201) {
                    var sNodeData = data.data;
                    convertToClient(sNodeData, node)




                    //// dist version
                    //// dist version
                }
                else {
                    // dist version
                    // dist version
                }
            });


            reqPromise.error(function (data, status, headers, config) {
                // dist version

                if (status == 404) {
                    // TODO: Error 404 Implement
                }
                else if (status == 422) {
                    // TODO: Error 422 Implement and Check code
                }
                else {
                    // dist version
                }

                // dist version
            });
        };


        var shiftNode = function (nodeId, pnodeId, index) {
            // Error process
            if (!nodeId) {
                // dist version
                return undefined;
            }

            var dataSet = {
                parent: pnodeId ? pnodeId : null,
                index: index ? index : null
            };


            var reqConfig = {
                method: 'PUT',
                url: baseUrl + 'api/histories/' + nodeId + '/shift',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                data: dataSet
            };
            var reqPromise = $http(reqConfig);


            reqPromise.success(function (data, status, headers, config) {
                if (status == 201) {
                    // dist version
                }
                else {
                    // dist version
                    // dist version
                }
            });


            reqPromise.error(function (data, status, headers, config) {
                // dist version

                if (status == 404) {
                    // TODO: Error 404 Implement
                }
                else if (status == 422) {
                    // TODO: Error 422 Implement and Check code
                }
                else {
                    // dist version
                }

                // dist version
            });
        };


        var deleteNode = function (nodeId) {
            // Error process
            var reqConfig = {
                method: 'DELETE',
                url: baseUrl + 'api/histories/' + nodeId,
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            };
            var reqPromise = $http(reqConfig);


            reqPromise.success(function (data, status, headers, config) {
                if (status == 201) {
                    // dist version
                    //// dist version
                }
                else {
                    // dist version
                    // dist version
                }
            });


            reqPromise.error(function (data, status, headers, config) {
                // dist version

                if (status == 404) {
                    // TODO: Error 404 Implement
                }
                else if (status == 422) {
                    // TODO: Error 422 Implement and Check code
                }
                else {
                    // dist version
                }

                // dist version
            });
        };


        var requestTree = function () {
            // Error process
            if (!token) {
                alert("There is no token.");
                // dist version
                return undefined;
            }


            var reqConfig = {
                method: 'GET',
                url: baseUrl + 'api/apps',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            };
            var reqPromise = $http(reqConfig);


            reqPromise.success(function (data, status, headers, config) {
                if (status == 200) {
                    var nodes = data.data.rootHistories;

                    function parseURL(url) {
                        var parser = document.createElement('a'),
                            searchObject = {},
                            queries, split, i;
                        // Let the browser do the work
                        parser.href = url;
                        // Convert query string to object
                        queries = parser.search.replace(/^\?/, '').split('&');
                        for( i = 0; i < queries.length; i++ ) {
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

                    function recursiveMark(Nodes) {
                        var i;
                        for (i = 0; i < Nodes.length; i++) {
                            Nodes[i].state = "history";
                            Nodes[i].favicon = "history.png";

                            var url = Nodes[i].url;
                            var result = parseURL(url);
                            if (result.hostname.match('search.naver.com')) {
                                var query = result.searchObject.query;
                                var queryWord = decodeURIComponent(query).replace(/\+/g, ' ');
                                Nodes[i].keyword = queryWord;
                            }

                            if(Nodes[i].children && Nodes[i].children.length > 0)
                                recursiveMark(Nodes[i].children);
                        }
                    }

                    recursiveMark(nodes);

                    var i;
                    for (i = 0; i < nodes.length; i++) {
                        treeData.push(nodes[i]);
                    }

                    console.log("Success connect to server!");

                    // TODO: Loading Finish 구현부
                }
                else {
                    // dist version
                    // dist version
                }

                mainCallback();
            });


            reqPromise.error(function (data, status, headers, config) {
                // dist version

                treeData = undefined;

                if (status == 404) {
                    // TODO: Error 404 Implement
                }
                else if (status == 422) {
                    // TODO: Error 422 Implement and Check code
                }
                else {
                    // dist version
                }

                // dist version

                mainCallback();
            });
        };



        return {
            treeData: treeData,

            setMainCallback: function (func) {
                mainCallback = func;
            },

            getTree: function () {
                return treeData;
            },

            clearTree: function () {
                angular.forEach(treeData, function (value, key) {
                    this[key] = undefined;
                }, treeData);
            },

            init: requestTree,

            getNodeId: requestNodeId,

            saveNode: sendNode,

            shiftNode: shiftNode,

            deleteNode: deleteNode,

            setToken: function(rtoken) {
                token = rtoken;
                requestTree();
            },

            clearToken: function() {
                token = undefined;
                chrome.storage.local.remove('token');
                location.reload(true);
            }
        };
    }])
        .controller('HistreeController',
        ['$scope', '$timeout', '$http', '$log', 'keys', 'Com', 'projectName', 'Blacklist', function ($scope, $timeout, $http, $log, keys, Com, projectName, Blacklist) {
            $scope.parameters = {
                dragEnabled: true,
                emptyPlaceholderEnabled: false,
                maxDepth: 10,
                dragDelay: 0,
                dragDistance: 5,
                lockX: false,
                lockY: false,
                boundTo: '',
                spacing: 20,
                coverage: 50,
                cancelKey: 'esc',
                enableExpandOnHover: true,
                expandOnHover: 500
            };


            //Node = {
            //    _id: "노드 ID",
            //    parent: "부모 노드 ID",
            //    tabId: "탭 ID",
            //    title: "페이지 제목",
            //    url: "페이지 주소",
            //    favicon: "페이지 파비콘",
            //    keyword: "키워드",
            //    state: "노드 상태 (history | start | loading | complete)",
            //    active: "탭 활성화 여부",
            //    children: ["자식 노드들"]
            //};


            //$scope.test = {
            //    remove: function () {
            //        // dist version
            //        return true;
            //    }
            //}





            $scope.mainCallback = function () {
                // 현재 탭을 생성하는 쿼리를 날리면 onCreated에서 자식으로 판정한다. (자식일 경우랑 구분이 불가능........)
                // 근데 좀 이상하긴 한데 아무튼 이상하다.
                // 일단 우선적인 문제는 새 탭 생성이 되어도 자식이 되버리는 멍청한 상황이 된다는 것이다.
                // 따라서 이를 해결하려면 먼저 create가 콜백이 더 빠른지를 측정해봐야할거 같다.
                // 그지같다.
                $scope.surf = function (scope) {
                    var target = scope.$nodeScope.$modelValue;

                    if (target.tabId && target.tabId != 0) {
                        chrome.tabs.update(target.tabId, {'active':true});
                    }
                    else {
                        chrome.tabs.create({'url': target.url, 'active': true});
                    }
                };

                $scope.list = Com.treeData;

                $scope.keys = keys;

                $scope.$callbacks = {
                    accept: function (test) {
                        return true;
                    },
                    dropped: function (event) {
                        // dist version
                        var srcNode = event.source.nodeScope.$modelValue;
                        var srcIndex = event.source.index;
                        var destNode = event.dest.nodesScope.$parent.$modelValue;
                        var destNodeId = destNode ? destNode._id : null;
                        var destIndex = event.dest.index;


                        if (srcIndex == destIndex && event.dest.nodesScope == event.source.nodesScope) {
                            //// dist version
                        }
                        else {
                            if (event.dest.nodesScope.$nodeScope) {
                                srcNode.parent = destNode._id;
                                // dist version
                            }
                            // go to root
                            else {
                                srcNode.parent = srcNode._id;
                                // dist version
                            }

                            //// dist version
                            //// dist version
                            //// dist version

                            // [Breadcrumb]
                            // dist version
                            Com.shiftNode(srcNode._id, destNodeId, destIndex);
                        }
                    }
                };


                $scope.removeNod = function (removeFunc, scope) {
                    // dist version
                    // dist version

                    var targetScope = scope.$nodeScope;
                    var targetNode = targetScope.$modelValue;
                    var targetChildren = targetScope.$childNodesScope.$modelValue;

                    // dist version
                    // dist version

                    // [Braedcrumb]
                    Com.deleteNode(targetNode._id);

                    function recursiveDelete(Nodes) {
                        var i;
                        for (i = 0; i < Nodes.length; i++) {
                            if(Nodes[i].children && Nodes[i].children.length > 0)
                                recursiveDelete(Nodes[i].children);

                            var target = findTab(Nodes[i].tabId);
                            if (target) {
                                $scope[target.hash][target.node.tabId] = undefined;
                                chrome.tabs.remove(Nodes[i].tabId);
                            }
                        }
                    }

                    recursiveDelete([targetNode]);

                    removeFunc();
                };


                $scope.toggle = function (scope) {
                    scope.toggle();
                };


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


                function searchStringInArray(str, strArray) {
                    for (var j = 0; j < strArray.length; j++) {
                        if (strArray[j].match(str)) return true;
                    }
                    return false;
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


                function pushToTree(newNode) {
                    //var targetElement = document.querySelector("[ng-id='" + newChildNode.parent +"']");

                    // dist version
                    if (newNode.parent == newNode._id) {
                        $scope.list.push(newNode);
                    }
                    else {
                        var targetNode = pickNodeAsEle(newNode.parent);

                        if (targetNode)
                            targetNode.children.push(newNode);

                    }

                    //if (newNode.active)
                    //    document.getElementById(newNode._id).scrollIntoView();
                }


                function popFromTree(removedNode) {
                    // dist version
                    var targetElement = document.getElementById(removedNode._id);
                    // dist version
                    if (targetElement) {
                        var targetScope = angular.element(targetElement).scope();
                        // dist version
                        var target = targetScope.$modelValue;
                        // dist version

                        var parentTarget = targetScope.$parentNodeScope.$modelValue;
                        // dist version

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

                function parseURL(url) {
                    var parser = document.createElement('a'),
                        searchObject = {},
                        queries, split, i;
                    // Let the browser do the work
                    parser.href = url;
                    // Convert query string to object
                    queries = parser.search.replace(/^\?/, '').split('&');
                    for( i = 0; i < queries.length; i++ ) {
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




                // [초기화 부분]
                // 탭 관리를 위한 Hash 선언
                $scope.total = {num: 0};


                $scope.replaceTabHash = {};
                $scope.newTabHash = {};
                $scope.newTabOpenerHash = {};
                $scope.tabChildHash = {};
                $scope.refreshBlogHash = {};
                $scope.newTabListHash ={};
                $scope.tabHash = {};
                $scope.directHash = {};

                // 현재 탭 가져오기
                chrome.tabs.query({}, function (tabArray) {
                    // dist version
                    // dist version
                    angular.forEach(tabArray, function (value, key) {
                        if (value.title != projectName && !value.url.match("chrome-devtools://")) {
                            var newNode = {
                                _id: addCount(),
                                parent: getCount(),
                                tabId: value.id,
                                title: value.title,
                                url: value.url,
                                favicon: value.favIconUrl ? value.favIconUrl : 'history.png',
                                //keyword: ,
                                state: 'complete',
                                active: value.active,
                                children: []
                            };


                            if (newNode.active)
                                $scope.curtab = newNode;

                            if (newNode.url == "chrome://newtab/")
                                $scope.newTabHash[newNode.tabId] = newNode;
                            else
                                $scope.tabHash[newNode.tabId] = newNode;


                            Com.getNodeId(newNode);

                            pushToTree(newNode);

                            // [Breadcrumb]
                            chrome.tabs.reload(value.id);
                            // dist version
                            // dist version
                        }
                    });

                    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                        $scope.$apply();
                    }
                });


                // 시작시 현재 탭 추적
                //chrome.tabs.getCurrent(function (tab) {
                //    // dist version
                //    // dist version
                //    $scope.curtab = $scope.tabHash[tab.id];
                //
                //    if ($scope.curtab) {
                //        $scope.curtab.active = true;
                //        document.getElementById($scope.curtab._id).scrollIntoView();
                //    }
                //    else {
                //        // dist version
                //        // dist version
                //        // dist version
                //    }
                //
                //    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                //        $scope.$apply();
                //    }
                //});


                // 탭 활성화된 부분 캐치하는 부분
                chrome.tabs.onActivated.addListener(function (activeInfo) {
                    // dist version
                    // dist version
                    chrome.tabs.get(activeInfo.tabId, function (tab) {
                        // dist version
                        // dist version

                        var target = findTab(tab.id);

                        if (target) {
                            if ($scope.curtab) {
                                // dist version
                                $scope.curtab.active = false;
                            }
                            else {
                                // dist version
                                // dist version
                            }

                            // dist version
                            // dist version
                            target.node.active = true;
                            $scope.curtab = target.node;
                            document.getElementById($scope.curtab._id).scrollIntoView();
                        }
                        else {
                            // dist version
                            // dist version

                            // // dist version
                        }

                        if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                            $scope.$apply();
                        }
                    });
                });


                // 탭 생성시 감지 부분
                chrome.tabs.onCreated.addListener(function (newTab) {
                    // dist version
                    // dist version
                    // 수동적으로 생성된 탭 생성 감지 부분
                    if (newTab.url == "chrome://newtab/") {
                        // dist version
                        var newNode = {
                            _id: addCount(),
                            parent: getCount(),
                            tabId: newTab.id,
                            title: newTab.title,
                            url: newTab.url,
                            favicon: newTab.favIconUrl ? newTab.favIconUrl : 'history.png',
                            //keyword: null,
                            state: 'start',
                            active: true,
                            children: []
                        };

                        $scope.newTabHash[newNode.tabId] = newNode;
                        Com.getNodeId(newNode);
                        pushToTree(newNode);
                    }
                    else if (newTab.url.indexOf('chrome-devtools') == 0) {
                        // No tracing
                    }
                    // openerTabId가 있으면 자식으로
                    // [경우의 수]
                    // 탭 복제,
                    else if (newTab.openerTabId) {
                        // dist version
                        var parentOfNewNode = findTab(newTab.openerTabId);

                        var newNode = {
                            _id: addCount(),
                            parent: parentOfNewNode.node._id,
                            tabId: newTab.id,
                            title: "[Loading...]",
                            url: newTab.url,
                            favicon: newTab.favIconUrl ? newTab.favIconUrl : 'history.png',
                            //keyword: null,
                            state: 'start',
                            active: false,
                            children: []
                        };

                        $scope.newTabOpenerHash[newNode.tabId] = newNode;
                        Com.getNodeId(newNode);
                        pushToTree(newNode);
                    }
                    else {
                        // dist version

                        var newNode = {
                            _id: addCount(),
                            parent: getCount(),
                            tabId: newTab.id,
                            title: "[Loading...]",
                            url: newTab.url,
                            favicon: newTab.favIconUrl ? newTab.favIconUrl : 'history.png',
                            //keyword: null,
                            state: 'start',
                            active: true,
                            children: []
                        };

                        $scope.newTabListHash[newNode.tabId] = newNode;
                        Com.getNodeId(newNode);
                        pushToTree(newNode);
                    }

                    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                        $scope.$apply();
                    }
                });


                // 탭 변화 감지부
                chrome.tabs.onUpdated.addListener(function (tabId, changes, tab) {
                    // dist version
                    // dist version
                    // dist version
                    // dist version

                    // 수동 새 탭의 경우
                    var value = $scope.newTabHash[tabId];
                    if (value) {
                        // dist version
                        // dist version
                        if (changes.status == "loading") {
                            // dist version
                            if (tab.title != tab.url || tab.title != '')
                                value.title = tab.title;
                            value.state = changes.status;
                            $scope.tabHash[tabId] = value;
                            $scope.newTabHash[tabId] = undefined; // debug
                        }
                        // 완료 부
                        else if (changes.status == "complete") {
                            // dist version
                            if (tab.title != tab.url || tab.title != '')
                                value.title = tab.title;
                            value.state = changes.status;

                            if (value.url != tab.url) {
                                value.url = tab.url;
                                $scope.tabHash[tabId] = value;
                                $scope.newTabHash[tabId] = undefined; // debug
                            }
                            if (tab.favIconUrl)
                                value.favicon = tab.favIconUrl;
                        }
                        if(changes.favIconUrl) {
                            value.favicon =  changes.favIconUrl ? changes.favIconUrl : 'history.png';
                        }
                    }

                    value = $scope.newTabOpenerHash[tabId];
                    if (value) {
                        // dist version
                        // dist version
                        //if (changes.status == "loading") {
                        // dist version
                        if (tab.title != tab.url || tab.title != '')
                            value.title = tab.title;
                        value.url = tab.url;
                        value.favicon = tab.favIconUrl ? tab.favIconUrl : value.favicon;
                        value.state = changes.status ? changes.status : value.state; // state가 loading이여도 후에 complete가 안일어나므로...
                        //}

                    }

                    value = $scope.tabChildHash[tabId];
                    if (value) {
                        // dist version
                        // dist version
                        //if (changes.status == "loading") {
                        // dist version
                        if (tab.title != tab.url || tab.title != '')
                            value.title = tab.title;
                        value.url = tab.url;
                        value.favicon = tab.favIconUrl ? tab.favIconUrl : value.favicon;
                        value.state = changes.status ? changes.status : value.state; // state가 loading이여도 후에 complete가 안일어나므로...
                        //}
                    }

                    // [방문기록]
                    // 리스트에서 히스토리를 누른 경우
                    value = $scope.newTabListHash[tabId];
                    if (value) {
                        // dist version
                        // dist version
                        //if (changes.status == "loading") {
                            // dist version
                            if (tab.title != tab.url || tab.title != '')
                                value.title = tab.title;
                            value.url = tab.url;
                            value.favicon = tab.favIconUrl ? tab.favIconUrl : value.favicon;
                            value.state = changes.status ? changes.status : value.state; // state가 loading이여도 후에 complete가 안일어나므로...
                        //}
                    }

                    value = $scope.tabHash[tabId];
                    if (value) {
                        // dist version
                        // dist version
                        if (changes.status == "loading") {
                            // dist version
                            if (tab.title != tab.url || tab.title != '') {
                                value.oldtitle = value.title;
                                value.title = tab.title;
                            }
                            value.oldurl = value.url;
                            value.url = tab.url;
                            value.state = changes.status;
                        }
                        // 어떤 탭이든 완료 경우
                        if (changes.status == "complete") {
                            // dist version
                            if (tab.title != tab.url || tab.title != '')
                                value.title = tab.title;
                            value.url = tab.url;
                            value.state = changes.status;
                            if (tab.favIconUrl)
                                value.favicon = tab.favIconUrl;
                        }
                        if(changes.favIconUrl) {
                            value.oldfavicon = value.favicon;
                            value.favicon = changes.favIconUrl;
                        }
                    }

                    value = $scope.directHash[tabId];
                    if (value) {
                        // dist version
                        // dist version
                        // 직접 접근한 경우 완료
                        if (changes.status == "complete") {
                            // dist version
                            if (tab.title != tab.url || tab.title != '')
                                value.title = tab.title;
                            value.url = tab.url;
                            value.state = changes.status;
                            if (tab.favIconUrl)
                                value.favicon = tab.favIconUrl;
                        }
                        if(changes.favIconUrl) {
                            value.oldfavicon = value.favicon;
                            value.favicon =  changes.favIconUrl ? changes.favIconUrl : 'history.png';
                        }

                        $scope.directHash[tabId] = undefined;
                    }


                    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                        $scope.$apply();
                    }
                });


                chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
                    // dist version
                    // dist version
                    // dist version

                    // 수동 새 탭 경우 Replaced부
                    var value = $scope.newTabHash[removedTabId];
                    if (value) {
                        // dist version
                        // dist version
                        var callback = function (tab) {
                            // dist version
                            // dist version
                            var value = $scope.newTabHash[removedTabId];
                            //var value = $scope.newTabHash[removedTabId];
                            //
                            //if (tab.title != tab.url || tab.title != '')
                            //    value.title = tab.title;
                            //value.url = tab.url;
                            //value.favicon = tab.favIconUrl ? tab.favIconUrl : 'history.png';
                            //value.tabId = tab.id;
                            //value.state = "replaced";
                            //$scope.tabHash[tab.id] = value;
                            //$scope.newTabHash[removedTabId] = undefined;


                            var replaceNode = $scope.replaceTabHash[tab.id];

                            if (tab.title != tab.url || tab.title != '')
                                replaceNode.title = tab.title;
                            replaceNode.url = tab.url;
                            replaceNode.favicon = tab.favIconUrl ? tab.favIconUrl : 'history.png';
                            //replaceNode.keyword = null;
                            replaceNode.state = 'complete';
                            replaceNode.active = true;
                            replaceNode.children = [];
                            $scope.newTabHash[value.tabId] = undefined;

                            $scope.curtab = replaceNode;
                            $scope.tabHash[replaceNode.tabId] = replaceNode;
                            $scope.replaceTabHash[replaceNode.tabId] = undefined;
                            //$scope.directHash[newNode.tabId] = newNode;
                            popFromTree(value);
                            value = undefined;
                            pushToTree(replaceNode);

                            if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                $scope.$apply();
                            }
                        };
                        chrome.tabs.get(addedTabId, callback);
                    }

                    // 대체되는 탭이 존재한다면 (by instant page)
                    value = $scope.tabHash[removedTabId];
                    if (value) {
                        // dist version
                        // dist version
                        var callback = function (tab) {
                            // dist version
                            // dist version

                            var value = $scope.tabHash[removedTabId];

                            // dist version

                            var replaceNode = $scope.replaceTabHash[tab.id];

                            // dist version

                            if (tab.title != tab.url || tab.title != '')
                                replaceNode.title = tab.title;
                            replaceNode.url = tab.url;
                            replaceNode.favicon = tab.favIconUrl ? tab.favIconUrl : 'history.png';
                            //replaceNode.keyword = null;
                            replaceNode.state = 'complete';
                            replaceNode.active = true;
                            replaceNode.children = [];

                            $scope.tabHash[value.tabId] = undefined;
                            value.state = "history";
                            value.tabId = 0; // 이전 탭 Id를 날린다.
                            value.active = false;
                            value.oldtitle = undefined;
                            value.oldfavicon = undefined;

                            $scope.curtab = replaceNode;
                            $scope.tabHash[replaceNode.tabId] = replaceNode;
                            $scope.replaceTabHash[replaceNode.tabId] = undefined;
                            //$scope.directHash[newNode.tabId] = newNode;
                            pushToTree(replaceNode);


                            //value.title = tab.title;
                            //value.url = tab.url;
                            //value.favicon = tab.favIconUrl ? tab.favIconUrl : 'history.png';
                            //value.tabId = tab.id;
                            //value.state = "replaced";

                            if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                $scope.$apply();
                            }
                        };
                        chrome.tabs.get(addedTabId, callback);
                    }
                });


                // 링크로 파생된 탭 시작 부
                chrome.webNavigation.onCreatedNavigationTarget.addListener(function (details) {
                    // dist version
                    // dist version
                    var value = $scope.tabHash[details.sourceTabId];
                    //if (value) {
                    //    // dist version
                    //    // dist version
                    //    var callback = function (tab) {
                    //        // dist version
                    //        // dist version
                    //
                    //        //var newNode = {
                    //        //    _id: addCount(),
                    //        //    parent: value._id,
                    //        //    tabId: tab.id,
                    //        //    title: "[Loading...]",
                    //        //    url: tab.url,
                    //        //    favicon: tab.favIconUrl ? tab.favIconUrl : 'history.png',
                    //        //    keyword: null,
                    //        //    state: 'start',
                    //        //    active: false,
                    //        //    children: []
                    //        //};
                    //
                    //        //var target = findTab(tab.id);
                    //        //
                    //        //target.node.parent = value._id;
                    //        //target.node.title = tab.title;
                    //        //target.node.url = tab.url;
                    //        //target.node.favicon = tab.favIconUrl ? tab.favIconUrl : 'history.png';
                    //        //
                    //        //popFromTree(target);
                    //        //pushToTree(target);
                    //
                    //        //pushToTree(newNode);
                    //        //$scope.tabHash[newNode.tabId] = newNode;
                    //
                    //        if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                    //            $scope.$apply();
                    //        }
                    //    };
                    //    chrome.tabs.get(details.tabId, callback);
                    //}

                    // Tab Opener로 생긴 애면
                    value = $scope.newTabOpenerHash[details.tabId];
                    if (value) {
                        // dist version

                        // 해쉬 재조정
                        $scope.tabChildHash[value.tabId] = value;
                        $scope.newTabOpenerHash[value.tabId] = undefined;
                    }
                });


                // 탭 변화 감지부
                chrome.webNavigation.onCommitted.addListener(function (details) {
                    // dist version
                    // dist version
                    var value = $scope.tabHash[details.tabId];
                    // dist version
                    if (!value) {
                        value = $scope.tabChildHash[details.tabId];
                        // dist version
                    }
                    if (value) {
                        // 파생 판정
                        if (details.transitionType == "link") {
                            // dist version
                            // dist version

                            var callback = function (tab) {
                                var node = findTab(tab.id);
                                var value = node.node;
                                // dist version
                                // dist version
                                // dist version
                                // dist version
                                // dist version
                                // onCreatedNavigationTarget으로 생성된 자식 탭 로딩 부
                                if (value.state == "start") {
                                    // dist version
                                    // dist version
                                    if (tab.title != tab.url || tab.title != '')
                                        value.title = tab.title;
                                    value.url = tab.url;
                                    value.favicon = tab.favIconUrl ? tab.favIconUrl : 'history.png';
                                    value.state = "loading";
                                }
                                // 제자리 depth
                                else if(!details.url.match('http://section.blog.naver.com/main/DirectoryPostList.nhn')
                                    && searchStringInArray("client_redirect", details.transitionQualifiers)) {
                                    // dist version
                                    // dist version
                                    if (tab.title != tab.url || tab.title != '')
                                        value.title = tab.title;
                                    value.url = tab.url;
                                    value.favicon = tab.favIconUrl ? tab.favIconUrl : 'history.png';
                                    value.state = "complete"; // state가 loading이여도 후에 complete가 안일어나므로...
                                }
                                else if (node.hash == 'refreshBlogHash') {
                                    // dist version
                                    // dist version
                                    if (tab.title != tab.url || tab.title != '')
                                        value.title = tab.title;
                                    value.url = tab.url;
                                    value.favicon = tab.favIconUrl ? tab.favIconUrl : 'history.png';
                                    value.state = "loading";

                                    $scope.refreshBlogHash[node.node.tabId] = undefined;
                                }
                                else if (node.hash != 'tabChildHash' && node.node.url != "chrome://newtab/") { // 이렇게 되면 자신의 파생된 탭을 기억하는 값이라서 구분이 안된다.
                                    // server_redirect 를 고려해야할듯
                                    // dist version
                                    // dist version

                                    var newNode = {
                                        _id: addCount(),
                                        parent: value.parent,
                                        tabId: tab.id,
                                        title: tab.title,
                                        url: tab.url,
                                        favicon: tab.favIconUrl ? tab.favIconUrl : 'history.png',
                                        //keyword: null,
                                        state: 'loading',
                                        active: value.active,
                                        children: []
                                    };

                                    value.title = value.oldtitle;
                                    value.url = value.oldurl;
                                    value.tabId = 0;
                                    value.state = 'history';
                                    value.active = false;
                                    value.favicon = value.oldfavicon ? value.oldfavicon : value.favicon;

                                    value.oldtitle = undefined;
                                    value.oldfavicon = undefined;

                                    if (value._id == value.parent) {
                                        newNode.parent = newNode._id;
                                    }

                                    $scope.curtab = newNode;
                                    Com.getNodeId(newNode);
                                    pushToTree(newNode);
                                    $scope.tabHash[newNode.tabId] = newNode;
                                }
                                else if (node.hash == 'tabChildHash') {// server_redirect 를 고려해야할듯
                                    // dist version
                                    // dist version

                                    $scope.tabHash[node.node.tabId] = node.node;
                                    $scope[node.hash][node.node.tabId] = undefined;
                                }

                                // dist version

                                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                    $scope.$apply();
                                }
                            };
                            chrome.tabs.get(details.tabId, callback);
                        }
                        else if (details.transitionType == "auto_subframe") {
                            // dist version
                            // 아이콘이 히스토리로 남는다. 따로 빼서 관리해야할듯.
                            if (details.url.match("http://blog.naver.com/PostView.nhn")) {
                                // dist version
                                $scope.refreshBlogHash[value.tabId] = value;
                                chrome.tabs.update(details.tabId, {'url': details.url});
                            }
                            //else if (details.url.match("http://blog.daum.net/_blog/BlogTypeView.do")) {
                            //    // dist version
                            //    $scope.refreshBlogHash[value.tabId] = value;
                            //    chrome.tabs.update(details.tabId, {'url': details.url});
                            //}

                            var tab = details;

                            if (tab.url == tab.title) {
                                value.title = tab.title;
                                value.url = tab.url;
                                value.favicon = tab.favIconUrl ? tab.favIconUrl : value.favicon;
                            }

                        }
                        else if (details.transitionType == "start_page") {
                            if (searchStringInArray("forward_back", details.transitionQualifiers)) {
                                // dist version
                                // dist version

                                var newNode = {
                                    _id: addCount(),
                                    parent: value.parent,
                                    tabId: tab.id,
                                    title: tab.title,
                                    url: tab.url,
                                    favicon: tab.favIconUrl ? tab.favIconUrl : 'history.png',
                                    //keyword: null,
                                    state: 'loading',
                                    active: value.active,
                                    children: []
                                };

                                value.title = value.oldtitle;
                                value.url = value.oldurl;
                                value.tabId = 0;
                                value.state = 'history';
                                value.active = false;
                                value.favicon = value.oldfavicon ? value.oldfavicon : value.favicon;

                                value.oldtitle = undefined;
                                value.oldfavicon = undefined;

                                if (value._id == value.parent) {
                                    newNode.parent = newNode._id;
                                }

                                $scope.curtab = newNode;
                                Com.getNodeId(newNode);
                                pushToTree(newNode);
                                $scope.tabHash[newNode.tabId] = newNode;
                            }
                        }
                        else if (details.transitionType == "form_submit") {
                            // dist version
                            var callback = function (tab) {
                                // dist version
                                // dist version
                                var value = $scope.tabHash[details.tabId];
                                var url = tab.url;
                                var result = parseURL(url);
                                // dist version
                                if (result.hostname.match('search.naver.com')) {
                                    var query = result.searchObject.query;
                                    var queryWord = decodeURIComponent(query).replace(/\+/g, ' ');
                                }

                                var newNode = {
                                    _id: addCount(),
                                    parent: value.parent,
                                    tabId: tab.id,
                                    title: tab.title,
                                    url: tab.url,
                                    favicon: tab.favIconUrl ? tab.favIconUrl : 'history.png',
                                    keyword: queryWord ? queryWord : null,
                                    state: 'loading',
                                    active: value.active,
                                    children: []
                                };

                                value.title = value.oldtitle;
                                value.url = value.oldurl;
                                value.tabId = 0;
                                value.state = 'history';
                                value.active = false;
                                value.favicon = value.oldfavicon ? value.oldfavicon : value.favicon;

                                value.oldtitle = undefined;
                                value.oldfavicon = undefined;

                                if (value._id == value.parent) {
                                    newNode.parent = newNode._id;
                                }

                                $scope.curtab = newNode;
                                Com.getNodeId(newNode);
                                pushToTree(newNode);
                                $scope.tabHash[newNode.tabId] = newNode;
                            }
                            chrome.tabs.get(details.tabId, callback);
                        }
                    }

                    value = $scope.newTabOpenerHash[details.tabId];
                    if (value) {
                        // dist version

                        if (details.transitionType == "reload") {
                            // dist version

                            var parentValue = pickNodeAsEle(value.parent);

                            // parent가 루트 노드이면
                            if (parentValue._id == parentValue.parent) {
                                value.parent = value._id;
                            }
                            // parent가 루트가 아니면
                            else {
                                value.parent = parentValue.parent;
                            }

                            // 위치 재조정
                            popFromTree(value);
                            pushToTree(value);

                            // 해쉬 재조정
                            $scope.newTabOpenerHash[value.tabId] = undefined;
                            $scope.tabHash[value.tabId] = value;
                        }
                    }

                    value = $scope.newTabListHash[details.tabId];
                    if (value) {
                        // dist version

                    }

                    if (details.transitionType == "auto_bookmark") {
                        var value = findTab(details.tabId);

                        if(value) {
                            if (value.hash == "newTabHash") {
                                $scope[value.hash][value.node.tabId] = undefined;
                                $scope.tabHash[value.node.tabId] = value.node;
                            }
                            else if (value.hash != "newTabListHash") {
                                // dist version
                                // dist version
                                var callback = function (tab) {
                                    var node = findTab(tab.id);
                                    var value = node.node;

                                    // dist version
                                    // dist version
                                    var newNode = {
                                        _id: addCount(),
                                        parent: getCount(),
                                        tabId: value.tabId,
                                        title: tab.title,
                                        url: tab.url,
                                        favicon: tab.favIconUrl ? tab.favIconUrl : 'history.png',
                                        //keyword: null,
                                        state: 'loading',
                                        active: true,
                                        children: []
                                    };

                                    value.state = "history";
                                    value.tabId = 0; // 이전 탭 Id를 날린다.
                                    value.title = value.oldtitle;
                                    value.url = value.oldurl;
                                    value.favicon = value.oldfavicon;
                                    value.active = false;

                                    value.oldtitle = undefined;
                                    value.oldfavicon = undefined;

                                    $scope.curtab = newNode;
                                    $scope.tabHash[newNode.tabId] = newNode;
                                    Com.getNodeId(newNode);
                                    pushToTree(newNode);

                                    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                        $scope.$apply();
                                    }
                                };
                                chrome.tabs.get(details.tabId, callback);
                            }
                            else {
                                value.node.active = false;
                                $scope[value.hash][value.node.tabId] = undefined;
                                $scope.tabHash[value.node.tabId] = value.node;
                            }
                        }
                    }

                    // 주소창으로 직접 접근하는 경우
                    if ((details.transitionType == "typed"
                        && searchStringInArray("from_address_bar", details.transitionQualifiers))
                        || details.transitionType == "keyword"
                        || details.transitionType == "generated") {

                        value = $scope.tabHash[details.tabId];
                        if (value) {
                            // dist version
                            // dist version
                            var callback = function (tab) {
                                var node = findTab(tab.id);
                                var value = node.node;

                                // dist version
                                // dist version
                                var newNode = {
                                    _id: addCount(),
                                    parent: getCount(),
                                    tabId: value.tabId,
                                    title: tab.title,
                                    url: tab.url,
                                    favicon: tab.favIconUrl ? tab.favIconUrl : 'history.png',
                                    //keyword: null,
                                    state: 'loading',
                                    active: true,
                                    children: []
                                };

                                value.state = "history";
                                value.tabId = 0; // 이전 탭 Id를 날린다.
                                value.title = value.oldtitle;
                                value.url = value.oldurl;
                                value.favicon = value.oldfavicon;
                                value.active = false;

                                value.oldtitle = undefined;
                                value.oldfavicon = undefined;

                                $scope.curtab = newNode;
                                $scope.tabHash[newNode.tabId] = newNode;
                                $scope.directHash[newNode.tabId] = newNode;
                                Com.getNodeId(newNode);
                                pushToTree(newNode);

                                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                    $scope.$apply();
                                }
                            };
                            chrome.tabs.get(details.tabId, callback);
                        }
                        else {
                            // dist version
                            // dist version
                            var callback = function (tab) {
                                // dist version

                                // Instant로 인해 prerendering이 된다면 탭을 가져올 수 없다. 나중에 Replace에서 처리해야함
                                var newNode = {
                                    _id: addCount(),
                                    parent: getCount(),
                                    tabId: details.tabId
                                };

                                Com.getNodeId(newNode);

                                // dist version

                                $scope.replaceTabHash[newNode.tabId] = newNode;
                                //$scope.directHash[newNode.tabId] = newNode;
                                //pushToTree(newNode);

                                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                    $scope.$apply();
                                }
                            };
                            chrome.tabs.get(details.tabId, callback);
                        }
                    }
                });


                // 탭 닫힘 구현
                chrome.tabs.onRemoved.addListener(function (tabId) {
                    // dist version
                    // dist version
                    var target = findTab(tabId);
                    // dist version

                    if (target) {
                        if (target.hash == "newTabHash") {
                            // dist version
                            // dist version
                            $scope.newTabHash[tabId] = undefined;
                            popFromTree(target.node);
                            target.node = undefined;
                        }
                        else if (target.node.state == "start") {
                            // dist version
                            // dist version
                            $scope[target.hash][tabId] = undefined;
                            popFromTree(target.node);
                            target.node = undefined;
                        }
                        else {
                            // dist version
                            // dist version
                            target.node.state = "history";
                            target.node.active = false;
                            target.node.tabId = 0;
                            $scope[target.hash][tabId] = undefined;
                        }
                    }
                    else {
                        // dist version
                        // dist version
                    }

                    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                        $scope.$apply();
                    }
                });


                // 페이지 소스 받는 부분
                chrome.runtime.onMessage.addListener(
                    function(request, sender, sendResponse) {
                        // dist version
                        // dist version
                        // dist version

                        var checkBlacklist = function (url) {
                            var blacklist = Blacklist.getBlacklist();

                            // dist version

                            for (var i = 0; i < blacklist.length; i++) {
                                var words = blacklist[i].split('*');
                                // dist version
                                var j = 0;

                                for (var j = 0; j < words.length; j++) {
                                    // dist version
                                    if (!url.match(words[j])) {
                                        // dist version
                                        break;
                                    }
                                }

                                if (j == words.length) {
                                    // dist version
                                    break;
                                }
                            }

                            if (i == blacklist.length) {
                                // [Breadcrumb]
                                saveBodyToNode(false);
                            }
                            else {
                                saveBodyToNode(true);
                            }
                        };

                        var saveBodyToNode = function (block) {
                            // dist version
                            //// dist version
                            // dist version

                            $scope.$apply(function () {
                                var target = findTab(sender.tab.id);

                                if (target) {
                                    // dist version
                                    // dist version

                                    var url = target.node.url;
                                    var result = parseURL(url);
                                    // dist version
                                    if (result.hostname.match('search.naver.com')) {
                                        var query = result.searchObject.query;
                                        var queryWord = decodeURIComponent(query).replace(/\+/g, ' ');
                                        target.node.keyword = queryWord;
                                    }
                                    else if (target.node.url.match('https://www.google.co.kr/_/chrome/newtab')) {
                                        target.node.keyword = ':block';
                                    }

                                    if (block) {
                                        target.node.keyword = ":block";
                                        target.node.body = undefined;
                                    }

                                    // dist version
                                    if (!target.node.keyword) {
                                        // dist version
                                        target.node.body = request.data;
                                    }
                                    else
                                        // dist version

                                    var value = target.node;
                                    var tab = sender.tab;

                                    if (tab.title != tab.url || tab.title != '')
                                        value.title = tab.title;
                                    value.url = tab.url;
                                    value.favicon = tab.favIconUrl ? tab.favIconUrl : 'history.png'
                                    value.state = "complete"; // state가 loading이여도 후에 complete가 안일어나므로...


                                    // Server to save in
                                    Com.saveNode(target.node);
                                }
                                else {
                                    // dist version
                                    // dist version
                                }
                            });

                            sendResponse({message: "I've finished to receive your data."});
                        }

                        if (request.data && sender.tab) {
                            // [Breadcrumb]
                            checkBlacklist(sender.tab.url);
                        }
                    }
                );
            };

            // Local Init
            // [Breadcrumb]
            //$scope.mainCallback();
            Com.setMainCallback($scope.mainCallback);
        }]);



    // Login modal

    app.value('defaultBlacklist', ['http://*bank*, http://*privacy*, http://*account*, http://*my*page*']);

    app.factory('Blacklist', ['defaultBlacklist', function (defaultBlacklist) {
        var blacklist;
        chrome.storage.local.get('blacklist', function (items) {
            blacklist = defaultBlacklist.slice(0);
            if (items.blacklist) {
                blacklist = items.blacklist;
                // dist version
            }
            else {
                // default blackslist
            }
        });

        var stringfy = function (arr) {
            var stringSet = arr.join(', ');
            return stringSet;
        };


        var arrayfy = function (str) {
            var arraySet = str.split(',');
            angular.forEach(arraySet, function(value, key) {
                this[key] = this[key].trim();
            }, arraySet);

            return arraySet;
        };

        return {
            getBlacklist: function () {
                return blacklist;
            },

            setBlacklist: function (str) {
                blacklist = arrayfy(str);
                chrome.storage.local.set({'blacklist': blacklist});
                // dist version
            },

            getBlacklistByString: function () {
                return stringfy(blacklist);
            },

            stringfy: stringfy,

            arrayfy: arrayfy
        };
    }]);


    app.controller('LoginController', ['$scope', '$modal', '$http', '$log', 'Com', 'Blacklist', 'baseUrl', function ($scope, $modal, $http, $log, Com, Blacklist, baseUrl) {
        $scope.Logout = function () {
            Com.clearToken();
        };

        $scope.showSignForm = function () {
            $scope.message = "Show Form Button Clicked";
            // dist version

            var modalInstance = $modal.open({
                templateUrl: '../sign-form.html',
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
                // dist version
            });
        };


        $scope.showLoginForm = function () {
            $scope.message = "Show Form Button Clicked";
            // dist version

            var modalInstance = $modal.open({
                templateUrl: '../login-form.html',
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
                // dist version
            });
        }


        $scope.showOptionForm = function () {
            $scope.message = "Show Form Button Clicked";
            // dist version

            var modalInstance = $modal.open({
                templateUrl: '../option-form.html',
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
                // dist version
            });
        };


        var initService = function (items) {
            // [Breadcrumb]
            //return;
            if(items.token) {
                // dist version
                // dist version
                Com.setToken(items.token);
            }
            else {
                // dist version
                $scope.showLoginForm();
            }
        };

        chrome.storage.local.get('token', initService);
    }]);

    var SignModalInstanceCtrl = function ($scope, $modalInstance, Com, signForm, $http, baseUrl) {
        $scope.btnLabel = "OK";
        $scope.form = {};
        $scope.signSubmitForm = function () {
            // dist version

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
                        // dist version
                        // dist version
                    }
                    else {
                        // dist version
                        // dist version
                    }

                    $scope.btnLabel = "OK";

                    alert("Success to sign up! Please Login!")
                    $modalInstance.close('closed');
                });


                reqPromise.error(function (data, status, headers, config) {
                    // dist version

                    if (status == 404) {
                        // TODO: Error 404 Implement
                    }
                    else if (status == 422) {
                        alert(data.message);
                    }
                    else {
                        alert('to sign up account to server unknown error : ' + status);
                    }

                    // dist version

                    $scope.btnLabel = "OK";
                });
            } else {
                // dist version
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
                        // dist version
                        // dist version
                    }
                });


                reqPromise.error(function (data, status, headers, config) {
                    // dist version
                    // dist version
                    if (status == 401 || status == 403) {
                        alert(data.message);
                    }
                    else {
                        alert('to login account to server unknown error : ' + status);
                    }

                    // dist version
                });
            } else {
                // dist version
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
})();
