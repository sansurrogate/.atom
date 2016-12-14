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
    editor.autoHeight = false;

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

      var maxScrollTop = editorElement.getScrollHeight() - editorElement.getHeight() - (editorElement.getHeight() - 3 * editor.getLineHeightInPixels());

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
    editor.autoHeight = false;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9zcGVjL21pbmltYXAtc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztRQUVPLHFCQUFxQjs7c0JBRWIsU0FBUzs7OzswQkFDSixnQkFBZ0I7Ozs7QUFMcEMsV0FBVyxDQUFBOztBQU9YLFFBQVEsQ0FBQyxTQUFTLEVBQUUsWUFBTTthQUNtRyxFQUFFO01BQXhILE1BQU07TUFBRSxhQUFhO01BQUUsT0FBTztNQUFFLFdBQVc7TUFBRSxXQUFXO01BQUUsMEJBQTBCO01BQUUsNEJBQTRCOztBQUV2SCxZQUFVLENBQUMsWUFBTTtBQUNmLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ3hDLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ3ZDLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFBOztBQUV2QyxVQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDM0MsVUFBTSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUE7O0FBRXpCLGlCQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDMUMsV0FBTyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUNsQyxpQkFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUMzQixpQkFBYSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFFM0IsOEJBQTBCLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFBO0FBQy9ELGdDQUE0QixHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQTs7QUFFL0Qs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QUMsQ0FBQTtBQUMzRCxVQUFNLENBQUMsT0FBTyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUE7R0FDakQsQ0FBQyxDQUFBOztBQUVGLElBQUUsQ0FBQyxrREFBa0QsRUFBRSxZQUFNO0FBQzNELFVBQU0sQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUE7O0FBRTlCLFdBQU8sQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLENBQUMsQ0FBQTs7QUFFMUMsVUFBTSxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQzVELFVBQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtHQUNwRCxDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL3NwZWMvbWluaW1hcC1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0ICcuL2hlbHBlcnMvd29ya3NwYWNlJ1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMtcGx1cydcbmltcG9ydCBNaW5pbWFwIGZyb20gJy4uL2xpYi9taW5pbWFwJ1xuXG5kZXNjcmliZSgnTWluaW1hcCcsICgpID0+IHtcbiAgbGV0IFtlZGl0b3IsIGVkaXRvckVsZW1lbnQsIG1pbmltYXAsIGxhcmdlU2FtcGxlLCBzbWFsbFNhbXBsZSwgbWluaW1hcFZlcnRpY2FsU2NhbGVGYWN0b3IsIG1pbmltYXBIb3Jpem9udGFsU2NhbGVGYWN0b3JdID0gW11cblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuY2hhckhlaWdodCcsIDQpXG4gICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmNoYXJXaWR0aCcsIDIpXG4gICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmludGVybGluZScsIDEpXG5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3Ioe30pXG4gICAgZWRpdG9yLmF1dG9IZWlnaHQgPSBmYWxzZVxuXG4gICAgZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgamFzbWluZS5hdHRhY2hUb0RPTShlZGl0b3JFbGVtZW50KVxuICAgIGVkaXRvckVsZW1lbnQuc2V0SGVpZ2h0KDUwKVxuICAgIGVkaXRvckVsZW1lbnQuc2V0V2lkdGgoMjAwKVxuXG4gICAgbWluaW1hcFZlcnRpY2FsU2NhbGVGYWN0b3IgPSA1IC8gZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpXG4gICAgbWluaW1hcEhvcml6b250YWxTY2FsZUZhY3RvciA9IDIgLyBlZGl0b3IuZ2V0RGVmYXVsdENoYXJXaWR0aCgpXG5cbiAgICBsZXQgZGlyID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClbMF1cblxuICAgIG1pbmltYXAgPSBuZXcgTWluaW1hcCh7dGV4dEVkaXRvcjogZWRpdG9yfSlcbiAgICBsYXJnZVNhbXBsZSA9IGZzLnJlYWRGaWxlU3luYyhkaXIucmVzb2x2ZSgnbGFyZ2UtZmlsZS5jb2ZmZWUnKSkudG9TdHJpbmcoKVxuICAgIHNtYWxsU2FtcGxlID0gZnMucmVhZEZpbGVTeW5jKGRpci5yZXNvbHZlKCdzYW1wbGUuY29mZmVlJykpLnRvU3RyaW5nKClcbiAgfSlcblxuICBpdCgnaGFzIGFuIGFzc29jaWF0ZWQgZWRpdG9yJywgKCkgPT4ge1xuICAgIGV4cGVjdChtaW5pbWFwLmdldFRleHRFZGl0b3IoKSkudG9FcXVhbChlZGl0b3IpXG4gIH0pXG5cbiAgaXQoJ3JldHVybnMgZmFsc2Ugd2hlbiBhc2tlZCBpZiBkZXN0cm95ZWQnLCAoKSA9PiB7XG4gICAgZXhwZWN0KG1pbmltYXAuaXNEZXN0cm95ZWQoKSkudG9CZUZhbHN5KClcbiAgfSlcblxuICBpdCgncmFpc2UgYW4gZXhjZXB0aW9uIGlmIGNyZWF0ZWQgd2l0aG91dCBhIHRleHQgZWRpdG9yJywgKCkgPT4ge1xuICAgIGV4cGVjdCgoKSA9PiB7IHJldHVybiBuZXcgTWluaW1hcCgpIH0pLnRvVGhyb3coKVxuICB9KVxuXG4gIGl0KCdtZWFzdXJlcyB0aGUgbWluaW1hcCBzaXplIGJhc2VkIG9uIHRoZSBjdXJyZW50IGVkaXRvciBjb250ZW50JywgKCkgPT4ge1xuICAgIGVkaXRvci5zZXRUZXh0KHNtYWxsU2FtcGxlKVxuICAgIGV4cGVjdChtaW5pbWFwLmdldEhlaWdodCgpKS50b0VxdWFsKGVkaXRvci5nZXRTY3JlZW5MaW5lQ291bnQoKSAqIDUpXG5cbiAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcbiAgICBleHBlY3QobWluaW1hcC5nZXRIZWlnaHQoKSkudG9FcXVhbChlZGl0b3IuZ2V0U2NyZWVuTGluZUNvdW50KCkgKiA1KVxuICB9KVxuXG4gIGl0KCdtZWFzdXJlcyB0aGUgc2NhbGluZyBmYWN0b3IgYmV0d2VlbiB0aGUgZWRpdG9yIGFuZCB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICBleHBlY3QobWluaW1hcC5nZXRWZXJ0aWNhbFNjYWxlRmFjdG9yKCkpLnRvRXF1YWwobWluaW1hcFZlcnRpY2FsU2NhbGVGYWN0b3IpXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0SG9yaXpvbnRhbFNjYWxlRmFjdG9yKCkpLnRvRXF1YWwobWluaW1hcEhvcml6b250YWxTY2FsZUZhY3RvcilcbiAgfSlcblxuICBpdCgnbWVhc3VyZXMgdGhlIGVkaXRvciB2aXNpYmxlIGFyZWEgc2l6ZSBhdCBtaW5pbWFwIHNjYWxlJywgKCkgPT4ge1xuICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuICAgIGV4cGVjdChtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRIZWlnaHQoKSkudG9FcXVhbCg1MCAqIG1pbmltYXBWZXJ0aWNhbFNjYWxlRmFjdG9yKVxuICB9KVxuXG4gIGl0KCdtZWFzdXJlcyB0aGUgYXZhaWxhYmxlIG1pbmltYXAgc2Nyb2xsJywgKCkgPT4ge1xuICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuICAgIGxldCBsYXJnZUxpbmVDb3VudCA9IGVkaXRvci5nZXRTY3JlZW5MaW5lQ291bnQoKVxuXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0TWF4U2Nyb2xsVG9wKCkpLnRvRXF1YWwobGFyZ2VMaW5lQ291bnQgKiA1IC0gNTApXG4gICAgZXhwZWN0KG1pbmltYXAuY2FuU2Nyb2xsKCkpLnRvQmVUcnV0aHkoKVxuICB9KVxuXG4gIGl0KCdjb21wdXRlcyB0aGUgZmlyc3QgdmlzaWJsZSByb3cgaW4gdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KCkpLnRvRXF1YWwoMClcbiAgfSlcblxuICBpdCgnY29tcHV0ZXMgdGhlIGxhc3QgdmlzaWJsZSByb3cgaW4gdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSkudG9FcXVhbCgxMClcbiAgfSlcblxuICBpdCgncmVsYXlzIGNoYW5nZSBldmVudHMgZnJvbSB0aGUgdGV4dCBlZGl0b3InLCAoKSA9PiB7XG4gICAgbGV0IGNoYW5nZVNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWRDaGFuZ2UnKVxuICAgIG1pbmltYXAub25EaWRDaGFuZ2UoY2hhbmdlU3B5KVxuXG4gICAgZWRpdG9yLnNldFRleHQoJ2ZvbycpXG5cbiAgICBleHBlY3QoY2hhbmdlU3B5KS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgfSlcblxuICBpdCgncmVsYXlzIHNjcm9sbCB0b3AgZXZlbnRzIGZyb20gdGhlIGVkaXRvcicsICgpID0+IHtcbiAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcblxuICAgIGxldCBzY3JvbGxTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkU2Nyb2xsJylcbiAgICBtaW5pbWFwLm9uRGlkQ2hhbmdlU2Nyb2xsVG9wKHNjcm9sbFNweSlcblxuICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDEwMClcblxuICAgIGV4cGVjdChzY3JvbGxTcHkpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICB9KVxuXG4gIGl0KCdyZWxheXMgc2Nyb2xsIGxlZnQgZXZlbnRzIGZyb20gdGhlIGVkaXRvcicsICgpID0+IHtcbiAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcblxuICAgIGxldCBzY3JvbGxTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkU2Nyb2xsJylcbiAgICBtaW5pbWFwLm9uRGlkQ2hhbmdlU2Nyb2xsTGVmdChzY3JvbGxTcHkpXG5cbiAgICAvLyBTZWVtcyBsaWtlIHRleHQgd2l0aG91dCBhIHZpZXcgYXJlbid0IGFibGUgdG8gc2Nyb2xsIGhvcml6b250YWxseVxuICAgIC8vIGV2ZW4gd2hlbiBpdHMgd2lkdGggd2FzIHNldC5cbiAgICBzcHlPbihlZGl0b3JFbGVtZW50LCAnZ2V0U2Nyb2xsV2lkdGgnKS5hbmRSZXR1cm4oMTAwMDApXG5cbiAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbExlZnQoMTAwKVxuXG4gICAgZXhwZWN0KHNjcm9sbFNweSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gc2Nyb2xzIHBhc3QgZW5kIGlzIGVuYWJsZWQnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcbiAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNjcm9sbFBhc3RFbmQnLCB0cnVlKVxuICAgIH0pXG5cbiAgICBpdCgnYWRqdXN0IHRoZSBzY3JvbGxpbmcgcmF0aW8nLCAoKSA9PiB7XG4gICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcChlZGl0b3JFbGVtZW50LmdldFNjcm9sbEhlaWdodCgpKVxuXG4gICAgICBsZXQgbWF4U2Nyb2xsVG9wID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxIZWlnaHQoKSAtIGVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KCkgLSAoZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSAtIDMgKiBlZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkpXG5cbiAgICAgIGV4cGVjdChtaW5pbWFwLmdldFRleHRFZGl0b3JTY3JvbGxSYXRpbygpKS50b0VxdWFsKGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkgLyBtYXhTY3JvbGxUb3ApXG4gICAgfSlcblxuICAgIGl0KCdsb2NrIHRoZSBtaW5pbWFwIHNjcm9sbCB0b3AgdG8gMScsICgpID0+IHtcbiAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsSGVpZ2h0KCkpXG4gICAgICBleHBlY3QobWluaW1hcC5nZXRTY3JvbGxUb3AoKSkudG9FcXVhbChtaW5pbWFwLmdldE1heFNjcm9sbFRvcCgpKVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnZ2V0VGV4dEVkaXRvclNjcm9sbFJhdGlvKCksIHdoZW4gZ2V0U2Nyb2xsVG9wKCkgYW5kIG1heFNjcm9sbFRvcCBib3RoIGVxdWFsIDAnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgZWRpdG9yLnNldFRleHQoc21hbGxTYW1wbGUpXG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0SGVpZ2h0KDQwKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5zY3JvbGxQYXN0RW5kJywgdHJ1ZSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZXR1cm5zIDAnLCAoKSA9PiB7XG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDApXG4gICAgICAgIGV4cGVjdChtaW5pbWFwLmdldFRleHRFZGl0b3JTY3JvbGxSYXRpbygpKS50b0VxdWFsKDApXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gc29mdCB3cmFwIGlzIGVuYWJsZWQnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5zb2Z0V3JhcCcsIHRydWUpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5zb2Z0V3JhcEF0UHJlZmVycmVkTGluZUxlbmd0aCcsIHRydWUpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5wcmVmZXJyZWRMaW5lTGVuZ3RoJywgMilcbiAgICB9KVxuXG4gICAgaXQoJ21lYXN1cmVzIHRoZSBtaW5pbWFwIHVzaW5nIHNjcmVlbiBsaW5lcycsICgpID0+IHtcbiAgICAgIGVkaXRvci5zZXRUZXh0KHNtYWxsU2FtcGxlKVxuICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0SGVpZ2h0KCkpLnRvRXF1YWwoZWRpdG9yLmdldFNjcmVlbkxpbmVDb3VudCgpICogNSlcblxuICAgICAgZWRpdG9yLnNldFRleHQobGFyZ2VTYW1wbGUpXG4gICAgICBleHBlY3QobWluaW1hcC5nZXRIZWlnaHQoKSkudG9FcXVhbChlZGl0b3IuZ2V0U2NyZWVuTGluZUNvdW50KCkgKiA1KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gdGhlcmUgaXMgbm8gc2Nyb2xsaW5nIG5lZWRlZCB0byBkaXNwbGF5IHRoZSB3aG9sZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgIGl0KCdyZXR1cm5zIDAgd2hlbiBjb21wdXRpbmcgdGhlIG1pbmltYXAgc2Nyb2xsJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0U2Nyb2xsVG9wKCkpLnRvRXF1YWwoMClcbiAgICB9KVxuXG4gICAgaXQoJ3JldHVybnMgMCB3aGVuIG1lYXN1cmluZyB0aGUgYXZhaWxhYmxlIG1pbmltYXAgc2Nyb2xsJywgKCkgPT4ge1xuICAgICAgZWRpdG9yLnNldFRleHQoc21hbGxTYW1wbGUpXG5cbiAgICAgIGV4cGVjdChtaW5pbWFwLmdldE1heFNjcm9sbFRvcCgpKS50b0VxdWFsKDApXG4gICAgICBleHBlY3QobWluaW1hcC5jYW5TY3JvbGwoKSkudG9CZUZhbHN5KClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aGVuIHRoZSBlZGl0b3IgaXMgc2Nyb2xsZWQnLCAoKSA9PiB7XG4gICAgbGV0IFtsYXJnZUxpbmVDb3VudCwgZWRpdG9yU2Nyb2xsUmF0aW9dID0gW11cblxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgLy8gU2FtZSBoZXJlLCB3aXRob3V0IGEgdmlldywgdGhlIGdldFNjcm9sbFdpZHRoIG1ldGhvZCBhbHdheXMgcmV0dXJucyAxXG4gICAgICAvLyBhbmQgdGhlIHRlc3QgZmFpbHMgYmVjYXVzZSB0aGUgY2FwcGVkIHNjcm9sbCBsZWZ0IHZhbHVlIGFsd2F5cyBlbmQgdXBcbiAgICAgIC8vIHRvIGJlIDAsIGluZHVjaW5nIGVycm9ycyBpbiBjb21wdXRhdGlvbnMuXG4gICAgICBzcHlPbihlZGl0b3JFbGVtZW50LCAnZ2V0U2Nyb2xsV2lkdGgnKS5hbmRSZXR1cm4oMTAwMDApXG5cbiAgICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMTAwMClcbiAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsTGVmdCgyMDApXG5cbiAgICAgIGxhcmdlTGluZUNvdW50ID0gZWRpdG9yLmdldFNjcmVlbkxpbmVDb3VudCgpXG4gICAgICBlZGl0b3JTY3JvbGxSYXRpbyA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkgLyAoZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxIZWlnaHQoKSAtIGVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KCkpXG4gICAgfSlcblxuICAgIGl0KCdzY2FsZXMgdGhlIGVkaXRvciBzY3JvbGwgYmFzZWQgb24gdGhlIG1pbmltYXAgc2NhbGUgZmFjdG9yJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZFNjcm9sbFRvcCgpKS50b0VxdWFsKDEwMDAgKiBtaW5pbWFwVmVydGljYWxTY2FsZUZhY3RvcilcbiAgICAgIGV4cGVjdChtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRTY3JvbGxMZWZ0KCkpLnRvRXF1YWwoMjAwICogbWluaW1hcEhvcml6b250YWxTY2FsZUZhY3RvcilcbiAgICB9KVxuXG4gICAgaXQoJ2NvbXB1dGVzIHRoZSBvZmZzZXQgdG8gYXBwbHkgYmFzZWQgb24gdGhlIGVkaXRvciBzY3JvbGwgdG9wJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0U2Nyb2xsVG9wKCkpLnRvRXF1YWwoZWRpdG9yU2Nyb2xsUmF0aW8gKiBtaW5pbWFwLmdldE1heFNjcm9sbFRvcCgpKVxuICAgIH0pXG5cbiAgICBpdCgnY29tcHV0ZXMgdGhlIGZpcnN0IHZpc2libGUgcm93IGluIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KCkpLnRvRXF1YWwoNTgpXG4gICAgfSlcblxuICAgIGl0KCdjb21wdXRlcyB0aGUgbGFzdCB2aXNpYmxlIHJvdyBpbiB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChtaW5pbWFwLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCkpLnRvRXF1YWwoNjkpXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCdkb3duIHRvIHRoZSBib3R0b20nLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxIZWlnaHQoKSlcbiAgICAgICAgZWRpdG9yU2Nyb2xsUmF0aW8gPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpIC8gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxIZWlnaHQoKVxuICAgICAgfSlcblxuICAgICAgaXQoJ2NvbXB1dGVzIGFuIG9mZnNldCB0aGF0IHNjcm9sbHMgdGhlIG1pbmltYXAgdG8gdGhlIGJvdHRvbSBlZGdlJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcC5nZXRTY3JvbGxUb3AoKSkudG9FcXVhbChtaW5pbWFwLmdldE1heFNjcm9sbFRvcCgpKVxuICAgICAgfSlcblxuICAgICAgaXQoJ2NvbXB1dGVzIHRoZSBmaXJzdCB2aXNpYmxlIHJvdyBpbiB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KCkpLnRvRXF1YWwobGFyZ2VMaW5lQ291bnQgLSAxMClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdjb21wdXRlcyB0aGUgbGFzdCB2aXNpYmxlIHJvdyBpbiB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSkudG9FcXVhbChsYXJnZUxpbmVDb3VudClcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnZGVzdHJveWluZyB0aGUgbW9kZWwnLCAoKSA9PiB7XG4gICAgaXQoJ2VtaXRzIGEgZGlkLWRlc3Ryb3kgZXZlbnQnLCAoKSA9PiB7XG4gICAgICBsZXQgc3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2Rlc3Ryb3knKVxuICAgICAgbWluaW1hcC5vbkRpZERlc3Ryb3koc3B5KVxuXG4gICAgICBtaW5pbWFwLmRlc3Ryb3koKVxuXG4gICAgICBleHBlY3Qoc3B5KS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICB9KVxuXG4gICAgaXQoJ3JldHVybnMgdHJ1ZSB3aGVuIGFza2VkIGlmIGRlc3Ryb3llZCcsICgpID0+IHtcbiAgICAgIG1pbmltYXAuZGVzdHJveSgpXG4gICAgICBleHBlY3QobWluaW1hcC5pc0Rlc3Ryb3llZCgpKS50b0JlVHJ1dGh5KClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdkZXN0cm95aW5nIHRoZSB0ZXh0IGVkaXRvcicsICgpID0+IHtcbiAgICBpdCgnZGVzdHJveXMgdGhlIG1vZGVsJywgKCkgPT4ge1xuICAgICAgc3B5T24obWluaW1hcCwgJ2Rlc3Ryb3knKVxuXG4gICAgICBlZGl0b3IuZGVzdHJveSgpXG5cbiAgICAgIGV4cGVjdChtaW5pbWFwLmRlc3Ryb3kpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3dpdGggc2NvcGVkIHNldHRpbmdzJywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1qYXZhc2NyaXB0JylcbiAgICAgIH0pXG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBjb25zdCBvcHRzID0ge3Njb3BlU2VsZWN0b3I6ICcuc291cmNlLmpzJ31cblxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuY2hhckhlaWdodCcsIDgsIG9wdHMpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5jaGFyV2lkdGgnLCA0LCBvcHRzKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuaW50ZXJsaW5lJywgMiwgb3B0cylcblxuICAgICAgICBlZGl0b3Iuc2V0R3JhbW1hcihhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoJ3NvdXJjZS5qcycpKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ2hvbm9ycyB0aGUgc2NvcGVkIHNldHRpbmdzIGZvciB0aGUgY3VycmVudCBlZGl0b3IgbmV3IGdyYW1tYXInLCAoKSA9PiB7XG4gICAgICBleHBlY3QobWluaW1hcC5nZXRDaGFySGVpZ2h0KCkpLnRvRXF1YWwoOClcbiAgICAgIGV4cGVjdChtaW5pbWFwLmdldENoYXJXaWR0aCgpKS50b0VxdWFsKDQpXG4gICAgICBleHBlY3QobWluaW1hcC5nZXRJbnRlcmxpbmUoKSkudG9FcXVhbCgyKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gaW5kZXBlbmRlbnRNaW5pbWFwU2Nyb2xsIGlzIHRydWUnLCAoKSA9PiB7XG4gICAgbGV0IGVkaXRvclNjcm9sbFJhdGlvXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcbiAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDEwMDApXG4gICAgICBlZGl0b3JTY3JvbGxSYXRpbyA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkgLyAoZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxIZWlnaHQoKSAtIGVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KCkpXG5cbiAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5pbmRlcGVuZGVudE1pbmltYXBTY3JvbGwnLCB0cnVlKVxuICAgIH0pXG5cbiAgICBpdCgnaWdub3JlcyB0aGUgc2Nyb2xsIGNvbXB1dGVkIGZyb20gdGhlIGVkaXRvciBhbmQgcmV0dXJuIHRoZSBvbmUgb2YgdGhlIG1pbmltYXAgaW5zdGVhZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChtaW5pbWFwLmdldFNjcm9sbFRvcCgpKS50b0VxdWFsKGVkaXRvclNjcm9sbFJhdGlvICogbWluaW1hcC5nZXRNYXhTY3JvbGxUb3AoKSlcblxuICAgICAgbWluaW1hcC5zZXRTY3JvbGxUb3AoMjAwKVxuXG4gICAgICBleHBlY3QobWluaW1hcC5nZXRTY3JvbGxUb3AoKSkudG9FcXVhbCgyMDApXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCdzY3JvbGxpbmcgdGhlIGVkaXRvcicsICgpID0+IHtcbiAgICAgIGl0KCdjaGFuZ2VzIHRoZSBtaW5pbWFwIHNjcm9sbCB0b3AnLCAoKSA9PiB7XG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDIwMDApXG5cbiAgICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0U2Nyb2xsVG9wKCkpLm5vdC50b0VxdWFsKGVkaXRvclNjcm9sbFJhdGlvICogbWluaW1hcC5nZXRNYXhTY3JvbGxUb3AoKSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICAvLyAgICAjIyMjIyMjIyAgIyMjIyMjIyMgICMjIyMjIyAgICMjIyMjIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAgICMjICAgICMjICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICAgIyMgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyMjIyMgICAjIyAgICAgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgIyMgIyMgICAgICMjXG4gIC8vICAgICMjIyMjIyMjICAjIyMjIyMjIyAgIyMjIyMjICAgIyMjIyMjI1xuXG4gIGRlc2NyaWJlKCc6OmRlY29yYXRlTWFya2VyJywgKCkgPT4ge1xuICAgIGxldCBbbWFya2VyLCBkZWNvcmF0aW9uLCBjaGFuZ2VTcHldID0gW11cblxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgZWRpdG9yLnNldFRleHQobGFyZ2VTYW1wbGUpXG5cbiAgICAgIGNoYW5nZVNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWRDaGFuZ2UnKVxuICAgICAgbWluaW1hcC5vbkRpZENoYW5nZURlY29yYXRpb25SYW5nZShjaGFuZ2VTcHkpXG5cbiAgICAgIG1hcmtlciA9IG1pbmltYXAubWFya0J1ZmZlclJhbmdlKFtbMCwgNl0sIFsxLCAxMV1dKVxuICAgICAgZGVjb3JhdGlvbiA9IG1pbmltYXAuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7dHlwZTogJ2hpZ2hsaWdodCcsIGNsYXNzOiAnZHVtbXknfSlcbiAgICB9KVxuXG4gICAgaXQoJ2NyZWF0ZXMgYSBkZWNvcmF0aW9uIGZvciB0aGUgZ2l2ZW4gbWFya2VyJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KG1pbmltYXAuZGVjb3JhdGlvbnNCeU1hcmtlcklkW21hcmtlci5pZF0pLnRvQmVEZWZpbmVkKClcbiAgICB9KVxuXG4gICAgaXQoJ2NyZWF0ZXMgYSBjaGFuZ2UgY29ycmVzcG9uZGluZyB0byB0aGUgbWFya2VyIHJhbmdlJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGNoYW5nZVNweSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICBleHBlY3QoY2hhbmdlU3B5LmNhbGxzWzBdLmFyZ3NbMF0uc3RhcnQpLnRvRXF1YWwoMClcbiAgICAgIGV4cGVjdChjaGFuZ2VTcHkuY2FsbHNbMF0uYXJnc1swXS5lbmQpLnRvRXF1YWwoMSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gdGhlIG1hcmtlciByYW5nZSBjaGFuZ2VzJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIGxldCBtYXJrZXJDaGFuZ2VTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnbWFya2VyLWRpZC1jaGFuZ2UnKVxuICAgICAgICBtYXJrZXIub25EaWRDaGFuZ2UobWFya2VyQ2hhbmdlU3B5KVxuICAgICAgICBtYXJrZXIuc2V0QnVmZmVyUmFuZ2UoW1swLCA2XSwgWzMsIDExXV0pXG5cbiAgICAgICAgd2FpdHNGb3IoKCkgPT4geyByZXR1cm4gbWFya2VyQ2hhbmdlU3B5LmNhbGxzLmxlbmd0aCA+IDAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdjcmVhdGVzIGEgY2hhbmdlIG9ubHkgZm9yIHRoZSBkaWYgYmV0d2VlbiB0aGUgdHdvIHJhbmdlcycsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KGNoYW5nZVNweSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIGV4cGVjdChjaGFuZ2VTcHkuY2FsbHNbMV0uYXJnc1swXS5zdGFydCkudG9FcXVhbCgxKVxuICAgICAgICBleHBlY3QoY2hhbmdlU3B5LmNhbGxzWzFdLmFyZ3NbMF0uZW5kKS50b0VxdWFsKDMpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnZGVzdHJveWluZyB0aGUgbWFya2VyJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIG1hcmtlci5kZXN0cm95KClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW1vdmVzIHRoZSBkZWNvcmF0aW9uIGZyb20gdGhlIHJlbmRlciB2aWV3JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcC5kZWNvcmF0aW9uc0J5TWFya2VySWRbbWFya2VyLmlkXSkudG9CZVVuZGVmaW5lZCgpXG4gICAgICB9KVxuXG4gICAgICBpdCgnY3JlYXRlcyBhIGNoYW5nZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBtYXJrZXIgcmFuZ2UnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChjaGFuZ2VTcHkuY2FsbHNbMV0uYXJnc1swXS5zdGFydCkudG9FcXVhbCgwKVxuICAgICAgICBleHBlY3QoY2hhbmdlU3B5LmNhbGxzWzFdLmFyZ3NbMF0uZW5kKS50b0VxdWFsKDEpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnZGVzdHJveWluZyB0aGUgZGVjb3JhdGlvbicsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBkZWNvcmF0aW9uLmRlc3Ryb3koKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlbW92ZXMgdGhlIGRlY29yYXRpb24gZnJvbSB0aGUgcmVuZGVyIHZpZXcnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwLmRlY29yYXRpb25zQnlNYXJrZXJJZFttYXJrZXIuaWRdKS50b0JlVW5kZWZpbmVkKClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdjcmVhdGVzIGEgY2hhbmdlIGNvcnJlc3BvbmRpbmcgdG8gdGhlIG1hcmtlciByYW5nZScsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KGNoYW5nZVNweS5jYWxsc1sxXS5hcmdzWzBdLnN0YXJ0KS50b0VxdWFsKDApXG4gICAgICAgIGV4cGVjdChjaGFuZ2VTcHkuY2FsbHNbMV0uYXJnc1swXS5lbmQpLnRvRXF1YWwoMSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCdkZXN0cm95aW5nIGFsbCB0aGUgZGVjb3JhdGlvbnMgZm9yIHRoZSBtYXJrZXInLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgbWluaW1hcC5yZW1vdmVBbGxEZWNvcmF0aW9uc0Zvck1hcmtlcihtYXJrZXIpXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVtb3ZlcyB0aGUgZGVjb3JhdGlvbiBmcm9tIHRoZSByZW5kZXIgdmlldycsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXAuZGVjb3JhdGlvbnNCeU1hcmtlcklkW21hcmtlci5pZF0pLnRvQmVVbmRlZmluZWQoKVxuICAgICAgfSlcblxuICAgICAgaXQoJ2NyZWF0ZXMgYSBjaGFuZ2UgY29ycmVzcG9uZGluZyB0byB0aGUgbWFya2VyIHJhbmdlJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoY2hhbmdlU3B5LmNhbGxzWzFdLmFyZ3NbMF0uc3RhcnQpLnRvRXF1YWwoMClcbiAgICAgICAgZXhwZWN0KGNoYW5nZVNweS5jYWxsc1sxXS5hcmdzWzBdLmVuZCkudG9FcXVhbCgxKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ2Rlc3Ryb3lpbmcgdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgbWluaW1hcC5kZXN0cm95KClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW1vdmVzIGFsbCB0aGUgcHJldmlvdXNseSBhZGRlZCBkZWNvcmF0aW9ucycsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXAuZGVjb3JhdGlvbnNCeUlkKS50b0VxdWFsKHt9KVxuICAgICAgICBleHBlY3QobWluaW1hcC5kZWNvcmF0aW9uc0J5TWFya2VySWQpLnRvRXF1YWwoe30pXG4gICAgICB9KVxuXG4gICAgICBpdCgncHJldmVudHMgdGhlIGNyZWF0aW9uIG9mIG5ldyBkZWNvcmF0aW9ucycsICgpID0+IHtcbiAgICAgICAgbWFya2VyID0gZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzAsIDZdLCBbMCwgMTFdXSlcbiAgICAgICAgZGVjb3JhdGlvbiA9IG1pbmltYXAuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7dHlwZTogJ2hpZ2hsaWdodCcsIGNsYXNzOiAnZHVtbXknfSlcblxuICAgICAgICBleHBlY3QoZGVjb3JhdGlvbikudG9CZVVuZGVmaW5lZCgpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJzo6ZGVjb3JhdGlvbnNCeVR5cGVUaGVuUm93cycsICgpID0+IHtcbiAgICBsZXQgW2RlY29yYXRpb25zXSA9IFtdXG5cbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuXG4gICAgICBmdW5jdGlvbiBjcmVhdGVEZWNvcmF0aW9uICh0eXBlLCByYW5nZSkge1xuICAgICAgICBsZXQgbWFya2VyID0gbWluaW1hcC5tYXJrQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7dHlwZX0pXG4gICAgICB9XG5cbiAgICAgIGNyZWF0ZURlY29yYXRpb24oJ2hpZ2hsaWdodCcsIFtbNiwgMF0sIFsxMSwgMF1dKVxuICAgICAgY3JlYXRlRGVjb3JhdGlvbignaGlnaGxpZ2h0JywgW1s3LCAwXSwgWzgsIDBdXSlcbiAgICAgIGNyZWF0ZURlY29yYXRpb24oJ2hpZ2hsaWdodC1vdmVyJywgW1sxLCAwXSwgWzIsIDBdXSlcbiAgICAgIGNyZWF0ZURlY29yYXRpb24oJ2xpbmUnLCBbWzMsIDBdLCBbNCwgMF1dKVxuICAgICAgY3JlYXRlRGVjb3JhdGlvbignbGluZScsIFtbMTIsIDBdLCBbMTIsIDBdXSlcbiAgICAgIGNyZWF0ZURlY29yYXRpb24oJ2hpZ2hsaWdodC11bmRlcicsIFtbMCwgMF0sIFsxMCwgMV1dKVxuXG4gICAgICBkZWNvcmF0aW9ucyA9IG1pbmltYXAuZGVjb3JhdGlvbnNCeVR5cGVUaGVuUm93cygwLCAxMilcbiAgICB9KVxuXG4gICAgaXQoJ3JldHVybnMgYW4gb2JqZWN0IHdob3NlIGtleXMgYXJlIHRoZSBkZWNvcmF0aW9ucyB0eXBlcycsICgpID0+IHtcbiAgICAgIGV4cGVjdChPYmplY3Qua2V5cyhkZWNvcmF0aW9ucykuc29ydCgpKS50b0VxdWFsKFsnaGlnaGxpZ2h0LW92ZXInLCAnaGlnaGxpZ2h0LXVuZGVyJywgJ2xpbmUnXSlcbiAgICB9KVxuXG4gICAgaXQoJ3N0b3JlcyBkZWNvcmF0aW9ucyBieSByb3dzIHdpdGhpbiBlYWNoIHR5cGUgb2JqZWN0cycsICgpID0+IHtcbiAgICAgIGV4cGVjdChPYmplY3Qua2V5cyhkZWNvcmF0aW9uc1snaGlnaGxpZ2h0LW92ZXInXSkuc29ydCgpKVxuICAgICAgLnRvRXF1YWwoJzEgMiA2IDcgOCA5IDEwIDExJy5zcGxpdCgnICcpLnNvcnQoKSlcblxuICAgICAgZXhwZWN0KE9iamVjdC5rZXlzKGRlY29yYXRpb25zWydsaW5lJ10pLnNvcnQoKSlcbiAgICAgIC50b0VxdWFsKCczIDQgMTInLnNwbGl0KCcgJykuc29ydCgpKVxuXG4gICAgICBleHBlY3QoT2JqZWN0LmtleXMoZGVjb3JhdGlvbnNbJ2hpZ2hsaWdodC11bmRlciddKS5zb3J0KCkpXG4gICAgICAudG9FcXVhbCgnMCAxIDIgMyA0IDUgNiA3IDggOSAxMCcuc3BsaXQoJyAnKS5zb3J0KCkpXG4gICAgfSlcblxuICAgIGl0KCdzdG9yZXMgdGhlIGRlY29yYXRpb25zIHNwYW5uaW5nIGEgcm93IGluIHRoZSBjb3JyZXNwb25kaW5nIHJvdyBhcnJheScsICgpID0+IHtcbiAgICAgIGV4cGVjdChkZWNvcmF0aW9uc1snaGlnaGxpZ2h0LW92ZXInXVsnNyddLmxlbmd0aCkudG9FcXVhbCgyKVxuXG4gICAgICBleHBlY3QoZGVjb3JhdGlvbnNbJ2xpbmUnXVsnMyddLmxlbmd0aCkudG9FcXVhbCgxKVxuXG4gICAgICBleHBlY3QoZGVjb3JhdGlvbnNbJ2hpZ2hsaWdodC11bmRlciddWyc1J10ubGVuZ3RoKS50b0VxdWFsKDEpXG4gICAgfSlcbiAgfSlcbn0pXG5cbi8vICAgICAjIyMjIyMgICMjIyMjIyMjICAgICMjIyAgICAjIyAgICAjIyAjIyMjIyMjI1xuLy8gICAgIyMgICAgIyMgICAgIyMgICAgICAjIyAjIyAgICMjIyAgICMjICMjICAgICAjI1xuLy8gICAgIyMgICAgICAgICAgIyMgICAgICMjICAgIyMgICMjIyMgICMjICMjICAgICAjI1xuLy8gICAgICMjIyMjIyAgICAgIyMgICAgIyMgICAgICMjICMjICMjICMjICMjICAgICAjI1xuLy8gICAgICAgICAgIyMgICAgIyMgICAgIyMjIyMjIyMjICMjICAjIyMjICMjICAgICAjI1xuLy8gICAgIyMgICAgIyMgICAgIyMgICAgIyMgICAgICMjICMjICAgIyMjICMjICAgICAjI1xuLy8gICAgICMjIyMjIyAgICAgIyMgICAgIyMgICAgICMjICMjICAgICMjICMjIyMjIyMjXG4vL1xuLy8gICAgICAgIyMjICAgICMjICAgICAgICAjIyMjIyMjICAjIyAgICAjIyAjIyMjIyMjI1xuLy8gICAgICAjIyAjIyAgICMjICAgICAgICMjICAgICAjIyAjIyMgICAjIyAjI1xuLy8gICAgICMjICAgIyMgICMjICAgICAgICMjICAgICAjIyAjIyMjICAjIyAjI1xuLy8gICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAjIyAjIyAjIyMjIyNcbi8vICAgICMjIyMjIyMjIyAjIyAgICAgICAjIyAgICAgIyMgIyMgICMjIyMgIyNcbi8vICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyMgIyMgICAjIyMgIyNcbi8vICAgICMjICAgICAjIyAjIyMjIyMjIyAgIyMjIyMjIyAgIyMgICAgIyMgIyMjIyMjIyNcblxuZGVzY3JpYmUoJ1N0YW5kIGFsb25lIG1pbmltYXAnLCAoKSA9PiB7XG4gIGxldCBbZWRpdG9yLCBlZGl0b3JFbGVtZW50LCBtaW5pbWFwLCBsYXJnZVNhbXBsZSwgc21hbGxTYW1wbGVdID0gW11cblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuY2hhckhlaWdodCcsIDQpXG4gICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmNoYXJXaWR0aCcsIDIpXG4gICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmludGVybGluZScsIDEpXG5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3Ioe30pXG4gICAgZWRpdG9yLmF1dG9IZWlnaHQgPSBmYWxzZVxuICAgIGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgIGphc21pbmUuYXR0YWNoVG9ET00oZWRpdG9yRWxlbWVudClcbiAgICBlZGl0b3JFbGVtZW50LnNldEhlaWdodCg1MClcbiAgICBlZGl0b3JFbGVtZW50LnNldFdpZHRoKDIwMClcbiAgICBlZGl0b3Iuc2V0TGluZUhlaWdodEluUGl4ZWxzKDEwKVxuXG4gICAgbGV0IGRpciA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpWzBdXG5cbiAgICBtaW5pbWFwID0gbmV3IE1pbmltYXAoe1xuICAgICAgdGV4dEVkaXRvcjogZWRpdG9yLFxuICAgICAgc3RhbmRBbG9uZTogdHJ1ZVxuICAgIH0pXG5cbiAgICBsYXJnZVNhbXBsZSA9IGZzLnJlYWRGaWxlU3luYyhkaXIucmVzb2x2ZSgnbGFyZ2UtZmlsZS5jb2ZmZWUnKSkudG9TdHJpbmcoKVxuICAgIHNtYWxsU2FtcGxlID0gZnMucmVhZEZpbGVTeW5jKGRpci5yZXNvbHZlKCdzYW1wbGUuY29mZmVlJykpLnRvU3RyaW5nKClcbiAgfSlcblxuICBpdCgnaGFzIGFuIGFzc29jaWF0ZWQgZWRpdG9yJywgKCkgPT4ge1xuICAgIGV4cGVjdChtaW5pbWFwLmdldFRleHRFZGl0b3IoKSkudG9FcXVhbChlZGl0b3IpXG4gIH0pXG5cbiAgaXQoJ21lYXN1cmVzIHRoZSBtaW5pbWFwIHNpemUgYmFzZWQgb24gdGhlIGN1cnJlbnQgZWRpdG9yIGNvbnRlbnQnLCAoKSA9PiB7XG4gICAgZWRpdG9yLnNldFRleHQoc21hbGxTYW1wbGUpXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0SGVpZ2h0KCkpLnRvRXF1YWwoZWRpdG9yLmdldFNjcmVlbkxpbmVDb3VudCgpICogNSlcblxuICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuICAgIGV4cGVjdChtaW5pbWFwLmdldEhlaWdodCgpKS50b0VxdWFsKGVkaXRvci5nZXRTY3JlZW5MaW5lQ291bnQoKSAqIDUpXG4gIH0pXG5cbiAgaXQoJ21lYXN1cmVzIHRoZSBzY2FsaW5nIGZhY3RvciBiZXR3ZWVuIHRoZSBlZGl0b3IgYW5kIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgIGV4cGVjdChtaW5pbWFwLmdldFZlcnRpY2FsU2NhbGVGYWN0b3IoKSkudG9FcXVhbCgwLjUpXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0SG9yaXpvbnRhbFNjYWxlRmFjdG9yKCkpLnRvRXF1YWwoMiAvIGVkaXRvci5nZXREZWZhdWx0Q2hhcldpZHRoKCkpXG4gIH0pXG5cbiAgaXQoJ21lYXN1cmVzIHRoZSBlZGl0b3IgdmlzaWJsZSBhcmVhIHNpemUgYXQgbWluaW1hcCBzY2FsZScsICgpID0+IHtcbiAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcbiAgICBleHBlY3QobWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkSGVpZ2h0KCkpLnRvRXF1YWwoMjUpXG4gIH0pXG5cbiAgaXQoJ2hhcyBhIHZpc2libGUgaGVpZ2h0IGJhc2VkIG9uIHRoZSBwYXNzZWQtaW4gb3B0aW9ucycsICgpID0+IHtcbiAgICBleHBlY3QobWluaW1hcC5nZXRWaXNpYmxlSGVpZ2h0KCkpLnRvRXF1YWwoNSlcblxuICAgIGVkaXRvci5zZXRUZXh0KHNtYWxsU2FtcGxlKVxuICAgIGV4cGVjdChtaW5pbWFwLmdldFZpc2libGVIZWlnaHQoKSkudG9FcXVhbCgyMClcblxuICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuICAgIGV4cGVjdChtaW5pbWFwLmdldFZpc2libGVIZWlnaHQoKSkudG9FcXVhbChlZGl0b3IuZ2V0U2NyZWVuTGluZUNvdW50KCkgKiA1KVxuXG4gICAgbWluaW1hcC5oZWlnaHQgPSAxMDBcbiAgICBleHBlY3QobWluaW1hcC5nZXRWaXNpYmxlSGVpZ2h0KCkpLnRvRXF1YWwoMTAwKVxuICB9KVxuXG4gIGl0KCdoYXMgYSB2aXNpYmxlIHdpZHRoIGJhc2VkIG9uIHRoZSBwYXNzZWQtaW4gb3B0aW9ucycsICgpID0+IHtcbiAgICBleHBlY3QobWluaW1hcC5nZXRWaXNpYmxlV2lkdGgoKSkudG9FcXVhbCgwKVxuXG4gICAgZWRpdG9yLnNldFRleHQoc21hbGxTYW1wbGUpXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0VmlzaWJsZVdpZHRoKCkpLnRvRXF1YWwoMzYpXG5cbiAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcbiAgICBleHBlY3QobWluaW1hcC5nZXRWaXNpYmxlV2lkdGgoKSkudG9FcXVhbChlZGl0b3IuZ2V0TWF4U2NyZWVuTGluZUxlbmd0aCgpICogMilcblxuICAgIG1pbmltYXAud2lkdGggPSA1MFxuICAgIGV4cGVjdChtaW5pbWFwLmdldFZpc2libGVXaWR0aCgpKS50b0VxdWFsKDUwKVxuICB9KVxuXG4gIGl0KCdtZWFzdXJlcyB0aGUgYXZhaWxhYmxlIG1pbmltYXAgc2Nyb2xsJywgKCkgPT4ge1xuICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuICAgIGxldCBsYXJnZUxpbmVDb3VudCA9IGVkaXRvci5nZXRTY3JlZW5MaW5lQ291bnQoKVxuXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0TWF4U2Nyb2xsVG9wKCkpLnRvRXF1YWwoMClcbiAgICBleHBlY3QobWluaW1hcC5jYW5TY3JvbGwoKSkudG9CZUZhbHN5KClcblxuICAgIG1pbmltYXAuaGVpZ2h0ID0gMTAwXG5cbiAgICBleHBlY3QobWluaW1hcC5nZXRNYXhTY3JvbGxUb3AoKSkudG9FcXVhbChsYXJnZUxpbmVDb3VudCAqIDUgLSAxMDApXG4gICAgZXhwZWN0KG1pbmltYXAuY2FuU2Nyb2xsKCkpLnRvQmVUcnV0aHkoKVxuICB9KVxuXG4gIGl0KCdjb21wdXRlcyB0aGUgZmlyc3QgdmlzaWJsZSByb3cgaW4gdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KCkpLnRvRXF1YWwoMClcbiAgfSlcblxuICBpdCgnY29tcHV0ZXMgdGhlIGxhc3QgdmlzaWJsZSByb3cgaW4gdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgZWRpdG9yLnNldFRleHQobGFyZ2VTYW1wbGUpXG5cbiAgICBleHBlY3QobWluaW1hcC5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpKS50b0VxdWFsKGVkaXRvci5nZXRTY3JlZW5MaW5lQ291bnQoKSlcblxuICAgIG1pbmltYXAuaGVpZ2h0ID0gMTAwXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSkudG9FcXVhbCgyMClcbiAgfSlcblxuICBpdCgnZG9lcyBub3QgcmVsYXkgc2Nyb2xsIHRvcCBldmVudHMgZnJvbSB0aGUgZWRpdG9yJywgKCkgPT4ge1xuICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuXG4gICAgbGV0IHNjcm9sbFNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWRTY3JvbGwnKVxuICAgIG1pbmltYXAub25EaWRDaGFuZ2VTY3JvbGxUb3Aoc2Nyb2xsU3B5KVxuXG4gICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMTAwKVxuXG4gICAgZXhwZWN0KHNjcm9sbFNweSkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICB9KVxuXG4gIGl0KCdkb2VzIG5vdCByZWxheSBzY3JvbGwgbGVmdCBldmVudHMgZnJvbSB0aGUgZWRpdG9yJywgKCkgPT4ge1xuICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuXG4gICAgbGV0IHNjcm9sbFNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWRTY3JvbGwnKVxuICAgIG1pbmltYXAub25EaWRDaGFuZ2VTY3JvbGxMZWZ0KHNjcm9sbFNweSlcblxuICAgIC8vIFNlZW1zIGxpa2UgdGV4dCB3aXRob3V0IGEgdmlldyBhcmVuJ3QgYWJsZSB0byBzY3JvbGwgaG9yaXpvbnRhbGx5XG4gICAgLy8gZXZlbiB3aGVuIGl0cyB3aWR0aCB3YXMgc2V0LlxuICAgIHNweU9uKGVkaXRvckVsZW1lbnQsICdnZXRTY3JvbGxXaWR0aCcpLmFuZFJldHVybigxMDAwMClcblxuICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsTGVmdCgxMDApXG5cbiAgICBleHBlY3Qoc2Nyb2xsU3B5KS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gIH0pXG5cbiAgaXQoJ2hhcyBhIHNjcm9sbCB0b3AgdGhhdCBpcyBub3QgYm91bmQgdG8gdGhlIHRleHQgZWRpdG9yJywgKCkgPT4ge1xuICAgIGxldCBzY3JvbGxTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkU2Nyb2xsJylcbiAgICBtaW5pbWFwLm9uRGlkQ2hhbmdlU2Nyb2xsVG9wKHNjcm9sbFNweSlcbiAgICBtaW5pbWFwLnNldFNjcmVlbkhlaWdodEFuZFdpZHRoKDEwMCwgMTAwKVxuXG4gICAgZWRpdG9yLnNldFRleHQobGFyZ2VTYW1wbGUpXG4gICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMTAwMClcblxuICAgIGV4cGVjdChtaW5pbWFwLmdldFNjcm9sbFRvcCgpKS50b0VxdWFsKDApXG4gICAgZXhwZWN0KHNjcm9sbFNweSkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgbWluaW1hcC5zZXRTY3JvbGxUb3AoMTApXG5cbiAgICBleHBlY3QobWluaW1hcC5nZXRTY3JvbGxUb3AoKSkudG9FcXVhbCgxMClcbiAgICBleHBlY3Qoc2Nyb2xsU3B5KS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgfSlcblxuICBpdCgnaGFzIHJlbmRlcmluZyBwcm9wZXJ0aWVzIHRoYXQgY2FuIG92ZXJyaWRlcyB0aGUgY29uZmlnIHZhbHVlcycsICgpID0+IHtcbiAgICBtaW5pbWFwLnNldENoYXJXaWR0aCg4LjUpXG4gICAgbWluaW1hcC5zZXRDaGFySGVpZ2h0KDEwLjIpXG4gICAgbWluaW1hcC5zZXRJbnRlcmxpbmUoMTAuNilcblxuICAgIGV4cGVjdChtaW5pbWFwLmdldENoYXJXaWR0aCgpKS50b0VxdWFsKDgpXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0Q2hhckhlaWdodCgpKS50b0VxdWFsKDEwKVxuICAgIGV4cGVjdChtaW5pbWFwLmdldEludGVybGluZSgpKS50b0VxdWFsKDEwKVxuICAgIGV4cGVjdChtaW5pbWFwLmdldExpbmVIZWlnaHQoKSkudG9FcXVhbCgyMClcbiAgfSlcblxuICBpdCgnZW1pdHMgYSBjb25maWcgY2hhbmdlIGV2ZW50IHdoZW4gYSB2YWx1ZSBpcyBjaGFuZ2VkJywgKCkgPT4ge1xuICAgIGxldCBjaGFuZ2VTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkLWNoYW5nZScpXG4gICAgbWluaW1hcC5vbkRpZENoYW5nZUNvbmZpZyhjaGFuZ2VTcHkpXG5cbiAgICBtaW5pbWFwLnNldENoYXJXaWR0aCg4LjUpXG4gICAgbWluaW1hcC5zZXRDaGFySGVpZ2h0KDEwLjIpXG4gICAgbWluaW1hcC5zZXRJbnRlcmxpbmUoMTAuNilcblxuICAgIGV4cGVjdChjaGFuZ2VTcHkuY2FsbENvdW50KS50b0VxdWFsKDMpXG4gIH0pXG5cbiAgaXQoJ3JldHVybnMgdGhlIHJvdW5kaW5nIG51bWJlciBvZiBkZXZpY2VQaXhlbFJhdGlvJywgKCkgPT4ge1xuICAgIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID0gMS4yNVxuXG4gICAgbWluaW1hcC5zZXREZXZpY2VQaXhlbFJhdGlvUm91bmRpbmcodHJ1ZSlcblxuICAgIGV4cGVjdChtaW5pbWFwLmdldERldmljZVBpeGVsUmF0aW9Sb3VuZGluZygpKS50b0VxdWFsKHRydWUpXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0RGV2aWNlUGl4ZWxSYXRpbygpKS50b0VxdWFsKDEpXG4gIH0pXG5cbiAgaXQoJ3ByZXZlbnRzIHRoZSByb3VuZGluZyBudW1iZXIgb2YgZGV2aWNlUGl4ZWxSYXRpbycsICgpID0+IHtcbiAgICB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA9IDEuMjVcblxuICAgIG1pbmltYXAuc2V0RGV2aWNlUGl4ZWxSYXRpb1JvdW5kaW5nKGZhbHNlKVxuXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0RGV2aWNlUGl4ZWxSYXRpb1JvdW5kaW5nKCkpLnRvRXF1YWwoZmFsc2UpXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0RGV2aWNlUGl4ZWxSYXRpbygpKS50b0VxdWFsKDEuMjUpXG4gIH0pXG59KVxuIl19
//# sourceURL=/home/takaaki/.atom/packages/minimap/spec/minimap-spec.js
