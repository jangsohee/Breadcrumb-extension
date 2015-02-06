/**
 * @author ChzMo
 */

(function(){
	var app = angular.module('histree', ['ui.tree']);

	app.controller('HistreeController', function($scope, $timeout, keys){
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

        $scope.list = [
            //{
            //    "id": 1,
            //    "title": new Date().getDate(),
            //    "url": null,
            //    "keyword": null,
            //    "items": []
            //}
        ];


        $scope.callbacks = {
        };

        $scope.remove = function(scope) {
            scope.remove();
        };

        $scope.toggle = function(scope) {
            scope.toggle();
        };

        $scope.newSubItem = function(scope) {
            var nodeData = scope.$modelValue;
            nodeData.items.push({
                id: nodeData.id * 10 + nodeData.items.length,
                title: nodeData.title + '.' + (nodeData.items.length + 1),
                items: []
            });
        };
        



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
            else if (newTab) {
                return {
                    hash: 'directHash',
                    node: directTab
                }
            }
            else
                return undefined;
        }


        function searchStringInArray (str, strArray) {
            for (var j=0; j<strArray.length; j++) {
                if (strArray[j].match(str)) return j;
            }
            return -1;
        }


        function pushToTree(newChildNode)
        {
            //var targetElement = document.querySelector("[ng-id='" + newChildNode.pid +"']");
            if (newChildNode.pid == newChildNode.id) {
                $scope.list.push(newChildNode);
            }
            else {
                var targetElement = document.getElementById(newChildNode.pid);
                if (targetElement) {
                    var targetScope = angular.element(targetElement).scope();
                    targetScope.$modelValue.items.push(newChildNode);
                }
            }
        }


        function popFromTree(removedNode)
        {
            var targetElement = document.getElementById(removedNode.id);
            if (targetElement) {
                var targetScope = angular.element(targetElement).scope();
                var target = targetScope.$modelValue;
                var position = $.inArray(target, $scope.list);
                if ( ~position ) $scope.list.splice(position, 1);
            }
        }


        // [초기화 부분]
        // 탭 관리를 위한 Hash 선언
        $scope.newTabHash = {};
        $scope.tabHash = {};
        $scope.directHash = {};

        // 현재 탭 가져오기
        chrome.tabs.query({}, function(tabArray){
            $scope.$apply(function() {
                angular.forEach(tabArray, function(value, key) {
                    var newNode = {
                        id: $scope.list.length + 1,
                        pid: $scope.list.length + 1,
                        tabId: value.id,
                        title: value.title,
                        url: value.url,
                        keyword: null,
                        state: 'complete',
                        active: false,
                        items: []
                    };

                    if (newNode.url == "chrome://newtab/")
                        $scope.newTabHash[newNode.tabId] = newNode;
                    else
                        $scope.tabHash[newNode.tabId] = newNode;

                    pushToTree(newNode);
                });
            });
            
        });


        // 시작시 현재 탭 추적
        chrome.tabs.getCurrent(function (tab){
            $scope.$apply(function() {
                $scope.curtab = $scope.tabHash[tab.id];

                if($scope.curtab) {
                    $scope.curtab.active = true;
                    document.getElementById($scope.curtab.id).scrollIntoView();
                }
            });
        });


        // 탭 활성화된 부분 캐치하는 부분
        chrome.tabs.onActivated.addListener(function(activeInfo){
            // console.log("onActivated is fired.");
            chrome.tabs.get(activeInfo.tabId, function(tab) {
                // console.log("get in onActivated is fired.");
                $scope.$apply(function() {
                    // console.log("scope at get in onActivated is fired.");
                    // console.log("Old tab judge...");
                    // console.log($scope.curtab);
                    if($scope.curtab) {
                        // console.log("Old tab is. Set to false");
                        $scope.curtab.active = false;
                    }

                    // console.log("find target...");
                    var target = findTab(tab.id);
                    // console.log(target);

                    // console.log("target judge...");
                    if(target) {
                        // console.log("target is. Set to true.");
                        target.node.active = true;
                        $scope.curtab = target.node;
                        //document.getElementById($scope.curtab.id).scrollIntoView();
                    }
                    else {
                        // console.log("onActivated is fired. but undefined target... tabId : " + tab.id);
                    }
                });
            });
        });


        // 탭 생성시 감지 부분
        chrome.tabs.onCreated.addListener(function(newTab){
            // 수동적으로 생성된 탭 생성 감지 부분
            if (newTab.url == "chrome://newtab/") {
                var newNode = {
                    id: $scope.list.length + 1,
                    pid: $scope.list.length + 1,
                    tabId: newTab.id,
                    title: newTab.title,
                    url: newTab.url,
                    keyword: null,
                    state: 'start',
                    active: true,
                    items: []
                };

                $scope.$apply(function(){
                    //$scope.curtab = newNode;
                    $scope.newTabHash[newNode.tabId] = newNode;
                    pushToTree(newNode);
                });
            }
            else {
                $scope.$apply(function () {
                    var newNode = {
                        id: $scope.curtab.id * 10 + $scope.curtab.items.length,
                        pid: $scope.curtab.id,
                        tabId: newTab.id,
                        title: "[Loading...]",
                        url: newTab.url,
                        keyword: null,
                        state: 'start',
                        active: false,
                        items: []
                    };

                    pushToTree(newNode);
                    $scope.tabHash[newNode.tabId] = newNode;
                });
            }
        });


        // 탭 변화 감지부
        chrome.tabs.onUpdated.addListener(function (tabId, changes, tab) {
            // 수동 새 탭의 경우
            var value = $scope.newTabHash[tabId];
            if (value){
                $scope.$apply(function() {
                    if(changes.status == "loading") {
                        value.title =  "[L] " + tab.title;
                        value.state = changes.status;
                    }
                    // 완료 부
                    else if(changes.status == "complete") {
                        value.title = tab.title;
                        value.state = changes.status;

                        if(value.url != tab.url) {
                            value.url = tab.url;
                            $scope.tabHash[tabId] = value;
                            $scope.newTabHash[tabId] = undefined; // debug
                        }
                    }
                });
            }

            value = $scope.tabHash[tabId];
            if (value){
                $scope.$apply(function() {
                    // onCreatedNavigationTarget으로 통한 자식일 경우 완료
                    if(value.id != value.pid && changes.status == "complete") {
                        value.title = tab.title;
                        value.url = tab.url;
                        value.state = changes.status;
                    }
                    // 어떤 탭이든 완료 경우
                    if(changes.status == "complete") {
                        value.title = tab.title;
                        value.url = tab.url;
                        value.state = changes.status;
                    }
                });
            }

            value = $scope.directHash[tabId];
            if (value) {
                $scope.$apply(function() {
                    // 직접 접근한 경우 완료
                    if(changes.status == "complete") {
                        value.title = tab.title;
                        value.url = tab.url;
                        value.state = changes.status;
                    }
                    $scope.directHash[tabId] = undefined;
                });
            }
        });


        chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
            // 수동 새 탭 경우 Replaced부
            var value = $scope.newTabHash[removedTabId];
            if (value){
                var callback = function (tab) {
                    var value = $scope.newTabHash[removedTabId];

                    value.title = tab.title;
                    value.url = tab.url;
                    value.tabId = tab.id;
                    value.state = "replaced";
                    $scope.tabHash[tab.id] = value;
                    $scope.newTabHash[removedTabId] = undefined;
                    $scope.$apply();
                };
                chrome.tabs.get(addedTabId, callback);
            }

            // 대체되는 탭이 존재한다면 (by instant page)
            value = $scope.tabHash[removedTabId];
            if (value) {
                var callback = function (tab) {
                    $scope.$apply(function () {
                        value.title = tab.title;
                        value.url = tab.url;
                        value.tabId = tab.id;
                        value.state = "replaced";
                    });
                };
                chrome.tabs.get(addedTabId, callback);
            }
        });


        // 링크로 파생된 탭 시작 부
        chrome.webNavigation.onCreatedNavigationTarget.addListener(function(details) {
            var value = $scope.tabHash[details.sourceTabId];
            if(!$scope.tabHash[details.tabId] && value) {
                var callback = function (tab) {
                    $scope.$apply(function () {
                        var newNode = {
                            id: value.id * 10 + value.items.length,
                            pid: value.id,
                            tabId: tab.id,
                            title: "[Loading...]",
                            url: tab.url,
                            keyword: null,
                            state: 'start',
                            active: false,
                            items: []
                        };

                        pushToTree(newNode);
                        $scope.tabHash[newNode.tabId] = newNode;
                    });
                };
                chrome.tabs.get(details.tabId, callback);
            }
        });


        // 탭 변화 감지부
        chrome.webNavigation.onCommitted.addListener(function(details) {
            var value = $scope.tabHash[details.tabId];
            if (value) {
                // 파생 판정
                if (details.transitionType == "link") {
                    var callback = function (tab) {
                        $scope.$apply(function () {
                            // onCreatedNavigationTarget으로 생성된 자식 탭 로딩 부
                            if (value.state == "start") {
                                value.title = "[L] " + tab.title;
                                value.url = tab.url;
                                value.state = "loading";
                            }
                            // 제자리 depth
                            else {
                                var newNode = {
                                    id: $scope.list.length + 1,
                                    pid: value.pid,
                                    tabId: tab.id,
                                    title: tab.title,
                                    url: tab.url,
                                    keyword: null,
                                    state: 'start',
                                    active: true,
                                    items: []
                                };

                                value.tabId = 0;
                                value.state = 'history';
                                value.active = false;

                                if (value.id == value.pid) {
                                    newNode.pid = newNode.id;
                                }

                                $scope.curtab = newNode;
                                pushToTree(newNode);
                                $scope.tabHash[newNode.tabId] = newNode;
                            }
                        });
                    };
                    chrome.tabs.get(details.tabId, callback);
                }
                // 주소창으로 직접 접근하는 경우
                if ((details.transitionType == "typed"
                    && searchStringInArray("from_address_bar", details.transitionQualifiers) != -1)
                    || details.transitionType == "keyword"
                    || details.transitionType == "generated") {
                    var callback = function (tab) {
                        $scope.$apply(function () {
                            var newNode = {
                                id: $scope.list.length + 1,
                                pid: $scope.list.length + 1,
                                tabId: value.tabId,
                                title: "[L] " + tab.title,
                                url: tab.url,
                                keyword: null,
                                state: 'start',
                                active: true,
                                items: []
                            };

                            value.state = "history";
                            value.tabId = 0; // 이전 탭 Id를 날린다.

                            $scope.curtab = newNode;
                            $scope.tabHash[newNode.tabId] = newNode;
                            $scope.directHash[newNode.tabId] = newNode;
                            pushToTree(newNode);
                        });
                    };
                    chrome.tabs.get(details.tabId, callback);
                }
            }
        });

        // 탭 닫힘 구현
        chrome.tabs.onRemoved.addListener(function (tabId) {
            $scope.$apply(function() {
                var target = findTab(tabId);

                if (target) {
                    if (target.hash == "newTabHash") {
                        $scope.newTabHash[tabId] = undefined;
                        popFromTree(target.node);
                        target.node = undefined;
                    }
                    else {
                        target.node.state = "history";
                        target.node.active = false;
                        target.node.tabId = 0;
                        $scope[target.hash][tabId] = undefined;
                    }
                }
            });
        });
	})
})();





