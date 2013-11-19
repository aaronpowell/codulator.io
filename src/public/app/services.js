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
                getLog: function (repo, limit) {
                    var d = $q.defer();
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

                            d.resolve(logs);
                        });
                    });
                    return d.promise;
                }
            };
        }]);
})(window.angular);