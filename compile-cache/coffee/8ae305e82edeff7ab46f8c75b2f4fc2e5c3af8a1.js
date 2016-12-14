(function() {
  var $, CompositeDisposable, InputView, OutputViewManager, TextEditorView, View, git, notifier, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

  _ref = require('atom-space-pen-views'), $ = _ref.$, TextEditorView = _ref.TextEditorView, View = _ref.View;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  InputView = (function(_super) {
    __extends(InputView, _super);

    function InputView() {
      return InputView.__super__.constructor.apply(this, arguments);
    }

    InputView.content = function() {
      return this.div((function(_this) {
        return function() {
          return _this.subview('commandEditor', new TextEditorView({
            mini: true,
            placeholderText: 'Git command and arguments'
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
      this.commandEditor.focus();
      this.disposables.add(atom.commands.add('atom-text-editor', {
        'core:cancel': (function(_this) {
          return function(e) {
            var _ref1;
            if ((_ref1 = _this.panel) != null) {
              _ref1.destroy();
            }
            _this.currentPane.activate();
            return _this.disposables.dispose();
          };
        })(this)
      }));
      return this.disposables.add(atom.commands.add('atom-text-editor', 'core:confirm', (function(_this) {
        return function(e) {
          var args, view, _ref1;
          _this.disposables.dispose();
          if ((_ref1 = _this.panel) != null) {
            _ref1.destroy();
          }
          view = OutputViewManager.create();
          args = _this.commandEditor.getText().split(' ');
          if (args[0] === 1) {
            args.shift();
          }
          return git.cmd(args, {
            cwd: _this.repo.getWorkingDirectory()
          }).then(function(data) {
            var msg;
            msg = "git " + (args.join(' ')) + " was successful";
            notifier.addSuccess(msg);
            if ((data != null ? data.length : void 0) > 0) {
              view.addLine(data);
            } else {
              view.reset();
            }
            view.finish();
            git.refresh();
            return _this.currentPane.activate();
          })["catch"](function(msg) {
            if ((msg != null ? msg.length : void 0) > 0) {
              view.addLine(msg);
            } else {
              view.reset();
            }
            view.finish();
            git.refresh();
            return _this.currentPane.activate();
          });
        };
      })(this)));
    };

    return InputView;

  })(View);

  module.exports = function(repo) {
    return new InputView(repo);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1ydW4uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtGQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNBLE9BQTRCLE9BQUEsQ0FBUSxzQkFBUixDQUE1QixFQUFDLFNBQUEsQ0FBRCxFQUFJLHNCQUFBLGNBQUosRUFBb0IsWUFBQSxJQURwQixDQUFBOztBQUFBLEVBR0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBSE4sQ0FBQTs7QUFBQSxFQUlBLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUixDQUpYLENBQUE7O0FBQUEsRUFLQSxpQkFBQSxHQUFvQixPQUFBLENBQVEsd0JBQVIsQ0FMcEIsQ0FBQTs7QUFBQSxFQU9NO0FBQ0osZ0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsU0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ0gsS0FBQyxDQUFBLE9BQUQsQ0FBUyxlQUFULEVBQThCLElBQUEsY0FBQSxDQUFlO0FBQUEsWUFBQSxJQUFBLEVBQU0sSUFBTjtBQUFBLFlBQVksZUFBQSxFQUFpQiwyQkFBN0I7V0FBZixDQUE5QixFQURHO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTCxFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLHdCQUlBLFVBQUEsR0FBWSxTQUFFLElBQUYsR0FBQTtBQUNWLE1BRFcsSUFBQyxDQUFBLE9BQUEsSUFDWixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsV0FB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

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/models/git-run.coffee
