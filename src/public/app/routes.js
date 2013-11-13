(function (angular, exports) {
    'use strict';

    var codulatorApp = angular.module('codulatorApp', [
        'ngRoute',
        'codulatorControllers'
    ]);

    codulatorApp.config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: 'partials/repo-list.html',
                    controller: 'RepositoryListCtrl'
                });
        }
    ]);

    var codulatorControllers = angular.module('codulatorControllers', []);

    exports.codulatorApp = codulatorApp;
    exports.codulatorControllers = codulatorControllers;
})(window.angular, window);