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
        ['git', function (git) {
            var onAdd = function () {
                console.log('add');
                console.dir(arguments);
            };

            git.init(onAdd, null, function () {
                console.log('callback');
                console.dir(arguments);
            });
        }]);

    exports.codulatorApp = codulatorApp;
    exports.codulatorControllers = codulatorControllers;
})(window.angular, window);