'use babel';

/**
 * @access private
 */
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var LegacyAdapter = (function () {
  function LegacyAdapter(textEditor) {
    _classCallCheck(this, LegacyAdapter);

    this.textEditor = textEditor;
  }

  _createClass(LegacyAdapter, [{
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
      return this.textEditor.onDidChangeScrollTop(callback);
    }
  }, {
    key: 'onDidChangeScrollLeft',
    value: function onDidChangeScrollLeft(callback) {
      return this.textEditor.onDidChangeScrollLeft(callback);
    }
  }, {
    key: 'getHeight',
    value: function getHeight() {
      if (this.useCache) {
        if (!this.heightCache) {
          this.heightCache = this.textEditor.getHeight();
        }
        return this.heightCache;
      }
      return this.textEditor.getHeight();
    }
  }, {
    key: 'getScrollTop',
    value: function getScrollTop() {
      if (this.useCache) {
        if (!this.scrollTopCache) {
          this.scrollTopCache = this.textEditor.getScrollTop();
        }
        return this.scrollTopCache;
      }
      return this.textEditor.getScrollTop();
    }
  }, {
    key: 'setScrollTop',
    value: function setScrollTop(scrollTop) {
      return this.textEditor.setScrollTop(scrollTop);
    }
  }, {
    key: 'getScrollLeft',
    value: function getScrollLeft() {
      if (this.useCache) {
        if (!this.scrollLeftCache) {
          this.scrollLeftCache = this.textEditor.getScrollLeft();
        }
        return this.scrollLeftCache;
      }

      return this.textEditor.getScrollLeft();
    }
  }, {
    key: 'getMaxScrollTop',
    value: function getMaxScrollTop() {
      if (this.maxScrollTopCache != null && this.useCache) {
        return this.maxScrollTopCache;
      }
      var maxScrollTop = this.textEditor.displayBuffer.getMaxScrollTop();
      var lineHeight = this.textEditor.getLineHeightInPixels();

      if (this.scrollPastEnd) {
        maxScrollTop -= this.getHeight() - 3 * lineHeight;
      }
      if (this.useCache) {
        this.maxScrollTopCache = maxScrollTop;
      }
      return maxScrollTop;
    }
  }]);

  return LegacyAdapter;
})();

