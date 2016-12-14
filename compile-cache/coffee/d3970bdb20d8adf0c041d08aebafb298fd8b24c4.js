(function() {
  var CompositeDisposable, _;

  CompositeDisposable = require('atom').CompositeDisposable;

  _ = require('underscore-plus');

  module.exports = {
    config: {
      racerBinPath: {
        title: 'Path to the Racer executable',
        type: 'string',
        "default": '/usr/local/bin/racer',
        order: 1
      },
      rustSrcPath: {
        title: 'Path to the Rust source code directory',
        type: 'string',
        "default": '/usr/local/src/rust/src/',
        order: 2
      },
      cargoHome: {
        title: 'Cargo home directory (optional)',
        type: 'string',
        description: 'Needed when providing completions for Cargo crates when Cargo is installed in a non-standard location.',
        "default": '',
        order: 3
      },
      autocompleteBlacklist: {
        title: 'Autocomplete Scope Blacklist',
        description: 'Autocomplete suggestions will not be shown when the cursor is inside the following comma-delimited scope(s).',
        type: 'string',
        "default": '.source.go .comment',
        order: 4
      },
      show: {
        title: 'Show position for editor with definition',
        description: 'Choose one: Right, or New. If your view is vertically split, choosing Right will open the definition in the rightmost pane.',
        type: 'string',
        "default": 'New',
        "enum": ['Right', 'New'],
        order: 5
      }
    },
    racerProvider: null,
    subscriptions: null,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'racer:find-definition': (function(_this) {
          return function(e) {
            return _this.findDefinition(e);
          };
        })(this)
      }));
    },
    getRacerProvider: function() {
      var RacerProvider;
      if (this.racerProvider != null) {
        return this.racerProvider;
      }
      RacerProvider = require('./racer-provider');
      this.racerProvider = new RacerProvider();
      return this.racerProvider;
    },
    provideAutocompletion: function() {
      return this.getRacerProvider();
    },
    deactivate: function() {
      var _ref, _ref1;
      if ((_ref = this.racerProvider) != null) {
        _ref.dispose();
      }
      this.racerProvider = null;
      if ((_ref1 = this.subscriptions) != null) {
        _ref1.dispose();
      }
    },
    findDefinition: function(e) {
      var cursorPosition, grammar, textEditor;
      textEditor = atom.workspace.getActiveTextEditor();
      grammar = textEditor != null ? textEditor.getGrammar() : void 0;
      if (!grammar || grammar.name !== 'Rust' || textEditor.hasMultipleCursors()) {
        e.abortKeyBinding();
        return;
      }
      cursorPosition = textEditor.getCursorBufferPosition();
      return this.getRacerProvider().racerClient.check_definition(textEditor, cursorPosition.row, cursorPosition.column, (function(_this) {
        return function(defs) {
          var def, newEditorPosition, options, pane, textEditors;
          if (_.isEmpty(defs)) {
            return;
          }
          def = defs[0];
          textEditors = atom.workspace.getTextEditors();
          textEditor = _.find(textEditors, function(te) {
            return te.getPath() === def.filePath;
          });
          if (textEditor != null) {
            pane = atom.workspace.paneForItem(textEditor);
            pane.activate();
            pane.activateItem(textEditor);
            return textEditor.setCursorBufferPosition([def.line - 1, def.column]);
          } else {
            newEditorPosition = atom.config.get('racer.show');
            options = {
              initialLine: def.line - 1,
              initialColumn: def.column
            };
            if (newEditorPosition !== 'New') {
              options.split = newEditorPosition.toLowerCase();
            }
            return atom.workspace.open(def.filePath, options).then(function(te) {
              return te.scrollToCursorPosition();
            });
          }
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9yYWNlci9saWIvcmFjZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNCQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBREosQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBRUU7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsWUFBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sOEJBQVA7QUFBQSxRQUNBLElBQUEsRUFBTSxRQUROO0FBQUEsUUFFQSxTQUFBLEVBQVMsc0JBRlQ7QUFBQSxRQUdBLEtBQUEsRUFBTyxDQUhQO09BREY7QUFBQSxNQUtBLFdBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLHdDQUFQO0FBQUEsUUFDQSxJQUFBLEVBQU0sUUFETjtBQUFBLFFBRUEsU0FBQSxFQUFTLDBCQUZUO0FBQUEsUUFHQSxLQUFBLEVBQU8sQ0FIUDtPQU5GO0FBQUEsTUFVQSxTQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxpQ0FBUDtBQUFBLFFBQ0EsSUFBQSxFQUFNLFFBRE47QUFBQSxRQUVBLFdBQUEsRUFBYSx3R0FGYjtBQUFBLFFBR0EsU0FBQSxFQUFTLEVBSFQ7QUFBQSxRQUlBLEtBQUEsRUFBTyxDQUpQO09BWEY7QUFBQSxNQWdCQSxxQkFBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sOEJBQVA7QUFBQSxRQUNBLFdBQUEsRUFBYSw4R0FEYjtBQUFBLFFBRUEsSUFBQSxFQUFNLFFBRk47QUFBQSxRQUdBLFNBQUEsRUFBUyxxQkFIVDtBQUFBLFFBSUEsS0FBQSxFQUFPLENBSlA7T0FqQkY7QUFBQSxNQXNC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

//# sourceURL=/home/takaaki/.atom/packages/racer/lib/racer.coffee
