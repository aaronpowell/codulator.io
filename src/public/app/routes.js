(function (angular, exports) {
    'use strict';

    var codulatorApp = angular.module('codulatorApp', [
        'ngRoute',
        'codulatorControllers'
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

            $scope.id = id;

            git.get(id).then(function (repo) {
                $scope.name = repo.name;
                git.getLog(repo).then(function (logs) {
                    $scope.logs = logs
                });
            });
        }]
    );
})(window.angular, window);