exports['default'] = LegacyAdapter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvYWRhcHRlcnMvbGVnYWN5LWFkYXB0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7Ozs7O0lBS1UsYUFBYTtBQUNwQixXQURPLGFBQWEsQ0FDbkIsVUFBVSxFQUFFOzBCQUROLGFBQWE7O0FBQ0wsUUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7R0FBRTs7ZUFEdEMsYUFBYTs7V0FHcEIsdUJBQUc7QUFBRSxVQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtLQUFFOzs7V0FFNUIsc0JBQUc7QUFDWixVQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQTtBQUNyQixhQUFPLElBQUksQ0FBQyxXQUFXLENBQUE7QUFDdkIsYUFBTyxJQUFJLENBQUMsY0FBYyxDQUFBO0FBQzFCLGFBQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQTtBQUMzQixhQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQTtLQUM5Qjs7O1dBRW9CLDhCQUFDLFFBQVEsRUFBRTtBQUM5QixhQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDdEQ7OztXQUVxQiwrQkFBQyxRQUFRLEVBQUU7QUFDL0IsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQ3ZEOzs7V0FFUyxxQkFBRztBQUNYLFVBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixZQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtBQUNyQixjQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUE7U0FDL0M7QUFDRCxlQUFPLElBQUksQ0FBQyxXQUFXLENBQUE7T0FDeEI7QUFDRCxhQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUE7S0FDbkM7OztXQUVZLHdCQUFHO0FBQ2QsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLFlBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQ3hCLGNBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQTtTQUNyRDtBQUNELGVBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQTtPQUMzQjtBQUNELGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQTtLQUN0Qzs7O1dBRVksc0JBQUMsU0FBUyxFQUFFO0FBQ3ZCLGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUE7S0FDL0M7OztXQUVhLHlCQUFHO0FBQ2YsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLFlBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO0FBQ3pCLGNBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQTtTQUN2RDtBQUNELGVBQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQTtPQUM1Qjs7QUFFRCxhQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUE7S0FDdkM7OztXQUVlLDJCQUFHO0FBQ2pCLFVBQUksSUFBSSxDQUFDLGlCQUFpQixJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ25ELGVBQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFBO09BQzlCO0FBQ0QsVUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFLENBQUE7QUFDbEUsVUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFBOztBQUV4RCxVQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdEIsb0JBQVksSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQTtPQUNsRDtBQUNELFVBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUFFLFlBQUksQ0FBQyxpQkFBaUIsR0FBRyxZQUFZLENBQUE7T0FBRTtBQUM1RCxhQUFPLFlBQVksQ0FBQTtLQUNwQjs7O1NBcEVrQixhQUFhOzs7cUJBQWIsYUFBYSIsImZpbGUiOiIvaG9tZS90YWthYWtpLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvbGliL2FkYXB0ZXJzL2xlZ2FjeS1hZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuLyoqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGVnYWN5QWRhcHRlciB7XG4gIGNvbnN0cnVjdG9yICh0ZXh0RWRpdG9yKSB7IHRoaXMudGV4dEVkaXRvciA9IHRleHRFZGl0b3IgfVxuXG4gIGVuYWJsZUNhY2hlICgpIHsgdGhpcy51c2VDYWNoZSA9IHRydWUgfVxuXG4gIGNsZWFyQ2FjaGUgKCkge1xuICAgIHRoaXMudXNlQ2FjaGUgPSBmYWxzZVxuICAgIGRlbGV0ZSB0aGlzLmhlaWdodENhY2hlXG4gICAgZGVsZXRlIHRoaXMuc2Nyb2xsVG9wQ2FjaGVcbiAgICBkZWxldGUgdGhpcy5zY3JvbGxMZWZ0Q2FjaGVcbiAgICBkZWxldGUgdGhpcy5tYXhTY3JvbGxUb3BDYWNoZVxuICB9XG5cbiAgb25EaWRDaGFuZ2VTY3JvbGxUb3AgKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMudGV4dEVkaXRvci5vbkRpZENoYW5nZVNjcm9sbFRvcChjYWxsYmFjaylcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlU2Nyb2xsTGVmdCAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy50ZXh0RWRpdG9yLm9uRGlkQ2hhbmdlU2Nyb2xsTGVmdChjYWxsYmFjaylcbiAgfVxuXG4gIGdldEhlaWdodCAoKSB7XG4gICAgaWYgKHRoaXMudXNlQ2FjaGUpIHtcbiAgICAgIGlmICghdGhpcy5oZWlnaHRDYWNoZSkge1xuICAgICAgICB0aGlzLmhlaWdodENhY2hlID0gdGhpcy50ZXh0RWRpdG9yLmdldEhlaWdodCgpXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5oZWlnaHRDYWNoZVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy50ZXh0RWRpdG9yLmdldEhlaWdodCgpXG4gIH1cblxuICBnZXRTY3JvbGxUb3AgKCkge1xuICAgIGlmICh0aGlzLnVzZUNhY2hlKSB7XG4gICAgICBpZiAoIXRoaXMuc2Nyb2xsVG9wQ2FjaGUpIHtcbiAgICAgICAgdGhpcy5zY3JvbGxUb3BDYWNoZSA9IHRoaXMudGV4dEVkaXRvci5nZXRTY3JvbGxUb3AoKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuc2Nyb2xsVG9wQ2FjaGVcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudGV4dEVkaXRvci5nZXRTY3JvbGxUb3AoKVxuICB9XG5cbiAgc2V0U2Nyb2xsVG9wIChzY3JvbGxUb3ApIHtcbiAgICByZXR1cm4gdGhpcy50ZXh0RWRpdG9yLnNldFNjcm9sbFRvcChzY3JvbGxUb3ApXG4gIH1cblxuICBnZXRTY3JvbGxMZWZ0ICgpIHtcbiAgICBpZiAodGhpcy51c2VDYWNoZSkge1xuICAgICAgaWYgKCF0aGlzLnNjcm9sbExlZnRDYWNoZSkge1xuICAgICAgICB0aGlzLnNjcm9sbExlZnRDYWNoZSA9IHRoaXMudGV4dEVkaXRvci5nZXRTY3JvbGxMZWZ0KClcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnNjcm9sbExlZnRDYWNoZVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRleHRFZGl0b3IuZ2V0U2Nyb2xsTGVmdCgpXG4gIH1cblxuICBnZXRNYXhTY3JvbGxUb3AgKCkge1xuICAgIGlmICh0aGlzLm1heFNjcm9sbFRvcENhY2hlICE9IG51bGwgJiYgdGhpcy51c2VDYWNoZSkge1xuICAgICAgcmV0dXJuIHRoaXMubWF4U2Nyb2xsVG9wQ2FjaGVcbiAgICB9XG4gICAgdmFyIG1heFNjcm9sbFRvcCA9IHRoaXMudGV4dEVkaXRvci5kaXNwbGF5QnVmZmVyLmdldE1heFNjcm9sbFRvcCgpXG4gICAgdmFyIGxpbmVIZWlnaHQgPSB0aGlzLnRleHRFZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKClcblxuICAgIGlmICh0aGlzLnNjcm9sbFBhc3RFbmQpIHtcbiAgICAgIG1heFNjcm9sbFRvcCAtPSB0aGlzLmdldEhlaWdodCgpIC0gMyAqIGxpbmVIZWlnaHRcbiAgICB9XG4gICAgaWYgKHRoaXMudXNlQ2FjaGUpIHsgdGhpcy5tYXhTY3JvbGxUb3BDYWNoZSA9IG1heFNjcm9sbFRvcCB9XG4gICAgcmV0dXJuIG1heFNjcm9sbFRvcFxuICB9XG59XG4iXX0=
//# sourceURL=/home/takaaki/.atom/packages/minimap/lib/adapters/legacy-adapter.js
