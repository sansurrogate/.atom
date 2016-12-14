(function() {
  var CompositeDisposable;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    config: {
      useCargo: {
        type: 'boolean',
        "default": true,
        description: "Use Cargo if it's possible"
      },
      rustcPath: {
        type: 'string',
        "default": 'rustc',
        description: "Path to Rust's compiler `rustc`"
      },
      cargoPath: {
        type: 'string',
        "default": 'cargo',
        description: "Path to Rust's package manager `cargo`"
      },
      cargoCommand: {
        type: 'string',
        "default": 'build',
        "enum": ['build', 'check', 'test', 'rustc', 'clippy'],
        description: "Use 'check' for fast linting (you need to install `cargo-check`). Use 'clippy' to increase amount of available lints (you need to install `clippy`). Use 'test' to lint test code, too. Use 'rustc' for fast linting (note: does not build the project)."
      },
      cargoManifestFilename: {
        type: 'string',
        "default": 'Cargo.toml',
        description: 'Cargo manifest filename'
      },
      jobsNumber: {
        type: 'integer',
        "default": 2,
        "enum": [1, 2, 4, 6, 8, 10],
        description: 'Number of jobs to run Cargo in parallel'
      },
      disabledWarnings: {
        type: 'array',
        "default": [],
        items: {
          type: 'string'
        },
        description: 'Linting warnings to be ignored in editor, separated with commas.'
      },
      specifiedFeatures: {
        type: 'array',
        "default": [],
        items: {
          type: 'string'
        },
        description: 'Additional features to be passed, when linting (for example, `secure, html`)'
      },
      rustcBuildTest: {
        type: 'boolean',
        "default": false,
        description: "Lint test code, when using `rustc`"
      },
      allowedToCacheVersions: {
        type: 'boolean',
        "default": true,
        description: "Uncheck this if you need to change toolchains during one Atom session. Otherwise toolchains' versions are saved for an entire Atom session to increase performance."
      }
    },
    activate: function() {
      return require('atom-package-deps').install('linter-rust');
    },
    provideLinter: function() {
      var LinterRust;
      LinterRust = require('./linter-rust');
      this.provider = new LinterRust();
      return {
        name: 'Rust',
        grammarScopes: ['source.rust'],
        scope: 'project',
        lint: this.provider.lint,
        lintOnFly: false
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9saW50ZXItcnVzdC9saWIvaW5pdC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsbUJBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsUUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSw0QkFGYjtPQURGO0FBQUEsTUFJQSxTQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsT0FEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLGlDQUZiO09BTEY7QUFBQSxNQVFBLFNBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxPQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsd0NBRmI7T0FURjtBQUFBLE1BWUEsWUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLE9BRFQ7QUFBQSxRQUVBLE1BQUEsRUFBTSxDQUFDLE9BQUQsRUFBVSxPQUFWLEVBQW1CLE1BQW5CLEVBQTJCLE9BQTNCLEVBQW9DLFFBQXBDLENBRk47QUFBQSxRQUdBLFdBQUEsRUFBYSwwUEFIYjtPQWJGO0FBQUEsTUFzQkEscUJBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxZQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEseUJBRmI7T0F2QkY7QUFBQSxNQTBCQSxVQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsQ0FEVDtBQUFBLFFBRUEsTUFBQSxFQUFNLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsRUFBaEIsQ0FGTjtBQUFBLFFBR0EsV0FBQSxFQUFhLHlDQUhiO09BM0JGO0FBQUEsTUErQkEsZ0JBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLE9BQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxFQURUO0FBQUEsUUFFQSxLQUFBLEVBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxRQUFOO1NBSEY7QUFBQSxRQUlBLFdBQUEsRUFBYSxrRUFKYjtPQWhDRjtBQUFBLE1BcUNBLGlCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxPQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsRUFEVDtBQUFBLFFBRUEsS0FBQSxFQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sUUFBTjtTQUhGO0FBQUEsUUFJQSxXQUFBLEVBQWEsOEVBSmI7T0F0Q0Y7QUFBQSxNQTJDQSxjQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsS0FEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLG9DQUZiO09BNUNGO0FBQUEsTUErQ0Esc0JBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxJQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEscUtBRmI7T0FoREY7S0FERjtBQUFBLElBc0RBLFFBQUEsRUFBVSxTQUFBLEdBQUE7YUFDUixPQUFBLENBQVEsbUJBQVIsQ0FBNEIsQ0FBQyxPQUE3QixDQUFxQyxhQUFyQyxFQURRO0lBQUEsQ0F0RFY7QUFBQSxJQTBEQSxhQUFBLEVBQWUsU0FBQSxHQUFBO0FBQ2IsVUFBQSxVQUFBO0FBQUEsTUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FBYixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLFVBQUEsQ0FBQSxDQURoQixDQUFBO2FBRUE7QUFBQSxRQUNFLElBQUEsRUFBTSxNQURSO0FBQUEsUUFFRSxhQUFBLEVBQWUsQ0FBQyxhQUFELENBRmpCO0FBQUEsUUFHRSxLQUFBLEVBQU8sU0FIVDtBQUFBLFFBSUUsSUFBQSxFQUFNLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFKbEI7QUFBQSxRQUtFLFNBQUEsRUFBVyxLQUxiO1FBSGE7SUFBQSxDQTFEZjtHQUhGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/takaaki/.atom/packages/linter-rust/lib/init.coffee
