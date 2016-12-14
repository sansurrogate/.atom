function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

'use babel';

describe('Confirm', function () {
  var directory = null;
  var workspaceElement = null;
  var cat = process.platform === 'win32' ? 'type' : 'cat';
  var waitTime = process.env.CI ? 2400 : 200;
  var originalHomedirFn = _os2['default'].homedir;

  _temp2['default'].track();

  beforeEach(function () {
    var createdHomeDir = _temp2['default'].mkdirSync('atom-build-spec-home');
    _os2['default'].homedir = function () {
      return createdHomeDir;
    };
    directory = _fsExtra2['default'].realpathSync(_temp2['default'].mkdirSync({ prefix: 'atom-build-spec-' })) + '/';
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
    _fsExtra2['default'].removeSync(directory);
    _os2['default'].homedir = originalHomedirFn;
  });

  describe('when the text editor is modified', function () {
    it('should show the save confirmation', function () {
      expect(workspaceElement.querySelector('.build-confirm')).not.toExist();

      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', JSON.stringify({
        cmd: 'echo Surprising is the passing of time but not so, as the time of passing.'
      }));

      waitsForPromise(function () {
        return atom.workspace.open('.atom-build.json');
      });

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        editor.insertText('hello kansas');
        atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build-confirm');
      });

      runs(function () {
        expect(document.activeElement.classList.contains('btn-success')).toEqual(true);
      });
    });

    it('should cancel the confirm window when pressing escape', function () {
      expect(workspaceElement.querySelector('.build-confirm')).not.toExist();

      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', JSON.stringify({
        cmd: 'echo Surprising is the passing of time but not so, as the time of passing.'
      }));

      waitsForPromise(function () {
        return atom.workspace.open('.atom-build.json');
      });

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        editor.insertText('hello kansas');
        atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build-confirm');
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:no-confirm');
        expect(workspaceElement.querySelector('.build-confirm')).not.toExist();
      });
    });

    it('should not do anything if issuing no-confirm whithout the dialog', function () {
      expect(workspaceElement.querySelector('.build-confirm')).not.toExist();
      atom.commands.dispatch(workspaceElement, 'build:no-confirm');
    });

    it('should not confirm if a TextEditor edits an unsaved file', function () {
      expect(workspaceElement.querySelector('.build-confirm')).not.toExist();

      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', JSON.stringify({
        cmd: 'echo Surprising is the passing of time but not so, as the time of passing.'
      }));

      waitsForPromise(function () {
        return Promise.all([atom.workspace.open('.atom-build.json'), atom.workspace.open()]);
      });

      runs(function () {
        var editor = atom.workspace.getTextEditors().find(function (textEditor) {
          return 'untitled' === textEditor.getTitle();
        });
        editor.insertText('Just some temporary place to write stuff');
        atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(workspaceElement.querySelector('.build')).toExist();
        expect(workspaceElement.querySelector('.terminal').terminal.getContent()).toMatch(/Surprising is the passing of time but not so, as the time of passing/);
      });
    });

    it('should save and build when selecting save and build', function () {
      expect(workspaceElement.querySelector('.build-confirm')).not.toExist();

      _fsExtra2['default'].writeFileSync(directory + 'catme', 'Surprising is the passing of time but not so, as the time of passing.');
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', JSON.stringify({
        cmd: cat + ' catme'
      }));

      waitsForPromise(function () {
        return atom.workspace.open('catme');
      });

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        editor.setText('kansas');
        atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build-confirm');
      });
      runs(function () {
        return document.activeElement.click();
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        expect(workspaceElement.querySelector('.build')).toExist();
        expect(workspaceElement.querySelector('.build .output').innerHTML).toMatch(/kansas/);
        expect(!editor.isModified());
      });
    });

    it('should build but not save when opting so', function () {
      expect(workspaceElement.querySelector('.build-confirm')).not.toExist();

      _fsExtra2['default'].writeFileSync(directory + 'catme', 'Surprising is the passing of time but not so, as the time of passing.');
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', JSON.stringify({
        cmd: cat + ' catme'
      }));

      waitsForPromise(function () {
        return atom.workspace.open('catme');
      });

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        editor.setText('catme');
        atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build-confirm');
      });

      runs(function () {
        workspaceElement.querySelector('button[click="confirmWithoutSave"]').click();
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        expect(workspaceElement.querySelector('.build')).toExist();
        expect(workspaceElement.querySelector('.build .output').innerHTML).not.toMatch(/kansas/);
        expect(editor.isModified());
      });
    });

    it('should do nothing when cancelling', function () {
      expect(workspaceElement.querySelector('.build-confirm')).not.toExist();

      _fsExtra2['default'].writeFileSync(directory + 'catme', 'Surprising is the passing of time but not so, as the time of passing.');
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', JSON.stringify({
        cmd: cat + ' catme'
      }));

      waitsForPromise(function () {
        return atom.workspace.open('catme');
      });

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        editor.setText('kansas');
        atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build-confirm');
      });

      runs(function () {
        workspaceElement.querySelector('button[click="cancel"]').click();
      });

      waits(waitTime);

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        expect(workspaceElement.querySelector('.build')).not.toExist();
        expect(editor.isModified());
      });
    });
  });

  describe('when build is triggered without answering confirm dialog', function () {
    it('should only keep at maximum 1 dialog open', function () {
      expect(workspaceElement.querySelector('.build-confirm')).not.toExist();

      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', JSON.stringify({
        cmd: 'echo Surprising is the passing of time but not so, as the time of passing.'
      }));

      waitsForPromise(function () {
        return atom.workspace.open('.atom-build.json');
      });

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        editor.setText(JSON.stringify({
          cmd: 'echo kansas'
        }));
        atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build-confirm');
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waits(waitTime); // Everything is the same so we can't know when second build:trigger has been handled

      runs(function () {
        expect(workspaceElement.querySelectorAll('.build-confirm').length).toEqual(1);
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQvc3BlYy9idWlsZC1jb25maXJtLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7dUJBRWUsVUFBVTs7OztvQkFDUixNQUFNOzs7O2tCQUNSLElBQUk7Ozs7QUFKbkIsV0FBVyxDQUFDOztBQU1aLFFBQVEsQ0FBQyxTQUFTLEVBQUUsWUFBTTtBQUN4QixNQUFJLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDckIsTUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFDNUIsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFFBQVEsS0FBSyxPQUFPLEdBQUcsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUMxRCxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQzdDLE1BQU0saUJBQWlCLEdBQUcsZ0JBQUcsT0FBTyxDQUFDOztBQUVyQyxvQkFBSyxLQUFLLEVBQUUsQ0FBQzs7QUFFYixZQUFVLENBQUMsWUFBTTtBQUNmLFFBQU0sY0FBYyxHQUFHLGtCQUFLLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQzlELG9CQUFHLE9BQU8sR0FBRzthQUFNLGNBQWM7S0FBQSxDQUFDO0FBQ2xDLGFBQVMsR0FBRyxxQkFBRyxZQUFZLENBQUMsa0JBQUssU0FBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNsRixRQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFFLFNBQVMsQ0FBRSxDQUFDLENBQUM7O0FBRXJDLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzVDLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ25ELFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzVDLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDZCQUE2QixFQUFFLElBQUksQ0FBQyxDQUFDOztBQUVyRCxXQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNwQyxXQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQzs7QUFFdEMsUUFBSSxDQUFDLFlBQU07QUFDVCxzQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdEQsc0JBQWdCLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQztBQUN2RCxhQUFPLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7S0FDdkMsQ0FBQyxDQUFDOztBQUVILG1CQUFlLENBQUMsWUFBTTtBQUNwQixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQy9DLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQzs7QUFFSCxXQUFTLENBQUMsWUFBTTtBQUNkLHlCQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN6QixvQkFBRyxPQUFPLEdBQUcsaUJBQWlCLENBQUM7R0FDaEMsQ0FBQyxDQUFDOztBQUVILFVBQVEsQ0FBQyxrQ0FBa0MsRUFBRSxZQUFNO0FBQ2pELE1BQUUsQ0FBQyxtQ0FBbUMsRUFBRSxZQUFNO0FBQzVDLFlBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFdkUsMkJBQUcsYUFBYSxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQzlELFdBQUcsRUFBRSw0RUFBNEU7T0FDbEYsQ0FBQyxDQUFDLENBQUM7O0FBRUoscUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLGVBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztPQUNoRCxDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLFlBQU07QUFDVCxZQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDcEQsY0FBTSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNsQyxZQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsQ0FBQztPQUMzRCxDQUFDLENBQUM7O0FBRUgsY0FBUSxDQUFDLFlBQU07QUFDYixlQUFPLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO09BQ3pELENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsWUFBTTtBQUNULGNBQU0sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDaEYsQ0FBQyxDQUFDO0tBQ0osQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyx1REFBdUQsRUFBRSxZQUFNO0FBQ2hFLFlBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFdkUsMkJBQUcsYUFBYSxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQzlELFdBQUcsRUFBRSw0RUFBNEU7T0FDbEYsQ0FBQyxDQUFDLENBQUM7O0FBRUoscUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLGVBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztPQUNoRCxDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLFlBQU07QUFDVCxZQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDcEQsY0FBTSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNsQyxZQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsQ0FBQztPQUMzRCxDQUFDLENBQUM7O0FBRUgsY0FBUSxDQUFDO2VBQU0sZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDO09BQUEsQ0FBQyxDQUFDOztBQUVqRSxVQUFJLENBQUMsWUFBTTtBQUNULFlBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFDN0QsY0FBTSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3hFLENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsa0VBQWtFLEVBQUUsWUFBTTtBQUMzRSxZQUFNLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdkUsVUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztLQUM5RCxDQUFDLENBQUM7O0FBRUgsTUFBRSxDQUFDLDBEQUEwRCxFQUFFLFlBQU07QUFDbkUsWUFBTSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUV2RSwyQkFBRyxhQUFhLENBQUMsU0FBUyxHQUFHLGtCQUFrQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDOUQsV0FBRyxFQUFFLDRFQUE0RTtPQUNsRixDQUFDLENBQUMsQ0FBQzs7QUFFSixxQkFBZSxDQUFDLFlBQU07QUFDcEIsZUFBTyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQ2pCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQ3ZDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQ3RCLENBQUMsQ0FBQztPQUNKLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsWUFBTTtBQUNULFlBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQUEsVUFBVSxFQUFJO0FBQ2hFLGlCQUFRLFVBQVUsS0FBSyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUU7U0FDL0MsQ0FBQyxDQUFDO0FBQ0gsY0FBTSxDQUFDLFVBQVUsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO0FBQzlELFlBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxDQUFDO09BQzNELENBQUMsQ0FBQzs7QUFFSCxjQUFRLENBQUMsWUFBTTtBQUNiLGVBQU8sZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxJQUNwRCxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztPQUNqRixDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLFlBQU07QUFDVCxjQUFNLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDM0QsY0FBTSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsc0VBQXNFLENBQUMsQ0FBQztPQUMzSixDQUFDLENBQUM7S0FDSixDQUFDLENBQUM7O0FBRUgsTUFBRSxDQUFDLHFEQUFxRCxFQUFFLFlBQU07QUFDOUQsWUFBTSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUV2RSwyQkFBRyxhQUFhLENBQUMsU0FBUyxHQUFHLE9BQU8sRUFBRSx1RUFBdUUsQ0FBQyxDQUFDO0FBQy9HLDJCQUFHLGFBQWEsQ0FBQyxTQUFTLEdBQUcsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUM5RCxXQUFHLEVBQUssR0FBRyxXQUFRO09BQ3BCLENBQUMsQ0FBQyxDQUFDOztBQUVKLHFCQUFlLENBQUM7ZUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7T0FBQSxDQUFDLENBQUM7O0FBRXBELFVBQUksQ0FBQyxZQUFNO0FBQ1QsWUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQ3BELGNBQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekIsWUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxDQUFDLENBQUM7T0FDM0QsQ0FBQyxDQUFDOztBQUVILGNBQVEsQ0FBQztlQUFNLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQztPQUFBLENBQUMsQ0FBQztBQUNqRSxVQUFJLENBQUM7ZUFBTSxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRTtPQUFBLENBQUMsQ0FBQzs7QUFFM0MsY0FBUSxDQUFDLFlBQU07QUFDYixlQUFPLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFDcEQsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7T0FDakYsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxZQUFNO0FBQ1QsWUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQ3BELGNBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMzRCxjQUFNLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JGLGNBQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO09BQzlCLENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsMENBQTBDLEVBQUUsWUFBTTtBQUNuRCxZQUFNLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7O0FBRXZFLDJCQUFHLGFBQWEsQ0FBQyxTQUFTLEdBQUcsT0FBTyxFQUFFLHVFQUF1RSxDQUFDLENBQUM7QUFDL0csMkJBQUcsYUFBYSxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQzlELFdBQUcsRUFBSyxHQUFHLFdBQVE7T0FDcEIsQ0FBQyxDQUFDLENBQUM7O0FBRUoscUJBQWUsQ0FBQztlQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztPQUFBLENBQUMsQ0FBQzs7QUFFcEQsVUFBSSxDQUFDLFlBQU07QUFDVCxZQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDcEQsY0FBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN4QixZQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsQ0FBQztPQUMzRCxDQUFDLENBQUM7O0FBRUgsY0FBUSxDQUFDO2VBQU0sZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDO09BQUEsQ0FBQyxDQUFDOztBQUVqRSxVQUFJLENBQUMsWUFBTTtBQUNULHdCQUFnQixDQUFDLGFBQWEsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO09BQzlFLENBQUMsQ0FBQzs7QUFFSCxjQUFRLENBQUMsWUFBTTtBQUNiLGVBQU8sZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxJQUNwRCxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztPQUNqRixDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLFlBQU07QUFDVCxZQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDcEQsY0FBTSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzNELGNBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3pGLGNBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztPQUM3QixDQUFDLENBQUM7S0FDSixDQUFDLENBQUM7O0FBRUgsTUFBRSxDQUFDLG1DQUFtQyxFQUFFLFlBQU07QUFDNUMsWUFBTSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUV2RSwyQkFBRyxhQUFhLENBQUMsU0FBUyxHQUFHLE9BQU8sRUFBRSx1RUFBdUUsQ0FBQyxDQUFDO0FBQy9HLDJCQUFHLGFBQWEsQ0FBQyxTQUFTLEdBQUcsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUM5RCxXQUFHLEVBQUssR0FBRyxXQUFRO09BQ3BCLENBQUMsQ0FBQyxDQUFDOztBQUVKLHFCQUFlLENBQUM7ZUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7T0FBQSxDQUFDLENBQUM7O0FBRXBELFVBQUksQ0FBQyxZQUFNO0FBQ1QsWUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQ3BELGNBQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekIsWUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxDQUFDLENBQUM7T0FDM0QsQ0FBQyxDQUFDOztBQUVILGNBQVEsQ0FBQztlQUFNLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQztPQUFBLENBQUMsQ0FBQzs7QUFFakUsVUFBSSxDQUFDLFlBQU07QUFDVCx3QkFBZ0IsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUNsRSxDQUFDLENBQUM7O0FBRUgsV0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUVoQixVQUFJLENBQUMsWUFBTTtBQUNULFlBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUNwRCxjQUFNLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQy9ELGNBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztPQUM3QixDQUFDLENBQUM7S0FDSixDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7O0FBRUgsVUFBUSxDQUFDLDBEQUEwRCxFQUFFLFlBQVk7QUFDL0UsTUFBRSxDQUFDLDJDQUEyQyxFQUFFLFlBQVk7QUFDMUQsWUFBTSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUV2RSwyQkFBRyxhQUFhLENBQUMsU0FBUyxHQUFHLGtCQUFrQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDOUQsV0FBRyxFQUFFLDRFQUE0RTtPQUNsRixDQUFDLENBQUMsQ0FBQzs7QUFFSixxQkFBZSxDQUFDO2VBQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUM7T0FBQSxDQUFDLENBQUM7O0FBRS9ELFVBQUksQ0FBQyxZQUFNO0FBQ1QsWUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQ3BELGNBQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUM1QixhQUFHLEVBQUUsYUFBYTtTQUNuQixDQUFDLENBQUMsQ0FBQztBQUNKLFlBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxDQUFDO09BQzNELENBQUMsQ0FBQzs7QUFFSCxjQUFRLENBQUMsWUFBTTtBQUNiLGVBQU8sZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUM7T0FDekQsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxZQUFNO0FBQ1QsWUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxDQUFDLENBQUM7T0FDM0QsQ0FBQyxDQUFDOztBQUVILFdBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFaEIsVUFBSSxDQUFDLFlBQU07QUFDVCxjQUFNLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDL0UsQ0FBQyxDQUFDO0tBQ0osQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDO0NBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6Ii9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQvc3BlYy9idWlsZC1jb25maXJtLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCB0ZW1wIGZyb20gJ3RlbXAnO1xuaW1wb3J0IG9zIGZyb20gJ29zJztcblxuZGVzY3JpYmUoJ0NvbmZpcm0nLCAoKSA9PiB7XG4gIGxldCBkaXJlY3RvcnkgPSBudWxsO1xuICBsZXQgd29ya3NwYWNlRWxlbWVudCA9IG51bGw7XG4gIGNvbnN0IGNhdCA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgPyAndHlwZScgOiAnY2F0JztcbiAgY29uc3Qgd2FpdFRpbWUgPSBwcm9jZXNzLmVudi5DSSA/IDI0MDAgOiAyMDA7XG4gIGNvbnN0IG9yaWdpbmFsSG9tZWRpckZuID0gb3MuaG9tZWRpcjtcblxuICB0ZW1wLnRyYWNrKCk7XG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgY29uc3QgY3JlYXRlZEhvbWVEaXIgPSB0ZW1wLm1rZGlyU3luYygnYXRvbS1idWlsZC1zcGVjLWhvbWUnKTtcbiAgICBvcy5ob21lZGlyID0gKCkgPT4gY3JlYXRlZEhvbWVEaXI7XG4gICAgZGlyZWN0b3J5ID0gZnMucmVhbHBhdGhTeW5jKHRlbXAubWtkaXJTeW5jKHsgcHJlZml4OiAnYXRvbS1idWlsZC1zcGVjLScgfSkpICsgJy8nO1xuICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbIGRpcmVjdG9yeSBdKTtcblxuICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQuYnVpbGRPblNhdmUnLCBmYWxzZSk7XG4gICAgYXRvbS5jb25maWcuc2V0KCdidWlsZC5wYW5lbFZpc2liaWxpdHknLCAnVG9nZ2xlJyk7XG4gICAgYXRvbS5jb25maWcuc2V0KCdidWlsZC5zYXZlT25CdWlsZCcsIGZhbHNlKTtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLm5vdGlmaWNhdGlvbk9uUmVmcmVzaCcsIHRydWUpO1xuXG4gICAgamFzbWluZS51bnNweSh3aW5kb3csICdzZXRUaW1lb3V0Jyk7XG4gICAgamFzbWluZS51bnNweSh3aW5kb3csICdjbGVhclRpbWVvdXQnKTtcblxuICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSk7XG4gICAgICB3b3Jrc3BhY2VFbGVtZW50LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnd2lkdGg6OTk5OXB4Jyk7XG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHdvcmtzcGFjZUVsZW1lbnQpO1xuICAgIH0pO1xuXG4gICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgIHJldHVybiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnYnVpbGQnKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICBmcy5yZW1vdmVTeW5jKGRpcmVjdG9yeSk7XG4gICAgb3MuaG9tZWRpciA9IG9yaWdpbmFsSG9tZWRpckZuO1xuICB9KTtcblxuICBkZXNjcmliZSgnd2hlbiB0aGUgdGV4dCBlZGl0b3IgaXMgbW9kaWZpZWQnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCBzaG93IHRoZSBzYXZlIGNvbmZpcm1hdGlvbicsICgpID0+IHtcbiAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZC1jb25maXJtJykpLm5vdC50b0V4aXN0KCk7XG5cbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZGlyZWN0b3J5ICsgJy5hdG9tLWJ1aWxkLmpzb24nLCBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGNtZDogJ2VjaG8gU3VycHJpc2luZyBpcyB0aGUgcGFzc2luZyBvZiB0aW1lIGJ1dCBub3Qgc28sIGFzIHRoZSB0aW1lIG9mIHBhc3NpbmcuJ1xuICAgICAgfSkpO1xuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2Uub3BlbignLmF0b20tYnVpbGQuanNvbicpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdoZWxsbyBrYW5zYXMnKTtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkLWNvbmZpcm0nKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdidG4tc3VjY2VzcycpKS50b0VxdWFsKHRydWUpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNhbmNlbCB0aGUgY29uZmlybSB3aW5kb3cgd2hlbiBwcmVzc2luZyBlc2NhcGUnLCAoKSA9PiB7XG4gICAgICBleHBlY3Qod29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQtY29uZmlybScpKS5ub3QudG9FeGlzdCgpO1xuXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGRpcmVjdG9yeSArICcuYXRvbS1idWlsZC5qc29uJywgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBjbWQ6ICdlY2hvIFN1cnByaXNpbmcgaXMgdGhlIHBhc3Npbmcgb2YgdGltZSBidXQgbm90IHNvLCBhcyB0aGUgdGltZSBvZiBwYXNzaW5nLidcbiAgICAgIH0pKTtcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLm9wZW4oJy5hdG9tLWJ1aWxkLmpzb24nKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnaGVsbG8ga2Fuc2FzJyk7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOnRyaWdnZXInKTtcbiAgICAgIH0pO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZC1jb25maXJtJykpO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6bm8tY29uZmlybScpO1xuICAgICAgICBleHBlY3Qod29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQtY29uZmlybScpKS5ub3QudG9FeGlzdCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIG5vdCBkbyBhbnl0aGluZyBpZiBpc3N1aW5nIG5vLWNvbmZpcm0gd2hpdGhvdXQgdGhlIGRpYWxvZycsICgpID0+IHtcbiAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZC1jb25maXJtJykpLm5vdC50b0V4aXN0KCk7XG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDpuby1jb25maXJtJyk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIG5vdCBjb25maXJtIGlmIGEgVGV4dEVkaXRvciBlZGl0cyBhbiB1bnNhdmVkIGZpbGUnLCAoKSA9PiB7XG4gICAgICBleHBlY3Qod29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQtY29uZmlybScpKS5ub3QudG9FeGlzdCgpO1xuXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGRpcmVjdG9yeSArICcuYXRvbS1idWlsZC5qc29uJywgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBjbWQ6ICdlY2hvIFN1cnByaXNpbmcgaXMgdGhlIHBhc3Npbmcgb2YgdGltZSBidXQgbm90IHNvLCBhcyB0aGUgdGltZSBvZiBwYXNzaW5nLidcbiAgICAgIH0pKTtcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCcuYXRvbS1idWlsZC5qc29uJyksXG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigpXG4gICAgICAgIF0pO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpLmZpbmQodGV4dEVkaXRvciA9PiB7XG4gICAgICAgICAgcmV0dXJuICgndW50aXRsZWQnID09PSB0ZXh0RWRpdG9yLmdldFRpdGxlKCkpO1xuICAgICAgICB9KTtcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ0p1c3Qgc29tZSB0ZW1wb3JhcnkgcGxhY2UgdG8gd3JpdGUgc3R1ZmYnKTtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpICYmXG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdzdWNjZXNzJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCcpKS50b0V4aXN0KCk7XG4gICAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy50ZXJtaW5hbCcpLnRlcm1pbmFsLmdldENvbnRlbnQoKSkudG9NYXRjaCgvU3VycHJpc2luZyBpcyB0aGUgcGFzc2luZyBvZiB0aW1lIGJ1dCBub3Qgc28sIGFzIHRoZSB0aW1lIG9mIHBhc3NpbmcvKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBzYXZlIGFuZCBidWlsZCB3aGVuIHNlbGVjdGluZyBzYXZlIGFuZCBidWlsZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZC1jb25maXJtJykpLm5vdC50b0V4aXN0KCk7XG5cbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZGlyZWN0b3J5ICsgJ2NhdG1lJywgJ1N1cnByaXNpbmcgaXMgdGhlIHBhc3Npbmcgb2YgdGltZSBidXQgbm90IHNvLCBhcyB0aGUgdGltZSBvZiBwYXNzaW5nLicpO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhkaXJlY3RvcnkgKyAnLmF0b20tYnVpbGQuanNvbicsIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgY21kOiBgJHtjYXR9IGNhdG1lYFxuICAgICAgfSkpO1xuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gYXRvbS53b3Jrc3BhY2Uub3BlbignY2F0bWUnKSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KCdrYW5zYXMnKTtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkLWNvbmZpcm0nKSk7XG4gICAgICBydW5zKCgpID0+IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuY2xpY2soKSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpICYmXG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdzdWNjZXNzJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkJykpLnRvRXhpc3QoKTtcbiAgICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC5vdXRwdXQnKS5pbm5lckhUTUwpLnRvTWF0Y2goL2thbnNhcy8pO1xuICAgICAgICBleHBlY3QoIWVkaXRvci5pc01vZGlmaWVkKCkpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGJ1aWxkIGJ1dCBub3Qgc2F2ZSB3aGVuIG9wdGluZyBzbycsICgpID0+IHtcbiAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZC1jb25maXJtJykpLm5vdC50b0V4aXN0KCk7XG5cbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZGlyZWN0b3J5ICsgJ2NhdG1lJywgJ1N1cnByaXNpbmcgaXMgdGhlIHBhc3Npbmcgb2YgdGltZSBidXQgbm90IHNvLCBhcyB0aGUgdGltZSBvZiBwYXNzaW5nLicpO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhkaXJlY3RvcnkgKyAnLmF0b20tYnVpbGQuanNvbicsIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgY21kOiBgJHtjYXR9IGNhdG1lYFxuICAgICAgfSkpO1xuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gYXRvbS53b3Jrc3BhY2Uub3BlbignY2F0bWUnKSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KCdjYXRtZScpO1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJyk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQtY29uZmlybScpKTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uW2NsaWNrPVwiY29uZmlybVdpdGhvdXRTYXZlXCJdJykuY2xpY2soKTtcbiAgICAgIH0pO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKSAmJlxuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpLmNsYXNzTGlzdC5jb250YWlucygnc3VjY2VzcycpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCcpKS50b0V4aXN0KCk7XG4gICAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAub3V0cHV0JykuaW5uZXJIVE1MKS5ub3QudG9NYXRjaCgva2Fuc2FzLyk7XG4gICAgICAgIGV4cGVjdChlZGl0b3IuaXNNb2RpZmllZCgpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBkbyBub3RoaW5nIHdoZW4gY2FuY2VsbGluZycsICgpID0+IHtcbiAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZC1jb25maXJtJykpLm5vdC50b0V4aXN0KCk7XG5cbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZGlyZWN0b3J5ICsgJ2NhdG1lJywgJ1N1cnByaXNpbmcgaXMgdGhlIHBhc3Npbmcgb2YgdGltZSBidXQgbm90IHNvLCBhcyB0aGUgdGltZSBvZiBwYXNzaW5nLicpO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhkaXJlY3RvcnkgKyAnLmF0b20tYnVpbGQuanNvbicsIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgY21kOiBgJHtjYXR9IGNhdG1lYFxuICAgICAgfSkpO1xuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gYXRvbS53b3Jrc3BhY2Uub3BlbignY2F0bWUnKSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KCdrYW5zYXMnKTtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkLWNvbmZpcm0nKSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbltjbGljaz1cImNhbmNlbFwiXScpLmNsaWNrKCk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHMod2FpdFRpbWUpO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgICBleHBlY3Qod29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQnKSkubm90LnRvRXhpc3QoKTtcbiAgICAgICAgZXhwZWN0KGVkaXRvci5pc01vZGlmaWVkKCkpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd3aGVuIGJ1aWxkIGlzIHRyaWdnZXJlZCB3aXRob3V0IGFuc3dlcmluZyBjb25maXJtIGRpYWxvZycsIGZ1bmN0aW9uICgpIHtcbiAgICBpdCgnc2hvdWxkIG9ubHkga2VlcCBhdCBtYXhpbXVtIDEgZGlhbG9nIG9wZW4nLCBmdW5jdGlvbiAoKSB7XG4gICAgICBleHBlY3Qod29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQtY29uZmlybScpKS5ub3QudG9FeGlzdCgpO1xuXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGRpcmVjdG9yeSArICcuYXRvbS1idWlsZC5qc29uJywgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBjbWQ6ICdlY2hvIFN1cnByaXNpbmcgaXMgdGhlIHBhc3Npbmcgb2YgdGltZSBidXQgbm90IHNvLCBhcyB0aGUgdGltZSBvZiBwYXNzaW5nLidcbiAgICAgIH0pKTtcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IGF0b20ud29ya3NwYWNlLm9wZW4oJy5hdG9tLWJ1aWxkLmpzb24nKSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICBjbWQ6ICdlY2hvIGthbnNhcydcbiAgICAgICAgfSkpO1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJyk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQtY29uZmlybScpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJyk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHMod2FpdFRpbWUpOyAvLyBFdmVyeXRoaW5nIGlzIHRoZSBzYW1lIHNvIHdlIGNhbid0IGtub3cgd2hlbiBzZWNvbmQgYnVpbGQ6dHJpZ2dlciBoYXMgYmVlbiBoYW5kbGVkXG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBleHBlY3Qod29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYnVpbGQtY29uZmlybScpLmxlbmd0aCkudG9FcXVhbCgxKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIl19
//# sourceURL=/home/takaaki/.atom/packages/build/spec/build-confirm-spec.js
