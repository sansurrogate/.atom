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
      rustcBuildTest: {
        type: 'boolean',
        "default": false,
        description: "Lint test code, when using `rustc`"
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9saW50ZXItcnVzdC9saWIvaW5pdC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsbUJBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsUUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSw0QkFGYjtPQURGO0FBQUEsTUFJQSxTQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsT0FEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLGlDQUZiO09BTEY7QUFBQSxNQVFBLGNBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxLQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsb0NBRmI7T0FURjtBQUFBLE1BWUEsU0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLE9BRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSx3Q0FGYjtPQWJGO0FBQUEsTUFnQkEsWUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLE9BRFQ7QUFBQSxRQUVBLE1BQUEsRUFBTSxDQUFDLE9BQUQsRUFBVSxPQUFWLEVBQW1CLE1BQW5CLEVBQTJCLE9BQTNCLEVBQW9DLFFBQXBDLENBRk47QUFBQSxRQUdBLFdBQUEsRUFBYSwwUEFIYjtPQWpCRjtBQUFBLE1BMEJBLHFCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsWUFEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLHlCQUZiO09BM0JGO0FBQUEsTUE4QkEsVUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLENBRFQ7QUFBQSxRQUVBLE1BQUEsRUFBTSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLEVBQWhCLENBRk47QUFBQSxRQUdBLFdBQUEsRUFBYSx5Q0FIYjtPQS9CRjtBQUFBLE1BbUNBLGdCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxPQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsRUFEVDtBQUFBLFFBRUEsS0FBQSxFQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sUUFBTjtTQUhGO0FBQUEsUUFJQSxXQUFBLEVBQWEsa0VBSmI7T0FwQ0Y7S0FERjtBQUFBLElBMkNBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDUixNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksc0VBQVosQ0FBQSxDQUFBO0FBQUEsTUFHRyxPQUFBLENBQVEsbUJBQVIsQ0FBNEIsQ0FBQyxPQUFoQyxDQUFBLENBSEEsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUxqQixDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLHVCQUFwQixFQUE2QyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxTQUFELEdBQUE7aUJBQzlELEtBQUMsQ0FBQSxTQUFELEdBQWEsVUFEaUQ7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QyxDQUFuQixDQVBBLENBQUE7QUFBQSxNQVVBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsNEJBQXBCLEVBQWtELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLGNBQUQsR0FBQTtpQkFDbkUsS0FBQyxDQUFBLGNBQUQsR0FBa0IsZUFEaUQ7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsRCxDQUFuQixDQVZBLENBQUE7QUFBQSxNQWFBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsdUJBQXBCLEVBQTZDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLFNBQUQsR0FBQTtpQkFDOUQsS0FBQyxDQUFBLFNBQUQsR0FBYSxVQURpRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdDLENBQW5CLENBYkEsQ0FBQTtBQUFBLE1BZ0JBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsdUJBQXBCLEVBQTZDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLFlBQUQsR0FBQTtpQkFDOUQsS0FBQyxDQUFBLFlBQUQsR0FBZ0IsYUFEOEM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QyxDQUFuQixDQWhCQSxDQUFBO0FBQUEsTUFtQkEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixzQkFBcEIsRUFBNEMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsUUFBRCxHQUFBO2lCQUM3RCxLQUFDLENBQUEsUUFBRCxHQUFZLFNBRGlEO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUMsQ0FBbkIsQ0FuQkEsQ0FBQTtBQUFBLE1Bc0JBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsbUNBQXBCLEVBQXlELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLHFCQUFELEdBQUE7aUJBQzFFLEtBQUMsQ0FBQSxxQkFBRCxHQUF5QixzQkFEaUQ7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6RCxDQUFuQixDQXRCQSxDQUFBO2FBeUJBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0Isd0JBQXBCLEVBQThDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLFVBQUQsR0FBQTtpQkFDL0QsS0FBQyxDQUFBLFVBQUQsR0FBYyxXQURpRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlDLENBQW5CLEVBMUJRO0lBQUEsQ0EzQ1Y7QUFBQSxJQXdFQSxVQUFBLEVBQVksU0FBQSxHQUFBO2FBQ1YsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsRUFEVTtJQUFBLENBeEVaO0FBQUEsSUE0RUEsYUFBQSxFQUFlLFNBQUEsR0FBQTtBQUNiLFVBQUEsVUFBQTtBQUFBLE1BQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBQWIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxVQUFBLENBQUEsQ0FEaEIsQ0FBQTtBQUVBLGFBQU87QUFBQSxRQUNMLElBQUEsRUFBTSxNQUREO0FBQUEsUUFFTCxhQUFBLEVBQWUsQ0FBQyxhQUFELENBRlY7QUFBQSxRQUdMLEtBQUEsRUFBTyxTQUhGO0FBQUEsUUFJTCxJQUFBLEVBQU0sSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUpYO0FBQUEsUUFLTCxTQUFBLEVBQVcsS0FMTjtPQUFQLENBSGE7SUFBQSxDQTVFZjtHQUhGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/takaaki/.atom/packages/linter-rust/lib/init.coffee
