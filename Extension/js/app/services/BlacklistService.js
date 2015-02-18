/**
 * Created by ChzMo on 2015-02-18.
 */

(function () {
    "use strict";

    angular
        .module('histree')
        .factory('Blacklist', Blacklist);

    Blacklist.$inject = [ 'defaultBlacklist' ];

    function Blacklist(defaultBlacklist) {
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

        var service = {
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

        return service;
        /////////////////////////////////

        function stringfy(arr) {
            var stringSet;
            stringSet = arr.join(', ');
            return stringSet;
        }


        function arrayfy(str) {
            var arraySet = str.split(',');
            angular.forEach(arraySet, function (value, key) {
                this[key] = this[key].trim();
            }, arraySet);

            return arraySet;
        }
    }
}) ();