Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.provideBuilder = provideBuilder;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

// Transfer existing settings from previous versions of the package
'use babel';

if (atom.config.get('build-cargo.showBacktrace')) {
  atom.config.set('build-cargo.backtraceType', 'Compact');
}
if (atom.config.get('build-cargo.cargoCheck')) {
  atom.config.set('build-cargo.extCommands.cargoCheck', true);
}
if (atom.config.get('build-cargo.cargoClippy')) {
  atom.config.set('build-cargo.extCommands.cargoClippy', true);
}
// Remove old settings
atom.config.unset('build-cargo.showBacktrace');
atom.config.unset('build-cargo.cargoCheck');
atom.config.unset('build-cargo.cargoClippy');
atom.config.unset('build-cargo.jsonErrors');

var config = {
  cargoPath: {
    title: 'Path to the Cargo executable',
    type: 'string',
    'default': 'cargo',
    order: 1
  },
  multiCrateProjects: {
    title: 'Enable multi-crate projects support',
    description: 'Build internal crates separately based on the current open file.',
    type: 'boolean',
    'default': false,
    order: 2
  },
  verbose: {
    title: 'Verbose Cargo output',
    description: 'Pass the --verbose flag to Cargo.',
    type: 'boolean',
    'default': false,
    order: 3
  },
  backtraceType: {
    title: 'Backtrace',
    description: 'Stack backtrace verbosity level. Uses the environment variable RUST_BACKTRACE=1 if not `Off`.',
    type: 'string',
    'default': 'Off',
    'enum': ['Off', 'Compact', 'Full'],
    order: 4
  },
  jsonErrorFormat: {
    title: 'Use JSON error format',
    description: 'Use JSON error format instead of human readable output.',
    type: 'boolean',
    'default': true,
    order: 5
  },
  openDocs: {
    title: 'Open documentation in browser after \'doc\' target is built',
    type: 'boolean',
    'default': false,
    order: 6
  },
  extCommands: {
    title: 'Extended Commands',
    type: 'object',
    order: 7,
    properties: {
      cargoCheck: {
        title: 'Enable cargo check',
        description: 'Enable the `cargo check` Cargo command. Only use this if you have `cargo check` installed.',
        type: 'boolean',
        'default': false,
        order: 1
      },
      cargoClippy: {
        title: 'Enable cargo clippy',
        description: 'Enable the `cargo clippy` Cargo command to run Clippy\'s lints. Only use this if you have the `cargo clippy` package installed.',
        type: 'boolean',
        'default': false,
        order: 2
      }
    }
  }
};

exports.config = config;

