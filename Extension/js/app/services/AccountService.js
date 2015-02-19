/**
 * Created by ChzMo on 2015-02-19.
 */

(function() {
    "use strict";

    angular
        .module('histree')
        .factory('accountService', accountService);

    accountService.$inject = ['$http', '$q', 'baseUrl', 'Com'];

    function accountService($http, $q, baseUrl) {
        var userInfo = {
            token: null,
            user: null
        };

        var service = {
            login: login,
            signUp: signUp
        };

        return service;

        ///////////////////////

        function login(account) {
            var reqConfig = {
                method: 'POST',
                url: baseUrl + 'auth/local',
                data: account
            };


            return $http(reqConfig)
                .then(loginComplete)
                .catch(loginFailed);

            ///////////////////////////

            function loginComplete(response) {
                var loginInfo = {
                    'token': response.data.token,
                    'user': response.data.user
                };

                chrome.storage.local.set(loginInfo);

                if (response.status == 201) {
                    console.log("Success to login server");
                }
                else {
                    console.log('to login account to server success but unknown behavior.');
                    console.log(JSON.stringify(data));
                }


                return loginInfo;
            }


            function loginFailed(error) {
                console.log('to login account to server error');
                console.log(account);
                console.log(JSON.stringify(error.data));

                return $q.reject();
            }
        }


        function signUp(account) {
            var reqConfig = {
                method: 'POST',
                url: baseUrl + 'api/users',
                data: account
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
                console.log(account);
                console.log(JSON.stringify(error.data));

                return $q.reject();
            }
        }
    }
}) ();