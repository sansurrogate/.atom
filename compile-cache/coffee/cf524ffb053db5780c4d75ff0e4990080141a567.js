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
      }
    },
    activate: function() {
      console.log('Linter-Rust: package loaded, ready to get initialized by AtomLinter.');
      require('atom-package-deps').install();
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.config.observe('linter-rust.rustcPath', (function(_this) {
        return function(rustcPath) {
          return _this.rustcPath = rustcPath;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.rustcBuildTest', (function(_this) {
        return function(rustcBuildTest) {
          return _this.rustcBuildTest = rustcBuildTest;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.cargoPath', (function(_this) {
        return function(cargoPath) {
          return _this.cargoPath = cargoPath;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.cargoPath', (function(_this) {
        return function(cargoCommand) {
          return _this.cargoCommand = cargoCommand;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.useCargo', (function(_this) {
        return function(useCargo) {
          return _this.useCargo = useCargo;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.cargoManifestFilename', (function(_this) {
        return function(cargoManifestFilename) {
          return _this.cargoManifestFilename = cargoManifestFilename;
        };
      })(this)));
      return this.subscriptions.add(atom.config.observe('linter-rust.jobsNumber', (function(_this) {
        return function(jobsNumber) {
          return _this.jobsNumber = jobsNumber;
        };
      })(this)));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9saW50ZXItcnVzdC9saWIvaW5pdC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsbUJBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsUUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSw0QkFGYjtPQURGO0FBQUEsTUFJQSxTQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsT0FEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLGlDQUZiO09BTEY7QUFBQSxNQVFBLFNBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxPQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsd0NBRmI7T0FURjtBQUFBLE1BWUEsWUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLE9BRFQ7QUFBQSxRQUVBLE1BQUEsRUFBTSxDQUFDLE9BQUQsRUFBVSxPQUFWLEVBQW1CLE1BQW5CLEVBQTJCLE9BQTNCLEVBQW9DLFFBQXBDLENBRk47QUFBQSxRQUdBLFdBQUEsRUFBYSwwUEFIYjtPQWJGO0FBQUEsTUFzQkEscUJBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxZQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEseUJBRmI7T0F2QkY7QUFBQSxNQTBCQSxVQUFBLEVBQ0U7QUFB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

//# sourceURL=/home/takaaki/.atom/packages/linter-rust/lib/init.coffee
