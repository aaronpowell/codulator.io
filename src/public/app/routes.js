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
                });
        }
    ]);

    var codulatorControllers = angular.module('codulatorControllers', ['git']);

    var RepositoryListCtrl = codulatorControllers.controller(
        'RepositoryListCtrl',
        ['$scope', 'git', function ($scope, git) {
            var repos = git.repoList();

            $scope.repos = repos;
        }]);

    exports.codulatorApp = codulatorApp;
    exports.codulatorControllers = codulatorControllers;
})(window.angular, window);