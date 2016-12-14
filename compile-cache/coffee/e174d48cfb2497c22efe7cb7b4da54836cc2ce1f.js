(function() {
  var BufferedProcess, LinterRust, XRegExp, fs, path, spawn,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs');

  path = require('path');

  BufferedProcess = require('atom').BufferedProcess;

  XRegExp = require('xregexp');

  spawn = require('child_process');

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

    LinterRust.prototype.patternRustcVersion = XRegExp('rustc 1.\\d+.\\d+(?:-(?<nightly>nightly)|(?:[^\\s]+))? \\((?:[^\\s]+) (?<date>\\d{4}-\\d{2}-\\d{2})\\)');

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
      return match && match.nightly && match.date > '2016-08-08';
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9saW50ZXItcnVzdC9saWIvbGludGVyLXJ1c3QuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFEQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVDLGtCQUFtQixPQUFBLENBQVEsTUFBUixFQUFuQixlQUZELENBQUE7O0FBQUEsRUFHQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVIsQ0FIVixDQUFBOztBQUFBLEVBSUEsS0FBQSxHQUFRLE9BQUEsQ0FBUyxlQUFULENBSlIsQ0FBQTs7QUFBQSxFQU9NOzs7Ozs7Ozs7Ozs7S0FDSjs7QUFBQSx5QkFBQSxrQkFBQSxHQUFvQixtQkFBcEIsQ0FBQTs7QUFBQSx5QkFDQSxXQUFBLEdBQWEsSUFEYixDQUFBOztBQUFBLHlCQUVBLHNCQUFBLEdBQXdCLElBRnhCLENBQUE7O0FBQUEseUJBR0EsT0FBQSxHQUFTLE9BQUEsQ0FBUSxxTkFBUixFQUd1QyxHQUh2QyxDQUhULENBQUE7O0FBQUEseUJBT0EsbUJBQUEsR0FBcUIsT0FBQSxDQUFRLHdHQUFSLENBUHJCLENBQUE7O0FBQUEseUJBVUEsSUFBQSxHQUFNLFNBQUMsVUFBRCxHQUFBO0FBQ0osYUFBVyxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxPQUFELEVBQVUsTUFBVixHQUFBO0FBQ2pCLGNBQUEscUZBQUE7QUFBQSxVQUFBLE9BQUEsR0FBVSxFQUFWLENBQUE7QUFBQSxVQUNBLElBQUEsR0FBTyxLQUFDLENBQUEsT0FBRCxDQUFZLFVBQVUsQ0FBQyxPQUFkLENBQUEsQ0FB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

//# sourceURL=/home/takaaki/.atom/packages/linter-rust/lib/linter-rust.coffee
