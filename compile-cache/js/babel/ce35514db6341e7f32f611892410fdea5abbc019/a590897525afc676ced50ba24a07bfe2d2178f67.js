function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

require('./helpers/workspace');

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _libMinimap = require('../lib/minimap');

var _libMinimap2 = _interopRequireDefault(_libMinimap);

'use babel';

describe('Minimap', function () {
  var _ref = [];
  var editor = _ref[0];
  var editorElement = _ref[1];
  var minimap = _ref[2];
  var largeSample = _ref[3];
  var smallSample = _ref[4];
  var minimapVerticalScaleFactor = _ref[5];
  var minimapHorizontalScaleFactor = _ref[6];

  beforeEach(function () {
    atom.config.set('minimap.charHeight', 4);
    atom.config.set('minimap.charWidth', 2);
    atom.config.set('minimap.interline', 1);

    editor = atom.workspace.buildTextEditor({});

    editorElement = atom.views.getView(editor);
    jasmine.attachToDOM(editorElement);
    editorElement.setHeight(50);
    editorElement.setWidth(200);

    minimapVerticalScaleFactor = 5 / editor.getLineHeightInPixels();
    minimapHorizontalScaleFactor = 2 / editor.getDefaultCharWidth();

    var dir = atom.project.getDirectories()[0];

    minimap = new _libMinimap2['default']({ textEditor: editor });
    largeSample = _fsPlus2['default'].readFileSync(dir.resolve('large-file.coffee')).toString();
    smallSample = _fsPlus2['default'].readFileSync(dir.resolve('sample.coffee')).toString();
  });

  it('has an associated editor', function () {
    expect(minimap.getTextEditor()).toEqual(editor);
  });

  it('returns false when asked if destroyed', function () {
    expect(minimap.isDestroyed()).toBeFalsy();
  });

  it('raise an exception if created without a text editor', function () {
    expect(function () {
      return new _libMinimap2['default']();
    }).toThrow();
  });

  it('measures the minimap size based on the current editor content', function () {
    editor.setText(smallSample);
    expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5);

    editor.setText(largeSample);
    expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5);
  });

  it('measures the scaling factor between the editor and the minimap', function () {
    expect(minimap.getVerticalScaleFactor()).toEqual(minimapVerticalScaleFactor);
    expect(minimap.getHorizontalScaleFactor()).toEqual(minimapHorizontalScaleFactor);
  });

  it('measures the editor visible area size at minimap scale', function () {
    editor.setText(largeSample);
    expect(minimap.getTextEditorScaledHeight()).toEqual(50 * minimapVerticalScaleFactor);
  });

  it('measures the available minimap scroll', function () {
    editor.setText(largeSample);
    var largeLineCount = editor.getScreenLineCount();

    expect(minimap.getMaxScrollTop()).toEqual(largeLineCount * 5 - 50);
    expect(minimap.canScroll()).toBeTruthy();
  });

  it('computes the first visible row in the minimap', function () {
    expect(minimap.getFirstVisibleScreenRow()).toEqual(0);
  });

  it('computes the last visible row in the minimap', function () {
    expect(minimap.getLastVisibleScreenRow()).toEqual(10);
  });

  it('relays change events from the text editor', function () {
    var changeSpy = jasmine.createSpy('didChange');
    minimap.onDidChange(changeSpy);

    editor.setText('foo');

    expect(changeSpy).toHaveBeenCalled();
  });

  it('relays scroll top events from the editor', function () {
    editor.setText(largeSample);

    var scrollSpy = jasmine.createSpy('didScroll');
    minimap.onDidChangeScrollTop(scrollSpy);

    editorElement.setScrollTop(100);

    expect(scrollSpy).toHaveBeenCalled();
  });

  it('relays scroll left events from the editor', function () {
    editor.setText(largeSample);

    var scrollSpy = jasmine.createSpy('didScroll');
    minimap.onDidChangeScrollLeft(scrollSpy);

    // Seems like text without a view aren't able to scroll horizontally
    // even when its width was set.
    spyOn(editorElement, 'getScrollWidth').andReturn(10000);

    editorElement.setScrollLeft(100);

    expect(scrollSpy).toHaveBeenCalled();
  });

  describe('when scrols past end is enabled', function () {
    beforeEach(function () {
      editor.setText(largeSample);
      atom.config.set('editor.scrollPastEnd', true);
    });

    it('adjust the scrolling ratio', function () {
      editorElement.setScrollTop(editorElement.getScrollHeight());

      var maxScrollTop = editorElement.getScrollHeight() - editorElement.getHeight() - (editorElement.getHeight() - 3 * editor.displayBuffer.getLineHeightInPixels());

      expect(minimap.getTextEditorScrollRatio()).toEqual(editorElement.getScrollTop() / maxScrollTop);
    });

    it('lock the minimap scroll top to 1', function () {
      editorElement.setScrollTop(editorElement.getScrollHeight());
      expect(minimap.getScrollTop()).toEqual(minimap.getMaxScrollTop());
    });

    describe('getTextEditorScrollRatio(), when getScrollTop() and maxScrollTop both equal 0', function () {
      beforeEach(function () {
        editor.setText(smallSample);
        editorElement.setHeight(40);
        atom.config.set('editor.scrollPastEnd', true);
      });

      it('returns 0', function () {
        editorElement.setScrollTop(0);
        expect(minimap.getTextEditorScrollRatio()).toEqual(0);
      });
    });
  });

  describe('when soft wrap is enabled', function () {
    beforeEach(function () {
      atom.config.set('editor.softWrap', true);
      atom.config.set('editor.softWrapAtPreferredLineLength', true);
      atom.config.set('editor.preferredLineLength', 2);
    });

    it('measures the minimap using screen lines', function () {
      editor.setText(smallSample);
      expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5);

      editor.setText(largeSample);
      expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5);
    });
  });

  describe('when there is no scrolling needed to display the whole minimap', function () {
    it('returns 0 when computing the minimap scroll', function () {
      expect(minimap.getScrollTop()).toEqual(0);
    });

    it('returns 0 when measuring the available minimap scroll', function () {
      editor.setText(smallSample);

      expect(minimap.getMaxScrollTop()).toEqual(0);
      expect(minimap.canScroll()).toBeFalsy();
    });
  });

  describe('when the editor is scrolled', function () {
    var _ref2 = [];
    var largeLineCount = _ref2[0];
    var editorScrollRatio = _ref2[1];

    beforeEach(function () {
      // Same here, without a view, the getScrollWidth method always returns 1
      // and the test fails because the capped scroll left value always end up
      // to be 0, inducing errors in computations.
      spyOn(editorElement, 'getScrollWidth').andReturn(10000);

      editor.setText(largeSample);
      editorElement.setScrollTop(1000);
      editorElement.setScrollLeft(200);

      largeLineCount = editor.getScreenLineCount();
      editorScrollRatio = editorElement.getScrollTop() / (editorElement.getScrollHeight() - editorElement.getHeight());
    });

    it('scales the editor scroll based on the minimap scale factor', function () {
      expect(minimap.getTextEditorScaledScrollTop()).toEqual(1000 * minimapVerticalScaleFactor);
      expect(minimap.getTextEditorScaledScrollLeft()).toEqual(200 * minimapHorizontalScaleFactor);
    });

    it('computes the offset to apply based on the editor scroll top', function () {
      expect(minimap.getScrollTop()).toEqual(editorScrollRatio * minimap.getMaxScrollTop());
    });

    it('computes the first visible row in the minimap', function () {
      expect(minimap.getFirstVisibleScreenRow()).toEqual(58);
    });

    it('computes the last visible row in the minimap', function () {
      expect(minimap.getLastVisibleScreenRow()).toEqual(69);
    });

    describe('down to the bottom', function () {
      beforeEach(function () {
        editorElement.setScrollTop(editorElement.getScrollHeight());
        editorScrollRatio = editorElement.getScrollTop() / editorElement.getScrollHeight();
      });

      it('computes an offset that scrolls the minimap to the bottom edge', function () {
        expect(minimap.getScrollTop()).toEqual(minimap.getMaxScrollTop());
      });

      it('computes the first visible row in the minimap', function () {
        expect(minimap.getFirstVisibleScreenRow()).toEqual(largeLineCount - 10);
      });

      it('computes the last visible row in the minimap', function () {
        expect(minimap.getLastVisibleScreenRow()).toEqual(largeLineCount);
      });
    });
  });

  describe('destroying the model', function () {
    it('emits a did-destroy event', function () {
      var spy = jasmine.createSpy('destroy');
      minimap.onDidDestroy(spy);

      minimap.destroy();

      expect(spy).toHaveBeenCalled();
    });

    it('returns true when asked if destroyed', function () {
      minimap.destroy();
      expect(minimap.isDestroyed()).toBeTruthy();
    });
  });

  describe('destroying the text editor', function () {
    it('destroys the model', function () {
      spyOn(minimap, 'destroy');

      editor.destroy();

      expect(minimap.destroy).toHaveBeenCalled();
    });
  });

  describe('with scoped settings', function () {
    beforeEach(function () {
      waitsForPromise(function () {
        return atom.packages.activatePackage('language-javascript');
      });

      runs(function () {
        var opts = { scopeSelector: '.source.js' };

        atom.config.set('minimap.charHeight', 8, opts);
        atom.config.set('minimap.charWidth', 4, opts);
        atom.config.set('minimap.interline', 2, opts);

        editor.setGrammar(atom.grammars.grammarForScopeName('source.js'));
      });
    });

    it('honors the scoped settings for the current editor new grammar', function () {
      expect(minimap.getCharHeight()).toEqual(8);
      expect(minimap.getCharWidth()).toEqual(4);
      expect(minimap.getInterline()).toEqual(2);
    });
  });

  describe('when independentMinimapScroll is true', function () {
    var editorScrollRatio = undefined;
    beforeEach(function () {
      editor.setText(largeSample);
      editorElement.setScrollTop(1000);
      editorScrollRatio = editorElement.getScrollTop() / (editorElement.getScrollHeight() - editorElement.getHeight());

      atom.config.set('minimap.independentMinimapScroll', true);
    });

    it('ignores the scroll computed from the editor and return the one of the minimap instead', function () {
      expect(minimap.getScrollTop()).toEqual(editorScrollRatio * minimap.getMaxScrollTop());

      minimap.setScrollTop(200);

      expect(minimap.getScrollTop()).toEqual(200);
    });

    describe('scrolling the editor', function () {
      it('changes the minimap scroll top', function () {
        editorElement.setScrollTop(2000);

        expect(minimap.getScrollTop()).not.toEqual(editorScrollRatio * minimap.getMaxScrollTop());
      });
    });
  });

  //    ########  ########  ######   #######
  //    ##     ## ##       ##    ## ##     ##
  //    ##     ## ##       ##       ##     ##
  //    ##     ## ######   ##       ##     ##
  //    ##     ## ##       ##       ##     ##
  //    ##     ## ##       ##    ## ##     ##
  //    ########  ########  ######   #######

  describe('::decorateMarker', function () {
    var _ref3 = [];
    var marker = _ref3[0];
    var decoration = _ref3[1];
    var changeSpy = _ref3[2];

    beforeEach(function () {
      editor.setText(largeSample);

      changeSpy = jasmine.createSpy('didChange');
      minimap.onDidChangeDecorationRange(changeSpy);

      marker = minimap.markBufferRange([[0, 6], [1, 11]]);
      decoration = minimap.decorateMarker(marker, { type: 'highlight', 'class': 'dummy' });
    });

    it('creates a decoration for the given marker', function () {
      expect(minimap.decorationsByMarkerId[marker.id]).toBeDefined();
    });

    it('creates a change corresponding to the marker range', function () {
      expect(changeSpy).toHaveBeenCalled();
      expect(changeSpy.calls[0].args[0].start).toEqual(0);
      expect(changeSpy.calls[0].args[0].end).toEqual(1);
    });

    describe('when the marker range changes', function () {
      beforeEach(function () {
        var markerChangeSpy = jasmine.createSpy('marker-did-change');
        marker.onDidChange(markerChangeSpy);
        marker.setBufferRange([[0, 6], [3, 11]]);

        waitsFor(function () {
          return markerChangeSpy.calls.length > 0;
        });
      });

      it('creates a change only for the dif between the two ranges', function () {
        expect(changeSpy).toHaveBeenCalled();
        expect(changeSpy.calls[1].args[0].start).toEqual(1);
        expect(changeSpy.calls[1].args[0].end).toEqual(3);
      });
    });

    describe('destroying the marker', function () {
      beforeEach(function () {
        marker.destroy();
      });

      it('removes the decoration from the render view', function () {
        expect(minimap.decorationsByMarkerId[marker.id]).toBeUndefined();
      });

      it('creates a change corresponding to the marker range', function () {
        expect(changeSpy.calls[1].args[0].start).toEqual(0);
        expect(changeSpy.calls[1].args[0].end).toEqual(1);
      });
    });

    describe('destroying the decoration', function () {
      beforeEach(function () {
        decoration.destroy();
      });

      it('removes the decoration from the render view', function () {
        expect(minimap.decorationsByMarkerId[marker.id]).toBeUndefined();
      });

      it('creates a change corresponding to the marker range', function () {
        expect(changeSpy.calls[1].args[0].start).toEqual(0);
        expect(changeSpy.calls[1].args[0].end).toEqual(1);
      });
    });

    describe('destroying all the decorations for the marker', function () {
      beforeEach(function () {
        minimap.removeAllDecorationsForMarker(marker);
      });

      it('removes the decoration from the render view', function () {
        expect(minimap.decorationsByMarkerId[marker.id]).toBeUndefined();
      });

      it('creates a change corresponding to the marker range', function () {
        expect(changeSpy.calls[1].args[0].start).toEqual(0);
        expect(changeSpy.calls[1].args[0].end).toEqual(1);
      });
    });

    describe('destroying the minimap', function () {
      beforeEach(function () {
        minimap.destroy();
      });

      it('removes all the previously added decorations', function () {
        expect(minimap.decorationsById).toEqual({});
        expect(minimap.decorationsByMarkerId).toEqual({});
      });

      it('prevents the creation of new decorations', function () {
        marker = editor.markBufferRange([[0, 6], [0, 11]]);
        decoration = minimap.decorateMarker(marker, { type: 'highlight', 'class': 'dummy' });

        expect(decoration).toBeUndefined();
      });
    });
  });

  describe('::decorationsByTypeThenRows', function () {
    var _ref4 = [];
    var decorations = _ref4[0];

    beforeEach(function () {
      editor.setText(largeSample);

      function createDecoration(type, range) {
        var marker = minimap.markBufferRange(range);
        minimap.decorateMarker(marker, { type: type });
      }

      createDecoration('highlight', [[6, 0], [11, 0]]);
      createDecoration('highlight', [[7, 0], [8, 0]]);
      createDecoration('highlight-over', [[1, 0], [2, 0]]);
      createDecoration('line', [[3, 0], [4, 0]]);
      createDecoration('line', [[12, 0], [12, 0]]);
      createDecoration('highlight-under', [[0, 0], [10, 1]]);

      decorations = minimap.decorationsByTypeThenRows(0, 12);
    });

    it('returns an object whose keys are the decorations types', function () {
      expect(Object.keys(decorations).sort()).toEqual(['highlight-over', 'highlight-under', 'line']);
    });

    it('stores decorations by rows within each type objects', function () {
      expect(Object.keys(decorations['highlight-over']).sort()).toEqual('1 2 6 7 8 9 10 11'.split(' ').sort());

      expect(Object.keys(decorations['line']).sort()).toEqual('3 4 12'.split(' ').sort());

      expect(Object.keys(decorations['highlight-under']).sort()).toEqual('0 1 2 3 4 5 6 7 8 9 10'.split(' ').sort());
    });

    it('stores the decorations spanning a row in the corresponding row array', function () {
      expect(decorations['highlight-over']['7'].length).toEqual(2);

      expect(decorations['line']['3'].length).toEqual(1);

      expect(decorations['highlight-under']['5'].length).toEqual(1);
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

describe('Stand alone minimap', function () {
  var _ref5 = [];
  var editor = _ref5[0];
  var editorElement = _ref5[1];
  var minimap = _ref5[2];
  var largeSample = _ref5[3];
  var smallSample = _ref5[4];

  beforeEach(function () {
    atom.config.set('minimap.charHeight', 4);
    atom.config.set('minimap.charWidth', 2);
    atom.config.set('minimap.interline', 1);

    editor = atom.workspace.buildTextEditor({});
    editorElement = atom.views.getView(editor);
    jasmine.attachToDOM(editorElement);
    editorElement.setHeight(50);
    editorElement.setWidth(200);
    editor.setLineHeightInPixels(10);

    var dir = atom.project.getDirectories()[0];

    minimap = new _libMinimap2['default']({
      textEditor: editor,
      standAlone: true
    });

    largeSample = _fsPlus2['default'].readFileSync(dir.resolve('large-file.coffee')).toString();
    smallSample = _fsPlus2['default'].readFileSync(dir.resolve('sample.coffee')).toString();
  });

  it('has an associated editor', function () {
    expect(minimap.getTextEditor()).toEqual(editor);
  });

  it('measures the minimap size based on the current editor content', function () {
    editor.setText(smallSample);
    expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5);

    editor.setText(largeSample);
    expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5);
  });

  it('measures the scaling factor between the editor and the minimap', function () {
    expect(minimap.getVerticalScaleFactor()).toEqual(0.5);
    expect(minimap.getHorizontalScaleFactor()).toEqual(2 / editor.getDefaultCharWidth());
  });

  it('measures the editor visible area size at minimap scale', function () {
    editor.setText(largeSample);
    expect(minimap.getTextEditorScaledHeight()).toEqual(25);
  });

  it('has a visible height based on the passed-in options', function () {
    expect(minimap.getVisibleHeight()).toEqual(5);

    editor.setText(smallSample);
    expect(minimap.getVisibleHeight()).toEqual(20);

    editor.setText(largeSample);
    expect(minimap.getVisibleHeight()).toEqual(editor.getScreenLineCount() * 5);

    minimap.height = 100;
    expect(minimap.getVisibleHeight()).toEqual(100);
  });

  it('has a visible width based on the passed-in options', function () {
    expect(minimap.getVisibleWidth()).toEqual(0);

    editor.setText(smallSample);
    expect(minimap.getVisibleWidth()).toEqual(36);

    editor.setText(largeSample);
    expect(minimap.getVisibleWidth()).toEqual(editor.getMaxScreenLineLength() * 2);

    minimap.width = 50;
    expect(minimap.getVisibleWidth()).toEqual(50);
  });

  it('measures the available minimap scroll', function () {
    editor.setText(largeSample);
    var largeLineCount = editor.getScreenLineCount();

    expect(minimap.getMaxScrollTop()).toEqual(0);
    expect(minimap.canScroll()).toBeFalsy();

    minimap.height = 100;

    expect(minimap.getMaxScrollTop()).toEqual(largeLineCount * 5 - 100);
    expect(minimap.canScroll()).toBeTruthy();
  });

  it('computes the first visible row in the minimap', function () {
    expect(minimap.getFirstVisibleScreenRow()).toEqual(0);
  });

  it('computes the last visible row in the minimap', function () {
    editor.setText(largeSample);

    expect(minimap.getLastVisibleScreenRow()).toEqual(editor.getScreenLineCount());

    minimap.height = 100;
    expect(minimap.getLastVisibleScreenRow()).toEqual(20);
  });

  it('does not relay scroll top events from the editor', function () {
    editor.setText(largeSample);

    var scrollSpy = jasmine.createSpy('didScroll');
    minimap.onDidChangeScrollTop(scrollSpy);

    editorElement.setScrollTop(100);

    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it('does not relay scroll left events from the editor', function () {
    editor.setText(largeSample);

    var scrollSpy = jasmine.createSpy('didScroll');
    minimap.onDidChangeScrollLeft(scrollSpy);

    // Seems like text without a view aren't able to scroll horizontally
    // even when its width was set.
    spyOn(editorElement, 'getScrollWidth').andReturn(10000);

    editorElement.setScrollLeft(100);

    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it('has a scroll top that is not bound to the text editor', function () {
    var scrollSpy = jasmine.createSpy('didScroll');
    minimap.onDidChangeScrollTop(scrollSpy);
    minimap.setScreenHeightAndWidth(100, 100);

    editor.setText(largeSample);
    editorElement.setScrollTop(1000);

    expect(minimap.getScrollTop()).toEqual(0);
    expect(scrollSpy).not.toHaveBeenCalled();

    minimap.setScrollTop(10);

    expect(minimap.getScrollTop()).toEqual(10);
    expect(scrollSpy).toHaveBeenCalled();
  });

  it('has rendering properties that can overrides the config values', function () {
    minimap.setCharWidth(8.5);
    minimap.setCharHeight(10.2);
    minimap.setInterline(10.6);

    expect(minimap.getCharWidth()).toEqual(8);
    expect(minimap.getCharHeight()).toEqual(10);
    expect(minimap.getInterline()).toEqual(10);
    expect(minimap.getLineHeight()).toEqual(20);
  });

  it('emits a config change event when a value is changed', function () {
    var changeSpy = jasmine.createSpy('did-change');
    minimap.onDidChangeConfig(changeSpy);

    minimap.setCharWidth(8.5);
    minimap.setCharHeight(10.2);
    minimap.setInterline(10.6);

    expect(changeSpy.callCount).toEqual(3);
  });

  it('returns the rounding number of devicePixelRatio', function () {
    window.devicePixelRatio = 1.25;

    minimap.setDevicePixelRatioRounding(true);

    expect(minimap.getDevicePixelRatioRounding()).toEqual(true);
    expect(minimap.getDevicePixelRatio()).toEqual(1);
  });

  it('prevents the rounding number of devicePixelRatio', function () {
    window.devicePixelRatio = 1.25;

    minimap.setDevicePixelRatioRounding(false);

    expect(minimap.getDevicePixelRatioRounding()).toEqual(false);
    expect(minimap.getDevicePixelRatio()).toEqual(1.25);
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9zcGVjL21pbmltYXAtc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztRQUVPLHFCQUFxQjs7c0JBRWIsU0FBUzs7OzswQkFDSixnQkFBZ0I7Ozs7QUFMcEMsV0FBVyxDQUFBOztBQU9YLFFBQVEsQ0FBQyxTQUFTLEVBQUUsWUFBTTthQUNtRyxFQUFFO01BQXhILE1BQU07TUFBRSxhQUFhO01BQUUsT0FBTztNQUFFLFdBQVc7TUFBRSxXQUFXO01BQUUsMEJBQTBCO01BQUUsNEJBQTRCOztBQUV2SCxZQUFVLENBQUMsWUFBTTtBQUNmLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ3hDLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ3ZDLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFBOztBQUV2QyxVQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUE7O0FBRTNDLGlCQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDMUMsV0FBTyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUNsQyxpQkFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUMzQixpQkFBYSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFFM0IsOEJBQTBCLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFBO0FBQy9ELGdDQUE0QixHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQTs7QUFFL0QsUUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxj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QUFDLENBQUMsQ0FBQyxDQUFBO0dBQ2pELENBQUMsQ0FBQTs7QUFFRixJQUFFLENBQUMsa0RBQWtELEVBQUUsWUFBTTtBQUMzRCxVQUFNLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFBOztBQUU5QixXQUFPLENBQUMsMkJBQTJCLENBQUMsS0FBSyxDQUFDLENBQUE7O0FBRTFDLFVBQU0sQ0FBQyxPQUFPLENBQUMsMkJBQTJCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUM1RCxVQUFNLENBQUMsT0FBTyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7R0FDcEQsQ0FBQyxDQUFBO0NBQ0gsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9zcGVjL21pbmltYXAtc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCAnLi9oZWxwZXJzL3dvcmtzcGFjZSdcblxuaW1wb3J0IGZzIGZyb20gJ2ZzLXBsdXMnXG5pbXBvcnQgTWluaW1hcCBmcm9tICcuLi9saWIvbWluaW1hcCdcblxuZGVzY3JpYmUoJ01pbmltYXAnLCAoKSA9PiB7XG4gIGxldCBbZWRpdG9yLCBlZGl0b3JFbGVtZW50LCBtaW5pbWFwLCBsYXJnZVNhbXBsZSwgc21hbGxTYW1wbGUsIG1pbmltYXBWZXJ0aWNhbFNjYWxlRmFjdG9yLCBtaW5pbWFwSG9yaXpvbnRhbFNjYWxlRmFjdG9yXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmNoYXJIZWlnaHQnLCA0KVxuICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5jaGFyV2lkdGgnLCAyKVxuICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5pbnRlcmxpbmUnLCAxKVxuXG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuYnVpbGRUZXh0RWRpdG9yKHt9KVxuXG4gICAgZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgamFzbWluZS5hdHRhY2hUb0RPTShlZGl0b3JFbGVtZW50KVxuICAgIGVkaXRvckVsZW1lbnQuc2V0SGVpZ2h0KDUwKVxuICAgIGVkaXRvckVsZW1lbnQuc2V0V2lkdGgoMjAwKVxuXG4gICAgbWluaW1hcFZlcnRpY2FsU2NhbGVGYWN0b3IgPSA1IC8gZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpXG4gICAgbWluaW1hcEhvcml6b250YWxTY2FsZUZhY3RvciA9IDIgLyBlZGl0b3IuZ2V0RGVmYXVsdENoYXJXaWR0aCgpXG5cbiAgICBsZXQgZGlyID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClbMF1cblxuICAgIG1pbmltYXAgPSBuZXcgTWluaW1hcCh7dGV4dEVkaXRvcjogZWRpdG9yfSlcbiAgICBsYXJnZVNhbXBsZSA9IGZzLnJlYWRGaWxlU3luYyhkaXIucmVzb2x2ZSgnbGFyZ2UtZmlsZS5jb2ZmZWUnKSkudG9TdHJpbmcoKVxuICAgIHNtYWxsU2FtcGxlID0gZnMucmVhZEZpbGVTeW5jKGRpci5yZXNvbHZlKCdzYW1wbGUuY29mZmVlJykpLnRvU3RyaW5nKClcbiAgfSlcblxuICBpdCgnaGFzIGFuIGFzc29jaWF0ZWQgZWRpdG9yJywgKCkgPT4ge1xuICAgIGV4cGVjdChtaW5pbWFwLmdldFRleHRFZGl0b3IoKSkudG9FcXVhbChlZGl0b3IpXG4gIH0pXG5cbiAgaXQoJ3JldHVybnMgZmFsc2Ugd2hlbiBhc2tlZCBpZiBkZXN0cm95ZWQnLCAoKSA9PiB7XG4gICAgZXhwZWN0KG1pbmltYXAuaXNEZXN0cm95ZWQoKSkudG9CZUZhbHN5KClcbiAgfSlcblxuICBpdCgncmFpc2UgYW4gZXhjZXB0aW9uIGlmIGNyZWF0ZWQgd2l0aG91dCBhIHRleHQgZWRpdG9yJywgKCkgPT4ge1xuICAgIGV4cGVjdCgoKSA9PiB7IHJldHVybiBuZXcgTWluaW1hcCgpIH0pLnRvVGhyb3coKVxuICB9KVxuXG4gIGl0KCdtZWFzdXJlcyB0aGUgbWluaW1hcCBzaXplIGJhc2VkIG9uIHRoZSBjdXJyZW50IGVkaXRvciBjb250ZW50JywgKCkgPT4ge1xuICAgIGVkaXRvci5zZXRUZXh0KHNtYWxsU2FtcGxlKVxuICAgIGV4cGVjdChtaW5pbWFwLmdldEhlaWdodCgpKS50b0VxdWFsKGVkaXRvci5nZXRTY3JlZW5MaW5lQ291bnQoKSAqIDUpXG5cbiAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcbiAgICBleHBlY3QobWluaW1hcC5nZXRIZWlnaHQoKSkudG9FcXVhbChlZGl0b3IuZ2V0U2NyZWVuTGluZUNvdW50KCkgKiA1KVxuICB9KVxuXG4gIGl0KCdtZWFzdXJlcyB0aGUgc2NhbGluZyBmYWN0b3IgYmV0d2VlbiB0aGUgZWRpdG9yIGFuZCB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICBleHBlY3QobWluaW1hcC5nZXRWZXJ0aWNhbFNjYWxlRmFjdG9yKCkpLnRvRXF1YWwobWluaW1hcFZlcnRpY2FsU2NhbGVGYWN0b3IpXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0SG9yaXpvbnRhbFNjYWxlRmFjdG9yKCkpLnRvRXF1YWwobWluaW1hcEhvcml6b250YWxTY2FsZUZhY3RvcilcbiAgfSlcblxuICBpdCgnbWVhc3VyZXMgdGhlIGVkaXRvciB2aXNpYmxlIGFyZWEgc2l6ZSBhdCBtaW5pbWFwIHNjYWxlJywgKCkgPT4ge1xuICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuICAgIGV4cGVjdChtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRIZWlnaHQoKSkudG9FcXVhbCg1MCAqIG1pbmltYXBWZXJ0aWNhbFNjYWxlRmFjdG9yKVxuICB9KVxuXG4gIGl0KCdtZWFzdXJlcyB0aGUgYXZhaWxhYmxlIG1pbmltYXAgc2Nyb2xsJywgKCkgPT4ge1xuICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuICAgIGxldCBsYXJnZUxpbmVDb3VudCA9IGVkaXRvci5nZXRTY3JlZW5MaW5lQ291bnQoKVxuXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0TWF4U2Nyb2xsVG9wKCkpLnRvRXF1YWwobGFyZ2VMaW5lQ291bnQgKiA1IC0gNTApXG4gICAgZXhwZWN0KG1pbmltYXAuY2FuU2Nyb2xsKCkpLnRvQmVUcnV0aHkoKVxuICB9KVxuXG4gIGl0KCdjb21wdXRlcyB0aGUgZmlyc3QgdmlzaWJsZSByb3cgaW4gdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KCkpLnRvRXF1YWwoMClcbiAgfSlcblxuICBpdCgnY29tcHV0ZXMgdGhlIGxhc3QgdmlzaWJsZSByb3cgaW4gdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSkudG9FcXVhbCgxMClcbiAgfSlcblxuICBpdCgncmVsYXlzIGNoYW5nZSBldmVudHMgZnJvbSB0aGUgdGV4dCBlZGl0b3InLCAoKSA9PiB7XG4gICAgbGV0IGNoYW5nZVNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWRDaGFuZ2UnKVxuICAgIG1pbmltYXAub25EaWRDaGFuZ2UoY2hhbmdlU3B5KVxuXG4gICAgZWRpdG9yLnNldFRleHQoJ2ZvbycpXG5cbiAgICBleHBlY3QoY2hhbmdlU3B5KS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgfSlcblxuICBpdCgncmVsYXlzIHNjcm9sbCB0b3AgZXZlbnRzIGZyb20gdGhlIGVkaXRvcicsICgpID0+IHtcbiAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcblxuICAgIGxldCBzY3JvbGxTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkU2Nyb2xsJylcbiAgICBtaW5pbWFwLm9uRGlkQ2hhbmdlU2Nyb2xsVG9wKHNjcm9sbFNweSlcblxuICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDEwMClcblxuICAgIGV4cGVjdChzY3JvbGxTcHkpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICB9KVxuXG4gIGl0KCdyZWxheXMgc2Nyb2xsIGxlZnQgZXZlbnRzIGZyb20gdGhlIGVkaXRvcicsICgpID0+IHtcbiAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcblxuICAgIGxldCBzY3JvbGxTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkU2Nyb2xsJylcbiAgICBtaW5pbWFwLm9uRGlkQ2hhbmdlU2Nyb2xsTGVmdChzY3JvbGxTcHkpXG5cbiAgICAvLyBTZWVtcyBsaWtlIHRleHQgd2l0aG91dCBhIHZpZXcgYXJlbid0IGFibGUgdG8gc2Nyb2xsIGhvcml6b250YWxseVxuICAgIC8vIGV2ZW4gd2hlbiBpdHMgd2lkdGggd2FzIHNldC5cbiAgICBzcHlPbihlZGl0b3JFbGVtZW50LCAnZ2V0U2Nyb2xsV2lkdGgnKS5hbmRSZXR1cm4oMTAwMDApXG5cbiAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbExlZnQoMTAwKVxuXG4gICAgZXhwZWN0KHNjcm9sbFNweSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gc2Nyb2xzIHBhc3QgZW5kIGlzIGVuYWJsZWQnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcbiAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNjcm9sbFBhc3RFbmQnLCB0cnVlKVxuICAgIH0pXG5cbiAgICBpdCgnYWRqdXN0IHRoZSBzY3JvbGxpbmcgcmF0aW8nLCAoKSA9PiB7XG4gICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcChlZGl0b3JFbGVtZW50LmdldFNjcm9sbEhlaWdodCgpKVxuXG4gICAgICBsZXQgbWF4U2Nyb2xsVG9wID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxIZWlnaHQoKSAtIGVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KCkgLSAoZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSAtIDMgKiBlZGl0b3IuZGlzcGxheUJ1ZmZlci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKSlcblxuICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjcm9sbFJhdGlvKCkpLnRvRXF1YWwoZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKSAvIG1heFNjcm9sbFRvcClcbiAgICB9KVxuXG4gICAgaXQoJ2xvY2sgdGhlIG1pbmltYXAgc2Nyb2xsIHRvcCB0byAxJywgKCkgPT4ge1xuICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxIZWlnaHQoKSlcbiAgICAgIGV4cGVjdChtaW5pbWFwLmdldFNjcm9sbFRvcCgpKS50b0VxdWFsKG1pbmltYXAuZ2V0TWF4U2Nyb2xsVG9wKCkpXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCdnZXRUZXh0RWRpdG9yU2Nyb2xsUmF0aW8oKSwgd2hlbiBnZXRTY3JvbGxUb3AoKSBhbmQgbWF4U2Nyb2xsVG9wIGJvdGggZXF1YWwgMCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBlZGl0b3Iuc2V0VGV4dChzbWFsbFNhbXBsZSlcbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRIZWlnaHQoNDApXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNjcm9sbFBhc3RFbmQnLCB0cnVlKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JldHVybnMgMCcsICgpID0+IHtcbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMClcbiAgICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjcm9sbFJhdGlvKCkpLnRvRXF1YWwoMClcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiBzb2Z0IHdyYXAgaXMgZW5hYmxlZCcsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNvZnRXcmFwJywgdHJ1ZSlcbiAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNvZnRXcmFwQXRQcmVmZXJyZWRMaW5lTGVuZ3RoJywgdHJ1ZSlcbiAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnByZWZlcnJlZExpbmVMZW5ndGgnLCAyKVxuICAgIH0pXG5cbiAgICBpdCgnbWVhc3VyZXMgdGhlIG1pbmltYXAgdXNpbmcgc2NyZWVuIGxpbmVzJywgKCkgPT4ge1xuICAgICAgZWRpdG9yLnNldFRleHQoc21hbGxTYW1wbGUpXG4gICAgICBleHBlY3QobWluaW1hcC5nZXRIZWlnaHQoKSkudG9FcXVhbChlZGl0b3IuZ2V0U2NyZWVuTGluZUNvdW50KCkgKiA1KVxuXG4gICAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcbiAgICAgIGV4cGVjdChtaW5pbWFwLmdldEhlaWdodCgpKS50b0VxdWFsKGVkaXRvci5nZXRTY3JlZW5MaW5lQ291bnQoKSAqIDUpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiB0aGVyZSBpcyBubyBzY3JvbGxpbmcgbmVlZGVkIHRvIGRpc3BsYXkgdGhlIHdob2xlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgaXQoJ3JldHVybnMgMCB3aGVuIGNvbXB1dGluZyB0aGUgbWluaW1hcCBzY3JvbGwnLCAoKSA9PiB7XG4gICAgICBleHBlY3QobWluaW1hcC5nZXRTY3JvbGxUb3AoKSkudG9FcXVhbCgwKVxuICAgIH0pXG5cbiAgICBpdCgncmV0dXJucyAwIHdoZW4gbWVhc3VyaW5nIHRoZSBhdmFpbGFibGUgbWluaW1hcCBzY3JvbGwnLCAoKSA9PiB7XG4gICAgICBlZGl0b3Iuc2V0VGV4dChzbWFsbFNhbXBsZSlcblxuICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0TWF4U2Nyb2xsVG9wKCkpLnRvRXF1YWwoMClcbiAgICAgIGV4cGVjdChtaW5pbWFwLmNhblNjcm9sbCgpKS50b0JlRmFsc3koKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gdGhlIGVkaXRvciBpcyBzY3JvbGxlZCcsICgpID0+IHtcbiAgICBsZXQgW2xhcmdlTGluZUNvdW50LCBlZGl0b3JTY3JvbGxSYXRpb10gPSBbXVxuXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAvLyBTYW1lIGhlcmUsIHdpdGhvdXQgYSB2aWV3LCB0aGUgZ2V0U2Nyb2xsV2lkdGggbWV0aG9kIGFsd2F5cyByZXR1cm5zIDFcbiAgICAgIC8vIGFuZCB0aGUgdGVzdCBmYWlscyBiZWNhdXNlIHRoZSBjYXBwZWQgc2Nyb2xsIGxlZnQgdmFsdWUgYWx3YXlzIGVuZCB1cFxuICAgICAgLy8gdG8gYmUgMCwgaW5kdWNpbmcgZXJyb3JzIGluIGNvbXB1dGF0aW9ucy5cbiAgICAgIHNweU9uKGVkaXRvckVsZW1lbnQsICdnZXRTY3JvbGxXaWR0aCcpLmFuZFJldHVybigxMDAwMClcblxuICAgICAgZWRpdG9yLnNldFRleHQobGFyZ2VTYW1wbGUpXG4gICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgxMDAwKVxuICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxMZWZ0KDIwMClcblxuICAgICAgbGFyZ2VMaW5lQ291bnQgPSBlZGl0b3IuZ2V0U2NyZWVuTGluZUNvdW50KClcbiAgICAgIGVkaXRvclNjcm9sbFJhdGlvID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKSAvIChlZGl0b3JFbGVtZW50LmdldFNjcm9sbEhlaWdodCgpIC0gZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSlcbiAgICB9KVxuXG4gICAgaXQoJ3NjYWxlcyB0aGUgZWRpdG9yIHNjcm9sbCBiYXNlZCBvbiB0aGUgbWluaW1hcCBzY2FsZSBmYWN0b3InLCAoKSA9PiB7XG4gICAgICBleHBlY3QobWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkU2Nyb2xsVG9wKCkpLnRvRXF1YWwoMTAwMCAqIG1pbmltYXBWZXJ0aWNhbFNjYWxlRmFjdG9yKVxuICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZFNjcm9sbExlZnQoKSkudG9FcXVhbCgyMDAgKiBtaW5pbWFwSG9yaXpvbnRhbFNjYWxlRmFjdG9yKVxuICAgIH0pXG5cbiAgICBpdCgnY29tcHV0ZXMgdGhlIG9mZnNldCB0byBhcHBseSBiYXNlZCBvbiB0aGUgZWRpdG9yIHNjcm9sbCB0b3AnLCAoKSA9PiB7XG4gICAgICBleHBlY3QobWluaW1hcC5nZXRTY3JvbGxUb3AoKSkudG9FcXVhbChlZGl0b3JTY3JvbGxSYXRpbyAqIG1pbmltYXAuZ2V0TWF4U2Nyb2xsVG9wKCkpXG4gICAgfSlcblxuICAgIGl0KCdjb21wdXRlcyB0aGUgZmlyc3QgdmlzaWJsZSByb3cgaW4gdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICBleHBlY3QobWluaW1hcC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSkudG9FcXVhbCg1OClcbiAgICB9KVxuXG4gICAgaXQoJ2NvbXB1dGVzIHRoZSBsYXN0IHZpc2libGUgcm93IGluIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSkudG9FcXVhbCg2OSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ2Rvd24gdG8gdGhlIGJvdHRvbScsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcChlZGl0b3JFbGVtZW50LmdldFNjcm9sbEhlaWdodCgpKVxuICAgICAgICBlZGl0b3JTY3JvbGxSYXRpbyA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkgLyBlZGl0b3JFbGVtZW50LmdldFNjcm9sbEhlaWdodCgpXG4gICAgICB9KVxuXG4gICAgICBpdCgnY29tcHV0ZXMgYW4gb2Zmc2V0IHRoYXQgc2Nyb2xscyB0aGUgbWluaW1hcCB0byB0aGUgYm90dG9tIGVkZ2UnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwLmdldFNjcm9sbFRvcCgpKS50b0VxdWFsKG1pbmltYXAuZ2V0TWF4U2Nyb2xsVG9wKCkpXG4gICAgICB9KVxuXG4gICAgICBpdCgnY29tcHV0ZXMgdGhlIGZpcnN0IHZpc2libGUgcm93IGluIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSkudG9FcXVhbChsYXJnZUxpbmVDb3VudCAtIDEwKVxuICAgICAgfSlcblxuICAgICAgaXQoJ2NvbXB1dGVzIHRoZSBsYXN0IHZpc2libGUgcm93IGluIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcC5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpKS50b0VxdWFsKGxhcmdlTGluZUNvdW50KVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdkZXN0cm95aW5nIHRoZSBtb2RlbCcsICgpID0+IHtcbiAgICBpdCgnZW1pdHMgYSBkaWQtZGVzdHJveSBldmVudCcsICgpID0+IHtcbiAgICAgIGxldCBzcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGVzdHJveScpXG4gICAgICBtaW5pbWFwLm9uRGlkRGVzdHJveShzcHkpXG5cbiAgICAgIG1pbmltYXAuZGVzdHJveSgpXG5cbiAgICAgIGV4cGVjdChzcHkpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgIH0pXG5cbiAgICBpdCgncmV0dXJucyB0cnVlIHdoZW4gYXNrZWQgaWYgZGVzdHJveWVkJywgKCkgPT4ge1xuICAgICAgbWluaW1hcC5kZXN0cm95KClcbiAgICAgIGV4cGVjdChtaW5pbWFwLmlzRGVzdHJveWVkKCkpLnRvQmVUcnV0aHkoKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ2Rlc3Ryb3lpbmcgdGhlIHRleHQgZWRpdG9yJywgKCkgPT4ge1xuICAgIGl0KCdkZXN0cm95cyB0aGUgbW9kZWwnLCAoKSA9PiB7XG4gICAgICBzcHlPbihtaW5pbWFwLCAnZGVzdHJveScpXG5cbiAgICAgIGVkaXRvci5kZXN0cm95KClcblxuICAgICAgZXhwZWN0KG1pbmltYXAuZGVzdHJveSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd2l0aCBzY29wZWQgc2V0dGluZ3MnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWphdmFzY3JpcHQnKVxuICAgICAgfSlcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wdHMgPSB7c2NvcGVTZWxlY3RvcjogJy5zb3VyY2UuanMnfVxuXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5jaGFySGVpZ2h0JywgOCwgb3B0cylcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmNoYXJXaWR0aCcsIDQsIG9wdHMpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5pbnRlcmxpbmUnLCAyLCBvcHRzKVxuXG4gICAgICAgIGVkaXRvci5zZXRHcmFtbWFyKGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZSgnc291cmNlLmpzJykpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnaG9ub3JzIHRoZSBzY29wZWQgc2V0dGluZ3MgZm9yIHRoZSBjdXJyZW50IGVkaXRvciBuZXcgZ3JhbW1hcicsICgpID0+IHtcbiAgICAgIGV4cGVjdChtaW5pbWFwLmdldENoYXJIZWlnaHQoKSkudG9FcXVhbCg4KVxuICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0Q2hhcldpZHRoKCkpLnRvRXF1YWwoNClcbiAgICAgIGV4cGVjdChtaW5pbWFwLmdldEludGVybGluZSgpKS50b0VxdWFsKDIpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiBpbmRlcGVuZGVudE1pbmltYXBTY3JvbGwgaXMgdHJ1ZScsICgpID0+IHtcbiAgICBsZXQgZWRpdG9yU2Nyb2xsUmF0aW9cbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMTAwMClcbiAgICAgIGVkaXRvclNjcm9sbFJhdGlvID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKSAvIChlZGl0b3JFbGVtZW50LmdldFNjcm9sbEhlaWdodCgpIC0gZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSlcblxuICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmluZGVwZW5kZW50TWluaW1hcFNjcm9sbCcsIHRydWUpXG4gICAgfSlcblxuICAgIGl0KCdpZ25vcmVzIHRoZSBzY3JvbGwgY29tcHV0ZWQgZnJvbSB0aGUgZWRpdG9yIGFuZCByZXR1cm4gdGhlIG9uZSBvZiB0aGUgbWluaW1hcCBpbnN0ZWFkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0U2Nyb2xsVG9wKCkpLnRvRXF1YWwoZWRpdG9yU2Nyb2xsUmF0aW8gKiBtaW5pbWFwLmdldE1heFNjcm9sbFRvcCgpKVxuXG4gICAgICBtaW5pbWFwLnNldFNjcm9sbFRvcCgyMDApXG5cbiAgICAgIGV4cGVjdChtaW5pbWFwLmdldFNjcm9sbFRvcCgpKS50b0VxdWFsKDIwMClcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3Njcm9sbGluZyB0aGUgZWRpdG9yJywgKCkgPT4ge1xuICAgICAgaXQoJ2NoYW5nZXMgdGhlIG1pbmltYXAgc2Nyb2xsIHRvcCcsICgpID0+IHtcbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMjAwMClcblxuICAgICAgICBleHBlY3QobWluaW1hcC5nZXRTY3JvbGxUb3AoKSkubm90LnRvRXF1YWwoZWRpdG9yU2Nyb2xsUmF0aW8gKiBtaW5pbWFwLmdldE1heFNjcm9sbFRvcCgpKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIC8vICAgICMjIyMjIyMjICAjIyMjIyMjIyAgIyMjIyMjICAgIyMjIyMjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgIyMgIyMgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjIyMjIyAgICMjICAgICAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICAgIyMgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAjIyAjIyAgICAgIyNcbiAgLy8gICAgIyMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMgICAjIyMjIyMjXG5cbiAgZGVzY3JpYmUoJzo6ZGVjb3JhdGVNYXJrZXInLCAoKSA9PiB7XG4gICAgbGV0IFttYXJrZXIsIGRlY29yYXRpb24sIGNoYW5nZVNweV0gPSBbXVxuXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcblxuICAgICAgY2hhbmdlU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZENoYW5nZScpXG4gICAgICBtaW5pbWFwLm9uRGlkQ2hhbmdlRGVjb3JhdGlvblJhbmdlKGNoYW5nZVNweSlcblxuICAgICAgbWFya2VyID0gbWluaW1hcC5tYXJrQnVmZmVyUmFuZ2UoW1swLCA2XSwgWzEsIDExXV0pXG4gICAgICBkZWNvcmF0aW9uID0gbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHt0eXBlOiAnaGlnaGxpZ2h0JywgY2xhc3M6ICdkdW1teSd9KVxuICAgIH0pXG5cbiAgICBpdCgnY3JlYXRlcyBhIGRlY29yYXRpb24gZm9yIHRoZSBnaXZlbiBtYXJrZXInLCAoKSA9PiB7XG4gICAgICBleHBlY3QobWluaW1hcC5kZWNvcmF0aW9uc0J5TWFya2VySWRbbWFya2VyLmlkXSkudG9CZURlZmluZWQoKVxuICAgIH0pXG5cbiAgICBpdCgnY3JlYXRlcyBhIGNoYW5nZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBtYXJrZXIgcmFuZ2UnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoY2hhbmdlU3B5KS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIGV4cGVjdChjaGFuZ2VTcHkuY2FsbHNbMF0uYXJnc1swXS5zdGFydCkudG9FcXVhbCgwKVxuICAgICAgZXhwZWN0KGNoYW5nZVNweS5jYWxsc1swXS5hcmdzWzBdLmVuZCkudG9FcXVhbCgxKVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiB0aGUgbWFya2VyIHJhbmdlIGNoYW5nZXMnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgbGV0IG1hcmtlckNoYW5nZVNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdtYXJrZXItZGlkLWNoYW5nZScpXG4gICAgICAgIG1hcmtlci5vbkRpZENoYW5nZShtYXJrZXJDaGFuZ2VTcHkpXG4gICAgICAgIG1hcmtlci5zZXRCdWZmZXJSYW5nZShbWzAsIDZdLCBbMywgMTFdXSlcblxuICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBtYXJrZXJDaGFuZ2VTcHkuY2FsbHMubGVuZ3RoID4gMCB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ2NyZWF0ZXMgYSBjaGFuZ2Ugb25seSBmb3IgdGhlIGRpZiBiZXR3ZWVuIHRoZSB0d28gcmFuZ2VzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoY2hhbmdlU3B5KS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgZXhwZWN0KGNoYW5nZVNweS5jYWxsc1sxXS5hcmdzWzBdLnN0YXJ0KS50b0VxdWFsKDEpXG4gICAgICAgIGV4cGVjdChjaGFuZ2VTcHkuY2FsbHNbMV0uYXJnc1swXS5lbmQpLnRvRXF1YWwoMylcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCdkZXN0cm95aW5nIHRoZSBtYXJrZXInLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgbWFya2VyLmRlc3Ryb3koKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlbW92ZXMgdGhlIGRlY29yYXRpb24gZnJvbSB0aGUgcmVuZGVyIHZpZXcnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwLmRlY29yYXRpb25zQnlNYXJrZXJJZFttYXJrZXIuaWRdKS50b0JlVW5kZWZpbmVkKClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdjcmVhdGVzIGEgY2hhbmdlIGNvcnJlc3BvbmRpbmcgdG8gdGhlIG1hcmtlciByYW5nZScsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KGNoYW5nZVNweS5jYWxsc1sxXS5hcmdzWzBdLnN0YXJ0KS50b0VxdWFsKDApXG4gICAgICAgIGV4cGVjdChjaGFuZ2VTcHkuY2FsbHNbMV0uYXJnc1swXS5lbmQpLnRvRXF1YWwoMSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCdkZXN0cm95aW5nIHRoZSBkZWNvcmF0aW9uJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIGRlY29yYXRpb24uZGVzdHJveSgpXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVtb3ZlcyB0aGUgZGVjb3JhdGlvbiBmcm9tIHRoZSByZW5kZXIgdmlldycsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXAuZGVjb3JhdGlvbnNCeU1hcmtlcklkW21hcmtlci5pZF0pLnRvQmVVbmRlZmluZWQoKVxuICAgICAgfSlcblxuICAgICAgaXQoJ2NyZWF0ZXMgYSBjaGFuZ2UgY29ycmVzcG9uZGluZyB0byB0aGUgbWFya2VyIHJhbmdlJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoY2hhbmdlU3B5LmNhbGxzWzFdLmFyZ3NbMF0uc3RhcnQpLnRvRXF1YWwoMClcbiAgICAgICAgZXhwZWN0KGNoYW5nZVNweS5jYWxsc1sxXS5hcmdzWzBdLmVuZCkudG9FcXVhbCgxKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ2Rlc3Ryb3lpbmcgYWxsIHRoZSBkZWNvcmF0aW9ucyBmb3IgdGhlIG1hcmtlcicsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBtaW5pbWFwLnJlbW92ZUFsbERlY29yYXRpb25zRm9yTWFya2VyKG1hcmtlcilcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW1vdmVzIHRoZSBkZWNvcmF0aW9uIGZyb20gdGhlIHJlbmRlciB2aWV3JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcC5kZWNvcmF0aW9uc0J5TWFya2VySWRbbWFya2VyLmlkXSkudG9CZVVuZGVmaW5lZCgpXG4gICAgICB9KVxuXG4gICAgICBpdCgnY3JlYXRlcyBhIGNoYW5nZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBtYXJrZXIgcmFuZ2UnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChjaGFuZ2VTcHkuY2FsbHNbMV0uYXJnc1swXS5zdGFydCkudG9FcXVhbCgwKVxuICAgICAgICBleHBlY3QoY2hhbmdlU3B5LmNhbGxzWzFdLmFyZ3NbMF0uZW5kKS50b0VxdWFsKDEpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnZGVzdHJveWluZyB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBtaW5pbWFwLmRlc3Ryb3koKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlbW92ZXMgYWxsIHRoZSBwcmV2aW91c2x5IGFkZGVkIGRlY29yYXRpb25zJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcC5kZWNvcmF0aW9uc0J5SWQpLnRvRXF1YWwoe30pXG4gICAgICAgIGV4cGVjdChtaW5pbWFwLmRlY29yYXRpb25zQnlNYXJrZXJJZCkudG9FcXVhbCh7fSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdwcmV2ZW50cyB0aGUgY3JlYXRpb24gb2YgbmV3IGRlY29yYXRpb25zJywgKCkgPT4ge1xuICAgICAgICBtYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMCwgNl0sIFswLCAxMV1dKVxuICAgICAgICBkZWNvcmF0aW9uID0gbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHt0eXBlOiAnaGlnaGxpZ2h0JywgY2xhc3M6ICdkdW1teSd9KVxuXG4gICAgICAgIGV4cGVjdChkZWNvcmF0aW9uKS50b0JlVW5kZWZpbmVkKClcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnOjpkZWNvcmF0aW9uc0J5VHlwZVRoZW5Sb3dzJywgKCkgPT4ge1xuICAgIGxldCBbZGVjb3JhdGlvbnNdID0gW11cblxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgZWRpdG9yLnNldFRleHQobGFyZ2VTYW1wbGUpXG5cbiAgICAgIGZ1bmN0aW9uIGNyZWF0ZURlY29yYXRpb24gKHR5cGUsIHJhbmdlKSB7XG4gICAgICAgIGxldCBtYXJrZXIgPSBtaW5pbWFwLm1hcmtCdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHt0eXBlfSlcbiAgICAgIH1cblxuICAgICAgY3JlYXRlRGVjb3JhdGlvbignaGlnaGxpZ2h0JywgW1s2LCAwXSwgWzExLCAwXV0pXG4gICAgICBjcmVhdGVEZWNvcmF0aW9uKCdoaWdobGlnaHQnLCBbWzcsIDBdLCBbOCwgMF1dKVxuICAgICAgY3JlYXRlRGVjb3JhdGlvbignaGlnaGxpZ2h0LW92ZXInLCBbWzEsIDBdLCBbMiwgMF1dKVxuICAgICAgY3JlYXRlRGVjb3JhdGlvbignbGluZScsIFtbMywgMF0sIFs0LCAwXV0pXG4gICAgICBjcmVhdGVEZWNvcmF0aW9uKCdsaW5lJywgW1sxMiwgMF0sIFsxMiwgMF1dKVxuICAgICAgY3JlYXRlRGVjb3JhdGlvbignaGlnaGxpZ2h0LXVuZGVyJywgW1swLCAwXSwgWzEwLCAxXV0pXG5cbiAgICAgIGRlY29yYXRpb25zID0gbWluaW1hcC5kZWNvcmF0aW9uc0J5VHlwZVRoZW5Sb3dzKDAsIDEyKVxuICAgIH0pXG5cbiAgICBpdCgncmV0dXJucyBhbiBvYmplY3Qgd2hvc2Uga2V5cyBhcmUgdGhlIGRlY29yYXRpb25zIHR5cGVzJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KE9iamVjdC5rZXlzKGRlY29yYXRpb25zKS5zb3J0KCkpLnRvRXF1YWwoWydoaWdobGlnaHQtb3ZlcicsICdoaWdobGlnaHQtdW5kZXInLCAnbGluZSddKVxuICAgIH0pXG5cbiAgICBpdCgnc3RvcmVzIGRlY29yYXRpb25zIGJ5IHJvd3Mgd2l0aGluIGVhY2ggdHlwZSBvYmplY3RzJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KE9iamVjdC5rZXlzKGRlY29yYXRpb25zWydoaWdobGlnaHQtb3ZlciddKS5zb3J0KCkpXG4gICAgICAudG9FcXVhbCgnMSAyIDYgNyA4IDkgMTAgMTEnLnNwbGl0KCcgJykuc29ydCgpKVxuXG4gICAgICBleHBlY3QoT2JqZWN0LmtleXMoZGVjb3JhdGlvbnNbJ2xpbmUnXSkuc29ydCgpKVxuICAgICAgLnRvRXF1YWwoJzMgNCAxMicuc3BsaXQoJyAnKS5zb3J0KCkpXG5cbiAgICAgIGV4cGVjdChPYmplY3Qua2V5cyhkZWNvcmF0aW9uc1snaGlnaGxpZ2h0LXVuZGVyJ10pLnNvcnQoKSlcbiAgICAgIC50b0VxdWFsKCcwIDEgMiAzIDQgNSA2IDcgOCA5IDEwJy5zcGxpdCgnICcpLnNvcnQoKSlcbiAgICB9KVxuXG4gICAgaXQoJ3N0b3JlcyB0aGUgZGVjb3JhdGlvbnMgc3Bhbm5pbmcgYSByb3cgaW4gdGhlIGNvcnJlc3BvbmRpbmcgcm93IGFycmF5JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGRlY29yYXRpb25zWydoaWdobGlnaHQtb3ZlciddWyc3J10ubGVuZ3RoKS50b0VxdWFsKDIpXG5cbiAgICAgIGV4cGVjdChkZWNvcmF0aW9uc1snbGluZSddWyczJ10ubGVuZ3RoKS50b0VxdWFsKDEpXG5cbiAgICAgIGV4cGVjdChkZWNvcmF0aW9uc1snaGlnaGxpZ2h0LXVuZGVyJ11bJzUnXS5sZW5ndGgpLnRvRXF1YWwoMSlcbiAgICB9KVxuICB9KVxufSlcblxuLy8gICAgICMjIyMjIyAgIyMjIyMjIyMgICAgIyMjICAgICMjICAgICMjICMjIyMjIyMjXG4vLyAgICAjIyAgICAjIyAgICAjIyAgICAgICMjICMjICAgIyMjICAgIyMgIyMgICAgICMjXG4vLyAgICAjIyAgICAgICAgICAjIyAgICAgIyMgICAjIyAgIyMjIyAgIyMgIyMgICAgICMjXG4vLyAgICAgIyMjIyMjICAgICAjIyAgICAjIyAgICAgIyMgIyMgIyMgIyMgIyMgICAgICMjXG4vLyAgICAgICAgICAjIyAgICAjIyAgICAjIyMjIyMjIyMgIyMgICMjIyMgIyMgICAgICMjXG4vLyAgICAjIyAgICAjIyAgICAjIyAgICAjIyAgICAgIyMgIyMgICAjIyMgIyMgICAgICMjXG4vLyAgICAgIyMjIyMjICAgICAjIyAgICAjIyAgICAgIyMgIyMgICAgIyMgIyMjIyMjIyNcbi8vXG4vLyAgICAgICAjIyMgICAgIyMgICAgICAgICMjIyMjIyMgICMjICAgICMjICMjIyMjIyMjXG4vLyAgICAgICMjICMjICAgIyMgICAgICAgIyMgICAgICMjICMjIyAgICMjICMjXG4vLyAgICAgIyMgICAjIyAgIyMgICAgICAgIyMgICAgICMjICMjIyMgICMjICMjXG4vLyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjICMjICMjICMjICMjIyMjI1xuLy8gICAgIyMjIyMjIyMjICMjICAgICAgICMjICAgICAjIyAjIyAgIyMjIyAjI1xuLy8gICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAgICMjIyAjI1xuLy8gICAgIyMgICAgICMjICMjIyMjIyMjICAjIyMjIyMjICAjIyAgICAjIyAjIyMjIyMjI1xuXG5kZXNjcmliZSgnU3RhbmQgYWxvbmUgbWluaW1hcCcsICgpID0+IHtcbiAgbGV0IFtlZGl0b3IsIGVkaXRvckVsZW1lbnQsIG1pbmltYXAsIGxhcmdlU2FtcGxlLCBzbWFsbFNhbXBsZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5jaGFySGVpZ2h0JywgNClcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuY2hhcldpZHRoJywgMilcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuaW50ZXJsaW5lJywgMSlcblxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcih7fSlcbiAgICBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGVkaXRvckVsZW1lbnQpXG4gICAgZWRpdG9yRWxlbWVudC5zZXRIZWlnaHQoNTApXG4gICAgZWRpdG9yRWxlbWVudC5zZXRXaWR0aCgyMDApXG4gICAgZWRpdG9yLnNldExpbmVIZWlnaHRJblBpeGVscygxMClcblxuICAgIGxldCBkaXIgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVswXVxuXG4gICAgbWluaW1hcCA9IG5ldyBNaW5pbWFwKHtcbiAgICAgIHRleHRFZGl0b3I6IGVkaXRvcixcbiAgICAgIHN0YW5kQWxvbmU6IHRydWVcbiAgICB9KVxuXG4gICAgbGFyZ2VTYW1wbGUgPSBmcy5yZWFkRmlsZVN5bmMoZGlyLnJlc29sdmUoJ2xhcmdlLWZpbGUuY29mZmVlJykpLnRvU3RyaW5nKClcbiAgICBzbWFsbFNhbXBsZSA9IGZzLnJlYWRGaWxlU3luYyhkaXIucmVzb2x2ZSgnc2FtcGxlLmNvZmZlZScpKS50b1N0cmluZygpXG4gIH0pXG5cbiAgaXQoJ2hhcyBhbiBhc3NvY2lhdGVkIGVkaXRvcicsICgpID0+IHtcbiAgICBleHBlY3QobWluaW1hcC5nZXRUZXh0RWRpdG9yKCkpLnRvRXF1YWwoZWRpdG9yKVxuICB9KVxuXG4gIGl0KCdtZWFzdXJlcyB0aGUgbWluaW1hcCBzaXplIGJhc2VkIG9uIHRoZSBjdXJyZW50IGVkaXRvciBjb250ZW50JywgKCkgPT4ge1xuICAgIGVkaXRvci5zZXRUZXh0KHNtYWxsU2FtcGxlKVxuICAgIGV4cGVjdChtaW5pbWFwLmdldEhlaWdodCgpKS50b0VxdWFsKGVkaXRvci5nZXRTY3JlZW5MaW5lQ291bnQoKSAqIDUpXG5cbiAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcbiAgICBleHBlY3QobWluaW1hcC5nZXRIZWlnaHQoKSkudG9FcXVhbChlZGl0b3IuZ2V0U2NyZWVuTGluZUNvdW50KCkgKiA1KVxuICB9KVxuXG4gIGl0KCdtZWFzdXJlcyB0aGUgc2NhbGluZyBmYWN0b3IgYmV0d2VlbiB0aGUgZWRpdG9yIGFuZCB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICBleHBlY3QobWluaW1hcC5nZXRWZXJ0aWNhbFNjYWxlRmFjdG9yKCkpLnRvRXF1YWwoMC41KVxuICAgIGV4cGVjdChtaW5pbWFwLmdldEhvcml6b250YWxTY2FsZUZhY3RvcigpKS50b0VxdWFsKDIgLyBlZGl0b3IuZ2V0RGVmYXVsdENoYXJXaWR0aCgpKVxuICB9KVxuXG4gIGl0KCdtZWFzdXJlcyB0aGUgZWRpdG9yIHZpc2libGUgYXJlYSBzaXplIGF0IG1pbmltYXAgc2NhbGUnLCAoKSA9PiB7XG4gICAgZWRpdG9yLnNldFRleHQobGFyZ2VTYW1wbGUpXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpKS50b0VxdWFsKDI1KVxuICB9KVxuXG4gIGl0KCdoYXMgYSB2aXNpYmxlIGhlaWdodCBiYXNlZCBvbiB0aGUgcGFzc2VkLWluIG9wdGlvbnMnLCAoKSA9PiB7XG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0VmlzaWJsZUhlaWdodCgpKS50b0VxdWFsKDUpXG5cbiAgICBlZGl0b3Iuc2V0VGV4dChzbWFsbFNhbXBsZSlcbiAgICBleHBlY3QobWluaW1hcC5nZXRWaXNpYmxlSGVpZ2h0KCkpLnRvRXF1YWwoMjApXG5cbiAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcbiAgICBleHBlY3QobWluaW1hcC5nZXRWaXNpYmxlSGVpZ2h0KCkpLnRvRXF1YWwoZWRpdG9yLmdldFNjcmVlbkxpbmVDb3VudCgpICogNSlcblxuICAgIG1pbmltYXAuaGVpZ2h0ID0gMTAwXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0VmlzaWJsZUhlaWdodCgpKS50b0VxdWFsKDEwMClcbiAgfSlcblxuICBpdCgnaGFzIGEgdmlzaWJsZSB3aWR0aCBiYXNlZCBvbiB0aGUgcGFzc2VkLWluIG9wdGlvbnMnLCAoKSA9PiB7XG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0VmlzaWJsZVdpZHRoKCkpLnRvRXF1YWwoMClcblxuICAgIGVkaXRvci5zZXRUZXh0KHNtYWxsU2FtcGxlKVxuICAgIGV4cGVjdChtaW5pbWFwLmdldFZpc2libGVXaWR0aCgpKS50b0VxdWFsKDM2KVxuXG4gICAgZWRpdG9yLnNldFRleHQobGFyZ2VTYW1wbGUpXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0VmlzaWJsZVdpZHRoKCkpLnRvRXF1YWwoZWRpdG9yLmdldE1heFNjcmVlbkxpbmVMZW5ndGgoKSAqIDIpXG5cbiAgICBtaW5pbWFwLndpZHRoID0gNTBcbiAgICBleHBlY3QobWluaW1hcC5nZXRWaXNpYmxlV2lkdGgoKSkudG9FcXVhbCg1MClcbiAgfSlcblxuICBpdCgnbWVhc3VyZXMgdGhlIGF2YWlsYWJsZSBtaW5pbWFwIHNjcm9sbCcsICgpID0+IHtcbiAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcbiAgICBsZXQgbGFyZ2VMaW5lQ291bnQgPSBlZGl0b3IuZ2V0U2NyZWVuTGluZUNvdW50KClcblxuICAgIGV4cGVjdChtaW5pbWFwLmdldE1heFNjcm9sbFRvcCgpKS50b0VxdWFsKDApXG4gICAgZXhwZWN0KG1pbmltYXAuY2FuU2Nyb2xsKCkpLnRvQmVGYWxzeSgpXG5cbiAgICBtaW5pbWFwLmhlaWdodCA9IDEwMFxuXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0TWF4U2Nyb2xsVG9wKCkpLnRvRXF1YWwobGFyZ2VMaW5lQ291bnQgKiA1IC0gMTAwKVxuICAgIGV4cGVjdChtaW5pbWFwLmNhblNjcm9sbCgpKS50b0JlVHJ1dGh5KClcbiAgfSlcblxuICBpdCgnY29tcHV0ZXMgdGhlIGZpcnN0IHZpc2libGUgcm93IGluIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgIGV4cGVjdChtaW5pbWFwLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpKS50b0VxdWFsKDApXG4gIH0pXG5cbiAgaXQoJ2NvbXB1dGVzIHRoZSBsYXN0IHZpc2libGUgcm93IGluIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSkudG9FcXVhbChlZGl0b3IuZ2V0U2NyZWVuTGluZUNvdW50KCkpXG5cbiAgICBtaW5pbWFwLmhlaWdodCA9IDEwMFxuICAgIGV4cGVjdChtaW5pbWFwLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCkpLnRvRXF1YWwoMjApXG4gIH0pXG5cbiAgaXQoJ2RvZXMgbm90IHJlbGF5IHNjcm9sbCB0b3AgZXZlbnRzIGZyb20gdGhlIGVkaXRvcicsICgpID0+IHtcbiAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcblxuICAgIGxldCBzY3JvbGxTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkU2Nyb2xsJylcbiAgICBtaW5pbWFwLm9uRGlkQ2hhbmdlU2Nyb2xsVG9wKHNjcm9sbFNweSlcblxuICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDEwMClcblxuICAgIGV4cGVjdChzY3JvbGxTcHkpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcbiAgfSlcblxuICBpdCgnZG9lcyBub3QgcmVsYXkgc2Nyb2xsIGxlZnQgZXZlbnRzIGZyb20gdGhlIGVkaXRvcicsICgpID0+IHtcbiAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcblxuICAgIGxldCBzY3JvbGxTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkU2Nyb2xsJylcbiAgICBtaW5pbWFwLm9uRGlkQ2hhbmdlU2Nyb2xsTGVmdChzY3JvbGxTcHkpXG5cbiAgICAvLyBTZWVtcyBsaWtlIHRleHQgd2l0aG91dCBhIHZpZXcgYXJlbid0IGFibGUgdG8gc2Nyb2xsIGhvcml6b250YWxseVxuICAgIC8vIGV2ZW4gd2hlbiBpdHMgd2lkdGggd2FzIHNldC5cbiAgICBzcHlPbihlZGl0b3JFbGVtZW50LCAnZ2V0U2Nyb2xsV2lkdGgnKS5hbmRSZXR1cm4oMTAwMDApXG5cbiAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbExlZnQoMTAwKVxuXG4gICAgZXhwZWN0KHNjcm9sbFNweSkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICB9KVxuXG4gIGl0KCdoYXMgYSBzY3JvbGwgdG9wIHRoYXQgaXMgbm90IGJvdW5kIHRvIHRoZSB0ZXh0IGVkaXRvcicsICgpID0+IHtcbiAgICBsZXQgc2Nyb2xsU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZFNjcm9sbCcpXG4gICAgbWluaW1hcC5vbkRpZENoYW5nZVNjcm9sbFRvcChzY3JvbGxTcHkpXG4gICAgbWluaW1hcC5zZXRTY3JlZW5IZWlnaHRBbmRXaWR0aCgxMDAsIDEwMClcblxuICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDEwMDApXG5cbiAgICBleHBlY3QobWluaW1hcC5nZXRTY3JvbGxUb3AoKSkudG9FcXVhbCgwKVxuICAgIGV4cGVjdChzY3JvbGxTcHkpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgIG1pbmltYXAuc2V0U2Nyb2xsVG9wKDEwKVxuXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0U2Nyb2xsVG9wKCkpLnRvRXF1YWwoMTApXG4gICAgZXhwZWN0KHNjcm9sbFNweSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gIH0pXG5cbiAgaXQoJ2hhcyByZW5kZXJpbmcgcHJvcGVydGllcyB0aGF0IGNhbiBvdmVycmlkZXMgdGhlIGNvbmZpZyB2YWx1ZXMnLCAoKSA9PiB7XG4gICAgbWluaW1hcC5zZXRDaGFyV2lkdGgoOC41KVxuICAgIG1pbmltYXAuc2V0Q2hhckhlaWdodCgxMC4yKVxuICAgIG1pbmltYXAuc2V0SW50ZXJsaW5lKDEwLjYpXG5cbiAgICBleHBlY3QobWluaW1hcC5nZXRDaGFyV2lkdGgoKSkudG9FcXVhbCg4KVxuICAgIGV4cGVjdChtaW5pbWFwLmdldENoYXJIZWlnaHQoKSkudG9FcXVhbCgxMClcbiAgICBleHBlY3QobWluaW1hcC5nZXRJbnRlcmxpbmUoKSkudG9FcXVhbCgxMClcbiAgICBleHBlY3QobWluaW1hcC5nZXRMaW5lSGVpZ2h0KCkpLnRvRXF1YWwoMjApXG4gIH0pXG5cbiAgaXQoJ2VtaXRzIGEgY29uZmlnIGNoYW5nZSBldmVudCB3aGVuIGEgdmFsdWUgaXMgY2hhbmdlZCcsICgpID0+IHtcbiAgICBsZXQgY2hhbmdlU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC1jaGFuZ2UnKVxuICAgIG1pbmltYXAub25EaWRDaGFuZ2VDb25maWcoY2hhbmdlU3B5KVxuXG4gICAgbWluaW1hcC5zZXRDaGFyV2lkdGgoOC41KVxuICAgIG1pbmltYXAuc2V0Q2hhckhlaWdodCgxMC4yKVxuICAgIG1pbmltYXAuc2V0SW50ZXJsaW5lKDEwLjYpXG5cbiAgICBleHBlY3QoY2hhbmdlU3B5LmNhbGxDb3VudCkudG9FcXVhbCgzKVxuICB9KVxuXG4gIGl0KCdyZXR1cm5zIHRoZSByb3VuZGluZyBudW1iZXIgb2YgZGV2aWNlUGl4ZWxSYXRpbycsICgpID0+IHtcbiAgICB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA9IDEuMjVcblxuICAgIG1pbmltYXAuc2V0RGV2aWNlUGl4ZWxSYXRpb1JvdW5kaW5nKHRydWUpXG5cbiAgICBleHBlY3QobWluaW1hcC5nZXREZXZpY2VQaXhlbFJhdGlvUm91bmRpbmcoKSkudG9FcXVhbCh0cnVlKVxuICAgIGV4cGVjdChtaW5pbWFwLmdldERldmljZVBpeGVsUmF0aW8oKSkudG9FcXVhbCgxKVxuICB9KVxuXG4gIGl0KCdwcmV2ZW50cyB0aGUgcm91bmRpbmcgbnVtYmVyIG9mIGRldmljZVBpeGVsUmF0aW8nLCAoKSA9PiB7XG4gICAgd2luZG93LmRldmljZVBpeGVsUmF0aW8gPSAxLjI1XG5cbiAgICBtaW5pbWFwLnNldERldmljZVBpeGVsUmF0aW9Sb3VuZGluZyhmYWxzZSlcblxuICAgIGV4cGVjdChtaW5pbWFwLmdldERldmljZVBpeGVsUmF0aW9Sb3VuZGluZygpKS50b0VxdWFsKGZhbHNlKVxuICAgIGV4cGVjdChtaW5pbWFwLmdldERldmljZVBpeGVsUmF0aW8oKSkudG9FcXVhbCgxLjI1KVxuICB9KVxufSlcbiJdfQ==
//# sourceURL=/home/takaaki/.atom/packages/minimap/spec/minimap-spec.js
