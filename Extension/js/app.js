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
                    pushChildToTree(newNode);
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
                                    value.title = tab.title;
                                    value.url = tab.url;
                                    value.tabId = tab.id;
                                    $scope.tabQueue.push(value);
                                    $scope.newTabQueue.splice(key, 1);
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

        // 서비스로 분리하자
        function pushChildToTree(newChildNode)
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
                else {
                    alert("Unknown Error // check your console...");
                    console.log("ERROR :: cannot find parent tab.");
                }
            }
        }

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

                                    pushChildToTree(newNode);
                                    $scope.tabQueue.push(newNode);
                                    //value.items.push(newNode);
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

                                    //$scope.tabQueue.push(newNode);
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
            console.log("Test");
        });


        // 페이지 소스 받는 부분
        $scope.received_data = "";

        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
                console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                    "from the extension");
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