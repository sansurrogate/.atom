Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

'use babel';

var TargetManager = (function (_EventEmitter) {
  _inherits(TargetManager, _EventEmitter);

  function TargetManager() {
    var _this = this;

    _classCallCheck(this, TargetManager);

    _get(Object.getPrototypeOf(TargetManager.prototype), 'constructor', this).call(this);

    var projectPaths = atom.project.getPaths();

    this.pathTargets = projectPaths.map(function (path) {
      return _this._defaultPathTarget(path);
    });

    atom.project.onDidChangePaths(function (newProjectPaths) {
      var addedPaths = newProjectPaths.filter(function (el) {
        return projectPaths.indexOf(el) === -1;
      });
      var removedPaths = projectPaths.filter(function (el) {
        return newProjectPaths.indexOf(el) === -1;
      });
      addedPaths.forEach(function (path) {
        return _this.pathTargets.push(_this._defaultPathTarget(path));
      });
      _this.pathTargets = _this.pathTargets.filter(function (pt) {
        return -1 === removedPaths.indexOf(pt.path);
      });
      _this.refreshTargets(addedPaths);
      projectPaths = newProjectPaths;
    });

    atom.commands.add('atom-workspace', 'build:refresh-targets', function () {
      return _this.refreshTargets();
    });
    atom.commands.add('atom-workspace', 'build:select-active-target', function () {
      return _this.selectActiveTarget();
    });
  }

  _createClass(TargetManager, [{
    key: 'setBusyRegistry',
    value: function setBusyRegistry(registry) {
      this.busyRegistry = registry;
    }
  }, {
    key: '_defaultPathTarget',
    value: function _defaultPathTarget(path) {
      var CompositeDisposable = require('atom').CompositeDisposable;
      return {
        path: path,
        loading: false,
        targets: [],
        instancedTools: [],
        activeTarget: null,
        tools: [],
        subscriptions: new CompositeDisposable()
      };
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.pathTargets.forEach(function (pathTarget) {
        return pathTarget.tools.map(function (tool) {
          tool.removeAllListeners && tool.removeAllListeners('refresh');
          tool.destructor && tool.destructor();
        });
      });
    }
  }, {
    key: 'setTools',
    value: function setTools(tools) {
      this.tools = tools || [];
    }
  }, {
    key: 'refreshTargets',
    value: function refreshTargets(refreshPaths) {
      var _this2 = this;

      refreshPaths = refreshPaths || atom.project.getPaths();

      this.busyRegistry && this.busyRegistry.begin('build.refresh-targets', 'Refreshing targets for ' + refreshPaths.join(','));
      var pathPromises = refreshPaths.map(function (path) {
        var pathTarget = _this2.pathTargets.find(function (pt) {
          return pt.path === path;
        });
        pathTarget.loading = true;

        pathTarget.instancedTools = pathTarget.instancedTools.map(function (t) {
          return t.removeAllListeners && t.removeAllListeners('refresh');
        }).filter(function () {
          return false;
        }); // Just empty the array

        var settingsPromise = _this2.tools.map(function (Tool) {
          return new Tool(path);
        }).filter(function (tool) {
          return tool.isEligible();
        }).map(function (tool) {
          pathTarget.instancedTools.push(tool);
          require('./google-analytics').sendEvent('build', 'tool eligible', tool.getNiceName());

          tool.on && tool.on('refresh', _this2.refreshTargets.bind(_this2, [path]));
          return Promise.resolve().then(function () {
            return tool.settings();
          })['catch'](function (err) {
            if (err instanceof SyntaxError) {
              atom.notifications.addError('Invalid build file.', {
                detail: 'You have a syntax error in your build file: ' + err.message,
                dismissable: true
              });
            } else {
              var toolName = tool.getNiceName();
              atom.notifications.addError('Ooops. Something went wrong' + (toolName ? ' in the ' + toolName + ' build provider' : '') + '.', {
                detail: err.message,
                stack: err.stack,
                dismissable: true
              });
            }
          });
        });

        var CompositeDisposable = require('atom').CompositeDisposable;
        return Promise.all(settingsPromise).then(function (settings) {
          settings = require('./utils').uniquifySettings([].concat.apply([], settings).filter(Boolean).map(function (setting) {
            return require('./utils').getDefaultSettings(path, setting);
          }));

          if (null === pathTarget.activeTarget || !settings.find(function (s) {
            return s.name === pathTarget.activeTarget;
          })) {
            /* Active target has been removed or not set. Set it to the highest prio target */
            pathTarget.activeTarget = settings[0] ? settings[0].name : undefined;
          }

          // CompositeDisposable cannot be reused, so we must create a new instance on every refresh
          pathTarget.subscriptions.dispose();
          pathTarget.subscriptions = new CompositeDisposable();

          settings.forEach(function (setting, index) {
            if (setting.keymap && !setting.atomCommandName) {
              setting.atomCommandName = 'build:trigger:' + setting.name;
            }

            pathTarget.subscriptions.add(atom.commands.add('atom-workspace', setting.atomCommandName, function (atomCommandName) {
              return _this2.emit('trigger', atomCommandName);
            }));

            if (setting.keymap) {
              require('./google-analytics').sendEvent('keymap', 'registered', setting.keymap);
              var keymapSpec = { 'atom-workspace, atom-text-editor': {} };
              keymapSpec['atom-workspace, atom-text-editor'][setting.keymap] = setting.atomCommandName;
              pathTarget.subscriptions.add(atom.keymaps.add(setting.name, keymapSpec));
            }
          });

          pathTarget.targets = settings;
          pathTarget.loading = false;
        })['catch'](function (err) {
          atom.notifications.addError('Ooops. Something went wrong.', {
            detail: err.message,
            stack: err.stack,
            dismissable: true
          });
        });
      });

      return Promise.all(pathPromises).then(function (entries) {
        _this2.fillTargets(require('./utils').activePath());
        _this2.emit('refresh-complete');
        _this2.busyRegistry && _this2.busyRegistry.end('build.refresh-targets');

        if (entries.length === 0) {
          return;
        }

        if (atom.config.get('build.notificationOnRefresh')) {
          var rows = refreshPaths.map(function (path) {
            var pathTarget = _this2.pathTargets.find(function (pt) {
              return pt.path === path;
            });
            if (!pathTarget) {
              return 'Targets ' + path + ' no longer exists. Is build deactivated?';
            }
            return pathTarget.targets.length + ' targets at: ' + path;
          });
          atom.notifications.addInfo('Build targets parsed.', {
            detail: rows.join('\n')
          });
        }
      })['catch'](function (err) {
        atom.notifications.addError('Ooops. Something went wrong.', {
          detail: err.message,
          stack: err.stack,
          dismissable: true
        });
      });
    }
  }, {
    key: 'fillTargets',
    value: function fillTargets(path) {
      var _this3 = this;

      if (!this.targetsView) {
        return;
      }

      var activeTarget = this.getActiveTarget(path);
      activeTarget && this.targetsView.setActiveTarget(activeTarget.name);

      this.getTargets(path).then(function (targets) {
        return targets.map(function (t) {
          return t.name;
        });
      }).then(function (targetNames) {
        return _this3.targetsView && _this3.targetsView.setItems(targetNames);
      });
    }
  }, {
    key: 'selectActiveTarget',
    value: function selectActiveTarget() {
      var _this4 = this;

      if (atom.config.get('build.refreshOnShowTargetList')) {
        this.refreshTargets();
      }

      var path = require('./utils').activePath();
      if (!path) {
        atom.notifications.addWarning('Unable to build.', {
          detail: 'Open file is not part of any open project in Atom'
        });
        return;
      }

      var TargetsView = require('./targets-view');
      this.targetsView = new TargetsView();

      if (this.isLoading(path)) {
        this.targetsView.setLoading('Loading project build targets…');
      } else {
        this.fillTargets(path);
      }

      this.targetsView.awaitSelection().then(function (newTarget) {
        _this4.setActiveTarget(path, newTarget);

        _this4.targetsView = null;
      })['catch'](function (err) {
        _this4.targetsView.setError(err.message);
        _this4.targetsView = null;
      });
    }
  }, {
    key: 'getTargets',
    value: function getTargets(path) {
      var pathTarget = this.pathTargets.find(function (pt) {
        return pt.path === path;
      });
      if (!pathTarget) {
        return Promise.resolve([]);
      }

      if (pathTarget.targets.length === 0) {
        return this.refreshTargets([pathTarget.path]).then(function () {
          return pathTarget.targets;
        });
      }
      return Promise.resolve(pathTarget.targets);
    }
  }, {
    key: 'getActiveTarget',
    value: function getActiveTarget(path) {
      var pathTarget = this.pathTargets.find(function (pt) {
        return pt.path === path;
      });
      if (!pathTarget) {
        return null;
      }
      return pathTarget.targets.find(function (target) {
        return target.name === pathTarget.activeTarget;
      });
    }
  }, {
    key: 'setActiveTarget',
    value: function setActiveTarget(path, targetName) {
      this.pathTargets.find(function (pt) {
        return pt.path === path;
      }).activeTarget = targetName;
      this.emit('new-active-target', path, this.getActiveTarget(path));
    }
  }, {
    key: 'isLoading',
    value: function isLoading(path) {
      return this.pathTargets.find(function (pt) {
        return pt.path === path;
      }).loading;
    }
  }]);

  return TargetManager;
})(_events2['default']);

