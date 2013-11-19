(function (angular) {
    'use strict';

    angular.module('shared', [])
        .filter('hash', function () {
            return md5;
        });
})(window.angular);