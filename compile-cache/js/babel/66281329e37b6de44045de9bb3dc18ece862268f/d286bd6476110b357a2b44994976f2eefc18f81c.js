Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

'use babel';

var markerTypeConfigKey = 'minimap-linter.markerType';

var MinimapBookmarksBinding = (function () {
  function MinimapBookmarksBinding(editorMinimap) {
    var _this = this;

    _classCallCheck(this, MinimapBookmarksBinding);

    this.markerType = atom.config.get('minimap-linter.markerType') || 'highlight-over';
    this.editorMinimap = editorMinimap;
    this.subscriptions = new _atom.CompositeDisposable();
    this.editor = this.editorMinimap.getTextEditor();
    this.decorations = [];
    this.reloadDecorations();

    atom.config.onDidChange(markerTypeConfigKey, function (_ref) {
      var newValue = _ref.newValue;

      _this.markerType = newValue;
      _this.reloadDecorations();
    });

    this.subscriptions.add(this.editor.displayBuffer.onDidAddDecoration(function (decoration) {
      return _this.processDecoration(decoration);
    }));
  }

  _createClass(MinimapBookmarksBinding, [{
    key: 'reloadDecorations',
    value: function reloadDecorations() {
      this.removeDecorations();
      for (var decorationId in this.editor.displayBuffer.decorationsById) {
        this.processDecoration(this.editor.displayBuffer.decorationsById[decorationId]);
      }
    }
  }, {
    key: 'processDecoration',
    value: function processDecoration(linterDecoration) {
      if (linterDecoration.properties && linterDecoration.properties['class'] && linterDecoration.properties['class'].indexOf('linter-') === 0) {
        var minimapDecoration = this.editorMinimap.decorateMarker(linterDecoration.marker, {
          type: this.markerType,
          'class': linterDecoration.properties['class']
        });
        this.decorations.push(minimapDecoration);
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.removeDecorations();
      return this.subscriptions.dispose();
    }
  }, {
    key: 'removeDecorations',
    value: function removeDecorations() {
      if (this.decorations.length === 0) return;
      this.decorations.forEach(function (decoration) {
        return decoration.destroy();
      });
      this.decorations = [];
    }
  }]);

  return MinimapBookmarksBinding;
})();

exports['default'] = MinimapBookmarksBinding;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC1saW50ZXIvbGliL21pbmltYXAtbGludGVyLWJpbmRpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7b0JBQ29DLE1BQU07O0FBRDFDLFdBQVcsQ0FBQzs7QUFHWixJQUFNLG1CQUFtQixHQUFHLDJCQUEyQixDQUFDOztJQUVuQyx1QkFBdUI7QUFDL0IsV0FEUSx1QkFBdUIsQ0FDOUIsYUFBYSxFQUFFOzs7MEJBRFIsdUJBQXVCOztBQUV4QyxRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLElBQUksZ0JBQWdCLENBQUM7QUFDbkYsUUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7QUFDbkMsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQztBQUMvQyxRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDakQsUUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDdEIsUUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7O0FBRXpCLFFBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLG1CQUFtQixFQUFFLFVBQUMsSUFBWSxFQUFLO1VBQWYsUUFBUSxHQUFWLElBQVksQ0FBVixRQUFROztBQUN0RCxZQUFLLFVBQVUsR0FBRyxRQUFRLENBQUM7QUFDM0IsWUFBSyxpQkFBaUIsRUFBRSxDQUFDO0tBQzFCLENBQUMsQ0FBQzs7QUFFSCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFBLFVBQVU7YUFBSSxNQUFLLGlCQUFpQixDQUFDLFVBQVUsQ0FBQztLQUFBLENBQUMsQ0FBQyxDQUFDO0dBQ3hIOztlQWZrQix1QkFBdUI7O1dBaUJ6Qiw2QkFBRztBQUNsQixVQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztBQUN6QixXQUFLLElBQUksWUFBWSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRTtBQUNsRSxZQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7T0FDakY7S0FDRjs7O1dBRWlCLDJCQUFDLGdCQUFnQixFQUFFO0FBQ25DLFVBQUksZ0JBQWdCLENBQUMsVUFBVSxJQUFJLGdCQUFnQixDQUFDLFVBQVUsU0FBTSxJQUFJLGdCQUFnQixDQUFDLFVBQVUsU0FBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDbEksWUFBSSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUU7QUFDakYsY0FBSSxFQUFFLElBQUksQ0FBQyxVQUFVO0FBQ3JCLG1CQUFPLGdCQUFnQixDQUFDLFVBQVUsU0FBTTtTQUN6QyxDQUFDLENBQUM7QUFDSCxZQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO09BQzFDO0tBQ0Y7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7QUFDekIsYUFBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3JDOzs7V0FFZ0IsNkJBQUc7QUFDbEIsVUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsT0FBTztBQUMxQyxVQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFBLFVBQVU7ZUFBSSxVQUFVLENBQUMsT0FBTyxFQUFFO09BQUEsQ0FBQyxDQUFDO0FBQzdELFVBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0tBQ3ZCOzs7U0EzQ2tCLHVCQUF1Qjs7O3FCQUF2Qix1QkFBdUIiLCJmaWxlIjoiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWxpbnRlci9saWIvbWluaW1hcC1saW50ZXItYmluZGluZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuXG5jb25zdCBtYXJrZXJUeXBlQ29uZmlnS2V5ID0gJ21pbmltYXAtbGludGVyLm1hcmtlclR5cGUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNaW5pbWFwQm9va21hcmtzQmluZGluZyB7XG4gIGNvbnN0cnVjdG9yKGVkaXRvck1pbmltYXApIHtcbiAgICB0aGlzLm1hcmtlclR5cGUgPSBhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAtbGludGVyLm1hcmtlclR5cGUnKSB8fCAnaGlnaGxpZ2h0LW92ZXInO1xuICAgIHRoaXMuZWRpdG9yTWluaW1hcCA9IGVkaXRvck1pbmltYXA7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLmVkaXRvciA9IHRoaXMuZWRpdG9yTWluaW1hcC5nZXRUZXh0RWRpdG9yKCk7XG4gICAgdGhpcy5kZWNvcmF0aW9ucyA9IFtdO1xuICAgIHRoaXMucmVsb2FkRGVjb3JhdGlvbnMoKTtcblxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKG1hcmtlclR5cGVDb25maWdLZXksICh7IG5ld1ZhbHVlIH0pID0+IHtcbiAgICAgIHRoaXMubWFya2VyVHlwZSA9IG5ld1ZhbHVlO1xuICAgICAgdGhpcy5yZWxvYWREZWNvcmF0aW9ucygpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVkaXRvci5kaXNwbGF5QnVmZmVyLm9uRGlkQWRkRGVjb3JhdGlvbihkZWNvcmF0aW9uID0+IHRoaXMucHJvY2Vzc0RlY29yYXRpb24oZGVjb3JhdGlvbikpKTtcbiAgfVxuXG4gIHJlbG9hZERlY29yYXRpb25zKCkge1xuICAgIHRoaXMucmVtb3ZlRGVjb3JhdGlvbnMoKTtcbiAgICBmb3IgKGxldCBkZWNvcmF0aW9uSWQgaW4gdGhpcy5lZGl0b3IuZGlzcGxheUJ1ZmZlci5kZWNvcmF0aW9uc0J5SWQpIHtcbiAgICAgIHRoaXMucHJvY2Vzc0RlY29yYXRpb24odGhpcy5lZGl0b3IuZGlzcGxheUJ1ZmZlci5kZWNvcmF0aW9uc0J5SWRbZGVjb3JhdGlvbklkXSk7XG4gICAgfVxuICB9XG5cbiAgcHJvY2Vzc0RlY29yYXRpb24gKGxpbnRlckRlY29yYXRpb24pIHtcbiAgICBpZiAobGludGVyRGVjb3JhdGlvbi5wcm9wZXJ0aWVzICYmIGxpbnRlckRlY29yYXRpb24ucHJvcGVydGllcy5jbGFzcyAmJiBsaW50ZXJEZWNvcmF0aW9uLnByb3BlcnRpZXMuY2xhc3MuaW5kZXhPZignbGludGVyLScpID09PSAwKSB7XG4gICAgICBsZXQgbWluaW1hcERlY29yYXRpb24gPSB0aGlzLmVkaXRvck1pbmltYXAuZGVjb3JhdGVNYXJrZXIobGludGVyRGVjb3JhdGlvbi5tYXJrZXIsIHtcbiAgICAgICAgdHlwZTogdGhpcy5tYXJrZXJUeXBlLFxuICAgICAgICBjbGFzczogbGludGVyRGVjb3JhdGlvbi5wcm9wZXJ0aWVzLmNsYXNzXG4gICAgICB9KTtcbiAgICAgIHRoaXMuZGVjb3JhdGlvbnMucHVzaChtaW5pbWFwRGVjb3JhdGlvbik7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLnJlbW92ZURlY29yYXRpb25zKCk7XG4gICAgcmV0dXJuIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICByZW1vdmVEZWNvcmF0aW9ucygpIHtcbiAgICBpZiAodGhpcy5kZWNvcmF0aW9ucy5sZW5ndGggPT09IDApIHJldHVybjtcbiAgICB0aGlzLmRlY29yYXRpb25zLmZvckVhY2goZGVjb3JhdGlvbiA9PiBkZWNvcmF0aW9uLmRlc3Ryb3koKSk7XG4gICAgdGhpcy5kZWNvcmF0aW9ucyA9IFtdO1xuICB9XG59XG4iXX0=
//# sourceURL=/home/takaaki/.atom/packages/minimap-linter/lib/minimap-linter-binding.js
