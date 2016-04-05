(function() {
  var $, Figlet, figlet;

  $ = require('atom-space-pen-views').$;

  Figlet = require('../lib/figlet');

  figlet = require('figlet');

  describe("Figlet", function() {
    var editor, editorElement, figletModule, fonts, list, promise, strip, workspaceElement, _ref;
    _ref = [], workspaceElement = _ref[0], editorElement = _ref[1], editor = _ref[2], promise = _ref[3], fonts = _ref[4], list = _ref[5], figletModule = _ref[6];
    strip = function(s) {
      return s.split('\n').map(function(l) {
        return l.replace(/\s+$/, '');
      }).filter(function(l) {
        return l.length > 0;
      }).join('\n');
    };
    beforeEach(function() {
      atom.config.set('figlet.defaultFont', 'Banner');
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-javascript');
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-html');
      });
      waitsForPromise(function() {
        return atom.workspace.open('sample.js').then(function(e) {
          editor = e;
          editorElement = atom.views.getView(editor);
          return editor.setText("dummy");
        });
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('figlet').then(function(pkg) {
          return figletModule = pkg.mainModule;
        });
      });
      runs(function() {
        return figlet.fonts(function(err, data) {
          return fonts = data;
        });
      });
      return waitsFor(function() {
        return fonts;
      });
    });
    describe('when figlet:last-convert is triggered', function() {
      it('converts the selection using the default font', function() {
        var expected;
        expected = null;
        editor.setSelectedBufferRange([[0, 0], [0, 5]]);
        atom.commands.dispatch(editorElement, 'figlet:convert-last');
        waitsFor(function() {
          return editor.getText() !== 'dummy';
        });
        runs(function() {
          return figlet.text('dummy', {
            font: 'Banner'
          }, function(err, data) {
            return expected = data;
          });
        });
        waitsFor(function() {
          return expected;
        });
        return runs(function() {
          list = workspaceElement.querySelector('.figlet-font-list');
          expect(editor.getText()).toEqual(strip(expected));
          return expect(list).not.toExist();
        });
      });
      it('converts the selection using the module last font', function() {
        var expected;
        expected = null;
        figletModule.lastFont = 'Banner3';
        editor.setSelectedBufferRange([[0, 0], [0, 5]]);
        atom.commands.dispatch(editorElement, 'figlet:convert-last');
        waitsFor(function() {
          return editor.getText() !== 'dummy';
        });
        runs(function() {
          return figlet.text('dummy', {
            font: 'Banner3'
          }, function(err, data) {
            return expected = data;
          });
        });
        waitsFor(function() {
          return expected;
        });
        return runs(function() {
          list = workspaceElement.querySelector('.figlet-font-list');
          expect(editor.getText()).toEqual(strip(expected));
          return expect(list).not.toExist();
        });
      });
      it('preserves the indentation when the selection does not contains it', function() {
        var expected;
        editor.setText("  dummy");
        expected = null;
        figletModule.lastFont = 'Banner3';
        editor.setSelectedBufferRange([[0, 2], [0, 7]]);
        atom.commands.dispatch(editorElement, 'figlet:convert-last');
        waitsFor(function() {
          return editor.getText() !== 'dummy';
        });
        runs(function() {
          return figlet.text('dummy', {
            font: 'Banner3'
          }, function(err, data) {
            return expected = "  " + data.replace(/\n/g, '\n  ');
          });
        });
        waitsFor(function() {
          return expected;
        });
        return runs(function() {
          list = workspaceElement.querySelector('.figlet-font-list');
          expect(editor.getText()).toEqual(strip(expected));
          return expect(list).not.toExist();
        });
      });
      it('preserves the indentation when the selection contains it', function() {
        var expected;
        editor.setText("  dummy");
        expected = null;
        figletModule.lastFont = 'Banner3';
        editor.setSelectedBufferRange([[0, 0], [0, 7]]);
        atom.commands.dispatch(editorElement, 'figlet:convert-last');
        waitsFor(function() {
          return editor.getText() !== 'dummy';
        });
        runs(function() {
          return figlet.text('dummy', {
            font: 'Banner3'
          }, function(err, data) {
            return expected = "  " + data.replace(/\n/g, '\n  ');
          });
        });
        waitsFor(function() {
          return expected;
        });
        return runs(function() {
          list = workspaceElement.querySelector('.figlet-font-list');
          expect(editor.getText()).toEqual(strip(expected));
          return expect(list).not.toExist();
        });
      });
      it('preserves the comments when the selection does not contains it', function() {
        var expected;
        editor.setText("  // dummy");
        expected = null;
        figletModule.lastFont = 'Banner3';
        editor.setSelectedBufferRange([[0, 5], [0, 10]]);
        atom.commands.dispatch(editorElement, 'figlet:convert-last');
        waitsFor(function() {
          return editor.getText() !== 'dummy';
        });
        runs(function() {
          return figlet.text('dummy', {
            font: 'Banner3'
          }, function(err, data) {
            return expected = "  // " + data.replace(/\n/g, '\n  // ');
          });
        });
        waitsFor(function() {
          return expected;
        });
        return runs(function() {
          list = workspaceElement.querySelector('.figlet-font-list');
          expect(editor.getText()).toEqual(strip(expected));
          return expect(list).not.toExist();
        });
      });
      it('preserves the comments when the selection contains it', function() {
        var expected;
        editor.setText("  // dummy");
        expected = null;
        figletModule.lastFont = 'Banner3';
        editor.setSelectedBufferRange([[0, 0], [0, 10]]);
        atom.commands.dispatch(editorElement, 'figlet:convert-last');
        waitsFor(function() {
          return editor.getText() !== 'dummy';
        });
        runs(function() {
          return figlet.text('dummy', {
            font: 'Banner3'
          }, function(err, data) {
            return expected = "  // " + data.replace(/\n/g, '\n  // ');
          });
        });
        waitsFor(function() {
          return expected;
        });
        return runs(function() {
          list = workspaceElement.querySelector('.figlet-font-list');
          expect(editor.getText()).toEqual(strip(expected));
          return expect(list).not.toExist();
        });
      });
      return it('preserves every additional comment character and spaces before a word', function() {
        var expected;
        editor.setText("  //    dummy");
        expected = null;
        figletModule.lastFont = 'Banner3';
        editor.setSelectedBufferRange([[0, 0], [0, 15]]);
        atom.commands.dispatch(editorElement, 'figlet:convert-last');
        waitsFor(function() {
          return editor.getText() !== 'dummy';
        });
        runs(function() {
          return figlet.text('dummy', {
            font: 'Banner3'
          }, function(err, data) {
            return expected = "  //    " + data.replace(/\n/g, '\n  //    ');
          });
        });
        waitsFor(function() {
          return expected;
        });
        return runs(function() {
          list = workspaceElement.querySelector('.figlet-font-list');
          expect(editor.getText()).toEqual(strip(expected));
          return expect(list).not.toExist();
        });
      });
    });
    return describe('when figlet:convert is triggered', function() {
      describe('with no selection', function() {
        return it('does not display the font selection list', function() {
          atom.commands.dispatch(editorElement, 'figlet:convert');
          list = workspaceElement.querySelector('.figlet-font-list');
          return expect(list).not.toExist();
        });
      });
      return describe('with a selection', function() {
        beforeEach(function() {
          figletModule.lastFont = null;
          editor.setSelectedBufferRange([[0, 0], [0, 5]]);
          atom.commands.dispatch(editorElement, 'figlet:convert');
          return list = workspaceElement.querySelector('.figlet-font-list');
        });
        it('displays the font selection list', function() {
          expect(list).toExist();
          expect(list.querySelectorAll('li').length).toEqual(fonts.length);
          return expect(list.querySelector('li.selected')).toExist();
        });
        return describe('when confirmed', function() {
          return it('replaces the text with the ascii art version', function(done) {
            var expected;
            Figlet.figletView.confirmed({
              name: 'Banner3'
            });
            expected = null;
            waitsFor(function() {
              return editor.getText() !== 'dummy';
            });
            runs(function() {
              return figlet.text('dummy', {
                font: 'Banner3'
              }, function(err, data) {
                return expected = data;
              });
            });
            waitsFor(function() {
              return expected;
            });
            return runs(function() {
              list = workspaceElement.querySelector('.figlet-font-list');
              expect(editor.getText()).toEqual(strip(expected));
              expect(list).not.toExist();
              return expect(figletModule.lastFont).toEqual('Banner3');
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9maWdsZXQvc3BlYy9maWdsZXQtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaUJBQUE7O0FBQUEsRUFBQyxJQUFLLE9BQUEsQ0FBUSxzQkFBUixFQUFMLENBQUQsQ0FBQTs7QUFBQSxFQUNBLE1BQUEsR0FBUyxPQUFBLENBQVEsZUFBUixDQURULENBQUE7O0FBQUEsRUFFQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVIsQ0FGVCxDQUFBOztBQUFBLEVBU0EsUUFBQSxDQUFTLFFBQVQsRUFBbUIsU0FBQSxHQUFBO0FBQ2pCLFFBQUEsd0ZBQUE7QUFBQSxJQUFBLE9BQWdGLEVBQWhGLEVBQUMsMEJBQUQsRUFBbUIsdUJBQW5CLEVBQWtDLGdCQUFsQyxFQUEwQyxpQkFBMUMsRUFBbUQsZUFBbkQsRUFBMEQsY0FBMUQsRUFBZ0Usc0JBQWhFLENBQUE7QUFBQSxJQUVBLEtBQUEsR0FBUSxTQUFDLENBQUQsR0FBQTthQUNOLENBQUMsQ0FBQyxLQUFGLENBQVEsSUFBUixDQUFhLENBQUMsR0FBZCxDQUFrQixTQUFDLENBQUQsR0FBQTtlQUFPLENBQUMsQ0FBQyxPQUFGLENBQVUsTUFBVixFQUFrQixFQUFsQixFQUFQO01BQUEsQ0FBbEIsQ0FBK0MsQ0FBQyxNQUFoRCxDQUF1RCxTQUFDLENBQUQsR0FBQTtlQUFPLENBQUMsQ0FBQyxNQUFGLEdBQVcsRUFBbEI7TUFBQSxDQUF2RCxDQUEyRSxDQUFDLElBQTVFLENBQWlGLElBQWpGLEVBRE07SUFBQSxDQUZSLENBQUE7QUFBQSxJQUtBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixvQkFBaEIsRUFBc0MsUUFBdEMsQ0FBQSxDQUFBO0FBQUEsTUFFQSxn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

//# sourceURL=/home/takaaki/.atom/packages/figlet/spec/figlet-spec.coffee
