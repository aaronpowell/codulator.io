(function (angular) {
    'use strict';

    angular.module('git', [])
        .factory('git', ['$window', '$q', function ($window, $q) {
            var git = $window.git;

            return {
                repoList: function () {
                    var metas = git.settings.get("metas");
                    if (!metas) {
                        return [];
                    }
                    return metas;
                }
            };
        }]);
})(window.angular);