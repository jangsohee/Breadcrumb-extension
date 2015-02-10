  /**
 * @author ChzMo
 */

(function() {
    var app = angular.module('histree', ['ui.tree', 'ui.bootstrap']);

    app.value('baseUrl', 'http://210.118.74.170:9000/');
    //app.value('baseUrl', 'http://121.135.191.219:9000/')
    app.value('projectName', 'Breadcrumb');

    app.factory('Com', ['$http', 'baseUrl', function ($http, baseUrl) {
        var token;
        var treeData = [];
        var mainCallback;

        var convertToServer = function (node) {
            if (!node._id || !node.title || !node.url) { // || !node.body  || !node.parent
                alert("to convert node server form error");
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
                alert("source node is empty.");
                return undefined;
            }

            for (child in node.children) {
                child.parent = node._id;
            }

            if (sNode.parent && node.parent != sNode.parent)
                alert("not match source and sNode!!");

            node.title = sNode.title;
            node.url = sNode.url;

            return node;
        };


        var requestNodeId = function (node) {
            // Error process
            if (!node) {
                alert("to request node id to server error");
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
                    sendNode(node);
                }
                else {
                    alert('to get node Id from server success but unknown behavior.');
                    console.log(JSON.stringify(data));
                }
            });


            reqPromise.error(function (data, status, headers, config) {
                alert('to get node Id from server error :' + status);

                if (status == 404) {
                    // TODO: Error 404 Implement
                }
                else if (status == 422) {
                    // TODO: Error 422 Implement and Check code
                }
                else {
                    alert('to get node Id from server unknown error : ' + status);
                }

                console.log(JSON.stringify(data));
            });

            return node;
        };


        var sendNode = function (node) {
            // Error process
            var sNode = convertToServer(node);

            if (!sNode) {
                alert("to send node data to server error");
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
                    if(!convertToClient(sNodeData, node))
                        alert("to convert to client node error.");

                    //console.log("success to save into server");
                    //console.log(data);
                }
                else {
                    alert('to get Tree data success but unknown behavior.');
                    console.log(JSON.stringify(data));
                }
            });


            reqPromise.error(function (data, status, headers, config) {
                alert('to send Node data error :' + status);

                if (status == 404) {
                    // TODO: Error 404 Implement
                }
                else if (status == 422) {
                    // TODO: Error 422 Implement and Check code
                }
                else {
                    alert('to send Node data unknown error : ' + status);
                }

                console.log(JSON.stringify(data));
            });
        };


        var shiftNode = function (nodeId, pnodeId, index) {
            // Error process
            if (!nodeId) {
                alert("to shift node data to server error");
                return undefined;
            }

            var dataSet = {
                parent: pnodeId ? pnodeId : undefined,
                index: index ? index : undefined
            };


            var reqConfig = {
                method: 'PUT',
                url: baseUrl + 'api/histories/' + nodeId._id + '/shift',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                data: dataSet
            };
            var reqPromise = $http(reqConfig);


            reqPromise.success(function (data, status, headers, config) {
                if (status == 201) {
                    console.log("Success shift");
                }
                else {
                    alert('to shift node data success but unknown behavior.');
                    console.log(JSON.stringify(data));
                }
            });


            reqPromise.error(function (data, status, headers, config) {
                alert('to shift node data error :' + status);

                if (status == 404) {
                    // TODO: Error 404 Implement
                }
                else if (status == 422) {
                    // TODO: Error 422 Implement and Check code
                }
                else {
                    alert('to shift node data unknown error : ' + status);
                }

                console.log(JSON.stringify(data));
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
                    console.log("success to delete into server");
                    //console.log(data);
                }
                else {
                    alert('to get Tree data success but unknown behavior.');
                    console.log(JSON.stringify(data));
                }
            });


            reqPromise.error(function (data, status, headers, config) {
                alert('to delete Node data error :' + status);

                if (status == 404) {
                    // TODO: Error 404 Implement
                }
                else if (status == 422) {
                    // TODO: Error 422 Implement and Check code
                }
                else {
                    alert('to delete Node data unknown error : ' + status);
                }

                console.log(JSON.stringify(data));
            });
        };


        var requestTree = function () {
            // Error process
            if (!token) {
                alert("There is no token.");
                console.log(token);
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

                    function recursiveInput(Nodes) {
                        var i;
                        for (i = 0; i < Nodes.length; i++) {
                            Nodes[i].state = "history";
                            Nodes[i].favicon = "history.png";

                            if(Nodes[i].children && Nodes[i].children.length > 0)
                                recursiveInput(Nodes[i].children);

                            treeData.push(Nodes[i]);
                        }
                    }

                    recursiveInput(nodes);

                    alert("Success connect to server!");

                    // TODO: Loading Finish 구현부
                }
                else {
                    alert('to get Tree data success but unknown behavior.');
                    console.log(JSON.stringify(data));
                }

                mainCallback();
            });


            reqPromise.error(function (data, status, headers, config) {
                alert('to get Tree data error :' + status);

                treeData = undefined;

                if (status == 404) {
                    // TODO: Error 404 Implement
                }
                else if (status == 422) {
                    // TODO: Error 422 Implement and Check code
                }
                else {
                    alert('to get Tree data unknown error : ' + status);
                }

                console.log(JSON.stringify(data));

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

            saveNode: requestNodeId,

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
                dragDistance: 0,
                lockX: false,
                lockY: false,
                boundTo: '',
                spacing: 20,
                coverage: 50,
                cancelKey: 'esc',
                //copyKey: 'shift',
                //selectKey: 'ctrl',
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



            // Local Init
            // $scope.mainCallback();

            $scope.test = {
                remove: function () {
                    console.log("test");
                    return true;
                }
            }

            $scope.mainCallback = function () {

                $scope.list = Com.treeData;

                $scope.keys = keys;

                $scope.callbacks = {
                    remove: function (node) {
                        function recursiveDelete(Nodes) {
                            var i;
                            for (i = 0; i < Nodes.length; i++) {
                                console.log("in delete routine");
                                if(Nodes[i].children && Nodes[i].children.length > 0)
                                    recursiveDelete(Nodes[i].children);

                                var target = findTab(Nodes[i].tabId);

                                $scope[target.hash][target.node.tabId] = undefined;
                            }
                        }

                        recursiveDelete(node);
                        console.log("in delete routine");
                        Com.deleteNode(node._id);

                        return true;
                    }
                };

                //$scope.remove = function (scope) {
                //
                //    scope.remove();
                //};

                $scope.toggle = function (scope) {
                    scope.toggle();
                };

                $scope.newSubItem = function (scope) {
                    var nodeData = scope.$modelValue;
                    nodeData.children.push({
                        _id: nodeData._id * 10 + nodeData.children.length,
                        title: nodeData.title + '.' + (nodeData.children.length + 1),
                        children: []
                    });
                };

                // [서비스로 분리 부분]
                function findTab(tabId) {
                    var newTab = $scope.newTabHash[tabId];
                    var tab = $scope.tabHash[tabId];
                    var directTab = $scope.directHash[tabId];
                    var replaceTab = $scope.replaceTabHash[tabId];

                    if (newTab) {
                        return {
                            hash: 'newTabHash',
                            node: newTab
                        }
                    }
                    else if (tab) {
                        return {
                            hash: 'tabHash',
                            node: tab
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

                    $log.debug("APPEND NODE TO LIST!!!!!!!!!!!!!!!!!!!!!!");
                    if (newNode.parent == newNode._id) {
                        $scope.list.push(newNode);
                    }
                    else {
                        var targetNode = pickNodeAsEle(newNode.parent);

                        if (targetNode)
                            targetNode.children.push(newNode);
                        else
                            alert("to push node into tree error");
                    }
                }


                function popFromTree(removedNode) {
                    var targetElement = document.getElementById(removedNode._id);
                    if (targetElement) {
                        var targetScope = angular.element(targetElement).scope();
                        var target = targetScope.$modelValue;
                        var position = $.inArray(target, $scope.list);
                        if (~position) $scope.list.splice(position, 1);
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


                // [초기화 부분]
                // 탭 관리를 위한 Hash 선언
                $scope.total = {num: 0};


                $scope.replaceTabHash = {};
                $scope.newTabHash = {};
                $scope.tabHash = {};
                $scope.directHash = {};

                // 현재 탭 가져오기
                chrome.tabs.query({}, function (tabArray) {
                    $log.log("Enter the chrome.tabs.query for getting Current Tab [tabArray]");
                    $log.info(tabArray);
                    angular.forEach(tabArray, function (value, key) {
                        if (value.title != projectName) {
                            var newNode = {
                                _id: addCount(),
                                parent: getCount(),
                                tabId: value.id,
                                title: value.title,
                                url: value.url,
                                favicon: value.favIconUrl ? value.favIconUrl : 'history.png',
                                keyword: null,
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

                            pushToTree(newNode);

                            chrome.tabs.reload(value.id);
                        }
                    });

                    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                        $scope.$apply();
                    }
                });


                // 시작시 현재 탭 추적
                //chrome.tabs.getCurrent(function (tab) {
                //    $log.log("Enter the chrome.tabs.getCurrent for tracing Current Tab on startup [tab]");
                //    $log.info(tab);
                //    $scope.curtab = $scope.tabHash[tab.id];
                //
                //    if ($scope.curtab) {
                //        $scope.curtab.active = true;
                //        document.getElementById($scope.curtab._id).scrollIntoView();
                //    }
                //    else {
                //        $log.error("Error to trace Current Tab on startup [tabHash / curtab]");
                //        $log.info($scope.tabHash);
                //        $log.info($scope.curtab);
                //    }
                //
                //    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                //        $scope.$apply();
                //    }
                //});


                // 탭 활성화된 부분 캐치하는 부분
                chrome.tabs.onActivated.addListener(function (activeInfo) {
                    $log.log("Fired the chrome.tabs.onActivated for tracing Current Tab [activeInfo]");
                    $log.info(activeInfo);
                    chrome.tabs.get(activeInfo.tabId, function (tab) {
                        $log.log("request to the chrome.tabs.get for tracing Current Tab [tab]");
                        $log.info(tab);

                        var target = findTab(tab.id);

                        if (target) {
                            if ($scope.curtab) {
                                $log.log("There is past curtab. Set the state to inactive.");
                                $scope.curtab.active = false;
                            }
                            else {
                                $log.warn("Past curtab is empty. [curtab]");
                                $log.info($scope.curtab);
                            }

                            $log.log("Set the new curtab's state active and Change curtab [target]");
                            $log.info(target);
                            target.node.active = true;
                            $scope.curtab = target.node;
                            document.getElementById($scope.curtab._id).scrollIntoView();
                        }
                        else {
                            $log.error("Error to trace Current Tab [target]");
                            $log.info(target);

                            // console.log("onActivated is fired. but undefined target... tabId : " + tab.id);
                        }

                        if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                            $scope.$apply();
                        }
                    });
                });


                // 탭 생성시 감지 부분
                chrome.tabs.onCreated.addListener(function (newTab) {
                    $log.log("Fired the chrome.tabs.onCreated for tracing New Tab [newTab]");
                    $log.info(newTab);
                    // 수동적으로 생성된 탭 생성 감지 부분
                    if (newTab.url == "chrome://newtab/") {
                        $log.log("It's chrome://newtab/");
                        var newNode = {
                            _id: addCount(),
                            parent: getCount(),
                            tabId: newTab.id,
                            title: newTab.title,
                            url: newTab.url,
                            favicon: newTab.favIconUrl ? newTab.favIconUrl : 'history.png',
                            keyword: null,
                            state: 'start',
                            active: true,
                            children: []
                        };

                        $scope.newTabHash[newNode.tabId] = newNode;
                        pushToTree(newNode);
                    }
                    else if (newTab.url.indexOf('chrome-devtools') == 0) {
                        // No tracing
                    }
                    // 다른 경우는 모두 자식으로
                    else {
                            $log.log("It's new children in onCreated");
                            var parentOfNewNode = findTab(newTab.openerTabId);

                            var newNode = {
                                _id: addCount(),
                                parent: parentOfNewNode.node._id,
                                tabId: newTab.id,
                                title: "[Loading...]",
                                url: newTab.url,
                                favicon: newTab.favIconUrl ? newTab.favIconUrl : 'history.png',
                                keyword: null,
                                state: 'start',
                                active: false,
                                children: []
                            };

                            $scope.tabHash[newNode.tabId] = newNode;
                            pushToTree(newNode);
                    }

                    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                        $scope.$apply();
                    }
                });


                // 탭 변화 감지부
                chrome.tabs.onUpdated.addListener(function (tabId, changes, tab) {
                    $log.log("Fired the chrome.tabs.onUpdated for detecting changing tab [tabId, changes, tab]");
                    $log.info(tabId);
                    $log.info(changes);
                    $log.info(tab);

                    // 수동 새 탭의 경우
                    var value = $scope.newTabHash[tabId];
                    if (value) {
                        $log.log("It's Manual New Tab. [value]");
                        $log.info(value);
                        if (changes.status == "loading") {
                            $log.log("And it's loading tab...");
                            value.title = tab.title;
                            value.state = changes.status;
                            $scope.tabHash[tabId] = value;
                            $scope.newTabHash[tabId] = undefined; // debug
                        }
                        // 완료 부
                        else if (changes.status == "complete") {
                            $log.log("And it's complete!");
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

                    value = $scope.tabHash[tabId];
                    if (value) {
                        $log.log("It's any Tab in tabHash. [value]");
                        $log.info(value);
                        if (changes.status == "loading") {
                            $log.log("And it's loading tab...");
                            value.oldtitle = value.title;
                            value.title = tab.title;
                            value.url = tab.url;
                            value.state = changes.status;
                        }
                        // 어떤 탭이든 완료 경우
                        if (changes.status == "complete") {
                            $log.log("And it's complete!");
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
                        $log.log("It's direct Tab. [value]");
                        $log.info(value);
                        // 직접 접근한 경우 완료
                        if (changes.status == "complete") {
                            $log.log("And it's complete!");
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
                    $log.log("Fired the chrome.tabs.onReplaced for detecting replaced tab [addedTabId, removedTabId]");
                    $log.info(addedTabId);
                    $log.info(removedTabId);

                    // 수동 새 탭 경우 Replaced부
                    var value = $scope.newTabHash[removedTabId];
                    if (value) {
                        $log.log("It's Replaced New Tab. [value]");
                        $log.info(value);
                        var callback = function (tab) {
                            $log.log("It's Replaced New Tab of CALLBACK. [tab]");
                            $log.info(tab);
                            var value = $scope.newTabHash[removedTabId];

                            value.title = tab.title;
                            value.url = tab.url;
                            value.favicon = tab.favIconUrl ? tab.favIconUrl : 'history.png';
                            value.tabId = tab.id;
                            value.state = "replaced";
                            $scope.tabHash[tab.id] = value;
                            $scope.newTabHash[removedTabId] = undefined;

                            if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                $scope.$apply();
                            }
                        };
                        chrome.tabs.get(addedTabId, callback);
                    }

                    // 대체되는 탭이 존재한다면 (by instant page)
                    value = $scope.tabHash[removedTabId];
                    if (value) {
                        $log.log("It's Replaced by instant page not new Tab. [value]");
                        $log.info(value);
                        var callback = function (tab) {
                            $log.log("It's Replaced by instant page of CALLBACK not new Tab. [tab]");
                            $log.info(tab);

                            var replaceNode = $scope.replaceTabHash[tab.tabId];

                            replaceNode.title = tab.title;
                            replaceNode.url = tab.url;
                            replaceNode.favicon = tab.favIconUrl ? tab.favIconUrl : 'history.png';
                            replaceNode.keyword = null;
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
                    $log.log("Fired the chrome.webNavigation.onCreatedNavigationTarget for detecting link tab [details]");
                    $log.info(details);
                    var value = $scope.tabHash[details.sourceTabId];
                    if (value) {
                        $log.log("It's clearly linked tab. [value]");
                        $log.info(value);
                        var callback = function (tab) {
                            $log.log("It's clearly linked tab of CALLBACK. [tab]");
                            $log.info(tab);
                            //var newNode = {
                            //    _id: addCount(),
                            //    parent: value._id,
                            //    tabId: tab.id,
                            //    title: "[Loading...]",
                            //    url: tab.url,
                            //    favicon: tab.favIconUrl ? tab.favIconUrl : 'history.png',
                            //    keyword: null,
                            //    state: 'start',
                            //    active: false,
                            //    children: []
                            //};

                            //var target = findTab(tab.id);
                            //
                            //target.node.parent = value._id;
                            //target.node.title = tab.title;
                            //target.node.url = tab.url;
                            //target.node.favicon = tab.favIconUrl ? tab.favIconUrl : 'history.png';
                            //
                            //popFromTree(target);
                            //pushToTree(target);

                            //pushToTree(newNode);
                            //$scope.tabHash[newNode.tabId] = newNode;

                            if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                $scope.$apply();
                            }
                        };
                        chrome.tabs.get(details.tabId, callback);
                    }
                });


                // 탭 변화 감지부
                chrome.webNavigation.onCommitted.addListener(function (details) {
                    $log.log("Fired the chrome.webNavigation.onCommitted for detecting changing tab [details]");
                    $log.info(details);
                    var value = $scope.tabHash[details.tabId];
                    if (value) {
                        // 파생 판정
                        if (details.transitionType == "link") {
                            $log.log("It's linked tab. [value]");
                            $log.info(value);

                            //if(!(value.state == "start"
                            //    || searchStringInArray("client_redirect", details.transitionQualifiers))) {
                            //    $log.debug("Delete the tab in tabHash. [details]");
                            //    $log.info(details);
                            //    $scope.tabHash[details.tabId] = undefined;
                            //}

                            var callback = function (tab) {
                                $log.log("It's linked tab of CALLBACK. [tab]");
                                $log.info(tab);
                                // onCreatedNavigationTarget으로 생성된 자식 탭 로딩 부
                                if (value.state == "start") {
                                    $log.log("It's clearly linked tab's START in CALLBACK. [value]");
                                    $log.info(value);
                                    value.title = tab.title;
                                    value.url = tab.url;
                                    value.favicon = tab.favIconUrl ? tab.favIconUrl : 'history.png';
                                    value.state = "loading";
                                }
                                // 제자리 depth
                                else if(searchStringInArray("client_redirect", details.transitionQualifiers)) {
                                    $log.log("It's autoself refresh linked tab in CALLBACK. [value]");
                                    $log.info(value);
                                    value.title = tab.title;
                                    value.url = tab.url;
                                    value.favicon = tab.favIconUrl ? tab.favIconUrl : 'history.png';
                                    value.state = "complete"; // state가 loading이여도 후에 complete가 안일어나므로...
                                }
                                else if (!tab.openerTabId) { // 이렇게 되면 자신의 파생된 탭을 기억하는 값이라서 구분이 안된다.
                                    // server_redirect 를 고려해야할듯
                                    $log.log("It's self linked tab's OLA&NEW in CALLBACK. [value]");
                                    $log.info(value);
                                    var newNode = {
                                        _id: addCount(),
                                        parent: value.parent,
                                        tabId: tab.id,
                                        title: tab.title,
                                        url: tab.url,
                                        favicon: tab.favIconUrl ? tab.favIconUrl : 'history.png',
                                        keyword: null,
                                        state: 'start',
                                        active: value.active,
                                        children: []
                                    };

                                    value.title = value.oldtitle;
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
                                    pushToTree(newNode);
                                    $scope.tabHash[newNode.tabId] = newNode;
                                }

                                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                    $scope.$apply();
                                }
                            };
                            chrome.tabs.get(details.tabId, callback);
                        }
                    }
                    // 주소창으로 직접 접근하는 경우
                    if ((details.transitionType == "typed"
                        && searchStringInArray("from_address_bar", details.transitionQualifiers))
                        || details.transitionType == "keyword"
                        || details.transitionType == "generated") {

                        value = $scope.tabHash[details.tabId];
                        if (value) {
                            $log.log("It's direct tab of OLD&NEW in CALLBACK. [value]");
                            $log.info(value);
                            var callback = function (tab) {
                                $log.log("It's direct tab of OLD&NEW of CALLBACK in CALLBACK. [tab]");
                                $log.info(tab);
                                var newNode = {
                                    _id: addCount(),
                                    parent: getCount(),
                                    tabId: value.tabId,
                                    title: tab.title,
                                    url: tab.url,
                                    favicon: tab.favIconUrl ? tab.favIconUrl : 'history.png',
                                    keyword: null,
                                    state: 'loading',
                                    active: true,
                                    children: []
                                };

                                value.state = "history";
                                value.tabId = 0; // 이전 탭 Id를 날린다.
                                value.title = value.oldtitle;
                                value.favicon = value.oldfavicon;
                                value.active = false;

                                value.oldtitle = undefined;
                                value.oldfavicon = undefined;

                                $scope.curtab = newNode;
                                $scope.tabHash[newNode.tabId] = newNode;
                                $scope.directHash[newNode.tabId] = newNode;
                                pushToTree(newNode);

                                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                    $scope.$apply();
                                }
                            };
                            chrome.tabs.get(details.tabId, callback);
                        }
                        else {
                            $log.log("It's direct tab of OLD&NEW by instant page in CALLBACK. [value]");
                            $log.info(value);
                            var callback = function (tab) {
                                $log.log("It's direct tab of OLD&NEW of CALLBACK by instant page in CALLBACK. [newNode]");

                                // Instant로 인해 prerendering이 된다면 탭을 가져올 수 없다. 나중에 Replace에서 처리해야함
                                var newNode = {
                                    _id: addCount(),
                                    parent: getCount(),
                                    tabId: details.tabId
                                };

                                $log.info(newNode);

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
                    $log.log("Fired the chrome.tabs.onRemoved for making history or deleting new tab [tabId / target]");
                    $log.info(tabId);
                    var target = findTab(tabId);
                    $log.info(target);

                    if (target) {
                        if (target.hash == "newTabHash") {
                            $log.log("It's new Tab. So I deleted this tab... [target]");
                            $log.info(target);
                            $scope.newTabHash[tabId] = undefined;
                            popFromTree(target.node);
                            target.node = undefined;
                        }
                        else {
                            $log.log("It's old Tab. So I made this tab hitorized... [target]");
                            $log.info(target);
                            target.node.state = "history";
                            target.node.active = false;
                            target.node.tabId = 0;
                            $scope[target.hash][tabId] = undefined;
                        }
                    }
                    else {
                        $log.error("Missing removed tab. Why can't detecting this?");
                        $log.info(tabId);
                    }

                    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                        $scope.$apply();
                    }
                });


                // 페이지 소스 받는 부분
                chrome.runtime.onMessage.addListener(
                    function(request, sender, sendResponse) {
                        $log.log("Fired the chrome.runtime.onMessage for scraping [request / sender]");
                        $log.info(request);
                        $log.info(sender);

                        var checkBlacklist = function (url) {
                            var blacklist = Blacklist.getBlacklist();

                            console.log(blacklist);

                            for (var i = 0; i < blacklist.length; i++) {
                                var words = blacklist[i].split('*');
                                console.log(words);
                                var j = 0;

                                for (var j = 0; j < words.length; j++) {
                                    console.log(words[j]);
                                    if (!searchStringInArray(words[j], url)) {
                                        console.log("break occured");
                                        break;
                                    }
                                }

                                if (j == words.length) {
                                    console.log("blacklist filter occured");
                                    break;
                                }
                            }

                            if (i == blacklist.length) {
                                saveBodyToNode();
                            }
                        };

                        var saveBodyToNode = function () {
                            $log.log("It's scrapped data from list. [request.data / sender.tab]");
                            //$log.info(request.data);
                            $log.info(sender.tab);

                            $scope.$apply(function () {
                                var target = findTab(sender.tab.id);

                                if (target) {
                                    $log.log("Success saved body in node [target]");
                                    $log.info(target);
                                    target.node.body = request.data;

                                    // Server to save in
                                    if (!Com.saveNode(target.node))
                                        alert("pushToTree Error!!");
                                }
                                else {
                                    $log.error("Error saved body in node [sender]");
                                    $log.info(sender);
                                }
                            });

                            sendResponse({message: "I've finished to receive your data."});
                        }

                        if (request.data && sender.tab) {
                            checkBlacklist(sender.tab.url);
                        }
                    }
                );
            }

            Com.setMainCallback($scope.mainCallback);
        }]);



    // Login modal

    app.value('defaultBlacklist', ['http://*bank*']);

    app.factory('Blacklist', ['defaultBlacklist', function (defaultBlacklist) {
        var blacklist;
        chrome.storage.local.get('blacklist', function (items) {
            blacklist = defaultBlacklist.slice(0);
            if (items.blacklist) {
                blacklist = items.blacklist;
                console.log(items.blacklist);
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
                console.log(blacklist);
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
            console.log($scope.message);

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
                $log.info('Modal dismissed at: ' + new Date());
            });
        };


        $scope.showLoginForm = function () {
            $scope.message = "Show Form Button Clicked";
            console.log($scope.message);

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
                $log.info('Modal dismissed at: ' + new Date());
            });
        }


        $scope.showOptionForm = function () {
            $scope.message = "Show Form Button Clicked";
            console.log($scope.message);

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
                $log.info('Modal dismissed at: ' + new Date());
            });
        };


        var initService = function (items) {
            if(items.token) {
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
    }]);

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
                        chrome.storage.local.set({'token': token});
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
})();