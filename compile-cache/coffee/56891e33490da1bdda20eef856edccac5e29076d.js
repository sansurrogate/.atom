(function() {
  var Disposable, Linter;

  Disposable = require('atom').Disposable;

  module.exports = Linter = {
    instance: null,
    config: {
      lintOnFly: {
        title: 'Lint As You Type',
        description: 'Lint files while typing, without the need to save',
        type: 'boolean',
        "default": true,
        order: 1
      },
      lintOnFlyInterval: {
        title: 'Lint As You Type Interval',
        description: 'Interval at which providers are triggered as you type (in ms)',
        type: 'integer',
        "default": 300,
        order: 1
      },
      ignoredMessageTypes: {
        description: 'Comma separated list of message types to completely ignore',
        type: 'array',
        "default": [],
        items: {
          type: 'string'
        },
        order: 2
      },
      ignoreVCSIgnoredFiles: {
        title: 'Do Not Lint Files Ignored by VCS',
        description: 'E.g., ignore files specified in .gitignore',
        type: 'boolean',
        "default": true,
        order: 2
      },
      ignoreMatchedFiles: {
        title: 'Do Not Lint Files that match this Glob',
        type: 'string',
        "default": '/**/*.min.{js,css}',
        order: 2
      },
      showErrorInline: {
        title: 'Show Inline Error Tooltips',
        type: 'boolean',
        "default": true,
        order: 3
      },
      inlineTooltipInterval: {
        title: 'Inline Tooltip Interval',
        description: 'Interval at which inline tooltip is updated (in ms)',
        type: 'integer',
        "default": 60,
        order: 3
      },
      gutterEnabled: {
        title: 'Highlight Error Lines in Gutter',
        type: 'boolean',
        "default": true,
        order: 3
      },
      gutterPosition: {
        title: 'Position of Gutter Highlights',
        "enum": ['Left', 'Right'],
        "default": 'Right',
        order: 3,
        type: 'string'
      },
      underlineIssues: {
        title: 'Underline Issues',
        type: 'boolean',
        "default": true,
        order: 3
      },
      showProviderName: {
        title: 'Show Provider Name (When Available)',
        type: 'boolean',
        "default": true,
        order: 3
      },
      showErrorPanel: {
        title: 'Show Error Panel',
        description: 'Show a list of errors at the bottom of the editor',
        type: 'boolean',
        "default": true,
        order: 4
      },
      errorPanelHeight: {
        title: 'Error Panel Height',
        description: 'Height of the error panel (in px)',
        type: 'number',
        "default": 150,
        order: 4
      },
      alwaysTakeMinimumSpace: {
        title: 'Automatically Reduce Error Panel Height',
        description: 'Reduce panel height when it exceeds the height of the error list',
        type: 'boolean',
        "default": true,
        order: 4
      },
      displayLinterInfo: {
        title: 'Display Linter Info in the Status Bar',
        description: 'Whether to show any linter information in the status bar',
        type: 'boolean',
        "default": true,
        order: 5
      },
      displayLinterStatus: {
        title: 'Display Linter Status Info in Status Bar',
        description: 'The `No Issues` or `X Issues` widget',
        type: 'boolean',
        "default": true,
        order: 5
      },
      showErrorTabLine: {
        title: 'Show "Line" Tab in the Status Bar',
        type: 'boolean',
        "default": false,
        order: 5
      },
      showErrorTabFile: {
        title: 'Show "File" Tab in the Status Bar',
        type: 'boolean',
        "default": true,
        order: 5
      },
      showErrorTabProject: {
        title: 'Show "Project" Tab in the Status Bar',
        type: 'boolean',
        "default": true,
        order: 5
      },
      statusIconScope: {
        title: 'Scope of Linter Messages to Show in Status Icon',
        type: 'string',
        "enum": ['File', 'Line', 'Project'],
        "default": 'Project',
        order: 5
      },
      statusIconPosition: {
        title: 'Position of Status Icon in the Status Bar',
        "enum": ['Left', 'Right'],
        type: 'string',
        "default": 'Left',
        order: 5
      }
    },
    activate: function(state) {
      var LinterPlus;
      Linter.state = state;
      LinterPlus = require('./linter.coffee');
      return this.instance = new LinterPlus(state);
    },
    serialize: function() {
      return Linter.state;
    },
    consumeLinter: function(linters) {
      var linter, _i, _len;
      if (!(linters instanceof Array)) {
        linters = [linters];
      }
      for (_i = 0, _len = linters.length; _i < _len; _i++) {
        linter = linters[_i];
        this.instance.addLinter(linter);
      }
      return new Disposable((function(_this) {
        return function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = linters.length; _j < _len1; _j++) {
            linter = linters[_j];
            _results.push(_this.instance.deleteLinter(linter));
          }
          return _results;
        };
      })(this));
    },
    consumeStatusBar: function(statusBar) {
      return this.instance.views.attachBottom(statusBar);
    },
    provideLinter: function() {
      return this.instance;
    },
    provideIndie: function() {
      var _ref;
      return (_ref = this.instance) != null ? _ref.indieLinters : void 0;
    },
    deactivate: function() {
      var _ref;
      return (_ref = this.instance) != null ? _ref.deactivate() : void 0;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL21haW4uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtCQUFBOztBQUFBLEVBQUMsYUFBYyxPQUFBLENBQVEsTUFBUixFQUFkLFVBQUQsQ0FBQTs7QUFBQSxFQUNBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLE1BQUEsR0FDZjtBQUFBLElBQUEsUUFBQSxFQUFVLElBQVY7QUFBQSxJQUNBLE1BQUEsRUFDRTtBQUFBLE1BQUEsU0FBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sa0JBQVA7QUFBQSxRQUNBLFdBQUEsRUFBYSxtREFEYjtBQUFBLFFBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxRQUdBLFNBQUEsRUFBUyxJQUhUO0FBQUEsUUFJQSxLQUFBLEVBQU8sQ0FKUDtPQURGO0FBQUEsTUFNQSxpQkFBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sMkJBQVA7QUFBQSxRQUNBLFdBQUEsRUFBYSwrREFEYjtBQUFBLFFBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxRQUdBLFNBQUEsRUFBUyxHQUhUO0FBQUEsUUFJQSxLQUFBLEVBQU8sQ0FKUDtPQVBGO0FBQUEsTUFhQSxtQkFBQSxFQUNFO0FBQUEsUUFBQSxXQUFBLEVBQWEsNERBQWI7QUFBQSxRQUNBLElBQUEsRUFBTSxPQUROO0FBQUEsUUFFQSxTQUFBLEVBQVMsRUFGVDtBQUFBLFFBR0EsS0FBQSxFQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sUUFBTjtTQUpGO0FBQUEsUUFLQSxLQUFBLEVBQU8sQ0FMUDtPQWRGO0FBQUEsTUFvQkEscUJBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLGtDQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsNENBRGI7QUFBQSxRQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsUUFHQSxTQUFBLEVBQVMsSUFIVDtBQUFBLFFBSUEsS0FBQSxFQUFPLENBSlA7T0FyQkY7QUFBQSxNQTBCQSxrQkFBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sd0NBQVA7QUFBQSxRQUNBLElBQUEsRUFBTSxRQUROO0FBQUEsUUFFQSxTQUFBLEVBQVMsb0JBRlQ7QUFBQSxRQUdBLEtBQUEsRUFBTyxDQUhQO09BM0JGO0FBQUEsTUFnQ0EsZUFBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sNEJBQVA7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUROO0FBQUEsUUFFQSxTQUFBLEVBQVMsSUFGVDtBQUFBLFFBR0EsS0FBQSxFQUFPLENBSFA7T0FqQ0Y7QUFBQSxNQXFDQSxxQkFBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8seUJBQVA7QUFBQSxRQUNBLFdBQUEsRUFBYSxxREFEYjtBQUFBLFFBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxRQUdBLFNBQUEsRUFBUyxFQUhUO0FBQUEsUUFJQSxLQUFBLEVBQU8sQ0FKUDtPQXRDRjtBQUFBLE1BMkNBLGFBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLGlDQUFQO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FETjtBQUFBLFFBRUEsU0FBQSxFQUFTLElBRlQ7QUFBQSxRQUdBLEtBQUEsRUFBTyxDQUhQO09BNUNGO0FBQUEsTUFnREEsY0FBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sK0JBQVA7QUFBQSxRQUNBLE1BQUEsRUFBTSxDQUFDLE1BQUQsRUFBUyxPQUFULENBRE47QUFBQSxRQUVBLFNBQUEsRUFBUyxPQUZUO0FBQUEsUUFHQSxLQUFBLEVBQU8sQ0FIUDtBQUFBLFFBSUEsSUFBQSxFQUFNLFFBSk47T0FqREY7QUFBQSxNQXNEQSxlQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxrQkFBUDtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxRQUVBLFNBQUEsRUFBUyxJQUZUO0FBQUEsUUFHQSxLQUFBLEVBQU8sQ0FIUDtPQXZERjtBQUFBLE1BMkRBLGdCQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxxQ0FBUDtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxRQUVBLFNBQUEsRUFBUyxJQUZUO0FBQUEsUUFHQSxLQUFBLEVBQU8sQ0FIUDtPQTVERjtBQUFBLE1BaUVBLGNBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLGtCQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsbURBRGI7QUFBQSxRQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsUUFHQSxTQUFBLEVBQVMsSUFIVDtBQUFBLFFBSUEsS0FBQSxFQUFPLENBSlA7T0FsRUY7QUFBQSxNQXVFQSxnQkFBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sb0JBQVA7QUFBQSxRQUNBLFdBQUEsRUFBYSxtQ0FEYjtBQUFBLFFBRUEsSUFBQSxFQUFNLFFBRk47QUFBQSxRQUdBLFNBQUEsRUFBUyxHQUhUO0FBQUEsUUFJQSxLQUFBLEVBQU8sQ0FKUDtPQXhFRjtBQUFBLE1BNkVBLHNCQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyx5Q0FBUDtBQUFBLFFBQ0EsV0FBQSxFQUFhLGtFQURiO0FBQUEsUUFFQSxJQUFBLEVBQU0sU0FGTjtBQUFBLFFBR0EsU0FBQSxFQUFTLElBSFQ7QUFBQSxRQUlBLEtBQUEsRUFBTyxDQUpQO09BOUVGO0FBQUEsTUFvRkEsaUJBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLHVDQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsMERBRGI7QUFBQSxRQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsUUFHQSxTQUFBLEVBQVMsSUFIVDtBQUFBLFFBSUEsS0FBQSxFQUFPLENBSlA7T0FyRkY7QUFBQSxNQTBGQSxtQkFBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sMENBQVA7QUFBQSxRQUNBLFdBQUEsRUFBYSxzQ0FEYjtBQUFBLFFBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxRQUdBLFNBQUEsRUFBUyxJQUhUO0FBQUEsUUFJQSxLQUFBLEVBQU8sQ0FKUDtPQTNGRjtBQUFBLE1BZ0dBLGdCQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxtQ0FBUDtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxRQUVBLFNBQUEsRUFBUyxLQUZUO0FBQUEsUUFHQSxLQUFBLEVBQU8sQ0FIUDtPQWpHRjtBQUFBLE1BcUdBLGdCQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxtQ0FBUDtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxRQUVBLFNBQUEsRUFBUyxJQUZUO0FBQUEsUUFHQSxLQUFBLEVBQU8sQ0FIUDtPQXRHRjtBQUFBLE1BMEdBLG1CQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxzQ0FBUDtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxRQUVBLFNBQUEsRUFBUyxJQUZUO0FBQUEsUUFHQSxLQUFBLEVBQU8sQ0FIUDtPQTNHRjtBQUFBLE1BK0dBLGVBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLGlEQUFQO0FBQUEsUUFDQSxJQUFBLEVBQU0sUUFETjtBQUFBLFFBRUEsTUFBQSxFQUFNLENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsU0FBakIsQ0FGTjtBQUFBLFFBR0EsU0FBQSxFQUFTLFNBSFQ7QUFBQSxRQUlBLEtBQUEsRUFBTyxDQUpQO09BaEhGO0FBQUEsTUFxSEEsa0JBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLDJDQUFQO0FBQUEsUUFDQSxNQUFBLEVBQU0sQ0FBQyxNQUFELEVBQVMsT0FBVCxDQUROO0FBQUEsUUFFQSxJQUFBLEVBQU0sUUFGTjtBQUFBLFFBR0EsU0FBQSxFQUFTLE1BSFQ7QUFBQSxRQUlBLEtBQUEsRUFBTyxDQUpQO09BdEhGO0tBRkY7QUFBQSxJQThIQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixVQUFBLFVBQUE7QUFBQSxNQUFBLE1BQU0sQ0FBQyxLQUFQLEdBQWUsS0FBZixDQUFBO0FBQUEsTUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGlCQUFSLENBRGIsQ0FBQTthQUVBLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsVUFBQSxDQUFXLEtBQVgsRUFIUjtJQUFBLENBOUhWO0FBQUEsSUFtSUEsU0FBQSxFQUFXLFNBQUEsR0FBQTthQUNULE1BQU0sQ0FBQyxNQURFO0lBQUEsQ0FuSVg7QUFBQSxJQXNJQSxhQUFBLEVBQWUsU0FBQyxPQUFELEdBQUE7QUFDYixVQUFBLGdCQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsQ0FBTyxPQUFBLFlBQW1CLEtBQTFCLENBQUE7QUFDRSxRQUFBLE9BQUEsR0FBVSxDQUFFLE9BQUYsQ0FBVixDQURGO09BQUE7QUFHQSxXQUFBLDhDQUFBOzZCQUFBO0FBQ0UsUUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVYsQ0FBb0IsTUFBcEIsQ0FBQSxDQURGO0FBQUEsT0FIQTthQU1JLElBQUEsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDYixjQUFBLG1CQUFBO0FBQUE7ZUFBQSxnREFBQTtpQ0FBQTtBQUNFLDBCQUFBLEtBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixNQUF2QixFQUFBLENBREY7QUFBQTswQkFEYTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsRUFQUztJQUFBLENBdElmO0FBQUEsSUFpSkEsZ0JBQUEsRUFBa0IsU0FBQyxTQUFELEdBQUE7YUFDaEIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFLLENBQUMsWUFBaEIsQ0FBNkIsU0FBN0IsRUFEZ0I7SUFBQSxDQWpKbEI7QUFBQSxJQW9KQSxhQUFBLEVBQWUsU0FBQSxHQUFBO2FBQ2IsSUFBQyxDQUFBLFNBRFk7SUFBQSxDQXBKZjtBQUFBLElBdUpBLFlBQUEsRUFBYyxTQUFBLEdBQUE7QUFDWixVQUFBLElBQUE7a0RBQVMsQ0FBRSxzQkFEQztJQUFBLENBdkpkO0FBQUEsSUEwSkEsVUFBQSxFQUFZLFNBQUEsR0FBQTtBQUNWLFVBQUEsSUFBQTtrREFBUyxDQUFFLFVBQVgsQ0FBQSxXQURVO0lBQUEsQ0ExSlo7R0FGRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/takaaki/.atom/packages/linter/lib/main.coffee