exports['default'] = TargetManager;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQvbGliL3RhcmdldC1tYW5hZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O3NCQUV5QixRQUFROzs7O0FBRmpDLFdBQVcsQ0FBQzs7SUFJTixhQUFhO1lBQWIsYUFBYTs7QUFDTixXQURQLGFBQWEsR0FDSDs7OzBCQURWLGFBQWE7O0FBRWYsK0JBRkUsYUFBYSw2Q0FFUDs7QUFFUixRQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDOztBQUUzQyxRQUFJLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJO2FBQUksTUFBSyxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7S0FBQSxDQUFDLENBQUM7O0FBRTNFLFFBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsVUFBQSxlQUFlLEVBQUk7QUFDL0MsVUFBTSxVQUFVLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxVQUFBLEVBQUU7ZUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUFBLENBQUMsQ0FBQztBQUNqRixVQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLFVBQUEsRUFBRTtlQUFJLGVBQWUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQUEsQ0FBQyxDQUFDO0FBQ25GLGdCQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTtlQUFJLE1BQUssV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFLLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO09BQUEsQ0FBQyxDQUFDO0FBQ2pGLFlBQUssV0FBVyxHQUFHLE1BQUssV0FBVyxDQUFDLE1BQU0sQ0FBQyxVQUFBLEVBQUU7ZUFBSSxDQUFDLENBQUMsS0FBSyxZQUFZLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJ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QUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFDLFlBQVk7T0FBQSxDQUFDLENBQUM7S0FDbkY7OztXQUVjLHlCQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7QUFDaEMsVUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBQSxFQUFFO2VBQUksRUFBRSxDQUFDLElBQUksS0FBSyxJQUFJO09BQUEsQ0FBQyxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUM7QUFDeEUsVUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ2xFOzs7V0FFUSxtQkFBQyxJQUFJLEVBQUU7QUFDZCxhQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQUEsRUFBRTtlQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssSUFBSTtPQUFBLENBQUMsQ0FBQyxPQUFPLENBQUM7S0FDOUQ7OztTQXZPRyxhQUFhOzs7cUJBME9KLGFBQWEiLCJmaWxlIjoiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvdGFyZ2V0LW1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMnO1xuXG5jbGFzcyBUYXJnZXRNYW5hZ2VyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIGxldCBwcm9qZWN0UGF0aHMgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKTtcblxuICAgIHRoaXMucGF0aFRhcmdldHMgPSBwcm9qZWN0UGF0aHMubWFwKHBhdGggPT4gdGhpcy5fZGVmYXVsdFBhdGhUYXJnZXQocGF0aCkpO1xuXG4gICAgYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMobmV3UHJvamVjdFBhdGhzID0+IHtcbiAgICAgIGNvbnN0IGFkZGVkUGF0aHMgPSBuZXdQcm9qZWN0UGF0aHMuZmlsdGVyKGVsID0+IHByb2plY3RQYXRocy5pbmRleE9mKGVsKSA9PT0gLTEpO1xuICAgICAgY29uc3QgcmVtb3ZlZFBhdGhzID0gcHJvamVjdFBhdGhzLmZpbHRlcihlbCA9PiBuZXdQcm9qZWN0UGF0aHMuaW5kZXhPZihlbCkgPT09IC0xKTtcbiAgICAgIGFkZGVkUGF0aHMuZm9yRWFjaChwYXRoID0+IHRoaXMucGF0aFRhcmdldHMucHVzaCh0aGlzLl9kZWZhdWx0UGF0aFRhcmdldChwYXRoKSkpO1xuICAgICAgdGhpcy5wYXRoVGFyZ2V0cyA9IHRoaXMucGF0aFRhcmdldHMuZmlsdGVyKHB0ID0+IC0xID09PSByZW1vdmVkUGF0aHMuaW5kZXhPZihwdC5wYXRoKSk7XG4gICAgICB0aGlzLnJlZnJlc2hUYXJnZXRzKGFkZGVkUGF0aHMpO1xuICAgICAgcHJvamVjdFBhdGhzID0gbmV3UHJvamVjdFBhdGhzO1xuICAgIH0pO1xuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgJ2J1aWxkOnJlZnJlc2gtdGFyZ2V0cycsICgpID0+IHRoaXMucmVmcmVzaFRhcmdldHMoKSk7XG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgJ2J1aWxkOnNlbGVjdC1hY3RpdmUtdGFyZ2V0JywgKCkgPT4gdGhpcy5zZWxlY3RBY3RpdmVUYXJnZXQoKSk7XG4gIH1cblxuICBzZXRCdXN5UmVnaXN0cnkocmVnaXN0cnkpIHtcbiAgICB0aGlzLmJ1c3lSZWdpc3RyeSA9IHJlZ2lzdHJ5O1xuICB9XG5cbiAgX2RlZmF1bHRQYXRoVGFyZ2V0KHBhdGgpIHtcbiAgICBjb25zdCBDb21wb3NpdGVEaXNwb3NhYmxlID0gcmVxdWlyZSgnYXRvbScpLkNvbXBvc2l0ZURpc3Bvc2FibGU7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBhdGg6IHBhdGgsXG4gICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgIHRhcmdldHM6IFtdLFxuICAgICAgaW5zdGFuY2VkVG9vbHM6IFtdLFxuICAgICAgYWN0aXZlVGFyZ2V0OiBudWxsLFxuICAgICAgdG9vbHM6IFtdLFxuICAgICAgc3Vic2NyaXB0aW9uczogbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIH07XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMucGF0aFRhcmdldHMuZm9yRWFjaChwYXRoVGFyZ2V0ID0+IHBhdGhUYXJnZXQudG9vbHMubWFwKHRvb2wgPT4ge1xuICAgICAgdG9vbC5yZW1vdmVBbGxMaXN0ZW5lcnMgJiYgdG9vbC5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlZnJlc2gnKTtcbiAgICAgIHRvb2wuZGVzdHJ1Y3RvciAmJiB0b29sLmRlc3RydWN0b3IoKTtcbiAgICB9KSk7XG4gIH1cblxuICBzZXRUb29scyh0b29scykge1xuICAgIHRoaXMudG9vbHMgPSB0b29scyB8fCBbXTtcbiAgfVxuXG4gIHJlZnJlc2hUYXJnZXRzKHJlZnJlc2hQYXRocykge1xuICAgIHJlZnJlc2hQYXRocyA9IHJlZnJlc2hQYXRocyB8fCBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKTtcblxuICAgIHRoaXMuYnVzeVJlZ2lzdHJ5ICYmIHRoaXMuYnVzeVJlZ2lzdHJ5LmJlZ2luKCdidWlsZC5yZWZyZXNoLXRhcmdldHMnLCBgUmVmcmVzaGluZyB0YXJnZXRzIGZvciAke3JlZnJlc2hQYXRocy5qb2luKCcsJyl9YCk7XG4gICAgY29uc3QgcGF0aFByb21pc2VzID0gcmVmcmVzaFBhdGhzLm1hcCgocGF0aCkgPT4ge1xuICAgICAgY29uc3QgcGF0aFRhcmdldCA9IHRoaXMucGF0aFRhcmdldHMuZmluZChwdCA9PiBwdC5wYXRoID09PSBwYXRoKTtcbiAgICAgIHBhdGhUYXJnZXQubG9hZGluZyA9IHRydWU7XG5cbiAgICAgIHBhdGhUYXJnZXQuaW5zdGFuY2VkVG9vbHMgPSBwYXRoVGFyZ2V0Lmluc3RhbmNlZFRvb2xzXG4gICAgICAgIC5tYXAodCA9PiB0LnJlbW92ZUFsbExpc3RlbmVycyAmJiB0LnJlbW92ZUFsbExpc3RlbmVycygncmVmcmVzaCcpKVxuICAgICAgICAuZmlsdGVyKCgpID0+IGZhbHNlKTsgLy8gSnVzdCBlbXB0eSB0aGUgYXJyYXlcblxuICAgICAgY29uc3Qgc2V0dGluZ3NQcm9taXNlID0gdGhpcy50b29sc1xuICAgICAgICAubWFwKFRvb2wgPT4gbmV3IFRvb2wocGF0aCkpXG4gICAgICAgIC5maWx0ZXIodG9vbCA9PiB0b29sLmlzRWxpZ2libGUoKSlcbiAgICAgICAgLm1hcCh0b29sID0+IHtcbiAgICAgICAgICBwYXRoVGFyZ2V0Lmluc3RhbmNlZFRvb2xzLnB1c2godG9vbCk7XG4gICAgICAgICAgcmVxdWlyZSgnLi9nb29nbGUtYW5hbHl0aWNzJykuc2VuZEV2ZW50KCdidWlsZCcsICd0b29sIGVsaWdpYmxlJywgdG9vbC5nZXROaWNlTmFtZSgpKTtcblxuICAgICAgICAgIHRvb2wub24gJiYgdG9vbC5vbigncmVmcmVzaCcsIHRoaXMucmVmcmVzaFRhcmdldHMuYmluZCh0aGlzLCBbIHBhdGggXSkpO1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gdG9vbC5zZXR0aW5ncygpKVxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBTeW50YXhFcnJvcikge1xuICAgICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignSW52YWxpZCBidWlsZCBmaWxlLicsIHtcbiAgICAgICAgICAgICAgICAgIGRldGFpbDogJ1lvdSBoYXZlIGEgc3ludGF4IGVycm9yIGluIHlvdXIgYnVpbGQgZmlsZTogJyArIGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0b29sTmFtZSA9IHRvb2wuZ2V0TmljZU5hbWUoKTtcbiAgICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ09vb3BzLiBTb21ldGhpbmcgd2VudCB3cm9uZycgKyAodG9vbE5hbWUgPyAnIGluIHRoZSAnICsgdG9vbE5hbWUgKyAnIGJ1aWxkIHByb3ZpZGVyJyA6ICcnKSArICcuJywge1xuICAgICAgICAgICAgICAgICAgZGV0YWlsOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgIHN0YWNrOiBlcnIuc3RhY2ssXG4gICAgICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IENvbXBvc2l0ZURpc3Bvc2FibGUgPSByZXF1aXJlKCdhdG9tJykuQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgICAgIHJldHVybiBQcm9taXNlLmFsbChzZXR0aW5nc1Byb21pc2UpLnRoZW4oKHNldHRpbmdzKSA9PiB7XG4gICAgICAgIHNldHRpbmdzID0gcmVxdWlyZSgnLi91dGlscycpLnVuaXF1aWZ5U2V0dGluZ3MoW10uY29uY2F0LmFwcGx5KFtdLCBzZXR0aW5ncylcbiAgICAgICAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgICAgICAgLm1hcChzZXR0aW5nID0+IHJlcXVpcmUoJy4vdXRpbHMnKS5nZXREZWZhdWx0U2V0dGluZ3MocGF0aCwgc2V0dGluZykpKTtcblxuICAgICAgICBpZiAobnVsbCA9PT0gcGF0aFRhcmdldC5hY3RpdmVUYXJnZXQgfHwgIXNldHRpbmdzLmZpbmQocyA9PiBzLm5hbWUgPT09IHBhdGhUYXJnZXQuYWN0aXZlVGFyZ2V0KSkge1xuICAgICAgICAgIC8qIEFjdGl2ZSB0YXJnZXQgaGFzIGJlZW4gcmVtb3ZlZCBvciBub3Qgc2V0LiBTZXQgaXQgdG8gdGhlIGhpZ2hlc3QgcHJpbyB0YXJnZXQgKi9cbiAgICAgICAgICBwYXRoVGFyZ2V0LmFjdGl2ZVRhcmdldCA9IHNldHRpbmdzWzBdID8gc2V0dGluZ3NbMF0ubmFtZSA6IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbXBvc2l0ZURpc3Bvc2FibGUgY2Fubm90IGJlIHJldXNlZCwgc28gd2UgbXVzdCBjcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb24gZXZlcnkgcmVmcmVzaFxuICAgICAgICBwYXRoVGFyZ2V0LnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgICBwYXRoVGFyZ2V0LnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgICAgIHNldHRpbmdzLmZvckVhY2goKHNldHRpbmcsIGluZGV4KSA9PiB7XG4gICAgICAgICAgaWYgKHNldHRpbmcua2V5bWFwICYmICFzZXR0aW5nLmF0b21Db21tYW5kTmFtZSkge1xuICAgICAgICAgICAgc2V0dGluZy5hdG9tQ29tbWFuZE5hbWUgPSBgYnVpbGQ6dHJpZ2dlcjoke3NldHRpbmcubmFtZX1gO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHBhdGhUYXJnZXQuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgc2V0dGluZy5hdG9tQ29tbWFuZE5hbWUsIGF0b21Db21tYW5kTmFtZSA9PiB0aGlzLmVtaXQoJ3RyaWdnZXInLCBhdG9tQ29tbWFuZE5hbWUpKSk7XG5cbiAgICAgICAgICBpZiAoc2V0dGluZy5rZXltYXApIHtcbiAgICAgICAgICAgIHJlcXVpcmUoJy4vZ29vZ2xlLWFuYWx5dGljcycpLnNlbmRFdmVudCgna2V5bWFwJywgJ3JlZ2lzdGVyZWQnLCBzZXR0aW5nLmtleW1hcCk7XG4gICAgICAgICAgICBjb25zdCBrZXltYXBTcGVjID0geyAnYXRvbS13b3Jrc3BhY2UsIGF0b20tdGV4dC1lZGl0b3InOiB7fSB9O1xuICAgICAgICAgICAga2V5bWFwU3BlY1snYXRvbS13b3Jrc3BhY2UsIGF0b20tdGV4dC1lZGl0b3InXVtzZXR0aW5nLmtleW1hcF0gPSBzZXR0aW5nLmF0b21Db21tYW5kTmFtZTtcbiAgICAgICAgICAgIHBhdGhUYXJnZXQuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5rZXltYXBzLmFkZChzZXR0aW5nLm5hbWUsIGtleW1hcFNwZWMpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHBhdGhUYXJnZXQudGFyZ2V0cyA9IHNldHRpbmdzO1xuICAgICAgICBwYXRoVGFyZ2V0LmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignT29vcHMuIFNvbWV0aGluZyB3ZW50IHdyb25nLicsIHtcbiAgICAgICAgICBkZXRhaWw6IGVyci5tZXNzYWdlLFxuICAgICAgICAgIHN0YWNrOiBlcnIuc3RhY2ssXG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBQcm9taXNlLmFsbChwYXRoUHJvbWlzZXMpLnRoZW4oZW50cmllcyA9PiB7XG4gICAgICB0aGlzLmZpbGxUYXJnZXRzKHJlcXVpcmUoJy4vdXRpbHMnKS5hY3RpdmVQYXRoKCkpO1xuICAgICAgdGhpcy5lbWl0KCdyZWZyZXNoLWNvbXBsZXRlJyk7XG4gICAgICB0aGlzLmJ1c3lSZWdpc3RyeSAmJiB0aGlzLmJ1c3lSZWdpc3RyeS5lbmQoJ2J1aWxkLnJlZnJlc2gtdGFyZ2V0cycpO1xuXG4gICAgICBpZiAoZW50cmllcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC5ub3RpZmljYXRpb25PblJlZnJlc2gnKSkge1xuICAgICAgICBjb25zdCByb3dzID0gcmVmcmVzaFBhdGhzLm1hcChwYXRoID0+IHtcbiAgICAgICAgICBjb25zdCBwYXRoVGFyZ2V0ID0gdGhpcy5wYXRoVGFyZ2V0cy5maW5kKHB0ID0+IHB0LnBhdGggPT09IHBhdGgpO1xuICAgICAgICAgIGlmICghcGF0aFRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIGBUYXJnZXRzICR7cGF0aH0gbm8gbG9uZ2VyIGV4aXN0cy4gSXMgYnVpbGQgZGVhY3RpdmF0ZWQ/YDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGAke3BhdGhUYXJnZXQudGFyZ2V0cy5sZW5ndGh9IHRhcmdldHMgYXQ6ICR7cGF0aH1gO1xuICAgICAgICB9KTtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ0J1aWxkIHRhcmdldHMgcGFyc2VkLicsIHtcbiAgICAgICAgICBkZXRhaWw6IHJvd3Muam9pbignXFxuJylcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignT29vcHMuIFNvbWV0aGluZyB3ZW50IHdyb25nLicsIHtcbiAgICAgICAgZGV0YWlsOiBlcnIubWVzc2FnZSxcbiAgICAgICAgc3RhY2s6IGVyci5zdGFjayxcbiAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZmlsbFRhcmdldHMocGF0aCkge1xuICAgIGlmICghdGhpcy50YXJnZXRzVmlldykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGFjdGl2ZVRhcmdldCA9IHRoaXMuZ2V0QWN0aXZlVGFyZ2V0KHBhdGgpO1xuICAgIGFjdGl2ZVRhcmdldCAmJiB0aGlzLnRhcmdldHNWaWV3LnNldEFjdGl2ZVRhcmdldChhY3RpdmVUYXJnZXQubmFtZSk7XG5cbiAgICB0aGlzLmdldFRhcmdldHMocGF0aClcbiAgICAgIC50aGVuKHRhcmdldHMgPT4gdGFyZ2V0cy5tYXAodCA9PiB0Lm5hbWUpKVxuICAgICAgLnRoZW4odGFyZ2V0TmFtZXMgPT4gdGhpcy50YXJnZXRzVmlldyAmJiB0aGlzLnRhcmdldHNWaWV3LnNldEl0ZW1zKHRhcmdldE5hbWVzKSk7XG4gIH1cblxuICBzZWxlY3RBY3RpdmVUYXJnZXQoKSB7XG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQucmVmcmVzaE9uU2hvd1RhcmdldExpc3QnKSkge1xuICAgICAgdGhpcy5yZWZyZXNoVGFyZ2V0cygpO1xuICAgIH1cblxuICAgIGNvbnN0IHBhdGggPSByZXF1aXJlKCcuL3V0aWxzJykuYWN0aXZlUGF0aCgpO1xuICAgIGlmICghcGF0aCkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoJ1VuYWJsZSB0byBidWlsZC4nLCB7XG4gICAgICAgIGRldGFpbDogJ09wZW4gZmlsZSBpcyBub3QgcGFydCBvZiBhbnkgb3BlbiBwcm9qZWN0IGluIEF0b20nXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBUYXJnZXRzVmlldyA9IHJlcXVpcmUoJy4vdGFyZ2V0cy12aWV3Jyk7XG4gICAgdGhpcy50YXJnZXRzVmlldyA9IG5ldyBUYXJnZXRzVmlldygpO1xuXG4gICAgaWYgKHRoaXMuaXNMb2FkaW5nKHBhdGgpKSB7XG4gICAgICB0aGlzLnRhcmdldHNWaWV3LnNldExvYWRpbmcoJ0xvYWRpbmcgcHJvamVjdCBidWlsZCB0YXJnZXRzXFx1MjAyNicpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZpbGxUYXJnZXRzKHBhdGgpO1xuICAgIH1cblxuICAgIHRoaXMudGFyZ2V0c1ZpZXcuYXdhaXRTZWxlY3Rpb24oKS50aGVuKG5ld1RhcmdldCA9PiB7XG4gICAgICB0aGlzLnNldEFjdGl2ZVRhcmdldChwYXRoLCBuZXdUYXJnZXQpO1xuXG4gICAgICB0aGlzLnRhcmdldHNWaWV3ID0gbnVsbDtcbiAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICB0aGlzLnRhcmdldHNWaWV3LnNldEVycm9yKGVyci5tZXNzYWdlKTtcbiAgICAgIHRoaXMudGFyZ2V0c1ZpZXcgPSBudWxsO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0VGFyZ2V0cyhwYXRoKSB7XG4gICAgY29uc3QgcGF0aFRhcmdldCA9IHRoaXMucGF0aFRhcmdldHMuZmluZChwdCA9PiBwdC5wYXRoID09PSBwYXRoKTtcbiAgICBpZiAoIXBhdGhUYXJnZXQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuICAgIH1cblxuICAgIGlmIChwYXRoVGFyZ2V0LnRhcmdldHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZWZyZXNoVGFyZ2V0cyhbIHBhdGhUYXJnZXQucGF0aCBdKS50aGVuKCgpID0+IHBhdGhUYXJnZXQudGFyZ2V0cyk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocGF0aFRhcmdldC50YXJnZXRzKTtcbiAgfVxuXG4gIGdldEFjdGl2ZVRhcmdldChwYXRoKSB7XG4gICAgY29uc3QgcGF0aFRhcmdldCA9IHRoaXMucGF0aFRhcmdldHMuZmluZChwdCA9PiBwdC5wYXRoID09PSBwYXRoKTtcbiAgICBpZiAoIXBhdGhUYXJnZXQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aFRhcmdldC50YXJnZXRzLmZpbmQodGFyZ2V0ID0+IHRhcmdldC5uYW1lID09PSBwYXRoVGFyZ2V0LmFjdGl2ZVRhcmdldCk7XG4gIH1cblxuICBzZXRBY3RpdmVUYXJnZXQocGF0aCwgdGFyZ2V0TmFtZSkge1xuICAgIHRoaXMucGF0aFRhcmdldHMuZmluZChwdCA9PiBwdC5wYXRoID09PSBwYXRoKS5hY3RpdmVUYXJnZXQgPSB0YXJnZXROYW1lO1xuICAgIHRoaXMuZW1pdCgnbmV3LWFjdGl2ZS10YXJnZXQnLCBwYXRoLCB0aGlzLmdldEFjdGl2ZVRhcmdldChwYXRoKSk7XG4gIH1cblxuICBpc0xvYWRpbmcocGF0aCkge1xuICAgIHJldHVybiB0aGlzLnBhdGhUYXJnZXRzLmZpbmQocHQgPT4gcHQucGF0aCA9PT0gcGF0aCkubG9hZGluZztcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUYXJnZXRNYW5hZ2VyO1xuIl19
//# sourceURL=/home/takaaki/.atom/packages/build/lib/target-manager.js
