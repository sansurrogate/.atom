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

    LinterRust.prototype.pattern = XRegExp('(?<file>[^\n\r]+):(?<from_line>\\d+):(?<from_col>\\d+):\\s*(?<to_line>\\d+):(?<to_col>\\d+)\\s+((?<error>error|fatal error)|(?<warning>warning)|(?<info>note|help)):\\s+(?<message>.+?)[\n\r]+($|(?=[^\n\r]+:\\d+))', 's');

    LinterRust.prototype.patternRustcVersion = XRegExp('rustc 1.\\d+.\\d+(?:-(?<nightly>nightly)|(?:[^\\s]+))? \\((?:[^\\s]+) (?<date>\\d{4}-\\d{2}-\\d{2})\\)');

    LinterRust.prototype.lint = function(textEditor) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var PATH, args, command, curDir, exit, file, options, results, stderr, stdout;
          results = [];
          file = _this.initCmd(textEditor.getPath());
          curDir = path.dirname(file);
          PATH = path.dirname(_this.cmd[0]);
          options = JSON.parse(JSON.stringify(process.env));
          options.PATH = PATH + path.delimiter + options.PATH;
          options.cwd = curDir;
          command = _this.cmd[0];
          args = _this.cmd.slice(1);
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
        return editingFile;
      } else {
        this.cmd = this.buildCargoPath(cargoPath).concat(cargoArgs).concat(['-j', this.config('jobsNumber')]);
        this.cmd = this.cmd.concat(this.compilationFeatures(true));
        this.cmd = this.cmd.concat(['--manifest-path', cargoManifestPath]);
        if (this.ableToJSONErrors()) {
          this.cmd = this.cmd.concat(['--', '--error-format=json']);
        }
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9saW50ZXItcnVzdC9saWIvbGludGVyLXJ1c3QuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFEQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVDLGtCQUFtQixPQUFBLENBQVEsTUFBUixFQUFuQixlQUZELENBQUE7O0FBQUEsRUFHQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVIsQ0FIVixDQUFBOztBQUFBLEVBSUEsS0FBQSxHQUFRLE9BQUEsQ0FBUyxlQUFULENBSlIsQ0FBQTs7QUFBQSxFQU9NOzs7Ozs7Ozs7Ozs7S0FDSjs7QUFBQSx5QkFBQSxrQkFBQSxHQUFvQixtQkFBcEIsQ0FBQTs7QUFBQSx5QkFDQSxXQUFBLEdBQWEsSUFEYixDQUFBOztBQUFBLHlCQUVBLE9BQUEsR0FBUyxPQUFBLENBQVEscU5BQVIsRUFHdUMsR0FIdkMsQ0FGVCxDQUFBOztBQUFBLHlCQU1BLG1CQUFBLEdBQXFCLE9BQUEsQ0FBUSx3R0FBUixDQU5yQixDQUFBOztBQUFBLHlCQVNBLElBQUEsR0FBTSxTQUFDLFVBQUQsR0FBQTtBQUNKLGFBQVcsSUFBQSxPQUFBLENBQVEsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsT0FBRCxFQUFVLE1BQVYsR0FBQTtBQUNqQixjQUFBLHlFQUFBO0FBQUEsVUFBQSxPQUFBLEdBQVUsRUFBVixDQUFBO0FBQUEsVUFDQSxJQUFBLEdBQU8sS0FBQyxDQUFBLE9BQUQsQ0FBWSxVQUFVLENBQUMsT0FBZCxDQUFBLENBQVQsQ0FEUCxDQUFBO0FBQUEsVUFFQSxNQUFBLEdBQVMsSUFB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

//# sourceURL=/home/takaaki/.atom/packages/linter-rust/lib/linter-rust.coffee