/*
    webNavigation Tester Module

    onCreatedNavigationTarget로 감지되는 탭들은 무조건 자식이다.
    근데 이 녀석은 순수하게 링크를 통해서 파생된 새 탭이나 새 윈도우만 감지할 수 있다.

    onCommitted는 정말 모든걸 감지한다.
    예를들어 페이지 내에서 다시 요청하는 부분도 감지한다. 그리고 상태값도 존재한다.
    페이지가 링크로 열린건지, 주소창에 직접 입력한건지 등등....

    하지만 경우의 수를 추려서 분석할 필요가 있다.


    TODO: onCommitted 분석하기,
 */

(function() {
    var app = angular.module('navitest', []);

    app.controller('NaviController', ['$scope', function ($scope) {

        /*
         webNavigation Start
         */

        $scope.committedInfo = [];
        chrome.webNavigation.onCommitted.addListener(function(details) {
            $scope.$apply(function() {
                $scope.committedInfo.push(details);
            });
        });

        $scope.createdNaviTarget = [];
        chrome.webNavigation.onCreatedNavigationTarget.addListener(function(details) {
            $scope.$apply(function() {
                $scope.createdNaviTarget.push(details);
            });
        });

        $scope.replacedTabs = [];
        chrome.webNavigation.onTabReplaced.addListener(function (details) {
           $scope.$apply(function() {
               $scope.replacedTabs.push(details);
           });
        });

        $scope.replacedTabsObj = [];
        chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
            $scope.$apply(function() {
                $scope.replacedTabsObj.push({add: addedTabId, remove: removedTabId});
            });
        });

        $scope.changedTabs = [];
        chrome.tabs.onUpdated.addListener(function (tabId, changes, tab) {
            $scope.$apply(function() {
                $scope.changedTabs.push({
                    tabId: tabId,
                    changes: "(" + changes.status + ") " + changes.url + "[" + changes.pinned + ", "
                                + changes.favIconUrl + "]",
                    tab: tab
                });
            });
        });

        $scope.createdTabs = [];
        chrome.tabs.onCreated.addListener(function (tab) {
            $scope.$apply(function() {
                $scope.createdTabs.push(tab);
            });
        });

        chrome.webNavigation.onCompleted.addListener(function (details) {
            
        });


        // 페이지 소스 받는 부분
        $scope.received_data = "";

        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {

                if (request.data)
                {
                    $scope.$apply(function() {
                        $scope.received_data = request.data;
                    });
                    sendResponse({message: "I've finished to receive your data."});
                }
            }
        );
    }]);
})();