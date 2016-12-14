function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _atomBuildSpecHelpers = require('atom-build-spec-helpers');

var _atomBuildSpecHelpers2 = _interopRequireDefault(_atomBuildSpecHelpers);

'use babel';

describe('Hooks', function () {
  var directory = null;
  var workspaceElement = null;
  var succedingCommandName = 'build:hook-test:succeding';
  var failingCommandName = 'build:hook-test:failing';
  var dummyPackageName = 'atom-build-hooks-dummy-package';
  var dummyPackagePath = __dirname + '/fixture/' + dummyPackageName;

  _temp2['default'].track();

  beforeEach(function () {
    directory = _fsExtra2['default'].realpathSync(_temp2['default'].mkdirSync({ prefix: 'atom-build-spec-' }));
    atom.project.setPaths([directory]);

    atom.config.set('build.buildOnSave', false);
    atom.config.set('build.panelVisibility', 'Toggle');
    atom.config.set('build.saveOnBuild', false);
    atom.config.set('build.notificationOnRefresh', true);

    jasmine.unspy(window, 'setTimeout');
    jasmine.unspy(window, 'clearTimeout');

    runs(function () {
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
    });

    waitsForPromise(function () {
      return Promise.resolve().then(function () {
        return atom.packages.activatePackage('build');
      }).then(function () {
        return atom.packages.activatePackage(dummyPackagePath);
      });
    });

    waitsForPromise(function () {
      return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
    });
  });

  afterEach(function () {
    _fsExtra2['default'].removeSync(directory);
  });

  it('should call preBuild', function () {
    var pkg = undefined;

    runs(function () {
      pkg = atom.packages.getActivePackage(dummyPackageName).mainModule;
      spyOn(pkg.hooks, 'preBuild');

      atom.commands.dispatch(workspaceElement, succedingCommandName);
    });

    waitsFor(function () {
      return workspaceElement.querySelector('.build .title');
    });

    runs(function () {
      expect(pkg.hooks.preBuild).toHaveBeenCalled();
    });
  });

  describe('postBuild', function () {
    it('should be called with `true` as an argument when build succeded', function () {
      var pkg = undefined;

      runs(function () {
        pkg = atom.packages.getActivePackage(dummyPackageName).mainModule;
        spyOn(pkg.hooks, 'postBuild');

        atom.commands.dispatch(workspaceElement, succedingCommandName);
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(pkg.hooks.postBuild).toHaveBeenCalledWith(true);
      });
    });

    it('should be called with `false` as an argument when build failed', function () {
      var pkg = undefined;

      runs(function () {
        pkg = atom.packages.getActivePackage(dummyPackageName).mainModule;
        spyOn(pkg.hooks, 'postBuild');

        atom.commands.dispatch(workspaceElement, failingCommandName);
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        expect(pkg.hooks.postBuild).toHaveBeenCalledWith(false);
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQvc3BlYy9idWlsZC1ob29rcy1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O3VCQUVlLFVBQVU7Ozs7b0JBQ1IsTUFBTTs7OztvQ0FDQyx5QkFBeUI7Ozs7QUFKakQsV0FBVyxDQUFDOztBQU1aLFFBQVEsQ0FBQyxPQUFPLEVBQUUsWUFBTTtBQUN0QixNQUFJLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDckIsTUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFDNUIsTUFBTSxvQkFBb0IsR0FBRywyQkFBMkIsQ0FBQztBQUN6RCxNQUFNLGtCQUFrQixHQUFHLHlCQUF5QixDQUFDO0FBQ3JELE1BQU0sZ0JBQWdCLEdBQUcsZ0NBQWdDLENBQUM7QUFDMUQsTUFBTSxnQkFBZ0IsR0FBRyxTQUFTLEdBQUcsV0FBVyxHQUFHLGdCQUFnQixDQUFDOztBQUVwRSxvQkFBSyxLQUFLLEVBQUUsQ0FBQzs7QUFFYixZQUFVLENBQUMsWUFBTTtBQUNmLGFBQVMsR0FBRyxxQkFBRyxZQUFZLENBQUMsa0JBQUssU0FBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzVFLFFBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUUsU0FBUyxDQUFFLENBQUMsQ0FBQzs7QUFFckMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDbkQsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXJELFdBQU8sQ0FBQyxLQUFL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LENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxVQUFVLENBQUM7QUFDbEUsYUFBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUM7O0FBRTlCLFlBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLGtCQUFrQixDQUFDLENBQUM7T0FDOUQsQ0FBQyxDQUFDOztBQUVILGNBQVEsQ0FBQyxZQUFNO0FBQ2IsZUFBTyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQ3BELGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQy9FLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsWUFBTTtBQUNULGNBQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ3pELENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQztDQUNKLENBQUMsQ0FBQyIsImZpbGUiOiIvaG9tZS90YWthYWtpLy5hdG9tL3BhY2thZ2VzL2J1aWxkL3NwZWMvYnVpbGQtaG9va3Mtc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0IHRlbXAgZnJvbSAndGVtcCc7XG5pbXBvcnQgc3BlY0hlbHBlcnMgZnJvbSAnYXRvbS1idWlsZC1zcGVjLWhlbHBlcnMnO1xuXG5kZXNjcmliZSgnSG9va3MnLCAoKSA9PiB7XG4gIGxldCBkaXJlY3RvcnkgPSBudWxsO1xuICBsZXQgd29ya3NwYWNlRWxlbWVudCA9IG51bGw7XG4gIGNvbnN0IHN1Y2NlZGluZ0NvbW1hbmROYW1lID0gJ2J1aWxkOmhvb2stdGVzdDpzdWNjZWRpbmcnO1xuICBjb25zdCBmYWlsaW5nQ29tbWFuZE5hbWUgPSAnYnVpbGQ6aG9vay10ZXN0OmZhaWxpbmcnO1xuICBjb25zdCBkdW1teVBhY2thZ2VOYW1lID0gJ2F0b20tYnVpbGQtaG9va3MtZHVtbXktcGFja2FnZSc7XG4gIGNvbnN0IGR1bW15UGFja2FnZVBhdGggPSBfX2Rpcm5hbWUgKyAnL2ZpeHR1cmUvJyArIGR1bW15UGFja2FnZU5hbWU7XG5cbiAgdGVtcC50cmFjaygpO1xuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGRpcmVjdG9yeSA9IGZzLnJlYWxwYXRoU3luYyh0ZW1wLm1rZGlyU3luYyh7IHByZWZpeDogJ2F0b20tYnVpbGQtc3BlYy0nIH0pKTtcbiAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoWyBkaXJlY3RvcnkgXSk7XG5cbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLmJ1aWxkT25TYXZlJywgZmFsc2UpO1xuICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQucGFuZWxWaXNpYmlsaXR5JywgJ1RvZ2dsZScpO1xuICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQuc2F2ZU9uQnVpbGQnLCBmYWxzZSk7XG4gICAgYXRvbS5jb25maWcuc2V0KCdidWlsZC5ub3RpZmljYXRpb25PblJlZnJlc2gnLCB0cnVlKTtcblxuICAgIGphc21pbmUudW5zcHkod2luZG93LCAnc2V0VGltZW91dCcpO1xuICAgIGphc21pbmUudW5zcHkod2luZG93LCAnY2xlYXJUaW1lb3V0Jyk7XG5cbiAgICBydW5zKCgpID0+IHtcbiAgICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpO1xuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTSh3b3Jrc3BhY2VFbGVtZW50KTtcbiAgICB9KTtcblxuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgICAgLnRoZW4oKCkgPT4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2J1aWxkJykpXG4gICAgICAgIC50aGVuKCgpID0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKGR1bW15UGFja2FnZVBhdGgpKTtcbiAgICB9KTtcblxuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiBzcGVjSGVscGVycy5yZWZyZXNoQXdhaXRUYXJnZXRzKCkpO1xuICB9KTtcblxuICBhZnRlckVhY2goKCkgPT4ge1xuICAgIGZzLnJlbW92ZVN5bmMoZGlyZWN0b3J5KTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBjYWxsIHByZUJ1aWxkJywgKCkgPT4ge1xuICAgIGxldCBwa2c7XG5cbiAgICBydW5zKCgpID0+IHtcbiAgICAgIHBrZyA9IGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZShkdW1teVBhY2thZ2VOYW1lKS5tYWluTW9kdWxlO1xuICAgICAgc3B5T24ocGtnLmhvb2tzLCAncHJlQnVpbGQnKTtcblxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCBzdWNjZWRpbmdDb21tYW5kTmFtZSk7XG4gICAgfSk7XG5cbiAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJyk7XG4gICAgfSk7XG5cbiAgICBydW5zKCgpID0+IHtcbiAgICAgIGV4cGVjdChwa2cuaG9va3MucHJlQnVpbGQpLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3Bvc3RCdWlsZCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGJlIGNhbGxlZCB3aXRoIGB0cnVlYCBhcyBhbiBhcmd1bWVudCB3aGVuIGJ1aWxkIHN1Y2NlZGVkJywgKCkgPT4ge1xuICAgICAgbGV0IHBrZztcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIHBrZyA9IGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZShkdW1teVBhY2thZ2VOYW1lKS5tYWluTW9kdWxlO1xuICAgICAgICBzcHlPbihwa2cuaG9va3MsICdwb3N0QnVpbGQnKTtcblxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsIHN1Y2NlZGluZ0NvbW1hbmROYW1lKTtcbiAgICAgIH0pO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKSAmJlxuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpLmNsYXNzTGlzdC5jb250YWlucygnc3VjY2VzcycpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBleHBlY3QocGtnLmhvb2tzLnBvc3RCdWlsZCkudG9IYXZlQmVlbkNhbGxlZFdpdGgodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgYmUgY2FsbGVkIHdpdGggYGZhbHNlYCBhcyBhbiBhcmd1bWVudCB3aGVuIGJ1aWxkIGZhaWxlZCcsICgpID0+IHtcbiAgICAgIGxldCBwa2c7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBwa2cgPSBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UoZHVtbXlQYWNrYWdlTmFtZSkubWFpbk1vZHVsZTtcbiAgICAgICAgc3B5T24ocGtnLmhvb2tzLCAncG9zdEJ1aWxkJyk7XG5cbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCBmYWlsaW5nQ29tbWFuZE5hbWUpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpICYmXG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdlcnJvcicpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBleHBlY3QocGtnLmhvb2tzLnBvc3RCdWlsZCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoZmFsc2UpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXX0=
//# sourceURL=/home/takaaki/.atom/packages/build/spec/build-hooks-spec.js
