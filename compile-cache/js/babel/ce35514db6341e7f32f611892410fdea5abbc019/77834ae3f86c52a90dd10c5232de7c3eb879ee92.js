function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _atomBuildSpecHelpers = require('atom-build-spec-helpers');

var _atomBuildSpecHelpers2 = _interopRequireDefault(_atomBuildSpecHelpers);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

'use babel';

describe('Keymap', function () {
  var originalHomedirFn = _os2['default'].homedir;
  var directory = null;
  var workspaceElement = null;

  _temp2['default'].track();

  beforeEach(function () {
    var createdHomeDir = _temp2['default'].mkdirSync('atom-build-spec-home');
    _os2['default'].homedir = function () {
      return createdHomeDir;
    };
    directory = _fsExtra2['default'].realpathSync(_temp2['default'].mkdirSync({ prefix: 'atom-build-spec-' })) + _path2['default'].sep;
    atom.project.setPaths([directory]);

    atom.config.set('build.buildOnSave', false);
    atom.config.set('build.panelVisibility', 'Toggle');
    atom.config.set('build.saveOnBuild', false);
    atom.config.set('build.notificationOnRefresh', true);

    jasmine.unspy(window, 'setTimeout');
    jasmine.unspy(window, 'clearTimeout');

    runs(function () {
      workspaceElement = atom.views.getView(atom.workspace);
      workspaceElement.setAttribute('style', 'width:9999px');
      jasmine.attachToDOM(workspaceElement);
    });

    waitsForPromise(function () {
      return atom.packages.activatePackage('build');
    });
  });

  afterEach(function () {
    _os2['default'].homedir = originalHomedirFn;
    _fsExtra2['default'].removeSync(directory);
  });

  describe('when custom keymap is defined in .atom-build.json', function () {
    it('should trigger the build when that key combination is pressed', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', JSON.stringify({
        name: 'The default build',
        cmd: 'echo default',
        targets: {
          'keymapped build': {
            cmd: 'echo keymapped',
            keymap: 'ctrl-alt-k'
          }
        }
      }));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(workspaceElement.querySelector('.terminal').terminal.getContent()).toMatch(/default/);
        atom.commands.dispatch(workspaceElement, 'build:toggle-panel');
      });

      waitsFor(function () {
        return !workspaceElement.querySelector('.build .title');
      });

      runs(function () {
        _atomBuildSpecHelpers2['default'].keydown('k', { ctrl: true, alt: true, element: workspaceElement });
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(workspaceElement.querySelector('.terminal').terminal.getContent()).toMatch(/keymapped/);
      });
    });

    it('should not changed the set active build', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', JSON.stringify({
        name: 'The default build',
        cmd: 'echo default',
        targets: {
          'keymapped build': {
            cmd: 'echo keymapped',
            keymap: 'ctrl-alt-k'
          }
        }
      }));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(workspaceElement.querySelector('.terminal').terminal.getContent()).toMatch(/default/);
        atom.commands.dispatch(workspaceElement, 'build:toggle-panel');
      });

      waitsFor(function () {
        return !workspaceElement.querySelector('.build .title');
      });

      runs(function () {
        _atomBuildSpecHelpers2['default'].keydown('k', { ctrl: true, alt: true, element: workspaceElement });
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(workspaceElement.querySelector('.terminal').terminal.getContent()).toMatch(/keymapped/);
        atom.commands.dispatch(workspaceElement, 'build:toggle-panel');
      });

      waitsFor(function () {
        return !workspaceElement.querySelector('.build .title');
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(workspaceElement.querySelector('.terminal').terminal.getContent()).toMatch(/default/);
        atom.commands.dispatch(workspaceElement, 'build:toggle-panel');
      });
    });

    it('should dispose keymap when reloading targets', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', JSON.stringify({
        name: 'The default build',
        cmd: 'echo default',
        targets: {
          'keymapped build': {
            cmd: 'echo keymapped',
            keymap: 'ctrl-alt-k'
          }
        }
      }));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(workspaceElement.querySelector('.terminal').terminal.getContent()).toMatch(/default/);
      });

      waitsFor(function () {
        return !workspaceElement.querySelector('.build .title');
      });

      runs(function () {
        _atomBuildSpecHelpers2['default'].keydown('k', { ctrl: true, alt: true, element: workspaceElement });
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(workspaceElement.querySelector('.terminal').terminal.getContent()).toMatch(/keymapped/);
        atom.commands.dispatch(workspaceElement, 'build:toggle-panel');
        _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', JSON.stringify({
          name: 'The default build',
          cmd: 'echo default',
          targets: {
            'keymapped build': {
              cmd: 'echo ctrl-x new file',
              keymap: 'ctrl-x'
            }
          }
        }));
      });

      waitsForPromise(function () {
        return _atomBuildSpecHelpers2['default'].awaitTargets();
      });

      waitsFor(function () {
        return !workspaceElement.querySelector('.build .title');
      });

      runs(function () {
        _atomBuildSpecHelpers2['default'].keydown('k', { ctrl: true, alt: true, element: workspaceElement });
      });

      waits(300);

      runs(function () {
        expect(workspaceElement.querySelector('.build')).not.toExist();
        _atomBuildSpecHelpers2['default'].keydown('x', { ctrl: true, element: workspaceElement });
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(workspaceElement.querySelector('.terminal').terminal.getContent()).toMatch(/ctrl-x new file/);
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQvc3BlYy9idWlsZC1rZXltYXAtc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzt1QkFFZSxVQUFVOzs7O29CQUNSLE1BQU07Ozs7b0JBQ04sTUFBTTs7OztvQ0FDQyx5QkFBeUI7Ozs7a0JBQ2xDLElBQUk7Ozs7QUFObkIsV0FBVyxDQUFDOztBQVFaLFFBQVEsQ0FBQyxRQUFRLEVBQUUsWUFBTTtBQUN2QixNQUFNLGlCQUFpQixHQUFHLGdCQUFHLE9BQU8sQ0FBQztBQUNyQyxNQUFJLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDckIsTUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7O0FBRTVCLG9CQUFLLEtBQUssRUFBRSxDQUFDOztBQUViLFlBQVUsQ0FBQyxZQUFNO0FBQ2YsUUFBTSxjQUFjLEdBQUcsa0JBQUssU0FBUyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDOUQsb0JBQUcsT0FBTyxHQUFHO2FBQU0sY0FBYztLQUFBLENBQUM7QUFDbEMsYUFBUyxHQUFHLHFCQUFHLFlBQVksQ0FBQyxrQkFBSyxTQUFTLENBQUMsRUFBRSxNQUFNLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsa0JBQUssR0FBRyxDQUFDO0FBQ3ZGLFFBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUUsU0FBUyxDQUFFLENBQUMsQ0FBQzs7QUFFckMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDbkQsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXJELFdBQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3BDLFdBQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDOztBQUV0QyxRQUFJLENBQUMsWUFBTTtBQUNULHNCQUFnQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN0RCxzQkFBZ0IsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQ3ZELGFBQU8sQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztLQUN2QyxDQUFDLENBQUM7O0FBRUgsbUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDL0MsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDOztBQUVILFdBQVMsQ0FBQyxZQUFNO0FBQ2Qsb0JBQUcsT0FBTyxHQUFHLGlCQUFpQixDQUFDO0FBQy9CLHlCQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztHQUMxQixDQUFDLENBQUM7O0FBRUgsVUFBUSxDQUFDLG1EQUFtRCxFQUFFLFlBQU07QUFDbEUsTUFBRSxDQUFDLCtEQUErRCxFQUFFLFlBQU07QUFDeEUsMkJBQUcsYUFBYSxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQzlELFlBQUksRUFBRSxtQkFBbUI7QUFDekIsV0FBRyxFQUFFLGNBQWM7QUFDbkIsZUFBTyxFQUFFO0FBQ1AsMkJBQWlCLEVBQUU7QUFDakIsZUFBRyxFQUFFLGdCQUFnQjtBQUNyQixrQkFBTSxFQUFFLFlBQVk7V0FDckI7U0FDRjtPQUNGLENBQUMsQ0FBQyxDQUFDOztBQUVKLFVBQUksQ0FBQztlQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQztPQUFBLENBQUMsQ0FBQzs7QUFFdEUsY0FBUSxDQUFDLFlBQU07QUFDYixlQUFPLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFDcEQsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7T0FDakYsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxZQUFNO0FBQ1QsY0FBTSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDN0YsWUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztPQUNoRSxDQUFDLENBQUM7O0FBRUgsY0FBUSxDQUFDLFlBQU07QUFDYixlQUFPLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO09BQ3pELENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsWUFBTTtBQUNULDBDQUFZLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQztPQUNoRixDQUFDLENBQUM7O0FBRUgsY0FBUSxDQUFDLFlBQU07QUFDYixlQUFPLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFDcEQsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7T0FDakYsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxZQUFNO0FBQ1QsY0FBTSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7T0FDaEcsQ0FBQyxDQUFDO0tBQ0osQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyx5Q0FBeUMsRUFBRSxZQUFNO0FBQ2xELDJCQUFHLGFBQWEsQ0FBQyxTQUFTLEdBQUcsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUM5RCxZQUFJLEVBQUUsbUJBQW1CO0FBQ3pCLFdBQUcsRUFBRSxjQUFjO0FBQ25CLGVBQU8sRUFBRTtBQUNQLDJCQUFpQixFQUFFO0FBQ2pCLGVBQUcsRUFBRSxnQkFBZ0I7QUFDckIsa0JBQU0sRUFBRSxZQUFZO1dBQ3JCO1NBQ0Y7T0FDRixDQUFDLENBQUMsQ0FBQzs7QUFFSixVQUFJLENBQUM7ZUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUM7T0FBQSxDQUFDLENBQUM7O0FBRXRFLGNBQVEsQ0FBQyxZQUFNO0FBQ2IsZUFBTyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQ3BELGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO09BQ2pGLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsWUFBTTtBQUNULGNBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzdGLFlBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLG9CQUFvQixDQUFDLENBQUM7T0FDaEUsQ0FBQyxDQUFDOztBQUVILGNBQVEsQ0FBQyxZQUFNO0FBQ2IsZUFBTyxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQztPQUN6RCxDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLFlBQU07QUFDVCwwQ0FBWSxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7T0FDaEYsQ0FBQyxDQUFDOztBQUVILGNBQVEsQ0FBQyxZQUFNO0FBQ2IsZUFBTyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQ3BELGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO09BQ2pGLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsWUFBTTtBQUNULGNBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQy9GLFlBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLG9CQUFvQixDQUFDLENBQUM7T0FDaEUsQ0FBQyxDQUFDOztBQUVILGNBQVEsQ0FBQyxZQUFNO0FBQ2IsZUFBTyxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQztPQUN6RCxDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLFlBQU07QUFDVCxZQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsQ0FBQztPQUMzRCxDQUFDLENBQUM7O0FBRUgsY0FBUSxDQUFDLFlBQU07QUFDYixlQUFPLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFDcEQsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7T0FDakYsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxZQUFNO0FBQ1QsY0FBTSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDN0YsWUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztPQUNoRSxDQUFDLENBQUM7S0FDSixDQUFDLENBQUM7O0FBRUgsTUFBRSxDQUFDLDhDQUE4QyxFQUFFLFlBQU07QUFDdkQsMkJBQUcsYUFBYSxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQzlELFlBQUksRUFBRSxtQkFBbUI7QUFDekIsV0FBRyxFQUFFLGNBQWM7QUFDbkIsZUFBTyxFQUFFO0FBQ1AsMkJBQWlCLEVBQUU7QUFDakIsZUFBRyxFQUFFLGdCQUFnQjtBQUNyQixrQkFBTSxFQUFFLFlBQVk7V0FDckI7U0FDRjtPQUNGLENBQUMsQ0FBQyxDQUFDOztBQUVKLFVBQUksQ0FBQztlQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQztPQUFBLENBQUMsQ0FBQzs7QUFFdEUsY0FBUSxDQUFDLFlBQU07QUFDYixlQUFPLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFDcEQsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7T0FDakYsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxZQUFNO0FBQ1QsY0FBTSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7T0FDOUYsQ0FBQyxDQUFDOztBQUVILGNBQVEsQ0FBQyxZQUFNO0FBQ2IsZUFBTyxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQztPQUN6RCxDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLFlBQU07QUFDVCwwQ0FBWSxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7T0FDaEYsQ0FBQyxDQUFDOztBQUVILGNBQVEsQ0FBQyxZQUFNO0FBQ2IsZUFBTyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQ3BELGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO09BQ2pGLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsWUFBTTtBQUNULGNBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQy9GLFlBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLG9CQUFvQixDQUFDLENBQUM7QUFDL0QsNkJBQUcsYUFBYSxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQzlELGNBQUksRUFBRSxtQkFBbUI7QUFDekIsYUFBRyxFQUFFLGNBQWM7QUFDbkIsaUJBQU8sRUFBRTtBQUNQLDZCQUFpQixFQUFFO0FBQ2pCLGlCQUFHLEVBQUUsc0JBQXNCO0FBQzNCLG9CQUFNLEVBQUUsUUFBUTthQUNqQjtXQUNGO1NBQ0YsQ0FBQyxDQUFDLENBQUM7T0FDTCxDQUFDLENBQUM7O0FBRUgscUJBQWUsQ0FBQztlQUFNLGtDQUFZLFlBQVksRUFBRTtPQUFBLENBQUMsQ0FBQzs7QUFFbEQsY0FBUSxDQUFDLFlBQU07QUFDYixlQUFPLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO09BQ3pELENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsWUFBTTtBQUNULDBDQUFZLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQztPQUNoRixDQUFDLENBQUM7O0FBRUgsV0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUVYLFVBQUksQ0FBQyxZQUFNO0FBQ1QsY0FBTSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMvRCwwQ0FBWSxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO09BQ3JFLENBQUMsQ0FBQzs7QUFFSCxjQUFRLENBQUMsWUFBTTtBQUNiLGVBQU8sZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxJQUNsRCxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztPQUNuRixDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLFlBQU07QUFDVCxjQUFNLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO09BQ3RHLENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQztDQUNKLENBQUMsQ0FBQyIsImZpbGUiOiIvaG9tZS90YWthYWtpLy5hdG9tL3BhY2thZ2VzL2J1aWxkL3NwZWMvYnVpbGQta2V5bWFwLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHRlbXAgZnJvbSAndGVtcCc7XG5pbXBvcnQgc3BlY0hlbHBlcnMgZnJvbSAnYXRvbS1idWlsZC1zcGVjLWhlbHBlcnMnO1xuaW1wb3J0IG9zIGZyb20gJ29zJztcblxuZGVzY3JpYmUoJ0tleW1hcCcsICgpID0+IHtcbiAgY29uc3Qgb3JpZ2luYWxIb21lZGlyRm4gPSBvcy5ob21lZGlyO1xuICBsZXQgZGlyZWN0b3J5ID0gbnVsbDtcbiAgbGV0IHdvcmtzcGFjZUVsZW1lbnQgPSBudWxsO1xuXG4gIHRlbXAudHJhY2soKTtcblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBjb25zdCBjcmVhdGVkSG9tZURpciA9IHRlbXAubWtkaXJTeW5jKCdhdG9tLWJ1aWxkLXNwZWMtaG9tZScpO1xuICAgIG9zLmhvbWVkaXIgPSAoKSA9PiBjcmVhdGVkSG9tZURpcjtcbiAgICBkaXJlY3RvcnkgPSBmcy5yZWFscGF0aFN5bmModGVtcC5ta2RpclN5bmMoeyBwcmVmaXg6ICdhdG9tLWJ1aWxkLXNwZWMtJyB9KSkgKyBwYXRoLnNlcDtcbiAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoWyBkaXJlY3RvcnkgXSk7XG5cbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLmJ1aWxkT25TYXZlJywgZmFsc2UpO1xuICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQucGFuZWxWaXNpYmlsaXR5JywgJ1RvZ2dsZScpO1xuICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQuc2F2ZU9uQnVpbGQnLCBmYWxzZSk7XG4gICAgYXRvbS5jb25maWcuc2V0KCdidWlsZC5ub3RpZmljYXRpb25PblJlZnJlc2gnLCB0cnVlKTtcblxuICAgIGphc21pbmUudW5zcHkod2luZG93LCAnc2V0VGltZW91dCcpO1xuICAgIGphc21pbmUudW5zcHkod2luZG93LCAnY2xlYXJUaW1lb3V0Jyk7XG5cbiAgICBydW5zKCgpID0+IHtcbiAgICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpO1xuICAgICAgd29ya3NwYWNlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ3dpZHRoOjk5OTlweCcpO1xuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTSh3b3Jrc3BhY2VFbGVtZW50KTtcbiAgICB9KTtcblxuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2J1aWxkJyk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgb3MuaG9tZWRpciA9IG9yaWdpbmFsSG9tZWRpckZuO1xuICAgIGZzLnJlbW92ZVN5bmMoZGlyZWN0b3J5KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3doZW4gY3VzdG9tIGtleW1hcCBpcyBkZWZpbmVkIGluIC5hdG9tLWJ1aWxkLmpzb24nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCB0cmlnZ2VyIHRoZSBidWlsZCB3aGVuIHRoYXQga2V5IGNvbWJpbmF0aW9uIGlzIHByZXNzZWQnLCAoKSA9PiB7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGRpcmVjdG9yeSArICcuYXRvbS1idWlsZC5qc29uJywgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBuYW1lOiAnVGhlIGRlZmF1bHQgYnVpbGQnLFxuICAgICAgICBjbWQ6ICdlY2hvIGRlZmF1bHQnLFxuICAgICAgICB0YXJnZXRzOiB7XG4gICAgICAgICAgJ2tleW1hcHBlZCBidWlsZCc6IHtcbiAgICAgICAgICAgIGNtZDogJ2VjaG8ga2V5bWFwcGVkJyxcbiAgICAgICAgICAgIGtleW1hcDogJ2N0cmwtYWx0LWsnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpKTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykgJiZcbiAgICAgICAgICB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKS5jbGFzc0xpc3QuY29udGFpbnMoJ3N1Y2Nlc3MnKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLnRlcm1pbmFsJykudGVybWluYWwuZ2V0Q29udGVudCgpKS50b01hdGNoKC9kZWZhdWx0Lyk7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOnRvZ2dsZS1wYW5lbCcpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuICF3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgc3BlY0hlbHBlcnMua2V5ZG93bignaycsIHsgY3RybDogdHJ1ZSwgYWx0OiB0cnVlLCBlbGVtZW50OiB3b3Jrc3BhY2VFbGVtZW50IH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpICYmXG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdzdWNjZXNzJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy50ZXJtaW5hbCcpLnRlcm1pbmFsLmdldENvbnRlbnQoKSkudG9NYXRjaCgva2V5bWFwcGVkLyk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgbm90IGNoYW5nZWQgdGhlIHNldCBhY3RpdmUgYnVpbGQnLCAoKSA9PiB7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGRpcmVjdG9yeSArICcuYXRvbS1idWlsZC5qc29uJywgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBuYW1lOiAnVGhlIGRlZmF1bHQgYnVpbGQnLFxuICAgICAgICBjbWQ6ICdlY2hvIGRlZmF1bHQnLFxuICAgICAgICB0YXJnZXRzOiB7XG4gICAgICAgICAgJ2tleW1hcHBlZCBidWlsZCc6IHtcbiAgICAgICAgICAgIGNtZDogJ2VjaG8ga2V5bWFwcGVkJyxcbiAgICAgICAgICAgIGtleW1hcDogJ2N0cmwtYWx0LWsnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpKTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykgJiZcbiAgICAgICAgICB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKS5jbGFzc0xpc3QuY29udGFpbnMoJ3N1Y2Nlc3MnKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLnRlcm1pbmFsJykudGVybWluYWwuZ2V0Q29udGVudCgpKS50b01hdGNoKC9kZWZhdWx0Lyk7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOnRvZ2dsZS1wYW5lbCcpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuICF3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgc3BlY0hlbHBlcnMua2V5ZG93bignaycsIHsgY3RybDogdHJ1ZSwgYWx0OiB0cnVlLCBlbGVtZW50OiB3b3Jrc3BhY2VFbGVtZW50IH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpICYmXG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdzdWNjZXNzJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy50ZXJtaW5hbCcpLnRlcm1pbmFsLmdldENvbnRlbnQoKSkudG9NYXRjaCgva2V5bWFwcGVkLyk7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOnRvZ2dsZS1wYW5lbCcpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuICF3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpICYmXG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdzdWNjZXNzJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy50ZXJtaW5hbCcpLnRlcm1pbmFsLmdldENvbnRlbnQoKSkudG9NYXRjaCgvZGVmYXVsdC8pO1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0b2dnbGUtcGFuZWwnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBkaXNwb3NlIGtleW1hcCB3aGVuIHJlbG9hZGluZyB0YXJnZXRzJywgKCkgPT4ge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhkaXJlY3RvcnkgKyAnLmF0b20tYnVpbGQuanNvbicsIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgbmFtZTogJ1RoZSBkZWZhdWx0IGJ1aWxkJyxcbiAgICAgICAgY21kOiAnZWNobyBkZWZhdWx0JyxcbiAgICAgICAgdGFyZ2V0czoge1xuICAgICAgICAgICdrZXltYXBwZWQgYnVpbGQnOiB7XG4gICAgICAgICAgICBjbWQ6ICdlY2hvIGtleW1hcHBlZCcsXG4gICAgICAgICAgICBrZXltYXA6ICdjdHJsLWFsdC1rJ1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSkpO1xuXG4gICAgICBydW5zKCgpID0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOnRyaWdnZXInKSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpICYmXG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdzdWNjZXNzJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy50ZXJtaW5hbCcpLnRlcm1pbmFsLmdldENvbnRlbnQoKSkudG9NYXRjaCgvZGVmYXVsdC8pO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuICF3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgc3BlY0hlbHBlcnMua2V5ZG93bignaycsIHsgY3RybDogdHJ1ZSwgYWx0OiB0cnVlLCBlbGVtZW50OiB3b3Jrc3BhY2VFbGVtZW50IH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpICYmXG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdzdWNjZXNzJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy50ZXJtaW5hbCcpLnRlcm1pbmFsLmdldENvbnRlbnQoKSkudG9NYXRjaCgva2V5bWFwcGVkLyk7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOnRvZ2dsZS1wYW5lbCcpO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGRpcmVjdG9yeSArICcuYXRvbS1idWlsZC5qc29uJywgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIG5hbWU6ICdUaGUgZGVmYXVsdCBidWlsZCcsXG4gICAgICAgICAgY21kOiAnZWNobyBkZWZhdWx0JyxcbiAgICAgICAgICB0YXJnZXRzOiB7XG4gICAgICAgICAgICAna2V5bWFwcGVkIGJ1aWxkJzoge1xuICAgICAgICAgICAgICBjbWQ6ICdlY2hvIGN0cmwteCBuZXcgZmlsZScsXG4gICAgICAgICAgICAgIGtleW1hcDogJ2N0cmwteCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgIH0pO1xuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gc3BlY0hlbHBlcnMuYXdhaXRUYXJnZXRzKCkpO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiAhd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIHNwZWNIZWxwZXJzLmtleWRvd24oJ2snLCB7IGN0cmw6IHRydWUsIGFsdDogdHJ1ZSwgZWxlbWVudDogd29ya3NwYWNlRWxlbWVudCB9KTtcbiAgICAgIH0pO1xuXG4gICAgICB3YWl0cygzMDApO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkJykpLm5vdC50b0V4aXN0KCk7XG4gICAgICAgIHNwZWNIZWxwZXJzLmtleWRvd24oJ3gnLCB7IGN0cmw6IHRydWUsIGVsZW1lbnQ6IHdvcmtzcGFjZUVsZW1lbnQgfSk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykgJiZcbiAgICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpLmNsYXNzTGlzdC5jb250YWlucygnc3VjY2VzcycpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBleHBlY3Qod29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcudGVybWluYWwnKS50ZXJtaW5hbC5nZXRDb250ZW50KCkpLnRvTWF0Y2goL2N0cmwteCBuZXcgZmlsZS8pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXX0=
//# sourceURL=/home/takaaki/.atom/packages/build/spec/build-keymap-spec.js
