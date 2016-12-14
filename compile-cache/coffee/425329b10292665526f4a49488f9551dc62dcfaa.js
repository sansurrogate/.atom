(function() {
  var CMD_TOGGLE, CompositeDisposable, EVT_SWITCH, GitControl, GitControlView, git, item, pane, view, views;

  GitControlView = require('./git-control-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  git = require('./git');

  CMD_TOGGLE = 'git-control:toggle';

  EVT_SWITCH = 'pane-container:active-pane-item-changed';

  views = [];

  view = void 0;

  pane = void 0;

  item = void 0;

  module.exports = GitControl = {
    activate: function(state) {
      console.log('GitControl: activate');
      atom.commands.add('atom-workspace', CMD_TOGGLE, (function(_this) {
        return function() {
          return _this.toggleView();
        };
      })(this));
      atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(item) {
          return _this.updateViews();
        };
      })(this));
      atom.project.onDidChangePaths((function(_this) {
        return function() {
          return _this.updatePaths();
        };
      })(this));
    },
    deactivate: function() {
      console.log('GitControl: deactivate');
    },
    toggleView: function() {
      console.log('GitControl: toggle');
      if (!(view && view.active)) {
        view = new GitControlView();
        views.push(view);
        pane = atom.workspace.getActivePane();
        item = pane.addItem(view, 0);
        pane.activateItem(item);
      } else {
        pane.destroyItem(item);
      }
    },
    updatePaths: function() {
      git.setProjectIndex(0);
    },
    updateViews: function() {
      var activeView, v, _i, _len;
      activeView = atom.workspace.getActivePane().getActiveItem();
      for (_i = 0, _len = views.length; _i < _len; _i++) {
        v = views[_i];
        if (v === activeView) {
          v.update();
        }
      }
    },
    updatePaths: function() {
      git.setProjectIndex(0);
    },
    serialize: function() {},
    config: {
      showGitFlowButton: {
        title: 'Show GitFlow button',
        description: 'Show the GitFlow button in the Git Control toolbar',
        type: 'boolean',
        "default": true
      },
      noFastForward: {
        title: 'Disable Fast Forward',
        description: 'Disable Fast Forward for default at Git Merge',
        type: 'boolean',
        "default": false
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZ2l0LWNvbnRyb2wuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFHQUFBOztBQUFBLEVBQUEsY0FBQSxHQUFpQixPQUFBLENBQVEsb0JBQVIsQ0FBakIsQ0FBQTs7QUFBQSxFQUNDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFERCxDQUFBOztBQUFBLEVBRUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSLENBRk4sQ0FBQTs7QUFBQSxFQUlBLFVBQUEsR0FBYSxvQkFKYixDQUFBOztBQUFBLEVBS0EsVUFBQSxHQUFhLHlDQUxiLENBQUE7O0FBQUEsRUFPQSxLQUFBLEdBQVEsRUFQUixDQUFBOztBQUFBLEVBUUEsSUFBQSxHQUFPLE1BUlAsQ0FBQTs7QUFBQSxFQVNBLElBQUEsR0FBTyxNQVRQLENBQUE7O0FBQUEsRUFVQSxJQUFBLEdBQU8sTUFWUCxDQUFBOztBQUFBLEVBWUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsVUFBQSxHQUVmO0FBQUEsSUFBQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksc0JBQVosQ0FBQSxDQUFBO0FBQUEsTUFFQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLFVBQXBDLEVBQWdELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLFVBQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEQsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFJLENBQUMsU0FBUyxDQUFDLHlCQUFmLENBQXlDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxT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

//# sourceURL=/home/takaaki/.atom/packages/git-control/lib/git-control.coffee
