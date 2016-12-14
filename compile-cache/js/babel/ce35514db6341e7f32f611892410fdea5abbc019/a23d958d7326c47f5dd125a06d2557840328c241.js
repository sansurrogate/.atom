var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _libMain = require('../lib/main');

var _libMain2 = _interopRequireDefault(_libMain);

var _libMinimap = require('../lib/minimap');

var _libMinimap2 = _interopRequireDefault(_libMinimap);

var _helpersWorkspace = require('./helpers/workspace');

var _helpersEvents = require('./helpers/events');

'use babel';

function realOffsetTop(o) {
  // transform = new WebKitCSSMatrix window.getComputedStyle(o).transform
  // o.offsetTop + transform.m42
  return o.offsetTop;
}

function realOffsetLeft(o) {
  // transform = new WebKitCSSMatrix window.getComputedStyle(o).transform
  // o.offsetLeft + transform.m41
  return o.offsetLeft;
}

function sleep(duration) {
  var t = new Date();
  waitsFor(duration + 'ms', function () {
    return new Date() - t > duration;
  });
}

function createPlugin() {
  var plugin = {
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
  return plugin;
}

describe('MinimapElement', function () {
  var _ref = [];
  var editor = _ref[0];
  var minimap = _ref[1];
  var largeSample = _ref[2];
  var mediumSample = _ref[3];
  var smallSample = _ref[4];
  var jasmineContent = _ref[5];
  var editorElement = _ref[6];
  var minimapElement = _ref[7];
  var dir = _ref[8];

  beforeEach(function () {
    // Comment after body below to leave the created text editor and minimap
    // on DOM after the test run.
    jasmineContent = document.body.querySelector('#jasmine-content');

    waitsForPromise(function () {
      return atom.packages.activatePackage('minimap');
    });

    runs(function () {
      atom.config.set('minimap.charHeight', 4);
      atom.config.set('minimap.charWidth', 2);
      atom.config.set('minimap.interline', 1);
      atom.config.set('minimap.textOpacity', 1);
      atom.config.set('minimap.autoToggle', true);
      atom.config.set('minimap.displayMinimapOnLeft', false);
      atom.config.set('minimap.displayCodeHighlights', false);
      atom.config.set('minimap.displayPluginsControls', false);
      atom.config.set('minimap.minimapScrollIndicator', false);
      atom.config.set('minimap.adjustMinimapWidthToSoftWrap', false);
      atom.config.set('minimap.smoothScrolling', true);
      atom.config.set('minimap.adjustMinimapWidthOnlyIfSmaller', true);
      atom.config.set('minimap.plugins', {});

      editor = atom.workspace.buildTextEditor({});
      editor.autoHeight = false;

      editorElement = atom.views.getView(editor);
      jasmineContent.insertBefore(editorElement, jasmineContent.firstChild);
      editorElement.setHeight(50);

      minimap = new _libMinimap2['default']({ textEditor: editor });
      dir = atom.project.getDirectories()[0];

      largeSample = _fsPlus2['default'].readFileSync(dir.resolve('large-file.coffee')).toString();
      mediumSample = _fsPlus2['default'].readFileSync(dir.resolve('two-hundred.txt')).toString();
      smallSample = _fsPlus2['default'].readFileSync(dir.resolve('sample.coffee')).toString();

      editor.setText(largeSample);

      minimapElement = atom.views.getView(minimap);
    });
  });

  it('has been registered in the view registry', function () {
    expect(minimapElement).toExist();
  });

  it('has stored the minimap as its model', function () {
    expect(minimapElement.getModel()).toBe(minimap);
  });

  it('has a canvas in a shadow DOM', function () {
    expect(minimapElement.shadowRoot.querySelector('canvas')).toExist();
  });

  it('has a div representing the visible area', function () {
    expect(minimapElement.shadowRoot.querySelector('.minimap-visible-area')).toExist();
  });

  //       ###    ######## ########    ###     ######  ##     ##
  //      ## ##      ##       ##      ## ##   ##    ## ##     ##
  //     ##   ##     ##       ##     ##   ##  ##       ##     ##
  //    ##     ##    ##       ##    ##     ## ##       #########
  //    #########    ##       ##    ######### ##       ##     ##
  //    ##     ##    ##       ##    ##     ## ##    ## ##     ##
  //    ##     ##    ##       ##    ##     ##  ######  ##     ##

  describe('when attached to the text editor element', function () {
    var _ref2 = [];
    var noAnimationFrame = _ref2[0];
    var nextAnimationFrame = _ref2[1];
    var requestAnimationFrameSafe = _ref2[2];
    var canvas = _ref2[3];
    var visibleArea = _ref2[4];

    beforeEach(function () {
      noAnimationFrame = function () {
        throw new Error('No animation frame requested');
      };
      nextAnimationFrame = noAnimationFrame;

      requestAnimationFrameSafe = window.requestAnimationFrame;
      spyOn(window, 'requestAnimationFrame').andCallFake(function (fn) {
        nextAnimationFrame = function () {
          nextAnimationFrame = noAnimationFrame;
          fn();
        };
      });
    });

    beforeEach(function () {
      canvas = minimapElement.shadowRoot.querySelector('canvas');
      editorElement.setWidth(200);
      editorElement.setHeight(50);

      editorElement.setScrollTop(1000);
      editorElement.setScrollLeft(200);
      minimapElement.attach();
    });

    afterEach(function () {
      minimap.destroy();
      window.requestAnimationFrame = requestAnimationFrameSafe;
    });

    it('adds a with-minimap attribute on the text editor element', function () {
      expect(editorElement.hasAttribute('with-minimap')).toBeTruthy();
    });

    it('takes the height of the editor', function () {
      expect(minimapElement.offsetHeight).toEqual(editorElement.clientHeight);

      expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.clientWidth / 10, 0);
    });

    it('knows when attached to a text editor', function () {
      expect(minimapElement.attachedToTextEditor).toBeTruthy();
    });

    it('resizes the canvas to fit the minimap', function () {
      expect(canvas.offsetHeight / devicePixelRatio).toBeCloseTo(minimapElement.offsetHeight + minimap.getLineHeight(), 0);
      expect(canvas.offsetWidth / devicePixelRatio).toBeCloseTo(minimapElement.offsetWidth, 0);
    });

    it('requests an update', function () {
      expect(minimapElement.frameRequested).toBeTruthy();
    });

    describe('when detached', function () {
      it('removes the attribute from the editor', function () {
        minimapElement.detach();

        expect(editorElement.hasAttribute('with-minimap')).toBeFalsy();
      });
    });

    //     ######   ######   ######
    //    ##    ## ##    ## ##    ##
    //    ##       ##       ##
    //    ##        ######   ######
    //    ##             ##       ##
    //    ##    ## ##    ## ##    ##
    //     ######   ######   ######

    describe('with css filters', function () {
      describe('when a hue-rotate filter is applied to a rgb color', function () {
        var _ref3 = [];
        var additionnalStyleNode = _ref3[0];

        beforeEach(function () {
          minimapElement.invalidateDOMStylesCache();

          additionnalStyleNode = document.createElement('style');
          additionnalStyleNode.textContent = '\n            ' + _helpersWorkspace.stylesheet + '\n\n            atom-text-editor::shadow .editor, .editor {\n              color: red;\n              -webkit-filter: hue-rotate(180deg);\n            }\n          ';

          jasmineContent.appendChild(additionnalStyleNode);
        });

        it('computes the new color by applying the hue rotation', function () {
          waitsFor('new animation frame', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
            expect(minimapElement.retrieveStyleFromDom(['.editor'], 'color')).toEqual('rgb(0, ' + 0x6d + ', ' + 0x6d + ')');
          });
        });
      });

      describe('when a hue-rotate filter is applied to a rgba color', function () {
        var _ref4 = [];
        var additionnalStyleNode = _ref4[0];

        beforeEach(function () {
          minimapElement.invalidateDOMStylesCache();

          additionnalStyleNode = document.createElement('style');
          additionnalStyleNode.textContent = '\n            ' + _helpersWorkspace.stylesheet + '\n\n            atom-text-editor::shadow .editor, .editor {\n              color: rgba(255, 0, 0, 0);\n              -webkit-filter: hue-rotate(180deg);\n            }\n          ';

          jasmineContent.appendChild(additionnalStyleNode);
        });

        it('computes the new color by applying the hue rotation', function () {
          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
            expect(minimapElement.retrieveStyleFromDom(['.editor'], 'color')).toEqual('rgba(0, ' + 0x6d + ', ' + 0x6d + ', 0)');
          });
        });
      });
    });

    //    ##     ## ########  ########     ###    ######## ########
    //    ##     ## ##     ## ##     ##   ## ##      ##    ##
    //    ##     ## ##     ## ##     ##  ##   ##     ##    ##
    //    ##     ## ########  ##     ## ##     ##    ##    ######
    //    ##     ## ##        ##     ## #########    ##    ##
    //    ##     ## ##        ##     ## ##     ##    ##    ##
    //     #######  ##        ########  ##     ##    ##    ########

    describe('when the update is performed', function () {
      beforeEach(function () {
        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();
          visibleArea = minimapElement.shadowRoot.querySelector('.minimap-visible-area');
        });
      });

      it('sets the visible area width and height', function () {
        expect(visibleArea.offsetWidth).toEqual(minimapElement.clientWidth + Math.floor(minimap.getTextEditorScaledScrollLeft()));
        expect(visibleArea.offsetHeight).toBeCloseTo(minimap.getTextEditorScaledHeight(), 0);
      });

      it('sets the visible visible area offset', function () {
        expect(realOffsetTop(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop(), 0);

        expect(Math.floor(parseFloat(visibleArea.style.borderLeftWidth))).toEqual(Math.floor(minimap.getTextEditorScaledScrollLeft()));
      });

      it('offsets the canvas when the scroll does not match line height', function () {
        editorElement.setScrollTop(1004);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(realOffsetTop(canvas)).toBeCloseTo(-2, -1);
        });
      });

      it('does not fail to update render the invisible char when modified', function () {
        atom.config.set('editor.showInvisibles', true);
        atom.config.set('editor.invisibles', { cr: '*' });

        expect(function () {
          nextAnimationFrame();
        }).not.toThrow();
      });

      it('renders the decorations based on the order settings', function () {
        atom.config.set('minimap.displayPluginsControls', true);

        var pluginFoo = createPlugin();
        var pluginBar = createPlugin();

        _libMain2['default'].registerPlugin('foo', pluginFoo);
        _libMain2['default'].registerPlugin('bar', pluginBar);

        atom.config.set('minimap.plugins.fooDecorationsZIndex', 1);

        var calls = [];
        spyOn(minimapElement, 'drawLineDecoration').andCallFake(function (d) {
          calls.push(d.getProperties().plugin);
        });
        spyOn(minimapElement, 'drawHighlightDecoration').andCallFake(function (d) {
          calls.push(d.getProperties().plugin);
        });

        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 10]]), { type: 'line', color: '#0000FF', plugin: 'bar' });
        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 10]]), { type: 'highlight-under', color: '#0000FF', plugin: 'foo' });

        editorElement.setScrollTop(0);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(calls).toEqual(['bar', 'foo']);

          atom.config.set('minimap.plugins.fooDecorationsZIndex', -1);

          calls.length = 0;
        });

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });

        runs(function () {
          nextAnimationFrame();

          expect(calls).toEqual(['foo', 'bar']);

          _libMain2['default'].unregisterPlugin('foo');
          _libMain2['default'].unregisterPlugin('bar');
        });
      });

      it('renders the visible line decorations', function () {
        spyOn(minimapElement, 'drawLineDecoration').andCallThrough();

        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 10]]), { type: 'line', color: '#0000FF' });
        minimap.decorateMarker(editor.markBufferRange([[10, 0], [10, 10]]), { type: 'line', color: '#0000FF' });
        minimap.decorateMarker(editor.markBufferRange([[100, 0], [100, 10]]), { type: 'line', color: '#0000FF' });

        editorElement.setScrollTop(0);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawLineDecoration).toHaveBeenCalled();
          expect(minimapElement.drawLineDecoration.calls.length).toEqual(2);
        });
      });

      it('renders the visible gutter decorations', function () {
        spyOn(minimapElement, 'drawGutterDecoration').andCallThrough();

        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 10]]), { type: 'gutter', color: '#0000FF' });
        minimap.decorateMarker(editor.markBufferRange([[10, 0], [10, 10]]), { type: 'gutter', color: '#0000FF' });
        minimap.decorateMarker(editor.markBufferRange([[100, 0], [100, 10]]), { type: 'gutter', color: '#0000FF' });

        editorElement.setScrollTop(0);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawGutterDecoration).toHaveBeenCalled();
          expect(minimapElement.drawGutterDecoration.calls.length).toEqual(2);
        });
      });

      it('renders the visible highlight decorations', function () {
        spyOn(minimapElement, 'drawHighlightDecoration').andCallThrough();

        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 4]]), { type: 'highlight-under', color: '#0000FF' });
        minimap.decorateMarker(editor.markBufferRange([[2, 20], [2, 30]]), { type: 'highlight-over', color: '#0000FF' });
        minimap.decorateMarker(editor.markBufferRange([[100, 3], [100, 5]]), { type: 'highlight-under', color: '#0000FF' });

        editorElement.setScrollTop(0);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawHighlightDecoration).toHaveBeenCalled();
          expect(minimapElement.drawHighlightDecoration.calls.length).toEqual(2);
        });
      });

      it('renders the visible outline decorations', function () {
        spyOn(minimapElement, 'drawHighlightOutlineDecoration').andCallThrough();

        minimap.decorateMarker(editor.markBufferRange([[1, 4], [3, 6]]), { type: 'highlight-outline', color: '#0000ff' });
        minimap.decorateMarker(editor.markBufferRange([[6, 0], [6, 7]]), { type: 'highlight-outline', color: '#0000ff' });
        minimap.decorateMarker(editor.markBufferRange([[100, 3], [100, 5]]), { type: 'highlight-outline', color: '#0000ff' });

        editorElement.setScrollTop(0);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawHighlightOutlineDecoration).toHaveBeenCalled();
          expect(minimapElement.drawHighlightOutlineDecoration.calls.length).toEqual(4);
        });
      });

      it('renders the visible custom foreground decorations', function () {
        spyOn(minimapElement, 'drawCustomDecoration').andCallThrough();

        var renderRoutine = jasmine.createSpy('renderRoutine');

        var properties = {
          type: 'foreground-custom',
          render: renderRoutine
        };

        minimap.decorateMarker(editor.markBufferRange([[1, 4], [3, 6]]), properties);
        minimap.decorateMarker(editor.markBufferRange([[6, 0], [6, 7]]), properties);
        minimap.decorateMarker(editor.markBufferRange([[100, 3], [100, 5]]), properties);

        editorElement.setScrollTop(0);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawCustomDecoration).toHaveBeenCalled();
          expect(minimapElement.drawCustomDecoration.calls.length).toEqual(4);

          expect(renderRoutine).toHaveBeenCalled();
          expect(renderRoutine.calls.length).toEqual(4);
        });
      });

      it('renders the visible custom background decorations', function () {
        spyOn(minimapElement, 'drawCustomDecoration').andCallThrough();

        var renderRoutine = jasmine.createSpy('renderRoutine');

        var properties = {
          type: 'background-custom',
          render: renderRoutine
        };

        minimap.decorateMarker(editor.markBufferRange([[1, 4], [3, 6]]), properties);
        minimap.decorateMarker(editor.markBufferRange([[6, 0], [6, 7]]), properties);
        minimap.decorateMarker(editor.markBufferRange([[100, 3], [100, 5]]), properties);

        editorElement.setScrollTop(0);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawCustomDecoration).toHaveBeenCalled();
          expect(minimapElement.drawCustomDecoration.calls.length).toEqual(4);

          expect(renderRoutine).toHaveBeenCalled();
          expect(renderRoutine.calls.length).toEqual(4);
        });
      });

      describe('when the editor is scrolled', function () {
        beforeEach(function () {
          editorElement.setScrollTop(2000);
          editorElement.setScrollLeft(50);

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('updates the visible area', function () {
          expect(realOffsetTop(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop(), 0);

          expect(Math.floor(parseFloat(visibleArea.style.borderLeftWidth))).toEqual(Math.floor(minimap.getTextEditorScaledScrollLeft()));
        });
      });

      describe('when the editor is resized to a greater size', function () {
        beforeEach(function () {
          editorElement.style.width = '800px';
          editorElement.style.height = '500px';

          minimapElement.measureHeightAndWidth();

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('detects the resize and adjust itself', function () {
          expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 10, 0);
          expect(minimapElement.offsetHeight).toEqual(editorElement.offsetHeight);

          expect(canvas.offsetWidth / devicePixelRatio).toBeCloseTo(minimapElement.offsetWidth, 0);
          expect(canvas.offsetHeight / devicePixelRatio).toBeCloseTo(minimapElement.offsetHeight + minimap.getLineHeight(), 0);
        });
      });

      describe('when the editor visible content is changed', function () {
        beforeEach(function () {
          editorElement.setScrollLeft(0);
          editorElement.setScrollTop(1400);
          editor.setSelectedBufferRange([[101, 0], [102, 20]]);

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();

            spyOn(minimapElement, 'drawLines').andCallThrough();
            editor.insertText('foo');
          });
        });

        it('rerenders the part that have changed', function () {
          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();

            expect(minimapElement.drawLines).toHaveBeenCalled();

            var _minimapElement$drawLines$argsForCall$0 = _slicedToArray(minimapElement.drawLines.argsForCall[0], 2);

            var firstLine = _minimapElement$drawLines$argsForCall$0[0];
            var lastLine = _minimapElement$drawLines$argsForCall$0[1];

            expect(firstLine).toEqual(100);
            expect(lastLine === 102 || lastLine === 111).toBeTruthy();
          });
        });
      });

      describe('when the editor visibility change', function () {
        it('does not modify the size of the canvas', function () {
          var canvasWidth = minimapElement.getFrontCanvas().width;
          var canvasHeight = minimapElement.getFrontCanvas().height;
          editorElement.style.display = 'none';

          minimapElement.measureHeightAndWidth();

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();

            expect(minimapElement.getFrontCanvas().width).toEqual(canvasWidth);
            expect(minimapElement.getFrontCanvas().height).toEqual(canvasHeight);
          });
        });

        describe('from hidden to visible', function () {
          beforeEach(function () {
            editorElement.style.display = 'none';
            minimapElement.checkForVisibilityChange();
            spyOn(minimapElement, 'requestForcedUpdate');
            editorElement.style.display = '';
            minimapElement.pollDOM();
          });

          it('requests an update of the whole minimap', function () {
            expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
          });
        });
      });
    });

    //     ######   ######  ########   #######  ##       ##
    //    ##    ## ##    ## ##     ## ##     ## ##       ##
    //    ##       ##       ##     ## ##     ## ##       ##
    //     ######  ##       ########  ##     ## ##       ##
    //          ## ##       ##   ##   ##     ## ##       ##
    //    ##    ## ##    ## ##    ##  ##     ## ##       ##
    //     ######   ######  ##     ##  #######  ######## ########

    describe('mouse scroll controls', function () {
      beforeEach(function () {
        editorElement.setWidth(400);
        editorElement.setHeight(400);
        editorElement.setScrollTop(0);
        editorElement.setScrollLeft(0);

        nextAnimationFrame();

        minimapElement.measureHeightAndWidth();

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      describe('using the mouse scrollwheel over the minimap', function () {
        it('relays the events to the editor view', function () {
          spyOn(editorElement.component.presenter, 'setScrollTop').andCallFake(function () {});

          (0, _helpersEvents.mousewheel)(minimapElement, 0, 15);

          expect(editorElement.component.presenter.setScrollTop).toHaveBeenCalled();
        });

        describe('when the independentMinimapScroll setting is true', function () {
          var previousScrollTop = undefined;

          beforeEach(function () {
            atom.config.set('minimap.independentMinimapScroll', true);
            atom.config.set('minimap.scrollSensitivity', 0.5);

            spyOn(editorElement.component.presenter, 'setScrollTop').andCallFake(function () {});

            previousScrollTop = minimap.getScrollTop();

            (0, _helpersEvents.mousewheel)(minimapElement, 0, -15);
          });

          it('does not relay the events to the editor', function () {
            expect(editorElement.component.presenter.setScrollTop).not.toHaveBeenCalled();
          });

          it('scrolls the minimap instead', function () {
            expect(minimap.getScrollTop()).not.toEqual(previousScrollTop);
          });

          it('clamp the minimap scroll into the legit bounds', function () {
            (0, _helpersEvents.mousewheel)(minimapElement, 0, -100000);

            expect(minimap.getScrollTop()).toEqual(minimap.getMaxScrollTop());

            (0, _helpersEvents.mousewheel)(minimapElement, 0, 100000);

            expect(minimap.getScrollTop()).toEqual(0);
          });
        });
      });

      describe('middle clicking the minimap', function () {
        var _ref5 = [];
        var canvas = _ref5[0];
        var visibleArea = _ref5[1];
        var originalLeft = _ref5[2];
        var maxScroll = _ref5[3];

        beforeEach(function () {
          canvas = minimapElement.getFrontCanvas();
          visibleArea = minimapElement.visibleArea;
          originalLeft = visibleArea.getBoundingClientRect().left;
          maxScroll = minimap.getTextEditorMaxScrollTop();
        });

        it('scrolls to the top using the middle mouse button', function () {
          (0, _helpersEvents.mousedown)(canvas, { x: originalLeft + 1, y: 0, btn: 1 });
          expect(editorElement.getScrollTop()).toEqual(0);
        });

        describe('scrolling to the middle using the middle mouse button', function () {
          var canvasMidY = undefined;

          beforeEach(function () {
            var editorMidY = editorElement.getHeight() / 2.0;

            var _canvas$getBoundingClientRect = canvas.getBoundingClientRect();

            var top = _canvas$getBoundingClientRect.top;
            var height = _canvas$getBoundingClientRect.height;

            canvasMidY = top + height / 2.0;
            var actualMidY = Math.min(canvasMidY, editorMidY);
            (0, _helpersEvents.mousedown)(canvas, { x: originalLeft + 1, y: actualMidY, btn: 1 });
          });

          it('scrolls the editor to the middle', function () {
            var middleScrollTop = Math.round(maxScroll / 2.0);
            expect(editorElement.getScrollTop()).toEqual(middleScrollTop);
          });

          it('updates the visible area to be centered', function () {
            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            runs(function () {
              nextAnimationFrame();

              var _visibleArea$getBoundingClientRect = visibleArea.getBoundingClientRect();

              var top = _visibleArea$getBoundingClientRect.top;
              var height = _visibleArea$getBoundingClientRect.height;

              var visibleCenterY = top + height / 2;
              expect(visibleCenterY).toBeCloseTo(200, 0);
            });
          });
        });

        describe('scrolling the editor to an arbitrary location', function () {
          var _ref6 = [];
          var scrollTo = _ref6[0];
          var scrollRatio = _ref6[1];

          beforeEach(function () {
            scrollTo = 101; // pixels
            scrollRatio = (scrollTo - minimap.getTextEditorScaledHeight() / 2) / (minimap.getVisibleHeight() - minimap.getTextEditorScaledHeight());
            scrollRatio = Math.max(0, scrollRatio);
            scrollRatio = Math.min(1, scrollRatio);

            (0, _helpersEvents.mousedown)(canvas, { x: originalLeft + 1, y: scrollTo, btn: 1 });

            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            runs(function () {
              nextAnimationFrame();
            });
          });

          it('scrolls the editor to an arbitrary location', function () {
            var expectedScroll = maxScroll * scrollRatio;
            expect(editorElement.getScrollTop()).toBeCloseTo(expectedScroll, 0);
          });

          describe('dragging the visible area with middle mouse button ' + 'after scrolling to the arbitrary location', function () {
            var _ref7 = [];
            var originalTop = _ref7[0];

            beforeEach(function () {
              originalTop = visibleArea.getBoundingClientRect().top;
              (0, _helpersEvents.mousemove)(visibleArea, { x: originalLeft + 1, y: scrollTo + 40, btn: 1 });

              waitsFor('a new animation frame request', function () {
                return nextAnimationFrame !== noAnimationFrame;
              });
              runs(function () {
                nextAnimationFrame();
              });
            });

            afterEach(function () {
              minimapElement.endDrag();
            });

            it('scrolls the editor so that the visible area was moved down ' + 'by 40 pixels from the arbitrary location', function () {
              var _visibleArea$getBoundingClientRect2 = visibleArea.getBoundingClientRect();

              var top = _visibleArea$getBoundingClientRect2.top;

              expect(top).toBeCloseTo(originalTop + 40, -1);
            });
          });
        });
      });

      describe('pressing the mouse on the minimap canvas (without scroll animation)', function () {
        var canvas = undefined;

        beforeEach(function () {
          var t = 0;
          spyOn(minimapElement, 'getTime').andCallFake(function () {
            var n = t;
            t += 100;
            return n;
          });
          spyOn(minimapElement, 'requestUpdate').andCallFake(function () {});

          atom.config.set('minimap.scrollAnimation', false);

          canvas = minimapElement.getFrontCanvas();
        });

        it('scrolls the editor to the line below the mouse', function () {
          (0, _helpersEvents.mousedown)(canvas);
          expect(editorElement.getScrollTop()).toBeCloseTo(480);
        });

        describe('when independentMinimapScroll setting is enabled', function () {
          beforeEach(function () {
            minimap.setScrollTop(1000);
            atom.config.set('minimap.independentMinimapScroll', true);
          });

          it('scrolls the editor to the line below the mouse', function () {
            (0, _helpersEvents.mousedown)(canvas);
            expect(editorElement.getScrollTop()).toBeCloseTo(480);
          });
        });

        describe('when moveCursorOnMinimapClick is true', function () {
          beforeEach(function () {
            atom.config.set('minimap.moveCursorOnMinimapClick', true);
          });

          it('moves the cursor to the corresponding line', function () {
            (0, _helpersEvents.mousedown)(canvas);
            expect(editor.getCursorScreenPosition()).toEqual([40, 0]);
          });
        });
      });

      describe('pressing the mouse on the minimap canvas (with scroll animation)', function () {
        var canvas = undefined;

        beforeEach(function () {
          var t = 0;
          spyOn(minimapElement, 'getTime').andCallFake(function () {
            var n = t;
            t += 100;
            return n;
          });
          spyOn(minimapElement, 'requestUpdate').andCallFake(function () {});

          atom.config.set('minimap.scrollAnimation', true);
          atom.config.set('minimap.scrollAnimationDuration', 300);

          canvas = minimapElement.getFrontCanvas();
        });

        it('scrolls the editor gradually to the line below the mouse', function () {
          (0, _helpersEvents.mousedown)(canvas);
          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          // wait until all animations run out
          waitsFor(function () {
            nextAnimationFrame !== noAnimationFrame && nextAnimationFrame();
            return editorElement.getScrollTop() >= 480;
          });
        });

        it('stops the animation if the text editor is destroyed', function () {
          (0, _helpersEvents.mousedown)(canvas);
          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });

          runs(function () {
            editor.destroy();

            nextAnimationFrame !== noAnimationFrame && nextAnimationFrame();

            expect(nextAnimationFrame === noAnimationFrame);
          });
        });

        describe('when independentMinimapScroll setting is enabled', function () {
          beforeEach(function () {
            minimap.setScrollTop(1000);
            atom.config.set('minimap.independentMinimapScroll', true);
          });

          it('scrolls the editor gradually to the line below the mouse', function () {
            (0, _helpersEvents.mousedown)(canvas);
            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            // wait until all animations run out
            waitsFor(function () {
              nextAnimationFrame !== noAnimationFrame && nextAnimationFrame();
              return editorElement.getScrollTop() >= 480;
            });
          });

          it('stops the animation if the text editor is destroyed', function () {
            (0, _helpersEvents.mousedown)(canvas);
            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });

            runs(function () {
              editor.destroy();

              nextAnimationFrame !== noAnimationFrame && nextAnimationFrame();

              expect(nextAnimationFrame === noAnimationFrame);
            });
          });
        });
      });

      describe('dragging the visible area', function () {
        var _ref8 = [];
        var visibleArea = _ref8[0];
        var originalTop = _ref8[1];

        beforeEach(function () {
          visibleArea = minimapElement.visibleArea;
          var o = visibleArea.getBoundingClientRect();
          var left = o.left;
          originalTop = o.top;

          (0, _helpersEvents.mousedown)(visibleArea, { x: left + 10, y: originalTop + 10 });
          (0, _helpersEvents.mousemove)(visibleArea, { x: left + 10, y: originalTop + 50 });

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        afterEach(function () {
          minimapElement.endDrag();
        });

        it('scrolls the editor so that the visible area was moved down by 40 pixels', function () {
          var _visibleArea$getBoundingClientRect3 = visibleArea.getBoundingClientRect();

          var top = _visibleArea$getBoundingClientRect3.top;

          expect(top).toBeCloseTo(originalTop + 40, -1);
        });

        it('stops the drag gesture when the mouse is released outside the minimap', function () {
          var _visibleArea$getBoundingClientRect4 = visibleArea.getBoundingClientRect();

          var top = _visibleArea$getBoundingClientRect4.top;
          var left = _visibleArea$getBoundingClientRect4.left;

          (0, _helpersEvents.mouseup)(jasmineContent, { x: left - 10, y: top + 80 });

          spyOn(minimapElement, 'drag');
          (0, _helpersEvents.mousemove)(visibleArea, { x: left + 10, y: top + 50 });

          expect(minimapElement.drag).not.toHaveBeenCalled();
        });
      });

      describe('dragging the visible area using touch events', function () {
        var _ref9 = [];
        var visibleArea = _ref9[0];
        var originalTop = _ref9[1];

        beforeEach(function () {
          visibleArea = minimapElement.visibleArea;
          var o = visibleArea.getBoundingClientRect();
          var left = o.left;
          originalTop = o.top;

          (0, _helpersEvents.touchstart)(visibleArea, { x: left + 10, y: originalTop + 10 });
          (0, _helpersEvents.touchmove)(visibleArea, { x: left + 10, y: originalTop + 50 });

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        afterEach(function () {
          minimapElement.endDrag();
        });

        it('scrolls the editor so that the visible area was moved down by 40 pixels', function () {
          var _visibleArea$getBoundingClientRect5 = visibleArea.getBoundingClientRect();

          var top = _visibleArea$getBoundingClientRect5.top;

          expect(top).toBeCloseTo(originalTop + 40, -1);
        });

        it('stops the drag gesture when the mouse is released outside the minimap', function () {
          var _visibleArea$getBoundingClientRect6 = visibleArea.getBoundingClientRect();

          var top = _visibleArea$getBoundingClientRect6.top;
          var left = _visibleArea$getBoundingClientRect6.left;

          (0, _helpersEvents.mouseup)(jasmineContent, { x: left - 10, y: top + 80 });

          spyOn(minimapElement, 'drag');
          (0, _helpersEvents.touchmove)(visibleArea, { x: left + 10, y: top + 50 });

          expect(minimapElement.drag).not.toHaveBeenCalled();
        });
      });

      describe('when the minimap cannot scroll', function () {
        var _ref10 = [];
        var visibleArea = _ref10[0];
        var originalTop = _ref10[1];

        beforeEach(function () {
          var sample = _fsPlus2['default'].readFileSync(dir.resolve('seventy.txt')).toString();
          editor.setText(sample);
          editorElement.setScrollTop(0);
        });

        describe('dragging the visible area', function () {
          beforeEach(function () {
            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            runs(function () {
              nextAnimationFrame();

              visibleArea = minimapElement.visibleArea;

              var _visibleArea$getBoundingClientRect7 = visibleArea.getBoundingClientRect();

              var top = _visibleArea$getBoundingClientRect7.top;
              var left = _visibleArea$getBoundingClientRect7.left;

              originalTop = top;

              (0, _helpersEvents.mousedown)(visibleArea, { x: left + 10, y: top + 10 });
              (0, _helpersEvents.mousemove)(visibleArea, { x: left + 10, y: top + 50 });
            });

            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            runs(function () {
              nextAnimationFrame();
            });
          });

          afterEach(function () {
            minimapElement.endDrag();
          });

          it('scrolls based on a ratio adjusted to the minimap height', function () {
            var _visibleArea$getBoundingClientRect8 = visibleArea.getBoundingClientRect();

            var top = _visibleArea$getBoundingClientRect8.top;

            expect(top).toBeCloseTo(originalTop + 40, -1);
          });
        });
      });

      describe('when scroll past end is enabled', function () {
        beforeEach(function () {
          atom.config.set('editor.scrollPastEnd', true);

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        describe('dragging the visible area', function () {
          var _ref11 = [];
          var originalTop = _ref11[0];
          var visibleArea = _ref11[1];

          beforeEach(function () {
            visibleArea = minimapElement.visibleArea;

            var _visibleArea$getBoundingClientRect9 = visibleArea.getBoundingClientRect();

            var top = _visibleArea$getBoundingClientRect9.top;
            var left = _visibleArea$getBoundingClientRect9.left;

            originalTop = top;

            (0, _helpersEvents.mousedown)(visibleArea, { x: left + 10, y: top + 10 });
            (0, _helpersEvents.mousemove)(visibleArea, { x: left + 10, y: top + 50 });

            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            runs(function () {
              nextAnimationFrame();
            });
          });

          afterEach(function () {
            minimapElement.endDrag();
          });

          it('scrolls the editor so that the visible area was moved down by 40 pixels', function () {
            var _visibleArea$getBoundingClientRect10 = visibleArea.getBoundingClientRect();

            var top = _visibleArea$getBoundingClientRect10.top;

            expect(top).toBeCloseTo(originalTop + 40, -1);
          });
        });
      });
    });

    //     ######  ########    ###    ##    ## ########
    //    ##    ##    ##      ## ##   ###   ## ##     ##
    //    ##          ##     ##   ##  ####  ## ##     ##
    //     ######     ##    ##     ## ## ## ## ##     ##
    //          ##    ##    ######### ##  #### ##     ##
    //    ##    ##    ##    ##     ## ##   ### ##     ##
    //     ######     ##    ##     ## ##    ## ########
    //
    //       ###    ##        #######  ##    ## ########
    //      ## ##   ##       ##     ## ###   ## ##
    //     ##   ##  ##       ##     ## ####  ## ##
    //    ##     ## ##       ##     ## ## ## ## ######
    //    ######### ##       ##     ## ##  #### ##
    //    ##     ## ##       ##     ## ##   ### ##
    //    ##     ## ########  #######  ##    ## ########

    describe('when the model is a stand-alone minimap', function () {
      beforeEach(function () {
        minimap.setStandAlone(true);
      });

      it('has a stand-alone attribute', function () {
        expect(minimapElement.hasAttribute('stand-alone')).toBeTruthy();
      });

      it('sets the minimap size when measured', function () {
        minimapElement.measureHeightAndWidth();

        expect(minimap.width).toEqual(minimapElement.clientWidth);
        expect(minimap.height).toEqual(minimapElement.clientHeight);
      });

      it('removes the controls div', function () {
        expect(minimapElement.shadowRoot.querySelector('.minimap-controls')).toBeNull();
      });

      it('removes the visible area', function () {
        expect(minimapElement.visibleArea).toBeUndefined();
      });

      it('removes the quick settings button', function () {
        atom.config.set('minimap.displayPluginsControls', true);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();
          expect(minimapElement.openQuickSettings).toBeUndefined();
        });
      });

      it('removes the scroll indicator', function () {
        editor.setText(mediumSample);
        editorElement.setScrollTop(50);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
          atom.config.set('minimap.minimapScrollIndicator', true);
        });

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
          expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).toBeNull();
        });
      });

      describe('pressing the mouse on the minimap canvas', function () {
        beforeEach(function () {
          jasmineContent.appendChild(minimapElement);

          var t = 0;
          spyOn(minimapElement, 'getTime').andCallFake(function () {
            var n = t;
            t += 100;
            return n;
          });
          spyOn(minimapElement, 'requestUpdate').andCallFake(function () {});

          atom.config.set('minimap.scrollAnimation', false);

          canvas = minimapElement.getFrontCanvas();
          (0, _helpersEvents.mousedown)(canvas);
        });

        it('does not scroll the editor to the line below the mouse', function () {
          expect(editorElement.getScrollTop()).toEqual(1000);
        });
      });

      describe('and is changed to be a classical minimap again', function () {
        beforeEach(function () {
          atom.config.set('minimap.displayPluginsControls', true);
          atom.config.set('minimap.minimapScrollIndicator', true);

          minimap.setStandAlone(false);
        });

        it('recreates the destroyed elements', function () {
          expect(minimapElement.shadowRoot.querySelector('.minimap-controls')).toExist();
          expect(minimapElement.shadowRoot.querySelector('.minimap-visible-area')).toExist();
          expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).toExist();
          expect(minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')).toExist();
        });
      });
    });

    //    ########  ########  ######  ######## ########   #######  ##    ##
    //    ##     ## ##       ##    ##    ##    ##     ## ##     ##  ##  ##
    //    ##     ## ##       ##          ##    ##     ## ##     ##   ####
    //    ##     ## ######    ######     ##    ########  ##     ##    ##
    //    ##     ## ##             ##    ##    ##   ##   ##     ##    ##
    //    ##     ## ##       ##    ##    ##    ##    ##  ##     ##    ##
    //    ########  ########  ######     ##    ##     ##  #######     ##

    describe('when the model is destroyed', function () {
      beforeEach(function () {
        minimap.destroy();
      });

      it('detaches itself from its parent', function () {
        expect(minimapElement.parentNode).toBeNull();
      });

      it('stops the DOM polling interval', function () {
        spyOn(minimapElement, 'pollDOM');

        sleep(200);

        runs(function () {
          expect(minimapElement.pollDOM).not.toHaveBeenCalled();
        });
      });
    });

    //     ######   #######  ##    ## ######## ####  ######
    //    ##    ## ##     ## ###   ## ##        ##  ##    ##
    //    ##       ##     ## ####  ## ##        ##  ##
    //    ##       ##     ## ## ## ## ######    ##  ##   ####
    //    ##       ##     ## ##  #### ##        ##  ##    ##
    //    ##    ## ##     ## ##   ### ##        ##  ##    ##
    //     ######   #######  ##    ## ##       ####  ######

    describe('when the atom styles are changed', function () {
      beforeEach(function () {
        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();
          spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
          spyOn(minimapElement, 'invalidateDOMStylesCache').andCallThrough();

          var styleNode = document.createElement('style');
          styleNode.textContent = 'body{ color: #233 }';
          atom.styles.emitter.emit('did-add-style-element', styleNode);
        });

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
      });

      it('forces a refresh with cache invalidation', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
        expect(minimapElement.invalidateDOMStylesCache).toHaveBeenCalled();
      });
    });

    describe('when minimap.textOpacity is changed', function () {
      beforeEach(function () {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
        atom.config.set('minimap.textOpacity', 0.3);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('requests a complete update', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
      });
    });

    describe('when minimap.displayCodeHighlights is changed', function () {
      beforeEach(function () {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();

        waitsFor('minimap attached', function () {
          return minimapElement.attached;
        });

        runs(function () {
          atom.config.set('minimap.displayCodeHighlights', true);
        });

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });

        runs(function () {
          nextAnimationFrame();
        });
      });

      it('requests a complete update', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
      });
    });

    describe('when minimap.charWidth is changed', function () {
      beforeEach(function () {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
        atom.config.set('minimap.charWidth', 1);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('requests a complete update', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
      });
    });

    describe('when minimap.charHeight is changed', function () {
      beforeEach(function () {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
        atom.config.set('minimap.charHeight', 1);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('requests a complete update', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
      });
    });

    describe('when minimap.interline is changed', function () {
      beforeEach(function () {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
        atom.config.set('minimap.interline', 2);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('requests a complete update', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
      });
    });

    describe('when minimap.displayMinimapOnLeft setting is true', function () {
      it('moves the attached minimap to the left', function () {
        atom.config.set('minimap.displayMinimapOnLeft', true);
        expect(minimapElement.classList.contains('left')).toBeTruthy();
      });

      describe('when the minimap is not attached yet', function () {
        beforeEach(function () {
          editor = atom.workspace.buildTextEditor({});
          editor.autoHeight = false;
          editorElement = atom.views.getView(editor);
          editorElement.setHeight(50);
          editor.setLineHeightInPixels(10);

          minimap = new _libMinimap2['default']({ textEditor: editor });
          minimapElement = atom.views.getView(minimap);

          jasmineContent.insertBefore(editorElement, jasmineContent.firstChild);

          atom.config.set('minimap.displayMinimapOnLeft', true);
          minimapElement.attach();
        });

        it('moves the attached minimap to the left', function () {
          expect(minimapElement.classList.contains('left')).toBeTruthy();
        });
      });
    });

    describe('when minimap.adjustMinimapWidthToSoftWrap is true', function () {
      beforeEach(function () {
        atom.config.set('editor.softWrap', true);
        atom.config.set('editor.softWrapAtPreferredLineLength', true);
        atom.config.set('editor.preferredLineLength', 2);

        atom.config.set('minimap.adjustMinimapWidthToSoftWrap', true);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('adjusts the width of the minimap canvas', function () {
        expect(minimapElement.getFrontCanvas().width / devicePixelRatio).toEqual(4);
      });

      it('offsets the minimap by the difference', function () {
        expect(realOffsetLeft(minimapElement)).toBeCloseTo(editorElement.clientWidth - 4, -1);
        expect(minimapElement.clientWidth).toEqual(4);
      });

      describe('the dom polling routine', function () {
        it('does not change the value', function () {
          atom.views.performDocumentPoll();

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
            expect(minimapElement.getFrontCanvas().width / devicePixelRatio).toEqual(4);
          });
        });
      });

      describe('when the editor is resized', function () {
        beforeEach(function () {
          atom.config.set('editor.preferredLineLength', 6);
          editorElement.style.width = '100px';
          editorElement.style.height = '100px';

          atom.views.performDocumentPoll();

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('makes the minimap smaller than soft wrap', function () {
          expect(minimapElement.offsetWidth).toBeCloseTo(12, -1);
          expect(minimapElement.style.marginRight).toEqual('');
        });
      });

      describe('and when minimap.minimapScrollIndicator setting is true', function () {
        beforeEach(function () {
          editor.setText(mediumSample);
          editorElement.setScrollTop(50);

          waitsFor('minimap frame requested', function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
            atom.config.set('minimap.minimapScrollIndicator', true);
          });

          waitsFor('minimap frame requested', function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('offsets the scroll indicator by the difference', function () {
          var indicator = minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator');
          expect(realOffsetLeft(indicator)).toBeCloseTo(2, -1);
        });
      });

      describe('and when minimap.displayPluginsControls setting is true', function () {
        beforeEach(function () {
          atom.config.set('minimap.displayPluginsControls', true);
        });

        it('offsets the scroll indicator by the difference', function () {
          var openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
          expect(realOffsetLeft(openQuickSettings)).not.toBeCloseTo(2, -1);
        });
      });

      describe('and then disabled', function () {
        beforeEach(function () {
          atom.config.set('minimap.adjustMinimapWidthToSoftWrap', false);

          waitsFor('minimap frame requested', function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('adjusts the width of the minimap', function () {
          expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 10, -1);
          expect(minimapElement.style.width).toEqual('');
        });
      });

      describe('and when preferredLineLength >= 16384', function () {
        beforeEach(function () {
          atom.config.set('editor.preferredLineLength', 16384);

          waitsFor('minimap frame requested', function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('adjusts the width of the minimap', function () {
          expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 10, -1);
          expect(minimapElement.style.width).toEqual('');
        });
      });

      describe('when adjustMinimapWidthOnlyIfSmaller is disabled', function () {
        describe('and when preferredLineLength >= 16384', function () {
          beforeEach(function () {
            atom.config.set('minimap.adjustMinimapWidthOnlyIfSmaller', false);
            atom.config.set('editor.preferredLineLength', 16384);

            waitsFor('minimap frame requested', function () {
              return minimapElement.frameRequested;
            });
            runs(function () {
              nextAnimationFrame();
            });
          });

          it('adjusts the width of the minimap', function () {
            expect(minimapElement.offsetWidth).toBeCloseTo(16384 * 2);
            expect(minimapElement.style.width).toEqual(16384 * 2 + 'px');
          });
        });
      });
    });

    describe('when minimap.minimapScrollIndicator setting is true', function () {
      beforeEach(function () {
        editor.setText(mediumSample);
        editorElement.setScrollTop(50);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });

        atom.config.set('minimap.minimapScrollIndicator', true);
      });

      it('adds a scroll indicator in the element', function () {
        expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).toExist();
      });

      describe('and then deactivated', function () {
        it('removes the scroll indicator from the element', function () {
          atom.config.set('minimap.minimapScrollIndicator', false);
          expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).not.toExist();
        });
      });

      describe('on update', function () {
        beforeEach(function () {
          editorElement.style.height = '500px';

          atom.views.performDocumentPoll();

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('adjusts the size and position of the indicator', function () {
          var indicator = minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator');

          var height = editorElement.getHeight() * (editorElement.getHeight() / minimap.getHeight());
          var scroll = (editorElement.getHeight() - height) * minimap.getTextEditorScrollRatio();

          expect(indicator.offsetHeight).toBeCloseTo(height, 0);
          expect(realOffsetTop(indicator)).toBeCloseTo(scroll, 0);
        });
      });

      describe('when the minimap cannot scroll', function () {
        beforeEach(function () {
          editor.setText(smallSample);

          waitsFor('minimap frame requested', function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('removes the scroll indicator', function () {
          expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).not.toExist();
        });

        describe('and then can scroll again', function () {
          beforeEach(function () {
            editor.setText(largeSample);

            waitsFor('minimap frame requested', function () {
              return minimapElement.frameRequested;
            });
            runs(function () {
              nextAnimationFrame();
            });
          });

          it('attaches the scroll indicator', function () {
            waitsFor('minimap scroll indicator', function () {
              return minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator');
            });
          });
        });
      });
    });

    describe('when minimap.absoluteMode setting is true', function () {
      beforeEach(function () {
        atom.config.set('minimap.absoluteMode', true);
      });

      it('adds a absolute class to the minimap element', function () {
        expect(minimapElement.classList.contains('absolute')).toBeTruthy();
      });

      describe('when minimap.displayMinimapOnLeft setting is true', function () {
        it('also adds a left class to the minimap element', function () {
          atom.config.set('minimap.displayMinimapOnLeft', true);
          expect(minimapElement.classList.contains('absolute')).toBeTruthy();
          expect(minimapElement.classList.contains('left')).toBeTruthy();
        });
      });

      describe('when minimap.adjustAbsoluteModeHeight setting is true', function () {
        beforeEach(function () {
          atom.config.set('minimap.adjustAbsoluteModeHeight', true);
        });
        describe('when the content of the minimap is smaller that the editor height', function () {
          beforeEach(function () {
            editor.setText(smallSample);
            editorElement.setHeight(400);
            minimapElement.measureHeightAndWidth();

            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });

            runs(function () {
              return nextAnimationFrame();
            });
          });
          it('adjusts the canvas height to the minimap height', function () {
            expect(minimapElement.shadowRoot.querySelector('canvas').offsetHeight).toEqual(minimap.getHeight());
          });

          describe('when the content is modified', function () {
            beforeEach(function () {
              editor.insertText('foo\n\nbar\n');

              waitsFor('a new animation frame request', function () {
                return nextAnimationFrame !== noAnimationFrame;
              });

              runs(function () {
                return nextAnimationFrame();
              });
            });

            it('adjusts the canvas height to the new minimap height', function () {
              expect(minimapElement.shadowRoot.querySelector('canvas').offsetHeight).toEqual(minimap.getHeight());
            });
          });
        });
      });
    });

    describe('when the smoothScrolling setting is disabled', function () {
      beforeEach(function () {
        atom.config.set('minimap.smoothScrolling', false);
      });
      it('does not offset the canvas when the scroll does not match line height', function () {
        editorElement.setScrollTop(1004);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(realOffsetTop(canvas)).toEqual(0);
        });
      });
    });

    //     #######  ##     ## ####  ######  ##    ##
    //    ##     ## ##     ##  ##  ##    ## ##   ##
    //    ##     ## ##     ##  ##  ##       ##  ##
    //    ##     ## ##     ##  ##  ##       #####
    //    ##  ## ## ##     ##  ##  ##       ##  ##
    //    ##    ##  ##     ##  ##  ##    ## ##   ##
    //     ##### ##  #######  ####  ######  ##    ##
    //
    //     ######  ######## ######## ######## #### ##    ##  ######    ######
    //    ##    ## ##          ##       ##     ##  ###   ## ##    ##  ##    ##
    //    ##       ##          ##       ##     ##  ####  ## ##        ##
    //     ######  ######      ##       ##     ##  ## ## ## ##   ####  ######
    //          ## ##          ##       ##     ##  ##  #### ##    ##        ##
    //    ##    ## ##          ##       ##     ##  ##   ### ##    ##  ##    ##
    //     ######  ########    ##       ##    #### ##    ##  ######    ######

    describe('when minimap.displayPluginsControls setting is true', function () {
      var _ref12 = [];
      var openQuickSettings = _ref12[0];
      var quickSettingsElement = _ref12[1];
      var workspaceElement = _ref12[2];

      beforeEach(function () {
        atom.config.set('minimap.displayPluginsControls', true);
      });

      it('has a div to open the quick settings', function () {
        expect(minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')).toExist();
      });

      describe('clicking on the div', function () {
        beforeEach(function () {
          workspaceElement = atom.views.getView(atom.workspace);
          jasmineContent.appendChild(workspaceElement);

          openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
          (0, _helpersEvents.mousedown)(openQuickSettings);

          quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
        });

        afterEach(function () {
          minimapElement.quickSettingsElement.destroy();
        });

        it('opens the quick settings view', function () {
          expect(quickSettingsElement).toExist();
        });

        it('positions the quick settings view next to the minimap', function () {
          var minimapBounds = minimapElement.getFrontCanvas().getBoundingClientRect();
          var settingsBounds = quickSettingsElement.getBoundingClientRect();

          expect(realOffsetTop(quickSettingsElement)).toBeCloseTo(minimapBounds.top, 0);
          expect(realOffsetLeft(quickSettingsElement)).toBeCloseTo(minimapBounds.left - settingsBounds.width, 0);
        });
      });

      describe('when the displayMinimapOnLeft setting is enabled', function () {
        describe('clicking on the div', function () {
          beforeEach(function () {
            atom.config.set('minimap.displayMinimapOnLeft', true);

            workspaceElement = atom.views.getView(atom.workspace);
            jasmineContent.appendChild(workspaceElement);

            openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
            (0, _helpersEvents.mousedown)(openQuickSettings);

            quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
          });

          afterEach(function () {
            minimapElement.quickSettingsElement.destroy();
          });

          it('positions the quick settings view next to the minimap', function () {
            var minimapBounds = minimapElement.getFrontCanvas().getBoundingClientRect();

            expect(realOffsetTop(quickSettingsElement)).toBeCloseTo(minimapBounds.top, 0);
            expect(realOffsetLeft(quickSettingsElement)).toBeCloseTo(minimapBounds.right, 0);
          });
        });
      });

      describe('when the adjustMinimapWidthToSoftWrap setting is enabled', function () {
        var _ref13 = [];
        var controls = _ref13[0];

        beforeEach(function () {
          atom.config.set('editor.softWrap', true);
          atom.config.set('editor.softWrapAtPreferredLineLength', true);
          atom.config.set('editor.preferredLineLength', 2);

          atom.config.set('minimap.adjustMinimapWidthToSoftWrap', true);
          nextAnimationFrame();

          controls = minimapElement.shadowRoot.querySelector('.minimap-controls');
          openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');

          editorElement.style.width = '1024px';

          atom.views.performDocumentPoll();
          waitsFor('minimap frame requested', function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('adjusts the size of the control div to fit in the minimap', function () {
          expect(controls.clientWidth).toEqual(minimapElement.getFrontCanvas().clientWidth / devicePixelRatio);
        });

        it('positions the controls div over the canvas', function () {
          var controlsRect = controls.getBoundingClientRect();
          var canvasRect = minimapElement.getFrontCanvas().getBoundingClientRect();
          expect(controlsRect.left).toEqual(canvasRect.left);
          expect(controlsRect.right).toEqual(canvasRect.right);
        });

        describe('when the displayMinimapOnLeft setting is enabled', function () {
          beforeEach(function () {
            atom.config.set('minimap.displayMinimapOnLeft', true);
          });

          it('adjusts the size of the control div to fit in the minimap', function () {
            expect(controls.clientWidth).toEqual(minimapElement.getFrontCanvas().clientWidth / devicePixelRatio);
          });

          it('positions the controls div over the canvas', function () {
            var controlsRect = controls.getBoundingClientRect();
            var canvasRect = minimapElement.getFrontCanvas().getBoundingClientRect();
            expect(controlsRect.left).toEqual(canvasRect.left);
            expect(controlsRect.right).toEqual(canvasRect.right);
          });

          describe('clicking on the div', function () {
            beforeEach(function () {
              workspaceElement = atom.views.getView(atom.workspace);
              jasmineContent.appendChild(workspaceElement);

              openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
              (0, _helpersEvents.mousedown)(openQuickSettings);

              quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
            });

            afterEach(function () {
              minimapElement.quickSettingsElement.destroy();
            });

            it('positions the quick settings view next to the minimap', function () {
              var minimapBounds = minimapElement.getFrontCanvas().getBoundingClientRect();

              expect(realOffsetTop(quickSettingsElement)).toBeCloseTo(minimapBounds.top, 0);
              expect(realOffsetLeft(quickSettingsElement)).toBeCloseTo(minimapBounds.right, 0);
            });
          });
        });
      });

      describe('when the quick settings view is open', function () {
        beforeEach(function () {
          workspaceElement = atom.views.getView(atom.workspace);
          jasmineContent.appendChild(workspaceElement);

          openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
          (0, _helpersEvents.mousedown)(openQuickSettings);

          quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
        });

        it('sets the on right button active', function () {
          expect(quickSettingsElement.querySelector('.btn.selected:last-child')).toExist();
        });

        describe('clicking on the code highlight item', function () {
          beforeEach(function () {
            var item = quickSettingsElement.querySelector('li.code-highlights');
            (0, _helpersEvents.mousedown)(item);
          });

          it('toggles the code highlights on the minimap element', function () {
            expect(minimapElement.displayCodeHighlights).toBeTruthy();
          });

          it('requests an update', function () {
            expect(minimapElement.frameRequested).toBeTruthy();
          });
        });

        describe('clicking on the absolute mode item', function () {
          beforeEach(function () {
            var item = quickSettingsElement.querySelector('li.absolute-mode');
            (0, _helpersEvents.mousedown)(item);
          });

          it('toggles the absolute-mode setting', function () {
            expect(atom.config.get('minimap.absoluteMode')).toBeTruthy();
            expect(minimapElement.absoluteMode).toBeTruthy();
          });
        });

        describe('clicking on the on left button', function () {
          beforeEach(function () {
            var item = quickSettingsElement.querySelector('.btn:first-child');
            (0, _helpersEvents.mousedown)(item);
          });

          it('toggles the displayMinimapOnLeft setting', function () {
            expect(atom.config.get('minimap.displayMinimapOnLeft')).toBeTruthy();
          });

          it('changes the buttons activation state', function () {
            expect(quickSettingsElement.querySelector('.btn.selected:last-child')).not.toExist();
            expect(quickSettingsElement.querySelector('.btn.selected:first-child')).toExist();
          });
        });

        describe('core:move-left', function () {
          beforeEach(function () {
            atom.commands.dispatch(quickSettingsElement, 'core:move-left');
          });

          it('toggles the displayMinimapOnLeft setting', function () {
            expect(atom.config.get('minimap.displayMinimapOnLeft')).toBeTruthy();
          });

          it('changes the buttons activation state', function () {
            expect(quickSettingsElement.querySelector('.btn.selected:last-child')).not.toExist();
            expect(quickSettingsElement.querySelector('.btn.selected:first-child')).toExist();
          });
        });

        describe('core:move-right when the minimap is on the right', function () {
          beforeEach(function () {
            atom.config.set('minimap.displayMinimapOnLeft', true);
            atom.commands.dispatch(quickSettingsElement, 'core:move-right');
          });

          it('toggles the displayMinimapOnLeft setting', function () {
            expect(atom.config.get('minimap.displayMinimapOnLeft')).toBeFalsy();
          });

          it('changes the buttons activation state', function () {
            expect(quickSettingsElement.querySelector('.btn.selected:first-child')).not.toExist();
            expect(quickSettingsElement.querySelector('.btn.selected:last-child')).toExist();
          });
        });

        describe('clicking on the open settings button again', function () {
          beforeEach(function () {
            (0, _helpersEvents.mousedown)(openQuickSettings);
          });

          it('closes the quick settings view', function () {
            expect(workspaceElement.querySelector('minimap-quick-settings')).not.toExist();
          });

          it('removes the view from the element', function () {
            expect(minimapElement.quickSettingsElement).toBeNull();
          });
        });

        describe('when an external event destroys the view', function () {
          beforeEach(function () {
            minimapElement.quickSettingsElement.destroy();
          });

          it('removes the view reference from the element', function () {
            expect(minimapElement.quickSettingsElement).toBeNull();
          });
        });
      });

      describe('then disabling it', function () {
        beforeEach(function () {
          atom.config.set('minimap.displayPluginsControls', false);
        });

        it('removes the div', function () {
          expect(minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')).not.toExist();
        });
      });

      describe('with plugins registered in the package', function () {
        var _ref14 = [];
        var minimapPackage = _ref14[0];
        var pluginA = _ref14[1];
        var pluginB = _ref14[2];

        beforeEach(function () {
          waitsForPromise(function () {
            return atom.packages.activatePackage('minimap').then(function (pkg) {
              minimapPackage = pkg.mainModule;
            });
          });

          runs(function () {
            var Plugin = (function () {
              function Plugin() {
                _classCallCheck(this, Plugin);

                this.active = false;
              }

              _createClass(Plugin, [{
                key: 'activatePlugin',
                value: function activatePlugin() {
                  this.active = true;
                }
              }, {
                key: 'deactivatePlugin',
                value: function deactivatePlugin() {
                  this.active = false;
                }
              }, {
                key: 'isActive',
                value: function isActive() {
                  return this.active;
                }
              }]);

              return Plugin;
            })();

            pluginA = new Plugin();
            pluginB = new Plugin();

            minimapPackage.registerPlugin('dummyA', pluginA);
            minimapPackage.registerPlugin('dummyB', pluginB);

            workspaceElement = atom.views.getView(atom.workspace);
            jasmineContent.appendChild(workspaceElement);

            openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
            (0, _helpersEvents.mousedown)(openQuickSettings);

            quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
          });
        });

        it('creates one list item for each registered plugin', function () {
          expect(quickSettingsElement.querySelectorAll('li').length).toEqual(6);
        });

        it('selects the first item of the list', function () {
          expect(quickSettingsElement.querySelector('li.selected:first-child')).toExist();
        });

        describe('core:confirm', function () {
          beforeEach(function () {
            atom.commands.dispatch(quickSettingsElement, 'core:confirm');
          });

          it('disable the plugin of the selected item', function () {
            expect(pluginA.isActive()).toBeFalsy();
          });

          describe('triggered a second time', function () {
            beforeEach(function () {
              atom.commands.dispatch(quickSettingsElement, 'core:confirm');
            });

            it('enable the plugin of the selected item', function () {
              expect(pluginA.isActive()).toBeTruthy();
            });
          });

          describe('on the code highlight item', function () {
            var _ref15 = [];
            var initial = _ref15[0];

            beforeEach(function () {
              initial = minimapElement.displayCodeHighlights;
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:confirm');
            });

            it('toggles the code highlights on the minimap element', function () {
              expect(minimapElement.displayCodeHighlights).toEqual(!initial);
            });
          });

          describe('on the absolute mode item', function () {
            var _ref16 = [];
            var initial = _ref16[0];

            beforeEach(function () {
              initial = atom.config.get('minimap.absoluteMode');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:confirm');
            });

            it('toggles the code highlights on the minimap element', function () {
              expect(atom.config.get('minimap.absoluteMode')).toEqual(!initial);
            });
          });

          describe('on the adjust absolute mode height item', function () {
            var _ref17 = [];
            var initial = _ref17[0];

            beforeEach(function () {
              initial = atom.config.get('minimap.adjustAbsoluteModeHeight');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:confirm');
            });

            it('toggles the code highlights on the minimap element', function () {
              expect(atom.config.get('minimap.adjustAbsoluteModeHeight')).toEqual(!initial);
            });
          });
        });

        describe('core:move-down', function () {
          beforeEach(function () {
            atom.commands.dispatch(quickSettingsElement, 'core:move-down');
          });

          it('selects the second item', function () {
            expect(quickSettingsElement.querySelector('li.selected:nth-child(2)')).toExist();
          });

          describe('reaching a separator', function () {
            beforeEach(function () {
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
            });

            it('moves past the separator', function () {
              expect(quickSettingsElement.querySelector('li.code-highlights.selected')).toExist();
            });
          });

          describe('then core:move-up', function () {
            beforeEach(function () {
              atom.commands.dispatch(quickSettingsElement, 'core:move-up');
            });

            it('selects again the first item of the list', function () {
              expect(quickSettingsElement.querySelector('li.selected:first-child')).toExist();
            });
          });
        });

        describe('core:move-up', function () {
          beforeEach(function () {
            atom.commands.dispatch(quickSettingsElement, 'core:move-up');
          });

          it('selects the last item', function () {
            expect(quickSettingsElement.querySelector('li.selected:last-child')).toExist();
          });

          describe('reaching a separator', function () {
            beforeEach(function () {
              atom.commands.dispatch(quickSettingsElement, 'core:move-up');
              atom.commands.dispatch(quickSettingsElement, 'core:move-up');
              atom.commands.dispatch(quickSettingsElement, 'core:move-up');
            });

            it('moves past the separator', function () {
              expect(quickSettingsElement.querySelector('li.selected:nth-child(2)')).toExist();
            });
          });

          describe('then core:move-down', function () {
            beforeEach(function () {
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
            });

            it('selects again the first item of the list', function () {
              expect(quickSettingsElement.querySelector('li.selected:first-child')).toExist();
            });
          });
        });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9zcGVjL21pbmltYXAtZWxlbWVudC1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O3NCQUVlLFNBQVM7Ozs7dUJBQ1AsYUFBYTs7OzswQkFDVixnQkFBZ0I7Ozs7Z0NBQ1gscUJBQXFCOzs2QkFDaUMsa0JBQWtCOztBQU5qRyxXQUFXLENBQUE7O0FBUVgsU0FBUyxhQUFhLENBQUUsQ0FBQyxFQUFFOzs7QUFHekIsU0FBTyxDQUFDLENBQUMsU0FBUyxDQUFBO0NBQ25COztBQUVELFNBQVMsY0FBYyxDQUFFLENBQUMsRUFBRTs7O0FBRzFCLFNBQU8sQ0FBQyxDQUFDLFVBQVUsQ0FBQTtDQUNwQjs7QUFFRCxTQUFTLEtBQUssQ0FBRSxRQUFRLEVBQUU7QUFDeEIsTUFBTSxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQTtBQUNwQixVQUFRLENBQUksUUFBUSxTQUFNLFlBQU07QUFBRSxXQUFPLElBQUksSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQTtHQUFFLENBQUMsQ0FBQTtDQUN0RTs7QUFFRCxTQUFTLFlBQVksR0FBSTtBQUN2QixNQUFNLE1BQU0sR0FBRztBQUNiLFVBQU0sRUFBRSxLQUFLO0FBQ2Isa0JBQWMsRUFBQywwQkFBRztBQUFFLFVBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBO0tBQUU7QUFDeEMsb0JBQWdCLEVBQUMsNEJBQUc7QUFBRSxVQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQTtLQUFFO0FBQzNDLFlBQVEsRUFBQyxvQkFBRztBQUFFLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQTtLQUFFO0dBQ25DLENBQUE7QUFDRCxTQUFPLE1BQU0sQ0FBQTtDQUNkOztBQUVELFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxZQUFNO2FBQ3FGLEVBQUU7TUFBakgsTUFBTTtNQUFFLE9BQU87TUFBRSxXQUFXO01BQUUsWUFBWTtNQUFFLFdB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Q0FBQTs7QUFFRixjQUFFLENBQUMsMEJBQTBCLEVBQUUsWUFBTTtBQUNuQyxvQkFBTSxDQUFDLG9CQUFvQixDQUFDLGFBQWEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7YUFDakYsQ0FBQyxDQUFBO1dBQ0gsQ0FBQyxDQUFBOztBQUVGLGtCQUFRLENBQUMscUJBQXFCLEVBQUUsWUFBTTtBQUNwQyxzQkFBVSxDQUFDLFlBQU07QUFDZixrQkFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTthQUMvRCxDQUFDLENBQUE7O0FBRUYsY0FBRSxDQUFDLDBDQUEwQyxFQUFFLFlBQU07QUFDbkQsb0JBQU0sQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO2FBQ2hGLENBQUMsQ0FBQTtXQUNILENBQUMsQ0FBQTtTQUNILENBQUMsQ0FBQTtPQUNILENBQUMsQ0FBQTtLQUNILENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTtDQUNILENBQUMsQ0FBQSIsImZpbGUiOiIvaG9tZS90YWthYWtpLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvc3BlYy9taW5pbWFwLWVsZW1lbnQtc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBmcyBmcm9tICdmcy1wbHVzJ1xuaW1wb3J0IE1haW4gZnJvbSAnLi4vbGliL21haW4nXG5pbXBvcnQgTWluaW1hcCBmcm9tICcuLi9saWIvbWluaW1hcCdcbmltcG9ydCB7c3R5bGVzaGVldH0gZnJvbSAnLi9oZWxwZXJzL3dvcmtzcGFjZSdcbmltcG9ydCB7bW91c2Vtb3ZlLCBtb3VzZWRvd24sIG1vdXNldXAsIG1vdXNld2hlZWwsIHRvdWNoc3RhcnQsIHRvdWNobW92ZX0gZnJvbSAnLi9oZWxwZXJzL2V2ZW50cydcblxuZnVuY3Rpb24gcmVhbE9mZnNldFRvcCAobykge1xuICAvLyB0cmFuc2Zvcm0gPSBuZXcgV2ViS2l0Q1NTTWF0cml4IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG8pLnRyYW5zZm9ybVxuICAvLyBvLm9mZnNldFRvcCArIHRyYW5zZm9ybS5tNDJcbiAgcmV0dXJuIG8ub2Zmc2V0VG9wXG59XG5cbmZ1bmN0aW9uIHJlYWxPZmZzZXRMZWZ0IChvKSB7XG4gIC8vIHRyYW5zZm9ybSA9IG5ldyBXZWJLaXRDU1NNYXRyaXggd2luZG93LmdldENvbXB1dGVkU3R5bGUobykudHJhbnNmb3JtXG4gIC8vIG8ub2Zmc2V0TGVmdCArIHRyYW5zZm9ybS5tNDFcbiAgcmV0dXJuIG8ub2Zmc2V0TGVmdFxufVxuXG5mdW5jdGlvbiBzbGVlcCAoZHVyYXRpb24pIHtcbiAgY29uc3QgdCA9IG5ldyBEYXRlKClcbiAgd2FpdHNGb3IoYCR7ZHVyYXRpb259bXNgLCAoKSA9PiB7IHJldHVybiBuZXcgRGF0ZSgpIC0gdCA+IGR1cmF0aW9uIH0pXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVBsdWdpbiAoKSB7XG4gIGNvbnN0IHBsdWdpbiA9IHtcbiAgICBhY3RpdmU6IGZhbHNlLFxuICAgIGFjdGl2YXRlUGx1Z2luICgpIHsgdGhpcy5hY3RpdmUgPSB0cnVlIH0sXG4gICAgZGVhY3RpdmF0ZVBsdWdpbiAoKSB7IHRoaXMuYWN0aXZlID0gZmFsc2UgfSxcbiAgICBpc0FjdGl2ZSAoKSB7IHJldHVybiB0aGlzLmFjdGl2ZSB9XG4gIH1cbiAgcmV0dXJuIHBsdWdpblxufVxuXG5kZXNjcmliZSgnTWluaW1hcEVsZW1lbnQnLCAoKSA9PiB7XG4gIGxldCBbZWRpdG9yLCBtaW5pbWFwLCBsYXJnZVNhbXBsZSwgbWVkaXVtU2FtcGxlLCBzbWFsbFNhbXBsZSwgamFzbWluZUNvbnRlbnQsIGVkaXRvckVsZW1lbnQsIG1pbmltYXBFbGVtZW50LCBkaXJdID0gW11cblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAvLyBDb21tZW50IGFmdGVyIGJvZHkgYmVsb3cgdG8gbGVhdmUgdGhlIGNyZWF0ZWQgdGV4dCBlZGl0b3IgYW5kIG1pbmltYXBcbiAgICAvLyBvbiBET00gYWZ0ZXIgdGhlIHRlc3QgcnVuLlxuICAgIGphc21pbmVDb250ZW50ID0gZG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yKCcjamFzbWluZS1jb250ZW50JylcblxuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbWluaW1hcCcpKVxuXG4gICAgcnVucygoKSA9PiB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuY2hhckhlaWdodCcsIDQpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuY2hhcldpZHRoJywgMilcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5pbnRlcmxpbmUnLCAxKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnRleHRPcGFjaXR5JywgMSlcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5hdXRvVG9nZ2xlJywgdHJ1ZSlcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCcsIGZhbHNlKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlDb2RlSGlnaGxpZ2h0cycsIGZhbHNlKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMnLCBmYWxzZSlcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yJywgZmFsc2UpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuYWRqdXN0TWluaW1hcFdpZHRoVG9Tb2Z0V3JhcCcsIGZhbHNlKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnNtb290aFNjcm9sbGluZycsIHRydWUpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuYWRqdXN0TWluaW1hcFdpZHRoT25seUlmU21hbGxlcicsIHRydWUpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAucGx1Z2lucycsIHt9KVxuXG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3Ioe30pXG4gICAgICBlZGl0b3IuYXV0b0hlaWdodCA9IGZhbHNlXG5cbiAgICAgIGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgICAgamFzbWluZUNvbnRlbnQuaW5zZXJ0QmVmb3JlKGVkaXRvckVsZW1lbnQsIGphc21pbmVDb250ZW50LmZpcnN0Q2hpbGQpXG4gICAgICBlZGl0b3JFbGVtZW50LnNldEhlaWdodCg1MClcblxuICAgICAgbWluaW1hcCA9IG5ldyBNaW5pbWFwKHt0ZXh0RWRpdG9yOiBlZGl0b3J9KVxuICAgICAgZGlyID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClbMF1cblxuICAgICAgbGFyZ2VTYW1wbGUgPSBmcy5yZWFkRmlsZVN5bmMoZGlyLnJlc29sdmUoJ2xhcmdlLWZpbGUuY29mZmVlJykpLnRvU3RyaW5nKClcbiAgICAgIG1lZGl1bVNhbXBsZSA9IGZzLnJlYWRGaWxlU3luYyhkaXIucmVzb2x2ZSgndHdvLWh1bmRyZWQudHh0JykpLnRvU3RyaW5nKClcbiAgICAgIHNtYWxsU2FtcGxlID0gZnMucmVhZEZpbGVTeW5jKGRpci5yZXNvbHZlKCdzYW1wbGUuY29mZmVlJykpLnRvU3RyaW5nKClcblxuICAgICAgZWRpdG9yLnNldFRleHQobGFyZ2VTYW1wbGUpXG5cbiAgICAgIG1pbmltYXBFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KG1pbmltYXApXG4gICAgfSlcbiAgfSlcblxuICBpdCgnaGFzIGJlZW4gcmVnaXN0ZXJlZCBpbiB0aGUgdmlldyByZWdpc3RyeScsICgpID0+IHtcbiAgICBleHBlY3QobWluaW1hcEVsZW1lbnQpLnRvRXhpc3QoKVxuICB9KVxuXG4gIGl0KCdoYXMgc3RvcmVkIHRoZSBtaW5pbWFwIGFzIGl0cyBtb2RlbCcsICgpID0+IHtcbiAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZ2V0TW9kZWwoKSkudG9CZShtaW5pbWFwKVxuICB9KVxuXG4gIGl0KCdoYXMgYSBjYW52YXMgaW4gYSBzaGFkb3cgRE9NJywgKCkgPT4ge1xuICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpKS50b0V4aXN0KClcbiAgfSlcblxuICBpdCgnaGFzIGEgZGl2IHJlcHJlc2VudGluZyB0aGUgdmlzaWJsZSBhcmVhJywgKCkgPT4ge1xuICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5taW5pbWFwLXZpc2libGUtYXJlYScpKS50b0V4aXN0KClcbiAgfSlcblxuICAvLyAgICAgICAjIyMgICAgIyMjIyMjIyMgIyMjIyMjIyMgICAgIyMjICAgICAjIyMjIyMgICMjICAgICAjI1xuICAvLyAgICAgICMjICMjICAgICAgIyMgICAgICAgIyMgICAgICAjIyAjIyAgICMjICAgICMjICMjICAgICAjI1xuICAvLyAgICAgIyMgICAjIyAgICAgIyMgICAgICAgIyMgICAgICMjICAgIyMgICMjICAgICAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICMjICMjICAgICAgICMjIyMjIyMjI1xuICAvLyAgICAjIyMjIyMjIyMgICAgIyMgICAgICAgIyMgICAgIyMjIyMjIyMjICMjICAgICAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICMjICMjICAgICMjICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICMjICAjIyMjIyMgICMjICAgICAjI1xuXG4gIGRlc2NyaWJlKCd3aGVuIGF0dGFjaGVkIHRvIHRoZSB0ZXh0IGVkaXRvciBlbGVtZW50JywgKCkgPT4ge1xuICAgIGxldCBbbm9BbmltYXRpb25GcmFtZSwgbmV4dEFuaW1hdGlvbkZyYW1lLCByZXF1ZXN0QW5pbWF0aW9uRnJhbWVTYWZlLCBjYW52YXMsIHZpc2libGVBcmVhXSA9IFtdXG5cbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIG5vQW5pbWF0aW9uRnJhbWUgPSAoKSA9PiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3RlZCcpXG4gICAgICB9XG4gICAgICBuZXh0QW5pbWF0aW9uRnJhbWUgPSBub0FuaW1hdGlvbkZyYW1lXG5cbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZVNhZmUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICBzcHlPbih3aW5kb3csICdyZXF1ZXN0QW5pbWF0aW9uRnJhbWUnKS5hbmRDYWxsRmFrZSgoZm4pID0+IHtcbiAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lID0gKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSA9IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICBmbigpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgY2FudmFzID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdjYW52YXMnKVxuICAgICAgZWRpdG9yRWxlbWVudC5zZXRXaWR0aCgyMDApXG4gICAgICBlZGl0b3JFbGVtZW50LnNldEhlaWdodCg1MClcblxuICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMTAwMClcbiAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsTGVmdCgyMDApXG4gICAgICBtaW5pbWFwRWxlbWVudC5hdHRhY2goKVxuICAgIH0pXG5cbiAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgbWluaW1hcC5kZXN0cm95KClcbiAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWVTYWZlXG4gICAgfSlcblxuICAgIGl0KCdhZGRzIGEgd2l0aC1taW5pbWFwIGF0dHJpYnV0ZSBvbiB0aGUgdGV4dCBlZGl0b3IgZWxlbWVudCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50Lmhhc0F0dHJpYnV0ZSgnd2l0aC1taW5pbWFwJykpLnRvQmVUcnV0aHkoKVxuICAgIH0pXG5cbiAgICBpdCgndGFrZXMgdGhlIGhlaWdodCBvZiB0aGUgZWRpdG9yJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50Lm9mZnNldEhlaWdodCkudG9FcXVhbChlZGl0b3JFbGVtZW50LmNsaWVudEhlaWdodClcblxuICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50Lm9mZnNldFdpZHRoKS50b0JlQ2xvc2VUbyhlZGl0b3JFbGVtZW50LmNsaWVudFdpZHRoIC8gMTAsIDApXG4gICAgfSlcblxuICAgIGl0KCdrbm93cyB3aGVuIGF0dGFjaGVkIHRvIGEgdGV4dCBlZGl0b3InLCAoKSA9PiB7XG4gICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuYXR0YWNoZWRUb1RleHRFZGl0b3IpLnRvQmVUcnV0aHkoKVxuICAgIH0pXG5cbiAgICBpdCgncmVzaXplcyB0aGUgY2FudmFzIHRvIGZpdCB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChjYW52YXMub2Zmc2V0SGVpZ2h0IC8gZGV2aWNlUGl4ZWxSYXRpbykudG9CZUNsb3NlVG8obWluaW1hcEVsZW1lbnQub2Zmc2V0SGVpZ2h0ICsgbWluaW1hcC5nZXRMaW5lSGVpZ2h0KCksIDApXG4gICAgICBleHBlY3QoY2FudmFzLm9mZnNldFdpZHRoIC8gZGV2aWNlUGl4ZWxSYXRpbykudG9CZUNsb3NlVG8obWluaW1hcEVsZW1lbnQub2Zmc2V0V2lkdGgsIDApXG4gICAgfSlcblxuICAgIGl0KCdyZXF1ZXN0cyBhbiB1cGRhdGUnLCAoKSA9PiB7XG4gICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWQpLnRvQmVUcnV0aHkoKVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiBkZXRhY2hlZCcsICgpID0+IHtcbiAgICAgIGl0KCdyZW1vdmVzIHRoZSBhdHRyaWJ1dGUgZnJvbSB0aGUgZWRpdG9yJywgKCkgPT4ge1xuICAgICAgICBtaW5pbWFwRWxlbWVudC5kZXRhY2goKVxuXG4gICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50Lmhhc0F0dHJpYnV0ZSgnd2l0aC1taW5pbWFwJykpLnRvQmVGYWxzeSgpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICAvLyAgICAgIyMjIyMjICAgIyMjIyMjICAgIyMjIyMjXG4gICAgLy8gICAgIyMgICAgIyMgIyMgICAgIyMgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAgICAjIyAgICAgICAjI1xuICAgIC8vICAgICMjICAgICAgICAjIyMjIyMgICAjIyMjIyNcbiAgICAvLyAgICAjIyAgICAgICAgICAgICAjIyAgICAgICAjI1xuICAgIC8vICAgICMjICAgICMjICMjICAgICMjICMjICAgICMjXG4gICAgLy8gICAgICMjIyMjIyAgICMjIyMjIyAgICMjIyMjI1xuXG4gICAgZGVzY3JpYmUoJ3dpdGggY3NzIGZpbHRlcnMnLCAoKSA9PiB7XG4gICAgICBkZXNjcmliZSgnd2hlbiBhIGh1ZS1yb3RhdGUgZmlsdGVyIGlzIGFwcGxpZWQgdG8gYSByZ2IgY29sb3InLCAoKSA9PiB7XG4gICAgICAgIGxldCBbYWRkaXRpb25uYWxTdHlsZU5vZGVdID0gW11cbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgbWluaW1hcEVsZW1lbnQuaW52YWxpZGF0ZURPTVN0eWxlc0NhY2hlKClcblxuICAgICAgICAgIGFkZGl0aW9ubmFsU3R5bGVOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICAgICAgICAgIGFkZGl0aW9ubmFsU3R5bGVOb2RlLnRleHRDb250ZW50ID0gYFxuICAgICAgICAgICAgJHtzdHlsZXNoZWV0fVxuXG4gICAgICAgICAgICBhdG9tLXRleHQtZWRpdG9yOjpzaGFkb3cgLmVkaXRvciwgLmVkaXRvciB7XG4gICAgICAgICAgICAgIGNvbG9yOiByZWQ7XG4gICAgICAgICAgICAgIC13ZWJraXQtZmlsdGVyOiBodWUtcm90YXRlKDE4MGRlZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgYFxuXG4gICAgICAgICAgamFzbWluZUNvbnRlbnQuYXBwZW5kQ2hpbGQoYWRkaXRpb25uYWxTdHlsZU5vZGUpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2NvbXB1dGVzIHRoZSBuZXcgY29sb3IgYnkgYXBwbHlpbmcgdGhlIGh1ZSByb3RhdGlvbicsICgpID0+IHtcbiAgICAgICAgICB3YWl0c0ZvcignbmV3IGFuaW1hdGlvbiBmcmFtZScsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5yZXRyaWV2ZVN0eWxlRnJvbURvbShbJy5lZGl0b3InXSwgJ2NvbG9yJykpLnRvRXF1YWwoYHJnYigwLCAkezB4NmR9LCAkezB4NmR9KWApXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIGEgaHVlLXJvdGF0ZSBmaWx0ZXIgaXMgYXBwbGllZCB0byBhIHJnYmEgY29sb3InLCAoKSA9PiB7XG4gICAgICAgIGxldCBbYWRkaXRpb25uYWxTdHlsZU5vZGVdID0gW11cblxuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBtaW5pbWFwRWxlbWVudC5pbnZhbGlkYXRlRE9NU3R5bGVzQ2FjaGUoKVxuXG4gICAgICAgICAgYWRkaXRpb25uYWxTdHlsZU5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gICAgICAgICAgYWRkaXRpb25uYWxTdHlsZU5vZGUudGV4dENvbnRlbnQgPSBgXG4gICAgICAgICAgICAke3N0eWxlc2hlZXR9XG5cbiAgICAgICAgICAgIGF0b20tdGV4dC1lZGl0b3I6OnNoYWRvdyAuZWRpdG9yLCAuZWRpdG9yIHtcbiAgICAgICAgICAgICAgY29sb3I6IHJnYmEoMjU1LCAwLCAwLCAwKTtcbiAgICAgICAgICAgICAgLXdlYmtpdC1maWx0ZXI6IGh1ZS1yb3RhdGUoMTgwZGVnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBgXG5cbiAgICAgICAgICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZChhZGRpdGlvbm5hbFN0eWxlTm9kZSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnY29tcHV0ZXMgdGhlIG5ldyBjb2xvciBieSBhcHBseWluZyB0aGUgaHVlIHJvdGF0aW9uJywgKCkgPT4ge1xuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5yZXRyaWV2ZVN0eWxlRnJvbURvbShbJy5lZGl0b3InXSwgJ2NvbG9yJykpLnRvRXF1YWwoYHJnYmEoMCwgJHsweDZkfSwgJHsweDZkfSwgMClgKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICAvLyAgICAjIyAgICAgIyMgIyMjIyMjIyMgICMjIyMjIyMjICAgICAjIyMgICAgIyMjIyMjIyMgIyMjIyMjIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAgICMjICMjICAgICAgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAgIyMgICAjIyAgICAgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMjIyMjIyMgICMjICAgICAjIyAjIyAgICAgIyMgICAgIyMgICAgIyMjIyMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAgICAjIyAgICAgIyMgIyMjIyMjIyMjICAgICMjICAgICMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAgICAjIyAgICAgIyMgIyMgICAgICMjICAgICMjICAgICMjXG4gICAgLy8gICAgICMjIyMjIyMgICMjICAgICAgICAjIyMjIyMjIyAgIyMgICAgICMjICAgICMjICAgICMjIyMjIyMjXG5cbiAgICBkZXNjcmliZSgnd2hlbiB0aGUgdXBkYXRlIGlzIHBlcmZvcm1lZCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuICAgICAgICAgIHZpc2libGVBcmVhID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcubWluaW1hcC12aXNpYmxlLWFyZWEnKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3NldHMgdGhlIHZpc2libGUgYXJlYSB3aWR0aCBhbmQgaGVpZ2h0JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QodmlzaWJsZUFyZWEub2Zmc2V0V2lkdGgpLnRvRXF1YWwobWluaW1hcEVsZW1lbnQuY2xpZW50V2lkdGggKyBNYXRoLmZsb29yKG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZFNjcm9sbExlZnQoKSkpXG4gICAgICAgIGV4cGVjdCh2aXNpYmxlQXJlYS5vZmZzZXRIZWlnaHQpLnRvQmVDbG9zZVRvKG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpLCAwKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3NldHMgdGhlIHZpc2libGUgdmlzaWJsZSBhcmVhIG9mZnNldCcsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRUb3AodmlzaWJsZUFyZWEpKS50b0JlQ2xvc2VUbyhtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRTY3JvbGxUb3AoKSAtIG1pbmltYXAuZ2V0U2Nyb2xsVG9wKCksIDApXG5cbiAgICAgICAgZXhwZWN0KE1hdGguZmxvb3IocGFyc2VGbG9hdCh2aXNpYmxlQXJlYS5zdHlsZS5ib3JkZXJMZWZ0V2lkdGgpKSlcbiAgICAgICAgLnRvRXF1YWwoTWF0aC5mbG9vcihtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRTY3JvbGxMZWZ0KCkpKVxuICAgICAgfSlcblxuICAgICAgaXQoJ29mZnNldHMgdGhlIGNhbnZhcyB3aGVuIHRoZSBzY3JvbGwgZG9lcyBub3QgbWF0Y2ggbGluZSBoZWlnaHQnLCAoKSA9PiB7XG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDEwMDQpXG5cbiAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgIGV4cGVjdChyZWFsT2Zmc2V0VG9wKGNhbnZhcykpLnRvQmVDbG9zZVRvKC0yLCAtMSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdkb2VzIG5vdCBmYWlsIHRvIHVwZGF0ZSByZW5kZXIgdGhlIGludmlzaWJsZSBjaGFyIHdoZW4gbW9kaWZpZWQnLCAoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNob3dJbnZpc2libGVzJywgdHJ1ZSlcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3IuaW52aXNpYmxlcycsIHtjcjogJyonfSlcblxuICAgICAgICBleHBlY3QoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KS5ub3QudG9UaHJvdygpXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVuZGVycyB0aGUgZGVjb3JhdGlvbnMgYmFzZWQgb24gdGhlIG9yZGVyIHNldHRpbmdzJywgKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scycsIHRydWUpXG5cbiAgICAgICAgY29uc3QgcGx1Z2luRm9vID0gY3JlYXRlUGx1Z2luKClcbiAgICAgICAgY29uc3QgcGx1Z2luQmFyID0gY3JlYXRlUGx1Z2luKClcblxuICAgICAgICBNYWluLnJlZ2lzdGVyUGx1Z2luKCdmb28nLCBwbHVnaW5Gb28pXG4gICAgICAgIE1haW4ucmVnaXN0ZXJQbHVnaW4oJ2JhcicsIHBsdWdpbkJhcilcblxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAucGx1Z2lucy5mb29EZWNvcmF0aW9uc1pJbmRleCcsIDEpXG5cbiAgICAgICAgY29uc3QgY2FsbHMgPSBbXVxuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2RyYXdMaW5lRGVjb3JhdGlvbicpLmFuZENhbGxGYWtlKChkKSA9PiB7XG4gICAgICAgICAgY2FsbHMucHVzaChkLmdldFByb3BlcnRpZXMoKS5wbHVnaW4pXG4gICAgICAgIH0pXG4gICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnZHJhd0hpZ2hsaWdodERlY29yYXRpb24nKS5hbmRDYWxsRmFrZSgoZCkgPT4ge1xuICAgICAgICAgIGNhbGxzLnB1c2goZC5nZXRQcm9wZXJ0aWVzKCkucGx1Z2luKVxuICAgICAgICB9KVxuXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzEsIDBdLCBbMSwgMTBdXSksIHt0eXBlOiAnbGluZScsIGNvbG9yOiAnIzAwMDBGRicsIHBsdWdpbjogJ2Jhcid9KVxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxLCAwXSwgWzEsIDEwXV0pLCB7dHlwZTogJ2hpZ2hsaWdodC11bmRlcicsIGNvbG9yOiAnIzAwMDBGRicsIHBsdWdpbjogJ2Zvbyd9KVxuXG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDApXG5cbiAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgIGV4cGVjdChjYWxscykudG9FcXVhbChbJ2JhcicsICdmb28nXSlcblxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5wbHVnaW5zLmZvb0RlY29yYXRpb25zWkluZGV4JywgLTEpXG5cbiAgICAgICAgICBjYWxscy5sZW5ndGggPSAwXG4gICAgICAgIH0pXG5cbiAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfSlcblxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuXG4gICAgICAgICAgZXhwZWN0KGNhbGxzKS50b0VxdWFsKFsnZm9vJywgJ2JhciddKVxuXG4gICAgICAgICAgTWFpbi51bnJlZ2lzdGVyUGx1Z2luKCdmb28nKVxuICAgICAgICAgIE1haW4udW5yZWdpc3RlclBsdWdpbignYmFyJylcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW5kZXJzIHRoZSB2aXNpYmxlIGxpbmUgZGVjb3JhdGlvbnMnLCAoKSA9PiB7XG4gICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnZHJhd0xpbmVEZWNvcmF0aW9uJykuYW5kQ2FsbFRocm91Z2goKVxuXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzEsIDBdLCBbMSwgMTBdXSksIHt0eXBlOiAnbGluZScsIGNvbG9yOiAnIzAwMDBGRid9KVxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxMCwgMF0sIFsxMCwgMTBdXSksIHt0eXBlOiAnbGluZScsIGNvbG9yOiAnIzAwMDBGRid9KVxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxMDAsIDBdLCBbMTAwLCAxMF1dKSwge3R5cGU6ICdsaW5lJywgY29sb3I6ICcjMDAwMEZGJ30pXG5cbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMClcblxuICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRyYXdMaW5lRGVjb3JhdGlvbikudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRyYXdMaW5lRGVjb3JhdGlvbi5jYWxscy5sZW5ndGgpLnRvRXF1YWwoMilcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW5kZXJzIHRoZSB2aXNpYmxlIGd1dHRlciBkZWNvcmF0aW9ucycsICgpID0+IHtcbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdkcmF3R3V0dGVyRGVjb3JhdGlvbicpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxLCAwXSwgWzEsIDEwXV0pLCB7dHlwZTogJ2d1dHRlcicsIGNvbG9yOiAnIzAwMDBGRid9KVxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxMCwgMF0sIFsxMCwgMTBdXSksIHt0eXBlOiAnZ3V0dGVyJywgY29sb3I6ICcjMDAwMEZGJ30pXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzEwMCwgMF0sIFsxMDAsIDEwXV0pLCB7dHlwZTogJ2d1dHRlcicsIGNvbG9yOiAnIzAwMDBGRid9KVxuXG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDApXG5cbiAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3R3V0dGVyRGVjb3JhdGlvbikudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRyYXdHdXR0ZXJEZWNvcmF0aW9uLmNhbGxzLmxlbmd0aCkudG9FcXVhbCgyKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlbmRlcnMgdGhlIHZpc2libGUgaGlnaGxpZ2h0IGRlY29yYXRpb25zJywgKCkgPT4ge1xuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2RyYXdIaWdobGlnaHREZWNvcmF0aW9uJykuYW5kQ2FsbFRocm91Z2goKVxuXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzEsIDBdLCBbMSwgNF1dKSwge3R5cGU6ICdoaWdobGlnaHQtdW5kZXInLCBjb2xvcjogJyMwMDAwRkYnfSlcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMiwgMjBdLCBbMiwgMzBdXSksIHt0eXBlOiAnaGlnaGxpZ2h0LW92ZXInLCBjb2xvcjogJyMwMDAwRkYnfSlcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMTAwLCAzXSwgWzEwMCwgNV1dKSwge3R5cGU6ICdoaWdobGlnaHQtdW5kZXInLCBjb2xvcjogJyMwMDAwRkYnfSlcblxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgwKVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0hpZ2hsaWdodERlY29yYXRpb24pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3SGlnaGxpZ2h0RGVjb3JhdGlvbi5jYWxscy5sZW5ndGgpLnRvRXF1YWwoMilcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW5kZXJzIHRoZSB2aXNpYmxlIG91dGxpbmUgZGVjb3JhdGlvbnMnLCAoKSA9PiB7XG4gICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnZHJhd0hpZ2hsaWdodE91dGxpbmVEZWNvcmF0aW9uJykuYW5kQ2FsbFRocm91Z2goKVxuXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzEsIDRdLCBbMywgNl1dKSwge3R5cGU6ICdoaWdobGlnaHQtb3V0bGluZScsIGNvbG9yOiAnIzAwMDBmZid9KVxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1s2LCAwXSwgWzYsIDddXSksIHt0eXBlOiAnaGlnaGxpZ2h0LW91dGxpbmUnLCBjb2xvcjogJyMwMDAwZmYnfSlcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMTAwLCAzXSwgWzEwMCwgNV1dKSwge3R5cGU6ICdoaWdobGlnaHQtb3V0bGluZScsIGNvbG9yOiAnIzAwMDBmZid9KVxuXG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDApXG5cbiAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3SGlnaGxpZ2h0T3V0bGluZURlY29yYXRpb24pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3SGlnaGxpZ2h0T3V0bGluZURlY29yYXRpb24uY2FsbHMubGVuZ3RoKS50b0VxdWFsKDQpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVuZGVycyB0aGUgdmlzaWJsZSBjdXN0b20gZm9yZWdyb3VuZCBkZWNvcmF0aW9ucycsICgpID0+IHtcbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdkcmF3Q3VzdG9tRGVjb3JhdGlvbicpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICBjb25zdCByZW5kZXJSb3V0aW5lID0gamFzbWluZS5jcmVhdGVTcHkoJ3JlbmRlclJvdXRpbmUnKVxuXG4gICAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSB7XG4gICAgICAgICAgdHlwZTogJ2ZvcmVncm91bmQtY3VzdG9tJyxcbiAgICAgICAgICByZW5kZXI6IHJlbmRlclJvdXRpbmVcbiAgICAgICAgfVxuXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzEsIDRdLCBbMywgNl1dKSwgcHJvcGVydGllcylcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbNiwgMF0sIFs2LCA3XV0pLCBwcm9wZXJ0aWVzKVxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxMDAsIDNdLCBbMTAwLCA1XV0pLCBwcm9wZXJ0aWVzKVxuXG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDApXG5cbiAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3Q3VzdG9tRGVjb3JhdGlvbikudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRyYXdDdXN0b21EZWNvcmF0aW9uLmNhbGxzLmxlbmd0aCkudG9FcXVhbCg0KVxuXG4gICAgICAgICAgZXhwZWN0KHJlbmRlclJvdXRpbmUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIGV4cGVjdChyZW5kZXJSb3V0aW5lLmNhbGxzLmxlbmd0aCkudG9FcXVhbCg0KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlbmRlcnMgdGhlIHZpc2libGUgY3VzdG9tIGJhY2tncm91bmQgZGVjb3JhdGlvbnMnLCAoKSA9PiB7XG4gICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnZHJhd0N1c3RvbURlY29yYXRpb24nKS5hbmRDYWxsVGhyb3VnaCgpXG5cbiAgICAgICAgY29uc3QgcmVuZGVyUm91dGluZSA9IGphc21pbmUuY3JlYXRlU3B5KCdyZW5kZXJSb3V0aW5lJylcblxuICAgICAgICBjb25zdCBwcm9wZXJ0aWVzID0ge1xuICAgICAgICAgIHR5cGU6ICdiYWNrZ3JvdW5kLWN1c3RvbScsXG4gICAgICAgICAgcmVuZGVyOiByZW5kZXJSb3V0aW5lXG4gICAgICAgIH1cblxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxLCA0XSwgWzMsIDZdXSksIHByb3BlcnRpZXMpXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzYsIDBdLCBbNiwgN11dKSwgcHJvcGVydGllcylcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMTAwLCAzXSwgWzEwMCwgNV1dKSwgcHJvcGVydGllcylcblxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgwKVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0N1c3RvbURlY29yYXRpb24pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3Q3VzdG9tRGVjb3JhdGlvbi5jYWxscy5sZW5ndGgpLnRvRXF1YWwoNClcblxuICAgICAgICAgIGV4cGVjdChyZW5kZXJSb3V0aW5lKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgICBleHBlY3QocmVuZGVyUm91dGluZS5jYWxscy5sZW5ndGgpLnRvRXF1YWwoNClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBlZGl0b3IgaXMgc2Nyb2xsZWQnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDIwMDApXG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxMZWZ0KDUwKVxuXG4gICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3VwZGF0ZXMgdGhlIHZpc2libGUgYXJlYScsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QocmVhbE9mZnNldFRvcCh2aXNpYmxlQXJlYSkpLnRvQmVDbG9zZVRvKG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZFNjcm9sbFRvcCgpIC0gbWluaW1hcC5nZXRTY3JvbGxUb3AoKSwgMClcblxuICAgICAgICAgIGV4cGVjdChNYXRoLmZsb29yKHBhcnNlRmxvYXQodmlzaWJsZUFyZWEuc3R5bGUuYm9yZGVyTGVmdFdpZHRoKSkpXG4gICAgICAgICAgLnRvRXF1YWwoTWF0aC5mbG9vcihtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRTY3JvbGxMZWZ0KCkpKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGVkaXRvciBpcyByZXNpemVkIHRvIGEgZ3JlYXRlciBzaXplJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLndpZHRoID0gJzgwMHB4J1xuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJzUwMHB4J1xuXG4gICAgICAgICAgbWluaW1hcEVsZW1lbnQubWVhc3VyZUhlaWdodEFuZFdpZHRoKClcblxuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdkZXRlY3RzIHRoZSByZXNpemUgYW5kIGFkanVzdCBpdHNlbGYnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50Lm9mZnNldFdpZHRoKS50b0JlQ2xvc2VUbyhlZGl0b3JFbGVtZW50Lm9mZnNldFdpZHRoIC8gMTAsIDApXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50Lm9mZnNldEhlaWdodCkudG9FcXVhbChlZGl0b3JFbGVtZW50Lm9mZnNldEhlaWdodClcblxuICAgICAgICAgIGV4cGVjdChjYW52YXMub2Zmc2V0V2lkdGggLyBkZXZpY2VQaXhlbFJhdGlvKS50b0JlQ2xvc2VUbyhtaW5pbWFwRWxlbWVudC5vZmZzZXRXaWR0aCwgMClcbiAgICAgICAgICBleHBlY3QoY2FudmFzLm9mZnNldEhlaWdodCAvIGRldmljZVBpeGVsUmF0aW8pLnRvQmVDbG9zZVRvKG1pbmltYXBFbGVtZW50Lm9mZnNldEhlaWdodCArIG1pbmltYXAuZ2V0TGluZUhlaWdodCgpLCAwKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGVkaXRvciB2aXNpYmxlIGNvbnRlbnQgaXMgY2hhbmdlZCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxMZWZ0KDApXG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMTQwMClcbiAgICAgICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShbWzEwMSwgMF0sIFsxMDIsIDIwXV0pXG5cbiAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnZHJhd0xpbmVzJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2ZvbycpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgncmVyZW5kZXJzIHRoZSBwYXJ0IHRoYXQgaGF2ZSBjaGFuZ2VkJywgKCkgPT4ge1xuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRyYXdMaW5lcykudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICAgICAgICAgIGNvbnN0IFtmaXJzdExpbmUsIGxhc3RMaW5lXSA9IG1pbmltYXBFbGVtZW50LmRyYXdMaW5lcy5hcmdzRm9yQ2FsbFswXVxuXG4gICAgICAgICAgICBleHBlY3QoZmlyc3RMaW5lKS50b0VxdWFsKDEwMClcbiAgICAgICAgICAgIGV4cGVjdChsYXN0TGluZSA9PT0gMTAyIHx8IGxhc3RMaW5lID09PSAxMTEpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiB0aGUgZWRpdG9yIHZpc2liaWxpdHkgY2hhbmdlJywgKCkgPT4ge1xuICAgICAgICBpdCgnZG9lcyBub3QgbW9kaWZ5IHRoZSBzaXplIG9mIHRoZSBjYW52YXMnLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IGNhbnZhc1dpZHRoID0gbWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKS53aWR0aFxuICAgICAgICAgIGxldCBjYW52YXNIZWlnaHQgPSBtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLmhlaWdodFxuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuXG4gICAgICAgICAgbWluaW1hcEVsZW1lbnQubWVhc3VyZUhlaWdodEFuZFdpZHRoKClcblxuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKCkud2lkdGgpLnRvRXF1YWwoY2FudmFzV2lkdGgpXG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKS5oZWlnaHQpLnRvRXF1YWwoY2FudmFzSGVpZ2h0KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ2Zyb20gaGlkZGVuIHRvIHZpc2libGUnLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICAgICAgICAgIG1pbmltYXBFbGVtZW50LmNoZWNrRm9yVmlzaWJpbGl0eUNoYW5nZSgpXG4gICAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ3JlcXVlc3RGb3JjZWRVcGRhdGUnKVxuICAgICAgICAgICAgZWRpdG9yRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJydcbiAgICAgICAgICAgIG1pbmltYXBFbGVtZW50LnBvbGxET00oKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgncmVxdWVzdHMgYW4gdXBkYXRlIG9mIHRoZSB3aG9sZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnJlcXVlc3RGb3JjZWRVcGRhdGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICAvLyAgICAgIyMjIyMjICAgIyMjIyMjICAjIyMjIyMjIyAgICMjIyMjIyMgICMjICAgICAgICMjXG4gICAgLy8gICAgIyMgICAgIyMgIyMgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgICAjI1xuICAgIC8vICAgICMjICAgICAgICMjICAgICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICAgIyNcbiAgICAvLyAgICAgIyMjIyMjICAjIyAgICAgICAjIyMjIyMjIyAgIyMgICAgICMjICMjICAgICAgICMjXG4gICAgLy8gICAgICAgICAgIyMgIyMgICAgICAgIyMgICAjIyAgICMjICAgICAjIyAjIyAgICAgICAjI1xuICAgIC8vICAgICMjICAgICMjICMjICAgICMjICMjICAgICMjICAjIyAgICAgIyMgIyMgICAgICAgIyNcbiAgICAvLyAgICAgIyMjIyMjICAgIyMjIyMjICAjIyAgICAgIyMgICMjIyMjIyMgICMjIyMjIyMjICMjIyMjIyMjXG5cbiAgICBkZXNjcmliZSgnbW91c2Ugc2Nyb2xsIGNvbnRyb2xzJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0V2lkdGgoNDAwKVxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldEhlaWdodCg0MDApXG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDApXG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsTGVmdCgwKVxuXG4gICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgbWluaW1hcEVsZW1lbnQubWVhc3VyZUhlaWdodEFuZFdpZHRoKClcblxuICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd1c2luZyB0aGUgbW91c2Ugc2Nyb2xsd2hlZWwgb3ZlciB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgaXQoJ3JlbGF5cyB0aGUgZXZlbnRzIHRvIHRoZSBlZGl0b3IgdmlldycsICgpID0+IHtcbiAgICAgICAgICBzcHlPbihlZGl0b3JFbGVtZW50LmNvbXBvbmVudC5wcmVzZW50ZXIsICdzZXRTY3JvbGxUb3AnKS5hbmRDYWxsRmFrZSgoKSA9PiB7fSlcblxuICAgICAgICAgIG1vdXNld2hlZWwobWluaW1hcEVsZW1lbnQsIDAsIDE1KVxuXG4gICAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnByZXNlbnRlci5zZXRTY3JvbGxUb3ApLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBpbmRlcGVuZGVudE1pbmltYXBTY3JvbGwgc2V0dGluZyBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgICAgIGxldCBwcmV2aW91c1Njcm9sbFRvcFxuXG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuaW5kZXBlbmRlbnRNaW5pbWFwU2Nyb2xsJywgdHJ1ZSlcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5zY3JvbGxTZW5zaXRpdml0eScsIDAuNSlcblxuICAgICAgICAgICAgc3B5T24oZWRpdG9yRWxlbWVudC5jb21wb25lbnQucHJlc2VudGVyLCAnc2V0U2Nyb2xsVG9wJykuYW5kQ2FsbEZha2UoKCkgPT4ge30pXG5cbiAgICAgICAgICAgIHByZXZpb3VzU2Nyb2xsVG9wID0gbWluaW1hcC5nZXRTY3JvbGxUb3AoKVxuXG4gICAgICAgICAgICBtb3VzZXdoZWVsKG1pbmltYXBFbGVtZW50LCAwLCAtMTUpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdkb2VzIG5vdCByZWxheSB0aGUgZXZlbnRzIHRvIHRoZSBlZGl0b3InLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5jb21wb25lbnQucHJlc2VudGVyLnNldFNjcm9sbFRvcCkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnc2Nyb2xscyB0aGUgbWluaW1hcCBpbnN0ZWFkJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0U2Nyb2xsVG9wKCkpLm5vdC50b0VxdWFsKHByZXZpb3VzU2Nyb2xsVG9wKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnY2xhbXAgdGhlIG1pbmltYXAgc2Nyb2xsIGludG8gdGhlIGxlZ2l0IGJvdW5kcycsICgpID0+IHtcbiAgICAgICAgICAgIG1vdXNld2hlZWwobWluaW1hcEVsZW1lbnQsIDAsIC0xMDAwMDApXG5cbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwLmdldFNjcm9sbFRvcCgpKS50b0VxdWFsKG1pbmltYXAuZ2V0TWF4U2Nyb2xsVG9wKCkpXG5cbiAgICAgICAgICAgIG1vdXNld2hlZWwobWluaW1hcEVsZW1lbnQsIDAsIDEwMDAwMClcblxuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0U2Nyb2xsVG9wKCkpLnRvRXF1YWwoMClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ21pZGRsZSBjbGlja2luZyB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgbGV0IFtjYW52YXMsIHZpc2libGVBcmVhLCBvcmlnaW5hbExlZnQsIG1heFNjcm9sbF0gPSBbXVxuXG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGNhbnZhcyA9IG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKClcbiAgICAgICAgICB2aXNpYmxlQXJlYSA9IG1pbmltYXBFbGVtZW50LnZpc2libGVBcmVhXG4gICAgICAgICAgb3JpZ2luYWxMZWZ0ID0gdmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdFxuICAgICAgICAgIG1heFNjcm9sbCA9IG1pbmltYXAuZ2V0VGV4dEVkaXRvck1heFNjcm9sbFRvcCgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3Njcm9sbHMgdG8gdGhlIHRvcCB1c2luZyB0aGUgbWlkZGxlIG1vdXNlIGJ1dHRvbicsICgpID0+IHtcbiAgICAgICAgICBtb3VzZWRvd24oY2FudmFzLCB7eDogb3JpZ2luYWxMZWZ0ICsgMSwgeTogMCwgYnRuOiAxfSlcbiAgICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKSkudG9FcXVhbCgwKVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdzY3JvbGxpbmcgdG8gdGhlIG1pZGRsZSB1c2luZyB0aGUgbWlkZGxlIG1vdXNlIGJ1dHRvbicsICgpID0+IHtcbiAgICAgICAgICBsZXQgY2FudmFzTWlkWVxuXG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBsZXQgZWRpdG9yTWlkWSA9IGVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KCkgLyAyLjBcbiAgICAgICAgICAgIGxldCB7dG9wLCBoZWlnaHR9ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgICBjYW52YXNNaWRZID0gdG9wICsgKGhlaWdodCAvIDIuMClcbiAgICAgICAgICAgIGxldCBhY3R1YWxNaWRZID0gTWF0aC5taW4oY2FudmFzTWlkWSwgZWRpdG9yTWlkWSlcbiAgICAgICAgICAgIG1vdXNlZG93bihjYW52YXMsIHt4OiBvcmlnaW5hbExlZnQgKyAxLCB5OiBhY3R1YWxNaWRZLCBidG46IDF9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnc2Nyb2xscyB0aGUgZWRpdG9yIHRvIHRoZSBtaWRkbGUnLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgbWlkZGxlU2Nyb2xsVG9wID0gTWF0aC5yb3VuZCgobWF4U2Nyb2xsKSAvIDIuMClcbiAgICAgICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpKS50b0VxdWFsKG1pZGRsZVNjcm9sbFRvcClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3VwZGF0ZXMgdGhlIHZpc2libGUgYXJlYSB0byBiZSBjZW50ZXJlZCcsICgpID0+IHtcbiAgICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuICAgICAgICAgICAgICBsZXQge3RvcCwgaGVpZ2h0fSA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG5cbiAgICAgICAgICAgICAgbGV0IHZpc2libGVDZW50ZXJZID0gdG9wICsgKGhlaWdodCAvIDIpXG4gICAgICAgICAgICAgIGV4cGVjdCh2aXNpYmxlQ2VudGVyWSkudG9CZUNsb3NlVG8oMjAwLCAwKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdzY3JvbGxpbmcgdGhlIGVkaXRvciB0byBhbiBhcmJpdHJhcnkgbG9jYXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IFtzY3JvbGxUbywgc2Nyb2xsUmF0aW9dID0gW11cblxuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgc2Nyb2xsVG8gPSAxMDEgLy8gcGl4ZWxzXG4gICAgICAgICAgICBzY3JvbGxSYXRpbyA9IChzY3JvbGxUbyAtIG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpIC8gMikgLyAobWluaW1hcC5nZXRWaXNpYmxlSGVpZ2h0KCkgLSBtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRIZWlnaHQoKSlcbiAgICAgICAgICAgIHNjcm9sbFJhdGlvID0gTWF0aC5tYXgoMCwgc2Nyb2xsUmF0aW8pXG4gICAgICAgICAgICBzY3JvbGxSYXRpbyA9IE1hdGgubWluKDEsIHNjcm9sbFJhdGlvKVxuXG4gICAgICAgICAgICBtb3VzZWRvd24oY2FudmFzLCB7eDogb3JpZ2luYWxMZWZ0ICsgMSwgeTogc2Nyb2xsVG8sIGJ0bjogMX0pXG5cbiAgICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnc2Nyb2xscyB0aGUgZWRpdG9yIHRvIGFuIGFyYml0cmFyeSBsb2NhdGlvbicsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBleHBlY3RlZFNjcm9sbCA9IG1heFNjcm9sbCAqIHNjcm9sbFJhdGlvXG4gICAgICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKSkudG9CZUNsb3NlVG8oZXhwZWN0ZWRTY3JvbGwsIDApXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGRlc2NyaWJlKCdkcmFnZ2luZyB0aGUgdmlzaWJsZSBhcmVhIHdpdGggbWlkZGxlIG1vdXNlIGJ1dHRvbiAnICtcbiAgICAgICAgICAnYWZ0ZXIgc2Nyb2xsaW5nIHRvIHRoZSBhcmJpdHJhcnkgbG9jYXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgW29yaWdpbmFsVG9wXSA9IFtdXG5cbiAgICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICBvcmlnaW5hbFRvcCA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcFxuICAgICAgICAgICAgICBtb3VzZW1vdmUodmlzaWJsZUFyZWEsIHt4OiBvcmlnaW5hbExlZnQgKyAxLCB5OiBzY3JvbGxUbyArIDQwLCBidG46IDF9KVxuXG4gICAgICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICAgICAgICAgICAgbWluaW1hcEVsZW1lbnQuZW5kRHJhZygpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBpdCgnc2Nyb2xscyB0aGUgZWRpdG9yIHNvIHRoYXQgdGhlIHZpc2libGUgYXJlYSB3YXMgbW92ZWQgZG93biAnICtcbiAgICAgICAgICAgICdieSA0MCBwaXhlbHMgZnJvbSB0aGUgYXJiaXRyYXJ5IGxvY2F0aW9uJywgKCkgPT4ge1xuICAgICAgICAgICAgICBsZXQge3RvcH0gPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgICAgICBleHBlY3QodG9wKS50b0JlQ2xvc2VUbyhvcmlnaW5hbFRvcCArIDQwLCAtMSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdwcmVzc2luZyB0aGUgbW91c2Ugb24gdGhlIG1pbmltYXAgY2FudmFzICh3aXRob3V0IHNjcm9sbCBhbmltYXRpb24pJywgKCkgPT4ge1xuICAgICAgICBsZXQgY2FudmFzXG5cbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgbGV0IHQgPSAwXG4gICAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdnZXRUaW1lJykuYW5kQ2FsbEZha2UoKCkgPT4ge1xuICAgICAgICAgICAgbGV0IG4gPSB0XG4gICAgICAgICAgICB0ICs9IDEwMFxuICAgICAgICAgICAgcmV0dXJuIG5cbiAgICAgICAgICB9KVxuICAgICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAncmVxdWVzdFVwZGF0ZScpLmFuZENhbGxGYWtlKCgpID0+IHt9KVxuXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnNjcm9sbEFuaW1hdGlvbicsIGZhbHNlKVxuXG4gICAgICAgICAgY2FudmFzID0gbWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdzY3JvbGxzIHRoZSBlZGl0b3IgdG8gdGhlIGxpbmUgYmVsb3cgdGhlIG1vdXNlJywgKCkgPT4ge1xuICAgICAgICAgIG1vdXNlZG93bihjYW52YXMpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkpLnRvQmVDbG9zZVRvKDQ4MClcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnd2hlbiBpbmRlcGVuZGVudE1pbmltYXBTY3JvbGwgc2V0dGluZyBpcyBlbmFibGVkJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgbWluaW1hcC5zZXRTY3JvbGxUb3AoMTAwMClcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5pbmRlcGVuZGVudE1pbmltYXBTY3JvbGwnLCB0cnVlKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnc2Nyb2xscyB0aGUgZWRpdG9yIHRvIHRoZSBsaW5lIGJlbG93IHRoZSBtb3VzZScsICgpID0+IHtcbiAgICAgICAgICAgIG1vdXNlZG93bihjYW52YXMpXG4gICAgICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKSkudG9CZUNsb3NlVG8oNDgwKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ3doZW4gbW92ZUN1cnNvck9uTWluaW1hcENsaWNrIGlzIHRydWUnLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAubW92ZUN1cnNvck9uTWluaW1hcENsaWNrJywgdHJ1ZSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ21vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGNvcnJlc3BvbmRpbmcgbGluZScsICgpID0+IHtcbiAgICAgICAgICAgIG1vdXNlZG93bihjYW52YXMpXG4gICAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKCkpLnRvRXF1YWwoWzQwLCAwXSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3ByZXNzaW5nIHRoZSBtb3VzZSBvbiB0aGUgbWluaW1hcCBjYW52YXMgKHdpdGggc2Nyb2xsIGFuaW1hdGlvbiknLCAoKSA9PiB7XG4gICAgICAgIGxldCBjYW52YXNcblxuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBsZXQgdCA9IDBcbiAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2dldFRpbWUnKS5hbmRDYWxsRmFrZSgoKSA9PiB7XG4gICAgICAgICAgICBsZXQgbiA9IHRcbiAgICAgICAgICAgIHQgKz0gMTAwXG4gICAgICAgICAgICByZXR1cm4gblxuICAgICAgICAgIH0pXG4gICAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdyZXF1ZXN0VXBkYXRlJykuYW5kQ2FsbEZha2UoKCkgPT4ge30pXG5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuc2Nyb2xsQW5pbWF0aW9uJywgdHJ1ZSlcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuc2Nyb2xsQW5pbWF0aW9uRHVyYXRpb24nLCAzMDApXG5cbiAgICAgICAgICBjYW52YXMgPSBtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3Njcm9sbHMgdGhlIGVkaXRvciBncmFkdWFsbHkgdG8gdGhlIGxpbmUgYmVsb3cgdGhlIG1vdXNlJywgKCkgPT4ge1xuICAgICAgICAgIG1vdXNlZG93bihjYW52YXMpXG4gICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLy8gd2FpdCB1bnRpbCBhbGwgYW5pbWF0aW9ucyBydW4gb3V0XG4gICAgICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lICYmIG5leHRBbmltYXRpb25GcmFtZSgpXG4gICAgICAgICAgICByZXR1cm4gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKSA+PSA0ODBcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdzdG9wcyB0aGUgYW5pbWF0aW9uIGlmIHRoZSB0ZXh0IGVkaXRvciBpcyBkZXN0cm95ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgbW91c2Vkb3duKGNhbnZhcylcbiAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgZWRpdG9yLmRlc3Ryb3koKVxuXG4gICAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWUgJiYgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgICAgZXhwZWN0KG5leHRBbmltYXRpb25GcmFtZSA9PT0gbm9BbmltYXRpb25GcmFtZSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCd3aGVuIGluZGVwZW5kZW50TWluaW1hcFNjcm9sbCBzZXR0aW5nIGlzIGVuYWJsZWQnLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBtaW5pbWFwLnNldFNjcm9sbFRvcCgxMDAwKVxuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmluZGVwZW5kZW50TWluaW1hcFNjcm9sbCcsIHRydWUpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdzY3JvbGxzIHRoZSBlZGl0b3IgZ3JhZHVhbGx5IHRvIHRoZSBsaW5lIGJlbG93IHRoZSBtb3VzZScsICgpID0+IHtcbiAgICAgICAgICAgIG1vdXNlZG93bihjYW52YXMpXG4gICAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAvLyB3YWl0IHVudGlsIGFsbCBhbmltYXRpb25zIHJ1biBvdXRcbiAgICAgICAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lICYmIG5leHRBbmltYXRpb25GcmFtZSgpXG4gICAgICAgICAgICAgIHJldHVybiBlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpID49IDQ4MFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3N0b3BzIHRoZSBhbmltYXRpb24gaWYgdGhlIHRleHQgZWRpdG9yIGlzIGRlc3Ryb3llZCcsICgpID0+IHtcbiAgICAgICAgICAgIG1vdXNlZG93bihjYW52YXMpXG4gICAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICBlZGl0b3IuZGVzdHJveSgpXG5cbiAgICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lICYmIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICAgICAgZXhwZWN0KG5leHRBbmltYXRpb25GcmFtZSA9PT0gbm9BbmltYXRpb25GcmFtZSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdkcmFnZ2luZyB0aGUgdmlzaWJsZSBhcmVhJywgKCkgPT4ge1xuICAgICAgICBsZXQgW3Zpc2libGVBcmVhLCBvcmlnaW5hbFRvcF0gPSBbXVxuXG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIHZpc2libGVBcmVhID0gbWluaW1hcEVsZW1lbnQudmlzaWJsZUFyZWFcbiAgICAgICAgICBsZXQgbyA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgbGV0IGxlZnQgPSBvLmxlZnRcbiAgICAgICAgICBvcmlnaW5hbFRvcCA9IG8udG9wXG5cbiAgICAgICAgICBtb3VzZWRvd24odmlzaWJsZUFyZWEsIHt4OiBsZWZ0ICsgMTAsIHk6IG9yaWdpbmFsVG9wICsgMTB9KVxuICAgICAgICAgIG1vdXNlbW92ZSh2aXNpYmxlQXJlYSwge3g6IGxlZnQgKyAxMCwgeTogb3JpZ2luYWxUb3AgKyA1MH0pXG5cbiAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgICAgIG1pbmltYXBFbGVtZW50LmVuZERyYWcoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdzY3JvbGxzIHRoZSBlZGl0b3Igc28gdGhhdCB0aGUgdmlzaWJsZSBhcmVhIHdhcyBtb3ZlZCBkb3duIGJ5IDQwIHBpeGVscycsICgpID0+IHtcbiAgICAgICAgICBsZXQge3RvcH0gPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgIGV4cGVjdCh0b3ApLnRvQmVDbG9zZVRvKG9yaWdpbmFsVG9wICsgNDAsIC0xKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdzdG9wcyB0aGUgZHJhZyBnZXN0dXJlIHdoZW4gdGhlIG1vdXNlIGlzIHJlbGVhc2VkIG91dHNpZGUgdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IHt0b3AsIGxlZnR9ID0gdmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICBtb3VzZXVwKGphc21pbmVDb250ZW50LCB7eDogbGVmdCAtIDEwLCB5OiB0b3AgKyA4MH0pXG5cbiAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2RyYWcnKVxuICAgICAgICAgIG1vdXNlbW92ZSh2aXNpYmxlQXJlYSwge3g6IGxlZnQgKyAxMCwgeTogdG9wICsgNTB9KVxuXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRyYWcpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdkcmFnZ2luZyB0aGUgdmlzaWJsZSBhcmVhIHVzaW5nIHRvdWNoIGV2ZW50cycsICgpID0+IHtcbiAgICAgICAgbGV0IFt2aXNpYmxlQXJlYSwgb3JpZ2luYWxUb3BdID0gW11cblxuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICB2aXNpYmxlQXJlYSA9IG1pbmltYXBFbGVtZW50LnZpc2libGVBcmVhXG4gICAgICAgICAgbGV0IG8gPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgIGxldCBsZWZ0ID0gby5sZWZ0XG4gICAgICAgICAgb3JpZ2luYWxUb3AgPSBvLnRvcFxuXG4gICAgICAgICAgdG91Y2hzdGFydCh2aXNpYmxlQXJlYSwge3g6IGxlZnQgKyAxMCwgeTogb3JpZ2luYWxUb3AgKyAxMH0pXG4gICAgICAgICAgdG91Y2htb3ZlKHZpc2libGVBcmVhLCB7eDogbGVmdCArIDEwLCB5OiBvcmlnaW5hbFRvcCArIDUwfSlcblxuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICAgICAgbWluaW1hcEVsZW1lbnQuZW5kRHJhZygpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3Njcm9sbHMgdGhlIGVkaXRvciBzbyB0aGF0IHRoZSB2aXNpYmxlIGFyZWEgd2FzIG1vdmVkIGRvd24gYnkgNDAgcGl4ZWxzJywgKCkgPT4ge1xuICAgICAgICAgIGxldCB7dG9wfSA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgZXhwZWN0KHRvcCkudG9CZUNsb3NlVG8ob3JpZ2luYWxUb3AgKyA0MCwgLTEpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3N0b3BzIHRoZSBkcmFnIGdlc3R1cmUgd2hlbiB0aGUgbW91c2UgaXMgcmVsZWFzZWQgb3V0c2lkZSB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICBsZXQge3RvcCwgbGVmdH0gPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgIG1vdXNldXAoamFzbWluZUNvbnRlbnQsIHt4OiBsZWZ0IC0gMTAsIHk6IHRvcCArIDgwfSlcblxuICAgICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnZHJhZycpXG4gICAgICAgICAgdG91Y2htb3ZlKHZpc2libGVBcmVhLCB7eDogbGVmdCArIDEwLCB5OiB0b3AgKyA1MH0pXG5cbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhZykubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIG1pbmltYXAgY2Fubm90IHNjcm9sbCcsICgpID0+IHtcbiAgICAgICAgbGV0IFt2aXNpYmxlQXJlYSwgb3JpZ2luYWxUb3BdID0gW11cblxuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBsZXQgc2FtcGxlID0gZnMucmVhZEZpbGVTeW5jKGRpci5yZXNvbHZlKCdzZXZlbnR5LnR4dCcpKS50b1N0cmluZygpXG4gICAgICAgICAgZWRpdG9yLnNldFRleHQoc2FtcGxlKVxuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDApXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ2RyYWdnaW5nIHRoZSB2aXNpYmxlIGFyZWEnLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgICAgICB2aXNpYmxlQXJlYSA9IG1pbmltYXBFbGVtZW50LnZpc2libGVBcmVhXG4gICAgICAgICAgICAgIGxldCB7dG9wLCBsZWZ0fSA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgICAgIG9yaWdpbmFsVG9wID0gdG9wXG5cbiAgICAgICAgICAgICAgbW91c2Vkb3duKHZpc2libGVBcmVhLCB7eDogbGVmdCArIDEwLCB5OiB0b3AgKyAxMH0pXG4gICAgICAgICAgICAgIG1vdXNlbW92ZSh2aXNpYmxlQXJlYSwge3g6IGxlZnQgKyAxMCwgeTogdG9wICsgNTB9KVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBtaW5pbWFwRWxlbWVudC5lbmREcmFnKClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3Njcm9sbHMgYmFzZWQgb24gYSByYXRpbyBhZGp1c3RlZCB0byB0aGUgbWluaW1hcCBoZWlnaHQnLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQge3RvcH0gPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgICAgZXhwZWN0KHRvcCkudG9CZUNsb3NlVG8ob3JpZ2luYWxUb3AgKyA0MCwgLTEpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHNjcm9sbCBwYXN0IGVuZCBpcyBlbmFibGVkJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5zY3JvbGxQYXN0RW5kJywgdHJ1ZSlcblxuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdkcmFnZ2luZyB0aGUgdmlzaWJsZSBhcmVhJywgKCkgPT4ge1xuICAgICAgICAgIGxldCBbb3JpZ2luYWxUb3AsIHZpc2libGVBcmVhXSA9IFtdXG5cbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIHZpc2libGVBcmVhID0gbWluaW1hcEVsZW1lbnQudmlzaWJsZUFyZWFcbiAgICAgICAgICAgIGxldCB7dG9wLCBsZWZ0fSA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgICBvcmlnaW5hbFRvcCA9IHRvcFxuXG4gICAgICAgICAgICBtb3VzZWRvd24odmlzaWJsZUFyZWEsIHt4OiBsZWZ0ICsgMTAsIHk6IHRvcCArIDEwfSlcbiAgICAgICAgICAgIG1vdXNlbW92ZSh2aXNpYmxlQXJlYSwge3g6IGxlZnQgKyAxMCwgeTogdG9wICsgNTB9KVxuXG4gICAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIG1pbmltYXBFbGVtZW50LmVuZERyYWcoKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnc2Nyb2xscyB0aGUgZWRpdG9yIHNvIHRoYXQgdGhlIHZpc2libGUgYXJlYSB3YXMgbW92ZWQgZG93biBieSA0MCBwaXhlbHMnLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQge3RvcH0gPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgICAgZXhwZWN0KHRvcCkudG9CZUNsb3NlVG8ob3JpZ2luYWxUb3AgKyA0MCwgLTEpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIC8vICAgICAjIyMjIyMgICMjIyMjIyMjICAgICMjIyAgICAjIyAgICAjIyAjIyMjIyMjI1xuICAgIC8vICAgICMjICAgICMjICAgICMjICAgICAgIyMgIyMgICAjIyMgICAjIyAjIyAgICAgIyNcbiAgICAvLyAgICAjIyAgICAgICAgICAjIyAgICAgIyMgICAjIyAgIyMjIyAgIyMgIyMgICAgICMjXG4gICAgLy8gICAgICMjIyMjIyAgICAgIyMgICAgIyMgICAgICMjICMjICMjICMjICMjICAgICAjI1xuICAgIC8vICAgICAgICAgICMjICAgICMjICAgICMjIyMjIyMjIyAjIyAgIyMjIyAjIyAgICAgIyNcbiAgICAvLyAgICAjIyAgICAjIyAgICAjIyAgICAjIyAgICAgIyMgIyMgICAjIyMgIyMgICAgICMjXG4gICAgLy8gICAgICMjIyMjIyAgICAgIyMgICAgIyMgICAgICMjICMjICAgICMjICMjIyMjIyMjXG4gICAgLy9cbiAgICAvLyAgICAgICAjIyMgICAgIyMgICAgICAgICMjIyMjIyMgICMjICAgICMjICMjIyMjIyMjXG4gICAgLy8gICAgICAjIyAjIyAgICMjICAgICAgICMjICAgICAjIyAjIyMgICAjIyAjI1xuICAgIC8vICAgICAjIyAgICMjICAjIyAgICAgICAjIyAgICAgIyMgIyMjIyAgIyMgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjICMjICMjICMjICMjIyMjI1xuICAgIC8vICAgICMjIyMjIyMjIyAjIyAgICAgICAjIyAgICAgIyMgIyMgICMjIyMgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjICMjICAgIyMjICMjXG4gICAgLy8gICAgIyMgICAgICMjICMjIyMjIyMjICAjIyMjIyMjICAjIyAgICAjIyAjIyMjIyMjI1xuXG4gICAgZGVzY3JpYmUoJ3doZW4gdGhlIG1vZGVsIGlzIGEgc3RhbmQtYWxvbmUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBtaW5pbWFwLnNldFN0YW5kQWxvbmUodHJ1ZSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdoYXMgYSBzdGFuZC1hbG9uZSBhdHRyaWJ1dGUnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5oYXNBdHRyaWJ1dGUoJ3N0YW5kLWFsb25lJykpLnRvQmVUcnV0aHkoKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3NldHMgdGhlIG1pbmltYXAgc2l6ZSB3aGVuIG1lYXN1cmVkJywgKCkgPT4ge1xuICAgICAgICBtaW5pbWFwRWxlbWVudC5tZWFzdXJlSGVpZ2h0QW5kV2lkdGgoKVxuXG4gICAgICAgIGV4cGVjdChtaW5pbWFwLndpZHRoKS50b0VxdWFsKG1pbmltYXBFbGVtZW50LmNsaWVudFdpZHRoKVxuICAgICAgICBleHBlY3QobWluaW1hcC5oZWlnaHQpLnRvRXF1YWwobWluaW1hcEVsZW1lbnQuY2xpZW50SGVpZ2h0KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlbW92ZXMgdGhlIGNvbnRyb2xzIGRpdicsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtY29udHJvbHMnKSkudG9CZU51bGwoKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlbW92ZXMgdGhlIHZpc2libGUgYXJlYScsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnZpc2libGVBcmVhKS50b0JlVW5kZWZpbmVkKClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW1vdmVzIHRoZSBxdWljayBzZXR0aW5ncyBidXR0b24nLCAoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzJywgdHJ1ZSlcblxuICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5vcGVuUXVpY2tTZXR0aW5ncykudG9CZVVuZGVmaW5lZCgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVtb3ZlcyB0aGUgc2Nyb2xsIGluZGljYXRvcicsICgpID0+IHtcbiAgICAgICAgZWRpdG9yLnNldFRleHQobWVkaXVtU2FtcGxlKVxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCg1MClcblxuICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLm1pbmltYXBTY3JvbGxJbmRpY2F0b3InLCB0cnVlKVxuICAgICAgICB9KVxuXG4gICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcubWluaW1hcC1zY3JvbGwtaW5kaWNhdG9yJykpLnRvQmVOdWxsKClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdwcmVzc2luZyB0aGUgbW91c2Ugb24gdGhlIG1pbmltYXAgY2FudmFzJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZChtaW5pbWFwRWxlbWVudClcblxuICAgICAgICAgIGxldCB0ID0gMFxuICAgICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnZ2V0VGltZScpLmFuZENhbGxGYWtlKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBuID0gdFxuICAgICAgICAgICAgdCArPSAxMDBcbiAgICAgICAgICAgIHJldHVybiBuXG4gICAgICAgICAgfSlcbiAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ3JlcXVlc3RVcGRhdGUnKS5hbmRDYWxsRmFrZSgoKSA9PiB7fSlcblxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5zY3JvbGxBbmltYXRpb24nLCBmYWxzZSlcblxuICAgICAgICAgIGNhbnZhcyA9IG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKClcbiAgICAgICAgICBtb3VzZWRvd24oY2FudmFzKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdkb2VzIG5vdCBzY3JvbGwgdGhlIGVkaXRvciB0byB0aGUgbGluZSBiZWxvdyB0aGUgbW91c2UnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkpLnRvRXF1YWwoMTAwMClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdhbmQgaXMgY2hhbmdlZCB0byBiZSBhIGNsYXNzaWNhbCBtaW5pbWFwIGFnYWluJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scycsIHRydWUpXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLm1pbmltYXBTY3JvbGxJbmRpY2F0b3InLCB0cnVlKVxuXG4gICAgICAgICAgbWluaW1hcC5zZXRTdGFuZEFsb25lKGZhbHNlKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdyZWNyZWF0ZXMgdGhlIGRlc3Ryb3llZCBlbGVtZW50cycsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcubWluaW1hcC1jb250cm9scycpKS50b0V4aXN0KClcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcubWluaW1hcC12aXNpYmxlLWFyZWEnKSkudG9FeGlzdCgpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtc2Nyb2xsLWluZGljYXRvcicpKS50b0V4aXN0KClcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJykpLnRvRXhpc3QoKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgLy8gICAgIyMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMgICMjIyMjIyMjICMjIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgIyMgICAgIyMgICAgIyMgICAgICMjICMjICAgICAjIyAgIyMgICMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAgICAgICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgICAjIyMjXG4gICAgLy8gICAgIyMgICAgICMjICMjIyMjIyAgICAjIyMjIyMgICAgICMjICAgICMjIyMjIyMjICAjIyAgICAgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgICAgICAgIyMgICAgIyMgICAgIyMgICAjIyAgICMjICAgICAjIyAgICAjI1xuICAgIC8vICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAjIyAgICAjIyAgICAjIyAgICAjIyAgIyMgICAgICMjICAgICMjXG4gICAgLy8gICAgIyMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMgICAgICMjICAgICMjICAgICAjIyAgIyMjIyMjIyAgICAgIyNcblxuICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBtb2RlbCBpcyBkZXN0cm95ZWQnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgbWluaW1hcC5kZXN0cm95KClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdkZXRhY2hlcyBpdHNlbGYgZnJvbSBpdHMgcGFyZW50JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQucGFyZW50Tm9kZSkudG9CZU51bGwoKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3N0b3BzIHRoZSBET00gcG9sbGluZyBpbnRlcnZhbCcsICgpID0+IHtcbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdwb2xsRE9NJylcblxuICAgICAgICBzbGVlcCgyMDApXG5cbiAgICAgICAgcnVucygoKSA9PiB7IGV4cGVjdChtaW5pbWFwRWxlbWVudC5wb2xsRE9NKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICAvLyAgICAgIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgIyMgIyMjIyMjIyMgIyMjIyAgIyMjIyMjXG4gICAgLy8gICAgIyMgICAgIyMgIyMgICAgICMjICMjIyAgICMjICMjICAgICAgICAjIyAgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMjIyAgIyMgIyMgICAgICAgICMjICAjI1xuICAgIC8vICAgICMjICAgICAgICMjICAgICAjIyAjIyAjIyAjIyAjIyMjIyMgICAgIyMgICMjICAgIyMjI1xuICAgIC8vICAgICMjICAgICAgICMjICAgICAjIyAjIyAgIyMjIyAjIyAgICAgICAgIyMgICMjICAgICMjXG4gICAgLy8gICAgIyMgICAgIyMgIyMgICAgICMjICMjICAgIyMjICMjICAgICAgICAjIyAgIyMgICAgIyNcbiAgICAvLyAgICAgIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgIyMgIyMgICAgICAgIyMjIyAgIyMjIyMjXG5cbiAgICBkZXNjcmliZSgnd2hlbiB0aGUgYXRvbSBzdHlsZXMgYXJlIGNoYW5nZWQnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcbiAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ3JlcXVlc3RGb3JjZWRVcGRhdGUnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdpbnZhbGlkYXRlRE9NU3R5bGVzQ2FjaGUnKS5hbmRDYWxsVGhyb3VnaCgpXG5cbiAgICAgICAgICBsZXQgc3R5bGVOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICAgICAgICAgIHN0eWxlTm9kZS50ZXh0Q29udGVudCA9ICdib2R5eyBjb2xvcjogIzIzMyB9J1xuICAgICAgICAgIGF0b20uc3R5bGVzLmVtaXR0ZXIuZW1pdCgnZGlkLWFkZC1zdHlsZS1lbGVtZW50Jywgc3R5bGVOb2RlKVxuICAgICAgICB9KVxuXG4gICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdmb3JjZXMgYSByZWZyZXNoIHdpdGggY2FjaGUgaW52YWxpZGF0aW9uJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQucmVxdWVzdEZvcmNlZFVwZGF0ZSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5pbnZhbGlkYXRlRE9NU3R5bGVzQ2FjaGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gbWluaW1hcC50ZXh0T3BhY2l0eSBpcyBjaGFuZ2VkJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAncmVxdWVzdEZvcmNlZFVwZGF0ZScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnRleHRPcGFjaXR5JywgMC4zKVxuXG4gICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVxdWVzdHMgYSBjb21wbGV0ZSB1cGRhdGUnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5yZXF1ZXN0Rm9yY2VkVXBkYXRlKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIG1pbmltYXAuZGlzcGxheUNvZGVIaWdobGlnaHRzIGlzIGNoYW5nZWQnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdyZXF1ZXN0Rm9yY2VkVXBkYXRlJykuYW5kQ2FsbFRocm91Z2goKVxuXG4gICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGF0dGFjaGVkJywgKCkgPT4gbWluaW1hcEVsZW1lbnQuYXR0YWNoZWQpXG5cbiAgICAgICAgcnVucygoKSA9PiB7IGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5Q29kZUhpZ2hsaWdodHMnLCB0cnVlKSB9KVxuXG4gICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkKVxuXG4gICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlcXVlc3RzIGEgY29tcGxldGUgdXBkYXRlJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQucmVxdWVzdEZvcmNlZFVwZGF0ZSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiBtaW5pbWFwLmNoYXJXaWR0aCBpcyBjaGFuZ2VkJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAncmVxdWVzdEZvcmNlZFVwZGF0ZScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmNoYXJXaWR0aCcsIDEpXG5cbiAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgZnJhbWUgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZXF1ZXN0cyBhIGNvbXBsZXRlIHVwZGF0ZScsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnJlcXVlc3RGb3JjZWRVcGRhdGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gbWluaW1hcC5jaGFySGVpZ2h0IGlzIGNoYW5nZWQnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdyZXF1ZXN0Rm9yY2VkVXBkYXRlJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuY2hhckhlaWdodCcsIDEpXG5cbiAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgZnJhbWUgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZXF1ZXN0cyBhIGNvbXBsZXRlIHVwZGF0ZScsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnJlcXVlc3RGb3JjZWRVcGRhdGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gbWluaW1hcC5pbnRlcmxpbmUgaXMgY2hhbmdlZCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ3JlcXVlc3RGb3JjZWRVcGRhdGUnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5pbnRlcmxpbmUnLCAyKVxuXG4gICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVxdWVzdHMgYSBjb21wbGV0ZSB1cGRhdGUnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5yZXF1ZXN0Rm9yY2VkVXBkYXRlKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIG1pbmltYXAuZGlzcGxheU1pbmltYXBPbkxlZnQgc2V0dGluZyBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgaXQoJ21vdmVzIHRoZSBhdHRhY2hlZCBtaW5pbWFwIHRvIHRoZSBsZWZ0JywgKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheU1pbmltYXBPbkxlZnQnLCB0cnVlKVxuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdsZWZ0JykpLnRvQmVUcnV0aHkoKVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIG1pbmltYXAgaXMgbm90IGF0dGFjaGVkIHlldCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuYnVpbGRUZXh0RWRpdG9yKHt9KVxuICAgICAgICAgIGVkaXRvci5hdXRvSGVpZ2h0ID0gZmFsc2VcbiAgICAgICAgICBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICAgICAgICBlZGl0b3JFbGVtZW50LnNldEhlaWdodCg1MClcbiAgICAgICAgICBlZGl0b3Iuc2V0TGluZUhlaWdodEluUGl4ZWxzKDEwKVxuXG4gICAgICAgICAgbWluaW1hcCA9IG5ldyBNaW5pbWFwKHt0ZXh0RWRpdG9yOiBlZGl0b3J9KVxuICAgICAgICAgIG1pbmltYXBFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KG1pbmltYXApXG5cbiAgICAgICAgICBqYXNtaW5lQ29udGVudC5pbnNlcnRCZWZvcmUoZWRpdG9yRWxlbWVudCwgamFzbWluZUNvbnRlbnQuZmlyc3RDaGlsZClcblxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCcsIHRydWUpXG4gICAgICAgICAgbWluaW1hcEVsZW1lbnQuYXR0YWNoKClcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnbW92ZXMgdGhlIGF0dGFjaGVkIG1pbmltYXAgdG8gdGhlIGxlZnQnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnbGVmdCcpKS50b0JlVHJ1dGh5KClcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIG1pbmltYXAuYWRqdXN0TWluaW1hcFdpZHRoVG9Tb2Z0V3JhcCBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNvZnRXcmFwJywgdHJ1ZSlcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3Iuc29mdFdyYXBBdFByZWZlcnJlZExpbmVMZW5ndGgnLCB0cnVlKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5wcmVmZXJyZWRMaW5lTGVuZ3RoJywgMilcblxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuYWRqdXN0TWluaW1hcFdpZHRoVG9Tb2Z0V3JhcCcsIHRydWUpXG5cbiAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgZnJhbWUgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdhZGp1c3RzIHRoZSB3aWR0aCBvZiB0aGUgbWluaW1hcCBjYW52YXMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLndpZHRoIC8gZGV2aWNlUGl4ZWxSYXRpbykudG9FcXVhbCg0KVxuICAgICAgfSlcblxuICAgICAgaXQoJ29mZnNldHMgdGhlIG1pbmltYXAgYnkgdGhlIGRpZmZlcmVuY2UnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChyZWFsT2Zmc2V0TGVmdChtaW5pbWFwRWxlbWVudCkpLnRvQmVDbG9zZVRvKGVkaXRvckVsZW1lbnQuY2xpZW50V2lkdGggLSA0LCAtMSlcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmNsaWVudFdpZHRoKS50b0VxdWFsKDQpXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgndGhlIGRvbSBwb2xsaW5nIHJvdXRpbmUnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdkb2VzIG5vdCBjaGFuZ2UgdGhlIHZhbHVlJywgKCkgPT4ge1xuICAgICAgICAgIGF0b20udmlld3MucGVyZm9ybURvY3VtZW50UG9sbCgpXG5cbiAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKS53aWR0aCAvIGRldmljZVBpeGVsUmF0aW8pLnRvRXF1YWwoNClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGVkaXRvciBpcyByZXNpemVkJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5wcmVmZXJyZWRMaW5lTGVuZ3RoJywgNilcbiAgICAgICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLndpZHRoID0gJzEwMHB4J1xuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJzEwMHB4J1xuXG4gICAgICAgICAgYXRvbS52aWV3cy5wZXJmb3JtRG9jdW1lbnRQb2xsKClcblxuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdtYWtlcyB0aGUgbWluaW1hcCBzbWFsbGVyIHRoYW4gc29mdCB3cmFwJywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5vZmZzZXRXaWR0aCkudG9CZUNsb3NlVG8oMTIsIC0xKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zdHlsZS5tYXJnaW5SaWdodCkudG9FcXVhbCgnJylcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdhbmQgd2hlbiBtaW5pbWFwLm1pbmltYXBTY3JvbGxJbmRpY2F0b3Igc2V0dGluZyBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBlZGl0b3Iuc2V0VGV4dChtZWRpdW1TYW1wbGUpXG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoNTApXG5cbiAgICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yJywgdHJ1ZSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgZnJhbWUgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkXG4gICAgICAgICAgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnb2Zmc2V0cyB0aGUgc2Nyb2xsIGluZGljYXRvciBieSB0aGUgZGlmZmVyZW5jZScsICgpID0+IHtcbiAgICAgICAgICBsZXQgaW5kaWNhdG9yID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcubWluaW1hcC1zY3JvbGwtaW5kaWNhdG9yJylcbiAgICAgICAgICBleHBlY3QocmVhbE9mZnNldExlZnQoaW5kaWNhdG9yKSkudG9CZUNsb3NlVG8oMiwgLTEpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnYW5kIHdoZW4gbWluaW1hcC5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzIHNldHRpbmcgaXMgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMnLCB0cnVlKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdvZmZzZXRzIHRoZSBzY3JvbGwgaW5kaWNhdG9yIGJ5IHRoZSBkaWZmZXJlbmNlJywgKCkgPT4ge1xuICAgICAgICAgIGxldCBvcGVuUXVpY2tTZXR0aW5ncyA9IG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm9wZW4tbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRMZWZ0KG9wZW5RdWlja1NldHRpbmdzKSkubm90LnRvQmVDbG9zZVRvKDIsIC0xKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ2FuZCB0aGVuIGRpc2FibGVkJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuYWRqdXN0TWluaW1hcFdpZHRoVG9Tb2Z0V3JhcCcsIGZhbHNlKVxuXG4gICAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgZnJhbWUgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkXG4gICAgICAgICAgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnYWRqdXN0cyB0aGUgd2lkdGggb2YgdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50Lm9mZnNldFdpZHRoKS50b0JlQ2xvc2VUbyhlZGl0b3JFbGVtZW50Lm9mZnNldFdpZHRoIC8gMTAsIC0xKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zdHlsZS53aWR0aCkudG9FcXVhbCgnJylcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdhbmQgd2hlbiBwcmVmZXJyZWRMaW5lTGVuZ3RoID49IDE2Mzg0JywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5wcmVmZXJyZWRMaW5lTGVuZ3RoJywgMTYzODQpXG5cbiAgICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdhZGp1c3RzIHRoZSB3aWR0aCBvZiB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQub2Zmc2V0V2lkdGgpLnRvQmVDbG9zZVRvKGVkaXRvckVsZW1lbnQub2Zmc2V0V2lkdGggLyAxMCwgLTEpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnN0eWxlLndpZHRoKS50b0VxdWFsKCcnKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gYWRqdXN0TWluaW1hcFdpZHRoT25seUlmU21hbGxlciBpcyBkaXNhYmxlZCcsICgpID0+IHtcbiAgICAgICAgZGVzY3JpYmUoJ2FuZCB3aGVuIHByZWZlcnJlZExpbmVMZW5ndGggPj0gMTYzODQnLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuYWRqdXN0TWluaW1hcFdpZHRoT25seUlmU21hbGxlcicsIGZhbHNlKVxuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3IucHJlZmVycmVkTGluZUxlbmd0aCcsIDE2Mzg0KVxuXG4gICAgICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnYWRqdXN0cyB0aGUgd2lkdGggb2YgdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQub2Zmc2V0V2lkdGgpLnRvQmVDbG9zZVRvKDE2Mzg0ICogMilcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zdHlsZS53aWR0aCkudG9FcXVhbCgxNjM4NCAqIDIgKyAncHgnKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiBtaW5pbWFwLm1pbmltYXBTY3JvbGxJbmRpY2F0b3Igc2V0dGluZyBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KG1lZGl1bVNhbXBsZSlcbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoNTApXG5cbiAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgZnJhbWUgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcblxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAubWluaW1hcFNjcm9sbEluZGljYXRvcicsIHRydWUpXG4gICAgICB9KVxuXG4gICAgICBpdCgnYWRkcyBhIHNjcm9sbCBpbmRpY2F0b3IgaW4gdGhlIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5taW5pbWFwLXNjcm9sbC1pbmRpY2F0b3InKSkudG9FeGlzdCgpXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnYW5kIHRoZW4gZGVhY3RpdmF0ZWQnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdyZW1vdmVzIHRoZSBzY3JvbGwgaW5kaWNhdG9yIGZyb20gdGhlIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLm1pbmltYXBTY3JvbGxJbmRpY2F0b3InLCBmYWxzZSlcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcubWluaW1hcC1zY3JvbGwtaW5kaWNhdG9yJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdvbiB1cGRhdGUnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJzUwMHB4J1xuXG4gICAgICAgICAgYXRvbS52aWV3cy5wZXJmb3JtRG9jdW1lbnRQb2xsKClcblxuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdhZGp1c3RzIHRoZSBzaXplIGFuZCBwb3NpdGlvbiBvZiB0aGUgaW5kaWNhdG9yJywgKCkgPT4ge1xuICAgICAgICAgIGxldCBpbmRpY2F0b3IgPSBtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5taW5pbWFwLXNjcm9sbC1pbmRpY2F0b3InKVxuXG4gICAgICAgICAgbGV0IGhlaWdodCA9IGVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KCkgKiAoZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSAvIG1pbmltYXAuZ2V0SGVpZ2h0KCkpXG4gICAgICAgICAgbGV0IHNjcm9sbCA9IChlZGl0b3JFbGVtZW50LmdldEhlaWdodCgpIC0gaGVpZ2h0KSAqIG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjcm9sbFJhdGlvKClcblxuICAgICAgICAgIGV4cGVjdChpbmRpY2F0b3Iub2Zmc2V0SGVpZ2h0KS50b0JlQ2xvc2VUbyhoZWlnaHQsIDApXG4gICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRUb3AoaW5kaWNhdG9yKSkudG9CZUNsb3NlVG8oc2Nyb2xsLCAwKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIG1pbmltYXAgY2Fubm90IHNjcm9sbCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgZWRpdG9yLnNldFRleHQoc21hbGxTYW1wbGUpXG5cbiAgICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdyZW1vdmVzIHRoZSBzY3JvbGwgaW5kaWNhdG9yJywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5taW5pbWFwLXNjcm9sbC1pbmRpY2F0b3InKSkubm90LnRvRXhpc3QoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdhbmQgdGhlbiBjYW4gc2Nyb2xsIGFnYWluJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgZWRpdG9yLnNldFRleHQobGFyZ2VTYW1wbGUpXG5cbiAgICAgICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdhdHRhY2hlcyB0aGUgc2Nyb2xsIGluZGljYXRvcicsICgpID0+IHtcbiAgICAgICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIHNjcm9sbCBpbmRpY2F0b3InLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5taW5pbWFwLXNjcm9sbC1pbmRpY2F0b3InKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gbWluaW1hcC5hYnNvbHV0ZU1vZGUgc2V0dGluZyBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5hYnNvbHV0ZU1vZGUnLCB0cnVlKVxuICAgICAgfSlcblxuICAgICAgaXQoJ2FkZHMgYSBhYnNvbHV0ZSBjbGFzcyB0byB0aGUgbWluaW1hcCBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdhYnNvbHV0ZScpKS50b0JlVHJ1dGh5KClcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIG1pbmltYXAuZGlzcGxheU1pbmltYXBPbkxlZnQgc2V0dGluZyBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgICBpdCgnYWxzbyBhZGRzIGEgbGVmdCBjbGFzcyB0byB0aGUgbWluaW1hcCBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCcsIHRydWUpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnYWJzb2x1dGUnKSkudG9CZVRydXRoeSgpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnbGVmdCcpKS50b0JlVHJ1dGh5KClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIG1pbmltYXAuYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0IHNldHRpbmcgaXMgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmFkanVzdEFic29sdXRlTW9kZUhlaWdodCcsIHRydWUpXG4gICAgICAgIH0pXG4gICAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBjb250ZW50IG9mIHRoZSBtaW5pbWFwIGlzIHNtYWxsZXIgdGhhdCB0aGUgZWRpdG9yIGhlaWdodCcsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGVkaXRvci5zZXRUZXh0KHNtYWxsU2FtcGxlKVxuICAgICAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRIZWlnaHQoNDAwKVxuICAgICAgICAgICAgbWluaW1hcEVsZW1lbnQubWVhc3VyZUhlaWdodEFuZFdpZHRoKClcblxuICAgICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBydW5zKCgpID0+IG5leHRBbmltYXRpb25GcmFtZSgpKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgaXQoJ2FkanVzdHMgdGhlIGNhbnZhcyBoZWlnaHQgdG8gdGhlIG1pbmltYXAgaGVpZ2h0JywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignY2FudmFzJykub2Zmc2V0SGVpZ2h0KS50b0VxdWFsKG1pbmltYXAuZ2V0SGVpZ2h0KCkpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBjb250ZW50IGlzIG1vZGlmaWVkJywgKCkgPT4ge1xuICAgICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdmb29cXG5cXG5iYXJcXG4nKVxuXG4gICAgICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgcnVucygoKSA9PiBuZXh0QW5pbWF0aW9uRnJhbWUoKSlcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGl0KCdhZGp1c3RzIHRoZSBjYW52YXMgaGVpZ2h0IHRvIHRoZSBuZXcgbWluaW1hcCBoZWlnaHQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpLm9mZnNldEhlaWdodCkudG9FcXVhbChtaW5pbWFwLmdldEhlaWdodCgpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gdGhlIHNtb290aFNjcm9sbGluZyBzZXR0aW5nIGlzIGRpc2FibGVkJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5zbW9vdGhTY3JvbGxpbmcnLCBmYWxzZSlcbiAgICAgIH0pXG4gICAgICBpdCgnZG9lcyBub3Qgb2Zmc2V0IHRoZSBjYW52YXMgd2hlbiB0aGUgc2Nyb2xsIGRvZXMgbm90IG1hdGNoIGxpbmUgaGVpZ2h0JywgKCkgPT4ge1xuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgxMDA0KVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QocmVhbE9mZnNldFRvcChjYW52YXMpKS50b0VxdWFsKDApXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICAvLyAgICAgIyMjIyMjIyAgIyMgICAgICMjICMjIyMgICMjIyMjIyAgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICAjIyAgIyMgICAgIyMgIyMgICAjI1xuICAgIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgICMjICAjIyAgICAgICAjIyAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICAjIyAgIyMgICAgICAgIyMjIyNcbiAgICAvLyAgICAjIyAgIyMgIyMgIyMgICAgICMjICAjIyAgIyMgICAgICAgIyMgICMjXG4gICAgLy8gICAgIyMgICAgIyMgICMjICAgICAjIyAgIyMgICMjICAgICMjICMjICAgIyNcbiAgICAvLyAgICAgIyMjIyMgIyMgICMjIyMjIyMgICMjIyMgICMjIyMjIyAgIyMgICAgIyNcbiAgICAvL1xuICAgIC8vICAgICAjIyMjIyMgICMjIyMjIyMjICMjIyMjIyMjICMjIyMjIyMjICMjIyMgIyMgICAgIyMgICMjIyMjIyAgICAjIyMjIyNcbiAgICAvLyAgICAjIyAgICAjIyAjIyAgICAgICAgICAjIyAgICAgICAjIyAgICAgIyMgICMjIyAgICMjICMjICAgICMjICAjIyAgICAjI1xuICAgIC8vICAgICMjICAgICAgICMjICAgICAgICAgICMjICAgICAgICMjICAgICAjIyAgIyMjIyAgIyMgIyMgICAgICAgICMjXG4gICAgLy8gICAgICMjIyMjIyAgIyMjIyMjICAgICAgIyMgICAgICAgIyMgICAgICMjICAjIyAjIyAjIyAjIyAgICMjIyMgICMjIyMjI1xuICAgIC8vICAgICAgICAgICMjICMjICAgICAgICAgICMjICAgICAgICMjICAgICAjIyAgIyMgICMjIyMgIyMgICAgIyMgICAgICAgICMjXG4gICAgLy8gICAgIyMgICAgIyMgIyMgICAgICAgICAgIyMgICAgICAgIyMgICAgICMjICAjIyAgICMjIyAjIyAgICAjIyAgIyMgICAgIyNcbiAgICAvLyAgICAgIyMjIyMjICAjIyMjIyMjIyAgICAjIyAgICAgICAjIyAgICAjIyMjICMjICAgICMjICAjIyMjIyMgICAgIyMjIyMjXG5cbiAgICBkZXNjcmliZSgnd2hlbiBtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMgc2V0dGluZyBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgbGV0IFtvcGVuUXVpY2tTZXR0aW5ncywgcXVpY2tTZXR0aW5nc0VsZW1lbnQsIHdvcmtzcGFjZUVsZW1lbnRdID0gW11cbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scycsIHRydWUpXG4gICAgICB9KVxuXG4gICAgICBpdCgnaGFzIGEgZGl2IHRvIG9wZW4gdGhlIHF1aWNrIHNldHRpbmdzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJykpLnRvRXhpc3QoKVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ2NsaWNraW5nIG9uIHRoZSBkaXYnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgICAgICAgamFzbWluZUNvbnRlbnQuYXBwZW5kQ2hpbGQod29ya3NwYWNlRWxlbWVudClcblxuICAgICAgICAgIG9wZW5RdWlja1NldHRpbmdzID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgICBtb3VzZWRvd24ob3BlblF1aWNrU2V0dGluZ3MpXG5cbiAgICAgICAgICBxdWlja1NldHRpbmdzRWxlbWVudCA9IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgICAgIH0pXG5cbiAgICAgICAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICAgICAgICBtaW5pbWFwRWxlbWVudC5xdWlja1NldHRpbmdzRWxlbWVudC5kZXN0cm95KClcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnb3BlbnMgdGhlIHF1aWNrIHNldHRpbmdzIHZpZXcnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50KS50b0V4aXN0KClcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgncG9zaXRpb25zIHRoZSBxdWljayBzZXR0aW5ncyB2aWV3IG5leHQgdG8gdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IG1pbmltYXBCb3VuZHMgPSBtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgbGV0IHNldHRpbmdzQm91bmRzID0gcXVpY2tTZXR0aW5nc0VsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblxuICAgICAgICAgIGV4cGVjdChyZWFsT2Zmc2V0VG9wKHF1aWNrU2V0dGluZ3NFbGVtZW50KSkudG9CZUNsb3NlVG8obWluaW1hcEJvdW5kcy50b3AsIDApXG4gICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRMZWZ0KHF1aWNrU2V0dGluZ3NFbGVtZW50KSkudG9CZUNsb3NlVG8obWluaW1hcEJvdW5kcy5sZWZ0IC0gc2V0dGluZ3NCb3VuZHMud2lkdGgsIDApXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiB0aGUgZGlzcGxheU1pbmltYXBPbkxlZnQgc2V0dGluZyBpcyBlbmFibGVkJywgKCkgPT4ge1xuICAgICAgICBkZXNjcmliZSgnY2xpY2tpbmcgb24gdGhlIGRpdicsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCcsIHRydWUpXG5cbiAgICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgICAgICAgICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZCh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgICAgICAgICBvcGVuUXVpY2tTZXR0aW5ncyA9IG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm9wZW4tbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgICAgICAgICBtb3VzZWRvd24ob3BlblF1aWNrU2V0dGluZ3MpXG5cbiAgICAgICAgICAgIHF1aWNrU2V0dGluZ3NFbGVtZW50ID0gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdtaW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIG1pbmltYXBFbGVtZW50LnF1aWNrU2V0dGluZ3NFbGVtZW50LmRlc3Ryb3koKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgncG9zaXRpb25zIHRoZSBxdWljayBzZXR0aW5ncyB2aWV3IG5leHQgdG8gdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgbWluaW1hcEJvdW5kcyA9IG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblxuICAgICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRUb3AocXVpY2tTZXR0aW5nc0VsZW1lbnQpKS50b0JlQ2xvc2VUbyhtaW5pbWFwQm91bmRzLnRvcCwgMClcbiAgICAgICAgICAgIGV4cGVjdChyZWFsT2Zmc2V0TGVmdChxdWlja1NldHRpbmdzRWxlbWVudCkpLnRvQmVDbG9zZVRvKG1pbmltYXBCb3VuZHMucmlnaHQsIDApXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBhZGp1c3RNaW5pbWFwV2lkdGhUb1NvZnRXcmFwIHNldHRpbmcgaXMgZW5hYmxlZCcsICgpID0+IHtcbiAgICAgICAgbGV0IFtjb250cm9sc10gPSBbXVxuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5zb2Z0V3JhcCcsIHRydWUpXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3Iuc29mdFdyYXBBdFByZWZlcnJlZExpbmVMZW5ndGgnLCB0cnVlKVxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnByZWZlcnJlZExpbmVMZW5ndGgnLCAyKVxuXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmFkanVzdE1pbmltYXBXaWR0aFRvU29mdFdyYXAnLCB0cnVlKVxuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBjb250cm9scyA9IG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtY29udHJvbHMnKVxuICAgICAgICAgIG9wZW5RdWlja1NldHRpbmdzID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJylcblxuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUud2lkdGggPSAnMTAyNHB4J1xuXG4gICAgICAgICAgYXRvbS52aWV3cy5wZXJmb3JtRG9jdW1lbnRQb2xsKClcbiAgICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdhZGp1c3RzIHRoZSBzaXplIG9mIHRoZSBjb250cm9sIGRpdiB0byBmaXQgaW4gdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGNvbnRyb2xzLmNsaWVudFdpZHRoKS50b0VxdWFsKG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKCkuY2xpZW50V2lkdGggLyBkZXZpY2VQaXhlbFJhdGlvKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdwb3NpdGlvbnMgdGhlIGNvbnRyb2xzIGRpdiBvdmVyIHRoZSBjYW52YXMnLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IGNvbnRyb2xzUmVjdCA9IGNvbnRyb2xzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgbGV0IGNhbnZhc1JlY3QgPSBtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgZXhwZWN0KGNvbnRyb2xzUmVjdC5sZWZ0KS50b0VxdWFsKGNhbnZhc1JlY3QubGVmdClcbiAgICAgICAgICBleHBlY3QoY29udHJvbHNSZWN0LnJpZ2h0KS50b0VxdWFsKGNhbnZhc1JlY3QucmlnaHQpXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGRpc3BsYXlNaW5pbWFwT25MZWZ0IHNldHRpbmcgaXMgZW5hYmxlZCcsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCcsIHRydWUpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdhZGp1c3RzIHRoZSBzaXplIG9mIHRoZSBjb250cm9sIGRpdiB0byBmaXQgaW4gdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QoY29udHJvbHMuY2xpZW50V2lkdGgpLnRvRXF1YWwobWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKS5jbGllbnRXaWR0aCAvIGRldmljZVBpeGVsUmF0aW8pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdwb3NpdGlvbnMgdGhlIGNvbnRyb2xzIGRpdiBvdmVyIHRoZSBjYW52YXMnLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgY29udHJvbHNSZWN0ID0gY29udHJvbHMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgIGxldCBjYW52YXNSZWN0ID0gbWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgICAgZXhwZWN0KGNvbnRyb2xzUmVjdC5sZWZ0KS50b0VxdWFsKGNhbnZhc1JlY3QubGVmdClcbiAgICAgICAgICAgIGV4cGVjdChjb250cm9sc1JlY3QucmlnaHQpLnRvRXF1YWwoY2FudmFzUmVjdC5yaWdodClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVzY3JpYmUoJ2NsaWNraW5nIG9uIHRoZSBkaXYnLCAoKSA9PiB7XG4gICAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICAgICAgICAgICAgamFzbWluZUNvbnRlbnQuYXBwZW5kQ2hpbGQod29ya3NwYWNlRWxlbWVudClcblxuICAgICAgICAgICAgICBvcGVuUXVpY2tTZXR0aW5ncyA9IG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm9wZW4tbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgICAgICAgICAgIG1vdXNlZG93bihvcGVuUXVpY2tTZXR0aW5ncylcblxuICAgICAgICAgICAgICBxdWlja1NldHRpbmdzRWxlbWVudCA9IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICBtaW5pbWFwRWxlbWVudC5xdWlja1NldHRpbmdzRWxlbWVudC5kZXN0cm95KClcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGl0KCdwb3NpdGlvbnMgdGhlIHF1aWNrIHNldHRpbmdzIHZpZXcgbmV4dCB0byB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICAgICAgbGV0IG1pbmltYXBCb3VuZHMgPSBtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG5cbiAgICAgICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRUb3AocXVpY2tTZXR0aW5nc0VsZW1lbnQpKS50b0JlQ2xvc2VUbyhtaW5pbWFwQm91bmRzLnRvcCwgMClcbiAgICAgICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRMZWZ0KHF1aWNrU2V0dGluZ3NFbGVtZW50KSkudG9CZUNsb3NlVG8obWluaW1hcEJvdW5kcy5yaWdodCwgMClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBxdWljayBzZXR0aW5ncyB2aWV3IGlzIG9wZW4nLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgICAgICAgamFzbWluZUNvbnRlbnQuYXBwZW5kQ2hpbGQod29ya3NwYWNlRWxlbWVudClcblxuICAgICAgICAgIG9wZW5RdWlja1NldHRpbmdzID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgICBtb3VzZWRvd24ob3BlblF1aWNrU2V0dGluZ3MpXG5cbiAgICAgICAgICBxdWlja1NldHRpbmdzRWxlbWVudCA9IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3NldHMgdGhlIG9uIHJpZ2h0IGJ1dHRvbiBhY3RpdmUnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idG4uc2VsZWN0ZWQ6bGFzdC1jaGlsZCcpKS50b0V4aXN0KClcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnY2xpY2tpbmcgb24gdGhlIGNvZGUgaGlnaGxpZ2h0IGl0ZW0nLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBsZXQgaXRlbSA9IHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpLmNvZGUtaGlnaGxpZ2h0cycpXG4gICAgICAgICAgICBtb3VzZWRvd24oaXRlbSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3RvZ2dsZXMgdGhlIGNvZGUgaGlnaGxpZ2h0cyBvbiB0aGUgbWluaW1hcCBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRpc3BsYXlDb2RlSGlnaGxpZ2h0cykudG9CZVRydXRoeSgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdyZXF1ZXN0cyBhbiB1cGRhdGUnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWQpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ2NsaWNraW5nIG9uIHRoZSBhYnNvbHV0ZSBtb2RlIGl0ZW0nLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBsZXQgaXRlbSA9IHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpLmFic29sdXRlLW1vZGUnKVxuICAgICAgICAgICAgbW91c2Vkb3duKGl0ZW0pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCd0b2dnbGVzIHRoZSBhYnNvbHV0ZS1tb2RlIHNldHRpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLmFic29sdXRlTW9kZScpKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5hYnNvbHV0ZU1vZGUpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ2NsaWNraW5nIG9uIHRoZSBvbiBsZWZ0IGJ1dHRvbicsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBpdGVtID0gcXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ0bjpmaXJzdC1jaGlsZCcpXG4gICAgICAgICAgICBtb3VzZWRvd24oaXRlbSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3RvZ2dsZXMgdGhlIGRpc3BsYXlNaW5pbWFwT25MZWZ0IHNldHRpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0JykpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnY2hhbmdlcyB0aGUgYnV0dG9ucyBhY3RpdmF0aW9uIHN0YXRlJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idG4uc2VsZWN0ZWQ6bGFzdC1jaGlsZCcpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ0bi5zZWxlY3RlZDpmaXJzdC1jaGlsZCcpKS50b0V4aXN0KClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdjb3JlOm1vdmUtbGVmdCcsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtbGVmdCcpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCd0b2dnbGVzIHRoZSBkaXNwbGF5TWluaW1hcE9uTGVmdCBzZXR0aW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCcpKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ2NoYW5nZXMgdGhlIGJ1dHRvbnMgYWN0aXZhdGlvbiBzdGF0ZScsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnRuLnNlbGVjdGVkOmxhc3QtY2hpbGQnKSkubm90LnRvRXhpc3QoKVxuICAgICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idG4uc2VsZWN0ZWQ6Zmlyc3QtY2hpbGQnKSkudG9FeGlzdCgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnY29yZTptb3ZlLXJpZ2h0IHdoZW4gdGhlIG1pbmltYXAgaXMgb24gdGhlIHJpZ2h0JywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0JywgdHJ1ZSlcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtcmlnaHQnKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgndG9nZ2xlcyB0aGUgZGlzcGxheU1pbmltYXBPbkxlZnQgc2V0dGluZycsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuZGlzcGxheU1pbmltYXBPbkxlZnQnKSkudG9CZUZhbHN5KClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ2NoYW5nZXMgdGhlIGJ1dHRvbnMgYWN0aXZhdGlvbiBzdGF0ZScsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnRuLnNlbGVjdGVkOmZpcnN0LWNoaWxkJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgICAgIGV4cGVjdChxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnRuLnNlbGVjdGVkOmxhc3QtY2hpbGQnKSkudG9FeGlzdCgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnY2xpY2tpbmcgb24gdGhlIG9wZW4gc2V0dGluZ3MgYnV0dG9uIGFnYWluJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgbW91c2Vkb3duKG9wZW5RdWlja1NldHRpbmdzKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnY2xvc2VzIHRoZSBxdWljayBzZXR0aW5ncyB2aWV3JywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignbWluaW1hcC1xdWljay1zZXR0aW5ncycpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdyZW1vdmVzIHRoZSB2aWV3IGZyb20gdGhlIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQucXVpY2tTZXR0aW5nc0VsZW1lbnQpLnRvQmVOdWxsKClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCd3aGVuIGFuIGV4dGVybmFsIGV2ZW50IGRlc3Ryb3lzIHRoZSB2aWV3JywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgbWluaW1hcEVsZW1lbnQucXVpY2tTZXR0aW5nc0VsZW1lbnQuZGVzdHJveSgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdyZW1vdmVzIHRoZSB2aWV3IHJlZmVyZW5jZSBmcm9tIHRoZSBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnF1aWNrU2V0dGluZ3NFbGVtZW50KS50b0JlTnVsbCgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd0aGVuIGRpc2FibGluZyBpdCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMnLCBmYWxzZSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgncmVtb3ZlcyB0aGUgZGl2JywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5vcGVuLW1pbmltYXAtcXVpY2stc2V0dGluZ3MnKSkubm90LnRvRXhpc3QoKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3dpdGggcGx1Z2lucyByZWdpc3RlcmVkIGluIHRoZSBwYWNrYWdlJywgKCkgPT4ge1xuICAgICAgICBsZXQgW21pbmltYXBQYWNrYWdlLCBwbHVnaW5BLCBwbHVnaW5CXSA9IFtdXG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ21pbmltYXAnKS50aGVuKChwa2cpID0+IHtcbiAgICAgICAgICAgICAgbWluaW1hcFBhY2thZ2UgPSBwa2cubWFpbk1vZHVsZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICBjbGFzcyBQbHVnaW4ge1xuICAgICAgICAgICAgICBhY3RpdmUgPSBmYWxzZVxuICAgICAgICAgICAgICBhY3RpdmF0ZVBsdWdpbiAoKSB7IHRoaXMuYWN0aXZlID0gdHJ1ZSB9XG4gICAgICAgICAgICAgIGRlYWN0aXZhdGVQbHVnaW4gKCkgeyB0aGlzLmFjdGl2ZSA9IGZhbHNlIH1cbiAgICAgICAgICAgICAgaXNBY3RpdmUgKCkgeyByZXR1cm4gdGhpcy5hY3RpdmUgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwbHVnaW5BID0gbmV3IFBsdWdpbigpXG4gICAgICAgICAgICBwbHVnaW5CID0gbmV3IFBsdWdpbigpXG5cbiAgICAgICAgICAgIG1pbmltYXBQYWNrYWdlLnJlZ2lzdGVyUGx1Z2luKCdkdW1teUEnLCBwbHVnaW5BKVxuICAgICAgICAgICAgbWluaW1hcFBhY2thZ2UucmVnaXN0ZXJQbHVnaW4oJ2R1bW15QicsIHBsdWdpbkIpXG5cbiAgICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgICAgICAgICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZCh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgICAgICAgICBvcGVuUXVpY2tTZXR0aW5ncyA9IG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm9wZW4tbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgICAgICAgICBtb3VzZWRvd24ob3BlblF1aWNrU2V0dGluZ3MpXG5cbiAgICAgICAgICAgIHF1aWNrU2V0dGluZ3NFbGVtZW50ID0gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdtaW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdjcmVhdGVzIG9uZSBsaXN0IGl0ZW0gZm9yIGVhY2ggcmVnaXN0ZXJlZCBwbHVnaW4nLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpJykubGVuZ3RoKS50b0VxdWFsKDYpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3NlbGVjdHMgdGhlIGZpcnN0IGl0ZW0gb2YgdGhlIGxpc3QnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpLnNlbGVjdGVkOmZpcnN0LWNoaWxkJykpLnRvRXhpc3QoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdjb3JlOmNvbmZpcm0nLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTpjb25maXJtJylcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ2Rpc2FibGUgdGhlIHBsdWdpbiBvZiB0aGUgc2VsZWN0ZWQgaXRlbScsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChwbHVnaW5BLmlzQWN0aXZlKCkpLnRvQmVGYWxzeSgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGRlc2NyaWJlKCd0cmlnZ2VyZWQgYSBzZWNvbmQgdGltZScsICgpID0+IHtcbiAgICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTpjb25maXJtJylcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGl0KCdlbmFibGUgdGhlIHBsdWdpbiBvZiB0aGUgc2VsZWN0ZWQgaXRlbScsICgpID0+IHtcbiAgICAgICAgICAgICAgZXhwZWN0KHBsdWdpbkEuaXNBY3RpdmUoKSkudG9CZVRydXRoeSgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZXNjcmliZSgnb24gdGhlIGNvZGUgaGlnaGxpZ2h0IGl0ZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgW2luaXRpYWxdID0gW11cbiAgICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICBpbml0aWFsID0gbWluaW1hcEVsZW1lbnQuZGlzcGxheUNvZGVIaWdobGlnaHRzXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtZG93bicpXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtZG93bicpXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOmNvbmZpcm0nKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgaXQoJ3RvZ2dsZXMgdGhlIGNvZGUgaGlnaGxpZ2h0cyBvbiB0aGUgbWluaW1hcCBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZGlzcGxheUNvZGVIaWdobGlnaHRzKS50b0VxdWFsKCFpbml0aWFsKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVzY3JpYmUoJ29uIHRoZSBhYnNvbHV0ZSBtb2RlIGl0ZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgW2luaXRpYWxdID0gW11cbiAgICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICBpbml0aWFsID0gYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLmFic29sdXRlTW9kZScpXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtZG93bicpXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtZG93bicpXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtZG93bicpXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOmNvbmZpcm0nKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgaXQoJ3RvZ2dsZXMgdGhlIGNvZGUgaGlnaGxpZ2h0cyBvbiB0aGUgbWluaW1hcCBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLmFic29sdXRlTW9kZScpKS50b0VxdWFsKCFpbml0aWFsKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVzY3JpYmUoJ29uIHRoZSBhZGp1c3QgYWJzb2x1dGUgbW9kZSBoZWlnaHQgaXRlbScsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBbaW5pdGlhbF0gPSBbXVxuICAgICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIGluaXRpYWwgPSBhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0JylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6Y29uZmlybScpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBpdCgndG9nZ2xlcyB0aGUgY29kZSBoaWdobGlnaHRzIG9uIHRoZSBtaW5pbWFwIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0JykpLnRvRXF1YWwoIWluaXRpYWwpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ2NvcmU6bW92ZS1kb3duJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3NlbGVjdHMgdGhlIHNlY29uZCBpdGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpLnNlbGVjdGVkOm50aC1jaGlsZCgyKScpKS50b0V4aXN0KClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVzY3JpYmUoJ3JlYWNoaW5nIGEgc2VwYXJhdG9yJywgKCkgPT4ge1xuICAgICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtZG93bicpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBpdCgnbW92ZXMgcGFzdCB0aGUgc2VwYXJhdG9yJywgKCkgPT4ge1xuICAgICAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignbGkuY29kZS1oaWdobGlnaHRzLnNlbGVjdGVkJykpLnRvRXhpc3QoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVzY3JpYmUoJ3RoZW4gY29yZTptb3ZlLXVwJywgKCkgPT4ge1xuICAgICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtdXAnKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgaXQoJ3NlbGVjdHMgYWdhaW4gdGhlIGZpcnN0IGl0ZW0gb2YgdGhlIGxpc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGV4cGVjdChxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdsaS5zZWxlY3RlZDpmaXJzdC1jaGlsZCcpKS50b0V4aXN0KClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnY29yZTptb3ZlLXVwJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS11cCcpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdzZWxlY3RzIHRoZSBsYXN0IGl0ZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignbGkuc2VsZWN0ZWQ6bGFzdC1jaGlsZCcpKS50b0V4aXN0KClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVzY3JpYmUoJ3JlYWNoaW5nIGEgc2VwYXJhdG9yJywgKCkgPT4ge1xuICAgICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtdXAnKVxuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTptb3ZlLXVwJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS11cCcpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBpdCgnbW92ZXMgcGFzdCB0aGUgc2VwYXJhdG9yJywgKCkgPT4ge1xuICAgICAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignbGkuc2VsZWN0ZWQ6bnRoLWNoaWxkKDIpJykpLnRvRXhpc3QoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVzY3JpYmUoJ3RoZW4gY29yZTptb3ZlLWRvd24nLCAoKSA9PiB7XG4gICAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGl0KCdzZWxlY3RzIGFnYWluIHRoZSBmaXJzdCBpdGVtIG9mIHRoZSBsaXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignbGkuc2VsZWN0ZWQ6Zmlyc3QtY2hpbGQnKSkudG9FeGlzdCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG59KVxuIl19
//# sourceURL=/home/takaaki/.atom/packages/minimap/spec/minimap-element-spec.js
