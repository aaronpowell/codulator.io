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

                        var logs = [];

                        repo.logWalk('HEAD', function (err, stream) {
                            stream.read(function walker(err, log) {
                                if (err) {
                                    return d.reject(err);
                                }
                                if (log) {
                                    logs.push(log);
                                    return stream.read(walker);
                                }

                                d.resolve({
                                    name: repo.name,
                                    logs: logs
                                });
                            });
                        });
                    });

                    return d.promise;
                }
            };
        }]);
})(window.angular);