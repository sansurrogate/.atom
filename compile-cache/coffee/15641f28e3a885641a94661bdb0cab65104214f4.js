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
      this.disableSetiIcons(true);
      atom.config.onDidChange('file-icons.coloured', (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          return _this.colour(newValue);
        };
      })(this));
      this.colour(atom.config.get('file-icons.coloured'));
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9maWxlLWljb25zL2luZGV4LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxRQUFBOztBQUFBLEVBQUMsV0FBWSxPQUFBLENBQVEsTUFBUixFQUFaLFFBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsUUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSxrQ0FGYjtPQURGO0FBQUEsTUFJQSxTQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsS0FEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLCtDQUZiO09BTEY7QUFBQSxNQVFBLFNBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxLQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEseUNBRmI7T0FURjtBQUFBLE1BWUEsV0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSw2QkFGYjtPQWJGO0tBREY7QUFBQSxJQWtCQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixJQUFsQixDQUFBLENBQUE7QUFBQSxNQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixxQkFBeEIsRUFBK0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO0FBQzdDLGNBQUEsa0JBQUE7QUFBQSxVQUQrQyxnQkFBQSxV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

//# sourceURL=/home/takaaki/.atom/packages/file-icons/index.coffee
