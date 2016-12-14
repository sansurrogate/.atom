function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

require('./helpers/workspace');

var _libMinimap = require('../lib/minimap');

var _libMinimap2 = _interopRequireDefault(_libMinimap);

'use babel';

describe('Minimap package', function () {
  var _ref = [];
  var editor = _ref[0];
  var minimap = _ref[1];
  var editorElement = _ref[2];
  var minimapElement = _ref[3];
  var workspaceElement = _ref[4];
  var minimapPackage = _ref[5];

  beforeEach(function () {
    atom.config.set('minimap.autoToggle', true);

    workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);

    waitsForPromise(function () {
      return atom.workspace.open('sample.coffee');
    });

    waitsForPromise(function () {
      return atom.packages.activatePackage('minimap').then(function (pkg) {
        minimapPackage = pkg.mainModule;
      });
    });

    waitsFor(function () {
      return workspaceElement.querySelector('atom-text-editor');
    });

    runs(function () {
      editor = atom.workspace.getActiveTextEditor();
      editorElement = atom.views.getView(editor);
    });

    waitsFor(function () {
      return workspaceElement.querySelector('atom-text-editor::shadow atom-text-editor-minimap');
    });
  });

  it('registers the minimap views provider', function () {
    var textEditor = atom.workspace.buildTextEditor({});
    minimap = new _libMinimap2['default']({ textEditor: textEditor });
    minimapElement = atom.views.getView(minimap);

    expect(minimapElement).toExist();
  });

  describe('when an editor is opened', function () {
    it('creates a minimap model for the editor', function () {
      expect(minimapPackage.minimapForEditor(editor)).toBeDefined();
    });

    it('attaches a minimap element to the editor view', function () {
      expect(editorElement.shadowRoot.querySelector('atom-text-editor-minimap')).toExist();
    });

    describe('when the package is deactivated', function () {
      beforeEach(function () {
        atom.packages.deactivatePackage('minimap');
      });
      it('removes the minimap from their editor parent', function () {
        expect(editorElement.shadowRoot.querySelector('atom-text-editor-minimap')).not.toExist();
      });

      describe('and reactivated with a remaining minimap in the DOM', function () {
        beforeEach(function () {
          var m = new _libMinimap2['default']({ textEditor: editor });
          var v = atom.views.getView(m);
          editorElement.shadowRoot.appendChild(v);
          waitsForPromise(function () {
            return atom.packages.activatePackage('minimap');
          });
        });

        it('removes the remaining minimap', function () {
          expect(editorElement.shadowRoot.querySelectorAll('atom-text-editor-minimap').length).toEqual(1);
        });
      });
    });
  });

  describe('::observeMinimaps', function () {
    var _ref2 = [];
    var spy = _ref2[0];

    beforeEach(function () {
      spy = jasmine.createSpy('observeMinimaps');
      minimapPackage.observeMinimaps(spy);
    });

    it('calls the callback with the existing minimaps', function () {
      expect(spy).toHaveBeenCalled();
    });

    it('calls the callback when a new editor is opened', function () {
      waitsForPromise(function () {
        return atom.workspace.open('other-sample.js');
      });

      runs(function () {
        expect(spy.calls.length).toEqual(2);
      });
    });
  });

  describe('::deactivate', function () {
    beforeEach(function () {
      minimapPackage.deactivate();
    });

    it('destroys all the minimap models', function () {
      expect(minimapPackage.editorsMinimaps).toBeUndefined();
    });

    it('destroys all the minimap elements', function () {
      expect(editorElement.shadowRoot.querySelector('atom-text-editor-minimap')).not.toExist();
    });
  });

  describe('service', function () {
    it('returns the minimap main module', function () {
      expect(minimapPackage.provideMinimapServiceV1()).toEqual(minimapPackage);
    });

    it('creates standalone minimap with provided text editor', function () {
      var textEditor = atom.workspace.buildTextEditor({});
      var standaloneMinimap = minimapPackage.standAloneMinimapForEditor(textEditor);
      expect(standaloneMinimap.getTextEditor()).toEqual(textEditor);
    });
  });

  //    ########  ##       ##     ##  ######   #### ##    ##  ######
  //    ##     ## ##       ##     ## ##    ##   ##  ###   ## ##    ##
  //    ##     ## ##       ##     ## ##         ##  ####  ## ##
  //    ########  ##       ##     ## ##   ####  ##  ## ## ##  ######
  //    ##        ##       ##     ## ##    ##   ##  ##  ####       ##
  //    ##        ##       ##     ## ##    ##   ##  ##   ### ##    ##
  //    ##        ########  #######   ######   #### ##    ##  ######

  describe('plugins', function () {
    var _ref3 = [];
    var registerHandler = _ref3[0];
    var unregisterHandler = _ref3[1];
    var plugin = _ref3[2];

    describe('when the displayPluginsControls setting is enabled', function () {
      beforeEach(function () {
        atom.config.set('minimap.displayPluginsControls', true);
        atom.config.set('minimap.plugins.dummy', undefined);

        plugin = {
          active: false,
          activatePlugin: function activatePlugin() {
            this.active = true;
          },
          deactivatePlugin: function deactivatePlugin() {
            this.active = false;
          },
          isActive: function isActive() {
            return this.active;
          }
        };

        spyOn(plugin, 'activatePlugin').andCallThrough();
        spyOn(plugin, 'deactivatePlugin').andCallThrough();

        registerHandler = jasmine.createSpy('register handler');
        unregisterHandler = jasmine.createSpy('unregister handler');
      });

      describe('when registered', function () {
        beforeEach(function () {
          minimapPackage.onDidAddPlugin(registerHandler);
          minimapPackage.onDidRemovePlugin(unregisterHandler);
          minimapPackage.registerPlugin('dummy', plugin);
        });

        it('makes the plugin available in the minimap', function () {
          expect(minimapPackage.plugins['dummy']).toBe(plugin);
        });

        it('emits an event', function () {
          expect(registerHandler).toHaveBeenCalled();
        });

        it('creates a default config for the plugin', function () {
          expect(minimapPackage.getConfigSchema().plugins.properties.dummy).toBeDefined();
          expect(minimapPackage.getConfigSchema().plugins.properties.dummyDecorationsZIndex).toBeDefined();
        });

        it('sets the corresponding config', function () {
          expect(atom.config.get('minimap.plugins.dummy')).toBeTruthy();
          expect(atom.config.get('minimap.plugins.dummyDecorationsZIndex')).toEqual(0);
        });

        describe('triggering the corresponding plugin command', function () {
          beforeEach(function () {
            atom.commands.dispatch(workspaceElement, 'minimap:toggle-dummy');
          });

          it('receives a deactivation call', function () {
            expect(plugin.deactivatePlugin).toHaveBeenCalled();
          });
        });

        describe('and then unregistered', function () {
          beforeEach(function () {
            minimapPackage.unregisterPlugin('dummy');
          });

          it('has been unregistered', function () {
            expect(minimapPackage.plugins['dummy']).toBeUndefined();
          });

          it('emits an event', function () {
            expect(unregisterHandler).toHaveBeenCalled();
          });

          describe('when the config is modified', function () {
            beforeEach(function () {
              atom.config.set('minimap.plugins.dummy', false);
            });

            it('does not activates the plugin', function () {
              expect(plugin.deactivatePlugin).not.toHaveBeenCalled();
            });
          });
        });

        describe('on minimap deactivation', function () {
          beforeEach(function () {
            expect(plugin.active).toBeTruthy();
            minimapPackage.deactivate();
          });

          it('deactivates all the plugins', function () {
            expect(plugin.active).toBeFalsy();
          });
        });
      });

      describe('when the config for it is false', function () {
        beforeEach(function () {
          atom.config.set('minimap.plugins.dummy', false);
          minimapPackage.registerPlugin('dummy', plugin);
        });

        it('does not receive an activation call', function () {
          expect(plugin.activatePlugin).not.toHaveBeenCalled();
        });
      });

      describe('the registered plugin', function () {
        beforeEach(function () {
          minimapPackage.registerPlugin('dummy', plugin);
        });

        it('receives an activation call', function () {
          expect(plugin.activatePlugin).toHaveBeenCalled();
        });

        it('activates the plugin', function () {
          expect(plugin.active).toBeTruthy();
        });

        describe('when the config is modified after registration', function () {
          beforeEach(function () {
            atom.config.set('minimap.plugins.dummy', false);
          });

          it('receives a deactivation call', function () {
            expect(plugin.deactivatePlugin).toHaveBeenCalled();
          });
        });
      });
    });

    describe('when the displayPluginsControls setting is disabled', function () {
      beforeEach(function () {
        atom.config.set('minimap.displayPluginsControls', false);
        atom.config.set('minimap.plugins.dummy', undefined);

        plugin = {
          active: false,
          activatePlugin: function activatePlugin() {
            this.active = true;
          },
          deactivatePlugin: function deactivatePlugin() {
            this.active = false;
          },
          isActive: function isActive() {
            return this.active;
          }
        };

        spyOn(plugin, 'activatePlugin').andCallThrough();
        spyOn(plugin, 'deactivatePlugin').andCallThrough();

        registerHandler = jasmine.createSpy('register handler');
        unregisterHandler = jasmine.createSpy('unregister handler');
      });

      describe('when registered', function () {
        beforeEach(function () {
          minimapPackage.onDidAddPlugin(registerHandler);
          minimapPackage.onDidRemovePlugin(unregisterHandler);
          minimapPackage.registerPlugin('dummy', plugin);
        });

        it('makes the plugin available in the minimap', function () {
          expect(minimapPackage.plugins['dummy']).toBe(plugin);
        });

        it('emits an event', function () {
          expect(registerHandler).toHaveBeenCalled();
        });

        it('still activates the package', function () {
          expect(plugin.isActive()).toBeTruthy();
        });

        describe('and then unregistered', function () {
          beforeEach(function () {
            minimapPackage.unregisterPlugin('dummy');
          });

          it('has been unregistered', function () {
            expect(minimapPackage.plugins['dummy']).toBeUndefined();
          });

          it('emits an event', function () {
            expect(unregisterHandler).toHaveBeenCalled();
          });
        });

        describe('on minimap deactivation', function () {
          beforeEach(function () {
            expect(plugin.active).toBeTruthy();
            minimapPackage.deactivate();
          });

          it('deactivates all the plugins', function () {
            expect(plugin.active).toBeFalsy();
          });
        });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9zcGVjL21pbmltYXAtbWFpbi1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O1FBRU8scUJBQXFCOzswQkFDUixnQkFBZ0I7Ozs7QUFIcEMsV0FBVyxDQUFBOztBQUtYLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxZQUFNO2FBQ3lELEVBQUU7TUFBdEYsTUFBTTtNQUFFLE9BQU87TUFBRSxhQUFhO01BQUUsY0FBYztNQUFFLGdCQUFnQjtNQUFFLGNBQWM7O0FBRXJGLFlBQVUsQ0FBQyxZQUFNO0FBQ2YsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUE7O0FBRTNDLG9CQUFnQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUNyRCxXQUFPLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUE7O0FBRXJDLG1CQUFlLENBQUMsWUFBTTtBQUNwQixhQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFBO0tBQzVDLENBQUMsQ0FBQTs7QUFFRixtQkFBZSxDQUFDLFlBQU07QUFDcEIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxHQUFHLEVBQUs7QUFDNUQsc0JBQWMsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFBO09BQ2hDLENBQUMsQ0FBQTtLQUNILENBQUMsQ0FBQTs7QUFFRixZQUFRLENBQUMsWUFBTTtBQUNiLGFBQU8sZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFDLENBQUE7S0FDMUQsQ0FBQyxDQUFBOztBQUVGLFFBQUksQ0FBQyxZQUFNO0FBQ1QsWUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQTtBQUM3Qyxt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LFlBQU07QUFDekIsa0JBQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUE7V0FDN0MsQ0FBQyxDQUFBO1NBQ0gsQ0FBQyxDQUFBOztBQUVGLGdCQUFRLENBQUMseUJBQXlCLEVBQUUsWUFBTTtBQUN4QyxvQkFBVSxDQUFDLFlBQU07QUFDZixrQkFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQTtBQUNsQywwQkFBYyxDQUFDLFVBQVUsRUFBRSxDQUFBO1dBQzVCLENBQUMsQ0FBQTs7QUFFRixZQUFFLENBQUMsNkJBQTZCLEVBQUUsWUFBTTtBQUN0QyxrQkFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQTtXQUNsQyxDQUFDLENBQUE7U0FDSCxDQUFDLENBQUE7T0FDSCxDQUFDLENBQUE7S0FDSCxDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL3NwZWMvbWluaW1hcC1tYWluLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgJy4vaGVscGVycy93b3Jrc3BhY2UnXG5pbXBvcnQgTWluaW1hcCBmcm9tICcuLi9saWIvbWluaW1hcCdcblxuZGVzY3JpYmUoJ01pbmltYXAgcGFja2FnZScsICgpID0+IHtcbiAgbGV0IFtlZGl0b3IsIG1pbmltYXAsIGVkaXRvckVsZW1lbnQsIG1pbmltYXBFbGVtZW50LCB3b3Jrc3BhY2VFbGVtZW50LCBtaW5pbWFwUGFja2FnZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5hdXRvVG9nZ2xlJywgdHJ1ZSlcblxuICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgamFzbWluZS5hdHRhY2hUb0RPTSh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5vcGVuKCdzYW1wbGUuY29mZmVlJylcbiAgICB9KVxuXG4gICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgIHJldHVybiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbWluaW1hcCcpLnRoZW4oKHBrZykgPT4ge1xuICAgICAgICBtaW5pbWFwUGFja2FnZSA9IHBrZy5tYWluTW9kdWxlXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdhdG9tLXRleHQtZWRpdG9yJylcbiAgICB9KVxuXG4gICAgcnVucygoKSA9PiB7XG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgIH0pXG5cbiAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdhdG9tLXRleHQtZWRpdG9yOjpzaGFkb3cgYXRvbS10ZXh0LWVkaXRvci1taW5pbWFwJylcbiAgICB9KVxuICB9KVxuXG4gIGl0KCdyZWdpc3RlcnMgdGhlIG1pbmltYXAgdmlld3MgcHJvdmlkZXInLCAoKSA9PiB7XG4gICAgbGV0IHRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3Ioe30pXG4gICAgbWluaW1hcCA9IG5ldyBNaW5pbWFwKHt0ZXh0RWRpdG9yfSlcbiAgICBtaW5pbWFwRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhtaW5pbWFwKVxuXG4gICAgZXhwZWN0KG1pbmltYXBFbGVtZW50KS50b0V4aXN0KClcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiBhbiBlZGl0b3IgaXMgb3BlbmVkJywgKCkgPT4ge1xuICAgIGl0KCdjcmVhdGVzIGEgbWluaW1hcCBtb2RlbCBmb3IgdGhlIGVkaXRvcicsICgpID0+IHtcbiAgICAgIGV4cGVjdChtaW5pbWFwUGFja2FnZS5taW5pbWFwRm9yRWRpdG9yKGVkaXRvcikpLnRvQmVEZWZpbmVkKClcbiAgICB9KVxuXG4gICAgaXQoJ2F0dGFjaGVzIGEgbWluaW1hcCBlbGVtZW50IHRvIHRoZSBlZGl0b3IgdmlldycsICgpID0+IHtcbiAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignYXRvbS10ZXh0LWVkaXRvci1taW5pbWFwJykpLnRvRXhpc3QoKVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiB0aGUgcGFja2FnZSBpcyBkZWFjdGl2YXRlZCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKCdtaW5pbWFwJylcbiAgICAgIH0pXG4gICAgICBpdCgncmVtb3ZlcyB0aGUgbWluaW1hcCBmcm9tIHRoZWlyIGVkaXRvciBwYXJlbnQnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignYXRvbS10ZXh0LWVkaXRvci1taW5pbWFwJykpLm5vdC50b0V4aXN0KClcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdhbmQgcmVhY3RpdmF0ZWQgd2l0aCBhIHJlbWFpbmluZyBtaW5pbWFwIGluIHRoZSBET00nLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG0gPSBuZXcgTWluaW1hcCh7dGV4dEVkaXRvcjogZWRpdG9yfSlcbiAgICAgICAgICBjb25zdCB2ID0gYXRvbS52aWV3cy5nZXRWaWV3KG0pXG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zaGFkb3dSb290LmFwcGVuZENoaWxkKHYpXG4gICAgICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdtaW5pbWFwJykpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3JlbW92ZXMgdGhlIHJlbWFpbmluZyBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvckFsbCgnYXRvbS10ZXh0LWVkaXRvci1taW5pbWFwJykubGVuZ3RoKS50b0VxdWFsKDEpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJzo6b2JzZXJ2ZU1pbmltYXBzJywgKCkgPT4ge1xuICAgIGxldCBbc3B5XSA9IFtdXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBzcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnb2JzZXJ2ZU1pbmltYXBzJylcbiAgICAgIG1pbmltYXBQYWNrYWdlLm9ic2VydmVNaW5pbWFwcyhzcHkpXG4gICAgfSlcblxuICAgIGl0KCdjYWxscyB0aGUgY2FsbGJhY2sgd2l0aCB0aGUgZXhpc3RpbmcgbWluaW1hcHMnLCAoKSA9PiB7XG4gICAgICBleHBlY3Qoc3B5KS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICB9KVxuXG4gICAgaXQoJ2NhbGxzIHRoZSBjYWxsYmFjayB3aGVuIGEgbmV3IGVkaXRvciBpcyBvcGVuZWQnLCAoKSA9PiB7XG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4geyByZXR1cm4gYXRvbS53b3Jrc3BhY2Uub3Blbignb3RoZXItc2FtcGxlLmpzJykgfSlcblxuICAgICAgcnVucygoKSA9PiB7IGV4cGVjdChzcHkuY2FsbHMubGVuZ3RoKS50b0VxdWFsKDIpIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnOjpkZWFjdGl2YXRlJywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgbWluaW1hcFBhY2thZ2UuZGVhY3RpdmF0ZSgpXG4gICAgfSlcblxuICAgIGl0KCdkZXN0cm95cyBhbGwgdGhlIG1pbmltYXAgbW9kZWxzJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KG1pbmltYXBQYWNrYWdlLmVkaXRvcnNNaW5pbWFwcykudG9CZVVuZGVmaW5lZCgpXG4gICAgfSlcblxuICAgIGl0KCdkZXN0cm95cyBhbGwgdGhlIG1pbmltYXAgZWxlbWVudHMnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2F0b20tdGV4dC1lZGl0b3ItbWluaW1hcCcpKS5ub3QudG9FeGlzdCgpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnc2VydmljZScsICgpID0+IHtcbiAgICBpdCgncmV0dXJucyB0aGUgbWluaW1hcCBtYWluIG1vZHVsZScsICgpID0+IHtcbiAgICAgIGV4cGVjdChtaW5pbWFwUGFja2FnZS5wcm92aWRlTWluaW1hcFNlcnZpY2VWMSgpKS50b0VxdWFsKG1pbmltYXBQYWNrYWdlKVxuICAgIH0pXG5cbiAgICBpdCgnY3JlYXRlcyBzdGFuZGFsb25lIG1pbmltYXAgd2l0aCBwcm92aWRlZCB0ZXh0IGVkaXRvcicsICgpID0+IHtcbiAgICAgIGxldCB0ZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuYnVpbGRUZXh0RWRpdG9yKHt9KVxuICAgICAgbGV0IHN0YW5kYWxvbmVNaW5pbWFwID0gbWluaW1hcFBhY2thZ2Uuc3RhbmRBbG9uZU1pbmltYXBGb3JFZGl0b3IodGV4dEVkaXRvcilcbiAgICAgIGV4cGVjdChzdGFuZGFsb25lTWluaW1hcC5nZXRUZXh0RWRpdG9yKCkpLnRvRXF1YWwodGV4dEVkaXRvcilcbiAgICB9KVxuICB9KVxuXG4gIC8vICAgICMjIyMjIyMjICAjIyAgICAgICAjIyAgICAgIyMgICMjIyMjIyAgICMjIyMgIyMgICAgIyMgICMjIyMjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjICMjICAgICMjICAgIyMgICMjIyAgICMjICMjICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICAgICAjIyAgIyMjIyAgIyMgIyNcbiAgLy8gICAgIyMjIyMjIyMgICMjICAgICAgICMjICAgICAjIyAjIyAgICMjIyMgICMjICAjIyAjIyAjIyAgIyMjIyMjXG4gIC8vICAgICMjICAgICAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgIyMgICAjIyAgIyMgICMjIyMgICAgICAgIyNcbiAgLy8gICAgIyMgICAgICAgICMjICAgICAgICMjICAgICAjIyAjIyAgICAjIyAgICMjICAjIyAgICMjIyAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgICAgIyMjIyMjIyMgICMjIyMjIyMgICAjIyMjIyMgICAjIyMjICMjICAgICMjICAjIyMjIyNcblxuICBkZXNjcmliZSgncGx1Z2lucycsICgpID0+IHtcbiAgICBsZXQgW3JlZ2lzdGVySGFuZGxlciwgdW5yZWdpc3RlckhhbmRsZXIsIHBsdWdpbl0gPSBbXVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gdGhlIGRpc3BsYXlQbHVnaW5zQ29udHJvbHMgc2V0dGluZyBpcyBlbmFibGVkJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzJywgdHJ1ZSlcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnBsdWdpbnMuZHVtbXknLCB1bmRlZmluZWQpXG5cbiAgICAgICAgcGx1Z2luID0ge1xuICAgICAgICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgICAgICAgYWN0aXZhdGVQbHVnaW4gKCkgeyB0aGlzLmFjdGl2ZSA9IHRydWUgfSxcbiAgICAgICAgICBkZWFjdGl2YXRlUGx1Z2luICgpIHsgdGhpcy5hY3RpdmUgPSBmYWxzZSB9LFxuICAgICAgICAgIGlzQWN0aXZlICgpIHsgcmV0dXJuIHRoaXMuYWN0aXZlIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNweU9uKHBsdWdpbiwgJ2FjdGl2YXRlUGx1Z2luJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICBzcHlPbihwbHVnaW4sICdkZWFjdGl2YXRlUGx1Z2luJykuYW5kQ2FsbFRocm91Z2goKVxuXG4gICAgICAgIHJlZ2lzdGVySGFuZGxlciA9IGphc21pbmUuY3JlYXRlU3B5KCdyZWdpc3RlciBoYW5kbGVyJylcbiAgICAgICAgdW5yZWdpc3RlckhhbmRsZXIgPSBqYXNtaW5lLmNyZWF0ZVNweSgndW5yZWdpc3RlciBoYW5kbGVyJylcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHJlZ2lzdGVyZWQnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIG1pbmltYXBQYWNrYWdlLm9uRGlkQWRkUGx1Z2luKHJlZ2lzdGVySGFuZGxlcilcbiAgICAgICAgICBtaW5pbWFwUGFja2FnZS5vbkRpZFJlbW92ZVBsdWdpbih1bnJlZ2lzdGVySGFuZGxlcilcbiAgICAgICAgICBtaW5pbWFwUGFja2FnZS5yZWdpc3RlclBsdWdpbignZHVtbXknLCBwbHVnaW4pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ21ha2VzIHRoZSBwbHVnaW4gYXZhaWxhYmxlIGluIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChtaW5pbWFwUGFja2FnZS5wbHVnaW5zWydkdW1teSddKS50b0JlKHBsdWdpbilcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnZW1pdHMgYW4gZXZlbnQnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHJlZ2lzdGVySGFuZGxlcikudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2NyZWF0ZXMgYSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIHBsdWdpbicsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QobWluaW1hcFBhY2thZ2UuZ2V0Q29uZmlnU2NoZW1hKCkucGx1Z2lucy5wcm9wZXJ0aWVzLmR1bW15KS50b0JlRGVmaW5lZCgpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBQYWNrYWdlLmdldENvbmZpZ1NjaGVtYSgpLnBsdWdpbnMucHJvcGVydGllcy5kdW1teURlY29yYXRpb25zWkluZGV4KS50b0JlRGVmaW5lZCgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3NldHMgdGhlIGNvcnJlc3BvbmRpbmcgY29uZmlnJywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAucGx1Z2lucy5kdW1teScpKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLnBsdWdpbnMuZHVtbXlEZWNvcmF0aW9uc1pJbmRleCcpKS50b0VxdWFsKDApXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ3RyaWdnZXJpbmcgdGhlIGNvcnJlc3BvbmRpbmcgcGx1Z2luIGNvbW1hbmQnLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdtaW5pbWFwOnRvZ2dsZS1kdW1teScpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdyZWNlaXZlcyBhIGRlYWN0aXZhdGlvbiBjYWxsJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHBsdWdpbi5kZWFjdGl2YXRlUGx1Z2luKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdhbmQgdGhlbiB1bnJlZ2lzdGVyZWQnLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBtaW5pbWFwUGFja2FnZS51bnJlZ2lzdGVyUGx1Z2luKCdkdW1teScpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdoYXMgYmVlbiB1bnJlZ2lzdGVyZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QobWluaW1hcFBhY2thZ2UucGx1Z2luc1snZHVtbXknXSkudG9CZVVuZGVmaW5lZCgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdlbWl0cyBhbiBldmVudCcsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdCh1bnJlZ2lzdGVySGFuZGxlcikudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBjb25maWcgaXMgbW9kaWZpZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnBsdWdpbnMuZHVtbXknLCBmYWxzZSlcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGl0KCdkb2VzIG5vdCBhY3RpdmF0ZXMgdGhlIHBsdWdpbicsICgpID0+IHtcbiAgICAgICAgICAgICAgZXhwZWN0KHBsdWdpbi5kZWFjdGl2YXRlUGx1Z2luKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ29uIG1pbmltYXAgZGVhY3RpdmF0aW9uJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHBsdWdpbi5hY3RpdmUpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgICAgbWluaW1hcFBhY2thZ2UuZGVhY3RpdmF0ZSgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdkZWFjdGl2YXRlcyBhbGwgdGhlIHBsdWdpbnMnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QocGx1Z2luLmFjdGl2ZSkudG9CZUZhbHN5KClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGNvbmZpZyBmb3IgaXQgaXMgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5wbHVnaW5zLmR1bW15JywgZmFsc2UpXG4gICAgICAgICAgbWluaW1hcFBhY2thZ2UucmVnaXN0ZXJQbHVnaW4oJ2R1bW15JywgcGx1Z2luKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdkb2VzIG5vdCByZWNlaXZlIGFuIGFjdGl2YXRpb24gY2FsbCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QocGx1Z2luLmFjdGl2YXRlUGx1Z2luKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgndGhlIHJlZ2lzdGVyZWQgcGx1Z2luJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBtaW5pbWFwUGFja2FnZS5yZWdpc3RlclBsdWdpbignZHVtbXknLCBwbHVnaW4pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3JlY2VpdmVzIGFuIGFjdGl2YXRpb24gY2FsbCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QocGx1Z2luLmFjdGl2YXRlUGx1Z2luKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnYWN0aXZhdGVzIHRoZSBwbHVnaW4nLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHBsdWdpbi5hY3RpdmUpLnRvQmVUcnV0aHkoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBjb25maWcgaXMgbW9kaWZpZWQgYWZ0ZXIgcmVnaXN0cmF0aW9uJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnBsdWdpbnMuZHVtbXknLCBmYWxzZSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3JlY2VpdmVzIGEgZGVhY3RpdmF0aW9uIGNhbGwnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QocGx1Z2luLmRlYWN0aXZhdGVQbHVnaW4pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiB0aGUgZGlzcGxheVBsdWdpbnNDb250cm9scyBzZXR0aW5nIGlzIGRpc2FibGVkJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzJywgZmFsc2UpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5wbHVnaW5zLmR1bW15JywgdW5kZWZpbmVkKVxuXG4gICAgICAgIHBsdWdpbiA9IHtcbiAgICAgICAgICBhY3RpdmU6IGZhbHNlLFxuICAgICAgICAgIGFjdGl2YXRlUGx1Z2luICgpIHsgdGhpcy5hY3RpdmUgPSB0cnVlIH0sXG4gICAgICAgICAgZGVhY3RpdmF0ZVBsdWdpbiAoKSB7IHRoaXMuYWN0aXZlID0gZmFsc2UgfSxcbiAgICAgICAgICBpc0FjdGl2ZSAoKSB7IHJldHVybiB0aGlzLmFjdGl2ZSB9XG4gICAgICAgIH1cblxuICAgICAgICBzcHlPbihwbHVnaW4sICdhY3RpdmF0ZVBsdWdpbicpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgc3B5T24ocGx1Z2luLCAnZGVhY3RpdmF0ZVBsdWdpbicpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICByZWdpc3RlckhhbmRsZXIgPSBqYXNtaW5lLmNyZWF0ZVNweSgncmVnaXN0ZXIgaGFuZGxlcicpXG4gICAgICAgIHVucmVnaXN0ZXJIYW5kbGVyID0gamFzbWluZS5jcmVhdGVTcHkoJ3VucmVnaXN0ZXIgaGFuZGxlcicpXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiByZWdpc3RlcmVkJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBtaW5pbWFwUGFja2FnZS5vbkRpZEFkZFBsdWdpbihyZWdpc3RlckhhbmRsZXIpXG4gICAgICAgICAgbWluaW1hcFBhY2thZ2Uub25EaWRSZW1vdmVQbHVnaW4odW5yZWdpc3RlckhhbmRsZXIpXG4gICAgICAgICAgbWluaW1hcFBhY2thZ2UucmVnaXN0ZXJQbHVnaW4oJ2R1bW15JywgcGx1Z2luKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdtYWtlcyB0aGUgcGx1Z2luIGF2YWlsYWJsZSBpbiB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QobWluaW1hcFBhY2thZ2UucGx1Z2luc1snZHVtbXknXSkudG9CZShwbHVnaW4pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2VtaXRzIGFuIGV2ZW50JywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChyZWdpc3RlckhhbmRsZXIpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdzdGlsbCBhY3RpdmF0ZXMgdGhlIHBhY2thZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHBsdWdpbi5pc0FjdGl2ZSgpKS50b0JlVHJ1dGh5KClcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnYW5kIHRoZW4gdW5yZWdpc3RlcmVkJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgbWluaW1hcFBhY2thZ2UudW5yZWdpc3RlclBsdWdpbignZHVtbXknKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnaGFzIGJlZW4gdW5yZWdpc3RlcmVkJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBQYWNrYWdlLnBsdWdpbnNbJ2R1bW15J10pLnRvQmVVbmRlZmluZWQoKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnZW1pdHMgYW4gZXZlbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QodW5yZWdpc3RlckhhbmRsZXIpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ29uIG1pbmltYXAgZGVhY3RpdmF0aW9uJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHBsdWdpbi5hY3RpdmUpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgICAgbWluaW1hcFBhY2thZ2UuZGVhY3RpdmF0ZSgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdkZWFjdGl2YXRlcyBhbGwgdGhlIHBsdWdpbnMnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QocGx1Z2luLmFjdGl2ZSkudG9CZUZhbHN5KClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxufSlcbiJdfQ==
//# sourceURL=/home/takaaki/.atom/packages/minimap/spec/minimap-main-spec.js
