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
      return !this.textEditor || this.textEditor.isDestroyed() || !this.textEditorElement.getModel() || !this.textEditorElement.parentNode;
    }
  }]);

  return StableAdapter;
})();

exports['default'] = StableAdapter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvYWRhcHRlcnMvc3RhYmxlLWFkYXB0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7Ozs7O0lBS1UsYUFBYTtBQUNwQixXQURPLGFBQWEsQ0FDbkIsVUFBVSxFQUFFOzBCQUROLGFBQWE7O0FBRTlCLFFBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7R0FDN0Q7O2VBSmtCLGFBQWE7O1dBTXBCLHVCQUFHO0FBQUUsVUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUE7S0FBRTs7O1dBRTVCLHNCQUFHO0FBQ1osVUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUE7QUFDckIsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFBO0FBQ3ZCLGFBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQTtBQUMxQixhQUFPLElBQUksQ0FBQyxlQUFlLENBQUE7QUFDM0IsYUFBTyxJQUFJLENBQUMsaUJBQWlCLENBQUE7S0FDOUI7OztXQUVvQiw4QkFBQyxRQUFRLEVBQUU7QUFDOUIsYUFBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDN0Q7OztXQUVxQiwrQkFBQyxRQUFRLEVBQUU7QUFDL0IsYUFBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDOUQ7OztXQUVTLHFCQUFHO0FBQ1gsVUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUU7QUFBRSxlQUFPLENBQUMsQ0FBQTtPQUFFOztBQUV4QyxVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDckIsY0FB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VSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMscUJBQXFCLEVBQUUsQ0FBQTs7QUFFeEQsVUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQ3RCLG9CQUFZLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUE7T0FDbEQ7O0FBRUQsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLFlBQUksQ0FBQyxpQkFBaUIsR0FBRyxZQUFZLENBQUE7T0FDdEM7O0FBRUQsYUFBTyxZQUFZLENBQUE7S0FDcEI7OztXQUVlLDJCQUFHO0FBQ2pCLGFBQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUNoQixJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxJQUM3QixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsSUFDbEMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFBO0tBQzFDOzs7U0E5R2tCLGFBQWE7OztxQkFBYixhQUFhIiwiZmlsZSI6Ii9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvYWRhcHRlcnMvc3RhYmxlLWFkYXB0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG4vKipcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGFibGVBZGFwdGVyIHtcbiAgY29uc3RydWN0b3IgKHRleHRFZGl0b3IpIHtcbiAgICB0aGlzLnRleHRFZGl0b3IgPSB0ZXh0RWRpdG9yXG4gICAgdGhpcy50ZXh0RWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLnRleHRFZGl0b3IpXG4gIH1cblxuICBlbmFibGVDYWNoZSAoKSB7IHRoaXMudXNlQ2FjaGUgPSB0cnVlIH1cblxuICBjbGVhckNhY2hlICgpIHtcbiAgICB0aGlzLnVzZUNhY2hlID0gZmFsc2VcbiAgICBkZWxldGUgdGhpcy5oZWlnaHRDYWNoZVxuICAgIGRlbGV0ZSB0aGlzLnNjcm9sbFRvcENhY2hlXG4gICAgZGVsZXRlIHRoaXMuc2Nyb2xsTGVmdENhY2hlXG4gICAgZGVsZXRlIHRoaXMubWF4U2Nyb2xsVG9wQ2FjaGVcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlU2Nyb2xsVG9wIChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLnRleHRFZGl0b3JFbGVtZW50Lm9uRGlkQ2hhbmdlU2Nyb2xsVG9wKGNhbGxiYWNrKVxuICB9XG5cbiAgb25EaWRDaGFuZ2VTY3JvbGxMZWZ0IChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLnRleHRFZGl0b3JFbGVtZW50Lm9uRGlkQ2hhbmdlU2Nyb2xsTGVmdChjYWxsYmFjaylcbiAgfVxuXG4gIGdldEhlaWdodCAoKSB7XG4gICAgaWYgKHRoaXMuZWRpdG9yRGVzdHJveWVkKCkpIHsgcmV0dXJuIDAgfVxuXG4gICAgaWYgKHRoaXMudXNlQ2FjaGUpIHtcbiAgICAgIGlmICghdGhpcy5oZWlnaHRDYWNoZSkge1xuICAgICAgICB0aGlzLmhlaWdodENhY2hlID0gdGhpcy50ZXh0RWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuaGVpZ2h0Q2FjaGVcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudGV4dEVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KClcbiAgfVxuXG4gIGdldFNjcm9sbFRvcCAoKSB7XG4gICAgaWYgKHRoaXMuZWRpdG9yRGVzdHJveWVkKCkpIHsgcmV0dXJuIDAgfVxuXG4gICAgaWYgKHRoaXMudXNlQ2FjaGUpIHtcbiAgICAgIGlmICghdGhpcy5zY3JvbGxUb3BDYWNoZSkge1xuICAgICAgICB0aGlzLnNjcm9sbFRvcENhY2hlID0gdGhpcy5jb21wdXRlU2Nyb2xsVG9wKClcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnNjcm9sbFRvcENhY2hlXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvbXB1dGVTY3JvbGxUb3AoKVxuICB9XG5cbiAgY29tcHV0ZVNjcm9sbFRvcCAoKSB7XG4gICAgaWYgKHRoaXMuZWRpdG9yRGVzdHJveWVkKCkpIHsgcmV0dXJuIDAgfVxuXG4gICAgY29uc3Qgc2Nyb2xsVG9wID0gdGhpcy50ZXh0RWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKVxuICAgIGNvbnN0IGxpbmVIZWlnaHQgPSB0aGlzLnRleHRFZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKClcbiAgICBsZXQgZmlyc3RSb3cgPSB0aGlzLnRleHRFZGl0b3JFbGVtZW50LmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgbGV0IGxpbmVUb3AgPSB0aGlzLnRleHRFZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihbZmlyc3RSb3csIDBdKS50b3BcblxuICAgIGlmIChsaW5lVG9wID4gc2Nyb2xsVG9wKSB7XG4gICAgICBmaXJzdFJvdyAtPSAxXG4gICAgICBsaW5lVG9wID0gdGhpcy50ZXh0RWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oW2ZpcnN0Um93LCAwXSkudG9wXG4gICAgfVxuXG4gICAgY29uc3QgbGluZVkgPSBmaXJzdFJvdyAqIGxpbmVIZWlnaHRcbiAgICBjb25zdCBvZmZzZXQgPSBNYXRoLm1pbihzY3JvbGxUb3AgLSBsaW5lVG9wLCBsaW5lSGVpZ2h0KVxuICAgIHJldHVybiBsaW5lWSArIG9mZnNldFxuICB9XG5cbiAgc2V0U2Nyb2xsVG9wIChzY3JvbGxUb3ApIHtcbiAgICBpZiAodGhpcy5lZGl0b3JEZXN0cm95ZWQoKSkgeyByZXR1cm4gfVxuXG4gICAgdGhpcy50ZXh0RWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3Aoc2Nyb2xsVG9wKVxuICB9XG5cbiAgZ2V0U2Nyb2xsTGVmdCAoKSB7XG4gICAgaWYgKHRoaXMuZWRpdG9yRGVzdHJveWVkKCkpIHsgcmV0dXJuIDAgfVxuXG4gICAgaWYgKHRoaXMudXNlQ2FjaGUpIHtcbiAgICAgIGlmICghdGhpcy5zY3JvbGxMZWZ0Q2FjaGUpIHtcbiAgICAgICAgdGhpcy5zY3JvbGxMZWZ0Q2FjaGUgPSB0aGlzLnRleHRFZGl0b3JFbGVtZW50LmdldFNjcm9sbExlZnQoKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuc2Nyb2xsTGVmdENhY2hlXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRleHRFZGl0b3JFbGVtZW50LmdldFNjcm9sbExlZnQoKVxuICB9XG5cbiAgZ2V0TWF4U2Nyb2xsVG9wICgpIHtcbiAgICBpZiAodGhpcy5lZGl0b3JEZXN0cm95ZWQoKSkgeyByZXR1cm4gMCB9XG5cbiAgICBpZiAodGhpcy5tYXhTY3JvbGxUb3BDYWNoZSAhPSBudWxsICYmIHRoaXMudXNlQ2FjaGUpIHtcbiAgICAgIHJldHVybiB0aGlzLm1heFNjcm9sbFRvcENhY2hlXG4gICAgfVxuXG4gICAgbGV0IG1heFNjcm9sbFRvcCA9IHRoaXMudGV4dEVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsSGVpZ2h0KCkgLSB0aGlzLmdldEhlaWdodCgpXG4gICAgbGV0IGxpbmVIZWlnaHQgPSB0aGlzLnRleHRFZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKClcblxuICAgIGlmICh0aGlzLnNjcm9sbFBhc3RFbmQpIHtcbiAgICAgIG1heFNjcm9sbFRvcCAtPSB0aGlzLmdldEhlaWdodCgpIC0gMyAqIGxpbmVIZWlnaHRcbiAgICB9XG5cbiAgICBpZiAodGhpcy51c2VDYWNoZSkge1xuICAgICAgdGhpcy5tYXhTY3JvbGxUb3BDYWNoZSA9IG1heFNjcm9sbFRvcFxuICAgIH1cblxuICAgIHJldHVybiBtYXhTY3JvbGxUb3BcbiAgfVxuXG4gIGVkaXRvckRlc3Ryb3llZCAoKSB7XG4gICAgcmV0dXJuICF0aGlzLnRleHRFZGl0b3IgfHxcbiAgICAgICAgICAgdGhpcy50ZXh0RWRpdG9yLmlzRGVzdHJveWVkKCkgfHxcbiAgICAgICAgICAgIXRoaXMudGV4dEVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKSB8fFxuICAgICAgICAgICAhdGhpcy50ZXh0RWRpdG9yRWxlbWVudC5wYXJlbnROb2RlXG4gIH1cbn1cbiJdfQ==