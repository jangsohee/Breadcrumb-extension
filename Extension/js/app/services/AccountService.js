/**
 * Created by ChzMo on 2015-02-19.
 */

(function() {
    "use strict";

    angular
        .module('histree')
        .factory('account', account);

    account.$inject = ['$http', '$q', 'baseUrl'];

    function account($http, $q, baseUrl) {
        var userInfo = {
            token: null
            //nickname: null
        };

        var service = {
            login: login,
            logout: logout,
            signUp: signUp,
            setUserInfo: setUserInfo,
            getUserInfo: getUserInfo,
            clearUserInfo: clearUserInfo
        };

        return service;

        ///////////////////////

        function login(accountInfo) {
            var reqConfig = {
                method: 'POST',
                url: baseUrl + 'auth/local',
                data: accountInfo
            };


            return $http(reqConfig)
                .then(loginComplete)
                .catch(loginFailed);

            ///////////////////////////

            function loginComplete(response) {
                var loginInfo = {
                    token: response.data.token
                    //nickname: response.data.nickname
                };

                if (response.status == 201) {
                    console.log("Success to login server");
                }
                else {
                    console.log('to login account to server success but unknown behavior.');
                    console.log(JSON.stringify(response.data));
                }


                return setUserInfo(loginInfo);
            }


            function loginFailed(error) {
                console.log('to login account to server error');
                console.log(accountInfo);
                console.log(JSON.stringify(error.data));

                return $q.reject();
            }
        }


        function logout() {
            clearUserInfo();
        }


        function signUp(accountInfo) {
            var reqConfig = {
                method: 'POST',
                url: baseUrl + 'api/users',
                data: accountInfo
            };


            return $http(reqConfig)
                .then(signUpComplete)
                .catch(signUpFailed);

            //////////////////////////////////

            function signUpComplete(response) {
                console.log("Sign up is finished.");

                if (response.status != 201) {
                    console.log('to sign up account to server success but unknown behavior.');
                    console.log(JSON.stringify(response.data));
                }


                return response.data.token;
            }


            function signUpFailed(error) {
                // TODO: Explain about incorrect values
                console.log('to sign up account to server error');
                console.log(accountInfo);
                console.log(JSON.stringify(error.data));

                return $q.reject();
            }
        }


        function setUserInfo(inUserInfo) {
            if (inUserInfo.token) {
                userInfo.token = inUserInfo.token;
                ///Please add check routine to if statement
                //userInfo.nickname = inUserInfo.nickname;

                chrome.storage.local.set(userInfo);


                return userInfo;
            }

            return false;
        }


        function getUserInfo() {
            if (!userInfo.token) {
                chrome.storage.local.get(['token'], function (items) {
                    if (items && items.token) {
                        userInfo.token = items.token;
                        //userInfo.nickname = items.nickname;
                    }
                    else {
                        userInfo.token = null;
                        //userInfo.nickname = null;
                    }
                });
            }


            return userInfo;
        }


        function clearUserInfo() {
            userInfo.token = null;
            //userInfo.nickname = null;

            chrome.storage.local.remove('token');
            //chrome.storage.local.remove('nickname');
        }
    }
}) ();