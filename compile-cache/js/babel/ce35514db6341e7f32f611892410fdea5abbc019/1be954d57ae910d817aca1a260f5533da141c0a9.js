function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atomBuildSpecHelpers = require('atom-build-spec-helpers');

var _atomBuildSpecHelpers2 = _interopRequireDefault(_atomBuildSpecHelpers);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

'use babel';

describe('Target', function () {
  var originalHomedirFn = _os2['default'].homedir;
  var directory = null;
  var workspaceElement = null;

  _temp2['default'].track();

  beforeEach(function () {
    atom.config.set('build.buildOnSave', false);
    atom.config.set('build.panelVisibility', 'Toggle');
    atom.config.set('build.saveOnBuild', false);
    atom.config.set('build.notificationOnRefresh', true);
    atom.config.set('build.refreshOnShowTargetList', true);

    jasmine.unspy(window, 'setTimeout');
    jasmine.unspy(window, 'clearTimeout');

    workspaceElement = atom.views.getView(atom.workspace);
    workspaceElement.setAttribute('style', 'width:9999px');
    jasmine.attachToDOM(workspaceElement);

    waitsForPromise(function () {
      return _atomBuildSpecHelpers2['default'].vouch(_temp2['default'].mkdir, { prefix: 'atom-build-spec-' }).then(function (dir) {
        return _atomBuildSpecHelpers2['default'].vouch(_fsExtra2['default'].realpath, dir);
      }).then(function (dir) {
        directory = dir + '/';
        atom.project.setPaths([directory]);
        return _atomBuildSpecHelpers2['default'].vouch(_temp2['default'].mkdir, 'atom-build-spec-home');
      }).then(function (dir) {
        return _atomBuildSpecHelpers2['default'].vouch(_fsExtra2['default'].realpath, dir);
      }).then(function (dir) {
        _os2['default'].homedir = function () {
          return dir;
        };
        return atom.packages.activatePackage('build');
      });
    });
  });

  afterEach(function () {
    _os2['default'].homedir = originalHomedirFn;
    _fsExtra2['default'].removeSync(directory);
  });

  describe('when multiple targets exists', function () {
    it('should list those targets in a SelectListView (from .atom-build.json)', function () {
      waitsForPromise(function () {
        var file = __dirname + '/fixture/.atom-build.targets.json';
        return _atomBuildSpecHelpers2['default'].vouch(_fsExtra2['default'].copy, file, directory + '/.atom-build.json');
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:select-active-target');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.select-list li.build-target');
      });

      runs(function () {
        var targets = [].concat(_toConsumableArray(workspaceElement.querySelectorAll('.select-list li.build-target'))).map(function (el) {
          return el.textContent;
        });
        expect(targets).toEqual(['Custom: The default build', 'Custom: Some customized build']);
      });
    });

    it('should mark the first target as active', function () {
      waitsForPromise(function () {
        var file = __dirname + '/fixture/.atom-build.targets.json';
        return _atomBuildSpecHelpers2['default'].vouch(_fsExtra2['default'].copy, file, directory + '/.atom-build.json');
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:select-active-target');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.select-list li.build-target');
      });

      runs(function () {
        var el = workspaceElement.querySelector('.select-list li.build-target'); // querySelector selects the first element
        expect(el).toHaveClass('selected');
        expect(el).toHaveClass('active');
      });
    });

    it('should run the selected build', function () {
      waitsForPromise(function () {
        var file = __dirname + '/fixture/.atom-build.targets.json';
        return _atomBuildSpecHelpers2['default'].vouch(_fsExtra2['default'].copy, file, directory + '/.atom-build.json');
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:select-active-target');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.select-list li.build-target');
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement.querySelector('.select-list'), 'core:confirm');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(workspaceElement.querySelector('.terminal').terminal.getContent()).toMatch(/default/);
      });
    });

    it('should run the default target if no selection has been made', function () {
      waitsForPromise(function () {
        var file = __dirname + '/fixture/.atom-build.targets.json';
        return _atomBuildSpecHelpers2['default'].vouch(_fsExtra2['default'].copy, file, directory + '/.atom-build.json');
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(workspaceElement.querySelector('.terminal').terminal.getContent()).toMatch(/default/);
      });
    });

    it('run the selected target if selection has changed, and subsequent build should run that target', function () {
      waitsForPromise(function () {
        var file = __dirname + '/fixture/.atom-build.targets.json';
        return _atomBuildSpecHelpers2['default'].vouch(_fsExtra2['default'].copy, file, directory + '/.atom-build.json');
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:select-active-target');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.select-list li.build-target');
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement.querySelector('.select-list'), 'core:move-down');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.select-list li.selected').textContent === 'Custom: Some customized build';
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement.querySelector('.select-list'), 'core:confirm');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(workspaceElement.querySelector('.terminal').terminal.getContent()).toMatch(/customized/);
        atom.commands.dispatch(workspaceElement.querySelector('.build'), 'build:stop');
      });

      waitsFor(function () {
        return !workspaceElement.querySelector('.build');
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(workspaceElement.querySelector('.terminal').terminal.getContent()).toMatch(/customized/);
      });
    });

    it('should show a warning if current file is not part of an open Atom project', function () {
      waitsForPromise(function () {
        return atom.workspace.open(_path2['default'].join('..', 'randomFile'));
      });
      waitsForPromise(function () {
        return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
      });
      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:select-active-target');
      });
      waitsFor(function () {
        return atom.notifications.getNotifications().find(function (n) {
          return n.message === 'Unable to build.';
        });
      });
      runs(function () {
        var not = atom.notifications.getNotifications().find(function (n) {
          return n.message === 'Unable to build.';
        });
        expect(not.type).toBe('warning');
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQvc3BlYy9idWlsZC10YXJnZXRzLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozt1QkFFZSxVQUFVOzs7O29CQUNSLE1BQU07Ozs7b0JBQ04sTUFBTTs7OztvQ0FDQyx5QkFBeUI7Ozs7a0JBQ2xDLElBQUk7Ozs7QUFObkIsV0FBVyxDQUFDOztBQVFaLFFBQVEsQ0FBQyxRQUFRLEVBQUUsWUFBTTtBQUN2QixNQUFNLGlCQUFpQixHQUFHLGdCQUFHLE9BQU8sQ0FBQztBQUNyQyxNQUFJLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDckIsTUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7O0FBRTVCLG9CQUFLLEtBQUssRUFBRSxDQUFDOztBQUViLFlBQVUsQ0FBQyxZQUFNO0FBQ2YsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDbkQsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDckQsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsK0JBQStCLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXZELFdBQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3BDLFdBQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDOztBQUV0QyxvQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdEQsb0JBQWdCLENBQUMsWUFB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QU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsNEJBQTRCLENBQUM7T0FBQSxDQUFDLENBQUM7QUFDbkYsY0FBUSxDQUFDO2VBQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUM7aUJBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxrQkFBa0I7U0FBQSxDQUFDO09BQUEsQ0FBQyxDQUFDO0FBQ2xHLFVBQUksQ0FBQyxZQUFNO0FBQ1QsWUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUM7aUJBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxrQkFBa0I7U0FBQSxDQUFDLENBQUM7QUFDOUYsY0FBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7T0FDbEMsQ0FBQyxDQUFDO0tBQ0osQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDO0NBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6Ii9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQvc3BlYy9idWlsZC10YXJnZXRzLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCB0ZW1wIGZyb20gJ3RlbXAnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgc3BlY0hlbHBlcnMgZnJvbSAnYXRvbS1idWlsZC1zcGVjLWhlbHBlcnMnO1xuaW1wb3J0IG9zIGZyb20gJ29zJztcblxuZGVzY3JpYmUoJ1RhcmdldCcsICgpID0+IHtcbiAgY29uc3Qgb3JpZ2luYWxIb21lZGlyRm4gPSBvcy5ob21lZGlyO1xuICBsZXQgZGlyZWN0b3J5ID0gbnVsbDtcbiAgbGV0IHdvcmtzcGFjZUVsZW1lbnQgPSBudWxsO1xuXG4gIHRlbXAudHJhY2soKTtcblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLmJ1aWxkT25TYXZlJywgZmFsc2UpO1xuICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQucGFuZWxWaXNpYmlsaXR5JywgJ1RvZ2dsZScpO1xuICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQuc2F2ZU9uQnVpbGQnLCBmYWxzZSk7XG4gICAgYXRvbS5jb25maWcuc2V0KCdidWlsZC5ub3RpZmljYXRpb25PblJlZnJlc2gnLCB0cnVlKTtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLnJlZnJlc2hPblNob3dUYXJnZXRMaXN0JywgdHJ1ZSk7XG5cbiAgICBqYXNtaW5lLnVuc3B5KHdpbmRvdywgJ3NldFRpbWVvdXQnKTtcbiAgICBqYXNtaW5lLnVuc3B5KHdpbmRvdywgJ2NsZWFyVGltZW91dCcpO1xuXG4gICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSk7XG4gICAgd29ya3NwYWNlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ3dpZHRoOjk5OTlweCcpO1xuICAgIGphc21pbmUuYXR0YWNoVG9ET00od29ya3NwYWNlRWxlbWVudCk7XG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgcmV0dXJuIHNwZWNIZWxwZXJzLnZvdWNoKHRlbXAubWtkaXIsIHsgcHJlZml4OiAnYXRvbS1idWlsZC1zcGVjLScgfSkudGhlbigoZGlyKSA9PiB7XG4gICAgICAgIHJldHVybiBzcGVjSGVscGVycy52b3VjaChmcy5yZWFscGF0aCwgZGlyKTtcbiAgICAgIH0pLnRoZW4oKGRpcikgPT4ge1xuICAgICAgICBkaXJlY3RvcnkgPSBkaXIgKyAnLyc7XG4gICAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbIGRpcmVjdG9yeSBdKTtcbiAgICAgICAgcmV0dXJuIHNwZWNIZWxwZXJzLnZvdWNoKHRlbXAubWtkaXIsICdhdG9tLWJ1aWxkLXNwZWMtaG9tZScpO1xuICAgICAgfSkudGhlbiggKGRpcikgPT4ge1xuICAgICAgICByZXR1cm4gc3BlY0hlbHBlcnMudm91Y2goZnMucmVhbHBhdGgsIGRpcik7XG4gICAgICB9KS50aGVuKCAoZGlyKSA9PiB7XG4gICAgICAgIG9zLmhvbWVkaXIgPSAoKSA9PiBkaXI7XG4gICAgICAgIHJldHVybiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnYnVpbGQnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBhZnRlckVhY2goKCkgPT4ge1xuICAgIG9zLmhvbWVkaXIgPSBvcmlnaW5hbEhvbWVkaXJGbjtcbiAgICBmcy5yZW1vdmVTeW5jKGRpcmVjdG9yeSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd3aGVuIG11bHRpcGxlIHRhcmdldHMgZXhpc3RzJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgbGlzdCB0aG9zZSB0YXJnZXRzIGluIGEgU2VsZWN0TGlzdFZpZXcgKGZyb20gLmF0b20tYnVpbGQuanNvbiknLCAoKSA9PiB7XG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICBjb25zdCBmaWxlID0gX19kaXJuYW1lICsgJy9maXh0dXJlLy5hdG9tLWJ1aWxkLnRhcmdldHMuanNvbic7XG4gICAgICAgIHJldHVybiBzcGVjSGVscGVycy52b3VjaChmcy5jb3B5LCBmaWxlLCBkaXJlY3RvcnkgKyAnLy5hdG9tLWJ1aWxkLmpzb24nKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6c2VsZWN0LWFjdGl2ZS10YXJnZXQnKTtcbiAgICAgIH0pO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWxlY3QtbGlzdCBsaS5idWlsZC10YXJnZXQnKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0cyA9IFsgLi4ud29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc2VsZWN0LWxpc3QgbGkuYnVpbGQtdGFyZ2V0JykgXS5tYXAoZWwgPT4gZWwudGV4dENvbnRlbnQpO1xuICAgICAgICBleHBlY3QodGFyZ2V0cykudG9FcXVhbChbICdDdXN0b206IFRoZSBkZWZhdWx0IGJ1aWxkJywgJ0N1c3RvbTogU29tZSBjdXN0b21pemVkIGJ1aWxkJyBdKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBtYXJrIHRoZSBmaXJzdCB0YXJnZXQgYXMgYWN0aXZlJywgKCkgPT4ge1xuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IF9fZGlybmFtZSArICcvZml4dHVyZS8uYXRvbS1idWlsZC50YXJnZXRzLmpzb24nO1xuICAgICAgICByZXR1cm4gc3BlY0hlbHBlcnMudm91Y2goZnMuY29weSwgZmlsZSwgZGlyZWN0b3J5ICsgJy8uYXRvbS1idWlsZC5qc29uJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOnNlbGVjdC1hY3RpdmUtdGFyZ2V0Jyk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0LWxpc3QgbGkuYnVpbGQtdGFyZ2V0Jyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGNvbnN0IGVsID0gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0LWxpc3QgbGkuYnVpbGQtdGFyZ2V0Jyk7IC8vIHF1ZXJ5U2VsZWN0b3Igc2VsZWN0cyB0aGUgZmlyc3QgZWxlbWVudFxuICAgICAgICBleHBlY3QoZWwpLnRvSGF2ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgICBleHBlY3QoZWwpLnRvSGF2ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBydW4gdGhlIHNlbGVjdGVkIGJ1aWxkJywgKCkgPT4ge1xuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IF9fZGlybmFtZSArICcvZml4dHVyZS8uYXRvbS1idWlsZC50YXJnZXRzLmpzb24nO1xuICAgICAgICByZXR1cm4gc3BlY0hlbHBlcnMudm91Y2goZnMuY29weSwgZmlsZSwgZGlyZWN0b3J5ICsgJy8uYXRvbS1idWlsZC5qc29uJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOnNlbGVjdC1hY3RpdmUtdGFyZ2V0Jyk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0LWxpc3QgbGkuYnVpbGQtdGFyZ2V0Jyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0LWxpc3QnKSwgJ2NvcmU6Y29uZmlybScpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpICYmXG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdzdWNjZXNzJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy50ZXJtaW5hbCcpLnRlcm1pbmFsLmdldENvbnRlbnQoKSkudG9NYXRjaCgvZGVmYXVsdC8pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHJ1biB0aGUgZGVmYXVsdCB0YXJnZXQgaWYgbm8gc2VsZWN0aW9uIGhhcyBiZWVuIG1hZGUnLCAoKSA9PiB7XG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICBjb25zdCBmaWxlID0gX19kaXJuYW1lICsgJy9maXh0dXJlLy5hdG9tLWJ1aWxkLnRhcmdldHMuanNvbic7XG4gICAgICAgIHJldHVybiBzcGVjSGVscGVycy52b3VjaChmcy5jb3B5LCBmaWxlLCBkaXJlY3RvcnkgKyAnLy5hdG9tLWJ1aWxkLmpzb24nKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpICYmXG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdzdWNjZXNzJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy50ZXJtaW5hbCcpLnRlcm1pbmFsLmdldENvbnRlbnQoKSkudG9NYXRjaCgvZGVmYXVsdC8pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgncnVuIHRoZSBzZWxlY3RlZCB0YXJnZXQgaWYgc2VsZWN0aW9uIGhhcyBjaGFuZ2VkLCBhbmQgc3Vic2VxdWVudCBidWlsZCBzaG91bGQgcnVuIHRoYXQgdGFyZ2V0JywgKCkgPT4ge1xuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IF9fZGlybmFtZSArICcvZml4dHVyZS8uYXRvbS1idWlsZC50YXJnZXRzLmpzb24nO1xuICAgICAgICByZXR1cm4gc3BlY0hlbHBlcnMudm91Y2goZnMuY29weSwgZmlsZSwgZGlyZWN0b3J5ICsgJy8uYXRvbS1idWlsZC5qc29uJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOnNlbGVjdC1hY3RpdmUtdGFyZ2V0Jyk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0LWxpc3QgbGkuYnVpbGQtdGFyZ2V0Jyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0LWxpc3QnKSwgJ2NvcmU6bW92ZS1kb3duJyk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0LWxpc3QgbGkuc2VsZWN0ZWQnKS50ZXh0Q29udGVudCA9PT0gJ0N1c3RvbTogU29tZSBjdXN0b21pemVkIGJ1aWxkJztcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWxlY3QtbGlzdCcpLCAnY29yZTpjb25maXJtJyk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykgJiZcbiAgICAgICAgICB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKS5jbGFzc0xpc3QuY29udGFpbnMoJ3N1Y2Nlc3MnKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLnRlcm1pbmFsJykudGVybWluYWwuZ2V0Q29udGVudCgpKS50b01hdGNoKC9jdXN0b21pemVkLyk7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQnKSwgJ2J1aWxkOnN0b3AnKTtcbiAgICAgIH0pO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiAhd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQnKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpICYmXG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdzdWNjZXNzJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy50ZXJtaW5hbCcpLnRlcm1pbmFsLmdldENvbnRlbnQoKSkudG9NYXRjaCgvY3VzdG9taXplZC8pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHNob3cgYSB3YXJuaW5nIGlmIGN1cnJlbnQgZmlsZSBpcyBub3QgcGFydCBvZiBhbiBvcGVuIEF0b20gcHJvamVjdCcsICgpID0+IHtcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGguam9pbignLi4nLCAncmFuZG9tRmlsZScpKSk7XG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gc3BlY0hlbHBlcnMucmVmcmVzaEF3YWl0VGFyZ2V0cygpKTtcbiAgICAgIHJ1bnMoKCkgPT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6c2VsZWN0LWFjdGl2ZS10YXJnZXQnKSk7XG4gICAgICB3YWl0c0ZvcigoKSA9PiBhdG9tLm5vdGlmaWNhdGlvbnMuZ2V0Tm90aWZpY2F0aW9ucygpLmZpbmQobiA9PiBuLm1lc3NhZ2UgPT09ICdVbmFibGUgdG8gYnVpbGQuJykpO1xuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vdCA9IGF0b20ubm90aWZpY2F0aW9ucy5nZXROb3RpZmljYXRpb25zKCkuZmluZChuID0+IG4ubWVzc2FnZSA9PT0gJ1VuYWJsZSB0byBidWlsZC4nKTtcbiAgICAgICAgZXhwZWN0KG5vdC50eXBlKS50b0JlKCd3YXJuaW5nJyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiJdfQ==
//# sourceURL=/home/takaaki/.atom/packages/build/spec/build-targets-spec.js
