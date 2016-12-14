(function() {
  var $$, ListView, OutputViewManager, PullBranchListView, SelectListView, _pull, experimentalFeaturesEnabled, getUpstreamBranch, git, notifier, ref,
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

  getUpstreamBranch = function(repo) {
    var branch, ref1, remote, upstream;
    upstream = repo.getUpstreamBranch();
    ref1 = upstream.substring('refs/remotes/'.length).split('/'), remote = ref1[0], branch = ref1[1];
    return {
      remote: remote,
      branch: branch
    };
  };

  module.exports = ListView = (function(superClass) {
    extend(ListView, superClass);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.initialize = function(repo1, data1, arg1) {
      var ref1;
      this.repo = repo1;
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
      var branch, ref1, remote;
      if (experimentalFeaturesEnabled()) {
        ref1 = getUpstreamBranch(this.repo), remote = ref1.remote, branch = ref1.branch;
        return _pull(this.repo, {
          remote: remote,
          branch: branch,
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvdmlld3MvcmVtb3RlLWxpc3Qtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDhJQUFBO0lBQUE7OztFQUFBLE1BQXVCLE9BQUEsQ0FBUSxzQkFBUixDQUF2QixFQUFDLFdBQUQsRUFBSzs7RUFFTCxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sS0FBQSxHQUFRLE9BQUEsQ0FBUSxpQkFBUjs7RUFDUixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSOztFQUNwQixrQkFBQSxHQUFxQixPQUFBLENBQVEseUJBQVI7O0VBRXJCLDJCQUFBLEdBQThCLFNBQUE7QUFDNUIsUUFBQTtJQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsVUFBaEI7V0FDVixPQUFPLENBQUMsc0JBQVIsSUFBbUMsT0FBTyxDQUFDO0VBRmY7O0VBSTlCLGlCQUFBLEdBQW9CLFNBQUMsSUFBRDtBQUNsQixRQUFBO0lBQUEsUUFBQSxHQUFXLElBQUksQ0FBQyxpQkFBTCxDQUFBO0lBQ1gsT0FBbUIsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsZUFBZSxDQUFDLE1BQW5DLENBQTBDLENBQUMsS0FBM0MsQ0FBaUQsR0FBakQsQ0FBbkIsRUFBQyxnQkFBRCxFQUFTO1dBQ1Q7TUFBRSxRQUFBLE1BQUY7TUFBVSxRQUFBLE1BQVY7O0VBSGtCOztFQUtwQixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O3VCQUNKLFVBQUEsR0FBWSxTQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWUsSUFBZjtBQUNWLFVBQUE7TUFEVyxJQUFDLENBQUEsT0FBRDtNQUFPLElBQUMsQ0FBQSxPQUFEOzRCQUFPLE9BQTBCLElBQXpCLElBQUMsQ0FBQSxZQUFBLE1BQU0s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Q0FBQTtNQUNQLElBQUEsR0FBTyxDQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsTUFBZixFQUF1QixNQUF2QixDQUE4QixDQUFDLE1BQS9CLENBQXNDLFNBQUMsR0FBRDtlQUFTLEdBQUEsS0FBUztNQUFsQixDQUF0QztNQUNQLE9BQUEsR0FBVTtNQUNWLFlBQUEsR0FBZSxRQUFRLENBQUMsT0FBVCxDQUFpQixPQUFqQixFQUEwQjtRQUFBLFdBQUEsRUFBYSxJQUFiO09BQTFCO2FBQ2YsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEVBQWM7UUFBQSxHQUFBLEVBQUssSUFBQyxDQUFBLElBQUksQ0FBQyxtQkFBTixDQUFBLENBQUw7T0FBZCxFQUFnRDtRQUFDLEtBQUEsRUFBTyxJQUFSO09BQWhELENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO1FBQ0osSUFBRyxJQUFBLEtBQVUsRUFBYjtVQUNFLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCLENBQXFCLENBQUMsTUFBdEIsQ0FBQSxFQURGOztlQUVBLFlBQVksQ0FBQyxPQUFiLENBQUE7TUFISSxDQUROLENBS0EsRUFBQyxLQUFELEVBTEEsQ0FLTyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtVQUNMLElBQUcsSUFBQSxLQUFVLEVBQWI7WUFDRSxJQUFJLENBQUMsVUFBTCxDQUFnQixJQUFoQixDQUFxQixDQUFDLE1BQXRCLENBQUEsRUFERjs7aUJBRUEsWUFBWSxDQUFDLE9BQWIsQ0FBQTtRQUhLO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUxQO0lBTGtCOzs7O0tBakZDO0FBbEJ2QiIsInNvdXJjZXNDb250ZW50IjpbInskJCwgU2VsZWN0TGlzdFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbl9wdWxsID0gcmVxdWlyZSAnLi4vbW9kZWxzL19wdWxsJ1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcbk91dHB1dFZpZXdNYW5hZ2VyID0gcmVxdWlyZSAnLi4vb3V0cHV0LXZpZXctbWFuYWdlcidcblB1bGxCcmFuY2hMaXN0VmlldyA9IHJlcXVpcmUgJy4vcHVsbC1icmFuY2gtbGlzdC12aWV3J1xuXG5leHBlcmltZW50YWxGZWF0dXJlc0VuYWJsZWQgPSAoKSAtPlxuICBnaXRQbHVzID0gYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cycpXG4gIGdpdFBsdXMuYWx3YXlzUHVsbEZyb21VcHN0cmVhbSBhbmQgZ2l0UGx1cy5leHBlcmltZW50YWxcblxuZ2V0VXBzdHJlYW1CcmFuY2ggPSAocmVwbykgLT5cbiAgdXBzdHJlYW0gPSByZXBvLmdldFVwc3RyZWFtQnJhbmNoKClcbiAgW3JlbW90ZSwgYnJhbmNoXSA9IHVwc3RyZWFtLnN1YnN0cmluZygncmVmcy9yZW1vdGVzLycubGVuZ3RoKS5zcGxpdCgnLycpXG4gIHsgcmVtb3RlLCBicmFuY2ggfVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBMaXN0VmlldyBleHRlbmRzIFNlbGVjdExpc3RWaWV3XG4gIGluaXRpYWxpemU6IChAcmVwbywgQGRhdGEsIHtAbW9kZSwgQHRhZywgQGV4dHJhQXJnc309e30pIC0+XG4gICAgc3VwZXJcbiAgICBAdGFnID89ICcnXG4gICAgQGV4dHJhQXJncyA/PSBbXVxuICAgIEBzaG93KClcbiAgICBAcGFyc2VEYXRhKClcbiAgICBAcmVzdWx0ID0gbmV3IFByb21pc2UgKEByZXNvbHZlLCBAcmVqZWN0KSA9PlxuXG4gIHBhcnNlRGF0YTogLT5cbiAgICBpdGVtcyA9IEBkYXRhLnNwbGl0KFwiXFxuXCIpXG4gICAgcmVtb3RlcyA9IGl0ZW1zLmZpbHRlcigoaXRlbSkgLT4gaXRlbSBpc250ICcnKS5tYXAgKGl0ZW0pIC0+IHsgbmFtZTogaXRlbSB9XG4gICAgaWYgcmVtb3Rlcy5sZW5ndGggaXMgMVxuICAgICAgQGNvbmZpcm1lZCByZW1vdGVzWzBdXG4gICAgZWxzZVxuICAgICAgQHNldEl0ZW1zIHJlbW90ZXNcbiAgICAgIEBmb2N1c0ZpbHRlckVkaXRvcigpXG5cbiAgZ2V0RmlsdGVyS2V5OiAtPiAnbmFtZSdcblxuICBzaG93OiAtPlxuICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMpXG4gICAgQHBhbmVsLnNob3coKVxuXG4gICAgQHN0b3JlRm9jdXNlZEVsZW1lbnQoKVxuXG4gIGNhbmNlbGxlZDogLT4gQGhpZGUoKVxuXG4gIGhpZGU6IC0+XG4gICAgQHBhbmVsPy5kZXN0cm95KClcblxuICB2aWV3Rm9ySXRlbTogKHtuYW1lfSkgLT5cbiAgICAkJCAtPlxuICAgICAgQGxpIG5hbWVcblxuICBwdWxsOiAocmVtb3RlTmFtZSkgLT5cbiAgICBpZiBleHBlcmltZW50YWxGZWF0dXJlc0VuYWJsZWQoKVxuICAgICAge3JlbW90ZSwgYnJhbmNofSA9IGdldFVwc3RyZWFtQnJhbmNoIEByZXBvXG4gICAgICBfcHVsbCBAcmVwbywge3JlbW90ZSwgYnJhbmNoLCBleHRyYUFyZ3M6IFtAZXh0cmFBcmdzXX1cbiAgICBlbHNlXG4gICAgICBnaXQuY21kKFsnYnJhbmNoJywgJy1yJ10sIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgICAgLnRoZW4gKGRhdGEpID0+XG4gICAgICAgIG5ldyBQdWxsQnJhbmNoTGlzdFZpZXcoQHJlcG8sIGRhdGEsIHJlbW90ZU5hbWUsIEBleHRyYUFyZ3MpLnJlc3VsdFxuXG4gIGNvbmZpcm1lZDogKHtuYW1lfSkgLT5cbiAgICBpZiBAbW9kZSBpcyAncHVsbCdcbiAgICAgIEBwdWxsIG5hbWVcbiAgICBlbHNlIGlmIEBtb2RlIGlzICdmZXRjaC1wcnVuZSdcbiAgICAgIEBtb2RlID0gJ2ZldGNoJ1xuICAgICAgQGV4ZWN1dGUgbmFtZSwgJy0tcHJ1bmUnXG4gICAgZWxzZSBpZiBAbW9kZSBpcyAncHVzaCdcbiAgICAgIHB1bGxPcHRpb24gPSBhdG9tLmNvbmZpZy5nZXQgJ2dpdC1wbHVzLnB1bGxCZWZvcmVQdXNoJ1xuICAgICAgQGV4dHJhQXJncyA9IGlmIHB1bGxPcHRpb24/LmluY2x1ZGVzICctLXJlYmFzZScgdGhlbiAnLS1yZWJhc2UnIGVsc2UgJydcbiAgICAgIHVubGVzcyBwdWxsT3B0aW9uPyBhbmQgcHVsbE9wdGlvbiBpcyAnbm8nXG4gICAgICAgIEBwdWxsKG5hbWUpLnRoZW4gPT4gQGV4ZWN1dGUgbmFtZVxuICAgICAgZWxzZVxuICAgICAgICBAZXhlY3V0ZSBuYW1lXG4gICAgZWxzZSBpZiBAbW9kZSBpcyAncHVzaCAtdSdcbiAgICAgIEBwdXNoQW5kU2V0VXBzdHJlYW0gbmFtZVxuICAgIGVsc2VcbiAgICAgIEBleGVjdXRlIG5hbWVcbiAgICBAY2FuY2VsKClcblxuICBleGVjdXRlOiAocmVtb3RlPScnLCBleHRyYUFyZ3M9JycpIC0+XG4gICAgdmlldyA9IE91dHB1dFZpZXdNYW5hZ2VyLmNyZWF0ZSgpXG4gICAgYXJncyA9IFtAbW9kZV1cbiAgICBpZiBleHRyYUFyZ3MubGVuZ3RoID4gMFxuICAgICAgYXJncy5wdXNoIGV4dHJhQXJnc1xuICAgIGFyZ3MgPSBhcmdzLmNvbmNhdChbcmVtb3RlLCBAdGFnXSkuZmlsdGVyKChhcmcpIC0+IGFyZyBpc250ICcnKVxuICAgIG1lc3NhZ2UgPSBcIiN7QG1vZGVbMF0udG9VcHBlckNhc2UoKStAbW9kZS5zdWJzdHJpbmcoMSl9aW5nLi4uXCJcbiAgICBzdGFydE1lc3NhZ2UgPSBub3RpZmllci5hZGRJbmZvIG1lc3NhZ2UsIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgZ2l0LmNtZChhcmdzLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwge2NvbG9yOiB0cnVlfSlcbiAgICAudGhlbiAoZGF0YSkgLT5cbiAgICAgIGlmIGRhdGEgaXNudCAnJ1xuICAgICAgICB2aWV3LnNldENvbnRlbnQoZGF0YSkuZmluaXNoKClcbiAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiAgICAuY2F0Y2ggKGRhdGEpID0+XG4gICAgICBpZiBkYXRhIGlzbnQgJydcbiAgICAgICAgdmlldy5zZXRDb250ZW50KGRhdGEpLmZpbmlzaCgpXG4gICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG5cbiAgcHVzaEFuZFNldFVwc3RyZWFtOiAocmVtb3RlPScnKSAtPlxuICAgIHZpZXcgPSBPdXRwdXRWaWV3TWFuYWdlci5jcmVhdGUoKVxuICAgIGFyZ3MgPSBbJ3B1c2gnLCAnLXUnLCByZW1vdGUsICdIRUFEJ10uZmlsdGVyKChhcmcpIC0+IGFyZyBpc250ICcnKVxuICAgIG1lc3NhZ2UgPSBcIlB1c2hpbmcuLi5cIlxuICAgIHN0YXJ0TWVzc2FnZSA9IG5vdGlmaWVyLmFkZEluZm8gbWVzc2FnZSwgZGlzbWlzc2FibGU6IHRydWVcbiAgICBnaXQuY21kKGFyZ3MsIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9KVxuICAgIC50aGVuIChkYXRhKSAtPlxuICAgICAgaWYgZGF0YSBpc250ICcnXG4gICAgICAgIHZpZXcuc2V0Q29udGVudChkYXRhKS5maW5pc2goKVxuICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuICAgIC5jYXRjaCAoZGF0YSkgPT5cbiAgICAgIGlmIGRhdGEgaXNudCAnJ1xuICAgICAgICB2aWV3LnNldENvbnRlbnQoZGF0YSkuZmluaXNoKClcbiAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiJdfQ==
