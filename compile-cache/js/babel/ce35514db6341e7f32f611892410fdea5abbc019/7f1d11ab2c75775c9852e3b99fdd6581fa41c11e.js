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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9zcGVjL21pbmltYXAtc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztRQUVPLHFCQUFxQjs7c0JBRWIsU0FBUzs7OzswQkFDSixnQkFBZ0I7Ozs7QUFMcEMsV0FBVyxDQUFBOztBQU9YLFFBQVEsQ0FBQyxTQUFTLEVBQUUsWUFBTTthQUNtRyxFQUFFO01BQXhILE1BQU07TUFBRSxhQUFhO01BQUUsT0FBTztNQUFFLFdBQVc7TUFBRSxXQUFXO01BQUUsMEJBQTBCO01BQUUsNEJBQTRCOztBQUV2SCxZQUFVLENBQUMsWUFBTTtBQUNmLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ3hDLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ3ZDLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFBOztBQUV2QyxVQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUE7O0FBRTNDLGlCQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDMUMsV0FBTyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUNsQyxpQkFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUMzQixpQkFBYSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFFM0IsOEJBQTBCLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFBO0FBQy9ELGdDQUE0QixHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQTs7QUFFL0QsUUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxj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QUFDLENBQUE7R0FDakQsQ0FBQyxDQUFBOztBQUVGLElBQUUsQ0FBQyxrREFBa0QsRUFBRSxZQUFNO0FBQzNELFVBQU0sQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUE7O0FBRTlCLFdBQU8sQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLENBQUMsQ0FBQTs7QUFFMUMsVUFBTSxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQzVELFVBQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtHQUNwRCxDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL3NwZWMvbWluaW1hcC1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0ICcuL2hlbHBlcnMvd29ya3NwYWNlJ1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMtcGx1cydcbmltcG9ydCBNaW5pbWFwIGZyb20gJy4uL2xpYi9taW5pbWFwJ1xuXG5kZXNjcmliZSgnTWluaW1hcCcsICgpID0+IHtcbiAgbGV0IFtlZGl0b3IsIGVkaXRvckVsZW1lbnQsIG1pbmltYXAsIGxhcmdlU2FtcGxlLCBzbWFsbFNhbXBsZSwgbWluaW1hcFZlcnRpY2FsU2NhbGVGYWN0b3IsIG1pbmltYXBIb3Jpem9udGFsU2NhbGVGYWN0b3JdID0gW11cblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuY2hhckhlaWdodCcsIDQpXG4gICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmNoYXJXaWR0aCcsIDIpXG4gICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmludGVybGluZScsIDEpXG5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3Ioe30pXG5cbiAgICBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGVkaXRvckVsZW1lbnQpXG4gICAgZWRpdG9yRWxlbWVudC5zZXRIZWlnaHQoNTApXG4gICAgZWRpdG9yRWxlbWVudC5zZXRXaWR0aCgyMDApXG5cbiAgICBtaW5pbWFwVmVydGljYWxTY2FsZUZhY3RvciA9IDUgLyBlZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKClcbiAgICBtaW5pbWFwSG9yaXpvbnRhbFNjYWxlRmFjdG9yID0gMiAvIGVkaXRvci5nZXREZWZhdWx0Q2hhcldpZHRoKClcblxuICAgIGxldCBkaXIgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVswXVxuXG4gICAgbWluaW1hcCA9IG5ldyBNaW5pbWFwKHt0ZXh0RWRpdG9yOiBlZGl0b3J9KVxuICAgIGxhcmdlU2FtcGxlID0gZnMucmVhZEZpbGVTeW5jKGRpci5yZXNvbHZlKCdsYXJnZS1maWxlLmNvZmZlZScpKS50b1N0cmluZygpXG4gICAgc21hbGxTYW1wbGUgPSBmcy5yZWFkRmlsZVN5bmMoZGlyLnJlc29sdmUoJ3NhbXBsZS5jb2ZmZWUnKSkudG9TdHJpbmcoKVxuICB9KVxuXG4gIGl0KCdoYXMgYW4gYXNzb2NpYXRlZCBlZGl0b3InLCAoKSA9PiB7XG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0VGV4dEVkaXRvcigpKS50b0VxdWFsKGVkaXRvcilcbiAgfSlcblxuICBpdCgncmV0dXJucyBmYWxzZSB3aGVuIGFza2VkIGlmIGRlc3Ryb3llZCcsICgpID0+IHtcbiAgICBleHBlY3QobWluaW1hcC5pc0Rlc3Ryb3llZCgpKS50b0JlRmFsc3koKVxuICB9KVxuXG4gIGl0KCdyYWlzZSBhbiBleGNlcHRpb24gaWYgY3JlYXRlZCB3aXRob3V0IGEgdGV4dCBlZGl0b3InLCAoKSA9PiB7XG4gICAgZXhwZWN0KCgpID0+IHsgcmV0dXJuIG5ldyBNaW5pbWFwKCkgfSkudG9UaHJvdygpXG4gIH0pXG5cbiAgaXQoJ21lYXN1cmVzIHRoZSBtaW5pbWFwIHNpemUgYmFzZWQgb24gdGhlIGN1cnJlbnQgZWRpdG9yIGNvbnRlbnQnLCAoKSA9PiB7XG4gICAgZWRpdG9yLnNldFRleHQoc21hbGxTYW1wbGUpXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0SGVpZ2h0KCkpLnRvRXF1YWwoZWRpdG9yLmdldFNjcmVlbkxpbmVDb3VudCgpICogNSlcblxuICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuICAgIGV4cGVjdChtaW5pbWFwLmdldEhlaWdodCgpKS50b0VxdWFsKGVkaXRvci5nZXRTY3JlZW5MaW5lQ291bnQoKSAqIDUpXG4gIH0pXG5cbiAgaXQoJ21lYXN1cmVzIHRoZSBzY2FsaW5nIGZhY3RvciBiZXR3ZWVuIHRoZSBlZGl0b3IgYW5kIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgIGV4cGVjdChtaW5pbWFwLmdldFZlcnRpY2FsU2NhbGVGYWN0b3IoKSkudG9FcXVhbChtaW5pbWFwVmVydGljYWxTY2FsZUZhY3RvcilcbiAgICBleHBlY3QobWluaW1hcC5nZXRIb3Jpem9udGFsU2NhbGVGYWN0b3IoKSkudG9FcXVhbChtaW5pbWFwSG9yaXpvbnRhbFNjYWxlRmFjdG9yKVxuICB9KVxuXG4gIGl0KCdtZWFzdXJlcyB0aGUgZWRpdG9yIHZpc2libGUgYXJlYSBzaXplIGF0IG1pbmltYXAgc2NhbGUnLCAoKSA9PiB7XG4gICAgZWRpdG9yLnNldFRleHQobGFyZ2VTYW1wbGUpXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpKS50b0VxdWFsKDUwICogbWluaW1hcFZlcnRpY2FsU2NhbGVGYWN0b3IpXG4gIH0pXG5cbiAgaXQoJ21lYXN1cmVzIHRoZSBhdmFpbGFibGUgbWluaW1hcCBzY3JvbGwnLCAoKSA9PiB7XG4gICAgZWRpdG9yLnNldFRleHQobGFyZ2VTYW1wbGUpXG4gICAgbGV0IGxhcmdlTGluZUNvdW50ID0gZWRpdG9yLmdldFNjcmVlbkxpbmVDb3VudCgpXG5cbiAgICBleHBlY3QobWluaW1hcC5nZXRNYXhTY3JvbGxUb3AoKSkudG9FcXVhbChsYXJnZUxpbmVDb3VudCAqIDUgLSA1MClcbiAgICBleHBlY3QobWluaW1hcC5jYW5TY3JvbGwoKSkudG9CZVRydXRoeSgpXG4gIH0pXG5cbiAgaXQoJ2NvbXB1dGVzIHRoZSBmaXJzdCB2aXNpYmxlIHJvdyBpbiB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICBleHBlY3QobWluaW1hcC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSkudG9FcXVhbCgwKVxuICB9KVxuXG4gIGl0KCdjb21wdXRlcyB0aGUgbGFzdCB2aXNpYmxlIHJvdyBpbiB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICBleHBlY3QobWluaW1hcC5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpKS50b0VxdWFsKDEwKVxuICB9KVxuXG4gIGl0KCdyZWxheXMgY2hhbmdlIGV2ZW50cyBmcm9tIHRoZSB0ZXh0IGVkaXRvcicsICgpID0+IHtcbiAgICBsZXQgY2hhbmdlU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZENoYW5nZScpXG4gICAgbWluaW1hcC5vbkRpZENoYW5nZShjaGFuZ2VTcHkpXG5cbiAgICBlZGl0b3Iuc2V0VGV4dCgnZm9vJylcblxuICAgIGV4cGVjdChjaGFuZ2VTcHkpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICB9KVxuXG4gIGl0KCdyZWxheXMgc2Nyb2xsIHRvcCBldmVudHMgZnJvbSB0aGUgZWRpdG9yJywgKCkgPT4ge1xuICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuXG4gICAgbGV0IHNjcm9sbFNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWRTY3JvbGwnKVxuICAgIG1pbmltYXAub25EaWRDaGFuZ2VTY3JvbGxUb3Aoc2Nyb2xsU3B5KVxuXG4gICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMTAwKVxuXG4gICAgZXhwZWN0KHNjcm9sbFNweSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gIH0pXG5cbiAgaXQoJ3JlbGF5cyBzY3JvbGwgbGVmdCBldmVudHMgZnJvbSB0aGUgZWRpdG9yJywgKCkgPT4ge1xuICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuXG4gICAgbGV0IHNjcm9sbFNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWRTY3JvbGwnKVxuICAgIG1pbmltYXAub25EaWRDaGFuZ2VTY3JvbGxMZWZ0KHNjcm9sbFNweSlcblxuICAgIC8vIFNlZW1zIGxpa2UgdGV4dCB3aXRob3V0IGEgdmlldyBhcmVuJ3QgYWJsZSB0byBzY3JvbGwgaG9yaXpvbnRhbGx5XG4gICAgLy8gZXZlbiB3aGVuIGl0cyB3aWR0aCB3YXMgc2V0LlxuICAgIHNweU9uKGVkaXRvckVsZW1lbnQsICdnZXRTY3JvbGxXaWR0aCcpLmFuZFJldHVybigxMDAwMClcblxuICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsTGVmdCgxMDApXG5cbiAgICBleHBlY3Qoc2Nyb2xsU3B5KS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiBzY3JvbHMgcGFzdCBlbmQgaXMgZW5hYmxlZCcsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3Iuc2Nyb2xsUGFzdEVuZCcsIHRydWUpXG4gICAgfSlcblxuICAgIGl0KCdhZGp1c3QgdGhlIHNjcm9sbGluZyByYXRpbycsICgpID0+IHtcbiAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsSGVpZ2h0KCkpXG5cbiAgICAgIGxldCBtYXhTY3JvbGxUb3AgPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbEhlaWdodCgpIC0gZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSAtIChlZGl0b3JFbGVtZW50LmdldEhlaWdodCgpIC0gMyAqIGVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKSlcblxuICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjcm9sbFJhdGlvKCkpLnRvRXF1YWwoZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKSAvIG1heFNjcm9sbFRvcClcbiAgICB9KVxuXG4gICAgaXQoJ2xvY2sgdGhlIG1pbmltYXAgc2Nyb2xsIHRvcCB0byAxJywgKCkgPT4ge1xuICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxIZWlnaHQoKSlcbiAgICAgIGV4cGVjdChtaW5pbWFwLmdldFNjcm9sbFRvcCgpKS50b0VxdWFsKG1pbmltYXAuZ2V0TWF4U2Nyb2xsVG9wKCkpXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCdnZXRUZXh0RWRpdG9yU2Nyb2xsUmF0aW8oKSwgd2hlbiBnZXRTY3JvbGxUb3AoKSBhbmQgbWF4U2Nyb2xsVG9wIGJvdGggZXF1YWwgMCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBlZGl0b3Iuc2V0VGV4dChzbWFsbFNhbXBsZSlcbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRIZWlnaHQoNDApXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNjcm9sbFBhc3RFbmQnLCB0cnVlKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JldHVybnMgMCcsICgpID0+IHtcbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMClcbiAgICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjcm9sbFJhdGlvKCkpLnRvRXF1YWwoMClcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiBzb2Z0IHdyYXAgaXMgZW5hYmxlZCcsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNvZnRXcmFwJywgdHJ1ZSlcbiAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNvZnRXcmFwQXRQcmVmZXJyZWRMaW5lTGVuZ3RoJywgdHJ1ZSlcbiAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnByZWZlcnJlZExpbmVMZW5ndGgnLCAyKVxuICAgIH0pXG5cbiAgICBpdCgnbWVhc3VyZXMgdGhlIG1pbmltYXAgdXNpbmcgc2NyZWVuIGxpbmVzJywgKCkgPT4ge1xuICAgICAgZWRpdG9yLnNldFRleHQoc21hbGxTYW1wbGUpXG4gICAgICBleHBlY3QobWluaW1hcC5nZXRIZWlnaHQoKSkudG9FcXVhbChlZGl0b3IuZ2V0U2NyZWVuTGluZUNvdW50KCkgKiA1KVxuXG4gICAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcbiAgICAgIGV4cGVjdChtaW5pbWFwLmdldEhlaWdodCgpKS50b0VxdWFsKGVkaXRvci5nZXRTY3JlZW5MaW5lQ291bnQoKSAqIDUpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiB0aGVyZSBpcyBubyBzY3JvbGxpbmcgbmVlZGVkIHRvIGRpc3BsYXkgdGhlIHdob2xlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgaXQoJ3JldHVybnMgMCB3aGVuIGNvbXB1dGluZyB0aGUgbWluaW1hcCBzY3JvbGwnLCAoKSA9PiB7XG4gICAgICBleHBlY3QobWluaW1hcC5nZXRTY3JvbGxUb3AoKSkudG9FcXVhbCgwKVxuICAgIH0pXG5cbiAgICBpdCgncmV0dXJucyAwIHdoZW4gbWVhc3VyaW5nIHRoZSBhdmFpbGFibGUgbWluaW1hcCBzY3JvbGwnLCAoKSA9PiB7XG4gICAgICBlZGl0b3Iuc2V0VGV4dChzbWFsbFNhbXBsZSlcblxuICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0TWF4U2Nyb2xsVG9wKCkpLnRvRXF1YWwoMClcbiAgICAgIGV4cGVjdChtaW5pbWFwLmNhblNjcm9sbCgpKS50b0JlRmFsc3koKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3doZW4gdGhlIGVkaXRvciBpcyBzY3JvbGxlZCcsICgpID0+IHtcbiAgICBsZXQgW2xhcmdlTGluZUNvdW50LCBlZGl0b3JTY3JvbGxSYXRpb10gPSBbXVxuXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAvLyBTYW1lIGhlcmUsIHdpdGhvdXQgYSB2aWV3LCB0aGUgZ2V0U2Nyb2xsV2lkdGggbWV0aG9kIGFsd2F5cyByZXR1cm5zIDFcbiAgICAgIC8vIGFuZCB0aGUgdGVzdCBmYWlscyBiZWNhdXNlIHRoZSBjYXBwZWQgc2Nyb2xsIGxlZnQgdmFsdWUgYWx3YXlzIGVuZCB1cFxuICAgICAgLy8gdG8gYmUgMCwgaW5kdWNpbmcgZXJyb3JzIGluIGNvbXB1dGF0aW9ucy5cbiAgICAgIHNweU9uKGVkaXRvckVsZW1lbnQsICdnZXRTY3JvbGxXaWR0aCcpLmFuZFJldHVybigxMDAwMClcblxuICAgICAgZWRpdG9yLnNldFRleHQobGFyZ2VTYW1wbGUpXG4gICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgxMDAwKVxuICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxMZWZ0KDIwMClcblxuICAgICAgbGFyZ2VMaW5lQ291bnQgPSBlZGl0b3IuZ2V0U2NyZWVuTGluZUNvdW50KClcbiAgICAgIGVkaXRvclNjcm9sbFJhdGlvID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKSAvIChlZGl0b3JFbGVtZW50LmdldFNjcm9sbEhlaWdodCgpIC0gZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSlcbiAgICB9KVxuXG4gICAgaXQoJ3NjYWxlcyB0aGUgZWRpdG9yIHNjcm9sbCBiYXNlZCBvbiB0aGUgbWluaW1hcCBzY2FsZSBmYWN0b3InLCAoKSA9PiB7XG4gICAgICBleHBlY3QobWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkU2Nyb2xsVG9wKCkpLnRvRXF1YWwoMTAwMCAqIG1pbmltYXBWZXJ0aWNhbFNjYWxlRmFjdG9yKVxuICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZFNjcm9sbExlZnQoKSkudG9FcXVhbCgyMDAgKiBtaW5pbWFwSG9yaXpvbnRhbFNjYWxlRmFjdG9yKVxuICAgIH0pXG5cbiAgICBpdCgnY29tcHV0ZXMgdGhlIG9mZnNldCB0byBhcHBseSBiYXNlZCBvbiB0aGUgZWRpdG9yIHNjcm9sbCB0b3AnLCAoKSA9PiB7XG4gICAgICBleHBlY3QobWluaW1hcC5nZXRTY3JvbGxUb3AoKSkudG9FcXVhbChlZGl0b3JTY3JvbGxSYXRpbyAqIG1pbmltYXAuZ2V0TWF4U2Nyb2xsVG9wKCkpXG4gICAgfSlcblxuICAgIGl0KCdjb21wdXRlcyB0aGUgZmlyc3QgdmlzaWJsZSByb3cgaW4gdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICBleHBlY3QobWluaW1hcC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSkudG9FcXVhbCg1OClcbiAgICB9KVxuXG4gICAgaXQoJ2NvbXB1dGVzIHRoZSBsYXN0IHZpc2libGUgcm93IGluIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSkudG9FcXVhbCg2OSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ2Rvd24gdG8gdGhlIGJvdHRvbScsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcChlZGl0b3JFbGVtZW50LmdldFNjcm9sbEhlaWdodCgpKVxuICAgICAgICBlZGl0b3JTY3JvbGxSYXRpbyA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkgLyBlZGl0b3JFbGVtZW50LmdldFNjcm9sbEhlaWdodCgpXG4gICAgICB9KVxuXG4gICAgICBpdCgnY29tcHV0ZXMgYW4gb2Zmc2V0IHRoYXQgc2Nyb2xscyB0aGUgbWluaW1hcCB0byB0aGUgYm90dG9tIGVkZ2UnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwLmdldFNjcm9sbFRvcCgpKS50b0VxdWFsKG1pbmltYXAuZ2V0TWF4U2Nyb2xsVG9wKCkpXG4gICAgICB9KVxuXG4gICAgICBpdCgnY29tcHV0ZXMgdGhlIGZpcnN0IHZpc2libGUgcm93IGluIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSkudG9FcXVhbChsYXJnZUxpbmVDb3VudCAtIDEwKVxuICAgICAgfSlcblxuICAgICAgaXQoJ2NvbXB1dGVzIHRoZSBsYXN0IHZpc2libGUgcm93IGluIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcC5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpKS50b0VxdWFsKGxhcmdlTGluZUNvdW50KVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdkZXN0cm95aW5nIHRoZSBtb2RlbCcsICgpID0+IHtcbiAgICBpdCgnZW1pdHMgYSBkaWQtZGVzdHJveSBldmVudCcsICgpID0+IHtcbiAgICAgIGxldCBzcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGVzdHJveScpXG4gICAgICBtaW5pbWFwLm9uRGlkRGVzdHJveShzcHkpXG5cbiAgICAgIG1pbmltYXAuZGVzdHJveSgpXG5cbiAgICAgIGV4cGVjdChzcHkpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgIH0pXG5cbiAgICBpdCgncmV0dXJucyB0cnVlIHdoZW4gYXNrZWQgaWYgZGVzdHJveWVkJywgKCkgPT4ge1xuICAgICAgbWluaW1hcC5kZXN0cm95KClcbiAgICAgIGV4cGVjdChtaW5pbWFwLmlzRGVzdHJveWVkKCkpLnRvQmVUcnV0aHkoKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ2Rlc3Ryb3lpbmcgdGhlIHRleHQgZWRpdG9yJywgKCkgPT4ge1xuICAgIGl0KCdkZXN0cm95cyB0aGUgbW9kZWwnLCAoKSA9PiB7XG4gICAgICBzcHlPbihtaW5pbWFwLCAnZGVzdHJveScpXG5cbiAgICAgIGVkaXRvci5kZXN0cm95KClcblxuICAgICAgZXhwZWN0KG1pbmltYXAuZGVzdHJveSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd2l0aCBzY29wZWQgc2V0dGluZ3MnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWphdmFzY3JpcHQnKVxuICAgICAgfSlcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wdHMgPSB7c2NvcGVTZWxlY3RvcjogJy5zb3VyY2UuanMnfVxuXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5jaGFySGVpZ2h0JywgOCwgb3B0cylcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmNoYXJXaWR0aCcsIDQsIG9wdHMpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5pbnRlcmxpbmUnLCAyLCBvcHRzKVxuXG4gICAgICAgIGVkaXRvci5zZXRHcmFtbWFyKGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZSgnc291cmNlLmpzJykpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnaG9ub3JzIHRoZSBzY29wZWQgc2V0dGluZ3MgZm9yIHRoZSBjdXJyZW50IGVkaXRvciBuZXcgZ3JhbW1hcicsICgpID0+IHtcbiAgICAgIGV4cGVjdChtaW5pbWFwLmdldENoYXJIZWlnaHQoKSkudG9FcXVhbCg4KVxuICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0Q2hhcldpZHRoKCkpLnRvRXF1YWwoNClcbiAgICAgIGV4cGVjdChtaW5pbWFwLmdldEludGVybGluZSgpKS50b0VxdWFsKDIpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnd2hlbiBpbmRlcGVuZGVudE1pbmltYXBTY3JvbGwgaXMgdHJ1ZScsICgpID0+IHtcbiAgICBsZXQgZWRpdG9yU2Nyb2xsUmF0aW9cbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMTAwMClcbiAgICAgIGVkaXRvclNjcm9sbFJhdGlvID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKSAvIChlZGl0b3JFbGVtZW50LmdldFNjcm9sbEhlaWdodCgpIC0gZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSlcblxuICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmluZGVwZW5kZW50TWluaW1hcFNjcm9sbCcsIHRydWUpXG4gICAgfSlcblxuICAgIGl0KCdpZ25vcmVzIHRoZSBzY3JvbGwgY29tcHV0ZWQgZnJvbSB0aGUgZWRpdG9yIGFuZCByZXR1cm4gdGhlIG9uZSBvZiB0aGUgbWluaW1hcCBpbnN0ZWFkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0U2Nyb2xsVG9wKCkpLnRvRXF1YWwoZWRpdG9yU2Nyb2xsUmF0aW8gKiBtaW5pbWFwLmdldE1heFNjcm9sbFRvcCgpKVxuXG4gICAgICBtaW5pbWFwLnNldFNjcm9sbFRvcCgyMDApXG5cbiAgICAgIGV4cGVjdChtaW5pbWFwLmdldFNjcm9sbFRvcCgpKS50b0VxdWFsKDIwMClcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3Njcm9sbGluZyB0aGUgZWRpdG9yJywgKCkgPT4ge1xuICAgICAgaXQoJ2NoYW5nZXMgdGhlIG1pbmltYXAgc2Nyb2xsIHRvcCcsICgpID0+IHtcbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMjAwMClcblxuICAgICAgICBleHBlY3QobWluaW1hcC5nZXRTY3JvbGxUb3AoKSkubm90LnRvRXF1YWwoZWRpdG9yU2Nyb2xsUmF0aW8gKiBtaW5pbWFwLmdldE1heFNjcm9sbFRvcCgpKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIC8vICAgICMjIyMjIyMjICAjIyMjIyMjIyAgIyMjIyMjICAgIyMjIyMjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgIyMgIyMgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjIyMjIyAgICMjICAgICAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICAgIyMgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAjIyAjIyAgICAgIyNcbiAgLy8gICAgIyMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMgICAjIyMjIyMjXG5cbiAgZGVzY3JpYmUoJzo6ZGVjb3JhdGVNYXJrZXInLCAoKSA9PiB7XG4gICAgbGV0IFttYXJrZXIsIGRlY29yYXRpb24sIGNoYW5nZVNweV0gPSBbXVxuXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcblxuICAgICAgY2hhbmdlU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZENoYW5nZScpXG4gICAgICBtaW5pbWFwLm9uRGlkQ2hhbmdlRGVjb3JhdGlvblJhbmdlKGNoYW5nZVNweSlcblxuICAgICAgbWFya2VyID0gbWluaW1hcC5tYXJrQnVmZmVyUmFuZ2UoW1swLCA2XSwgWzEsIDExXV0pXG4gICAgICBkZWNvcmF0aW9uID0gbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHt0eXBlOiAnaGlnaGxpZ2h0JywgY2xhc3M6ICdkdW1teSd9KVxuICAgIH0pXG5cbiAgICBpdCgnY3JlYXRlcyBhIGRlY29yYXRpb24gZm9yIHRoZSBnaXZlbiBtYXJrZXInLCAoKSA9PiB7XG4gICAgICBleHBlY3QobWluaW1hcC5kZWNvcmF0aW9uc0J5TWFya2VySWRbbWFya2VyLmlkXSkudG9CZURlZmluZWQoKVxuICAgIH0pXG5cbiAgICBpdCgnY3JlYXRlcyBhIGNoYW5nZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBtYXJrZXIgcmFuZ2UnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoY2hhbmdlU3B5KS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIGV4cGVjdChjaGFuZ2VTcHkuY2FsbHNbMF0uYXJnc1swXS5zdGFydCkudG9FcXVhbCgwKVxuICAgICAgZXhwZWN0KGNoYW5nZVNweS5jYWxsc1swXS5hcmdzWzBdLmVuZCkudG9FcXVhbCgxKVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiB0aGUgbWFya2VyIHJhbmdlIGNoYW5nZXMnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgbGV0IG1hcmtlckNoYW5nZVNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdtYXJrZXItZGlkLWNoYW5nZScpXG4gICAgICAgIG1hcmtlci5vbkRpZENoYW5nZShtYXJrZXJDaGFuZ2VTcHkpXG4gICAgICAgIG1hcmtlci5zZXRCdWZmZXJSYW5nZShbWzAsIDZdLCBbMywgMTFdXSlcblxuICAgICAgICB3YWl0c0ZvcigoKSA9PiB7IHJldHVybiBtYXJrZXJDaGFuZ2VTcHkuY2FsbHMubGVuZ3RoID4gMCB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ2NyZWF0ZXMgYSBjaGFuZ2Ugb25seSBmb3IgdGhlIGRpZiBiZXR3ZWVuIHRoZSB0d28gcmFuZ2VzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoY2hhbmdlU3B5KS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgZXhwZWN0KGNoYW5nZVNweS5jYWxsc1sxXS5hcmdzWzBdLnN0YXJ0KS50b0VxdWFsKDEpXG4gICAgICAgIGV4cGVjdChjaGFuZ2VTcHkuY2FsbHNbMV0uYXJnc1swXS5lbmQpLnRvRXF1YWwoMylcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCdkZXN0cm95aW5nIHRoZSBtYXJrZXInLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgbWFya2VyLmRlc3Ryb3koKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlbW92ZXMgdGhlIGRlY29yYXRpb24gZnJvbSB0aGUgcmVuZGVyIHZpZXcnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwLmRlY29yYXRpb25zQnlNYXJrZXJJZFttYXJrZXIuaWRdKS50b0JlVW5kZWZpbmVkKClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdjcmVhdGVzIGEgY2hhbmdlIGNvcnJlc3BvbmRpbmcgdG8gdGhlIG1hcmtlciByYW5nZScsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KGNoYW5nZVNweS5jYWxsc1sxXS5hcmdzWzBdLnN0YXJ0KS50b0VxdWFsKDApXG4gICAgICAgIGV4cGVjdChjaGFuZ2VTcHkuY2FsbHNbMV0uYXJnc1swXS5lbmQpLnRvRXF1YWwoMSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCdkZXN0cm95aW5nIHRoZSBkZWNvcmF0aW9uJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIGRlY29yYXRpb24uZGVzdHJveSgpXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVtb3ZlcyB0aGUgZGVjb3JhdGlvbiBmcm9tIHRoZSByZW5kZXIgdmlldycsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXAuZGVjb3JhdGlvbnNCeU1hcmtlcklkW21hcmtlci5pZF0pLnRvQmVVbmRlZmluZWQoKVxuICAgICAgfSlcblxuICAgICAgaXQoJ2NyZWF0ZXMgYSBjaGFuZ2UgY29ycmVzcG9uZGluZyB0byB0aGUgbWFya2VyIHJhbmdlJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QoY2hhbmdlU3B5LmNhbGxzWzFdLmFyZ3NbMF0uc3RhcnQpLnRvRXF1YWwoMClcbiAgICAgICAgZXhwZWN0KGNoYW5nZVNweS5jYWxsc1sxXS5hcmdzWzBdLmVuZCkudG9FcXVhbCgxKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ2Rlc3Ryb3lpbmcgYWxsIHRoZSBkZWNvcmF0aW9ucyBmb3IgdGhlIG1hcmtlcicsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBtaW5pbWFwLnJlbW92ZUFsbERlY29yYXRpb25zRm9yTWFya2VyKG1hcmtlcilcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW1vdmVzIHRoZSBkZWNvcmF0aW9uIGZyb20gdGhlIHJlbmRlciB2aWV3JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcC5kZWNvcmF0aW9uc0J5TWFya2VySWRbbWFya2VyLmlkXSkudG9CZVVuZGVmaW5lZCgpXG4gICAgICB9KVxuXG4gICAgICBpdCgnY3JlYXRlcyBhIGNoYW5nZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBtYXJrZXIgcmFuZ2UnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChjaGFuZ2VTcHkuY2FsbHNbMV0uYXJnc1swXS5zdGFydCkudG9FcXVhbCgwKVxuICAgICAgICBleHBlY3QoY2hhbmdlU3B5LmNhbGxzWzFdLmFyZ3NbMF0uZW5kKS50b0VxdWFsKDEpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnZGVzdHJveWluZyB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBtaW5pbWFwLmRlc3Ryb3koKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlbW92ZXMgYWxsIHRoZSBwcmV2aW91c2x5IGFkZGVkIGRlY29yYXRpb25zJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcC5kZWNvcmF0aW9uc0J5SWQpLnRvRXF1YWwoe30pXG4gICAgICAgIGV4cGVjdChtaW5pbWFwLmRlY29yYXRpb25zQnlNYXJrZXJJZCkudG9FcXVhbCh7fSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdwcmV2ZW50cyB0aGUgY3JlYXRpb24gb2YgbmV3IGRlY29yYXRpb25zJywgKCkgPT4ge1xuICAgICAgICBtYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMCwgNl0sIFswLCAxMV1dKVxuICAgICAgICBkZWNvcmF0aW9uID0gbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHt0eXBlOiAnaGlnaGxpZ2h0JywgY2xhc3M6ICdkdW1teSd9KVxuXG4gICAgICAgIGV4cGVjdChkZWNvcmF0aW9uKS50b0JlVW5kZWZpbmVkKClcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnOjpkZWNvcmF0aW9uc0J5VHlwZVRoZW5Sb3dzJywgKCkgPT4ge1xuICAgIGxldCBbZGVjb3JhdGlvbnNdID0gW11cblxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgZWRpdG9yLnNldFRleHQobGFyZ2VTYW1wbGUpXG5cbiAgICAgIGZ1bmN0aW9uIGNyZWF0ZURlY29yYXRpb24gKHR5cGUsIHJhbmdlKSB7XG4gICAgICAgIGxldCBtYXJrZXIgPSBtaW5pbWFwLm1hcmtCdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHt0eXBlfSlcbiAgICAgIH1cblxuICAgICAgY3JlYXRlRGVjb3JhdGlvbignaGlnaGxpZ2h0JywgW1s2LCAwXSwgWzExLCAwXV0pXG4gICAgICBjcmVhdGVEZWNvcmF0aW9uKCdoaWdobGlnaHQnLCBbWzcsIDBdLCBbOCwgMF1dKVxuICAgICAgY3JlYXRlRGVjb3JhdGlvbignaGlnaGxpZ2h0LW92ZXInLCBbWzEsIDBdLCBbMiwgMF1dKVxuICAgICAgY3JlYXRlRGVjb3JhdGlvbignbGluZScsIFtbMywgMF0sIFs0LCAwXV0pXG4gICAgICBjcmVhdGVEZWNvcmF0aW9uKCdsaW5lJywgW1sxMiwgMF0sIFsxMiwgMF1dKVxuICAgICAgY3JlYXRlRGVjb3JhdGlvbignaGlnaGxpZ2h0LXVuZGVyJywgW1swLCAwXSwgWzEwLCAxXV0pXG5cbiAgICAgIGRlY29yYXRpb25zID0gbWluaW1hcC5kZWNvcmF0aW9uc0J5VHlwZVRoZW5Sb3dzKDAsIDEyKVxuICAgIH0pXG5cbiAgICBpdCgncmV0dXJucyBhbiBvYmplY3Qgd2hvc2Uga2V5cyBhcmUgdGhlIGRlY29yYXRpb25zIHR5cGVzJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KE9iamVjdC5rZXlzKGRlY29yYXRpb25zKS5zb3J0KCkpLnRvRXF1YWwoWydoaWdobGlnaHQtb3ZlcicsICdoaWdobGlnaHQtdW5kZXInLCAnbGluZSddKVxuICAgIH0pXG5cbiAgICBpdCgnc3RvcmVzIGRlY29yYXRpb25zIGJ5IHJvd3Mgd2l0aGluIGVhY2ggdHlwZSBvYmplY3RzJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KE9iamVjdC5rZXlzKGRlY29yYXRpb25zWydoaWdobGlnaHQtb3ZlciddKS5zb3J0KCkpXG4gICAgICAudG9FcXVhbCgnMSAyIDYgNyA4IDkgMTAgMTEnLnNwbGl0KCcgJykuc29ydCgpKVxuXG4gICAgICBleHBlY3QoT2JqZWN0LmtleXMoZGVjb3JhdGlvbnNbJ2xpbmUnXSkuc29ydCgpKVxuICAgICAgLnRvRXF1YWwoJzMgNCAxMicuc3BsaXQoJyAnKS5zb3J0KCkpXG5cbiAgICAgIGV4cGVjdChPYmplY3Qua2V5cyhkZWNvcmF0aW9uc1snaGlnaGxpZ2h0LXVuZGVyJ10pLnNvcnQoKSlcbiAgICAgIC50b0VxdWFsKCcwIDEgMiAzIDQgNSA2IDcgOCA5IDEwJy5zcGxpdCgnICcpLnNvcnQoKSlcbiAgICB9KVxuXG4gICAgaXQoJ3N0b3JlcyB0aGUgZGVjb3JhdGlvbnMgc3Bhbm5pbmcgYSByb3cgaW4gdGhlIGNvcnJlc3BvbmRpbmcgcm93IGFycmF5JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGRlY29yYXRpb25zWydoaWdobGlnaHQtb3ZlciddWyc3J10ubGVuZ3RoKS50b0VxdWFsKDIpXG5cbiAgICAgIGV4cGVjdChkZWNvcmF0aW9uc1snbGluZSddWyczJ10ubGVuZ3RoKS50b0VxdWFsKDEpXG5cbiAgICAgIGV4cGVjdChkZWNvcmF0aW9uc1snaGlnaGxpZ2h0LXVuZGVyJ11bJzUnXS5sZW5ndGgpLnRvRXF1YWwoMSlcbiAgICB9KVxuICB9KVxufSlcblxuLy8gICAgICMjIyMjIyAgIyMjIyMjIyMgICAgIyMjICAgICMjICAgICMjICMjIyMjIyMjXG4vLyAgICAjIyAgICAjIyAgICAjIyAgICAgICMjICMjICAgIyMjICAgIyMgIyMgICAgICMjXG4vLyAgICAjIyAgICAgICAgICAjIyAgICAgIyMgICAjIyAgIyMjIyAgIyMgIyMgICAgICMjXG4vLyAgICAgIyMjIyMjICAgICAjIyAgICAjIyAgICAgIyMgIyMgIyMgIyMgIyMgICAgICMjXG4vLyAgICAgICAgICAjIyAgICAjIyAgICAjIyMjIyMjIyMgIyMgICMjIyMgIyMgICAgICMjXG4vLyAgICAjIyAgICAjIyAgICAjIyAgICAjIyAgICAgIyMgIyMgICAjIyMgIyMgICAgICMjXG4vLyAgICAgIyMjIyMjICAgICAjIyAgICAjIyAgICAgIyMgIyMgICAgIyMgIyMjIyMjIyNcbi8vXG4vLyAgICAgICAjIyMgICAgIyMgICAgICAgICMjIyMjIyMgICMjICAgICMjICMjIyMjIyMjXG4vLyAgICAgICMjICMjICAgIyMgICAgICAgIyMgICAgICMjICMjIyAgICMjICMjXG4vLyAgICAgIyMgICAjIyAgIyMgICAgICAgIyMgICAgICMjICMjIyMgICMjICMjXG4vLyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjICMjICMjICMjICMjIyMjI1xuLy8gICAgIyMjIyMjIyMjICMjICAgICAgICMjICAgICAjIyAjIyAgIyMjIyAjI1xuLy8gICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAgICMjIyAjI1xuLy8gICAgIyMgICAgICMjICMjIyMjIyMjICAjIyMjIyMjICAjIyAgICAjIyAjIyMjIyMjI1xuXG5kZXNjcmliZSgnU3RhbmQgYWxvbmUgbWluaW1hcCcsICgpID0+IHtcbiAgbGV0IFtlZGl0b3IsIGVkaXRvckVsZW1lbnQsIG1pbmltYXAsIGxhcmdlU2FtcGxlLCBzbWFsbFNhbXBsZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5jaGFySGVpZ2h0JywgNClcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuY2hhcldpZHRoJywgMilcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuaW50ZXJsaW5lJywgMSlcblxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcih7fSlcbiAgICBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGVkaXRvckVsZW1lbnQpXG4gICAgZWRpdG9yRWxlbWVudC5zZXRIZWlnaHQoNTApXG4gICAgZWRpdG9yRWxlbWVudC5zZXRXaWR0aCgyMDApXG4gICAgZWRpdG9yLnNldExpbmVIZWlnaHRJblBpeGVscygxMClcblxuICAgIGxldCBkaXIgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVswXVxuXG4gICAgbWluaW1hcCA9IG5ldyBNaW5pbWFwKHtcbiAgICAgIHRleHRFZGl0b3I6IGVkaXRvcixcbiAgICAgIHN0YW5kQWxvbmU6IHRydWVcbiAgICB9KVxuXG4gICAgbGFyZ2VTYW1wbGUgPSBmcy5yZWFkRmlsZVN5bmMoZGlyLnJlc29sdmUoJ2xhcmdlLWZpbGUuY29mZmVlJykpLnRvU3RyaW5nKClcbiAgICBzbWFsbFNhbXBsZSA9IGZzLnJlYWRGaWxlU3luYyhkaXIucmVzb2x2ZSgnc2FtcGxlLmNvZmZlZScpKS50b1N0cmluZygpXG4gIH0pXG5cbiAgaXQoJ2hhcyBhbiBhc3NvY2lhdGVkIGVkaXRvcicsICgpID0+IHtcbiAgICBleHBlY3QobWluaW1hcC5nZXRUZXh0RWRpdG9yKCkpLnRvRXF1YWwoZWRpdG9yKVxuICB9KVxuXG4gIGl0KCdtZWFzdXJlcyB0aGUgbWluaW1hcCBzaXplIGJhc2VkIG9uIHRoZSBjdXJyZW50IGVkaXRvciBjb250ZW50JywgKCkgPT4ge1xuICAgIGVkaXRvci5zZXRUZXh0KHNtYWxsU2FtcGxlKVxuICAgIGV4cGVjdChtaW5pbWFwLmdldEhlaWdodCgpKS50b0VxdWFsKGVkaXRvci5nZXRTY3JlZW5MaW5lQ291bnQoKSAqIDUpXG5cbiAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcbiAgICBleHBlY3QobWluaW1hcC5nZXRIZWlnaHQoKSkudG9FcXVhbChlZGl0b3IuZ2V0U2NyZWVuTGluZUNvdW50KCkgKiA1KVxuICB9KVxuXG4gIGl0KCdtZWFzdXJlcyB0aGUgc2NhbGluZyBmYWN0b3IgYmV0d2VlbiB0aGUgZWRpdG9yIGFuZCB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICBleHBlY3QobWluaW1hcC5nZXRWZXJ0aWNhbFNjYWxlRmFjdG9yKCkpLnRvRXF1YWwoMC41KVxuICAgIGV4cGVjdChtaW5pbWFwLmdldEhvcml6b250YWxTY2FsZUZhY3RvcigpKS50b0VxdWFsKDIgLyBlZGl0b3IuZ2V0RGVmYXVsdENoYXJXaWR0aCgpKVxuICB9KVxuXG4gIGl0KCdtZWFzdXJlcyB0aGUgZWRpdG9yIHZpc2libGUgYXJlYSBzaXplIGF0IG1pbmltYXAgc2NhbGUnLCAoKSA9PiB7XG4gICAgZWRpdG9yLnNldFRleHQobGFyZ2VTYW1wbGUpXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpKS50b0VxdWFsKDI1KVxuICB9KVxuXG4gIGl0KCdoYXMgYSB2aXNpYmxlIGhlaWdodCBiYXNlZCBvbiB0aGUgcGFzc2VkLWluIG9wdGlvbnMnLCAoKSA9PiB7XG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0VmlzaWJsZUhlaWdodCgpKS50b0VxdWFsKDUpXG5cbiAgICBlZGl0b3Iuc2V0VGV4dChzbWFsbFNhbXBsZSlcbiAgICBleHBlY3QobWluaW1hcC5nZXRWaXNpYmxlSGVpZ2h0KCkpLnRvRXF1YWwoMjApXG5cbiAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcbiAgICBleHBlY3QobWluaW1hcC5nZXRWaXNpYmxlSGVpZ2h0KCkpLnRvRXF1YWwoZWRpdG9yLmdldFNjcmVlbkxpbmVDb3VudCgpICogNSlcblxuICAgIG1pbmltYXAuaGVpZ2h0ID0gMTAwXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0VmlzaWJsZUhlaWdodCgpKS50b0VxdWFsKDEwMClcbiAgfSlcblxuICBpdCgnaGFzIGEgdmlzaWJsZSB3aWR0aCBiYXNlZCBvbiB0aGUgcGFzc2VkLWluIG9wdGlvbnMnLCAoKSA9PiB7XG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0VmlzaWJsZVdpZHRoKCkpLnRvRXF1YWwoMClcblxuICAgIGVkaXRvci5zZXRUZXh0KHNtYWxsU2FtcGxlKVxuICAgIGV4cGVjdChtaW5pbWFwLmdldFZpc2libGVXaWR0aCgpKS50b0VxdWFsKDM2KVxuXG4gICAgZWRpdG9yLnNldFRleHQobGFyZ2VTYW1wbGUpXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0VmlzaWJsZVdpZHRoKCkpLnRvRXF1YWwoZWRpdG9yLmdldE1heFNjcmVlbkxpbmVMZW5ndGgoKSAqIDIpXG5cbiAgICBtaW5pbWFwLndpZHRoID0gNTBcbiAgICBleHBlY3QobWluaW1hcC5nZXRWaXNpYmxlV2lkdGgoKSkudG9FcXVhbCg1MClcbiAgfSlcblxuICBpdCgnbWVhc3VyZXMgdGhlIGF2YWlsYWJsZSBtaW5pbWFwIHNjcm9sbCcsICgpID0+IHtcbiAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcbiAgICBsZXQgbGFyZ2VMaW5lQ291bnQgPSBlZGl0b3IuZ2V0U2NyZWVuTGluZUNvdW50KClcblxuICAgIGV4cGVjdChtaW5pbWFwLmdldE1heFNjcm9sbFRvcCgpKS50b0VxdWFsKDApXG4gICAgZXhwZWN0KG1pbmltYXAuY2FuU2Nyb2xsKCkpLnRvQmVGYWxzeSgpXG5cbiAgICBtaW5pbWFwLmhlaWdodCA9IDEwMFxuXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0TWF4U2Nyb2xsVG9wKCkpLnRvRXF1YWwobGFyZ2VMaW5lQ291bnQgKiA1IC0gMTAwKVxuICAgIGV4cGVjdChtaW5pbWFwLmNhblNjcm9sbCgpKS50b0JlVHJ1dGh5KClcbiAgfSlcblxuICBpdCgnY29tcHV0ZXMgdGhlIGZpcnN0IHZpc2libGUgcm93IGluIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgIGV4cGVjdChtaW5pbWFwLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpKS50b0VxdWFsKDApXG4gIH0pXG5cbiAgaXQoJ2NvbXB1dGVzIHRoZSBsYXN0IHZpc2libGUgcm93IGluIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSkudG9FcXVhbChlZGl0b3IuZ2V0U2NyZWVuTGluZUNvdW50KCkpXG5cbiAgICBtaW5pbWFwLmhlaWdodCA9IDEwMFxuICAgIGV4cGVjdChtaW5pbWFwLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCkpLnRvRXF1YWwoMjApXG4gIH0pXG5cbiAgaXQoJ2RvZXMgbm90IHJlbGF5IHNjcm9sbCB0b3AgZXZlbnRzIGZyb20gdGhlIGVkaXRvcicsICgpID0+IHtcbiAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcblxuICAgIGxldCBzY3JvbGxTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkU2Nyb2xsJylcbiAgICBtaW5pbWFwLm9uRGlkQ2hhbmdlU2Nyb2xsVG9wKHNjcm9sbFNweSlcblxuICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDEwMClcblxuICAgIGV4cGVjdChzY3JvbGxTcHkpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcbiAgfSlcblxuICBpdCgnZG9lcyBub3QgcmVsYXkgc2Nyb2xsIGxlZnQgZXZlbnRzIGZyb20gdGhlIGVkaXRvcicsICgpID0+IHtcbiAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcblxuICAgIGxldCBzY3JvbGxTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkU2Nyb2xsJylcbiAgICBtaW5pbWFwLm9uRGlkQ2hhbmdlU2Nyb2xsTGVmdChzY3JvbGxTcHkpXG5cbiAgICAvLyBTZWVtcyBsaWtlIHRleHQgd2l0aG91dCBhIHZpZXcgYXJlbid0IGFibGUgdG8gc2Nyb2xsIGhvcml6b250YWxseVxuICAgIC8vIGV2ZW4gd2hlbiBpdHMgd2lkdGggd2FzIHNldC5cbiAgICBzcHlPbihlZGl0b3JFbGVtZW50LCAnZ2V0U2Nyb2xsV2lkdGgnKS5hbmRSZXR1cm4oMTAwMDApXG5cbiAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbExlZnQoMTAwKVxuXG4gICAgZXhwZWN0KHNjcm9sbFNweSkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICB9KVxuXG4gIGl0KCdoYXMgYSBzY3JvbGwgdG9wIHRoYXQgaXMgbm90IGJvdW5kIHRvIHRoZSB0ZXh0IGVkaXRvcicsICgpID0+IHtcbiAgICBsZXQgc2Nyb2xsU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZFNjcm9sbCcpXG4gICAgbWluaW1hcC5vbkRpZENoYW5nZVNjcm9sbFRvcChzY3JvbGxTcHkpXG4gICAgbWluaW1hcC5zZXRTY3JlZW5IZWlnaHRBbmRXaWR0aCgxMDAsIDEwMClcblxuICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDEwMDApXG5cbiAgICBleHBlY3QobWluaW1hcC5nZXRTY3JvbGxUb3AoKSkudG9FcXVhbCgwKVxuICAgIGV4cGVjdChzY3JvbGxTcHkpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgIG1pbmltYXAuc2V0U2Nyb2xsVG9wKDEwKVxuXG4gICAgZXhwZWN0KG1pbmltYXAuZ2V0U2Nyb2xsVG9wKCkpLnRvRXF1YWwoMTApXG4gICAgZXhwZWN0KHNjcm9sbFNweSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gIH0pXG5cbiAgaXQoJ2hhcyByZW5kZXJpbmcgcHJvcGVydGllcyB0aGF0IGNhbiBvdmVycmlkZXMgdGhlIGNvbmZpZyB2YWx1ZXMnLCAoKSA9PiB7XG4gICAgbWluaW1hcC5zZXRDaGFyV2lkdGgoOC41KVxuICAgIG1pbmltYXAuc2V0Q2hhckhlaWdodCgxMC4yKVxuICAgIG1pbmltYXAuc2V0SW50ZXJsaW5lKDEwLjYpXG5cbiAgICBleHBlY3QobWluaW1hcC5nZXRDaGFyV2lkdGgoKSkudG9FcXVhbCg4KVxuICAgIGV4cGVjdChtaW5pbWFwLmdldENoYXJIZWlnaHQoKSkudG9FcXVhbCgxMClcbiAgICBleHBlY3QobWluaW1hcC5nZXRJbnRlcmxpbmUoKSkudG9FcXVhbCgxMClcbiAgICBleHBlY3QobWluaW1hcC5nZXRMaW5lSGVpZ2h0KCkpLnRvRXF1YWwoMjApXG4gIH0pXG5cbiAgaXQoJ2VtaXRzIGEgY29uZmlnIGNoYW5nZSBldmVudCB3aGVuIGEgdmFsdWUgaXMgY2hhbmdlZCcsICgpID0+IHtcbiAgICBsZXQgY2hhbmdlU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC1jaGFuZ2UnKVxuICAgIG1pbmltYXAub25EaWRDaGFuZ2VDb25maWcoY2hhbmdlU3B5KVxuXG4gICAgbWluaW1hcC5zZXRDaGFyV2lkdGgoOC41KVxuICAgIG1pbmltYXAuc2V0Q2hhckhlaWdodCgxMC4yKVxuICAgIG1pbmltYXAuc2V0SW50ZXJsaW5lKDEwLjYpXG5cbiAgICBleHBlY3QoY2hhbmdlU3B5LmNhbGxDb3VudCkudG9FcXVhbCgzKVxuICB9KVxuXG4gIGl0KCdyZXR1cm5zIHRoZSByb3VuZGluZyBudW1iZXIgb2YgZGV2aWNlUGl4ZWxSYXRpbycsICgpID0+IHtcbiAgICB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA9IDEuMjVcblxuICAgIG1pbmltYXAuc2V0RGV2aWNlUGl4ZWxSYXRpb1JvdW5kaW5nKHRydWUpXG5cbiAgICBleHBlY3QobWluaW1hcC5nZXREZXZpY2VQaXhlbFJhdGlvUm91bmRpbmcoKSkudG9FcXVhbCh0cnVlKVxuICAgIGV4cGVjdChtaW5pbWFwLmdldERldmljZVBpeGVsUmF0aW8oKSkudG9FcXVhbCgxKVxuICB9KVxuXG4gIGl0KCdwcmV2ZW50cyB0aGUgcm91bmRpbmcgbnVtYmVyIG9mIGRldmljZVBpeGVsUmF0aW8nLCAoKSA9PiB7XG4gICAgd2luZG93LmRldmljZVBpeGVsUmF0aW8gPSAxLjI1XG5cbiAgICBtaW5pbWFwLnNldERldmljZVBpeGVsUmF0aW9Sb3VuZGluZyhmYWxzZSlcblxuICAgIGV4cGVjdChtaW5pbWFwLmdldERldmljZVBpeGVsUmF0aW9Sb3VuZGluZygpKS50b0VxdWFsKGZhbHNlKVxuICAgIGV4cGVjdChtaW5pbWFwLmdldERldmljZVBpeGVsUmF0aW8oKSkudG9FcXVhbCgxLjI1KVxuICB9KVxufSlcbiJdfQ==
//# sourceURL=/home/takaaki/.atom/packages/minimap/spec/minimap-spec.js
