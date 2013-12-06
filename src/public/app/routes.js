(function (angular, exports) {
    'use strict';

    var codulatorApp = angular.module('codulatorApp', [
        'ngRoute',
        'codulatorControllers',
        'shared',
        'ui.codemirror',
        'ui.codemirror-merge'
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
                }).when('/add', {
                    templateUrl: 'partials/add.html',
                    controller: 'AddRepoCtrl'
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
        var currentRepo;

        $scope.id = $routeParams.id;

        $scope.cmOption = {
            lineNumbers: true,
            indentWithTabs: true
        };

        $scope.cmMergeOption = {
            lineNumbers: true,
            indentWithTabs: true,
            highlightDifferences: true
        };

        $scope.load = function (blob) {
            if (blob.type === 'folder') {
                git.getTree(currentRepo, blob.hash).then(function (tree) {
                    blob.tree = tree;
                });
            } else {
                $scope.currentBlob = {
                    name: blob.name,
                    hash: blob.hash
                };
                $scope.mergeMode = false;
                git.getBlob(currentRepo, blob.hash).then(function (contents) {
                    $scope.currentBlob.contents = contents;
                });
            }
        };

        $scope.diff = function (blob) {
            var diffType = $scope.diffType;
            $scope.mergeMode = true;
            git.findPrev(currentRepo, hash, blob.hash, blob.name).then(function (diff) {
                var prev = diff.oldBlob;

                $scope.cmMergeOption.value = $scope.currentBlob.contents;
                $scope.cmMergeOption.orig = prev.contents;
            }, function (err) {
                console.error(err);
            });
        };

        git.get($scope.id).then(function (repo) {
            $scope.name = repo.name;
            $scope.hash = hash;

            currentRepo = repo;

            git.getCommitTree(repo, hash).then(function (tree) {
                $scope.tree = tree;
            });
        })
    }])
    .controller('AddRepoCtrl', ['git', '$scope', '$location', function (git, $scope, $location) {
        $scope.url = '';
        $scope.name = '';
        $scope.desc = '';

        $scope.save = function () {
            git.add($scope.name, $scope.url, $scope.desc).then(function (repo) {
                $location.path('/');
            });
        };
    }]);
})(window.angular, window);