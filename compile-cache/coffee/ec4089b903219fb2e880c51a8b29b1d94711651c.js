(function() {
  var XRegExp, atom_linter, buildCargoArguments, buildMessages, buildRustcArguments, cachedUsingMultitoolForClippy, constructMessage, errorModes, parseJsonMessages, parseJsonOutput, parseOldMessages, path, pattern;

  path = require('path');

  atom_linter = require('atom-linter');

  XRegExp = require('xregexp');

  pattern = XRegExp('(?<file>[^\n\r]+):(?<from_line>\\d+):(?<from_col>\\d+):\\s*(?<to_line>\\d+):(?<to_col>\\d+)\\s+((?<error>error|fatal error)|(?<warning>warning)|(?<info>note|help)):\\s+(?<message>.+?)[\n\r]+($|(?=[^\n\r]+:\\d+))', 's');

  parseOldMessages = function(output, _arg) {
    var disabledWarnings, elements, textEditor;
    disabledWarnings = _arg.disabledWarnings, textEditor = _arg.textEditor;
    elements = [];
    XRegExp.forEach(output, pattern, function(match) {
      var element, level, range;
      range = match.from_col === match.to_col && match.from_line === match.to_line ? atom_linter.rangeFromLineNumber(textEditor, Number.parseInt(match.from_line, 10) - 1, Number.parseInt(match.from_col, 10) - 1) : [[match.from_line - 1, match.from_col - 1], [match.to_line - 1, match.to_col - 1]];
      level = match.error ? 'error' : match.warning ? 'warning' : match.info ? 'info' : match.trace ? 'trace' : match.note ? 'note' : void 0;
      element = {
        type: level,
        message: match.message,
        file: match.file,
        range: range
      };
      return elements.push(element);
    });
    return buildMessages(elements, disabledWarnings);
  };

  parseJsonMessages = function(messages, _arg) {
    var disabledWarnings, element, elements, input, primary_span, range, span, _i, _j, _len, _len1, _ref;
    disabledWarnings = _arg.disabledWarnings;
    elements = [];
    for (_i = 0, _len = messages.length; _i < _len; _i++) {
      input = messages[_i];
      if (!(input && input.spans)) {
        continue;
      }
      primary_span = input.spans.find(function(span) {
        return span.is_primary;
      });
      if (!primary_span) {
        continue;
      }
      while (primary_span.expansion && primary_span.expansion.span) {
        primary_span = primary_span.expansion.span;
      }
      range = [[primary_span.line_start - 1, primary_span.column_start - 1], [primary_span.line_end - 1, primary_span.column_end - 1]];
      if (input.level === 'fatal error') {
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
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        span = _ref[_j];
        if (!span.is_primary) {
          element.children.push({
            message: span.label,
            range: [[span.line_start - 1, span.column_start - 1], [span.line_end - 1, span.column_end - 1]]
          });
        }
      }
      elements.push(element);
    }
    return buildMessages(elements, disabledWarnings);
  };

  parseJsonOutput = function(output, _arg) {
    var additionalFilter, disabledWarnings, results;
    disabledWarnings = _arg.disabledWarnings, additionalFilter = _arg.additionalFilter;
    results = output.split('\n').map(function(message) {
      var json;
      message = message.trim();
      if (message.startsWith('{')) {
        json = JSON.parse(message);
        if (additionalFilter != null) {
          return additionalFilter(json);
        } else {
          return json;
        }
      }
    }).filter(function(m) {
      return m != null;
    });
    return parseJsonMessages(results, {
      disabledWarnings: disabledWarnings
    });
  };

  buildMessages = function(elements, disabledWarnings) {
    var disabledWarning, element, lastMessage, messageIsDisabledLint, messages, _i, _j, _len, _len1;
    messages = [];
    lastMessage = null;
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
              lastMessage = constructMessage("Warning", element);
              messages.push(lastMessage);
            }
          } else {
            lastMessage = constructMessage("Warning", element);
            messages.push(lastMessage);
          }
          break;
        case 'error':
        case 'fatal error':
          lastMessage = constructMessage("Error", element);
          messages.push(lastMessage);
      }
    }
    return messages;
  };

  constructMessage = function(type, element) {
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

  buildRustcArguments = function(linter, paths) {
    var cargoManifestPath, editingFile;
    editingFile = paths[0], cargoManifestPath = paths[1];
    return Promise.resolve().then((function(_this) {
      return function() {
        var cmd, compilationFeatures, rustcArgs;
        rustcArgs = (function() {
          switch (linter.rustcBuildTest) {
            case true:
              return ['--cfg', 'test', '-Z', 'no-trans', '--color', 'never'];
            default:
              return ['-Z', 'no-trans', '--color', 'never'];
          }
        })();
        cmd = [linter.rustcPath].concat(rustcArgs);
        if (cargoManifestPath) {
          cmd.push('-L');
          cmd.push(path.join(path.dirname(cargoManifestPath), linter.cargoDependencyDir));
        }
        compilationFeatures = linter.compilationFeatures(false);
        if (compilationFeatures) {
          cmd = cmd.concat(compilationFeatures);
        }
        cmd = cmd.concat([editingFile]);
        return [editingFile, cmd];
      };
    })(this));
  };

  cachedUsingMultitoolForClippy = null;

  buildCargoArguments = function(linter, cargoManifestPath) {
    var buildCargoPath, cargoArgs, compilationFeatures;
    buildCargoPath = function(cargoPath, cargoCommand) {
      var usingMultitoolForClippy;
      if ((cachedUsingMultitoolForClippy != null) && linter.allowedToCacheVersions) {
        return Promise.resolve().then((function(_this) {
          return function() {
            return cachedUsingMultitoolForClippy;
          };
        })(this));
      } else {
        usingMultitoolForClippy = atom_linter.exec('rustup', ['--version'], {
          ignoreExitCode: true
        }).then(function() {
          return {
            result: true,
            tool: 'rustup'
          };
        })["catch"](function() {
          return atom_linter.exec('multirust', ['--version'], {
            ignoreExitCode: true
          }).then(function() {
            return {
              result: true,
              tool: 'multirust'
            };
          })["catch"](function() {
            return {
              result: false
            };
          });
        });
        return usingMultitoolForClippy.then(function(canUseMultirust) {
          if (cargoCommand === 'clippy' && canUseMultirust.result) {
            return [canUseMultirust.tool, 'run', 'nightly', 'cargo'];
          } else {
            return [cargoPath];
          }
        }).then((function(_this) {
          return function(cached) {
            cachedUsingMultitoolForClippy = cached;
            return cached;
          };
        })(this));
      }
    };
    cargoArgs = (function() {
      switch (linter.cargoCommand) {
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
    })();
    compilationFeatures = linter.compilationFeatures(true);
    return buildCargoPath(linter.cargoPath, linter.cargoCommand).then(function(cmd) {
      cmd = cmd.concat(cargoArgs).concat(['-j', linter.jobsNumber]);
      if (compilationFeatures) {
        cmd = cmd.concat(compilationFeatures);
      }
      cmd = cmd.concat(['--manifest-path', cargoManifestPath]);
      return [cargoManifestPath, cmd];
    });
  };

  errorModes = {
    JSON_RUSTC: {
      neededOutput: function(stdout, stderr) {
        return stderr;
      },
      parse: (function(_this) {
        return function(output, options) {
          return parseJsonOutput(output, options);
        };
      })(this),
      buildArguments: function(linter, file) {
        return buildRustcArguments(linter, file).then(function(cmd_res) {
          var cmd;
          file = cmd_res[0], cmd = cmd_res[1];
          cmd = cmd.concat(['--error-format=json']);
          return [file, cmd];
        });
      }
    },
    JSON_CARGO: {
      neededOutput: function(stdout, stderr) {
        return stdout;
      },
      parse: function(output, options) {
        options.additionalFilter = function(json) {
          if ((json != null) && json.reason === "compiler-message") {
            return json.message;
          }
        };
        return parseJsonOutput(output, options);
      },
      buildArguments: function(linter, file) {
        return buildCargoArguments(linter, file).then(function(cmd_res) {
          var cmd;
          file = cmd_res[0], cmd = cmd_res[1];
          cmd = cmd.concat(['--message-format', 'json']);
          return [file, cmd];
        });
      }
    },
    FLAGS_JSON_CARGO: {
      neededOutput: function(stdout, stderr) {
        return stderr;
      },
      parse: parseJsonOutput,
      buildArguments: buildCargoArguments
    },
    OLD_RUSTC: {
      neededOutput: function(stdout, stderr) {
        return stderr;
      },
      parse: parseOldMessages,
      buildArguments: buildRustcArguments
    },
    OLD_CARGO: {
      neededOutput: function(stdout, stderr) {
        return stderr;
      },
      parse: parseOldMessages,
      buildArguments: buildCargoArguments
    }
  };

  module.exports = errorModes;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9saW50ZXItcnVzdC9saWIvbW9kZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsK01BQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBRUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxhQUFSLENBRmQsQ0FBQTs7QUFBQSxFQUdBLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUixDQUhWLENBQUE7O0FBQUEsRUFLQSxPQUFBLEdBQVUsT0FBQSxDQUFRLHFOQUFSLEVBR3NDLEdBSHRDLENBTFYsQ0FBQTs7QUFBQSxFQVVBLGdCQUFBLEdBQW1CLFNBQUMsTUFBRCxFQUFTLElBQVQsR0FBQTtBQUNqQixRQUFBLHNDQUFBO0FBQUEsSUFEMkIsd0JBQUEsa0JBQWtCLGtCQUFBLFVBQzdDLENBQUE7QUFBQSxJQUFBLFFBQUEsR0FBVyxFQUFYLENBQUE7QUFBQSxJQUNBLE9BQU8sQ0FBQyxPQUFSLENBQWdCLE1BQWhCLEVBQXdCLE9BQXhCLEVBQWlDLFNBQUMsS0FBRCxHQUFBO0FBQy9CLFVBQUEscUJBQUE7QUFBQSxNQUFBLEtBQUEsR0FBVyxLQUFLLENBQUMsUUFBTixLQUFrQixLQUFLLENBQUMsTUFBeEIsSUFBbUMsS0FBSyxDQUFDLFNBQU4sS0FBbUIsS0FBSyxDQUFDLE9BQS9ELEdBQ04sV0FBVyxDQUFDLG1CQUFaLENBQWdDLFVBQWhDLEVBQTRDLE1BQU0sQ0FBQyxRQUFQLENBQWdCLEtBQUssQ0FBQyxTQUF0QixFQUFpQyxFQUFqQyxDQUFBLEdBQXVDLENBQW5GLEVBQXNGLE1BQU0sQ0FBQyxRQUFQLENBQWdCLEtBQUssQ0FBQyxRQUF0QixFQUFnQyxFQUFoQyxDQUFBLEdBQXNDLENBQTVILENBRE0sR0FHTixDQUNFLENB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

//# sourceURL=/home/takaaki/.atom/packages/linter-rust/lib/mode.coffee
