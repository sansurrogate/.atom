'use babel';

/**
 * @access private
 */
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var StableAdapter = (function () {
  function StableAdapter(textEditor) {
    _classCallCheck(this, StableAdapter);

    this.textEditor = textEditor;
    this.textEditorElement = atom.views.getView(this.textEditor);
  }

  _createClass(StableAdapter, [{
    key: 'enableCache',
    value: function enableCache() {
      this.useCache = true;
    }
  }, {
    key: 'clearCache',
    value: function clearCache() {
      this.useCache = false;
      delete this.heightCache;
      delete this.scrollTopCache;
      delete this.scrollLeftCache;
      delete this.maxScrollTopCache;
    }
  }, {
    key: 'onDidChangeScrollTop',
    value: function onDidChangeScrollTop(callback) {
      return this.textEditorElement.onDidChangeScrollTop(callback);
    }
  }, {
    key: 'onDidChangeScrollLeft',
    value: function onDidChangeScrollLeft(callback) {
      return this.textEditorElement.onDidChangeScrollLeft(callback);
    }
  }, {
    key: 'getHeight',
    value: function getHeight() {
      if (this.editorDestroyed()) {
        return 0;
      }

      if (this.useCache) {
        if (!this.heightCache) {
          this.heightCache = this.textEditorElement.getHeight();
        }
        return this.heightCache;
      }
      return this.textEditorElement.getHeight();
    }
  }, {
    key: 'getScrollTop',
    value: function getScrollTop() {
      if (this.editorDestroyed()) {
        return 0;
      }

      if (this.useCache) {
        if (!this.scrollTopCache) {
          this.scrollTopCache = this.computeScrollTop();
        }
        return this.scrollTopCache;
      }
      return this.computeScrollTop();
    }
  }, {
    key: 'computeScrollTop',
    value: function computeScrollTop() {
      if (this.editorDestroyed()) {
        return 0;
      }

      var scrollTop = this.textEditorElement.getScrollTop();
      var lineHeight = this.textEditor.getLineHeightInPixels();
      var firstRow = this.textEditorElement.getFirstVisibleScreenRow();
      var lineTop = this.textEditorElement.pixelPositionForScreenPosition([firstRow, 0]).top;

      if (lineTop > scrollTop) {
        firstRow -= 1;
        lineTop = this.textEditorElement.pixelPositionForScreenPosition([firstRow, 0]).top;
      }

      var lineY = firstRow * lineHeight;
      var offset = Math.min(scrollTop - lineTop, lineHeight);
      return lineY + offset;
    }
  }, {
    key: 'setScrollTop',
    value: function setScrollTop(scrollTop) {
      if (this.editorDestroyed()) {
        return;
      }

      this.textEditorElement.setScrollTop(scrollTop);
    }
  }, {
    key: 'getScrollLeft',
    value: function getScrollLeft() {
      if (this.editorDestroyed()) {
        return 0;
      }

      if (this.useCache) {
        if (!this.scrollLeftCache) {
          this.scrollLeftCache = this.textEditorElement.getScrollLeft();
        }
        return this.scrollLeftCache;
      }
      return this.textEditorElement.getScrollLeft();
    }
  }, {
    key: 'getMaxScrollTop',
    value: function getMaxScrollTop() {
      if (this.editorDestroyed()) {
        return 0;
      }

      if (this.maxScrollTopCache != null && this.useCache) {
        return this.maxScrollTopCache;
      }

      var maxScrollTop = this.textEditorElement.getScrollHeight() - this.getHeight();
      var lineHeight = this.textEditor.getLineHeightInPixels();

      if (this.scrollPastEnd) {
        maxScrollTop -= this.getHeight() - 3 * lineHeight;
      }

      if (this.useCache) {
        this.maxScrollTopCache = maxScrollTop;
      }

      return maxScrollTop;
    }
  }, {
    key: 'editorDestroyed',
    value: function editorDestroyed() {
      return !this.textEditor || this.textEditor.isDestroyed() || !this.textEditorElement.getModel();
    }
  }]);

  return StableAdapter;
})();

