/**
 * Created by ChzMo on 2015-02-18.
 */

(function() {
    "use strict";

    angular
        .module('histree')
        .factory('Com', Com);

    Com.$inject = ['$http', 'baseUrl'];

    function Com($http, baseUrl) {
        var treeData = [];
        var mainCallback;

        var service = {
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
        };

        return service;
        ///////////////////////////

        function convertToServer(node) {
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
        }


        function convertToClient(sNode, node) {
            if (!node) {
                alert("source node is empty.");
                return undefined;
            }

            var child;
            for (child in node.children) {
                child.parent = node._id;
            }

            if (sNode.parent && node.parent != sNode.parent) {
                alert("not match source and sNode!!");

            }

            node.title = sNode.title;
            node.url = sNode.url;
            if (!node.keyword)
                node.keyword = sNode.keyword ? sNode.keyword : ":block";

            return node;
        }


        function requestNodeId(node) {
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
                    //sendNode(node);
                }
                else {
                    alert('to get node Id from server success but unknown behavior.');
                    console.log(JSON.stringify(data));
                }
            });


            reqPromise.error(function (data, status, headers, config) {
                console.log('to get node Id from server error :' + status);

                if (status == 404) {
                    // TODO: Error 404 Implement
                }
                else if (status == 422) {
                    // TODO: Error 422 Implement and Check code
                }
                else {
                    console.log('to get node Id from server unknown error : ' + status);
                }

                console.log(JSON.stringify(data));
            });

            return node;
        }


        function sendNode(node) {
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
                    if (!convertToClient(sNodeData, node)) {
                        alert("to convert to client node error.");

                    }


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
        }


        function shiftNode(nodeId, pnodeId, index) {
            // Error process
            if (!nodeId) {
                alert("to shift node data to server error");
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
        }


        function deleteNode(nodeId) {
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
        }


        function requestTree(token) {
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
                    var nodes = data.data.data;

                    var parseURL = function (url) {
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
                    };

                    var recursiveMark = function (Nodes) {
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

                            if (Nodes[i].children && Nodes[i].children.length > 0)
                                recursiveMark(Nodes[i].children);
                        }
                    };

                    recursiveMark(nodes);

                    var i;
                    for (i = 0; i < nodes.length; i++) {
                        treeData.push(nodes[i]);
                    }

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
        }
    }
}) ();