(function() {
  var CiteView, CompositeDisposable, LabelView, Latexer, LatexerHook;

  LabelView = require('./label-view');

  CiteView = require('./cite-view');

  LatexerHook = require('./latexer-hook');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = Latexer = {
    config: {
      parameters_to_search_citations_by: {
        type: "array",
        "default": ["title", "author"],
        items: {
          type: "string"
        }
      },
      autocomplete_environments: {
        type: "boolean",
        "default": true
      },
      autocomplete_references: {
        type: "boolean",
        "default": true
      },
      autocomplete_citations: {
        type: "boolean",
        "default": true
      }
    },
    activate: function() {
      var instance;
      instance = this;
      atom.commands.add("atom-text-editor", {
        "latexer:omnicomplete": function(event) {
          instance.latexHook.refCiteCheck(this.getModel(), true, true);
          return instance.latexHook.environmentCheck(this.getModel());
        },
        "latexer:insert-reference": function(event) {
          return instance.latexHook.lv.show(this.getModel());
        },
        "latexer:insert-citation": function(event) {
          return instance.latexHook.cv.show(this.getModel());
        }
      });
      return atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.latexHook = new LatexerHook(editor);
        };
      })(this));
    },
    deactivate: function() {
      return this.latexHook.destroy();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9sYXRleGVyL2xpYi9sYXRleGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw4REFBQTs7QUFBQSxFQUFBLFNBQUEsR0FBWSxPQUFBLENBQVEsY0FBUixDQUFaLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FEWCxDQUFBOztBQUFBLEVBRUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQUZkLENBQUE7O0FBQUEsRUFHQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBSEQsQ0FBQTs7QUFBQSxFQU1BLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLE9BQUEsR0FDZjtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxpQ0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sT0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLENBQUMsT0FBRCxFQUFVLFFBQVYsQ0FEVDtBQUFBLFFBRUEsS0FBQSxFQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sUUFBTjtTQUhGO09BREY7QUFBQSxNQU1BLHlCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsSUFEVDtPQVBGO0FBQUEsTUFVQSx1QkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7T0FYRjtBQUFBLE1BY0Esc0JBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxJQURUO09BZkY7S0FERjtBQUFBLElBb0JBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDUixVQUFBLFFBQUE7QUFBQSxNQUFBLFFBQUEsR0FBVyxJQUFYLENBQUE7QUFBQSxNQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixrQkFBbEIsRUFDRTtBQUFBLFFBQUEsc0JBQUEsRUFBd0IsU0FBQyxLQUFELEdBQUE7QUFDdEIsVUFBQSxRQUFRLENBQUMsU0FBUyxDQUFDLFlBQW5CLENBQWdDLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBaEMsRUFBNkMsSUFBN0MsRUFBbUQsSUFBbkQsQ0FBQSxDQUFBO2lCQUNBLFFBQVEsQ0FBQyxTQUFTLENBQUMsZ0JBQW5CLENBQW9DLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBcEMsRUFGc0I7UUFBQSxDQUF4QjtBQUFBLFFBR0EsMEJBQUEsRUFBNEIsU0FBQyxLQUFELEdBQUE7aUJBQzFCLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQXRCLENBQTJCLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBM0IsRUFEMEI7UUFBQSxDQUg1QjtBQUFBLFFBS0EseUJBQUEsRUFBMkIsU0FBQyxLQUFELEdBQUE7aUJBQ3pCLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQXRCLENBQTJCLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBM0IsRUFEeUI7UUFBQSxDQUwzQjtPQURGLENBREEsQ0FBQTthQVNBLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO2lCQUNoQyxLQUFDLENBQUEsU0FBRCxHQUFpQixJQUFBLFdBQUEsQ0FBWSxNQUFaLEVBRGU7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxFQVZRO0lBQUEsQ0FwQlY7QUFBQSxJQWlDQSxVQUFBLEVBQVksU0FBQSxHQUFBO2FBQ1YsSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFYLENBQUEsRUFEVTtJQUFBLENBakNaO0dBUEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/takaaki/.atom/packages/latexer/lib/latexer.coffee