exports['default'] = StableAdapter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvYWRhcHRlcnMvc3RhYmxlLWFkYXB0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7Ozs7O0lBS1UsYUFBYTtBQUNwQixXQURPLGFBQWEsQ0FDbkIsVUFBVSxFQUFFOzBCQUROLGFBQWE7O0FBRTlCLFFBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7R0FDN0Q7O2VBSmtCLGFBQWE7O1dBTXBCLHVCQUFHO0FBQUUsVUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUE7S0FBRTs7O1dBRTVCLHNCQUFHO0FBQ1osVUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUE7QUFDckIsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFBO0FBQ3ZCLGFBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQTtBQUMxQixhQUFPLElBQUksQ0FBQyxlQUFlLENBQUE7QUFDM0IsYUFBTyxJQUFJLENBQUMsaUJBQWlCLENBQUE7S0FDOUI7OztXQUVvQiw4QkFBQyxRQUFRLEVBQUU7QUFDOUIsYUFBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDN0Q7OztXQUVxQiwrQkFBQyxRQUFRLEVBQUU7QUFDL0IsYUFBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDOUQ7OztXQUVTLHFCQUFHO0FBQ1gsVUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUU7QUFBRSxlQUFPLENBQUMsQ0FBQTtPQUFFOztBQUV4QyxVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDckIsY0FB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VSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMscUJBQXFCLEVBQUUsQ0FBQTs7QUFFeEQsVUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQ3RCLG9CQUFZLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUE7T0FDbEQ7O0FBRUQsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLFlBQUksQ0FBQyxpQkFBaUIsR0FBRyxZQUFZLENBQUE7T0FDdEM7O0FBRUQsYUFBTyxZQUFZLENBQUE7S0FDcEI7OztXQUVlLDJCQUFHO0FBQ2pCLGFBQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUNoQixJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxJQUM3QixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtLQUMxQzs7O1NBN0drQixhQUFhOzs7cUJBQWIsYUFBYSIsImZpbGUiOiIvaG9tZS90YWthYWtpLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvbGliL2FkYXB0ZXJzL3N0YWJsZS1hZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuLyoqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhYmxlQWRhcHRlciB7XG4gIGNvbnN0cnVjdG9yICh0ZXh0RWRpdG9yKSB7XG4gICAgdGhpcy50ZXh0RWRpdG9yID0gdGV4dEVkaXRvclxuICAgIHRoaXMudGV4dEVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy50ZXh0RWRpdG9yKVxuICB9XG5cbiAgZW5hYmxlQ2FjaGUgKCkgeyB0aGlzLnVzZUNhY2hlID0gdHJ1ZSB9XG5cbiAgY2xlYXJDYWNoZSAoKSB7XG4gICAgdGhpcy51c2VDYWNoZSA9IGZhbHNlXG4gICAgZGVsZXRlIHRoaXMuaGVpZ2h0Q2FjaGVcbiAgICBkZWxldGUgdGhpcy5zY3JvbGxUb3BDYWNoZVxuICAgIGRlbGV0ZSB0aGlzLnNjcm9sbExlZnRDYWNoZVxuICAgIGRlbGV0ZSB0aGlzLm1heFNjcm9sbFRvcENhY2hlXG4gIH1cblxuICBvbkRpZENoYW5nZVNjcm9sbFRvcCAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy50ZXh0RWRpdG9yRWxlbWVudC5vbkRpZENoYW5nZVNjcm9sbFRvcChjYWxsYmFjaylcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlU2Nyb2xsTGVmdCAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy50ZXh0RWRpdG9yRWxlbWVudC5vbkRpZENoYW5nZVNjcm9sbExlZnQoY2FsbGJhY2spXG4gIH1cblxuICBnZXRIZWlnaHQgKCkge1xuICAgIGlmICh0aGlzLmVkaXRvckRlc3Ryb3llZCgpKSB7IHJldHVybiAwIH1cblxuICAgIGlmICh0aGlzLnVzZUNhY2hlKSB7XG4gICAgICBpZiAoIXRoaXMuaGVpZ2h0Q2FjaGUpIHtcbiAgICAgICAgdGhpcy5oZWlnaHRDYWNoZSA9IHRoaXMudGV4dEVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KClcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmhlaWdodENhY2hlXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRleHRFZGl0b3JFbGVtZW50LmdldEhlaWdodCgpXG4gIH1cblxuICBnZXRTY3JvbGxUb3AgKCkge1xuICAgIGlmICh0aGlzLmVkaXRvckRlc3Ryb3llZCgpKSB7IHJldHVybiAwIH1cblxuICAgIGlmICh0aGlzLnVzZUNhY2hlKSB7XG4gICAgICBpZiAoIXRoaXMuc2Nyb2xsVG9wQ2FjaGUpIHtcbiAgICAgICAgdGhpcy5zY3JvbGxUb3BDYWNoZSA9IHRoaXMuY29tcHV0ZVNjcm9sbFRvcCgpXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5zY3JvbGxUb3BDYWNoZVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jb21wdXRlU2Nyb2xsVG9wKClcbiAgfVxuXG4gIGNvbXB1dGVTY3JvbGxUb3AgKCkge1xuICAgIGlmICh0aGlzLmVkaXRvckRlc3Ryb3llZCgpKSB7IHJldHVybiAwIH1cblxuICAgIGNvbnN0IHNjcm9sbFRvcCA9IHRoaXMudGV4dEVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKClcbiAgICBjb25zdCBsaW5lSGVpZ2h0ID0gdGhpcy50ZXh0RWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpXG4gICAgbGV0IGZpcnN0Um93ID0gdGhpcy50ZXh0RWRpdG9yRWxlbWVudC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgIGxldCBsaW5lVG9wID0gdGhpcy50ZXh0RWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oW2ZpcnN0Um93LCAwXSkudG9wXG5cbiAgICBpZiAobGluZVRvcCA+IHNjcm9sbFRvcCkge1xuICAgICAgZmlyc3RSb3cgLT0gMVxuICAgICAgbGluZVRvcCA9IHRoaXMudGV4dEVkaXRvckVsZW1lbnQucGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKFtmaXJzdFJvdywgMF0pLnRvcFxuICAgIH1cblxuICAgIGNvbnN0IGxpbmVZID0gZmlyc3RSb3cgKiBsaW5lSGVpZ2h0XG4gICAgY29uc3Qgb2Zmc2V0ID0gTWF0aC5taW4oc2Nyb2xsVG9wIC0gbGluZVRvcCwgbGluZUhlaWdodClcbiAgICByZXR1cm4gbGluZVkgKyBvZmZzZXRcbiAgfVxuXG4gIHNldFNjcm9sbFRvcCAoc2Nyb2xsVG9wKSB7XG4gICAgaWYgKHRoaXMuZWRpdG9yRGVzdHJveWVkKCkpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMudGV4dEVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKHNjcm9sbFRvcClcbiAgfVxuXG4gIGdldFNjcm9sbExlZnQgKCkge1xuICAgIGlmICh0aGlzLmVkaXRvckRlc3Ryb3llZCgpKSB7IHJldHVybiAwIH1cblxuICAgIGlmICh0aGlzLnVzZUNhY2hlKSB7XG4gICAgICBpZiAoIXRoaXMuc2Nyb2xsTGVmdENhY2hlKSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsTGVmdENhY2hlID0gdGhpcy50ZXh0RWRpdG9yRWxlbWVudC5nZXRTY3JvbGxMZWZ0KClcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnNjcm9sbExlZnRDYWNoZVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy50ZXh0RWRpdG9yRWxlbWVudC5nZXRTY3JvbGxMZWZ0KClcbiAgfVxuXG4gIGdldE1heFNjcm9sbFRvcCAoKSB7XG4gICAgaWYgKHRoaXMuZWRpdG9yRGVzdHJveWVkKCkpIHsgcmV0dXJuIDAgfVxuXG4gICAgaWYgKHRoaXMubWF4U2Nyb2xsVG9wQ2FjaGUgIT0gbnVsbCAmJiB0aGlzLnVzZUNhY2hlKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXhTY3JvbGxUb3BDYWNoZVxuICAgIH1cblxuICAgIGxldCBtYXhTY3JvbGxUb3AgPSB0aGlzLnRleHRFZGl0b3JFbGVtZW50LmdldFNjcm9sbEhlaWdodCgpIC0gdGhpcy5nZXRIZWlnaHQoKVxuICAgIGxldCBsaW5lSGVpZ2h0ID0gdGhpcy50ZXh0RWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpXG5cbiAgICBpZiAodGhpcy5zY3JvbGxQYXN0RW5kKSB7XG4gICAgICBtYXhTY3JvbGxUb3AgLT0gdGhpcy5nZXRIZWlnaHQoKSAtIDMgKiBsaW5lSGVpZ2h0XG4gICAgfVxuXG4gICAgaWYgKHRoaXMudXNlQ2FjaGUpIHtcbiAgICAgIHRoaXMubWF4U2Nyb2xsVG9wQ2FjaGUgPSBtYXhTY3JvbGxUb3BcbiAgICB9XG5cbiAgICByZXR1cm4gbWF4U2Nyb2xsVG9wXG4gIH1cblxuICBlZGl0b3JEZXN0cm95ZWQgKCkge1xuICAgIHJldHVybiAhdGhpcy50ZXh0RWRpdG9yIHx8XG4gICAgICAgICAgIHRoaXMudGV4dEVkaXRvci5pc0Rlc3Ryb3llZCgpIHx8XG4gICAgICAgICAgICF0aGlzLnRleHRFZGl0b3JFbGVtZW50LmdldE1vZGVsKClcbiAgfVxufVxuIl19
//# sourceURL=/home/takaaki/.atom/packages/minimap/lib/adapters/stable-adapter.js
