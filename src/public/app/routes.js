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
                }).when('repo/:id', {
                   templateUrl: 'partials/repo-overview.html',
                   controller: 'RepositoryOverview' 
                });
        }
    ]);

    var codulatorControllers = angular.module('codulatorControllers', ['git']);

    codulatorControllers.controller('RepositoryListCtrl',
        ['$scope', 'git', function ($scope, git) {
            var repos = git.repoList();
            $scope.repos = repos;
        }]
    ).controller('RepositoryOverview', ['$scope', '$routeParams',
        function ($scope, $routeParams) {
            var id = $routeParams.id;
        }]
    );

    exports.codulatorApp = codulatorApp;
    exports.codulatorControllers = codulatorControllers;
})(window.angular, window);