(function() {
  var BufferedProcess, LinterRust, XRegExp, fs, path, semver, spawn,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs');

  path = require('path');

  BufferedProcess = require('atom').BufferedProcess;

  XRegExp = require('xregexp');

  spawn = require('child_process');

  semver = require('semver');

  LinterRust = (function() {
    function LinterRust() {
      this.usingMultirustForClippy = __bind(this.usingMultirustForClippy, this);
      this.buildCargoPath = __bind(this.buildCargoPath, this);
      this.locateCargo = __bind(this.locateCargo, this);
      this.ableToJSONErrors = __bind(this.ableToJSONErrors, this);
      this.compilationFeatures = __bind(this.compilationFeatures, this);
      this.initCmd = __bind(this.initCmd, this);
      this.buildMessages = __bind(this.buildMessages, this);
      this.parse = __bind(this.parse, this);
      this.parseJSON = __bind(this.parseJSON, this);
      this.lint = __bind(this.lint, this);
    }

    LinterRust.prototype.cargoDependencyDir = "target/debug/deps";

    LinterRust.prototype.lintProcess = null;

    LinterRust.prototype.cachedAbleToJsonErrors = null;

    LinterRust.prototype.pattern = XRegExp('(?<file>[^\n\r]+):(?<from_line>\\d+):(?<from_col>\\d+):\\s*(?<to_line>\\d+):(?<to_col>\\d+)\\s+((?<error>error|fatal error)|(?<warning>warning)|(?<info>note|help)):\\s+(?<message>.+?)[\n\r]+($|(?=[^\n\r]+:\\d+))', 's');

    LinterRust.prototype.patternRustcVersion = XRegExp('rustc (?<version>1.\\d+.\\d+)(?:(?:-(?<nightly>nightly)|(?:[^\\s]+))? \\((?:[^\\s]+) (?<date>\\d{4}-\\d{2}-\\d{2})\\))?');

    LinterRust.prototype.lint = function(textEditor) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var PATH, additional, args, command, curDir, exit, file, options, results, stderr, stdout;
          results = [];
          file = _this.initCmd(textEditor.getPath());
          curDir = path.dirname(file);
          PATH = path.dirname(_this.cmd[0]);
          options = {
            env: JSON.parse(JSON.stringify(process.env))
          };
          options.env.PATH = PATH + path.delimiter + options.env.PATH;
          options.cwd = curDir;
          command = _this.cmd[0];
          args = _this.cmd.slice(1);
          _this.cachedAbleToJsonErrors = null;
          _this.cachedAbleToJsonErrors = _this.ableToJSONErrors();
          stdout = function(data) {
            if (atom.inDevMode()) {
              return console.log(data);
            }
          };
          stderr = function(err) {
            if (err.indexOf('does not have these features') >= 0) {
              atom.notifications.addError("Invalid specified features", {
                detail: "" + err,
                dismissable: true
              });
            } else {
              if (atom.inDevMode()) {
                atom.notifications.addWarning("Output from stderr while linting", {
                  detail: "" + err,
                  description: "This is shown because Atom is running in dev-mode and probably not an actual error",
                  dismissable: true
                });
              }
            }
            return results.push(err);
          };
          exit = function(code) {
            var messages;
            if (code === 101 || code === 0) {
              if (!_this.ableToJSONErrors()) {
                messages = _this.parse(results.join(''));
              } else {
                messages = _this.parseJSON(results);
              }
              messages.forEach(function(message) {
                if (!(path.isAbsolute(message.filePath))) {
                  return message.filePath = path.join(curDir, message.filePath);
                }
              });
              return resolve(messages);
            } else {
              return resolve([]);
            }
          };
          if (_this.ableToJSONErrors()) {
            additional = options.env.RUSTFLAGS != null ? ' ' + options.env.RUSTFLAGS : '';
            options.env.RUSTFLAGS = '--error-format=json' + additional;
          }
          _this.lintProcess = new BufferedProcess({
            command: command,
            args: args,
            options: options,
            stdout: stdout,
            stderr: stderr,
            exit: exit
          });
          return _this.lintProcess.onWillThrowError(function(_arg) {
            var error, handle;
            error = _arg.error, handle = _arg.handle;
            atom.notifications.addError("Failed to run " + command, {
              detail: "" + error.message,
              dismissable: true
            });
            handle();
            return resolve([]);
          });
        };
      })(this));
    };

    LinterRust.prototype.parseJSON = function(results) {
      var element, elements, input, primary_span, range, result, span, subresults, _i, _j, _k, _len, _len1, _len2, _ref;
      elements = [];
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        result = results[_i];
        subresults = result.split('\n');
        for (_j = 0, _len1 = subresults.length; _j < _len1; _j++) {
          result = subresults[_j];
          if (result.startsWith('{')) {
            input = JSON.parse(result);
            if (!input.spans) {
              continue;
            }
            primary_span = input.spans.find(function(span) {
              return span.is_primary;
            });
            if (!primary_span) {
              continue;
            }
            range = [[primary_span.line_start - 1, primary_span.column_start - 1], [primary_span.line_end - 1, primary_span.column_end - 1]];
            if (input === 'fatal error') {
              input.level = 'error';
            }
            element = {
              type: input.level,
              message: input.message,
              file: primary_span.file_name,
              range: range,
              children: input.children
            };
            _ref = input.spans;
            for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
              span = _ref[_k];
              if (!span.is_primary) {
                element.children.push({
                  message: span.label,
                  range: [[span.line_start - 1, span.column_start - 1], [span.line_end - 1, span.column_end - 1]]
                });
              }
            }
            elements.push(element);
          }
        }
      }
      return this.buildMessages(elements);
    };

    LinterRust.prototype.parse = function(output) {
      var elements;
      elements = [];
      XRegExp.forEach(output, this.pattern, function(match) {
        var element, level, range;
        if (match.from_col === match.to_col) {
          match.to_col = parseInt(match.to_col) + 1;
        }
        range = [[match.from_line - 1, match.from_col - 1], [match.to_line - 1, match.to_col - 1]];
        level = match.error ? 'error' : match.warning ? 'warning' : match.info ? 'info' : match.trace ? 'trace' : match.note ? 'note' : void 0;
        element = {
          type: level,
          message: match.message,
          file: match.file,
          range: range
        };
        return elements.push(element);
      });
      return this.buildMessages(elements);
    };

    LinterRust.prototype.buildMessages = function(elements) {
      var disabledWarning, disabledWarnings, element, lastMessage, messageIsDisabledLint, messages, _i, _j, _len, _len1;
      messages = [];
      lastMessage = null;
      disabledWarnings = this.config('disabledWarnings');
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        element = elements[_i];
        switch (element.type) {
          case 'info':
          case 'trace':
          case 'note':
            if (lastMessage) {
              lastMessage.trace || (lastMessage.trace = []);
              lastMessage.trace.push({
                type: "Trace",
                text: element.message,
                filePath: element.file,
                range: element.range
              });
            }
            break;
          case 'warning':
            if (disabledWarnings && disabledWarnings.length > 0) {
              messageIsDisabledLint = false;
              for (_j = 0, _len1 = disabledWarnings.length; _j < _len1; _j++) {
                disabledWarning = disabledWarnings[_j];
                if (element.message.indexOf(disabledWarning) >= 0) {
                  messageIsDisabledLint = true;
                  lastMessage = null;
                  break;
                }
              }
              if (!messageIsDisabledLint) {
                lastMessage = this.constructMessage("Warning", element);
                messages.push(lastMessage);
              }
            } else {
              lastMessage = this.constructMessage("Warning", element);
              messages.push(lastMessage);
            }
            break;
          case 'error':
          case 'fatal error':
            lastMessage = this.constructMessage("Error", element);
            messages.push(lastMessage);
        }
      }
      return messages;
    };

    LinterRust.prototype.constructMessage = function(type, element) {
      var children, message, _i, _len, _ref;
      message = {
        type: type,
        text: element.message,
        filePath: element.file,
        range: element.range
      };
      if (element.children) {
        message.trace = [];
        _ref = element.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          children = _ref[_i];
          message.trace.push({
            type: "Trace",
            text: children.message,
            filePath: element.file,
            range: children.range || element.range
          });
        }
      }
      return message;
    };

    LinterRust.prototype.config = function(key) {
      return atom.config.get("linter-rust." + key);
    };

    LinterRust.prototype.initCmd = function(editingFile) {
      var cargoArgs, cargoManifestPath, cargoPath, rustcArgs, rustcPath;
      cargoManifestPath = this.locateCargo(path.dirname(editingFile));
      rustcPath = (this.config('rustcPath')).trim();
      rustcArgs = (function() {
        switch (this.config('rustcBuildTest')) {
          case true:
            return ['--cfg', 'test', '-Z', 'no-trans', '--color', 'never'];
          default:
            return ['-Z', 'no-trans', '--color', 'never'];
        }
      }).call(this);
      cargoPath = (this.config('cargoPath')).trim();
      cargoArgs = (function() {
        switch (this.config('cargoCommand')) {
          case 'check':
            return ['check'];
          case 'test':
            return ['test', '--no-run'];
          case 'rustc':
            return ['rustc', '-Zno-trans', '--color', 'never'];
          case 'clippy':
            return ['clippy'];
          default:
            return ['build'];
        }
      }).call(this);
      if (!this.config('useCargo') || !cargoManifestPath) {
        this.cmd = [rustcPath].concat(rustcArgs);
        if (cargoManifestPath) {
          this.cmd.push('-L');
          this.cmd.push(path.join(path.dirname(cargoManifestPath), this.cargoDependencyDir));
        }
        this.cmd = this.cmd.concat(this.compilationFeatures(false));
        this.cmd = this.cmd.concat([editingFile]);
        if (this.ableToJSONErrors()) {
          this.cmd = this.cmd.concat(['--error-format=json']);
        }
        return editingFile;
      } else {
        this.cmd = this.buildCargoPath(cargoPath).concat(cargoArgs).concat(['-j', this.config('jobsNumber')]);
        this.cmd = this.cmd.concat(this.compilationFeatures(true));
        this.cmd = this.cmd.concat(['--manifest-path', cargoManifestPath]);
        return cargoManifestPath;
      }
    };

    LinterRust.prototype.compilationFeatures = function(cargo) {
      var cfgs, f, features, result;
      features = this.config('specifiedFeatures');
      if (features) {
        if (cargo) {
          return ['--features', features.join(' ')];
        } else {
          result = [];
          cfgs = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = features.length; _i < _len; _i++) {
              f = features[_i];
              _results.push(result.push(['--cfg', "feature=\"" + f + "\""]));
            }
            return _results;
          })();
          return result;
        }
      }
    };

    LinterRust.prototype.ableToJSONErrors = function() {
      var match, result, rustcPath;
      if (this.cachedAbleToJsonErrors != null) {
        return this.cachedAbleToJsonErrors;
      }
      rustcPath = (this.config('rustcPath')).trim();
      result = spawn.execSync(rustcPath + ' --version', {
        stdio: 'pipe'
      });
      match = XRegExp.exec(result, this.patternRustcVersion);
      if (match && match.nightly && match.date > '2016-08-08') {
        return true;
      } else if (match && !match.nightly && semver.gte(match.version, '1.12.0')) {
        return true;
      } else {
        return false;
      }
    };

    LinterRust.prototype.locateCargo = function(curDir) {
      var cargoManifestFilename, directory, root_dir;
      root_dir = /^win/.test(process.platform) ? /^.:\\$/ : /^\/$/;
      cargoManifestFilename = this.config('cargoManifestFilename');
      directory = path.resolve(curDir);
      while (true) {
        if (fs.existsSync(path.join(directory, cargoManifestFilename))) {
          return path.join(directory, cargoManifestFilename);
        }
        if (root_dir.test(directory)) {
          break;
        }
        directory = path.resolve(path.join(directory, '..'));
      }
      return false;
    };

    LinterRust.prototype.buildCargoPath = function(cargoPath) {
      if ((this.config('cargoCommand')) === 'clippy' && this.usingMultirustForClippy()) {
        return ['multirust', 'run', 'nightly', 'cargo'];
      } else {
        return [cargoPath];
      }
    };

    LinterRust.prototype.usingMultirustForClippy = function() {
      var result;
      try {
        result = spawn.execSync('multirust --version');
        return true;
      } catch (_error) {
        return false;
      }
    };

    return LinterRust;

  })();

  module.exports = LinterRust;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9saW50ZXItcnVzdC9saWIvbGludGVyLXJ1c3QuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZEQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVDLGtCQUFtQixPQUFBLENBQVEsTUFBUixFQUFuQixlQUZELENBQUE7O0FBQUEsRUFHQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVIsQ0FIVixDQUFBOztBQUFBLEVBSUEsS0FBQSxHQUFRLE9BQUEsQ0FBUyxlQUFULENBSlIsQ0FBQTs7QUFBQSxFQUtBLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUixDQUxULENBQUE7O0FBQUEsRUFRTTs7Ozs7Ozs7Ozs7O0tBQ0o7O0FBQUEseUJBQUEsa0JBQUEsR0FBb0IsbUJBQXBCLENBQUE7O0FBQUEseUJBQ0EsV0FBQSxHQUFhLElBRGIsQ0FBQTs7QUFBQSx5QkFFQSxzQkFBQSxHQUF3QixJQUZ4QixDQUFBOztBQUFBLHlCQUdBLE9BQUEsR0FBUyxPQUFBLENBQVEscU5BQVIsRUFHdUMsR0FIdkMsQ0FIVCxDQUFBOztBQUFBLHlCQU9BLG1CQUFBLEdBQXFCLE9BQUEsQ0FBUSx5SEFBUixDQVByQixDQUFBOztBQUFBLHlCQVVBLElBQUEsR0FBTSxTQUFDLFVBQUQsR0FBQTtBQUNKLGFBQVcsSUFBQSxPQUFBLENBQVEsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsT0FBRCxFQUFVLE1BQVYsR0FBQTtBQUNqQixjQUFBLHFGQUFBO0FBQUEsVUFBQSxPQUFBLEdBQVUsRUFBVixDQUFBO0FBQUEsVUFDQSxJQUFBLEdB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

//# sourceURL=/home/takaaki/.atom/packages/linter-rust/lib/linter-rust.coffee
