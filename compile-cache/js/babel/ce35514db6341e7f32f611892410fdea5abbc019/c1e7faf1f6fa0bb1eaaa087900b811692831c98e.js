function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

require('./helpers/workspace');

var _libMinimap = require('../lib/minimap');

var _libMinimap2 = _interopRequireDefault(_libMinimap);

var _libMinimapElement = require('../lib/minimap-element');

var _libMinimapElement2 = _interopRequireDefault(_libMinimapElement);

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

    _libMinimapElement2['default'].registerViewProvider(_libMinimap2['default']);

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
          expect(minimapPackage.config.plugins.properties.dummy).toBeDefined();
          expect(minimapPackage.config.plugins.properties.dummyDecorationsZIndex).toBeDefined();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9zcGVjL21pbmltYXAtbWFpbi1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O1FBRU8scUJBQXFCOzswQkFDUixnQkFBZ0I7Ozs7aUNBQ1Qsd0JBQXdCOzs7O0FBSm5ELFdBQVcsQ0FBQTs7QUFNWCxRQUFRLENBQUMsaUJBQWlCLEVBQUUsWUFBTTthQUN5RCxFQUFFO01BQXRGLE1BQU07TUFBRSxPQUFPO01BQUUsYUFBYTtNQUFFLGNBQWM7TUFBRSxnQkFBZ0I7TUFBRSxjQUFjOztBQUVyRixZQUFVLENBQUMsWUFBTTtBQUNmLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxDQUFBOztBQUUzQyxvQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDckQsV0FBTyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBOztBQUVyQyxtQ0FBZSxvQkFBb0IseUJBQVMsQ0FBQTs7QUFFNUMsbUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUE7S0FDNUMsQ0FBQyxDQUFBOztBQUVGLG1CQUFlLENBQUMsWUFBTTtBQUNwQixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLEdBQUcsRUFBSztBQUM1RCxzQkFBYyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUE7T0FDaEMsQ0FBQyxDQUFBO0tBQ0gsQ0FBQyxDQUFBOztBQUVGLFlBQVEsQ0FBQyxZQUFNO0FBQ2IsYUFBTyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtLQUMxRCxDQUFDLENBQUE7O0FBRUYsUUFBSSxDQUFDLFlBQU07QUFDVCxZQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFBO0FBQzdDLG1CQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7S0FDM0MsQ0FBQyxDQUFBOztBQUVGLFlBQVEsQ0FBQyxZQUFNO0FBQ2IsYUFBTyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsbURBQW1ELENBQUMsQ0FBQTtLQUMzRixDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7O0FBRUYsSUFBRSxDQUFDLHNDQUFzQyxFQUFFLFlBQU07QUFDL0MsUUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDbkQsV0FBTyxHQUFHLDRCQUFZLEVBQUMsVUFBVSxFQUFWLFVBQVUsRUFBQyxDQUFDLENBQUE7QUFDbkMsa0JBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTs7QUFFNUMsVUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO0dBQ2pDLENBQUMsQ0FBQTs7QUFFRixVQUFRLENBQUMsMEJBQTBCLEVBQUUsWUFBTTtBQUN6QyxNQUFFLENBQUMsd0NBQXdDLEVBQUUsWUFBTTtBQUNqRCxZQUFNLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUE7S0FDOUQsQ0FBQyxDQUFBOztBQUVGLE1BQUUsQ0FBQywrQ0FBK0MsRUFBRSxZQUFNO0FBQ3hELFlBQU0sQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDckYsQ0FBQyxDQUFBOztBQUVGLFlBQVEsQ0FBQyxpQ0FBaUMsRUFBRSxZQUFNO0FBQ2hELGdCQUFVLENBQUMsWUFBTTtBQUNmLFlBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUE7T0FDM0MsQ0FBQyxDQUFBO0FBQ0YsUUFBRSxDQUFDLDhDQUE4QyxFQUFFLFlBQU07QUFDdkQsY0FBTSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUE7T0FDekYsQ0FBQyxDQUFBOztBQUVGLGNBQVEsQ0FBQyxxREFBcUQsRUFBRSxZQUFNO0FBQ3BFLGtCQUFVLENBQUMsWUFBTTtBQUNmLGNBQU0sQ0FBQyxHQUFHLDRCQUFZLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUE7QUFDM0MsY0FBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDL0IsdUJBQWEsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3ZDLHlCQUFlLENBQUM7bUJBQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDO1dBQUEsQ0FBQyxDQUFBO1NBQ2hFLENBQUMsQ0FBQTs7QUFFRixVQUFFLENBQUMsK0JBQStCLEVBQUUsWUFBTTtBQUN4QyxnQkFBTSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUE7U0FDaEcsQ0FBQyxDQUFBO09BQ0gsQ0FBQyxDQUFBO0tBQ0gsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBOztBQUVGLFVBQVEsQ0FBQyxtQkFBbUIsRUFBRSxZQUFNO2dCQUN0QixFQUFFO1FBQVQsR0FBRzs7QUFDUixjQUFVLENBQUMsWUFBTTtBQUNmLFNBQUcsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLENBQUE7QUFDMUMsb0JBQWMsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUE7S0FDcEMsQ0FBQyxDQUFBOztBQUVGLE1BQUUsQ0FBQywrQ0FBK0MsRUFBRSxZQUFNO0FBQ3hELFlBQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO0tBQy9CLENBQUMsQ0FBQTs7QUFFRixNQUFFLENBQUMsZ0RBQWdELEVBQUUsWUFBTTtBQUN6RCxxQkFBZSxDQUFDLFlBQU07QUFBRSxlQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUE7T0FBRSxDQUFDLENBQUE7O0FBRXhFLFVBQUksQ0FBQyxZQUFNO0FBQUUsY0FBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO09BQUUsQ0FBQyxDQUFBO0tBQ3BELENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTs7QUFFRixVQUFRLENBQUMsY0FBYyxFQUFFLFlBQU07QUFDN0IsY0FBVSxDQUFDLFlBQU07QUFDZixvQkFBYyxDQUFDLFVBQVUsRUFBRSxDQUFBO0tBQzVCLENBQUMsQ0FBQTs7QUFFRixNQUFFLENBQUMsaUNBQWlDLEVBQUUsWUFBTTtBQUMxQyxZQUFNLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFBO0tBQ3ZELENBQUMsQ0FBQTs7QUFFRixNQUFFLENBQUMsbUNBQW1DLEVBQUUsWUFBTTtBQUM1QyxZQUFNLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUN6RixDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7O0FBRUYsVUFBUSxDQUFDLFNBQVMsRUFBRSxZQUFNO0FBQ3hCLE1BQUUsQ0FBQyxpQ0FBaUMsRUFBRSxZQUFNO0FBQzFDLFlBQU0sQ0FBQyxjQUFjLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQTtLQUN6RSxDQUFDLENBQUE7O0FBRUYsTUFBRSxDQUFDLHNEQUFzRCxFQUFFLFlBQU07QUFDL0QsVUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDbkQsVUFBSSxpQkFBaUIsR0FBRyxjQUFjLENBQUMsMEJBQTBCLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDN0UsWUFBTSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0tBQzlELENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTs7Ozs7Ozs7OztBQVVGLFVBQVEsQ0FBQyxTQUFTLEVBQUUsWUFBTTtnQkFDMkIsRUFBRTtRQUFoRCxlQUFlO1FBQUUsaUJBQWlCO1FBQUUsTUFBTTs7QUFFL0MsWUFBUSxDQUFDLG9EQUFvRCxFQUFFLFlBQU07QUFDbkUsZ0JBQVUsQ0FBQyxZQUFNO0FBQ2YsWUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDdkQsWUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsU0FBUyxDQUFDLENBQUE7O0FBRW5ELGNBQU0sR0FBRztBQUNQLGdCQUFNLEVBQUUsS0FBSztBQUNiLHdCQUFjLEVBQUMsMEJBQUc7QUFBRSxnQkFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUE7V0FBRTtBQUN4QywwQkFBZ0IsRUFBQyw0QkFBRztBQUFFLGdCQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQTtXQUFFO0FBQzNDLGtCQUFRLEVBQUMsb0JBQUc7QUFBRSxtQkFBTyxJQUFJLENBQUMsTUFBTSxDQUFBO1dBQUU7U0FDbkMsQ0FBQTs7QUFFRCxhQUFLLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDLENBQUMsY0FBYyxFQUFFLENBQUE7QUFDaEQsYUFBSyxDQUFDLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFBOztBQUVsRCx1QkFBZSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtBQUN2RCx5QkFBaUIsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLENBQUE7T0FDNUQsQ0FBQyxDQUFBOztBQUVGLGNBQVEsQ0FBQyxpQkFBaUIsRUFBRSxZQUFNO0FBQ2hDLGtCQUFVLENBQUMsWUFBTTtBQUNmLHdCQUFjLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQzlDLHdCQUFjLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtBQUNuRCx3QkFBYyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUE7U0FDL0MsQ0FBQyxDQUFBOztBQUVGLFVBQUUsQ0FBQywyQ0FBMkMsRUFBRSxZQUFNO0FBQ3BELGdCQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtTQUNyRCxDQUFDLENBQUE7O0FBRUYsVUFBRSxDQUFDLGdCQUFnQixFQUFFLFlBQU07QUFDekIsZ0JBQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO1NBQzNDLENBQUMsQ0FBQTs7QUFFRixVQUFFLENBQUMseUNBQXlDLEVBQUUsWUFBTTtBQUNsRCxnQkFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNwRSxnQkFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO1NBQ3RGLENBQUMsQ0FBQTs7QUFFRixVQUFFLENBQUMsK0JBQStCLEVBQUUsWUFBTTtBQUN4QyxnQkFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQTtBQUM3RCxnQkFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHdDQUF3QyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUE7U0FDN0UsQ0FBQyxDQUFBOztBQUVGLGdCQUFRLENBQUMsNkNBQTZDLEVBQUUsWUFBTTtBQUM1RCxvQkFBVSxDQUFDLFlBQU07QUFDZixnQkFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsc0JBQXNCLENBQUMsQ0FBQTtXQUNqRSxDQUFDLENBQUE7O0FBRUYsWUFBRSxDQUFDLDhCQUE4QixFQUFFLFlBQU07QUFDdkMsa0JBQU0sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO1dBQ25ELENBQUMsQ0FBQTtTQUNILENBQUMsQ0FBQTs7QUFFRixnQkFBUSxDQUFDLHVCQUF1QixFQUFFLFlBQU07QUFDdEMsb0JBQVUsQ0FBQyxZQUFNO0FBQ2YsMEJBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQTtXQUN6QyxDQUFDLENBQUE7O0FBRUYsWUFBRSxDQUFDLHVCQUF1QixFQUFFLFlBQU07QUFDaEMsa0JBQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUE7V0FDeEQsQ0FBQyxDQUFBOztBQUVGLFlBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxZQUFNO0FBQ3pCLGtCQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO1dBQzdDLENBQUMsQ0FBQTs7QUFFRixrQkFBUSxDQUFDLDZCQUE2QixFQUFFLFlBQU07QUFDNUMsc0JBQVUsQ0FBQyxZQUFNO0FBQ2Ysa0JBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLEtBQUssQ0FBQyxDQUFBO2FBQ2hELENBQUMsQ0FBQTs7QUFFRixjQUFFLENBQUMsK0JBQStCLEVBQUUsWUFBTTtBQUN4QyxvQkFBTSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO2FBQ3ZELENBQUMsQ0FBQTtXQUNILENBQUMsQ0FBQTtTQUNILENBQUMsQ0FBQTs7QUFFRixnQkFBUSxDQUFDLHlCQUF5QixFQUFFLFlBQU07QUFDeEMsb0JBQVUsQ0FBQyxZQUFNO0FBQ2Ysa0JBQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUE7QUFDbEMsMEJBQWMsQ0FBQyxVQUFVLEVBQUUsQ0FBQTtXQUM1QixDQUFDLENBQUE7O0FBRUYsWUFBRSxDQUFDLDZCQUE2QixFQUFFLFlBQU07QUFDdEMsa0JBQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUE7V0FDbEMsQ0FBQyxDQUFBO1NBQ0gsQ0FBQyxDQUFBO09BQ0gsQ0FBQyxDQUFBOztBQUVGLGNBQVEsQ0FBQyxpQ0FBaUMsRUFBRSxZQUFNO0FBQ2hELGtCQUFVLENBQUMsWUFBTTtBQUNmLGNBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLEtBQUssQ0FBQyxDQUFBO0FBQy9DLHdCQUFjLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQTtTQUMvQyxDQUFDLENBQUE7O0FBRUYsVUFBRSxDQUFDLHFDQUFxQyxFQUFFLFlBQU07QUFDOUMsZ0JBQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUE7U0FDckQsQ0FBQyxDQUFBO09BQ0gsQ0FBQyxDQUFBOztBQUVGLGNBQVEsQ0FBQyx1QkFBdUIsRUFBRSxZQUFNO0FBQ3RDLGtCQUFVLENBQUMsWUFBTTtBQUNmLHdCQUFjLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQTtTQUMvQyxDQUFDLENBQUE7O0FBRUYsVUFBRSxDQUFDLDZCQUE2QixFQUFFLFlBQU07QUFDdEMsZ0JBQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQTtTQUNqRCxDQUFDLENBQUE7O0FBRUYsVUFBRSxDQUFDLHNCQUFzQixFQUFFLFlBQU07QUFDL0IsZ0JBQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUE7U0FDbkMsQ0FBQyxDQUFBOztBQUVGLGdCQUFRLENBQUMsZ0RBQWdELEVBQUUsWUFBTTtBQUMvRCxvQkFBVSxDQUFDLFlBQU07QUFDZixnQkFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLENBQUE7V0FDaEQsQ0FBQyxDQUFBOztBQUVGLFlBQUUsQ0FBQyw4QkFBOEIsRUFBRSxZQUFNO0FBQ3ZDLGtCQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQTtXQUNuRCxDQUFDLENBQUE7U0FDSCxDQUFDLENBQUE7T0FDSCxDQUFDLENBQUE7S0FDSCxDQUFDLENBQUE7O0FBRUYsWUFBUSxDQUFDLHFEQUFxRCxFQUFFLFlBQU07QUFDcEUsZ0JBQVUsQ0FBQyxZQUFNO0FBQ2YsWUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLEVBQUUsS0FBSyxDQUFDLENBQUE7QUFDeEQsWUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsU0FBUyxDQUFDLENBQUE7O0FBRW5ELGNBQU0sR0FBRztBQUNQLGdCQUFNLEVBQUUsS0FBSztBQUNiLHdCQUFjLEVBQUMsMEJBQUc7QUFBRSxnQkFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUE7V0FBRTtBQUN4QywwQkFBZ0IsRUFBQyw0QkFBRztBQUFFLGdCQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQTtXQUFFO0FBQzNDLGtCQUFRLEVBQUMsb0JBQUc7QUFBRSxtQkFBTyxJQUFJLENBQUMsTUFBTSxDQUFBO1dBQUU7U0FDbkMsQ0FBQTs7QUFFRCxhQUFLLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDLENBQUMsY0FBYyxFQUFFLENBQUE7QUFDaEQsYUFBSyxDQUFDLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFBOztBQUVsRCx1QkFBZSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtBQUN2RCx5QkFBaUIsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLENBQUE7T0FDNUQsQ0FBQyxDQUFBOztBQUVGLGNBQVEsQ0FBQyxpQkFBaUIsRUFBRSxZQUFNO0FBQ2hDLGtCQUFVLENBQUMsWUFBTTtBQUNmLHdCQUFjLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQzlDLHdCQUFjLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtBQUNuRCx3QkFBYyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUE7U0FDL0MsQ0FBQyxDQUFBOztBQUVGLFVBQUUsQ0FBQywyQ0FBMkMsRUFBRSxZQUFNO0FBQ3BELGdCQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtTQUNyRCxDQUFDLENBQUE7O0FBRUYsVUFBRSxDQUFDLGdCQUFnQixFQUFFLFlBQU07QUFDekIsZ0JBQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO1NBQzNDLENBQUMsQ0FBQTs7QUFFRixVQUFFLENBQUMsNkJBQTZCLEVBQUUsWUFBTTtBQUN0QyxnQkFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFBO1NBQ3ZDLENBQUMsQ0FBQTs7QUFFRixnQkFBUSxDQUFDLHVCQUF1QixFQUFFLFlBQU07QUFDdEMsb0JBQVUsQ0FBQyxZQUFNO0FBQ2YsMEJBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQTtXQUN6QyxDQUFDLENBQUE7O0FBRUYsWUFBRSxDQUFDLHVCQUF1QixFQUFFLFlBQU07QUFDaEMsa0JBQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUE7V0FDeEQsQ0FBQyxDQUFBOztBQUVGLFlBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxZQUFNO0FBQ3pCLGtCQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO1dBQzdDLENBQUMsQ0FBQTtTQUNILENBQUMsQ0FBQTs7QUFFRixnQkFBUSxDQUFDLHlCQUF5QixFQUFFLFlBQU07QUFDeEMsb0JBQVUsQ0FBQyxZQUFNO0FBQ2Ysa0JBQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUE7QUFDbEMsMEJBQWMsQ0FBQyxVQUFVLEVBQUUsQ0FBQTtXQUM1QixDQUFDLENBQUE7O0FBRUYsWUFBRSxDQUFDLDZCQUE2QixFQUFFLFlBQU07QUFDdEMsa0JBQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUE7V0FDbEMsQ0FBQyxDQUFBO1NBQ0gsQ0FBQyxDQUFBO09BQ0gsQ0FBQyxDQUFBO0tBQ0gsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0NBQ0gsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9zcGVjL21pbmltYXAtbWFpbi1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0ICcuL2hlbHBlcnMvd29ya3NwYWNlJ1xuaW1wb3J0IE1pbmltYXAgZnJvbSAnLi4vbGliL21pbmltYXAnXG5pbXBvcnQgTWluaW1hcEVsZW1lbnQgZnJvbSAnLi4vbGliL21pbmltYXAtZWxlbWVudCdcblxuZGVzY3JpYmUoJ01pbmltYXAgcGFja2FnZScsICgpID0+IHtcbiAgbGV0IFtlZGl0b3IsIG1pbmltYXAsIGVkaXRvckVsZW1lbnQsIG1pbmltYXBFbGVtZW50LCB3b3Jrc3BhY2VFbGVtZW50LCBtaW5pbWFwUGFja2FnZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5hdXRvVG9nZ2xlJywgdHJ1ZSlcblxuICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgamFzbWluZS5hdHRhY2hUb0RPTSh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgTWluaW1hcEVsZW1lbnQucmVnaXN0ZXJWaWV3UHJvdmlkZXIoTWluaW1hcClcblxuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2Uub3Blbignc2FtcGxlLmNvZmZlZScpXG4gICAgfSlcblxuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ21pbmltYXAnKS50aGVuKChwa2cpID0+IHtcbiAgICAgICAgbWluaW1hcFBhY2thZ2UgPSBwa2cubWFpbk1vZHVsZVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignYXRvbS10ZXh0LWVkaXRvcicpXG4gICAgfSlcblxuICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICB9KVxuXG4gICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignYXRvbS10ZXh0LWVkaXRvcjo6c2hhZG93IGF0b20tdGV4dC1lZGl0b3ItbWluaW1hcCcpXG4gICAgfSlcbiAgfSlcblxuICBpdCgncmVnaXN0ZXJzIHRoZSBtaW5pbWFwIHZpZXdzIHByb3ZpZGVyJywgKCkgPT4ge1xuICAgIGxldCB0ZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuYnVpbGRUZXh0RWRpdG9yKHt9KVxuICAgIG1pbmltYXAgPSBuZXcgTWluaW1hcCh7dGV4dEVkaXRvcn0pXG4gICAgbWluaW1hcEVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcobWluaW1hcClcblxuICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudCkudG9FeGlzdCgpXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gYW4gZWRpdG9yIGlzIG9wZW5lZCcsICgpID0+IHtcbiAgICBpdCgnY3JlYXRlcyBhIG1pbmltYXAgbW9kZWwgZm9yIHRoZSBlZGl0b3InLCAoKSA9PiB7XG4gICAgICBleHBlY3QobWluaW1hcFBhY2thZ2UubWluaW1hcEZvckVkaXRvcihlZGl0b3IpKS50b0JlRGVmaW5lZCgpXG4gICAgfSlcblxuICAgIGl0KCdhdHRhY2hlcyBhIG1pbmltYXAgZWxlbWVudCB0byB0aGUgZWRpdG9yIHZpZXcnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2F0b20tdGV4dC1lZGl0b3ItbWluaW1hcCcpKS50b0V4aXN0KClcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gdGhlIHBhY2thZ2UgaXMgZGVhY3RpdmF0ZWQnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZSgnbWluaW1hcCcpXG4gICAgICB9KVxuICAgICAgaXQoJ3JlbW92ZXMgdGhlIG1pbmltYXAgZnJvbSB0aGVpciBlZGl0b3IgcGFyZW50JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2F0b20tdGV4dC1lZGl0b3ItbWluaW1hcCcpKS5ub3QudG9FeGlzdCgpXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnYW5kIHJlYWN0aXZhdGVkIHdpdGggYSByZW1haW5pbmcgbWluaW1hcCBpbiB0aGUgRE9NJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBjb25zdCBtID0gbmV3IE1pbmltYXAoe3RleHRFZGl0b3I6IGVkaXRvcn0pXG4gICAgICAgICAgY29uc3QgdiA9IGF0b20udmlld3MuZ2V0VmlldyhtKVxuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc2hhZG93Um9vdC5hcHBlbmRDaGlsZCh2KVxuICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbWluaW1hcCcpKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdyZW1vdmVzIHRoZSByZW1haW5pbmcgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3JBbGwoJ2F0b20tdGV4dC1lZGl0b3ItbWluaW1hcCcpLmxlbmd0aCkudG9FcXVhbCgxKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCc6Om9ic2VydmVNaW5pbWFwcycsICgpID0+IHtcbiAgICBsZXQgW3NweV0gPSBbXVxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgc3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ29ic2VydmVNaW5pbWFwcycpXG4gICAgICBtaW5pbWFwUGFja2FnZS5vYnNlcnZlTWluaW1hcHMoc3B5KVxuICAgIH0pXG5cbiAgICBpdCgnY2FsbHMgdGhlIGNhbGxiYWNrIHdpdGggdGhlIGV4aXN0aW5nIG1pbmltYXBzJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KHNweSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgfSlcblxuICAgIGl0KCdjYWxscyB0aGUgY2FsbGJhY2sgd2hlbiBhIG5ldyBlZGl0b3IgaXMgb3BlbmVkJywgKCkgPT4ge1xuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHsgcmV0dXJuIGF0b20ud29ya3NwYWNlLm9wZW4oJ290aGVyLXNhbXBsZS5qcycpIH0pXG5cbiAgICAgIHJ1bnMoKCkgPT4geyBleHBlY3Qoc3B5LmNhbGxzLmxlbmd0aCkudG9FcXVhbCgyKSB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJzo6ZGVhY3RpdmF0ZScsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIG1pbmltYXBQYWNrYWdlLmRlYWN0aXZhdGUoKVxuICAgIH0pXG5cbiAgICBpdCgnZGVzdHJveXMgYWxsIHRoZSBtaW5pbWFwIG1vZGVscycsICgpID0+IHtcbiAgICAgIGV4cGVjdChtaW5pbWFwUGFja2FnZS5lZGl0b3JzTWluaW1hcHMpLnRvQmVVbmRlZmluZWQoKVxuICAgIH0pXG5cbiAgICBpdCgnZGVzdHJveXMgYWxsIHRoZSBtaW5pbWFwIGVsZW1lbnRzJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdhdG9tLXRleHQtZWRpdG9yLW1pbmltYXAnKSkubm90LnRvRXhpc3QoKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3NlcnZpY2UnLCAoKSA9PiB7XG4gICAgaXQoJ3JldHVybnMgdGhlIG1pbmltYXAgbWFpbiBtb2R1bGUnLCAoKSA9PiB7XG4gICAgICBleHBlY3QobWluaW1hcFBhY2thZ2UucHJvdmlkZU1pbmltYXBTZXJ2aWNlVjEoKSkudG9FcXVhbChtaW5pbWFwUGFja2FnZSlcbiAgICB9KVxuXG4gICAgaXQoJ2NyZWF0ZXMgc3RhbmRhbG9uZSBtaW5pbWFwIHdpdGggcHJvdmlkZWQgdGV4dCBlZGl0b3InLCAoKSA9PiB7XG4gICAgICBsZXQgdGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcih7fSlcbiAgICAgIGxldCBzdGFuZGFsb25lTWluaW1hcCA9IG1pbmltYXBQYWNrYWdlLnN0YW5kQWxvbmVNaW5pbWFwRm9yRWRpdG9yKHRleHRFZGl0b3IpXG4gICAgICBleHBlY3Qoc3RhbmRhbG9uZU1pbmltYXAuZ2V0VGV4dEVkaXRvcigpKS50b0VxdWFsKHRleHRFZGl0b3IpXG4gICAgfSlcbiAgfSlcblxuICAvLyAgICAjIyMjIyMjIyAgIyMgICAgICAgIyMgICAgICMjICAjIyMjIyMgICAjIyMjICMjICAgICMjICAjIyMjIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAgICAjIyAgICMjICAjIyMgICAjIyAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjICMjICAgICAgICAgIyMgICMjIyMgICMjICMjXG4gIC8vICAgICMjIyMjIyMjICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAjIyMjICAjIyAgIyMgIyMgIyMgICMjIyMjI1xuICAvLyAgICAjIyAgICAgICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICMjICAgIyMgICMjICAjIyMjICAgICAgICMjXG4gIC8vICAgICMjICAgICAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgIyMgICAjIyAgIyMgICAjIyMgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICAgICMjIyMjIyMjICAjIyMjIyMjICAgIyMjIyMjICAgIyMjIyAjIyAgICAjIyAgIyMjIyMjXG5cbiAgZGVzY3JpYmUoJ3BsdWdpbnMnLCAoKSA9PiB7XG4gICAgbGV0IFtyZWdpc3RlckhhbmRsZXIsIHVucmVnaXN0ZXJIYW5kbGVyLCBwbHVnaW5dID0gW11cblxuICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBkaXNwbGF5UGx1Z2luc0NvbnRyb2xzIHNldHRpbmcgaXMgZW5hYmxlZCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scycsIHRydWUpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5wbHVnaW5zLmR1bW15JywgdW5kZWZpbmVkKVxuXG4gICAgICAgIHBsdWdpbiA9IHtcbiAgICAgICAgICBhY3RpdmU6IGZhbHNlLFxuICAgICAgICAgIGFjdGl2YXRlUGx1Z2luICgpIHsgdGhpcy5hY3RpdmUgPSB0cnVlIH0sXG4gICAgICAgICAgZGVhY3RpdmF0ZVBsdWdpbiAoKSB7IHRoaXMuYWN0aXZlID0gZmFsc2UgfSxcbiAgICAgICAgICBpc0FjdGl2ZSAoKSB7IHJldHVybiB0aGlzLmFjdGl2ZSB9XG4gICAgICAgIH1cblxuICAgICAgICBzcHlPbihwbHVnaW4sICdhY3RpdmF0ZVBsdWdpbicpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgc3B5T24ocGx1Z2luLCAnZGVhY3RpdmF0ZVBsdWdpbicpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICByZWdpc3RlckhhbmRsZXIgPSBqYXNtaW5lLmNyZWF0ZVNweSgncmVnaXN0ZXIgaGFuZGxlcicpXG4gICAgICAgIHVucmVnaXN0ZXJIYW5kbGVyID0gamFzbWluZS5jcmVhdGVTcHkoJ3VucmVnaXN0ZXIgaGFuZGxlcicpXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiByZWdpc3RlcmVkJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBtaW5pbWFwUGFja2FnZS5vbkRpZEFkZFBsdWdpbihyZWdpc3RlckhhbmRsZXIpXG4gICAgICAgICAgbWluaW1hcFBhY2thZ2Uub25EaWRSZW1vdmVQbHVnaW4odW5yZWdpc3RlckhhbmRsZXIpXG4gICAgICAgICAgbWluaW1hcFBhY2thZ2UucmVnaXN0ZXJQbHVnaW4oJ2R1bW15JywgcGx1Z2luKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdtYWtlcyB0aGUgcGx1Z2luIGF2YWlsYWJsZSBpbiB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QobWluaW1hcFBhY2thZ2UucGx1Z2luc1snZHVtbXknXSkudG9CZShwbHVnaW4pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2VtaXRzIGFuIGV2ZW50JywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChyZWdpc3RlckhhbmRsZXIpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdjcmVhdGVzIGEgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBwbHVnaW4nLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBQYWNrYWdlLmNvbmZpZy5wbHVnaW5zLnByb3BlcnRpZXMuZHVtbXkpLnRvQmVEZWZpbmVkKClcbiAgICAgICAgICBleHBlY3QobWluaW1hcFBhY2thZ2UuY29uZmlnLnBsdWdpbnMucHJvcGVydGllcy5kdW1teURlY29yYXRpb25zWkluZGV4KS50b0JlRGVmaW5lZCgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3NldHMgdGhlIGNvcnJlc3BvbmRpbmcgY29uZmlnJywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAucGx1Z2lucy5kdW1teScpKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLnBsdWdpbnMuZHVtbXlEZWNvcmF0aW9uc1pJbmRleCcpKS50b0VxdWFsKDApXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ3RyaWdnZXJpbmcgdGhlIGNvcnJlc3BvbmRpbmcgcGx1Z2luIGNvbW1hbmQnLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdtaW5pbWFwOnRvZ2dsZS1kdW1teScpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdyZWNlaXZlcyBhIGRlYWN0aXZhdGlvbiBjYWxsJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHBsdWdpbi5kZWFjdGl2YXRlUGx1Z2luKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdhbmQgdGhlbiB1bnJlZ2lzdGVyZWQnLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBtaW5pbWFwUGFja2FnZS51bnJlZ2lzdGVyUGx1Z2luKCdkdW1teScpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdoYXMgYmVlbiB1bnJlZ2lzdGVyZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QobWluaW1hcFBhY2thZ2UucGx1Z2luc1snZHVtbXknXSkudG9CZVVuZGVmaW5lZCgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdlbWl0cyBhbiBldmVudCcsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdCh1bnJlZ2lzdGVySGFuZGxlcikudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBjb25maWcgaXMgbW9kaWZpZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnBsdWdpbnMuZHVtbXknLCBmYWxzZSlcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGl0KCdkb2VzIG5vdCBhY3RpdmF0ZXMgdGhlIHBsdWdpbicsICgpID0+IHtcbiAgICAgICAgICAgICAgZXhwZWN0KHBsdWdpbi5kZWFjdGl2YXRlUGx1Z2luKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ29uIG1pbmltYXAgZGVhY3RpdmF0aW9uJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHBsdWdpbi5hY3RpdmUpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgICAgbWluaW1hcFBhY2thZ2UuZGVhY3RpdmF0ZSgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdkZWFjdGl2YXRlcyBhbGwgdGhlIHBsdWdpbnMnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QocGx1Z2luLmFjdGl2ZSkudG9CZUZhbHN5KClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGNvbmZpZyBmb3IgaXQgaXMgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5wbHVnaW5zLmR1bW15JywgZmFsc2UpXG4gICAgICAgICAgbWluaW1hcFBhY2thZ2UucmVnaXN0ZXJQbHVnaW4oJ2R1bW15JywgcGx1Z2luKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdkb2VzIG5vdCByZWNlaXZlIGFuIGFjdGl2YXRpb24gY2FsbCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QocGx1Z2luLmFjdGl2YXRlUGx1Z2luKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgndGhlIHJlZ2lzdGVyZWQgcGx1Z2luJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBtaW5pbWFwUGFja2FnZS5yZWdpc3RlclBsdWdpbignZHVtbXknLCBwbHVnaW4pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3JlY2VpdmVzIGFuIGFjdGl2YXRpb24gY2FsbCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QocGx1Z2luLmFjdGl2YXRlUGx1Z2luKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnYWN0aXZhdGVzIHRoZSBwbHVnaW4nLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHBsdWdpbi5hY3RpdmUpLnRvQmVUcnV0aHkoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBjb25maWcgaXMgbW9kaWZpZWQgYWZ0ZXIgcmVnaXN0cmF0aW9uJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnBsdWdpbnMuZHVtbXknLCBmYWxzZSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3JlY2VpdmVzIGEgZGVhY3RpdmF0aW9uIGNhbGwnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QocGx1Z2luLmRlYWN0aXZhdGVQbHVnaW4pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiB0aGUgZGlzcGxheVBsdWdpbnNDb250cm9scyBzZXR0aW5nIGlzIGRpc2FibGVkJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzJywgZmFsc2UpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5wbHVnaW5zLmR1bW15JywgdW5kZWZpbmVkKVxuXG4gICAgICAgIHBsdWdpbiA9IHtcbiAgICAgICAgICBhY3RpdmU6IGZhbHNlLFxuICAgICAgICAgIGFjdGl2YXRlUGx1Z2luICgpIHsgdGhpcy5hY3RpdmUgPSB0cnVlIH0sXG4gICAgICAgICAgZGVhY3RpdmF0ZVBsdWdpbiAoKSB7IHRoaXMuYWN0aXZlID0gZmFsc2UgfSxcbiAgICAgICAgICBpc0FjdGl2ZSAoKSB7IHJldHVybiB0aGlzLmFjdGl2ZSB9XG4gICAgICAgIH1cblxuICAgICAgICBzcHlPbihwbHVnaW4sICdhY3RpdmF0ZVBsdWdpbicpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgc3B5T24ocGx1Z2luLCAnZGVhY3RpdmF0ZVBsdWdpbicpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICByZWdpc3RlckhhbmRsZXIgPSBqYXNtaW5lLmNyZWF0ZVNweSgncmVnaXN0ZXIgaGFuZGxlcicpXG4gICAgICAgIHVucmVnaXN0ZXJIYW5kbGVyID0gamFzbWluZS5jcmVhdGVTcHkoJ3VucmVnaXN0ZXIgaGFuZGxlcicpXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiByZWdpc3RlcmVkJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBtaW5pbWFwUGFja2FnZS5vbkRpZEFkZFBsdWdpbihyZWdpc3RlckhhbmRsZXIpXG4gICAgICAgICAgbWluaW1hcFBhY2thZ2Uub25EaWRSZW1vdmVQbHVnaW4odW5yZWdpc3RlckhhbmRsZXIpXG4gICAgICAgICAgbWluaW1hcFBhY2thZ2UucmVnaXN0ZXJQbHVnaW4oJ2R1bW15JywgcGx1Z2luKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdtYWtlcyB0aGUgcGx1Z2luIGF2YWlsYWJsZSBpbiB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QobWluaW1hcFBhY2thZ2UucGx1Z2luc1snZHVtbXknXSkudG9CZShwbHVnaW4pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2VtaXRzIGFuIGV2ZW50JywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChyZWdpc3RlckhhbmRsZXIpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdzdGlsbCBhY3RpdmF0ZXMgdGhlIHBhY2thZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHBsdWdpbi5pc0FjdGl2ZSgpKS50b0JlVHJ1dGh5KClcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnYW5kIHRoZW4gdW5yZWdpc3RlcmVkJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgbWluaW1hcFBhY2thZ2UudW5yZWdpc3RlclBsdWdpbignZHVtbXknKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnaGFzIGJlZW4gdW5yZWdpc3RlcmVkJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBQYWNrYWdlLnBsdWdpbnNbJ2R1bW15J10pLnRvQmVVbmRlZmluZWQoKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnZW1pdHMgYW4gZXZlbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QodW5yZWdpc3RlckhhbmRsZXIpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ29uIG1pbmltYXAgZGVhY3RpdmF0aW9uJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHBsdWdpbi5hY3RpdmUpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgICAgbWluaW1hcFBhY2thZ2UuZGVhY3RpdmF0ZSgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdkZWFjdGl2YXRlcyBhbGwgdGhlIHBsdWdpbnMnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QocGx1Z2luLmFjdGl2ZSkudG9CZUZhbHN5KClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxufSlcbiJdfQ==
//# sourceURL=/home/takaaki/.atom/packages/minimap/spec/minimap-main-spec.js
