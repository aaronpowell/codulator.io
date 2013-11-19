(function (angular, exports) {
    'use strict';

    var codulatorApp = angular.module('codulatorApp', [
        'ngRoute',
        'codulatorControllers',
        'shared'
    ]);

    codulatorApp.config(['$routeProvider', '$controllerProvider',
        function ($routeProvider, $controllerProvider) {
            codulatorApp.controllerProvider = $controllerProvider;

            $routeProvider
                .when('/', {
                    templateUrl: 'partials/repo-list.html',
                    controller: 'RepositoryListCtrl'
                }).when('/repo/:id', {
                   templateUrl: 'partials/repo-overview.html',
                   controller: 'RepositoryOverviewCtrl' 
                }).when('/repo/:id/:hash', {
                    templateUrl: 'partials/commit-viewer.html',
                    controller: 'CommitViewCtrl'
                }).otherwise({
                    redirectTo: '/'
                });
        }
    ]);

    var codulatorControllers = angular.module('codulatorControllers', ['git']);

    codulatorControllers.controller('RepositoryListCtrl',
        ['$scope', 'git', function ($scope, git) {
            git.repoList().then(function (repos) {
                $scope.repos = repos;
            });
        }]
    ).controller('RepositoryOverviewCtrl', ['$scope', '$routeParams', 'git',
        function ($scope, $routeParams, git) {
            var id = $routeParams.id;
            var currRepo;

            $scope.id = id;

            $scope.hightlightParent = function () {
                var hash = this.parent;
                $scope.logs.forEach(function (log) {
                    log.focus = log.hash === hash;
                });
            };

            $scope.loadMore = function () {
                git.getLog(currRepo, 10, $scope.logs[$scope.logs.length - 1].hash).then(function (result) {
                    result.logs.slice(1).forEach(function (log) {
                        $scope.logs.push(log);
                    });
                    $scope.hasMore = result.mightHaveMore;
                });
            };

            git.get(id).then(function (repo) {
                currRepo = repo;
                $scope.name = repo.name;
                git.getLog(repo, 10).then(function (result) {
                    $scope.logs = result.logs;
                    $scope.hasMore = result.mightHaveMore;
                });
            });
        }]
    ).controller('CommitViewCtrl', ['git', '$scope', '$routeParams', function (git, $scope, $routeParams) {
        var hash = $routeParams.hash;

        $scope.id = $routeParams.id;

        $scope.load = function (blob) {
            console.dir(blob);
        };

        git.get($scope.id).then(function (repo) {
            $scope.name = repo.name;
            $scope.hash = hash;

            git.getCommitTree(repo, hash).then(function (tree) {
                $scope.tree = tree;
            });
        })
    }]);
})(window.angular, window);