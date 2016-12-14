(function() {
  var CompositeDisposable, InputView, Os, Path, TextEditorView, View, fs, git, isEmpty, prepFile, showCommitFilePath, showFile, showObject, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Os = require('os');

  Path = require('path');

  fs = require('fs-plus');

  CompositeDisposable = require('atom').CompositeDisposable;

  _ref = require('atom-space-pen-views'), TextEditorView = _ref.TextEditorView, View = _ref.View;

  git = require('../git');

  showCommitFilePath = function(objectHash) {
    return Path.join(Os.tmpDir(), "" + objectHash + ".diff");
  };

  isEmpty = function(string) {
    return string === '';
  };

  showObject = function(repo, objectHash, file) {
    var args, showFormatOption;
    objectHash = isEmpty(objectHash) ? 'HEAD' : objectHash;
    args = ['show', '--color=never'];
    showFormatOption = atom.config.get('git-plus.showFormat');
    if (showFormatOption !== 'none') {
      args.push("--format=" + showFormatOption);
    }
    if (atom.config.get('git-plus.wordDiff')) {
      args.push('--word-diff');
    }
    args.push(objectHash);
    if (file != null) {
      args.push('--', file);
    }
    return git.cmd(args, {
      cwd: repo.getWorkingDirectory()
    }).then(function(data) {
      if (data.length > 0) {
        return prepFile(data, objectHash);
      }
    });
  };

  prepFile = function(text, objectHash) {
    return fs.writeFile(showCommitFilePath(objectHash), text, {
      flag: 'w+'
    }, function(err) {
      if (err) {
        return notifier.addError(err);
      } else {
        return showFile(objectHash);
      }
    });
  };

  showFile = function(objectHash) {
    var disposables, splitDirection;
    disposables = new CompositeDisposable;
    if (atom.config.get('git-plus.openInPane')) {
      splitDirection = atom.config.get('git-plus.splitPane');
      atom.workspace.getActivePane()["split" + splitDirection]();
    }
    return atom.workspace.open(showCommitFilePath(objectHash), {
      activatePane: true
    }).then(function(textBuffer) {
      if (textBuffer != null) {
        return disposables.add(textBuffer.onDidDestroy(function() {
          disposables.dispose();
          try {
            return fs.unlinkSync(showCommitFilePath(objectHash));
          } catch (_error) {}
        }));
      }
    });
  };

  InputView = (function(_super) {
    __extends(InputView, _super);

    function InputView() {
      return InputView.__super__.constructor.apply(this, arguments);
    }

    InputView.content = function() {
      return this.div((function(_this) {
        return function() {
          return _this.subview('objectHash', new TextEditorView({
            mini: true,
            placeholderText: 'Commit hash to show. (Defaults to HEAD)'
          }));
        };
      })(this));
    };

    InputView.prototype.initialize = function(repo) {
      this.repo = repo;
      this.disposables = new CompositeDisposable;
      this.currentPane = atom.workspace.getActivePane();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.objectHash.focus();
      this.disposables.add(atom.commands.add('atom-text-editor', {
        'core:cancel': (function(_this) {
          return function() {
            return _this.destroy();
          };
        })(this)
      }));
      return this.disposables.add(atom.commands.add('atom-text-editor', {
        'core:confirm': (function(_this) {
          return function() {
            var text;
            text = _this.objectHash.getModel().getText().split(' ')[0];
            showObject(_this.repo, text);
            return _this.destroy();
          };
        })(this)
      }));
    };

    InputView.prototype.destroy = function() {
      var _ref1, _ref2;
      if ((_ref1 = this.disposables) != null) {
        _ref1.dispose();
      }
      return (_ref2 = this.panel) != null ? _ref2.destroy() : void 0;
    };

    return InputView;

  })(View);

  module.exports = function(repo, objectHash, file) {
    if (objectHash == null) {
      return new InputView(repo);
    } else {
      return showObject(repo, objectHash, file);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1zaG93LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwwSUFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FGTCxDQUFBOztBQUFBLEVBSUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUpELENBQUE7O0FBQUEsRUFLQSxPQUF5QixPQUFBLENBQVEsc0JBQVIsQ0FBekIsRUFBQyxzQkFBQSxjQUFELEVBQWlCLFlBQUEsSUFMakIsQ0FBQTs7QUFBQSxFQU9BLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQVBOLENBQUE7O0FBQUEsRUFTQSxrQkFBQSxHQUFxQixTQUFDLFVBQUQsR0FBQTtXQUNuQixJQUFJLENBQUMsSUFBTCxDQUFVLEVBQUUsQ0FBQyxNQUFILENBQUEsQ0FBVixFQUF1QixFQUFBLEdBQUcsVUFBSCxHQUFjLE9BQXJDLEVBRG1CO0VBQUEsQ0FUckIsQ0FBQTs7QUFBQSxFQVlBLE9BQUEsR0FBVSxTQUFDLE1BQUQsR0FBQTtXQUFZLE1BQUEsS0FBVSxHQUF0QjtFQUFBLENBWlYsQ0FBQTs7QUFBQSxFQWNBLFVBQUEsR0FBYSxTQUFDLElBQUQsRUFBTyxVQUFQLEVBQW1CLElBQW5CLEdBQUE7QUFDWCxRQUFBLHNCQUFBO0FBQUEsSUFBQSxVQUFBLEdBQWdCLE9BQUEsQ0FBUSxVQUFSLENBQUgsR0FBMkIsTUFBM0IsR0FBdUMsVUFBcEQsQ0FBQTtBQUFBLElBQ0EsSUFBQSxHQUFPLENBQUMsTUFBRCxFQUFTLGVBQVQsQ0FEUCxDQUFBO0FBQUEsSUFFQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUJBQWhCLENBRm5CLENBQUE7QUFHQSxJQUFBLElBQTRDLGdCQUFBLEtBQW9CLE1BQWhFO0FBQUEsTUFBQSxJQUFJLENBQUMsSUFBTCxDQUFXLFdBQUEsR0FBVyxnQkFBdEIsQ0FBQSxDQUFBO0tBSEE7QUFJQSxJQUFBLElBQTJCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixtQkFBaEIsQ0FBM0I7QUFBQSxNQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsYUFBVixDQUFBLENBQUE7S0FKQTtBQUFBLElBS0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxVQUFWLENBTEEsQ0FBQTtBQU1BLElBQUEsSUFBd0IsWUFBeEI7QUFBQSxNQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVixFQUFnQixJQUFoQixDQUFBLENBQUE7S0FOQTtXQVFBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO0FBQUEsTUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtLQUFkLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFELEdBQUE7QUFBVSxNQUFBLElBQThCLElBQUksQ0FBQyxNQUFMLEdBQWMsQ0FBNUM7ZUFBQSxRQUFBLENBQVMsSUFBVCxFQUFlLFVBQWYsRUFBQTtPQUFWO0lBQUEsQ0FETixFQVRXO0VBQUEsQ0FkYixDQUFBOztBQUFBLEVBMEJBLFFBQUEsR0FBVyxTQUFDLElBQUQsRUFBTyxVQUFQLEdBQUE7V0FDVCxFQUFFLENBQUMsU0FBSCxDQUFhLGtCQUFBLENBQW1CLFVBQW5CLENBQWIsRUFBNkMsSUFBN0MsRUFBbUQ7QUFBQSxNQUFBLElBQUEsRUFBTSxJQUFOO0tBQW5ELEVBQStELFNBQUMsR0FBRCxHQUFBO0FBQzdELE1BQUEsSUFBRyxHQUFIO2VBQVksUUFBUSxDQUFDLFFBQVQsQ0FBa0IsR0FBbEIsRUFBWjtPQUFBLE1BQUE7ZUFBdUMsUUFBQSxDQUFTLFVBQVQsRUFBdkM7T0FENkQ7SUFBQSxDQUEvRCxFQURTO0VBQUEsQ0ExQlgsQ0FBQTs7QUFBQSxFQThCQSxRQUFBLEdBQVcsU0FBQyxVQUFELEdBQUE7QUFDVCxRQUFBLDJCQUFBO0FBQUEsSUFBQSxXQUFBLEdBQWMsR0FBQSxDQUFBLG1CQUFkLENBQUE7QUFDQSxJQUFBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHFCQUFoQixDQUFIO0FBQ0UsTUFBQSxjQUFBLEdBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixvQkFBaEIsQ0FBakIsQ0FBQTtBQUFBLE1BQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUEsQ0FBK0IsQ0FBQyxPQUFBLEdBQU8sY0FBUixDQUEvQixDQUFBLENBREEsQ0FERjtLQURBO1dBSUEsSUFBSSxDQUFDLFNBQ0gsQ0FBQyxJQURILENBQ1Esa0JBQUEsQ0FBbUIsVUFBbkIsQ0FEUixFQUN3QztBQUFBLE1BQUEsWUFBQSxFQUFjLElBQWQ7S0FEeEMsQ0FFRSxDQUFDLElBRkgsQ0FFUSxTQUFDLFVBQUQsR0FBQTtBQUNKLE1BQUEsSUFBRyxrQkFBSDtlQUNFLFdBQVcsQ0FBQyxHQUFaLENBQWdCLFVBQVUsQ0FBQyxZQUFYLENBQXdCLFNBQUEsR0FBQTtBQUN0QyxVQUFBLFdBQVcsQ0FBQyxPQUFaLENBQUEsQ0FBQSxDQUFBO0FBQ0E7bUJBQUksRUFBRSxDQUFDLFVBQUgsQ0FBYyxrQkFBQSxDQUFtQixVQUFuQixDQUFkLEVBQUo7V0FBQSxrQkFGc0M7UUFBQSxDQUF4QixDQUFoQixFQURGO09BREk7SUFBQSxDQUZSLEVBTFM7RUFBQSxDQTlCWCxDQUFBOztBQUFBLEVBMkNNO0FBQ0osZ0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsU0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ0gsS0FBQyxDQUFBLE9BQUQsQ0FBUyxZQUFULEVBQTJCLElBQUEsY0FBQSxDQUFlO0FBQUEsWUFBQSxJQUFBLEVBQU0sSUFBTjtBQUFBLFlBQVksZUFBQSxFQUFpQix5Q0FBN0I7V0FBZixDQUEzQixFQURHO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTCxFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLHdCQUlBLFVBQUEsR0FBWSxTQUFFLElBQUYsR0FBQTtBQUNWLE1BRFcsSUFBQyxDQUFBLE9BQUEsSUFDWixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsV0FBRCxHQUFlLEdBQUEsQ0FBQSxtQkFBZixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBLENBRGYsQ0FBQTs7UUFFQSxJQUFDLENBQUEsUUFBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7QUFBQSxVQUFBLElBQUEsRUFBTSxJQUFOO1NBQTdCO09BRlY7QUFBQSxNQUdBLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBLENBSEEsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxLQUFaLENBQUEsQ0FKQSxDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGtCQUFsQixFQUFzQztBQUFBLFFBQUEsYUFBQSxFQUFlLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxPQUFELENBQUEsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWY7T0FBdEMsQ0FBakIsQ0FMQSxDQUFBO2FBTUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixrQkFBbEIsRUFBc0M7QUFBQSxRQUFBLGNBQUEsRUFBZ0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7QUFDckUsZ0JBQUEsSUFBQTtBQUFBLFlBQUEsSUFBQSxHQUFPLEtBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixDQUFBLENBQXNCLENBQUMsT0FBdkIsQ0FBQSxDQUFnQyxDQUFDLEtBQWpDLENBQXVDLEdBQXZDLENBQTRDLENBQUEsQ0FBQSxDQUFuRCxDQUFBO0FBQUEsWUFDQSxVQUFBLENBQVcsS0FBQyxDQUFBLElBQVosRUFBa0IsSUFBbEIsQ0FEQSxDQUFBO21CQUVBLEtBQUMsQ0FBQSxPQUFELENBQUEsRUFIcUU7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQjtPQUF0QyxDQUFqQixFQVBVO0lBQUEsQ0FKWixDQUFBOztBQUFBLHdCQWdCQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsVUFBQSxZQUFBOzthQUFZLENBQUUsT0FBZCxDQUFBO09BQUE7aURBQ00sQ0FBRSxPQUFSLENBQUEsV0FGTztJQUFBLENBaEJULENBQUE7O3FCQUFBOztLQURzQixLQTNDeEIsQ0FBQTs7QUFBQSxFQWdFQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQsRUFBTyxVQUFQLEVBQW1CLElBQW5CLEdBQUE7QUFDZixJQUFBLElBQU8sa0JBQVA7YUFDTSxJQUFBLFNBQUEsQ0FBVSxJQUFWLEVBRE47S0FBQSxNQUFBO2FBR0UsVUFBQSxDQUFXLElBQVgsRUFBaUIsVUFBakIsRUFBNkIsSUFBN0IsRUFIRjtLQURlO0VBQUEsQ0FoRWpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/models/git-show.coffee
