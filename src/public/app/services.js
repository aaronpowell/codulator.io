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

    var isText = /(?:\.(?:markdown|md|txt|html|svg|xml|yml)|^(?:LICENSE|README|\.gitignore|\.gitattributes))$/i;

    var isImage = /\.(?:png|jpg|jpeg|gif)$/i;

    angular.module('git', [])
        .factory('git', ['$window', '$q', function ($window, $q) {
            var git = $window.git;

            function walkPath(tree, fileName, blobHash, repo) {
                var d = $q.defer();

                factory.getTree(repo, tree).then(onTree);

                function onTree(tree) {
                    //var entry = findByName(tree, fileName);

                    var entry;
                    var folders = [];

                    for (var i = 0; i < tree.length; i++) {
                        if (tree[i].name === fileName) {
                            entry = tree[i];
                            continue;
                        }

                        if (tree[i].type == 'folder') {
                            folders.push(tree[i]);
                        }
                    };

                    // return undefined for not-found errors
                    if (!entry) {
                        if (folders.length) {
                            var promises = folders.map(function (folder) {
                                    return walkPath(folder.hash, fileName, blobHash, repo);
                                });
                            $q.all(promises).then(function (values) {
                                d.resolve(values[0]);
                            }, function () {
                                d.reject();
                            });
                            return;
                        } else {
                            d.resolve();
                            return;
                        }
                    }
                    // If there are still segments left, keep reading tree paths
                    //if (names.length) 
                    //    return factory.getTree(entry.hash).then(onTree);
                    
                    // Otherwise, load and return the blob
                    factory.getBlob(repo, entry.hash).then(function (contents) {
                        d.resolve({
                            name: fileName,
                            contents: contents,
                            hash: entry.hash
                        });
                    }, d.reject);
                }

                return d.promise;
            }

            function findByName(tree, name) {
                for (var i = 0, l = tree.length; i < l; i++) {
                    var entry = tree[i];
                    if (entry.name === name) return entry;
                }
            }

            function cleanPath(name) {
                return name && name !== ".";
            }

            var factory = {
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

                    var readLog = function (err, stream) {
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
                    };

                    if (!startHash) {
                        repo.getHead(function (err, head) {
                            if (err) {
                                return d.reject(err);
                            }

                            if (!head) {
                                repo.fetch(repo.remote, {}, function (err) {
                                    if (err) {
                                        return d.reject(err);
                                    }

                                    repo.logWalk(startHash || 'HEAD', readLog);
                                })
                            } else {
                                repo.logWalk(startHash || 'HEAD', readLog);
                            }
                        });
                    }

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
                },
                add: function (name, url, desc) {
                    var d = $q.defer();

                    git.add({
                        name: name,
                        url: url,
                        description: desc
                    }, function (err, repo) {
                        if (err) {
                            d.reject(err);
                            return;
                        }
                        d.resolve(repo);
                    });

                    return d.promise;
                },
                findPrev: function (repo, commitHash, blobHash, blobName) {
                    var d = $q.defer();

                    var log; // The log stream
                    var currentBlob; // The current value of the blob
                    var oldBlob; // The last value of the blob
                    var changeCommit; // The commit that made the last change to the blob
                    var oldCommit; // The previous commit

                    // First get the log stream
                    repo.logWalk(commitHash, onLog);

                    function onLog(err, result) {
                        if (err) {
                            d.reject(err);
                            return
                        }
                        log = result;
                        // Read the current commit
                        log.read(onCurrentCommit);
                    }

                    function onCurrentCommit(err, result) {
                        if (err) {
                            d.reject(err);
                            return;
                        }
                        changeCommit = result;
                        // Find the file by path in the current commit
                        walkPath(changeCommit.tree, blobName, blobHash, repo).then(onCurrentBlob, d.reject);
                    }

                    function onCurrentBlob(result) {
                        currentBlob = result;
                        // Start our search loop looking for a change in the next commit
                        log.read(onCommit);
                    }

                    function onCommit(err, result) {
                        if (err) {
                            d.reject(err);
                            return;
                        }
                        oldCommit = result;
                        if (oldCommit === undefined) {
                            // We've reached the beginning of history, this was created in the initial commit
                            return d.resolve({
                                oldBlob: undefined,
                                currentBlob: currentBlob,
                                changeCommit: changeCommit
                            });
                        }
                        walkPath(oldCommit.tree, blobName, blobHash, repo).then(onBlob, d.reject);
                    }

                    function onBlob(result) {
                        oldBlob = result;
                        if ((oldBlob && oldBlob.hash) !== currentBlob.hash) {
                            return d.resolve({
                                oldBlob: oldBlob,
                                currentBlob: currentBlob,
                                changeCommit: changeCommit
                            });
                        }
                        changeCommit = oldCommit;
                        log.read(onCommit);
                    }

                    return d.promise;
                }
            };

            return factory;
        }]);
})(window.angular);