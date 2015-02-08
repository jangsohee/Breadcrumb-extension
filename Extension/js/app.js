  /**
 * @author ChzMo
 */

(function() {
    var app = angular.module('histree', ['ui.tree', 'ui.bootstrap']);

    app.value('baseUrl', 'http://210.118.74.170:9000/');
    //app.value('baseUrl', 'http://121.135.191.219:9000/')
    app.value('projectName', 'Breadcrumb');

    app.factory('Com', ['$http', 'baseUrl', function ($http, baseUrl) {
        var AppId;
        var token;
        var treeData = [];
        var waitHash = {};

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
                    'current-application': AppId
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
                    'current-application': AppId
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
                    'current-application': AppId
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

        // 54d667ba61858b68265d7a77
        var checkAppId = function (mainCallback) {
            chrome.storage.local.get('app_id', function (items) {
                if (items.app_id) {
                    AppId = items.app_id;
                    console.log(items.app_id);
                    requestTree(AppId, mainCallback);
                }
                else
                    requestAppId(mainCallback);
            });
        };


        var requestAppId = function (mainCallback) {
            var reqPromise = $http.post(baseUrl + 'api/apps', {});


            reqPromise.success(function (data, status, headers, config) {
                if (status == 201) {
                    var res = data.data;
                    AppId = res._id;
                    // TODO: Loading 부 구현하기

                    chrome.storage.local.set({'app_id': AppId});
                    requestTree(AppId, mainCallback);
                }
                else {
                    alert('to get App Id success but unknown behavior.');
                    console.log(JSON.stringify(data));
                }
            });


            reqPromise.error(function (data, status, headers, config) {
                alert('to get App Id error :' + status);

                AppId = undefined;

                if (status == 404) {
                    // TODO: Error 404 Implement
                }
                else if (status == 422) {
                    // TODO: Error 422 Implement and Check code
                }
                else {
                    alert('to get App Id unknown error : ' + status);
                }

                console.log(JSON.stringify(data));
            });
        };


        var requestTree = function (Id, mainCallback) {
            // Error process
            if (!Id)
                return undefined;
            else if (Id != AppId) {
                alert("AppId is not valid.");
                console.log(Id);
                console.log(AppId);
                return undefined;
            }


            var reqConfig = {
                method: 'GET',
                url: baseUrl + 'api/apps',
                headers: {
                    'current-application': AppId
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

            getId: function () {
                return AppId;
            },

            getTree: function () {
                return treeData;
            },

            init: checkAppId,

            saveNode: requestNodeId,

            shiftNode: shiftNode,

            setToken: function(rtoken) {
                token = rtoken;
            },

            getToken: function() {
                return token;
            }
        };
    }])
        .controller('HistreeController',
        ['$scope', '$timeout', '$http', '$log', 'keys', 'Com', 'projectName', function ($scope, $timeout, $http, $log, keys, Com, projectName) {

            $scope.list = Com.treeData;

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


            $scope.keys = keys;

            $scope.callbacks = {};

            $scope.remove = function (scope) {
                scope.remove();
            };

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


            // [서버와 통신 부]

            // $scope.waitHash = Com.waitHash;

            //var recvData = {
            //    "code": 0,
            //    "status": 200,
            //    "message": "성공",
            //    "data": {
            //        "_id": "54d3a641e2e3ff04189d20bd",
            //        "registered": "2015-02-05T17:20:01.298Z",
            //        "__v": 0,
            //        "rootHistories": [
            //            {
            //                "_id": "54d3a64ae2e3ff04189d20be",
            //                "title": "hello",
            //                "url": "http://naver.com",
            //                "registered": "2015-02-05T17:20:10.938Z",
            //                "__v": 0,
            //                "children": []
            //            },
            //            {
            //                "_id": "54d3a64de2e3ff04189d20bf",
            //                "title": "hello2",
            //                "url": "http://naver.com",
            //                "registered": "2015-02-05T17:20:13.873Z",
            //                "__v": 0,
            //                "children": [
            //                    {
            //                        "_id": "54d3a658e2e3ff04189d20c0",
            //                        "title": "child",
            //                        "url": "http://naver.com",
            //                        "parent": {
            //                            "_id": "54d3a64de2e3ff04189d20bf",
            //                            "title": "hello2",
            //                            "url": "http://naver.com",
            //                            "registered": "2015-02-05T17:20:13.873Z",
            //                            "__v": 0,
            //                            "children": [
            //                                "54d3a658e2e3ff04189d20c0",
            //                                "54d3a659e2e3ff04189d20c1"
            //                            ]
            //                        },
            //                        "registered": "2015-02-05T17:20:24.170Z",
            //                        "__v": 0,
            //                        "children": []
            //                    },
            //                    {
            //                        "_id": "54d3a659e2e3ff04189d20c1",
            //                        "title": "child2",
            //                        "body": "body",
            //                        "url": "http://naver.com",
            //                        "parent": {
            //                            "_id": "54d3a64de2e3ff04189d20bf",
            //                            "title": "hello2",
            //                            "url": "http://naver.com",
            //                            "registered": "2015-02-05T17:20:13.873Z",
            //                            "__v": 0,
            //                            "children": [
            //                                "54d3a658e2e3ff04189d20c0",
            //                                "54d3a659e2e3ff04189d20c1"
            //                            ]
            //                        },
            //                        "registered": "2015-02-05T17:20:25.697Z",
            //                        "__v": 0,
            //                        "children": []
            //                    }
            //                ]
            //            }
            //        ]
            //    }
            //};
            //
            //var test = '{"code":0,"status":200,"message":"성공","data":{"_id":"54d3a641e2e3ff04189d20bd","registered":"2015-02-05T17:20:01.298Z","__v":0,"rootHistories":[{"_id":"54d3a64ae2e3ff04189d20be","title":"hello","url":"http://naver.com","registered":"2015-02-05T17:20:10.938Z","__v":0,"children":[]},{"_id":"54d3a64de2e3ff04189d20bf","title":"hello2","url":"http://naver.com","registered":"2015-02-05T17:20:13.873Z","__v":0,"children":[{"_id":"54d3a658e2e3ff04189d20c0","title":"child","url":"http://naver.com","parent":{"_id":"54d3a64de2e3ff04189d20bf","title":"hello2","url":"http://naver.com","registered":"2015-02-05T17:20:13.873Z","__v":0,"children":["54d3a658e2e3ff04189d20c0","54d3a659e2e3ff04189d20c1"]},"registered":"2015-02-05T17:20:24.170Z","__v":0,"children":[]},{"_id":"54d3a659e2e3ff04189d20c1","title":"child2","body":"body","url":"http://naver.com","parent":{"_id":"54d3a64de2e3ff04189d20bf","title":"hello2","url":"http://naver.com","registered":"2015-02-05T17:20:13.873Z","__v":0,"children":["54d3a658e2e3ff04189d20c0","54d3a659e2e3ff04189d20c1"]},"registered":"2015-02-05T17:20:25.697Z","__v":0,"children":[]}]}]}}';
            //
            //var rData = JSON.parse(test);


            //Server Communication start --
            Com.init(mainCallback);
            //mainCallback();

            function mainCallback() {

                // [서비스로 분리 부분]
                function findTab(tabId) {
                    var newTab = $scope.newTabHash[tabId];
                    var tab = $scope.tabHash[tabId];
                    var directTab = $scope.directHash[tabId];

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

                    // Server to save in
                    //if (!Com.saveNode(newNode))
                    //    alert("pushToTree Error!!");
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

                        if ($scope.curtab) {
                            $log.log("There is past curtab. Set the state to inactive.");
                            $scope.curtab.active = false;
                        }
                        else {
                            $log.warn("Past curtab is empty. [curtab]");
                            $log.info($scope.curtab);
                        }

                        var target = findTab(tab.id);

                        if (target) {
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
                    // 다른 경우는 모두 자식으로
                    else {
                        $log.log("It's new children in onCreated");
                        var newNode = {
                            _id: addCount(),
                            parent: $scope.curtab._id,
                            tabId: newTab.id,
                            title: "[Loading...]",
                            url: newTab.url,
                            favicon: newTab.favIconUrl ? newTab.favIconUrl : 'history.png',
                            keyword: null,
                            state: 'start',
                            active: false,
                            children: []
                        };

                        pushToTree(newNode);
                        $scope.tabHash[newNode.tabId] = newNode;
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
                        }
                        if(changes.favIconUrl) {
                            value.favicon =  changes.favIconUrl ? changes.favIconUrl : 'history.png';
                        }
                    }

                    value = $scope.tabHash[tabId];
                    if (value) {
                        $log.log("It's any Tab in tabHash. [value]");
                        $log.info(value);
                        // onCreatedNavigationTarget으로 통한 자식일 경우 완료
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
                        }
                        if(changes.favIconUrl) {
                            value.favicon =  changes.favIconUrl ? changes.favIconUrl : 'history.png';
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
                        }
                        if(changes.favIconUrl) {
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
                            $log.log("It's Replaced by instant page not new Tab. [tab]");
                            $log.info(tab);
                            value.title = tab.title;
                            value.url = tab.url;
                            value.favicon = tab.favIconUrl ? tab.favIconUrl : 'history.png';
                            value.tabId = tab.id;
                            value.state = "replaced";

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
                    if (!$scope.tabHash[details.tabId] && value) {
                        $log.log("It's clearly linked tab. [value]");
                        $log.info(value);
                        var callback = function (tab) {
                            $log.log("It's clearly linked tab of CALLBACK. [tab]");
                            $log.info(tab);
                            var newNode = {
                                _id: addCount(),
                                parent: value._id,
                                tabId: tab.id,
                                title: "[Loading...]",
                                url: tab.url,
                                favicon: tab.favIconUrl ? tab.favIconUrl : 'history.png',
                                keyword: null,
                                state: 'start',
                                active: false,
                                children: []
                            };

                            pushToTree(newNode);
                            $scope.tabHash[newNode.tabId] = newNode;

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

                            if(!(value.state == "start"
                                || searchStringInArray("client_redirect", details.transitionQualifiers))) {
                                $scope.tabHash[details.tabId] = undefined;
                            }

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
                                    value.state = "loading";
                                }
                                else {
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
                        // 주소창으로 직접 접근하는 경우
                        if ((details.transitionType == "typed"
                            && searchStringInArray("from_address_bar", details.transitionQualifiers) != -1)
                            || details.transitionType == "keyword"
                            || details.transitionType == "generated") {
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

                        if (request.data && sender.tab) {
                            $log.log("It's scrapped data from list. [request.data / sender.tab]");
                            //$log.info(request.data);
                            $log.info(sender.tab);

                            $scope.$apply(function() {
                                var targetNode = $scope.tabHash[sender.tab.id];

                                if (targetNode) {
                                    $log.log("Success saved body in node [targetNode]");
                                    $log.info(targetNode);
                                    targetNode.body = request.data;

                                    // Server to save in
                                    //if (!Com.saveNode(targetNode))
                                    //    alert("pushToTree Error!!");
                                }
                                else {
                                    $log.error("Error saved body in node [sender]");
                                    $log.info(sender);
                                }
                            });

                            sendResponse({message: "I've finished to receive your data."});
                        }
                    }
                );
            }
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
                }
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
    }])

    var SignModalInstanceCtrl = function ($scope, $modalInstance, signForm, $http, baseUrl) {
        $scope.form = {};
        $scope.submitForm = function () {
            console.log($scope.account);

            if ($scope.form.signForm.$valid) {
                var reqConfig = {
                    method: 'POST',
                    url: baseUrl + 'api/users',
                    headers: $scope.account
                };
                var reqPromise = $http(reqConfig);


                reqPromise.success(function (data, status, headers, config) {
                    if (status == 201) {
                        var token = data.data.token;
                        chrome.storage.local.set({'token': token});
                    }
                    else {
                        alert('to sign up account to server success but unknown behavior.');
                        console.log(JSON.stringify(data));
                    }

                    $modalInstance.close('closed');
                });


                reqPromise.error(function (data, status, headers, config) {
                    alert('to sign up account to server error :' + status);

                    if (status == 404) {
                        // TODO: Error 404 Implement
                    }
                    else if (status == 422) {
                        // TODO: Error 422 Implement and Check code
                    }
                    else {
                        alert('to sign up account to server unknown error : ' + status);
                    }

                    console.log(JSON.stringify(data));

                    $modalInstance.close('closed');
                });
            } else {
                console.log('signForm is not in scope');
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    var LoginModalInstanceCtrl = function ($scope, $modalInstance, loginForm, $http, baseUrl) {
        $scope.form = {};
        $scope.submitForm = function () {
            if ($scope.form.loginForm.$valid) {
                var reqConfig = {
                    method: 'POST',
                    url: baseUrl + 'auth/local',
                    headers: $scope.account
                };
                var reqPromise = $http(reqConfig);


                reqPromise.success(function (data, status, headers, config) {
                    if (status == 201) {
                        var token = data.data.token;
                        chrome.storage.local.set({'token': token});
                    }
                    else {
                        alert('to login account to server success but unknown behavior.');
                        console.log(JSON.stringify(data));
                    }

                    $modalInstance.close('closed');
                });


                reqPromise.error(function (data, status, headers, config) {
                    alert('to login account to server error :' + status);

                    if (status == 404) {
                        // TODO: Error 404 Implement
                    }
                    else if (status == 422) {
                        // TODO: Error 422 Implement and Check code
                    }
                    else {
                        alert('to login account to server unknown error : ' + status);
                    }

                    console.log(JSON.stringify(data));

                    $modalInstance.close('closed');
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