function provideBuilder() {
  return (function () {
    function CargoBuildProvider(cwd) {
      _classCallCheck(this, CargoBuildProvider);

      this.cwd = cwd;
    }

    _createClass(CargoBuildProvider, [{
      key: 'getNiceName',
      value: function getNiceName() {
        return 'Cargo';
      }
    }, {
      key: 'isEligible',
      value: function isEligible() {
        return _fs2['default'].existsSync(this.cwd + '/Cargo.toml');
      }
    }, {
      key: 'settings',
      value: function settings() {
        var path = require('path');
        var err = require('./errors');
        var stdParser = require('./std-parser');
        var jsonParser = require('./json-parser');
        var panicParser = require('./panic-parser');

        var buildWorkDir = undefined; // The last build workding directory (might differ from the project root for multi-crate projects)
        var panicsLimit = 10; // Max number of panics to show at once

        // Split output and remove ANSI escape codes if needed
        function extractLines(output, removeEscape) {
          var lines = output.split(/\n/);
          if (removeEscape) {
            for (var i = 0; i < lines.length; i++) {
              lines[i] = lines[i].replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
            }
          }
          return lines;
        }

        function matchFunction(output) {
          var useJson = atom.config.get('build-cargo.jsonErrorFormat');
          var messages = []; // resulting collection of high-level messages
          var panicsN = 0; // quantity of panics in this output
          var lines = extractLines(output, !useJson);
          for (var i = 0; i < lines.length; i++) {
            var parsedQty = 0;

            // Try parse a JSON message
            if (useJson && lines[i].startsWith('{')) {
              jsonParser.parseMessage(lines[i], messages);
              parsedQty = 1;
            }

            // Try parse a standard output message
            if (parsedQty === 0 && !useJson) {
              parsedQty = stdParser.tryParseMessage(lines, i, messages);
            }

            // Try parse a panic
            if (parsedQty === 0) {
              parsedQty = panicParser.tryParsePanic(lines, i, panicsN < panicsLimit, buildWorkDir);
              if (parsedQty > 0) {
                panicsN += 1;
              }
            }

            if (parsedQty > 1) {
              i += parsedQty - 1; // Subtract one because the current line is already counted
            }
          }
          var hiddenPanicsN = panicsN - panicsLimit;
          if (hiddenPanicsN === 1) {
            atom.notifications.addError('One more panic is hidden', { dismissable: true });
          } else if (hiddenPanicsN > 1) {
            atom.notifications.addError(hiddenPanicsN + ' more panics are hidden', { dismissable: true });
          }
          return messages.filter(function (m) {
            return err.preprocessMessage(m, buildWorkDir);
          });
        }

        // Checks if the given object represents the root of the project or file system
        function isRoot(parts) {
          if (parts.dir === parts.root) {
            return true; // The file system root
          }
          return atom.project.getPaths().some(function (p) {
            return parts.dir === p;
          });
        }

        // Returns the closest directory with Cargo.toml in it.
        // If there's no such directory, returns undefined.
        function findCargoProjectDir(_x) {
          var _again = true;

          _function: while (_again) {
            var p = _x;
            _again = false;

            var parts = path.parse(p);
            var root = isRoot(parts);
            var cargoToml = path.format({
              dir: parts.dir,
              base: 'Cargo.toml'
            });
            try {
              if (_fs2['default'].statSync(cargoToml).isFile()) {
                return {
                  dir: parts.dir,
                  root: root
                };
              }
            } catch (e) {
              if (e.code !== 'ENOENT') {
                // No such file (Cargo.toml)
                throw e;
              }
            }
            if (root) {
              return undefined;
            }
            _x = parts.dir;
            _again = true;
            parts = root = cargoToml = undefined;
            continue _function;
          }
        }

        // This function is called before every build. It finds the closest
        // Cargo.toml file in the path and uses its directory as working.
        function prepareBuild(buildCfg) {
          // Common build command parameters
          buildCfg.exec = atom.config.get('build-cargo.cargoPath');
          buildCfg.env = {};
          if (atom.config.get('build-cargo.jsonErrorFormat')) {
            buildCfg.args.push('--message-format=json');
          } else if (process.platform !== 'win32') {
            buildCfg.env.TERM = 'xterm';
            buildCfg.env.RUSTFLAGS = '--color=always';
          }
          if (atom.config.get('build-cargo.backtraceType') !== 'Off') {
            buildCfg.env.RUST_BACKTRACE = '1';
          }
          buildCfg.args = buildCfg.args || [];
          atom.config.get('build-cargo.verbose') && buildCfg.args.push('--verbose');

          // Substitute working directory if we are in a multi-crate environment
          if (atom.config.get('build-cargo.multiCrateProjects')) {
            var editor = atom.workspace.getActiveTextEditor();
            buildCfg.cwd = undefined;
            if (editor && editor.getPath()) {
              var wdInfo = findCargoProjectDir(editor.getPath());
              if (wdInfo) {
                if (!wdInfo.root) {
                  var p = path.parse(wdInfo.dir);
                  atom.notifications.addInfo('Building ' + p.base + '...');
                }
                buildCfg.cwd = wdInfo.dir;
              }
            }
          }
          if (!buildCfg.cwd && atom.project.getPaths().length > 0) {
            // Build in the root of the first path by default
            buildCfg.cwd = atom.project.getPaths()[0];
          }
          buildWorkDir = buildCfg.cwd;
        }

        var commands = [{
          name: 'Cargo: build (debug)',
          atomCommandName: 'cargo:build-debug',
          argsCfg: ['build']
        }, {
          name: 'Cargo: build (release)',
          atomCommandName: 'cargo:build-release',
          argsCfg: ['build', '--release']
        }, {
          name: 'Cargo: bench',
          atomCommandName: 'cargo:bench',
          argsCfg: ['bench']
        }, {
          name: 'Cargo: clean',
          atomCommandName: 'cargo:clean',
          argsCfg: ['clean']
        }, {
          name: 'Cargo: doc',
          atomCommandName: 'cargo:doc',
          argsCfg: ['doc'],
          preConfig: function preConfig() {
            atom.config.get('build-cargo.openDocs') && this.args.push('--open');
          }
        }, {
          name: 'Cargo: run (debug)',
          atomCommandName: 'cargo:run-debug',
          argsCfg: ['run']
        }, {
          name: 'Cargo: run (release)',
          atomCommandName: 'cargo:run-release',
          argsCfg: ['run', '--release']
        }, {
          name: 'Cargo: test',
          atomCommandName: 'cargo:run-test',
          argsCfg: ['test']
        }, {
          name: 'Cargo: update',
          atomCommandName: 'cargo:update',
          argsCfg: ['update']
        }, {
          name: 'Cargo: build example',
          atomCommandName: 'cargo:build-example',
          argsCfg: ['build', '--example', '{FILE_ACTIVE_NAME_BASE}']
        }, {
          name: 'Cargo: run example',
          atomCommandName: 'cargo:run-example',
          argsCfg: ['run', '--example', '{FILE_ACTIVE_NAME_BASE}']
        }, {
          name: 'Cargo: run bin',
          atomCommandName: 'cargo:run-bin',
          argsCfg: ['run', '--bin', '{FILE_ACTIVE_NAME_BASE}']
        }];

        if (atom.config.get('build-cargo.extCommands.cargoClippy')) {
          commands.push({
            name: 'Cargo: Clippy',
            atomCommandName: 'cargo:clippy',
            argsCfg: ['clippy']
          });
        }

        if (atom.config.get('build-cargo.extCommands.cargoCheck')) {
          commands.push({
            name: 'Cargo: check',
            atomCommandName: 'cargo:check',
            argsCfg: ['check']
          });
        }

        commands.forEach(function (cmd) {
          cmd.exec = atom.config.get('build-cargo.cargoPath');
          cmd.sh = false;
          cmd.functionMatch = matchFunction;
          cmd.preBuild = function () {
            this.args = this.argsCfg.slice(0); // Clone initial arguments
            if (this.preConfig) {
              this.preConfig(); // Allow the command to configure its arguments
            }
            prepareBuild(this);
          };
        });

        return commands;
      }
    }]);

    return CargoBuildProvider;
  })();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQtY2FyZ28vbGliL2NhcmdvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztrQkFFZSxJQUFJOzs7OztBQUZuQixXQUFXLENBQUM7O0FBS1osSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxFQUFFO0FBQ2hELE1BQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDJCQUEyQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0NBQ3pEO0FBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFO0FBQzdDLE1BQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQzdEO0FBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFO0FBQzlDLE1BQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQzlEOztBQUVELElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUM1QyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQzdDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7O0FBRXJDLElBQU0sTUFBTSxHQUFHO0FBQ3BCLFdBQVMsRUFBRTtBQUNULFNBQUssRUFBRSw4QkFBOEI7QUFDckMsUUFBSSxFQUFFLFFBQVE7QUFDZCxlQUFTLE9BQU87QUFDaEIsU0FBSyxFQUFFLENBQUM7R0FDVDtBQUNELG9CQUFrQixFQUFFO0FBQ2xCLFNBQUssRUFBRSxxQ0FBcUM7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LEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQ3BELGFBQUcsQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDO0FBQ2YsYUFBRyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7QUFDbEMsYUFBRyxDQUFDLFFBQVEsR0FBRyxZQUFZO0FBQ3pCLGdCQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLGdCQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDbEIsa0JBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQzthQUNsQjtBQUNELHdCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7V0FDcEIsQ0FBQztTQUNILENBQUMsQ0FBQzs7QUFFSCxlQUFPLFFBQVEsQ0FBQztPQUNqQjs7O1dBelBVLGtCQUFrQjtPQTBQN0I7Q0FDSCIsImZpbGUiOiIvaG9tZS90YWthYWtpLy5hdG9tL3BhY2thZ2VzL2J1aWxkLWNhcmdvL2xpYi9jYXJnby5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuXG4vLyBUcmFuc2ZlciBleGlzdGluZyBzZXR0aW5ncyBmcm9tIHByZXZpb3VzIHZlcnNpb25zIG9mIHRoZSBwYWNrYWdlXG5pZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5zaG93QmFja3RyYWNlJykpIHtcbiAgYXRvbS5jb25maWcuc2V0KCdidWlsZC1jYXJnby5iYWNrdHJhY2VUeXBlJywgJ0NvbXBhY3QnKTtcbn1cbmlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLmNhcmdvQ2hlY2snKSkge1xuICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLWNhcmdvLmV4dENvbW1hbmRzLmNhcmdvQ2hlY2snLCB0cnVlKTtcbn1cbmlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLmNhcmdvQ2xpcHB5JykpIHtcbiAgYXRvbS5jb25maWcuc2V0KCdidWlsZC1jYXJnby5leHRDb21tYW5kcy5jYXJnb0NsaXBweScsIHRydWUpO1xufVxuLy8gUmVtb3ZlIG9sZCBzZXR0aW5nc1xuYXRvbS5jb25maWcudW5zZXQoJ2J1aWxkLWNhcmdvLnNob3dCYWNrdHJhY2UnKTtcbmF0b20uY29uZmlnLnVuc2V0KCdidWlsZC1jYXJnby5jYXJnb0NoZWNrJyk7XG5hdG9tLmNvbmZpZy51bnNldCgnYnVpbGQtY2FyZ28uY2FyZ29DbGlwcHknKTtcbmF0b20uY29uZmlnLnVuc2V0KCdidWlsZC1jYXJnby5qc29uRXJyb3JzJyk7XG5cbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XG4gIGNhcmdvUGF0aDoge1xuICAgIHRpdGxlOiAnUGF0aCB0byB0aGUgQ2FyZ28gZXhlY3V0YWJsZScsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ2NhcmdvJyxcbiAgICBvcmRlcjogMVxuICB9LFxuICBtdWx0aUNyYXRlUHJvamVjdHM6IHtcbiAgICB0aXRsZTogJ0VuYWJsZSBtdWx0aS1jcmF0ZSBwcm9qZWN0cyBzdXBwb3J0JyxcbiAgICBkZXNjcmlwdGlvbjogJ0J1aWxkIGludGVybmFsIGNyYXRlcyBzZXBhcmF0ZWx5IGJhc2VkIG9uIHRoZSBjdXJyZW50IG9wZW4gZmlsZS4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogMlxuICB9LFxuICB2ZXJib3NlOiB7XG4gICAgdGl0bGU6ICdWZXJib3NlIENhcmdvIG91dHB1dCcsXG4gICAgZGVzY3JpcHRpb246ICdQYXNzIHRoZSAtLXZlcmJvc2UgZmxhZyB0byBDYXJnby4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogM1xuICB9LFxuICBiYWNrdHJhY2VUeXBlOiB7XG4gICAgdGl0bGU6ICdCYWNrdHJhY2UnLFxuICAgIGRlc2NyaXB0aW9uOiAnU3RhY2sgYmFja3RyYWNlIHZlcmJvc2l0eSBsZXZlbC4gVXNlcyB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGUgUlVTVF9CQUNLVFJBQ0U9MSBpZiBub3QgYE9mZmAuJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAnT2ZmJyxcbiAgICBlbnVtOiBbICdPZmYnLCAnQ29tcGFjdCcsICdGdWxsJyBdLFxuICAgIG9yZGVyOiA0XG4gIH0sXG4gIGpzb25FcnJvckZvcm1hdDoge1xuICAgIHRpdGxlOiAnVXNlIEpTT04gZXJyb3IgZm9ybWF0JyxcbiAgICBkZXNjcmlwdGlvbjogJ1VzZSBKU09OIGVycm9yIGZvcm1hdCBpbnN0ZWFkIG9mIGh1bWFuIHJlYWRhYmxlIG91dHB1dC4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG9yZGVyOiA1XG4gIH0sXG4gIG9wZW5Eb2NzOiB7XG4gICAgdGl0bGU6ICdPcGVuIGRvY3VtZW50YXRpb24gaW4gYnJvd3NlciBhZnRlciBcXCdkb2NcXCcgdGFyZ2V0IGlzIGJ1aWx0JyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDZcbiAgfSxcbiAgZXh0Q29tbWFuZHM6IHtcbiAgICB0aXRsZTogJ0V4dGVuZGVkIENvbW1hbmRzJyxcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICBvcmRlcjogNyxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBjYXJnb0NoZWNrOiB7XG4gICAgICAgIHRpdGxlOiAnRW5hYmxlIGNhcmdvIGNoZWNrJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdFbmFibGUgdGhlIGBjYXJnbyBjaGVja2AgQ2FyZ28gY29tbWFuZC4gT25seSB1c2UgdGhpcyBpZiB5b3UgaGF2ZSBgY2FyZ28gY2hlY2tgIGluc3RhbGxlZC4nLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBvcmRlcjogMVxuICAgICAgfSxcbiAgICAgIGNhcmdvQ2xpcHB5OiB7XG4gICAgICAgIHRpdGxlOiAnRW5hYmxlIGNhcmdvIGNsaXBweScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRW5hYmxlIHRoZSBgY2FyZ28gY2xpcHB5YCBDYXJnbyBjb21tYW5kIHRvIHJ1biBDbGlwcHlcXCdzIGxpbnRzLiBPbmx5IHVzZSB0aGlzIGlmIHlvdSBoYXZlIHRoZSBgY2FyZ28gY2xpcHB5YCBwYWNrYWdlIGluc3RhbGxlZC4nLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBvcmRlcjogMlxuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVCdWlsZGVyKCkge1xuICByZXR1cm4gY2xhc3MgQ2FyZ29CdWlsZFByb3ZpZGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihjd2QpIHtcbiAgICAgIHRoaXMuY3dkID0gY3dkO1xuICAgIH1cblxuICAgIGdldE5pY2VOYW1lKCkge1xuICAgICAgcmV0dXJuICdDYXJnbyc7XG4gICAgfVxuXG4gICAgaXNFbGlnaWJsZSgpIHtcbiAgICAgIHJldHVybiBmcy5leGlzdHNTeW5jKGAke3RoaXMuY3dkfS9DYXJnby50b21sYCk7XG4gICAgfVxuXG4gICAgc2V0dGluZ3MoKSB7XG4gICAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuICAgICAgY29uc3QgZXJyID0gcmVxdWlyZSgnLi9lcnJvcnMnKTtcbiAgICAgIGNvbnN0IHN0ZFBhcnNlciA9IHJlcXVpcmUoJy4vc3RkLXBhcnNlcicpO1xuICAgICAgY29uc3QganNvblBhcnNlciA9IHJlcXVpcmUoJy4vanNvbi1wYXJzZXInKTtcbiAgICAgIGNvbnN0IHBhbmljUGFyc2VyID0gcmVxdWlyZSgnLi9wYW5pYy1wYXJzZXInKTtcblxuICAgICAgbGV0IGJ1aWxkV29ya0RpcjsgICAgICAgIC8vIFRoZSBsYXN0IGJ1aWxkIHdvcmtkaW5nIGRpcmVjdG9yeSAobWlnaHQgZGlmZmVyIGZyb20gdGhlIHByb2plY3Qgcm9vdCBmb3IgbXVsdGktY3JhdGUgcHJvamVjdHMpXG4gICAgICBjb25zdCBwYW5pY3NMaW1pdCA9IDEwOyAgLy8gTWF4IG51bWJlciBvZiBwYW5pY3MgdG8gc2hvdyBhdCBvbmNlXG5cbiAgICAgIC8vIFNwbGl0IG91dHB1dCBhbmQgcmVtb3ZlIEFOU0kgZXNjYXBlIGNvZGVzIGlmIG5lZWRlZFxuICAgICAgZnVuY3Rpb24gZXh0cmFjdExpbmVzKG91dHB1dCwgcmVtb3ZlRXNjYXBlKSB7XG4gICAgICAgIGNvbnN0IGxpbmVzID0gb3V0cHV0LnNwbGl0KC9cXG4vKTtcbiAgICAgICAgaWYgKHJlbW92ZUVzY2FwZSkge1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxpbmVzW2ldID0gbGluZXNbaV0ucmVwbGFjZSgvW1xcdTAwMWJcXHUwMDliXVtbKCkjOz9dKig/OlswLTldezEsNH0oPzo7WzAtOV17MCw0fSkqKT9bMC05QS1PUlpjZi1ucXJ5PT48XS9nLCAnJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaW5lcztcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gbWF0Y2hGdW5jdGlvbihvdXRwdXQpIHtcbiAgICAgICAgY29uc3QgdXNlSnNvbiA9IGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uanNvbkVycm9yRm9ybWF0Jyk7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VzID0gW107ICAgIC8vIHJlc3VsdGluZyBjb2xsZWN0aW9uIG9mIGhpZ2gtbGV2ZWwgbWVzc2FnZXNcbiAgICAgICAgbGV0IHBhbmljc04gPSAwOyAgICAgICAgLy8gcXVhbnRpdHkgb2YgcGFuaWNzIGluIHRoaXMgb3V0cHV0XG4gICAgICAgIGNvbnN0IGxpbmVzID0gZXh0cmFjdExpbmVzKG91dHB1dCwgIXVzZUpzb24pO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgbGV0IHBhcnNlZFF0eSA9IDA7XG5cbiAgICAgICAgICAvLyBUcnkgcGFyc2UgYSBKU09OIG1lc3NhZ2VcbiAgICAgICAgICBpZiAodXNlSnNvbiAmJiBsaW5lc1tpXS5zdGFydHNXaXRoKCd7JykpIHtcbiAgICAgICAgICAgIGpzb25QYXJzZXIucGFyc2VNZXNzYWdlKGxpbmVzW2ldLCBtZXNzYWdlcyk7XG4gICAgICAgICAgICBwYXJzZWRRdHkgPSAxO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFRyeSBwYXJzZSBhIHN0YW5kYXJkIG91dHB1dCBtZXNzYWdlXG4gICAgICAgICAgaWYgKHBhcnNlZFF0eSA9PT0gMCAmJiAhdXNlSnNvbikge1xuICAgICAgICAgICAgcGFyc2VkUXR5ID0gc3RkUGFyc2VyLnRyeVBhcnNlTWVzc2FnZShsaW5lcywgaSwgbWVzc2FnZXMpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFRyeSBwYXJzZSBhIHBhbmljXG4gICAgICAgICAgaWYgKHBhcnNlZFF0eSA9PT0gMCkge1xuICAgICAgICAgICAgcGFyc2VkUXR5ID0gcGFuaWNQYXJzZXIudHJ5UGFyc2VQYW5pYyhsaW5lcywgaSwgcGFuaWNzTiA8IHBhbmljc0xpbWl0LCBidWlsZFdvcmtEaXIpO1xuICAgICAgICAgICAgaWYgKHBhcnNlZFF0eSA+IDApIHtcbiAgICAgICAgICAgICAgcGFuaWNzTiArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChwYXJzZWRRdHkgPiAxKSB7XG4gICAgICAgICAgICBpICs9IHBhcnNlZFF0eSAtIDE7IC8vIFN1YnRyYWN0IG9uZSBiZWNhdXNlIHRoZSBjdXJyZW50IGxpbmUgaXMgYWxyZWFkeSBjb3VudGVkXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhpZGRlblBhbmljc04gPSBwYW5pY3NOIC0gcGFuaWNzTGltaXQ7XG4gICAgICAgIGlmIChoaWRkZW5QYW5pY3NOID09PSAxKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdPbmUgbW9yZSBwYW5pYyBpcyBoaWRkZW4nLCB7IGRpc21pc3NhYmxlOiB0cnVlIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGhpZGRlblBhbmljc04gPiAxKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGhpZGRlblBhbmljc04gKyAnIG1vcmUgcGFuaWNzIGFyZSBoaWRkZW4nLCB7IGRpc21pc3NhYmxlOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZXNzYWdlcy5maWx0ZXIoZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICByZXR1cm4gZXJyLnByZXByb2Nlc3NNZXNzYWdlKG0sIGJ1aWxkV29ya0Rpcik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBDaGVja3MgaWYgdGhlIGdpdmVuIG9iamVjdCByZXByZXNlbnRzIHRoZSByb290IG9mIHRoZSBwcm9qZWN0IG9yIGZpbGUgc3lzdGVtXG4gICAgICBmdW5jdGlvbiBpc1Jvb3QocGFydHMpIHtcbiAgICAgICAgaWYgKHBhcnRzLmRpciA9PT0gcGFydHMucm9vdCkge1xuICAgICAgICAgIHJldHVybiB0cnVlOyAgICAvLyBUaGUgZmlsZSBzeXN0ZW0gcm9vdFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKS5zb21lKHAgPT4ge1xuICAgICAgICAgIHJldHVybiBwYXJ0cy5kaXIgPT09IHA7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm5zIHRoZSBjbG9zZXN0IGRpcmVjdG9yeSB3aXRoIENhcmdvLnRvbWwgaW4gaXQuXG4gICAgICAvLyBJZiB0aGVyZSdzIG5vIHN1Y2ggZGlyZWN0b3J5LCByZXR1cm5zIHVuZGVmaW5lZC5cbiAgICAgIGZ1bmN0aW9uIGZpbmRDYXJnb1Byb2plY3REaXIocCkge1xuICAgICAgICBjb25zdCBwYXJ0cyA9IHBhdGgucGFyc2UocCk7XG4gICAgICAgIGNvbnN0IHJvb3QgPSBpc1Jvb3QocGFydHMpO1xuICAgICAgICBjb25zdCBjYXJnb1RvbWwgPSBwYXRoLmZvcm1hdCh7XG4gICAgICAgICAgZGlyOiBwYXJ0cy5kaXIsXG4gICAgICAgICAgYmFzZTogJ0NhcmdvLnRvbWwnXG4gICAgICAgIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChmcy5zdGF0U3luYyhjYXJnb1RvbWwpLmlzRmlsZSgpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBkaXI6IHBhcnRzLmRpcixcbiAgICAgICAgICAgICAgcm9vdDogcm9vdFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBpZiAoZS5jb2RlICE9PSAnRU5PRU5UJykgeyAgLy8gTm8gc3VjaCBmaWxlIChDYXJnby50b21sKVxuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJvb3QpIHtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaW5kQ2FyZ29Qcm9qZWN0RGlyKHBhcnRzLmRpcik7XG4gICAgICB9XG5cbiAgICAgIC8vIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGJlZm9yZSBldmVyeSBidWlsZC4gSXQgZmluZHMgdGhlIGNsb3Nlc3RcbiAgICAgIC8vIENhcmdvLnRvbWwgZmlsZSBpbiB0aGUgcGF0aCBhbmQgdXNlcyBpdHMgZGlyZWN0b3J5IGFzIHdvcmtpbmcuXG4gICAgICBmdW5jdGlvbiBwcmVwYXJlQnVpbGQoYnVpbGRDZmcpIHtcbiAgICAgICAgLy8gQ29tbW9uIGJ1aWxkIGNvbW1hbmQgcGFyYW1ldGVyc1xuICAgICAgICBidWlsZENmZy5leGVjID0gYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5jYXJnb1BhdGgnKTtcbiAgICAgICAgYnVpbGRDZmcuZW52ID0ge307XG4gICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLmpzb25FcnJvckZvcm1hdCcpKSB7XG4gICAgICAgICAgYnVpbGRDZmcuYXJncy5wdXNoKCctLW1lc3NhZ2UtZm9ybWF0PWpzb24nKTtcbiAgICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSAnd2luMzInKSB7XG4gICAgICAgICAgYnVpbGRDZmcuZW52LlRFUk0gPSAneHRlcm0nO1xuICAgICAgICAgIGJ1aWxkQ2ZnLmVudi5SVVNURkxBR1MgPSAnLS1jb2xvcj1hbHdheXMnO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLmJhY2t0cmFjZVR5cGUnKSAhPT0gJ09mZicpIHtcbiAgICAgICAgICBidWlsZENmZy5lbnYuUlVTVF9CQUNLVFJBQ0UgPSAnMSc7XG4gICAgICAgIH1cbiAgICAgICAgYnVpbGRDZmcuYXJncyA9IGJ1aWxkQ2ZnLmFyZ3MgfHwgW107XG4gICAgICAgIGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28udmVyYm9zZScpICYmIGJ1aWxkQ2ZnLmFyZ3MucHVzaCgnLS12ZXJib3NlJyk7XG5cbiAgICAgICAgLy8gU3Vic3RpdHV0ZSB3b3JraW5nIGRpcmVjdG9yeSBpZiB3ZSBhcmUgaW4gYSBtdWx0aS1jcmF0ZSBlbnZpcm9ubWVudFxuICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5tdWx0aUNyYXRlUHJvamVjdHMnKSkge1xuICAgICAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgICAgICBidWlsZENmZy5jd2QgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgaWYgKGVkaXRvciAmJiBlZGl0b3IuZ2V0UGF0aCgpKSB7XG4gICAgICAgICAgICBjb25zdCB3ZEluZm8gPSBmaW5kQ2FyZ29Qcm9qZWN0RGlyKGVkaXRvci5nZXRQYXRoKCkpO1xuICAgICAgICAgICAgaWYgKHdkSW5mbykge1xuICAgICAgICAgICAgICBpZiAoIXdkSW5mby5yb290KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcCA9IHBhdGgucGFyc2Uod2RJbmZvLmRpcik7XG4gICAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ0J1aWxkaW5nICcgKyBwLmJhc2UgKyAnLi4uJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnVpbGRDZmcuY3dkID0gd2RJbmZvLmRpcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFidWlsZENmZy5jd2QgJiYgYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkubGVuZ3RoID4gMCkge1xuICAgICAgICAgIC8vIEJ1aWxkIGluIHRoZSByb290IG9mIHRoZSBmaXJzdCBwYXRoIGJ5IGRlZmF1bHRcbiAgICAgICAgICBidWlsZENmZy5jd2QgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXTtcbiAgICAgICAgfVxuICAgICAgICBidWlsZFdvcmtEaXIgPSBidWlsZENmZy5jd2Q7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNvbW1hbmRzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBidWlsZCAoZGVidWcpJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpidWlsZC1kZWJ1ZycsXG4gICAgICAgICAgYXJnc0NmZzogWyAnYnVpbGQnIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogYnVpbGQgKHJlbGVhc2UpJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpidWlsZC1yZWxlYXNlJyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdidWlsZCcsICctLXJlbGVhc2UnIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogYmVuY2gnLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOmJlbmNoJyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdiZW5jaCcgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBjbGVhbicsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286Y2xlYW4nLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ2NsZWFuJyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IGRvYycsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286ZG9jJyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdkb2MnIF0sXG4gICAgICAgICAgcHJlQ29uZmlnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLm9wZW5Eb2NzJykgJiYgdGhpcy5hcmdzLnB1c2goJy0tb3BlbicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogcnVuIChkZWJ1ZyknLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOnJ1bi1kZWJ1ZycsXG4gICAgICAgICAgYXJnc0NmZzogWyAncnVuJyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IHJ1biAocmVsZWFzZSknLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOnJ1bi1yZWxlYXNlJyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdydW4nLCAnLS1yZWxlYXNlJyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IHRlc3QnLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOnJ1bi10ZXN0JyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICd0ZXN0JyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IHVwZGF0ZScsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286dXBkYXRlJyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICd1cGRhdGUnIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogYnVpbGQgZXhhbXBsZScsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286YnVpbGQtZXhhbXBsZScsXG4gICAgICAgICAgYXJnc0NmZzogWyAnYnVpbGQnLCAnLS1leGFtcGxlJywgJ3tGSUxFX0FDVElWRV9OQU1FX0JBU0V9JyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IHJ1biBleGFtcGxlJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpydW4tZXhhbXBsZScsXG4gICAgICAgICAgYXJnc0NmZzogWyAncnVuJywgJy0tZXhhbXBsZScsICd7RklMRV9BQ1RJVkVfTkFNRV9CQVNFfScgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBydW4gYmluJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpydW4tYmluJyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdydW4nLCAnLS1iaW4nLCAne0ZJTEVfQUNUSVZFX05BTUVfQkFTRX0nIF1cbiAgICAgICAgfVxuICAgICAgXTtcblxuICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uZXh0Q29tbWFuZHMuY2FyZ29DbGlwcHknKSkge1xuICAgICAgICBjb21tYW5kcy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IENsaXBweScsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286Y2xpcHB5JyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdjbGlwcHknIF1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLmV4dENvbW1hbmRzLmNhcmdvQ2hlY2snKSkge1xuICAgICAgICBjb21tYW5kcy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IGNoZWNrJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpjaGVjaycsXG4gICAgICAgICAgYXJnc0NmZzogWyAnY2hlY2snIF1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGNvbW1hbmRzLmZvckVhY2goY21kID0+IHtcbiAgICAgICAgY21kLmV4ZWMgPSBhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLmNhcmdvUGF0aCcpO1xuICAgICAgICBjbWQuc2ggPSBmYWxzZTtcbiAgICAgICAgY21kLmZ1bmN0aW9uTWF0Y2ggPSBtYXRjaEZ1bmN0aW9uO1xuICAgICAgICBjbWQucHJlQnVpbGQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhpcy5hcmdzID0gdGhpcy5hcmdzQ2ZnLnNsaWNlKDApOyAgICAvLyBDbG9uZSBpbml0aWFsIGFyZ3VtZW50c1xuICAgICAgICAgIGlmICh0aGlzLnByZUNvbmZpZykge1xuICAgICAgICAgICAgdGhpcy5wcmVDb25maWcoKTsgICAgICAgICAgICAgICAgICAgLy8gQWxsb3cgdGhlIGNvbW1hbmQgdG8gY29uZmlndXJlIGl0cyBhcmd1bWVudHNcbiAgICAgICAgICB9XG4gICAgICAgICAgcHJlcGFyZUJ1aWxkKHRoaXMpO1xuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBjb21tYW5kcztcbiAgICB9XG4gIH07XG59XG4iXX0=