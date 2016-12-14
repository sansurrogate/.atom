(function() {
  var $$, ListView, OutputViewManager, PullBranchListView, SelectListView, _pull, experimentalFeaturesEnabled, git, notifier, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  git = require('../git');

  _pull = require('../models/_pull');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  PullBranchListView = require('./pull-branch-list-view');

  experimentalFeaturesEnabled = function() {
    var gitPlus;
    gitPlus = atom.config.get('git-plus');
    return gitPlus.alwaysPullFromUpstream && gitPlus.experimental;
  };

  module.exports = ListView = (function(superClass) {
    extend(ListView, superClass);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.initialize = function(repo, data1, arg1) {
      var ref1;
      this.repo = repo;
      this.data = data1;
      ref1 = arg1 != null ? arg1 : {}, this.mode = ref1.mode, this.tag = ref1.tag, this.extraArgs = ref1.extraArgs;
      ListView.__super__.initialize.apply(this, arguments);
      if (this.tag == null) {
        this.tag = '';
      }
      if (this.extraArgs == null) {
        this.extraArgs = [];
      }
      this.show();
      this.parseData();
      return this.result = new Promise((function(_this) {
        return function(resolve, reject) {
          _this.resolve = resolve;
          _this.reject = reject;
        };
      })(this));
    };

    ListView.prototype.parseData = function() {
      var items, remotes;
      items = this.data.split("\n");
      remotes = items.filter(function(item) {
        return item !== '';
      }).map(function(item) {
        return {
          name: item
        };
      });
      if (remotes.length === 1) {
        return this.confirmed(remotes[0]);
      } else {
        this.setItems(remotes);
        return this.focusFilterEditor();
      }
    };

    ListView.prototype.getFilterKey = function() {
      return 'name';
    };

    ListView.prototype.show = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.storeFocusedElement();
    };

    ListView.prototype.cancelled = function() {
      return this.hide();
    };

    ListView.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.destroy() : void 0;
    };

    ListView.prototype.viewForItem = function(arg1) {
      var name;
      name = arg1.name;
      return $$(function() {
        return this.li(name);
      });
    };

    ListView.prototype.pull = function(remoteName) {
      if (experimentalFeaturesEnabled()) {
        return _pull(this.repo, {
          extraArgs: [this.extraArgs]
        });
      } else {
        return git.cmd(['branch', '-r'], {
          cwd: this.repo.getWorkingDirectory()
        }).then((function(_this) {
          return function(data) {
            return new PullBranchListView(_this.repo, data, remoteName, _this.extraArgs).result;
          };
        })(this));
      }
    };

    ListView.prototype.confirmed = function(arg1) {
      var name, pullOption;
      name = arg1.name;
      if (this.mode === 'pull') {
        this.pull(name);
      } else if (this.mode === 'fetch-prune') {
        this.mode = 'fetch';
        this.execute(name, '--prune');
      } else if (this.mode === 'push') {
        pullOption = atom.config.get('git-plus.pullBeforePush');
        this.extraArgs = (pullOption != null ? pullOption.includes('--rebase') : void 0) ? '--rebase' : '';
        if (!((pullOption != null) && pullOption === 'no')) {
          this.pull(name).then((function(_this) {
            return function() {
              return _this.execute(name);
            };
          })(this));
        } else {
          this.execute(name);
        }
      } else if (this.mode === 'push -u') {
        this.pushAndSetUpstream(name);
      } else {
        this.execute(name);
      }
      return this.cancel();
    };

    ListView.prototype.execute = function(remote, extraArgs) {
      var args, message, startMessage, view;
      if (remote == null) {
        remote = '';
      }
      if (extraArgs == null) {
        extraArgs = '';
      }
      view = OutputViewManager.create();
      args = [this.mode];
      if (extraArgs.length > 0) {
        args.push(extraArgs);
      }
      args = args.concat([remote, this.tag]).filter(function(arg) {
        return arg !== '';
      });
      message = (this.mode[0].toUpperCase() + this.mode.substring(1)) + "ing...";
      startMessage = notifier.addInfo(message, {
        dismissable: true
      });
      return git.cmd(args, {
        cwd: this.repo.getWorkingDirectory()
      }, {
        color: true
      }).then(function(data) {
        if (data !== '') {
          view.setContent(data).finish();
        }
        return startMessage.dismiss();
      })["catch"]((function(_this) {
        return function(data) {
          if (data !== '') {
            view.setContent(data).finish();
          }
          return startMessage.dismiss();
        };
      })(this));
    };

    ListView.prototype.pushAndSetUpstream = function(remote) {
      var args, message, startMessage, view;
      if (remote == null) {
        remote = '';
      }
      view = OutputViewManager.create();
      args = ['push', '-u', remote, 'HEAD'].filter(function(arg) {
        return arg !== '';
      });
      message = "Pushing...";
      startMessage = notifier.addInfo(message, {
        dismissable: true
      });
      return git.cmd(args, {
        cwd: this.repo.getWorkingDirectory()
      }, {
        color: true
      }).then(function(data) {
        if (data !== '') {
          view.setContent(data).finish();
        }
        return startMessage.dismiss();
      })["catch"]((function(_this) {
        return function(data) {
          if (data !== '') {
            view.setContent(data).finish();
          }
          return startMessage.dismiss();
        };
      })(this));
    };

    return ListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvdmlld3MvcmVtb3RlLWxpc3Qtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDJIQUFBO0lBQUE7OztFQUFBLE1BQXVCLE9BQUEsQ0FBUSxzQkFBUixDQUF2QixFQUFDLFdBQUQsRUFBSzs7RUFFTCxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sS0FBQSxHQUFRLE9BQUEsQ0FBUSxpQkFBUjs7RUFDUixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSOztFQUNwQixrQkFBQSxHQUFxQixPQUFBLENBQVEseUJBQVI7O0VBRXJCLDJCQUFBLEdBQThCLFNBQUE7QUFDNUIsUUFBQTtJQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsVUFBaEI7V0FDVixPQUFPLENBQUMsc0JBQVIsSUFBbUMsT0FBTyxDQUFDO0VBRmY7O0VBSTlCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7dUJBQ0osVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFRLEtBQVIsRUFBZSxJQUFmO0FBQ1YsVUFBQTtNQURXLElBQUMsQ0FBQSxPQUFEO01BQU8sSUFBQyxDQUFBLE9BQUQ7NEJBQU8sT0FBMEIsSUFBekIsSUFBQyxDQUFBLFlBQUEsTUFBTSxJQUFDLENBQUEsV0FBQSxLQUFLLElBQUMsQ0FBQSxpQkFBQTtNQUN4QywwQ0FBQSxTQUFBOztRQUNBLElBQUMsQ0FBQSxNQUFPOzs7UUFDUixJQUFDLENBQUEsWUFBYTs7TUFDZCxJQUFDLENBQUEsSUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxPQUFBLENBQVEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQs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QU8sSUFBUjtPQUFoRCxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsSUFBRDtRQUNKLElBQUcsSUFBQSxLQUFVLEVBQWI7VUFDRSxJQUFJLENBQUMsVUFBTCxDQUFnQixJQUFoQixDQUFxQixDQUFDLE1BQXRCLENBQUEsRUFERjs7ZUFFQSxZQUFZLENBQUMsT0FBYixDQUFBO01BSEksQ0FETixDQUtBLEVBQUMsS0FBRCxFQUxBLENBS08sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7VUFDTCxJQUFHLElBQUEsS0FBVSxFQUFiO1lBQ0UsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsQ0FBQyxNQUF0QixDQUFBLEVBREY7O2lCQUVBLFlBQVksQ0FBQyxPQUFiLENBQUE7UUFISztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FMUDtJQUxrQjs7OztLQWhGQztBQWJ2QiIsInNvdXJjZXNDb250ZW50IjpbInskJCwgU2VsZWN0TGlzdFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbl9wdWxsID0gcmVxdWlyZSAnLi4vbW9kZWxzL19wdWxsJ1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcbk91dHB1dFZpZXdNYW5hZ2VyID0gcmVxdWlyZSAnLi4vb3V0cHV0LXZpZXctbWFuYWdlcidcblB1bGxCcmFuY2hMaXN0VmlldyA9IHJlcXVpcmUgJy4vcHVsbC1icmFuY2gtbGlzdC12aWV3J1xuXG5leHBlcmltZW50YWxGZWF0dXJlc0VuYWJsZWQgPSAoKSAtPlxuICBnaXRQbHVzID0gYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cycpXG4gIGdpdFBsdXMuYWx3YXlzUHVsbEZyb21VcHN0cmVhbSBhbmQgZ2l0UGx1cy5leHBlcmltZW50YWxcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTGlzdFZpZXcgZXh0ZW5kcyBTZWxlY3RMaXN0Vmlld1xuICBpbml0aWFsaXplOiAoQHJlcG8sIEBkYXRhLCB7QG1vZGUsIEB0YWcsIEBleHRyYUFyZ3N9PXt9KSAtPlxuICAgIHN1cGVyXG4gICAgQHRhZyA/PSAnJ1xuICAgIEBleHRyYUFyZ3MgPz0gW11cbiAgICBAc2hvdygpXG4gICAgQHBhcnNlRGF0YSgpXG4gICAgQHJlc3VsdCA9IG5ldyBQcm9taXNlIChAcmVzb2x2ZSwgQHJlamVjdCkgPT5cblxuICBwYXJzZURhdGE6IC0+XG4gICAgaXRlbXMgPSBAZGF0YS5zcGxpdChcIlxcblwiKVxuICAgIHJlbW90ZXMgPSBpdGVtcy5maWx0ZXIoKGl0ZW0pIC0+IGl0ZW0gaXNudCAnJykubWFwIChpdGVtKSAtPiB7IG5hbWU6IGl0ZW0gfVxuICAgIGlmIHJlbW90ZXMubGVuZ3RoIGlzIDFcbiAgICAgIEBjb25maXJtZWQgcmVtb3Rlc1swXVxuICAgIGVsc2VcbiAgICAgIEBzZXRJdGVtcyByZW1vdGVzXG4gICAgICBAZm9jdXNGaWx0ZXJFZGl0b3IoKVxuXG4gIGdldEZpbHRlcktleTogLT4gJ25hbWUnXG5cbiAgc2hvdzogLT5cbiAgICBAcGFuZWwgPz0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiB0aGlzKVxuICAgIEBwYW5lbC5zaG93KClcblxuICAgIEBzdG9yZUZvY3VzZWRFbGVtZW50KClcblxuICBjYW5jZWxsZWQ6IC0+IEBoaWRlKClcblxuICBoaWRlOiAtPlxuICAgIEBwYW5lbD8uZGVzdHJveSgpXG5cbiAgdmlld0Zvckl0ZW06ICh7bmFtZX0pIC0+XG4gICAgJCQgLT5cbiAgICAgIEBsaSBuYW1lXG5cbiAgcHVsbDogKHJlbW90ZU5hbWUpIC0+XG4gICAgaWYgZXhwZXJpbWVudGFsRmVhdHVyZXNFbmFibGVkKClcbiAgICAgIF9wdWxsIEByZXBvLCBleHRyYUFyZ3M6IFtAZXh0cmFBcmdzXVxuICAgIGVsc2VcbiAgICAgIGdpdC5jbWQoWydicmFuY2gnLCAnLXInXSwgY3dkOiBAcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgICAudGhlbiAoZGF0YSkgPT5cbiAgICAgICAgbmV3IFB1bGxCcmFuY2hMaXN0VmlldyhAcmVwbywgZGF0YSwgcmVtb3RlTmFtZSwgQGV4dHJhQXJncykucmVzdWx0XG5cbiAgY29uZmlybWVkOiAoe25hbWV9KSAtPlxuICAgIGlmIEBtb2RlIGlzICdwdWxsJ1xuICAgICAgQHB1bGwgbmFtZVxuICAgIGVsc2UgaWYgQG1vZGUgaXMgJ2ZldGNoLXBydW5lJ1xuICAgICAgQG1vZGUgPSAnZmV0Y2gnXG4gICAgICBAZXhlY3V0ZSBuYW1lLCAnLS1wcnVuZSdcbiAgICBlbHNlIGlmIEBtb2RlIGlzICdwdXNoJ1xuICAgICAgcHVsbE9wdGlvbiA9IGF0b20uY29uZmlnLmdldCAnZ2l0LXBsdXMucHVsbEJlZm9yZVB1c2gnXG4gICAgICBAZXh0cmFBcmdzID0gaWYgcHVsbE9wdGlvbj8uaW5jbHVkZXMgJy0tcmViYXNlJyB0aGVuICctLXJlYmFzZScgZWxzZSAnJ1xuICAgICAgdW5sZXNzIHB1bGxPcHRpb24/IGFuZCBwdWxsT3B0aW9uIGlzICdubydcbiAgICAgICAgQHB1bGwobmFtZSkudGhlbiA9PiBAZXhlY3V0ZSBuYW1lXG4gICAgICBlbHNlXG4gICAgICAgIEBleGVjdXRlIG5hbWVcbiAgICBlbHNlIGlmIEBtb2RlIGlzICdwdXNoIC11J1xuICAgICAgQHB1c2hBbmRTZXRVcHN0cmVhbSBuYW1lXG4gICAgZWxzZVxuICAgICAgQGV4ZWN1dGUgbmFtZVxuICAgIEBjYW5jZWwoKVxuXG4gIGV4ZWN1dGU6IChyZW1vdGU9JycsIGV4dHJhQXJncz0nJykgLT5cbiAgICB2aWV3ID0gT3V0cHV0Vmlld01hbmFnZXIuY3JlYXRlKClcbiAgICBhcmdzID0gW0Btb2RlXVxuICAgIGlmIGV4dHJhQXJncy5sZW5ndGggPiAwXG4gICAgICBhcmdzLnB1c2ggZXh0cmFBcmdzXG4gICAgYXJncyA9IGFyZ3MuY29uY2F0KFtyZW1vdGUsIEB0YWddKS5maWx0ZXIoKGFyZykgLT4gYXJnIGlzbnQgJycpXG4gICAgbWVzc2FnZSA9IFwiI3tAbW9kZVswXS50b1VwcGVyQ2FzZSgpK0Btb2RlLnN1YnN0cmluZygxKX1pbmcuLi5cIlxuICAgIHN0YXJ0TWVzc2FnZSA9IG5vdGlmaWVyLmFkZEluZm8gbWVzc2FnZSwgZGlzbWlzc2FibGU6IHRydWVcbiAgICBnaXQuY21kKGFyZ3MsIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9KVxuICAgIC50aGVuIChkYXRhKSAtPlxuICAgICAgaWYgZGF0YSBpc250ICcnXG4gICAgICAgIHZpZXcuc2V0Q29udGVudChkYXRhKS5maW5pc2goKVxuICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuICAgIC5jYXRjaCAoZGF0YSkgPT5cbiAgICAgIGlmIGRhdGEgaXNudCAnJ1xuICAgICAgICB2aWV3LnNldENvbnRlbnQoZGF0YSkuZmluaXNoKClcbiAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcblxuICBwdXNoQW5kU2V0VXBzdHJlYW06IChyZW1vdGU9JycpIC0+XG4gICAgdmlldyA9IE91dHB1dFZpZXdNYW5hZ2VyLmNyZWF0ZSgpXG4gICAgYXJncyA9IFsncHVzaCcsICctdScsIHJlbW90ZSwgJ0hFQUQnXS5maWx0ZXIoKGFyZykgLT4gYXJnIGlzbnQgJycpXG4gICAgbWVzc2FnZSA9IFwiUHVzaGluZy4uLlwiXG4gICAgc3RhcnRNZXNzYWdlID0gbm90aWZpZXIuYWRkSW5mbyBtZXNzYWdlLCBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgIGdpdC5jbWQoYXJncywgY3dkOiBAcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCksIHtjb2xvcjogdHJ1ZX0pXG4gICAgLnRoZW4gKGRhdGEpIC0+XG4gICAgICBpZiBkYXRhIGlzbnQgJydcbiAgICAgICAgdmlldy5zZXRDb250ZW50KGRhdGEpLmZpbmlzaCgpXG4gICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4gICAgLmNhdGNoIChkYXRhKSA9PlxuICAgICAgaWYgZGF0YSBpc250ICcnXG4gICAgICAgIHZpZXcuc2V0Q29udGVudChkYXRhKS5maW5pc2goKVxuICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuIl19
