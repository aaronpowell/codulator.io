var T = require('tim-task');
var path = require('path');

exports.run = function () {
    var name = 'build-' + Math.random();
    T(name, T.build('src/app/web.js', 'src/build/git.js'));

    T.run(name, function (err) {
        if (err) {
            console.error(err.stack || err);
            process.exit(-1);
        }
    });
};

exports.watch = function () {
    var fs = require('fs');

    fs.watch('src/app', function (event, filename) {
        if (event === 'change' && filename && path.extname(filename) === '.js') {
            exports.run();
        }
    });
    exports.run();
};