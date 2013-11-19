(function (angular) {
    'use strict';

    angular.module('git', [])
        .factory('git', ['$window', '$q', function ($window, $q) {
            var git = $window.git;

            return {
                repoList: function () {
                    var d = $q.defer();
                    git.init(function () {
                        git.getAll(function (repos) {
                            d.resolve(repos);
                        });
                    });
                    return d.promise;
                },
                get: function (index) {
                    var d = $q.defer();

                    git.get(index, function (err, repo) {
                        if (err) {
                            return d.reject(err);
                        }

                        d.resolve(repo);
                    });

                    return d.promise;
                },
                getLog: function (repo, limit, startHash) {
                    var d = $q.defer();
                    var logs = [];
                    var depth = 0;

                    repo.logWalk(startHash || 'HEAD', function (err, stream) {
                        stream.read(function walker(err, log) {
                            if (err) {
                                return d.reject(err);
                            }
                            if (log && limit && depth < limit) {
                                logs.push(log);
                                depth++;
                                return stream.read(walker);
                            }

                            d.resolve({
                                logs: logs,
                                mightHaveMore: !!log
                            });
                        });
                    });
                    return d.promise;
                }
            };
        }]);
})(window.angular);