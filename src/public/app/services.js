(function (angular) {
    'use strict';

    angular.module('git', [])
        .factory('git', ['$window', '$q', function ($window, $q) {
            var git = $window.git;

            return {
                repoList: function () {
                    var d = $q.defer();
                    git.init(function () {
                        git.getAll(d.resolve);
                    });
                    return d.promise;
                },
                get: function (index) {
                    var d = $q.defer();

                    git.get(index, function (err, repo) {
                        if (err) {
                            return d.reject(err);
                        }
                        
                        return d.resolve(repo);
                    });

                    return d.promise;
                }
            };
        }]);
})(window.angular);