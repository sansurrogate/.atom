(function() {
  var basename;

  basename = require("path").basename;

  module.exports = {
    config: {
      coloured: {
        type: 'boolean',
        "default": true,
        description: 'Untick this for colourless icons'
      },
      forceShow: {
        type: 'boolean',
        "default": false,
        description: 'Force show icons - for themes that hide icons'
      },
      onChanges: {
        type: 'boolean',
        "default": false,
        description: 'Only colour icons when file is modified'
      },
      tabPaneIcon: {
        type: 'boolean',
        "default": true,
        description: 'Show file icons on tab pane'
      }
    },
    activate: function(state) {
      var colouredIcons;
      this.disableSetiIcons(true);
      colouredIcons = "file-icons.coloured";
      atom.config.onDidChange(colouredIcons, (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          return _this.colour(newValue);
        };
      })(this));
      this.colour(atom.config.get(colouredIcons));
      atom.commands.add('body', 'file-icons:toggle-colours', function(event) {
        return atom.config.set(colouredIcons, !(atom.config.get(colouredIcons)));
      });
      this.observe(true);
      atom.config.onDidChange('file-icons.forceShow', (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          return _this.forceShow(newValue);
        };
      })(this));
      this.forceShow(atom.config.get('file-icons.forceShow'));
      atom.config.onDidChange('file-icons.onChanges', (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          return _this.onChanges(newValue);
        };
      })(this));
      this.onChanges(atom.config.get('file-icons.onChanges'));
      atom.config.onDidChange('file-icons.tabPaneIcon', (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          return _this.tabPaneIcon(newValue);
        };
      })(this));
      return this.tabPaneIcon(atom.config.get('file-icons.tabPaneIcon'));
    },
    deactivate: function() {
      this.disableSetiIcons(false);
      this.forceShow(false);
      this.onChanges(false);
      this.colour(true);
      this.tabPaneIcon(false);
      return this.observe(false);
    },
    observe: function(enabled) {
      if (enabled) {
        return this.observer = atom.workspace.observeTextEditors(function(editor) {
          var fixAfterLoading, onSave, openedFile, workspace;
          workspace = atom.views.getView(atom.workspace);
          openedFile = editor.getPath();
          fixAfterLoading = function() {
            var onDone;
            return onDone = editor.onDidStopChanging(function() {
              var fileTabs, tabs;
              tabs = workspace != null ? workspace.querySelectorAll(".pane > .tab-bar > .tab") : void 0;
              fileTabs = [].filter.call(tabs, function(tab) {
                return (tab != null ? tab.item : void 0) === editor;
              });
              editor.onDidChangePath((function(_this) {
                return function(path) {
                  var tab, title, _i, _len, _results;
                  _results = [];
                  for (_i = 0, _len = fileTabs.length; _i < _len; _i++) {
                    tab = fileTabs[_i];
                    title = tab.itemTitle;
                    title.dataset.path = path;
                    _results.push(title.dataset.name = basename(path));
                  }
                  return _results;
                };
              })(this));
              return onDone.dispose();
            });
          };
          if (!openedFile) {
            return onSave = editor.onDidSave(function(file) {
              var fixIcon, onTerminate, tab;
              tab = workspace != null ? workspace.querySelector(".tab-bar > .active.tab > .title") : void 0;
              fixIcon = function() {
                var path;
                if (!(tab != null ? tab.dataset.path : void 0)) {
                  path = file.path;
                  tab.dataset.path = path;
                  tab.dataset.name = basename(path);
                  return fixAfterLoading();
                }
              };
              if (tab) {
                fixIcon();
              } else {
                onTerminate = editor.onDidTerminatePendingState(function() {
                  setTimeout((function() {
                    tab = workspace != null ? workspace.querySelector(".tab-bar > .active.tab > .title") : void 0;
                    return fixIcon();
                  }), 10);
                  return onTerminate.dispose();
                });
              }
              return onSave.dispose();
            });
          } else {
            return fixAfterLoading();
          }
        });
      } else if (this.observer != null) {
        return this.observer.dispose();
      }
    },
    serialize: function() {},
    colour: function(enable) {
      var body;
      body = document.querySelector('body');
      return body.classList.toggle('file-icons-colourless', !enable);
    },
    forceShow: function(enable) {
      var body;
      body = document.querySelector('body');
      return body.classList.toggle('file-icons-force-show-icons', enable);
    },
    onChanges: function(enable) {
      var body;
      body = document.querySelector('body');
      return body.classList.toggle('file-icons-on-changes', enable);
    },
    tabPaneIcon: function(enable) {
      var body;
      body = document.querySelector('body');
      return body.classList.toggle('file-icons-tab-pane-icon', enable);
    },
    disableSetiIcons: function(disable) {
      var workspaceElement;
      workspaceElement = atom.views.getView(atom.workspace);
      return workspaceElement.classList.toggle('seti-ui-no-icons', disable);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9maWxlLWljb25zL2luZGV4LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxRQUFBOztBQUFBLEVBQUMsV0FBWSxPQUFBLENBQVEsTUFBUixFQUFaLFFBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsUUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSxrQ0FGYjtPQURGO0FBQUEsTUFJQSxTQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsS0FEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLCtDQUZiO09BTEY7QUFBQSxNQVFBLFNBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxLQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEseUNBRmI7T0FURjtBQUFBLE1BWUEsV0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSw2QkFGYjtPQWJGO0tBREY7QUFBQSxJQWtCQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixVQUFBLGFBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixJQUFsQixDQUFBLENBQUE7QUFBQSxNQUVBLGFBQUEsR0FBZ0IscUJBRmhCLENBQUE7QUFBQSxNQUdBLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixhQUF4QixFQUF1QyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FB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

//# sourceURL=/home/takaaki/.atom/packages/file-icons/index.coffee
