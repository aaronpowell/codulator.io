(function (angular) {
    'use strict';

    angular.module('git', [])
        .factory('git', ['$window', function ($window) {
            return $window.git;
        }])
        .factory('repo', ['git', function (git) {
            return git.repo;
        }]);
})(window.angular);