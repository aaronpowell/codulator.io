module.exports = function (git) {
  'use strict';
  var metas = [];
  var dirty;
  var inited = false;

  return {
    settings: git.settings,
    add: function (meta, callback) {
      for (var i = 0, l = metas.length; i < l; ++i) {
        if (metas[i].name === meta.name) {
          return callback(new Error(meta.name + " name already taken."));
        }
      }
      addRepo(meta, function (err, repo) {
        if (err) return callback(err);
        saveMeta();
        return callback(null, repo);
      });
    },
    remove: function (repo, callback) {
      var meta;
      for (var i = 0, l = metas.length; i < l; ++i) {
        meta = metas[i];
        if (meta.name === repo.name) break;
      }
      if (i >= l) {
        return callback(new Error("Unknown repo name " + repo.name));
      }
      metas.splice(i, 1);
      saveMeta();
      repo.clear(function (err) {
        if (err) return callback(err);
        saveMeta();
        onRemove(meta, i);
        return callback(null, meta);
      });
    },
    init: function (callback) {
      metas = git.settings.get("metas") || [];
      inited = true;
      setImmediate(callback);
    },
    getAll: function (callback) {
      if (!inited) {
        return this.init(map);
      }

      return callback(function map() {
        return metas.map(function (meta, i) {
          return {
            index: i,
            name: meta.name,
            description: meta.description || meta.name,
            url: meta.url
          };
        });
      });
    },
    get: function (index, callback) {
      if (!inited) {
        return this.init(this.get.bind(null, index, callback));
      }

      var meta = metas[index];
      addRepo(meta, callback);
    }
  };

  function addRepo(meta, callback) {
    var db = git.db(meta.name);
    var repo = git.repo(db);
    repo.clear = db.clear;
    var index = metas.length;
    metas[index] = meta;
    repo.remote = git.remote(meta.url);
    repo.name = meta.name;
    repo.url = meta.url;
    repo.description = meta.description || meta.url;
    db.init(function (err) {
      if (err) return callback(err);
      return callback(null, repo);
    });
  }

  function saveMeta() {
    if (dirty) return;
    // Use dirty flag and setImmediate to coalesce many saves in a single tick.
    dirty = true;
    setImmediate(function () {
      dirty = false;
      git.settings.set("metas", metas);
    });
  }

};
