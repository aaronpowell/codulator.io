(function (angular) {
    'use strict';

    angular.module('shared', [])
        .filter('hash', function () {
            return md5;
        }).filter('glyph', function () {
            return function (input) {
                var base = 'glyphicon-'
                switch (input) {
                    case 'folder':
                        base += 'folder-close';
                        break;
                    case 'image':
                        base += 'picture';
                        break;
                    default:
                        base += 'file';
                        break;
                }
                return base;
            };
        });
})(window.angular);