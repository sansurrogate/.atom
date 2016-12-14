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

        function matchFunction(output, useJson) {
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
          var useJson = atom.config.get('build-cargo.jsonErrorFormat') && buildCfg.supportsMessageFormat;
          buildCfg.functionMatch = function (messages) {
            return matchFunction(messages, useJson);
          };
          if (useJson) {
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
          supportsMessageFormat: true,
          argsCfg: ['build']
        }, {
          name: 'Cargo: build (release)',
          atomCommandName: 'cargo:build-release',
          supportsMessageFormat: true,
          argsCfg: ['build', '--release']
        }, {
          name: 'Cargo: bench',
          atomCommandName: 'cargo:bench',
          supportsMessageFormat: true,
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
          supportsMessageFormat: true,
          argsCfg: ['run']
        }, {
          name: 'Cargo: run (release)',
          atomCommandName: 'cargo:run-release',
          supportsMessageFormat: true,
          argsCfg: ['run', '--release']
        }, {
          name: 'Cargo: test',
          atomCommandName: 'cargo:run-test',
          supportsMessageFormat: true,
          argsCfg: ['test']
        }, {
          name: 'Cargo: update',
          atomCommandName: 'cargo:update',
          argsCfg: ['update']
        }, {
          name: 'Cargo: build example',
          atomCommandName: 'cargo:build-example',
          supportsMessageFormat: true,
          argsCfg: ['build', '--example', '{FILE_ACTIVE_NAME_BASE}']
        }, {
          name: 'Cargo: run example',
          atomCommandName: 'cargo:run-example',
          supportsMessageFormat: true,
          argsCfg: ['run', '--example', '{FILE_ACTIVE_NAME_BASE}']
        }, {
          name: 'Cargo: run bin',
          atomCommandName: 'cargo:run-bin',
          supportsMessageFormat: true,
          argsCfg: ['run', '--bin', '{FILE_ACTIVE_NAME_BASE}']
        }];

        if (atom.config.get('build-cargo.extCommands.cargoClippy')) {
          commands.push({
            name: 'Cargo: Clippy',
            atomCommandName: 'cargo:clippy',
            supportsMessageFormat: true,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQtY2FyZ28vbGliL2NhcmdvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztrQkFFZSxJQUFJOzs7OztBQUZuQixXQUFXLENBQUM7O0FBS1osSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxFQUFFO0FBQ2hELE1BQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDJCQUEyQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0NBQ3pEO0FBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFO0FBQzdDLE1BQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQzdEO0FBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFO0FBQzlDLE1BQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQzlEOztBQUVELElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUM1QyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQzdDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7O0FBRXJDLElBQU0sTUFBTSxHQUFHO0FBQ3BCLFdBQVMsRUFBRTtBQUNULFNBQUssRUFBRSw4QkFBOEI7QUFDckMsUUFBSSxFQUFFLFFBQVE7QUFDZCxlQUFTLE9BQU87QUFDaEIsU0FBSyxFQUFFLENBQUM7R0FDVDtBQUNELG9CQUFrQixFQUFFO0FBQ2xCLFNBQUssRUFBRSxxQ0FBcUM7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O0FBQzNCLG1CQUFPLEVBQUUsQ0FBRSxRQUFRLENBQUU7V0FDdEIsQ0FBQyxDQUFDO1NBQ0o7O0FBRUQsWUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQyxFQUFFO0FBQ3pELGtCQUFRLENBQUMsSUFBSSxDQUFDO0FBQ1osZ0JBQUksRUFBRSxjQUFjO0FBQ3BCLDJCQUFlLEVBQUUsYUFBYTtBQUM5QixtQkFBTyxFQUFFLENBQUUsT0FBTyxDQUFFO1dBQ3JCLENBQUMsQ0FBQztTQUNKOztBQUVELGdCQUFRLENBQUMsT0FBTyxDQUFDLFVBQUEsR0FBRyxFQUFJO0FBQ3RCLGFBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUNwRCxhQUFHLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztBQUNmLGFBQUcsQ0FBQyxRQUFRLEdBQUcsWUFBWTtBQUN6QixnQkFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQyxnQkFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ2xCLGtCQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7YUFDbEI7QUFDRCx3QkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1dBQ3BCLENBQUM7U0FDSCxDQUFDLENBQUM7O0FBRUgsZUFBTyxRQUFRLENBQUM7T0FDakI7OztXQW5RVSxrQkFBa0I7T0FvUTdCO0NBQ0giLCJmaWxlIjoiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9idWlsZC1jYXJnby9saWIvY2FyZ28uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuLy8gVHJhbnNmZXIgZXhpc3Rpbmcgc2V0dGluZ3MgZnJvbSBwcmV2aW91cyB2ZXJzaW9ucyBvZiB0aGUgcGFja2FnZVxuaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uc2hvd0JhY2t0cmFjZScpKSB7XG4gIGF0b20uY29uZmlnLnNldCgnYnVpbGQtY2FyZ28uYmFja3RyYWNlVHlwZScsICdDb21wYWN0Jyk7XG59XG5pZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5jYXJnb0NoZWNrJykpIHtcbiAgYXRvbS5jb25maWcuc2V0KCdidWlsZC1jYXJnby5leHRDb21tYW5kcy5jYXJnb0NoZWNrJywgdHJ1ZSk7XG59XG5pZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5jYXJnb0NsaXBweScpKSB7XG4gIGF0b20uY29uZmlnLnNldCgnYnVpbGQtY2FyZ28uZXh0Q29tbWFuZHMuY2FyZ29DbGlwcHknLCB0cnVlKTtcbn1cbi8vIFJlbW92ZSBvbGQgc2V0dGluZ3NcbmF0b20uY29uZmlnLnVuc2V0KCdidWlsZC1jYXJnby5zaG93QmFja3RyYWNlJyk7XG5hdG9tLmNvbmZpZy51bnNldCgnYnVpbGQtY2FyZ28uY2FyZ29DaGVjaycpO1xuYXRvbS5jb25maWcudW5zZXQoJ2J1aWxkLWNhcmdvLmNhcmdvQ2xpcHB5Jyk7XG5hdG9tLmNvbmZpZy51bnNldCgnYnVpbGQtY2FyZ28uanNvbkVycm9ycycpO1xuXG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xuICBjYXJnb1BhdGg6IHtcbiAgICB0aXRsZTogJ1BhdGggdG8gdGhlIENhcmdvIGV4ZWN1dGFibGUnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICdjYXJnbycsXG4gICAgb3JkZXI6IDFcbiAgfSxcbiAgbXVsdGlDcmF0ZVByb2plY3RzOiB7XG4gICAgdGl0bGU6ICdFbmFibGUgbXVsdGktY3JhdGUgcHJvamVjdHMgc3VwcG9ydCcsXG4gICAgZGVzY3JpcHRpb246ICdCdWlsZCBpbnRlcm5hbCBjcmF0ZXMgc2VwYXJhdGVseSBiYXNlZCBvbiB0aGUgY3VycmVudCBvcGVuIGZpbGUuJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDJcbiAgfSxcbiAgdmVyYm9zZToge1xuICAgIHRpdGxlOiAnVmVyYm9zZSBDYXJnbyBvdXRwdXQnLFxuICAgIGRlc2NyaXB0aW9uOiAnUGFzcyB0aGUgLS12ZXJib3NlIGZsYWcgdG8gQ2FyZ28uJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDNcbiAgfSxcbiAgYmFja3RyYWNlVHlwZToge1xuICAgIHRpdGxlOiAnQmFja3RyYWNlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1N0YWNrIGJhY2t0cmFjZSB2ZXJib3NpdHkgbGV2ZWwuIFVzZXMgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIFJVU1RfQkFDS1RSQUNFPTEgaWYgbm90IGBPZmZgLicsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ09mZicsXG4gICAgZW51bTogWyAnT2ZmJywgJ0NvbXBhY3QnLCAnRnVsbCcgXSxcbiAgICBvcmRlcjogNFxuICB9LFxuICBqc29uRXJyb3JGb3JtYXQ6IHtcbiAgICB0aXRsZTogJ1VzZSBKU09OIGVycm9yIGZvcm1hdCcsXG4gICAgZGVzY3JpcHRpb246ICdVc2UgSlNPTiBlcnJvciBmb3JtYXQgaW5zdGVhZCBvZiBodW1hbiByZWFkYWJsZSBvdXRwdXQuJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBvcmRlcjogNVxuICB9LFxuICBvcGVuRG9jczoge1xuICAgIHRpdGxlOiAnT3BlbiBkb2N1bWVudGF0aW9uIGluIGJyb3dzZXIgYWZ0ZXIgXFwnZG9jXFwnIHRhcmdldCBpcyBidWlsdCcsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiA2XG4gIH0sXG4gIGV4dENvbW1hbmRzOiB7XG4gICAgdGl0bGU6ICdFeHRlbmRlZCBDb21tYW5kcycsXG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgb3JkZXI6IDcsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgY2FyZ29DaGVjazoge1xuICAgICAgICB0aXRsZTogJ0VuYWJsZSBjYXJnbyBjaGVjaycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRW5hYmxlIHRoZSBgY2FyZ28gY2hlY2tgIENhcmdvIGNvbW1hbmQuIE9ubHkgdXNlIHRoaXMgaWYgeW91IGhhdmUgYGNhcmdvIGNoZWNrYCBpbnN0YWxsZWQuJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDFcbiAgICAgIH0sXG4gICAgICBjYXJnb0NsaXBweToge1xuICAgICAgICB0aXRsZTogJ0VuYWJsZSBjYXJnbyBjbGlwcHknLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0VuYWJsZSB0aGUgYGNhcmdvIGNsaXBweWAgQ2FyZ28gY29tbWFuZCB0byBydW4gQ2xpcHB5XFwncyBsaW50cy4gT25seSB1c2UgdGhpcyBpZiB5b3UgaGF2ZSB0aGUgYGNhcmdvIGNsaXBweWAgcGFja2FnZSBpbnN0YWxsZWQuJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDJcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlQnVpbGRlcigpIHtcbiAgcmV0dXJuIGNsYXNzIENhcmdvQnVpbGRQcm92aWRlciB7XG4gICAgY29uc3RydWN0b3IoY3dkKSB7XG4gICAgICB0aGlzLmN3ZCA9IGN3ZDtcbiAgICB9XG5cbiAgICBnZXROaWNlTmFtZSgpIHtcbiAgICAgIHJldHVybiAnQ2FyZ28nO1xuICAgIH1cblxuICAgIGlzRWxpZ2libGUoKSB7XG4gICAgICByZXR1cm4gZnMuZXhpc3RzU3luYyhgJHt0aGlzLmN3ZH0vQ2FyZ28udG9tbGApO1xuICAgIH1cblxuICAgIHNldHRpbmdzKCkge1xuICAgICAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbiAgICAgIGNvbnN0IGVyciA9IHJlcXVpcmUoJy4vZXJyb3JzJyk7XG4gICAgICBjb25zdCBzdGRQYXJzZXIgPSByZXF1aXJlKCcuL3N0ZC1wYXJzZXInKTtcbiAgICAgIGNvbnN0IGpzb25QYXJzZXIgPSByZXF1aXJlKCcuL2pzb24tcGFyc2VyJyk7XG4gICAgICBjb25zdCBwYW5pY1BhcnNlciA9IHJlcXVpcmUoJy4vcGFuaWMtcGFyc2VyJyk7XG5cbiAgICAgIGxldCBidWlsZFdvcmtEaXI7ICAgICAgICAvLyBUaGUgbGFzdCBidWlsZCB3b3JrZGluZyBkaXJlY3RvcnkgKG1pZ2h0IGRpZmZlciBmcm9tIHRoZSBwcm9qZWN0IHJvb3QgZm9yIG11bHRpLWNyYXRlIHByb2plY3RzKVxuICAgICAgY29uc3QgcGFuaWNzTGltaXQgPSAxMDsgIC8vIE1heCBudW1iZXIgb2YgcGFuaWNzIHRvIHNob3cgYXQgb25jZVxuXG4gICAgICAvLyBTcGxpdCBvdXRwdXQgYW5kIHJlbW92ZSBBTlNJIGVzY2FwZSBjb2RlcyBpZiBuZWVkZWRcbiAgICAgIGZ1bmN0aW9uIGV4dHJhY3RMaW5lcyhvdXRwdXQsIHJlbW92ZUVzY2FwZSkge1xuICAgICAgICBjb25zdCBsaW5lcyA9IG91dHB1dC5zcGxpdCgvXFxuLyk7XG4gICAgICAgIGlmIChyZW1vdmVFc2NhcGUpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsaW5lc1tpXSA9IGxpbmVzW2ldLnJlcGxhY2UoL1tcXHUwMDFiXFx1MDA5Yl1bWygpIzs/XSooPzpbMC05XXsxLDR9KD86O1swLTldezAsNH0pKik/WzAtOUEtT1JaY2YtbnFyeT0+PF0vZywgJycpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGluZXM7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG1hdGNoRnVuY3Rpb24ob3V0cHV0LCB1c2VKc29uKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VzID0gW107ICAgIC8vIHJlc3VsdGluZyBjb2xsZWN0aW9uIG9mIGhpZ2gtbGV2ZWwgbWVzc2FnZXNcbiAgICAgICAgbGV0IHBhbmljc04gPSAwOyAgICAgICAgLy8gcXVhbnRpdHkgb2YgcGFuaWNzIGluIHRoaXMgb3V0cHV0XG4gICAgICAgIGNvbnN0IGxpbmVzID0gZXh0cmFjdExpbmVzKG91dHB1dCwgIXVzZUpzb24pO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgbGV0IHBhcnNlZFF0eSA9IDA7XG5cbiAgICAgICAgICAvLyBUcnkgcGFyc2UgYSBKU09OIG1lc3NhZ2VcbiAgICAgICAgICBpZiAodXNlSnNvbiAmJiBsaW5lc1tpXS5zdGFydHNXaXRoKCd7JykpIHtcbiAgICAgICAgICAgIGpzb25QYXJzZXIucGFyc2VNZXNzYWdlKGxpbmVzW2ldLCBtZXNzYWdlcyk7XG4gICAgICAgICAgICBwYXJzZWRRdHkgPSAxO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFRyeSBwYXJzZSBhIHN0YW5kYXJkIG91dHB1dCBtZXNzYWdlXG4gICAgICAgICAgaWYgKHBhcnNlZFF0eSA9PT0gMCAmJiAhdXNlSnNvbikge1xuICAgICAgICAgICAgcGFyc2VkUXR5ID0gc3RkUGFyc2VyLnRyeVBhcnNlTWVzc2FnZShsaW5lcywgaSwgbWVzc2FnZXMpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFRyeSBwYXJzZSBhIHBhbmljXG4gICAgICAgICAgaWYgKHBhcnNlZFF0eSA9PT0gMCkge1xuICAgICAgICAgICAgcGFyc2VkUXR5ID0gcGFuaWNQYXJzZXIudHJ5UGFyc2VQYW5pYyhsaW5lcywgaSwgcGFuaWNzTiA8IHBhbmljc0xpbWl0LCBidWlsZFdvcmtEaXIpO1xuICAgICAgICAgICAgaWYgKHBhcnNlZFF0eSA+IDApIHtcbiAgICAgICAgICAgICAgcGFuaWNzTiArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChwYXJzZWRRdHkgPiAxKSB7XG4gICAgICAgICAgICBpICs9IHBhcnNlZFF0eSAtIDE7IC8vIFN1YnRyYWN0IG9uZSBiZWNhdXNlIHRoZSBjdXJyZW50IGxpbmUgaXMgYWxyZWFkeSBjb3VudGVkXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhpZGRlblBhbmljc04gPSBwYW5pY3NOIC0gcGFuaWNzTGltaXQ7XG4gICAgICAgIGlmIChoaWRkZW5QYW5pY3NOID09PSAxKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdPbmUgbW9yZSBwYW5pYyBpcyBoaWRkZW4nLCB7IGRpc21pc3NhYmxlOiB0cnVlIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGhpZGRlblBhbmljc04gPiAxKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGhpZGRlblBhbmljc04gKyAnIG1vcmUgcGFuaWNzIGFyZSBoaWRkZW4nLCB7IGRpc21pc3NhYmxlOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZXNzYWdlcy5maWx0ZXIoZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICByZXR1cm4gZXJyLnByZXByb2Nlc3NNZXNzYWdlKG0sIGJ1aWxkV29ya0Rpcik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBDaGVja3MgaWYgdGhlIGdpdmVuIG9iamVjdCByZXByZXNlbnRzIHRoZSByb290IG9mIHRoZSBwcm9qZWN0IG9yIGZpbGUgc3lzdGVtXG4gICAgICBmdW5jdGlvbiBpc1Jvb3QocGFydHMpIHtcbiAgICAgICAgaWYgKHBhcnRzLmRpciA9PT0gcGFydHMucm9vdCkge1xuICAgICAgICAgIHJldHVybiB0cnVlOyAgICAvLyBUaGUgZmlsZSBzeXN0ZW0gcm9vdFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKS5zb21lKHAgPT4ge1xuICAgICAgICAgIHJldHVybiBwYXJ0cy5kaXIgPT09IHA7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm5zIHRoZSBjbG9zZXN0IGRpcmVjdG9yeSB3aXRoIENhcmdvLnRvbWwgaW4gaXQuXG4gICAgICAvLyBJZiB0aGVyZSdzIG5vIHN1Y2ggZGlyZWN0b3J5LCByZXR1cm5zIHVuZGVmaW5lZC5cbiAgICAgIGZ1bmN0aW9uIGZpbmRDYXJnb1Byb2plY3REaXIocCkge1xuICAgICAgICBjb25zdCBwYXJ0cyA9IHBhdGgucGFyc2UocCk7XG4gICAgICAgIGNvbnN0IHJvb3QgPSBpc1Jvb3QocGFydHMpO1xuICAgICAgICBjb25zdCBjYXJnb1RvbWwgPSBwYXRoLmZvcm1hdCh7XG4gICAgICAgICAgZGlyOiBwYXJ0cy5kaXIsXG4gICAgICAgICAgYmFzZTogJ0NhcmdvLnRvbWwnXG4gICAgICAgIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChmcy5zdGF0U3luYyhjYXJnb1RvbWwpLmlzRmlsZSgpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBkaXI6IHBhcnRzLmRpcixcbiAgICAgICAgICAgICAgcm9vdDogcm9vdFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBpZiAoZS5jb2RlICE9PSAnRU5PRU5UJykgeyAgLy8gTm8gc3VjaCBmaWxlIChDYXJnby50b21sKVxuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJvb3QpIHtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaW5kQ2FyZ29Qcm9qZWN0RGlyKHBhcnRzLmRpcik7XG4gICAgICB9XG5cbiAgICAgIC8vIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGJlZm9yZSBldmVyeSBidWlsZC4gSXQgZmluZHMgdGhlIGNsb3Nlc3RcbiAgICAgIC8vIENhcmdvLnRvbWwgZmlsZSBpbiB0aGUgcGF0aCBhbmQgdXNlcyBpdHMgZGlyZWN0b3J5IGFzIHdvcmtpbmcuXG4gICAgICBmdW5jdGlvbiBwcmVwYXJlQnVpbGQoYnVpbGRDZmcpIHtcbiAgICAgICAgLy8gQ29tbW9uIGJ1aWxkIGNvbW1hbmQgcGFyYW1ldGVyc1xuICAgICAgICBidWlsZENmZy5leGVjID0gYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5jYXJnb1BhdGgnKTtcbiAgICAgICAgYnVpbGRDZmcuZW52ID0ge307XG4gICAgICAgIGNvbnN0IHVzZUpzb24gPSBhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLmpzb25FcnJvckZvcm1hdCcpICYmIGJ1aWxkQ2ZnLnN1cHBvcnRzTWVzc2FnZUZvcm1hdDtcbiAgICAgICAgYnVpbGRDZmcuZnVuY3Rpb25NYXRjaCA9IGZ1bmN0aW9uIChtZXNzYWdlcykgeyByZXR1cm4gbWF0Y2hGdW5jdGlvbihtZXNzYWdlcywgdXNlSnNvbik7IH07XG4gICAgICAgIGlmICh1c2VKc29uKSB7XG4gICAgICAgICAgYnVpbGRDZmcuYXJncy5wdXNoKCctLW1lc3NhZ2UtZm9ybWF0PWpzb24nKTtcbiAgICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSAnd2luMzInKSB7XG4gICAgICAgICAgYnVpbGRDZmcuZW52LlRFUk0gPSAneHRlcm0nO1xuICAgICAgICAgIGJ1aWxkQ2ZnLmVudi5SVVNURkxBR1MgPSAnLS1jb2xvcj1hbHdheXMnO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLmJhY2t0cmFjZVR5cGUnKSAhPT0gJ09mZicpIHtcbiAgICAgICAgICBidWlsZENmZy5lbnYuUlVTVF9CQUNLVFJBQ0UgPSAnMSc7XG4gICAgICAgIH1cbiAgICAgICAgYnVpbGRDZmcuYXJncyA9IGJ1aWxkQ2ZnLmFyZ3MgfHwgW107XG4gICAgICAgIGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28udmVyYm9zZScpICYmIGJ1aWxkQ2ZnLmFyZ3MucHVzaCgnLS12ZXJib3NlJyk7XG5cbiAgICAgICAgLy8gU3Vic3RpdHV0ZSB3b3JraW5nIGRpcmVjdG9yeSBpZiB3ZSBhcmUgaW4gYSBtdWx0aS1jcmF0ZSBlbnZpcm9ubWVudFxuICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5tdWx0aUNyYXRlUHJvamVjdHMnKSkge1xuICAgICAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgICAgICBidWlsZENmZy5jd2QgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgaWYgKGVkaXRvciAmJiBlZGl0b3IuZ2V0UGF0aCgpKSB7XG4gICAgICAgICAgICBjb25zdCB3ZEluZm8gPSBmaW5kQ2FyZ29Qcm9qZWN0RGlyKGVkaXRvci5nZXRQYXRoKCkpO1xuICAgICAgICAgICAgaWYgKHdkSW5mbykge1xuICAgICAgICAgICAgICBpZiAoIXdkSW5mby5yb290KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcCA9IHBhdGgucGFyc2Uod2RJbmZvLmRpcik7XG4gICAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ0J1aWxkaW5nICcgKyBwLmJhc2UgKyAnLi4uJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnVpbGRDZmcuY3dkID0gd2RJbmZvLmRpcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFidWlsZENmZy5jd2QgJiYgYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkubGVuZ3RoID4gMCkge1xuICAgICAgICAgIC8vIEJ1aWxkIGluIHRoZSByb290IG9mIHRoZSBmaXJzdCBwYXRoIGJ5IGRlZmF1bHRcbiAgICAgICAgICBidWlsZENmZy5jd2QgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXTtcbiAgICAgICAgfVxuICAgICAgICBidWlsZFdvcmtEaXIgPSBidWlsZENmZy5jd2Q7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNvbW1hbmRzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBidWlsZCAoZGVidWcpJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpidWlsZC1kZWJ1ZycsXG4gICAgICAgICAgc3VwcG9ydHNNZXNzYWdlRm9ybWF0OiB0cnVlLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ2J1aWxkJyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IGJ1aWxkIChyZWxlYXNlKScsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286YnVpbGQtcmVsZWFzZScsXG4gICAgICAgICAgc3VwcG9ydHNNZXNzYWdlRm9ybWF0OiB0cnVlLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ2J1aWxkJywgJy0tcmVsZWFzZScgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBiZW5jaCcsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286YmVuY2gnLFxuICAgICAgICAgIHN1cHBvcnRzTWVzc2FnZUZvcm1hdDogdHJ1ZSxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdiZW5jaCcgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBjbGVhbicsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286Y2xlYW4nLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ2NsZWFuJyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IGRvYycsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286ZG9jJyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdkb2MnIF0sXG4gICAgICAgICAgcHJlQ29uZmlnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLm9wZW5Eb2NzJykgJiYgdGhpcy5hcmdzLnB1c2goJy0tb3BlbicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogcnVuIChkZWJ1ZyknLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOnJ1bi1kZWJ1ZycsXG4gICAgICAgICAgc3VwcG9ydHNNZXNzYWdlRm9ybWF0OiB0cnVlLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ3J1bicgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBydW4gKHJlbGVhc2UpJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpydW4tcmVsZWFzZScsXG4gICAgICAgICAgc3VwcG9ydHNNZXNzYWdlRm9ybWF0OiB0cnVlLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ3J1bicsICctLXJlbGVhc2UnIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogdGVzdCcsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286cnVuLXRlc3QnLFxuICAgICAgICAgIHN1cHBvcnRzTWVzc2FnZUZvcm1hdDogdHJ1ZSxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICd0ZXN0JyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IHVwZGF0ZScsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286dXBkYXRlJyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICd1cGRhdGUnIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogYnVpbGQgZXhhbXBsZScsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286YnVpbGQtZXhhbXBsZScsXG4gICAgICAgICAgc3VwcG9ydHNNZXNzYWdlRm9ybWF0OiB0cnVlLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ2J1aWxkJywgJy0tZXhhbXBsZScsICd7RklMRV9BQ1RJVkVfTkFNRV9CQVNFfScgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBydW4gZXhhbXBsZScsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286cnVuLWV4YW1wbGUnLFxuICAgICAgICAgIHN1cHBvcnRzTWVzc2FnZUZvcm1hdDogdHJ1ZSxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdydW4nLCAnLS1leGFtcGxlJywgJ3tGSUxFX0FDVElWRV9OQU1FX0JBU0V9JyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IHJ1biBiaW4nLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOnJ1bi1iaW4nLFxuICAgICAgICAgIHN1cHBvcnRzTWVzc2FnZUZvcm1hdDogdHJ1ZSxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdydW4nLCAnLS1iaW4nLCAne0ZJTEVfQUNUSVZFX05BTUVfQkFTRX0nIF1cbiAgICAgICAgfVxuICAgICAgXTtcblxuICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uZXh0Q29tbWFuZHMuY2FyZ29DbGlwcHknKSkge1xuICAgICAgICBjb21tYW5kcy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IENsaXBweScsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286Y2xpcHB5JyxcbiAgICAgICAgICBzdXBwb3J0c01lc3NhZ2VGb3JtYXQ6IHRydWUsXG4gICAgICAgICAgYXJnc0NmZzogWyAnY2xpcHB5JyBdXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5leHRDb21tYW5kcy5jYXJnb0NoZWNrJykpIHtcbiAgICAgICAgY29tbWFuZHMucHVzaCh7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBjaGVjaycsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286Y2hlY2snLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ2NoZWNrJyBdXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBjb21tYW5kcy5mb3JFYWNoKGNtZCA9PiB7XG4gICAgICAgIGNtZC5leGVjID0gYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5jYXJnb1BhdGgnKTtcbiAgICAgICAgY21kLnNoID0gZmFsc2U7XG4gICAgICAgIGNtZC5wcmVCdWlsZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0aGlzLmFyZ3MgPSB0aGlzLmFyZ3NDZmcuc2xpY2UoMCk7ICAgIC8vIENsb25lIGluaXRpYWwgYXJndW1lbnRzXG4gICAgICAgICAgaWYgKHRoaXMucHJlQ29uZmlnKSB7XG4gICAgICAgICAgICB0aGlzLnByZUNvbmZpZygpOyAgICAgICAgICAgICAgICAgICAvLyBBbGxvdyB0aGUgY29tbWFuZCB0byBjb25maWd1cmUgaXRzIGFyZ3VtZW50c1xuICAgICAgICAgIH1cbiAgICAgICAgICBwcmVwYXJlQnVpbGQodGhpcyk7XG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGNvbW1hbmRzO1xuICAgIH1cbiAgfTtcbn1cbiJdfQ==