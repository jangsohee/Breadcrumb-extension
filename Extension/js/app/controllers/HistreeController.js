/**
 * Created by ChzMo on 2015-02-18.
 */

(function () {
    "use strict";

    angular
        .module('histree')
        .controller('HistreeController', HistreeController);

    HistreeController.$inject = ['$scope', '$timeout', '$http', '$log', 'keys', 'Com', 'projectName', 'Blacklist'];

    function HistreeController($scope, $timeout, $http, $log, keys, Com, projectName, Blacklist) {
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
        //        console.log("test");
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
                    chrome.tabs.update(target.tabId, {'active': true});
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
                    console.log(event);
                    var srcNode = event.source.nodeScope.$modelValue;
                    var srcIndex = event.source.index;
                    var destNode = event.dest.nodesScope.$parent.$modelValue;
                    var destNodeId = destNode ? destNode._id : null;
                    var destIndex = event.dest.index;


                    if (srcIndex == destIndex && event.dest.nodesScope == event.source.nodesScope) {
                        //console.log("it's self direction");
                    }
                    else {
                        if (event.dest.nodesScope.$nodeScope) {
                            srcNode.parent = destNode._id;
                            console.log("it's moved in another node");
                        }
                        // go to root
                        else {
                            srcNode.parent = srcNode._id;
                            console.log("it's moved in root node");
                        }

                        //console.log(srcNode._id);
                        //console.log(destNodeId);
                        //console.log(destIndex);

                        // [Breadcrumb]
                        //console.log("calling shiftNode");
                        //Com.shiftNode(srcNode._id, destNodeId, destIndex);
                    }
                }
            };


            $scope.removeNod = function (removeFunc, scope) {
                console.log(removeFunc);
                console.log(scope);

                var targetScope = scope.$nodeScope;
                var targetNode = targetScope.$modelValue;
                var targetChildren = targetScope.$childNodesScope.$modelValue;

                console.log(targetNode);
                console.log(targetChildren);

                // [Breadcrumb]
                //Com.deleteNode(targetNode._id);

                function recursiveDelete(Nodes) {
                    var i;
                    for (i = 0; i < Nodes.length; i++) {
                        if (Nodes[i].children && Nodes[i].children.length > 0)
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


            // [초기화 부분]
            // 탭 관리를 위한 Hash 선언
            $scope.total = {num: 0};


            $scope.replaceTabHash = {};
            $scope.newTabHash = {};
            $scope.newTabOpenerHash = {};
            $scope.tabChildHash = {};
            $scope.refreshBlogHash = {};
            $scope.newTabListHash = {};
            $scope.tabHash = {};
            $scope.directHash = {};

            // 현재 탭 가져오기
            chrome.tabs.query({}, function (tabArray) {
                $log.debug("Enter the chrome.tabs.query for getting Current Tab [tabArray]");
                $log.info(tabArray);
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


                        // [BreadCrumb]
                        //Com.getNodeId(newNode);

                        pushToTree(newNode);

                        // [Breadcrumb]
                        //if (newNode.url != "chrome://extensions/")
                        //    chrome.tabs.reload(value.id);
                        $log.debug("TEST QUERY");
                        $log.debug(newNode.title);
                    }
                });

                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                    $scope.$apply();
                }
            });


            // 시작시 현재 탭 추적
            //chrome.tabs.getCurrent(function (tab) {
            //    $log.debug("Enter the chrome.tabs.getCurrent for tracing Current Tab on startup [tab]");
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
                $log.debug("Fired the chrome.tabs.onActivated for tracing Current Tab [activeInfo]");
                $log.info(activeInfo);
                chrome.tabs.get(activeInfo.tabId, function (tab) {
                    $log.debug("request to the chrome.tabs.get for tracing Current Tab [tab]");
                    $log.info(tab);

                    var target = findTab(tab.id);

                    if (target) {
                        if ($scope.curtab) {
                            $log.debug("There is past curtab. Set the state to inactive.");
                            $scope.curtab.active = false;
                        }
                        else {
                            $log.warn("Past curtab is empty. [curtab]");
                            $log.info($scope.curtab);
                        }

                        $log.debug("Set the new curtab's state active and Change curtab [target]");
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
                $log.debug("Fired the chrome.tabs.onCreated for tracing New Tab [newTab]");
                $log.info(newTab);
                // 수동적으로 생성된 탭 생성 감지 부분
                if (newTab.url == "chrome://newtab/") {
                    $log.debug("It's chrome://newtab/");
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
                    // [BreadCrumb]
                    //Com.getNodeId(newNode);
                    pushToTree(newNode);
                }
                else if (newTab.url.indexOf('chrome-devtools') == 0) {
                    // No tracing
                }
                // openerTabId가 있으면 자식으로
                // [경우의 수]
                // 탭 복제,
                else if (newTab.openerTabId) {
                    $log.debug("It's new children in onCreated");
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
                    // [BreadCrumb]
                    //Com.getNodeId(newNode);
                    pushToTree(newNode);
                }
                else {
                    $log.debug("It's new tab from list!");

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
                    // [BreadCrumb]
                    //Com.getNodeId(newNode);
                    pushToTree(newNode);
                }

                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                    $scope.$apply();
                }
            });


            // 탭 변화 감지부
            chrome.tabs.onUpdated.addListener(function (tabId, changes, tab) {
                $log.debug("Fired the chrome.tabs.onUpdated for detecting changing tab [tabId, changes, tab]");
                $log.info(tabId);
                $log.info(changes);
                $log.info(tab);

                // 수동 새 탭의 경우
                var value = $scope.newTabHash[tabId];
                if (value) {
                    $log.debug("It's Manual New Tab. [value]");
                    $log.info(value);
                    if (changes.status == "loading") {
                        $log.debug("And it's loading tab...");
                        if (tab.title != tab.url || tab.title != '')
                            value.title = tab.title;
                        value.state = changes.status;
                        $scope.tabHash[tabId] = value;
                        $scope.newTabHash[tabId] = undefined; // debug
                    }
                    // 완료 부
                    else if (changes.status == "complete") {
                        $log.debug("And it's complete!");
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
                    if (changes.favIconUrl) {
                        value.favicon = changes.favIconUrl ? changes.favIconUrl : 'history.png';
                    }
                }

                value = $scope.newTabOpenerHash[tabId];
                if (value) {
                    $log.debug("It's new tab of TABOPENER from another tab in update");
                    $log.info(value);
                    //if (changes.status == "loading") {
                    $log.debug("And it's " + changes.status + " tab... set title, url, favicon, state");
                    if (tab.title != tab.url || tab.title != '')
                        value.title = tab.title;
                    value.url = tab.url;
                    value.favicon = tab.favIconUrl ? tab.favIconUrl : value.favicon;
                    value.state = changes.status ? changes.status : value.state; // state가 loading이여도 후에 complete가 안일어나므로...
                    //}

                }

                value = $scope.tabChildHash[tabId];
                if (value) {
                    $log.debug("It's new tab of TABCHILD from another tab in update");
                    $log.info(value);
                    //if (changes.status == "loading") {
                    $log.debug("And it's " + changes.status + " tab... set title, url, favicon, state");
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
                    $log.debug("It's new tab from list in update!");
                    $log.info(value);
                    //if (changes.status == "loading") {
                    $log.debug("And it's loading tab... set title, url, favicon, state");
                    if (tab.title != tab.url || tab.title != '')
                        value.title = tab.title;
                    value.url = tab.url;
                    value.favicon = tab.favIconUrl ? tab.favIconUrl : value.favicon;
                    value.state = changes.status ? changes.status : value.state; // state가 loading이여도 후에 complete가 안일어나므로...
                    //}
                }

                value = $scope.tabHash[tabId];
                if (value) {
                    $log.debug("It's any Tab in tabHash. [value]");
                    $log.info(value);
                    if (changes.status == "loading") {
                        $log.debug("And it's loading tab...");
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
                        $log.debug("And it's complete!");
                        if (tab.title != tab.url || tab.title != '')
                            value.title = tab.title;
                        value.url = tab.url;
                        value.state = changes.status;
                        if (tab.favIconUrl)
                            value.favicon = tab.favIconUrl;
                    }
                    if (changes.favIconUrl) {
                        value.oldfavicon = value.favicon;
                        value.favicon = changes.favIconUrl;
                    }
                }

                value = $scope.directHash[tabId];
                if (value) {
                    $log.debug("It's direct Tab. [value]");
                    $log.info(value);
                    // 직접 접근한 경우 완료
                    if (changes.status == "complete") {
                        $log.debug("And it's complete!");
                        if (tab.title != tab.url || tab.title != '')
                            value.title = tab.title;
                        value.url = tab.url;
                        value.state = changes.status;
                        if (tab.favIconUrl)
                            value.favicon = tab.favIconUrl;
                    }
                    if (changes.favIconUrl) {
                        value.oldfavicon = value.favicon;
                        value.favicon = changes.favIconUrl ? changes.favIconUrl : 'history.png';
                    }

                    $scope.directHash[tabId] = undefined;
                }


                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                    $scope.$apply();
                }
            });


            chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
                $log.debug("Fired the chrome.tabs.onReplaced for detecting replaced tab [addedTabId, removedTabId]");
                $log.info(addedTabId);
                $log.info(removedTabId);

                // 수동 새 탭 경우 Replaced부
                var value = $scope.newTabHash[removedTabId];
                if (value) {
                    $log.debug("It's Replaced New Tab. [value]");
                    $log.info(value);
                    var callback = function (tab) {
                        $log.debug("It's Replaced New Tab of CALLBACK. [tab]");
                        $log.info(tab);
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
                    $log.debug("It's Replaced by instant page not new Tab. [value]");
                    $log.info(value);
                    var callback = function (tab) {
                        $log.debug("It's Replaced by instant page of CALLBACK not new Tab. [tab]");
                        $log.info(tab);

                        var value = $scope.tabHash[removedTabId];

                        $log.info(value);

                        var replaceNode = $scope.replaceTabHash[tab.id];

                        $log.info(replaceNode);

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
                $log.debug("Fired the chrome.webNavigation.onCreatedNavigationTarget for detecting link tab [details]");
                $log.info(details);
                var value = $scope.tabHash[details.sourceTabId];
                //if (value) {
                //    $log.debug("It's clearly linked tab. [value]");
                //    $log.info(value);
                //    var callback = function (tab) {
                //        $log.debug("It's clearly linked tab of CALLBACK. [tab]");
                //        $log.info(tab);
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
                    $log.debug("It's new node from another node... probably child tab.");

                    // 해쉬 재조정
                    $scope.tabChildHash[value.tabId] = value;
                    $scope.newTabOpenerHash[value.tabId] = undefined;
                }
            });


            // 탭 변화 감지부
            chrome.webNavigation.onCommitted.addListener(function (details) {
                $log.debug("Fired the chrome.webNavigation.onCommitted for detecting changing tab [details]");
                $log.info(details);
                var value = $scope.tabHash[details.tabId];
                $log.info(value);
                if (!value) {
                    value = $scope.tabChildHash[details.tabId];
                    $log.info(value);
                }
                if (value) {
                    // 파생 판정
                    if (details.transitionType == "link") {
                        $log.debug("It's linked tab. [value]");
                        $log.info(value);

                        var callback = function (tab) {
                            var node = findTab(tab.id);
                            var value = node.node;
                            $log.debug("It's linked tab of CALLBACK. [tab]");
                            $log.info(tab);
                            $log.info(value);
                            $log.info(details.transitionQualifiers);
                            $log.info(searchStringInArray("client_redirect", details.transitionQualifiers));
                            // onCreatedNavigationTarget으로 생성된 자식 탭 로딩 부
                            if (value.state == "start") {
                                $log.debug("It's clearly linked tab's START in CALLBACK. [value]");
                                $log.info(value);
                                if (tab.title != tab.url || tab.title != '')
                                    value.title = tab.title;
                                value.url = tab.url;
                                value.favicon = tab.favIconUrl ? tab.favIconUrl : 'history.png';
                                value.state = "loading";
                            }
                            // 제자리 depth
                            else if (!details.url.match('http://section.blog.naver.com/main/DirectoryPostList.nhn')
                                && searchStringInArray("client_redirect", details.transitionQualifiers)) {
                                $log.debug("It's autoself refresh linked tab in CALLBACK. [value]");
                                $log.info(value);
                                if (tab.title != tab.url || tab.title != '')
                                    value.title = tab.title;
                                value.url = tab.url;
                                value.favicon = tab.favIconUrl ? tab.favIconUrl : 'history.png';
                                value.state = "complete"; // state가 loading이여도 후에 complete가 안일어나므로...
                            }
                            else if (node.hash == 'refreshBlogHash') {
                                $log.debug("It's specific blog redirect of Committed in CALLBACK......");
                                $log.info(value);
                                if (tab.title != tab.url || tab.title != '')
                                    value.title = tab.title;
                                value.url = tab.url;
                                value.favicon = tab.favIconUrl ? tab.favIconUrl : 'history.png';
                                value.state = "loading";

                                $scope.refreshBlogHash[node.node.tabId] = undefined;
                            }
                            else if (node.hash != 'tabChildHash' && node.node.url != "chrome://newtab/") { // 이렇게 되면 자신의 파생된 탭을 기억하는 값이라서 구분이 안된다.
                                // server_redirect 를 고려해야할듯
                                $log.debug("It's self linked tab's OLD&NEW in CALLBACK. [value]");
                                $log.info(value);

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
                                // [BreadCrumb]
                                //Com.getNodeId(newNode);
                                pushToTree(newNode);
                                $scope.tabHash[newNode.tabId] = newNode;
                            }
                            else if (node.hash == 'tabChildHash') {// server_redirect 를 고려해야할듯
                                $log.debug("It's tabChild in CALLBACK. so i change to tabHash [value]");
                                $log.info(value);

                                $scope.tabHash[node.node.tabId] = node.node;
                                $scope[node.hash][node.node.tabId] = undefined;
                            }

                            $log.debug("it's end???");

                            if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                $scope.$apply();
                            }
                        };
                        chrome.tabs.get(details.tabId, callback);
                    }
                    else if (details.transitionType == "auto_subframe") {
                        $log.debug("auto_subframe...");
                        // 아이콘이 히스토리로 남는다. 따로 빼서 관리해야할듯.
                        if (details.url.match("http://blog.naver.com/PostView.nhn")) {
                            $log.debug("refresh!!...");
                            $scope.refreshBlogHash[value.tabId] = value;
                            chrome.tabs.update(details.tabId, {'url': details.url});
                        }
                        //else if (details.url.match("http://blog.daum.net/_blog/BlogTypeView.do")) {
                        //    $log.debug("refresh!!...");
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
                            $log.debug("It's forawrd_back tab. [value]");
                            $log.info(value);

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
                            // [BreadCrumb]
                            //Com.getNodeId(newNode);
                            pushToTree(newNode);
                            $scope.tabHash[newNode.tabId] = newNode;
                        }
                    }
                    else if (details.transitionType == "form_submit") {
                        $log.info("form submit linked");
                        var callback = function (tab) {
                            $log.info("form submit linked CALLBACK");
                            $log.info(tab);
                            var value = $scope.tabHash[details.tabId];
                            var url = tab.url;
                            var result = parseURL(url);
                            $log.info(result);
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
                            // [BreadCrumb]
                            //Com.getNodeId(newNode);
                            pushToTree(newNode);
                            $scope.tabHash[newNode.tabId] = newNode;
                        }
                        chrome.tabs.get(details.tabId, callback);
                    }
                }

                value = $scope.newTabOpenerHash[details.tabId];
                if (value) {
                    $log.debug("It's new tab from another tab how?");

                    if (details.transitionType == "reload") {
                        $log.debug("It's reloading... probably copy tab.");

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
                    $log.debug("It's new tab from list in Committed!");

                }

                if (details.transitionType == "auto_bookmark") {
                    var value = findTab(details.tabId);

                    if (value) {
                        if (value.hash == "newTabHash") {
                            $scope[value.hash][value.node.tabId] = undefined;
                            $scope.tabHash[value.node.tabId] = value.node;
                        }
                        else if (value.hash != "newTabListHash") {
                            $log.debug("It's direct bookmark tab of OLD&NEW in CALLBACK. [value]");
                            $log.info(value);
                            var callback = function (tab) {
                                var node = findTab(tab.id);
                                var value = node.node;

                                $log.debug("It's direct bookmark tab of OLD&NEW of CALLBACK in CALLBACK. [tab]");
                                $log.info(tab);
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
                                // [BreadCrumb]
                                //Com.getNodeId(newNode);
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
                        $log.debug("It's direct tab of OLD&NEW in CALLBACK. [value]");
                        $log.info(value);
                        var callback = function (tab) {
                            var node = findTab(tab.id);
                            var value = node.node;

                            $log.debug("It's direct tab of OLD&NEW of CALLBACK in CALLBACK. [tab]");
                            $log.info(tab);
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
                            // [BreadCrumb]
                            //Com.getNodeId(newNode);
                            pushToTree(newNode);

                            if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                $scope.$apply();
                            }
                        };
                        chrome.tabs.get(details.tabId, callback);
                    }
                    else {
                        $log.debug("It's direct tab of OLD&NEW by instant page in CALLBACK. [value]");
                        $log.info(value);
                        var callback = function (tab) {
                            $log.debug("It's direct tab of OLD&NEW of CALLBACK by instant page in CALLBACK. [newNode]");

                            // Instant로 인해 prerendering이 된다면 탭을 가져올 수 없다. 나중에 Replace에서 처리해야함
                            var newNode = {
                                _id: addCount(),
                                parent: getCount(),
                                tabId: details.tabId
                            };

                            // [BreadCrumb]
                            //Com.getNodeId(newNode);

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
                $log.debug("Fired the chrome.tabs.onRemoved for making history or deleting new tab [tabId / target]");
                $log.info(tabId);
                var target = findTab(tabId);
                $log.info(target);

                if (target) {
                    if (target.hash == "newTabHash") {
                        $log.debug("It's new Tab. So I deleted this tab... [target]");
                        $log.info(target);
                        $scope.newTabHash[tabId] = undefined;
                        popFromTree(target.node);
                        target.node = undefined;
                    }
                    else if (target.node.state == "start") {
                        $log.debug("It's start tab. So I deleted this tab... [target]");
                        $log.info(target);
                        $scope[target.hash][tabId] = undefined;
                        popFromTree(target.node);
                        target.node = undefined;
                    }
                    else {
                        $log.debug("It's old Tab. So I made this tab hitorized... [target]");
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
                function (request, sender, sendResponse) {
                    $log.debug("Fired the chrome.runtime.onMessage for scraping [request / sender]");
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
                                if (!url.match(words[j])) {
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
                            // [Breadcrumb]
                            //saveBodyToNode(false);
                        }
                        else {
                            //saveBodyToNode(true);
                        }
                    };

                    var saveBodyToNode = function (block) {
                        $log.debug("It's scrapped data from list. [request.data / sender.tab]");
                        //$log.info(request.data);
                        $log.info(sender.tab);

                        $scope.$apply(function () {
                            var target = findTab(sender.tab.id);

                            if (target) {
                                $log.debug("Success saved body in node [target]");
                                $log.info(target);

                                var url = target.node.url;
                                var result = parseURL(url);
                                $log.info(result);
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

                                console.log(target.node);
                                if (!target.node.keyword) {
                                    console.log("attached body");
                                    target.node.body = request.data;
                                }
                                else {
                                    console.log(target.node.keyword);

                                }

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
                                $log.error("Error saved body in node [sender]");
                                $log.info(sender);
                            }
                        });

                        sendResponse({message: "I've finished to receive your data."});
                    }

                    if (request.data && sender.tab) {
                        // [Breadcrumb]
                        //checkBlacklist(sender.tab.url);
                    }
                }
            );
        };

        // Local Init
        // [Breadcrumb]
        $scope.mainCallback();
        //Com.setMainCallback($scope.mainCallback);
    }
}) ();