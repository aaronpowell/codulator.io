(function (angular) {
    'use strict';

    // Patterns for different language mode names.
    var modes = {
      javascript: /\.(?:js|json|webapp)$/i,
      css: /\.(?:css|less)$/i,
      // markup: /\.(?:xml|html|svg)$/i,
      bash: /\.sh$/i,
      c: /\.(?:h|c)$/i,
      cpp: /\.(?:cpp|cxx|hxx|h)$/i,
      coffeescript: /\.(?:cs|coffee)$/i,
      jade: /\.jade$/i
    };

    var isText = /(?:\.(?:markdown|md|txt|html|svg|xml|yml)|^(?:LICENSE|README|\.gitignore))$/i;

    var isImage = /\.(?:png|jpg|jpeg|gif)$/i;

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
                getLog: function (repo, limit, startHash) {
                    var d = $q.defer();
                    var logs = [];
                    var depth = 0;

                    repo.logWalk(startHash || 'HEAD', function (err, stream) {
                        stream.read(function walker(err, log) {
                            if (err) {
                                return d.reject(err);
                            }
                            if (log && limit && depth < limit) {
                                logs.push(log);
                                depth++;
                                return stream.read(walker);
                            }

                            d.resolve({
                                logs: logs,
                                mightHaveMore: !!log
                            });
                        });
                    });
                    return d.promise;
                },
                getCommitTree: function (repo, commitHash) {
                    var d = $q.defer();
                    var that = this;

                    repo.loadAs('commit', commitHash, function (err, commit) {
                        that.getTree(repo, commit.tree).then(d.resolve);
                    });

                    return d.promise;
                },
                getTree: function (repo, treeHash) {
                    var d = $q.defer();

                    repo.loadAs('tree', treeHash, function (err, blobs) {
                        blobs = blobs.map(function (blob) {
                            blob.type = 'folder';
                            if (isImage.test(blob.name)) {
                                blob.type = 'image';
                            } else if (isText.test(blob.name)) {
                                blob.type = 'text';
                            } else {
                                Object.keys(modes).forEach(function (key) {
                                    if (modes[key].test(blob.name)) {
                                        blob.type = key;
                                    }
                                });
                            }
                            return blob;
                        });

                        d.resolve(blobs);
                    });

                    return d.promise;
                },
                getBlob: function (repo, blobHash) {
                    var d = $q.defer();

                    repo.loadAs('blob', blobHash, function (err, blob) {
                        if (err) {
                            d.reject(err);
                            return;
                        }

                        var code = "";
                        for (var i = 0, l = blob.length; i < l; ++i) {
                            code += String.fromCharCode(blob[i]);
                        }

                        d.resolve(code);
                    });

                    return d.promise;
                }
            };
        }]);
})(window.angular);