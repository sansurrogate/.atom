(function() {
  var CompositeDisposable, LinterRust, XRegExp, atom_linter, errorModes, fs, path, semver,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs');

  path = require('path');

  CompositeDisposable = require('atom').CompositeDisposable;

  atom_linter = require('atom-linter');

  semver = require('semver');

  XRegExp = require('xregexp');

  errorModes = require('./mode');

  LinterRust = (function() {
    LinterRust.prototype.patternRustcVersion = XRegExp('rustc (?<version>1.\\d+.\\d+)(?:(?:-(?:(?<nightly>nightly)|(?<beta>beta.*?))|(?:[^\s]+))? \\((?:[^\\s]+) (?<date>\\d{4}-\\d{2}-\\d{2})\\))?');

    LinterRust.prototype.cargoDependencyDir = "target/debug/deps";

    function LinterRust() {
      this.locateCargo = bind(this.locateCargo, this);
      this.decideErrorMode = bind(this.decideErrorMode, this);
      this.compilationFeatures = bind(this.compilationFeatures, this);
      this.initCmd = bind(this.initCmd, this);
      this.lint = bind(this.lint, this);
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
            var i, len, ref, results;
            ref = this.specifiedFeatures;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              f = ref[i];
              results.push(result.push(['--cfg', "feature=\"" + f + "\""]));
            }
            return results;
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
                    canUseProperCargoJSON = (match.nightly && match.date >= '2016-10-10') || (match.beta || !match.nightly && semver.gte(match.version, '1.13.0'));
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
            } catch (error1) {}
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9saW50ZXItcnVzdC9saWIvbGludGVyLXJ1c3QuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxtRkFBQTtJQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRU4sc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixXQUFBLEdBQWMsT0FBQSxDQUFRLGFBQVI7O0VBQ2QsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUNULE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7RUFFVixVQUFBLEdBQWEsT0FBQSxDQUFRLFFBQVI7O0VBRVA7eUJBQ0osbUJBQUEsR0FBcUIsT0FBQSxDQUFRLDZJQUFSOzt5QkFFckIsa0JBQUEsR0FBb0I7O0lBRVAsb0JBQUE7Ozs7OztNQUNYLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFFckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQix1QkFBcEIsRUFDbkIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFNBQUQ7VUFDRSxJQUFpQyxTQUFqQztZQUFBLFNBQUEsR0FBZSxTQUFTLENBQUMsSUFBYixDQUFBLEVBQVo7O2lCQUNBLEtBQUMsQ0FBQSxTQUFELEdBQWE7UUFGZjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEbUIsQ0FBbkI7TUFLQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLHVCQUFwQixFQUNuQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsU0FBRDtpQkFDRSxLQUFDLENBQUEsU0FBRCxHQUFhO1FBRGY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRG1CLENB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QSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBekJOLEVBTEY7O0lBRmU7O3lCQXFDakIsV0FBQSxHQUFhLFNBQUMsTUFBRDtBQUNYLFVBQUE7TUFBQSxRQUFBLEdBQWMsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFPLENBQUMsUUFBcEIsQ0FBSCxHQUFxQyxRQUFyQyxHQUFtRDtNQUM5RCxTQUFBLEdBQVksSUFBSSxDQUFDLE9BQUwsQ0FBYSxNQUFiO0FBQ1osYUFBQSxJQUFBO1FBQ0UsSUFBc0QsRUFBRSxDQUFDLFVBQUgsQ0FBYyxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsSUFBQyxDQUFBLHFCQUF0QixDQUFkLENBQXREO0FBQUEsaUJBQU8sSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLElBQUMsQ0FBQSxxQkFBdEIsRUFBUDs7UUFDQSxJQUFTLFFBQVEsQ0FBQyxJQUFULENBQWMsU0FBZCxDQUFUO0FBQUEsZ0JBQUE7O1FBQ0EsU0FBQSxHQUFZLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLElBQXJCLENBQWI7TUFIZDtBQUlBLGFBQU87SUFQSTs7Ozs7O0VBU2YsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFsTWpCIiwic291cmNlc0NvbnRlbnQiOlsiZnMgPSByZXF1aXJlICdmcydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuYXRvbV9saW50ZXIgPSByZXF1aXJlICdhdG9tLWxpbnRlcidcbnNlbXZlciA9IHJlcXVpcmUgJ3NlbXZlcidcblhSZWdFeHAgPSByZXF1aXJlICd4cmVnZXhwJ1xuXG5lcnJvck1vZGVzID0gcmVxdWlyZSAnLi9tb2RlJ1xuXG5jbGFzcyBMaW50ZXJSdXN0XG4gIHBhdHRlcm5SdXN0Y1ZlcnNpb246IFhSZWdFeHAoJ3J1c3RjICg/PHZlcnNpb24+MS5cXFxcZCsuXFxcXGQrKSg/Oig/Oi0oPzooPzxuaWdodGx5Pm5pZ2h0bHkpfCg/PGJldGE+YmV0YS4qPykpfCg/OlteXFxzXSspKT8gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxcXCgoPzpbXlxcXFxzXSspICg/PGRhdGU+XFxcXGR7NH0tXFxcXGR7Mn0tXFxcXGR7Mn0pXFxcXCkpPycpXG4gIGNhcmdvRGVwZW5kZW5jeURpcjogXCJ0YXJnZXQvZGVidWcvZGVwc1wiXG5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ2xpbnRlci1ydXN0LnJ1c3RjUGF0aCcsXG4gICAgKHJ1c3RjUGF0aCkgPT5cbiAgICAgIHJ1c3RjUGF0aCA9IGRvIHJ1c3RjUGF0aC50cmltIGlmIHJ1c3RjUGF0aFxuICAgICAgQHJ1c3RjUGF0aCA9IHJ1c3RjUGF0aFxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ2xpbnRlci1ydXN0LmNhcmdvUGF0aCcsXG4gICAgKGNhcmdvUGF0aCkgPT5cbiAgICAgIEBjYXJnb1BhdGggPSBjYXJnb1BhdGhcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdsaW50ZXItcnVzdC51c2VDYXJnbycsXG4gICAgKHVzZUNhcmdvKSA9PlxuICAgICAgQHVzZUNhcmdvID0gdXNlQ2FyZ29cblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdsaW50ZXItcnVzdC5jYXJnb0NvbW1hbmQnLFxuICAgIChjYXJnb0NvbW1hbmQpID0+XG4gICAgICBAY2FyZ29Db21tYW5kID0gY2FyZ29Db21tYW5kXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnbGludGVyLXJ1c3QucnVzdGNCdWlsZFRlc3QnLFxuICAgIChydXN0Y0J1aWxkVGVzdCkgPT5cbiAgICAgIEBydXN0Y0J1aWxkVGVzdCA9IHJ1c3RjQnVpbGRUZXN0XG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnbGludGVyLXJ1c3QuY2FyZ29NYW5pZmVzdEZpbGVuYW1lJyxcbiAgICAoY2FyZ29NYW5pZmVzdEZpbGVuYW1lKSA9PlxuICAgICAgQGNhcmdvTWFuaWZlc3RGaWxlbmFtZSA9IGNhcmdvTWFuaWZlc3RGaWxlbmFtZVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ2xpbnRlci1ydXN0LmpvYnNOdW1iZXInLFxuICAgIChqb2JzTnVtYmVyKSA9PlxuICAgICAgQGpvYnNOdW1iZXIgPSBqb2JzTnVtYmVyXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnbGludGVyLXJ1c3QuZGlzYWJsZWRXYXJuaW5ncycsXG4gICAgKGRpc2FibGVkV2FybmluZ3MpID0+XG4gICAgICBAZGlzYWJsZWRXYXJuaW5ncyA9IGRpc2FibGVkV2FybmluZ3NcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdsaW50ZXItcnVzdC5zcGVjaWZpZWRGZWF0dXJlcycsXG4gICAgKHNwZWNpZmllZEZlYXR1cmVzKSA9PlxuICAgICAgQHNwZWNpZmllZEZlYXR1cmVzID0gc3BlY2lmaWVkRmVhdHVyZXNcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdsaW50ZXItcnVzdC5hbGxvd2VkVG9DYWNoZVZlcnNpb25zJyxcbiAgICAoYWxsb3dlZFRvQ2FjaGVWZXJzaW9ucykgPT5cbiAgICAgIEBhbGxvd2VkVG9DYWNoZVZlcnNpb25zID0gYWxsb3dlZFRvQ2FjaGVWZXJzaW9uc1xuXG4gIGRlc3Ryb3k6IC0+XG4gICAgZG8gQHN1YnNjcmlwdGlvbnMuZGlzcG9zZVxuXG4gIGxpbnQ6ICh0ZXh0RWRpdG9yKSA9PlxuICAgIEBpbml0Q21kKHRleHRFZGl0b3IuZ2V0UGF0aCgpKS50aGVuIChyZXN1bHQpID0+XG4gICAgICBbY21kX3JlcywgZXJyb3JNb2RlXSA9IHJlc3VsdFxuICAgICAgW2ZpbGUsIGNtZF0gPSBjbWRfcmVzXG4gICAgICBlbnYgPSBKU09OLnBhcnNlIEpTT04uc3RyaW5naWZ5IHByb2Nlc3MuZW52XG4gICAgICBjdXJEaXIgPSBwYXRoLmRpcm5hbWUgZmlsZVxuICAgICAgY3dkID0gY3VyRGlyXG4gICAgICBjb21tYW5kID0gY21kWzBdXG4gICAgICBhcmdzID0gY21kLnNsaWNlIDFcbiAgICAgIGVudi5QQVRIID0gcGF0aC5kaXJuYW1lKGNtZFswXSkgKyBwYXRoLmRlbGltaXRlciArIGVudi5QQVRIXG5cbiAgICAgICMgd2Ugc2V0IGZsYWdzIG9ubHkgZm9yIGludGVybWVkaWF0ZSBqc29uIHN1cHBvcnRcbiAgICAgIGlmIGVycm9yTW9kZSA9PSBlcnJvck1vZGVzLkZMQUdTX0pTT05fQ0FSR09cbiAgICAgICAgaWYgIWVudi5SVVNURkxBR1M/IG9yICEoZW52LlJVU1RGTEFHUy5pbmRleE9mKCctLWVycm9yLWZvcm1hdD1qc29uJykgPj0gMClcbiAgICAgICAgICBhZGRpdGlvbmFsID0gaWYgZW52LlJVU1RGTEFHUz8gdGhlbiAnICcgKyBlbnYuUlVTVEZMQUdTIGVsc2UgJydcbiAgICAgICAgICBlbnYuUlVTVEZMQUdTID0gJy0tZXJyb3ItZm9ybWF0PWpzb24nICsgYWRkaXRpb25hbFxuXG4gICAgICBhdG9tX2xpbnRlci5leGVjKGNvbW1hbmQsIGFyZ3MsIHtlbnY6IGVudiwgY3dkOiBjd2QsIHN0cmVhbTogJ2JvdGgnfSlcbiAgICAgICAgLnRoZW4gKHJlc3VsdCkgPT5cbiAgICAgICAgICB7c3Rkb3V0LCBzdGRlcnIsIGV4aXRDb2RlfSA9IHJlc3VsdFxuICAgICAgICAgICMgZmlyc3QsIGNoZWNrIGlmIGFuIG91dHB1dCBzYXlzIHNwZWNpZmllZCBmZWF0dXJlcyBhcmUgaW52YWxpZFxuICAgICAgICAgIGlmIHN0ZGVyci5pbmRleE9mKCdkb2VzIG5vdCBoYXZlIHRoZXNlIGZlYXR1cmVzJykgPj0gMFxuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIFwiSW52YWxpZCBzcGVjaWZpZWQgZmVhdHVyZXNcIixcbiAgICAgICAgICAgICAgZGV0YWlsOiBcIiN7c3RkZXJyfVwiXG4gICAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgICBbXVxuICAgICAgICAgICMgdGhlbiwgaWYgZXhpdCBjb2RlIGxvb2tzIG9rYXksIHByb2Nlc3MgYW4gb3V0cHV0XG4gICAgICAgICAgZWxzZSBpZiBleGl0Q29kZSBpcyAxMDEgb3IgZXhpdENvZGUgaXMgMFxuICAgICAgICAgICAgIyBpbiBkZXYgbW9kZSBzaG93IG1lc3NhZ2UgYm94ZXMgd2l0aCBvdXRwdXRcbiAgICAgICAgICAgIHNob3dEZXZNb2RlV2FybmluZyA9IChzdHJlYW0sIG1lc3NhZ2UpIC0+XG4gICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nIFwiT3V0cHV0IGZyb20gI3tzdHJlYW19IHdoaWxlIGxpbnRpbmdcIixcbiAgICAgICAgICAgICAgICBkZXRhaWw6IFwiI3ttZXNzYWdlfVwiXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiVGhpcyBpcyBzaG93biBiZWNhdXNlIEF0b20gaXMgcnVubmluZyBpbiBkZXYtbW9kZSBhbmQgcHJvYmFibHkgbm90IGFuIGFjdHVhbCBlcnJvclwiXG4gICAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICAgIGlmIGRvIGF0b20uaW5EZXZNb2RlXG4gICAgICAgICAgICAgIHNob3dEZXZNb2RlV2FybmluZygnc3RkZXJyJywgc3RkZXJyKSBpZiBzdGRlcnJcbiAgICAgICAgICAgICAgc2hvd0Rldk1vZGVXYXJuaW5nKCdzdGRvdXQnLCBzdGRvdXQpIGlmIHN0ZG91dFxuXG4gICAgICAgICAgICAjIGNhbGwgYSBuZWVkZWQgcGFyc2VyXG4gICAgICAgICAgICBvdXRwdXQgPSBlcnJvck1vZGUubmVlZGVkT3V0cHV0KHN0ZG91dCwgc3RkZXJyKVxuICAgICAgICAgICAgbWVzc2FnZXMgPSBlcnJvck1vZGUucGFyc2Ugb3V0cHV0LCB7QGRpc2FibGVkV2FybmluZ3MsIHRleHRFZGl0b3J9XG5cbiAgICAgICAgICAgICMgY29ycmVjdCBmaWxlIHBhdGhzXG4gICAgICAgICAgICBtZXNzYWdlcy5mb3JFYWNoIChtZXNzYWdlKSAtPlxuICAgICAgICAgICAgICBpZiAhKHBhdGguaXNBYnNvbHV0ZSBtZXNzYWdlLmZpbGVQYXRoKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UuZmlsZVBhdGggPSBwYXRoLmpvaW4gY3VyRGlyLCBtZXNzYWdlLmZpbGVQYXRoXG4gICAgICAgICAgICBtZXNzYWdlc1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICMgd2hvb3BzLCB3ZSdyZSBpbiB0cm91YmxlIC0tIGxldCdzIG91dHB1dCBhcyBtdWNoIGFzIHdlIGNhblxuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIFwiRmFpbGVkIHRvIHJ1biAje2NvbW1hbmR9IHdpdGggZXhpdCBjb2RlICN7ZXhpdENvZGV9XCIsXG4gICAgICAgICAgICAgIGRldGFpbDogXCJ3aXRoIGFyZ3M6XFxuICN7YXJncy5qb2luKCcgJyl9XFxuU2VlIGNvbnNvbGUgZm9yIG1vcmUgaW5mb3JtYXRpb25cIlxuICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgICAgY29uc29sZS5sb2cgXCJzdGRvdXQ6XCJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIHN0ZG91dFxuICAgICAgICAgICAgY29uc29sZS5sb2cgXCJzdGRlcnI6XCJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIHN0ZGVyclxuICAgICAgICAgICAgW11cbiAgICAgICAgLmNhdGNoIChlcnJvcikgLT5cbiAgICAgICAgICBjb25zb2xlLmxvZyBlcnJvclxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBcIkZhaWxlZCB0byBydW4gI3tjb21tYW5kfVwiLFxuICAgICAgICAgICAgZGV0YWlsOiBcIiN7ZXJyb3IubWVzc2FnZX1cIlxuICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICBbXVxuXG4gIGluaXRDbWQ6IChlZGl0aW5nRmlsZSkgPT5cbiAgICBjdXJEaXIgPSBwYXRoLmRpcm5hbWUgZWRpdGluZ0ZpbGVcbiAgICBjYXJnb01hbmlmZXN0UGF0aCA9IEBsb2NhdGVDYXJnbyBjdXJEaXJcbiAgICBpZiBub3QgQHVzZUNhcmdvIG9yIG5vdCBjYXJnb01hbmlmZXN0UGF0aFxuICAgICAgQGRlY2lkZUVycm9yTW9kZShjdXJEaXIsICdydXN0YycpLnRoZW4gKG1vZGUpID0+XG4gICAgICAgIG1vZGUuYnVpbGRBcmd1bWVudHModGhpcywgW2VkaXRpbmdGaWxlLCBjYXJnb01hbmlmZXN0UGF0aF0pLnRoZW4gKGNtZCkgPT5cbiAgICAgICAgICBbY21kLCBtb2RlXVxuICAgIGVsc2VcbiAgICAgIEBkZWNpZGVFcnJvck1vZGUoY3VyRGlyLCAnY2FyZ28nKS50aGVuIChtb2RlKSA9PlxuICAgICAgICBtb2RlLmJ1aWxkQXJndW1lbnRzKHRoaXMsIGNhcmdvTWFuaWZlc3RQYXRoKS50aGVuIChjbWQpID0+XG4gICAgICAgICAgW2NtZCwgbW9kZV1cblxuICBjb21waWxhdGlvbkZlYXR1cmVzOiAoY2FyZ28pID0+XG4gICAgaWYgQHNwZWNpZmllZEZlYXR1cmVzLmxlbmd0aCA+IDBcbiAgICAgIGlmIGNhcmdvXG4gICAgICAgIFsnLS1mZWF0dXJlcycsIEBzcGVjaWZpZWRGZWF0dXJlcy5qb2luKCcgJyldXG4gICAgICBlbHNlXG4gICAgICAgIHJlc3VsdCA9IFtdXG4gICAgICAgIGNmZ3MgPSBmb3IgZiBpbiBAc3BlY2lmaWVkRmVhdHVyZXNcbiAgICAgICAgICByZXN1bHQucHVzaCBbJy0tY2ZnJywgXCJmZWF0dXJlPVxcXCIje2Z9XFxcIlwiXVxuICAgICAgICByZXN1bHRcblxuICBkZWNpZGVFcnJvck1vZGU6IChjdXJEaXIsIGNvbW1hbmRNb2RlKSA9PlxuICAgICMgZXJyb3IgbW9kZSBpcyBjYWNoZWQgdG8gYXZvaWQgZGVsYXlzXG4gICAgaWYgQGNhY2hlZEVycm9yTW9kZT8gYW5kIEBhbGxvd2VkVG9DYWNoZVZlcnNpb25zXG4gICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuICgpID0+XG4gICAgICAgIEBjYWNoZWRFcnJvck1vZGVcbiAgICBlbHNlXG4gICAgICAjIGN1cnJlbnQgZGlyIGlzIHNldCB0byBoYW5kbGUgb3ZlcnJpZGVzXG4gICAgICBhdG9tX2xpbnRlci5leGVjKEBydXN0Y1BhdGgsIFsnLS12ZXJzaW9uJ10sIHtjd2Q6IGN1ckRpcn0pLnRoZW4gKHN0ZG91dCkgPT5cbiAgICAgICAgdHJ5XG4gICAgICAgICAgbWF0Y2ggPSBYUmVnRXhwLmV4ZWMoc3Rkb3V0LCBAcGF0dGVyblJ1c3RjVmVyc2lvbilcbiAgICAgICAgICBpZiBtYXRjaFxuICAgICAgICAgICAgbmlnaHRseVdpdGhKU09OID0gbWF0Y2gubmlnaHRseSBhbmQgbWF0Y2guZGF0ZSA+ICcyMDE2LTA4LTA4J1xuICAgICAgICAgICAgc3RhYmxlV2l0aEpTT04gPSBub3QgbWF0Y2gubmlnaHRseSBhbmQgc2VtdmVyLmd0ZShtYXRjaC52ZXJzaW9uLCAnMS4xMi4wJylcbiAgICAgICAgICAgIGNhblVzZUludGVybWVkaWF0ZUpTT04gPSBuaWdodGx5V2l0aEpTT04gb3Igc3RhYmxlV2l0aEpTT05cbiAgICAgICAgICAgIHN3aXRjaCBjb21tYW5kTW9kZVxuICAgICAgICAgICAgICB3aGVuICdjYXJnbydcbiAgICAgICAgICAgICAgICBjYW5Vc2VQcm9wZXJDYXJnb0pTT04gPSAobWF0Y2gubmlnaHRseSBhbmQgbWF0Y2guZGF0ZSA+PSAnMjAxNi0xMC0xMCcpIG9yXG4gICAgICAgICAgICAgICAgICAobWF0Y2guYmV0YSBvciBub3QgbWF0Y2gubmlnaHRseSBhbmQgc2VtdmVyLmd0ZShtYXRjaC52ZXJzaW9uLCAnMS4xMy4wJykpXG4gICAgICAgICAgICAgICAgaWYgY2FuVXNlUHJvcGVyQ2FyZ29KU09OXG4gICAgICAgICAgICAgICAgICBlcnJvck1vZGVzLkpTT05fQ0FSR09cbiAgICAgICAgICAgICAgICAjIHRoaXMgbW9kZSBpcyB1c2VkIG9ubHkgdGhyb3VnaCBBdWd1c3QgdGlsbCBPY3RvYmVyLCAyMDE2XG4gICAgICAgICAgICAgICAgZWxzZSBpZiBjYW5Vc2VJbnRlcm1lZGlhdGVKU09OXG4gICAgICAgICAgICAgICAgICBlcnJvck1vZGVzLkZMQUdTX0pTT05fQ0FSR09cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICBlcnJvck1vZGVzLk9MRF9DQVJHT1xuICAgICAgICAgICAgICB3aGVuICdydXN0YydcbiAgICAgICAgICAgICAgICBpZiBjYW5Vc2VJbnRlcm1lZGlhdGVKU09OXG4gICAgICAgICAgICAgICAgICBlcnJvck1vZGVzLkpTT05fUlVTVENcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICBlcnJvck1vZGVzLk9MRF9SVVNUQ1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRocm93ICdydXN0YyByZXR1cm5lZCB1bmV4cGVjdGVkIHJlc3VsdDogJyArIHN0ZG91dFxuICAgICAgLnRoZW4gKHJlc3VsdCkgPT5cbiAgICAgICAgQGNhY2hlZEVycm9yTW9kZSA9IHJlc3VsdFxuICAgICAgICByZXN1bHRcblxuXG4gIGxvY2F0ZUNhcmdvOiAoY3VyRGlyKSA9PlxuICAgIHJvb3RfZGlyID0gaWYgL153aW4vLnRlc3QgcHJvY2Vzcy5wbGF0Zm9ybSB0aGVuIC9eLjpcXFxcJC8gZWxzZSAvXlxcLyQvXG4gICAgZGlyZWN0b3J5ID0gcGF0aC5yZXNvbHZlIGN1ckRpclxuICAgIGxvb3BcbiAgICAgIHJldHVybiBwYXRoLmpvaW4gZGlyZWN0b3J5LCBAY2FyZ29NYW5pZmVzdEZpbGVuYW1lIGlmIGZzLmV4aXN0c1N5bmMgcGF0aC5qb2luIGRpcmVjdG9yeSwgQGNhcmdvTWFuaWZlc3RGaWxlbmFtZVxuICAgICAgYnJlYWsgaWYgcm9vdF9kaXIudGVzdCBkaXJlY3RvcnlcbiAgICAgIGRpcmVjdG9yeSA9IHBhdGgucmVzb2x2ZSBwYXRoLmpvaW4oZGlyZWN0b3J5LCAnLi4nKVxuICAgIHJldHVybiBmYWxzZVxuXG5tb2R1bGUuZXhwb3J0cyA9IExpbnRlclJ1c3RcbiJdfQ==
