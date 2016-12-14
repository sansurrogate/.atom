(function() {
  var AtomGitDiffDetailsView;

  AtomGitDiffDetailsView = require("./git-diff-details-view");

  module.exports = {
    config: {
      closeAfterCopy: {
        type: "boolean",
        "default": false,
        title: "Close diff view after copy"
      },
      keepViewToggled: {
        type: "boolean",
        "default": true,
        title: "Keep view toggled when leaving a diff"
      },
      enableSyntaxHighlighting: {
        type: "boolean",
        "default": false,
        title: "Enable syntax highlighting in diff view"
      },
      showWordDiffs: {
        type: "boolean",
        "default": true,
        title: "Show word diffs"
      }
    },
    activate: function() {
      return atom.workspace.observeTextEditors(function(editor) {
        return new AtomGitDiffDetailsView(editor);
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtZGlmZi1kZXRhaWxzL2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxzQkFBQTs7QUFBQSxFQUFBLHNCQUFBLEdBQXlCLE9BQUEsQ0FBUSx5QkFBUixDQUF6QixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxjQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsS0FEVDtBQUFBLFFBRUEsS0FBQSxFQUFPLDRCQUZQO09BREY7QUFBQSxNQUtBLGVBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxJQURUO0FBQUEsUUFFQSxLQUFBLEVBQU8sdUNBRlA7T0FORjtBQUFBLE1BVUEsd0JBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxLQURUO0FBQUEsUUFFQSxLQUFBLEVBQU8seUNBRlA7T0FYRjtBQUFBLE1BZUEsYUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxRQUVBLEtBQUEsRUFBTyxpQkFGUDtPQWhCRjtLQURGO0FBQUEsSUFxQkEsUUFBQSxFQUFVLFNBQUEsR0FBQTthQUNSLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsU0FBQyxNQUFELEdBQUE7ZUFDNUIsSUFBQSxzQkFBQSxDQUF1QixNQUF2QixFQUQ0QjtNQUFBLENBQWxDLEVBRFE7SUFBQSxDQXJCVjtHQUhGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/takaaki/.atom/packages/git-diff-details/lib/main.coffee
