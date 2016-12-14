(function() {
  var CompositeDisposable, LinterRust, XRegExp, atom_linter, errorModes, fs, path, semver,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs');

  path = require('path');

  CompositeDisposable = require('atom').CompositeDisposable;

  atom_linter = require('atom-linter');

  semver = require('semver');

  XRegExp = require('xregexp');

  errorModes = require('./mode');

  LinterRust = (function() {
    LinterRust.prototype.patternRustcVersion = XRegExp('rustc (?<version>1.\\d+.\\d+)(?:(?:-(?<nightly>nightly)|(?:[^\\s]+))? \\((?:[^\\s]+) (?<date>\\d{4}-\\d{2}-\\d{2})\\))?');

    LinterRust.prototype.cargoDependencyDir = "target/debug/deps";

    function LinterRust() {
      this.locateCargo = __bind(this.locateCargo, this);
      this.decideErrorMode = __bind(this.decideErrorMode, this);
      this.compilationFeatures = __bind(this.compilationFeatures, this);
      this.initCmd = __bind(this.initCmd, this);
      this.lint = __bind(this.lint, this);
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.config.observe('linter-rust.rustcPath', (function(_this) {
        return function(rustcPath) {
          if (rustcPath) {
            rustcPath = rustcPath.trim();
          }
          return _this.rustcPath = rustcPath;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.cargoPath', (function(_this) {
        return function(cargoPath) {
          return _this.cargoPath = cargoPath;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.useCargo', (function(_this) {
        return function(useCargo) {
          return _this.useCargo = useCargo;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.cargoCommand', (function(_this) {
        return function(cargoCommand) {
          return _this.cargoCommand = cargoCommand;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.rustcBuildTest', (function(_this) {
        return function(rustcBuildTest) {
          return _this.rustcBuildTest = rustcBuildTest;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.cargoManifestFilename', (function(_this) {
        return function(cargoManifestFilename) {
          return _this.cargoManifestFilename = cargoManifestFilename;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.jobsNumber', (function(_this) {
        return function(jobsNumber) {
          return _this.jobsNumber = jobsNumber;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.disabledWarnings', (function(_this) {
        return function(disabledWarnings) {
          return _this.disabledWarnings = disabledWarnings;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.specifiedFeatures', (function(_this) {
        return function(specifiedFeatures) {
          return _this.specifiedFeatures = specifiedFeatures;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter-rust.allowedToCacheVersions', (function(_this) {
        return function(allowedToCacheVersions) {
          return _this.allowedToCacheVersions = allowedToCacheVersions;
        };
      })(this)));
    }

    LinterRust.prototype.destroy = function() {
      return this.subscriptions.dispose();
    };

    LinterRust.prototype.lint = function(textEditor) {
      return this.initCmd(textEditor.getPath()).then((function(_this) {
        return function(result) {
          var additional, args, cmd, cmd_res, command, curDir, cwd, env, errorMode, file;
          cmd_res = result[0], errorMode = result[1];
          file = cmd_res[0], cmd = cmd_res[1];
          env = JSON.parse(JSON.stringify(process.env));
          curDir = path.dirname(file);
          cwd = curDir;
          command = cmd[0];
          args = cmd.slice(1);
          env.PATH = path.dirname(cmd[0]) + path.delimiter + env.PATH;
          if (errorMode === errorModes.FLAGS_JSON_CARGO) {
            if ((env.RUSTFLAGS == null) || !(env.RUSTFLAGS.indexOf('--error-format=json') >= 0)) {
              additional = env.RUSTFLAGS != null ? ' ' + env.RUSTFLAGS : '';
              env.RUSTFLAGS = '--error-format=json' + additional;
            }
          }
          return atom_linter.exec(command, args, {
            env: env,
            cwd: cwd,
            stream: 'both'
          }).then(function(result) {
            var exitCode, messages, output, showDevModeWarning, stderr, stdout;
            stdout = result.stdout, stderr = result.stderr, exitCode = result.exitCode;
            if (stderr.indexOf('does not have these features') >= 0) {
              atom.notifications.addError("Invalid specified features", {
                detail: "" + stderr,
                dismissable: true
              });
              return [];
            } else if (exitCode === 101 || exitCode === 0) {
              showDevModeWarning = function(stream, message) {
                return atom.notifications.addWarning("Output from " + stream + " while linting", {
                  detail: "" + message,
                  description: "This is shown because Atom is running in dev-mode and probably not an actual error",
                  dismissable: true
                });
              };
              if (atom.inDevMode()) {
                if (stderr) {
                  showDevModeWarning('stderr', stderr);
                }
                if (stdout) {
                  showDevModeWarning('stdout', stdout);
                }
              }
              output = errorMode.neededOutput(stdout, stderr);
              messages = errorMode.parse(output, {
                disabledWarnings: _this.disabledWarnings,
                textEditor: textEditor
              });
              messages.forEach(function(message) {
                if (!(path.isAbsolute(message.filePath))) {
                  return message.filePath = path.join(curDir, message.filePath);
                }
              });
              return messages;
            } else {
              atom.notifications.addError("Failed to run " + command + " with exit code " + exitCode, {
                detail: "with args:\n " + (args.join(' ')) + "\nSee console for more information",
                dismissable: true
              });
              console.log("stdout:");
              console.log(stdout);
              console.log("stderr:");
              console.log(stderr);
              return [];
            }
          })["catch"](function(error) {
            console.log(error);
            atom.notifications.addError("Failed to run " + command, {
              detail: "" + error.message,
              dismissable: true
            });
            return [];
          });
        };
      })(this));
    };

    LinterRust.prototype.initCmd = function(editingFile) {
      var cargoManifestPath, curDir;
      curDir = path.dirname(editingFile);
      cargoManifestPath = this.locateCargo(curDir);
      if (!this.useCargo || !cargoManifestPath) {
        return this.decideErrorMode(curDir, 'rustc').then((function(_this) {
          return function(mode) {
            return mode.buildArguments(_this, [editingFile, cargoManifestPath]).then(function(cmd) {
              return [cmd, mode];
            });
          };
        })(this));
      } else {
        return this.decideErrorMode(curDir, 'cargo').then((function(_this) {
          return function(mode) {
            return mode.buildArguments(_this, cargoManifestPath).then(function(cmd) {
              return [cmd, mode];
            });
          };
        })(this));
      }
    };

    LinterRust.prototype.compilationFeatures = function(cargo) {
      var cfgs, f, result;
      if (this.specifiedFeatures.length > 0) {
        if (cargo) {
          return ['--features', this.specifiedFeatures.join(' ')];
        } else {
          result = [];
          cfgs = (function() {
            var _i, _len, _ref, _results;
            _ref = this.specifiedFeatures;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              f = _ref[_i];
              _results.push(result.push(['--cfg', "feature=\"" + f + "\""]));
            }
            return _results;
          }).call(this);
          return result;
        }
      }
    };

    LinterRust.prototype.decideErrorMode = function(curDir, commandMode) {
      if ((this.cachedErrorMode != null) && this.allowedToCacheVersions) {
        return Promise.resolve().then((function(_this) {
          return function() {
            return _this.cachedErrorMode;
          };
        })(this));
      } else {
        return atom_linter.exec(this.rustcPath, ['--version'], {
          cwd: curDir
        }).then((function(_this) {
          return function(stdout) {
            var canUseIntermediateJSON, canUseProperCargoJSON, match, nightlyWithJSON, stableWithJSON;
            try {
              match = XRegExp.exec(stdout, _this.patternRustcVersion);
              if (match) {
                nightlyWithJSON = match.nightly && match.date > '2016-08-08';
                stableWithJSON = !match.nightly && semver.gte(match.version, '1.12.0');
                canUseIntermediateJSON = nightlyWithJSON || stableWithJSON;
                switch (commandMode) {
                  case 'cargo':
                    canUseProperCargoJSON = match.nightly && match.date >= '2016-10-10';
                    if (canUseProperCargoJSON) {
                      return errorModes.JSON_CARGO;
                    } else if (canUseIntermediateJSON) {
                      return errorModes.FLAGS_JSON_CARGO;
                    } else {
                      return errorModes.OLD_CARGO;
                    }
                    break;
                  case 'rustc':
                    if (canUseIntermediateJSON) {
                      return errorModes.JSON_RUSTC;
                    } else {
                      return errorModes.OLD_RUSTC;
                    }
                }
              } else {
                throw 'rustc returned unexpected result: ' + stdout;
              }
            } catch (_error) {}
          };
        })(this)).then((function(_this) {
          return function(result) {
            _this.cachedErrorMode = result;
            return result;
          };
        })(this));
      }
    };

    LinterRust.prototype.locateCargo = function(curDir) {
      var directory, root_dir;
      root_dir = /^win/.test(process.platform) ? /^.:\\$/ : /^\/$/;
      directory = path.resolve(curDir);
      while (true) {
        if (fs.existsSync(path.join(directory, this.cargoManifestFilename))) {
          return path.join(directory, this.cargoManifestFilename);
        }
        if (root_dir.test(directory)) {
          break;
        }
        directory = path.resolve(path.join(directory, '..'));
      }
      return false;
    };

    return LinterRust;

  })();

  module.exports = LinterRust;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9saW50ZXItcnVzdC9saWIvbGludGVyLXJ1c3QuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1GQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUdDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFIRCxDQUFBOztBQUFBLEVBSUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxhQUFSLENBSmQsQ0FBQTs7QUFBQSxFQUtBLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUixDQUxULENBQUE7O0FBQUEsRUFNQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVIsQ0FOVixDQUFBOztBQUFBLEVBUUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxRQUFSLENBUmIsQ0FBQTs7QUFBQSxFQVVNO0FBQ0oseUJBQUEsbUJBQUEsR0FBcUIsT0FBQSxDQUFRLHlIQUFSLENBQXJCLENBQUE7O0FBQUEseUJBRUEsa0JBQUEsR0FBb0IsbUJBRnBCLENBQUE7O0FBSWEsSUFBQSxvQkFBQSxHQUFBO0FBQ1gsdURBQUEsQ0FBQTtBQUFBLCtEQUFBLENBQUE7QUFBQSx1RUFBQSxDQUFBO0FBQUEsK0NBQUEsQ0FBQTtBQUFBLHlDQUFBLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFBakIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQix1QkFBcEIsRUFDbkIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsU0FB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

//# sourceURL=/home/takaaki/.atom/packages/linter-rust/lib/linter-rust.coffee
