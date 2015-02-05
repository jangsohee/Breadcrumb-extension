/**
 * Created by SangBong on 2015-02-05.
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
            copyKey: 'shift',
            selectKey: 'ctrl',
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

        $scope.curtab = [];


        // 탭 활성화된 부분 캐치하는 부분
        chrome.tabs.onActivated.addListener(function(activeInfo){
            chrome.tabs.get(activeInfo.tabId, function(tab) {
                $scope.$apply(function() {
                    $scope.curtab = tab;
                });
            });
        });

        $scope.newTabQueue = [];
        $scope.tabQueue = [];
        $scope.directQueue = [];

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
                    items: []
                };

                $scope.$apply(function(){
                    $scope.newTabQueue.push(newNode);
                    $scope.list.push(newNode);
                });
            }
        });

        chrome.tabs.onUpdated.addListener(function (tabId, changes, tab) {
            // 수동 새 탭의 경우
            if ($scope.newTabQueue.length > 0) {
                $scope.$apply(function() {
                    angular.forEach($scope.newTabQueue, function(value, key) {
                        if(value.tabId == tabId) {
                            // 로딩 표시
                            if(changes.status == "loading") {
                                value.title =  "[L] " + tab.title;
                            }
                            // 완료 부
                            else if(changes.status == "complete") {
                                value.title = tab.title;

                                if(value.url != tab.url) {
                                    value.url = tab.url;
                                    $scope.tabQueue.push(value);
                                    this.splice(key, 1);
                                }
                            }
                        }
                    }, $scope.newTabQueue);
                });
            }
            if($scope.tabQueue.length > 0) {
                $scope.$apply(function() {
                    angular.forEach($scope.tabQueue, function (value, key) {
                        // onCreatedNavigationTarget으로 통한 자식일 경우 완료
                        if(value.id != value.pid && value.tabId == tabId && changes.status == "complete") {
                            value.title = tab.title;
                            value.url = tab.url;
                        }
                        if(value.tabId == tabId && changes.status == "complete") {
                            value.title = tab.title;
                            value.url = tab.url;
                        }
                    }, $scope.tabQueue);
                });
            }
            if($scope.directQueue.length > 0) {
                $scope.$apply(function() {
                    angular.forEach($scope.directQueue, function (value, key) {
                        // 직접 접근한 경우 완료
                        if(value.tabId == tabId && changes.status == "complete") {
                            value.title = tab.title;
                            value.url = tab.url;
                        }
                        $scope.directQueue.splice(key, 1);
                    });
                });
            }
        });

        chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
            // 수동 새 탭 경우 Replaced부
            if ($scope.newTabQueue.length > 0) {
                $scope.$apply(function () {
                    angular.forEach($scope.newTabQueue, function(value, key) {
                        if(value.tabId == removedTabId) {
                            var callback = function (tab) {
                                $scope.$apply(function () {
                                    var target = $scope.newTabQueue[key];
                                    target.title = tab.title;
                                    target.url = tab.url;
                                    target.tabId = tab.id;
                                    $scope.tabQueue.push(target);
                                    $scope.newTabQueue.splice(key, 1);
                                });
                            };
                            chrome.tabs.get(addedTabId, callback);
                        }
                    });
                });
            }
            if ($scope.directQueue.length > 0) {
                $scope.$apply(function () {
                    angular.forEach($scope.directQueue, function(value, key) {
                        if(value.tabId == removedTabId) {
                            var callback = function (tab) {
                                $scope.$apply(function () {
                                    value.title = tab.title;
                                    value.url = tab.url;
                                    value.tabId = tab.id;
                                });
                            };
                            chrome.tabs.get(addedTabId, callback);
                        }
                    });
                });
            }
            if ($scope.tabQueue.length > 0) {
                $scope.$apply(function () {
                    angular.forEach($scope.tabQueue, function(value, key) {
                        if(value.tabId == removedTabId) {
                            var callback = function (tab) {
                                $scope.$apply(function () {
                                    value.title = tab.title;
                                    value.url = tab.url;
                                    value.tabId = tab.id;
                                });
                            };
                            chrome.tabs.get(addedTabId, callback);
                        }
                    });
                });
            }
        });

        chrome.webNavigation.onCreatedNavigationTarget.addListener(function(details) {
            if($scope.tabQueue.length > 0) {
                $scope.$apply(function () {
                    angular.forEach($scope.tabQueue, function (value, key) {
                        if (value.tabId == details.sourceTabId) {
                            var callback = function (tab) {
                                $scope.$apply(function () {
                                    var newNode = {
                                        id: value.id * 10 + value.items.length,
                                        pid: value.id,
                                        tabId: tab.id,
                                        title: "[Loading...]",
                                        url: tab.url,
                                        keyword: null,
                                        items: []
                                    };

                                    $scope.tabQueue.push(newNode);
                                    value.items.push(newNode);
                                });
                            };
                            chrome.tabs.get(details.tabId, callback);
                        }
                    });
                });
            }
        });

        function searchStringInArray (str, strArray) {
            for (var j=0; j<strArray.length; j++) {
                if (strArray[j].match(str)) return j;
            }
            return -1;
        }

        chrome.webNavigation.onCommitted.addListener(function(details) {
            if($scope.tabQueue.length > 0) {
                $scope.$apply(function () {
                    angular.forEach($scope.tabQueue, function (value, key) {
                        // onCreatedNavigationTarget으로 생성된 자식 탭 로딩 부
                        if (value.tabId == details.tabId && details.transitionType == "link") {
                            var callback = function (tab) {
                                $scope.$apply(function () {
                                    value.title = "[L] " + tab.title;
                                    value.url = tab.url;
                                });
                            };
                            chrome.tabs.get(details.tabId, callback);
                        }
                        // 주소창으로 직접 접근하는 경우
                        if (value.tabId == details.tabId
                            && ((details.transitionType == "typed"
                            && searchStringInArray("from_address_bar", details.transitionQualifiers) != -1)
                            || details.transitionType == "keyword"
                            || details.transitionType == "generated")) {
                            var callback = function (tab) {
                                $scope.$apply(function () {
                                    var newNode = {
                                        id: $scope.list.length + 1,
                                        pid: $scope.list.length + 1,
                                        tabId: value.tabId,
                                        title: "[L] " + tab.title,
                                        url: tab.url,
                                        keyword: null,
                                        items: []
                                    };

                                    value.tabId = 0; // 이전 탭 Id를 날린다.

                                    $scope.tabQueue.push(newNode);
                                    $scope.directQueue.push(newNode);
                                    $scope.list.push(newNode);
                                });
                            };
                            chrome.tabs.get(details.tabId, callback);
                        }
                    });
                });
            }
        });
    })
})();