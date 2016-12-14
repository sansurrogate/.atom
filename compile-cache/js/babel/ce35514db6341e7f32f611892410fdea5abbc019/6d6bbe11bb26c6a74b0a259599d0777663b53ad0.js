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

    this.subscriptions.add(this.editor.onDidAddDecoration(function (decoration) {
      return _this.processDecoration(decoration);
    }));
  }

  _createClass(MinimapBookmarksBinding, [{
    key: 'reloadDecorations',
    value: function reloadDecorations() {
      this.removeDecorations();
      for (var decoration in this.editor.getDecorations()) {
        this.processDecoration(decoration);
      }
    }
  }, {
    key: 'processDecoration',
    value: function processDecoration(linterDecoration) {
      if (linterDecoration.properties && linterDecoration.properties['class'] && linterDecoration.properties['class'].indexOf('linter-') === 0) {
        var minimapDecoration = this.editorMinimap.decorateMarker(linterDecoration.marker, {
          type: ~linterDecoration.properties['class'].indexOf('linter-row') ? 'gutter' : this.markerType,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC1saW50ZXIvbGliL21pbmltYXAtbGludGVyLWJpbmRpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7b0JBQ29DLE1BQU07O0FBRDFDLFdBQVcsQ0FBQzs7QUFHWixJQUFNLG1CQUFtQixHQUFHLDJCQUEyQixDQUFDOztJQUVuQyx1QkFBdUI7QUFDL0IsV0FEUSx1QkFBdUIsQ0FDOUIsYUFBYSxFQUFFOzs7MEJBRFIsdUJBQXVCOztBQUV4QyxRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLElBQUksZ0JBQWdCLENBQUM7QUFDbkYsUUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7QUFDbkMsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQztBQUMvQyxRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDakQsUUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDdEIsUUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7O0FBRXpCLFFBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLG1CQUFtQixFQUFFLFVBQUMsSUFBWSxFQUFLO1VBQWYsUUFBUSxHQUFWLElBQVksQ0FBVixRQUFROztBQUN0RCxZQUFLLFVBQVUsR0FBRyxRQUFRLENBQUM7QUFDM0IsWUFBSyxpQkFBaUIsRUFBRSxDQUFDO0tBQzFCLENBQUMsQ0FBQzs7QUFFSCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFVBQUEsVUFBVTthQUFJLE1BQUssaUJBQWlCLENBQUMsVUFBVSxDQUFDO0tBQUEsQ0FBQyxDQUFDLENBQUM7R0FDMUc7O2VBZmtCLHVCQUF1Qjs7V0FpQnpCLDZCQUFHO0FBQ2xCLFVBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0FBQ3pCLFdBQUssSUFBSSxVQUFVLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsRUFBRTtBQUNuRCxZQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7T0FDcEM7S0FDRjs7O1dBRWlCLDJCQUFDLGdCQUFnQixFQUFFO0FBQ25DLFVBQUksZ0JBQWdCLENBQUMsVUFBVSxJQUFJLGdCQUFnQixDQUFDLFVBQVUsU0FBTSxJQUFJLGdCQUFnQixDQUFDLFVBQVUsU0FBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDbEksWUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUU7QUFDbkYsY0FBSSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxTQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVTtBQUMzRixtQkFBTyxnQkFBZ0IsQ0FBQyxVQUFVLFNBQU07U0FDekMsQ0FBQyxDQUFDO0FBQ0gsWUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztPQUMxQztLQUNGOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0FBQ3pCLGFBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNyQzs7O1dBRWdCLDZCQUFHO0FBQ2xCLFVBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLE9BQU87QUFDMUMsVUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBQSxVQUFVO2VBQUksVUFBVSxDQUFDLE9BQU8sRUFBRTtPQUFBLENBQUMsQ0FBQztBQUM3RCxVQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztLQUN2Qjs7O1NBM0NrQix1QkFBdUI7OztxQkFBdkIsdUJBQXVCIiwiZmlsZSI6Ii9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC1saW50ZXIvbGliL21pbmltYXAtbGludGVyLWJpbmRpbmcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJztcblxuY29uc3QgbWFya2VyVHlwZUNvbmZpZ0tleSA9ICdtaW5pbWFwLWxpbnRlci5tYXJrZXJUeXBlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWluaW1hcEJvb2ttYXJrc0JpbmRpbmcge1xuICBjb25zdHJ1Y3RvcihlZGl0b3JNaW5pbWFwKSB7XG4gICAgdGhpcy5tYXJrZXJUeXBlID0gYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLWxpbnRlci5tYXJrZXJUeXBlJykgfHwgJ2hpZ2hsaWdodC1vdmVyJztcbiAgICB0aGlzLmVkaXRvck1pbmltYXAgPSBlZGl0b3JNaW5pbWFwO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5lZGl0b3IgPSB0aGlzLmVkaXRvck1pbmltYXAuZ2V0VGV4dEVkaXRvcigpO1xuICAgIHRoaXMuZGVjb3JhdGlvbnMgPSBbXTtcbiAgICB0aGlzLnJlbG9hZERlY29yYXRpb25zKCk7XG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZShtYXJrZXJUeXBlQ29uZmlnS2V5LCAoeyBuZXdWYWx1ZSB9KSA9PiB7XG4gICAgICB0aGlzLm1hcmtlclR5cGUgPSBuZXdWYWx1ZTtcbiAgICAgIHRoaXMucmVsb2FkRGVjb3JhdGlvbnMoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5lZGl0b3Iub25EaWRBZGREZWNvcmF0aW9uKGRlY29yYXRpb24gPT4gdGhpcy5wcm9jZXNzRGVjb3JhdGlvbihkZWNvcmF0aW9uKSkpO1xuICB9XG5cbiAgcmVsb2FkRGVjb3JhdGlvbnMoKSB7XG4gICAgdGhpcy5yZW1vdmVEZWNvcmF0aW9ucygpO1xuICAgIGZvciAobGV0IGRlY29yYXRpb24gaW4gdGhpcy5lZGl0b3IuZ2V0RGVjb3JhdGlvbnMoKSkge1xuICAgICAgdGhpcy5wcm9jZXNzRGVjb3JhdGlvbihkZWNvcmF0aW9uKTtcbiAgICB9XG4gIH1cblxuICBwcm9jZXNzRGVjb3JhdGlvbiAobGludGVyRGVjb3JhdGlvbikge1xuICAgIGlmIChsaW50ZXJEZWNvcmF0aW9uLnByb3BlcnRpZXMgJiYgbGludGVyRGVjb3JhdGlvbi5wcm9wZXJ0aWVzLmNsYXNzICYmIGxpbnRlckRlY29yYXRpb24ucHJvcGVydGllcy5jbGFzcy5pbmRleE9mKCdsaW50ZXItJykgPT09IDApIHtcbiAgICAgIGNvbnN0IG1pbmltYXBEZWNvcmF0aW9uID0gdGhpcy5lZGl0b3JNaW5pbWFwLmRlY29yYXRlTWFya2VyKGxpbnRlckRlY29yYXRpb24ubWFya2VyLCB7XG4gICAgICAgIHR5cGU6IH5saW50ZXJEZWNvcmF0aW9uLnByb3BlcnRpZXMuY2xhc3MuaW5kZXhPZignbGludGVyLXJvdycpID8gJ2d1dHRlcicgOiB0aGlzLm1hcmtlclR5cGUsXG4gICAgICAgIGNsYXNzOiBsaW50ZXJEZWNvcmF0aW9uLnByb3BlcnRpZXMuY2xhc3NcbiAgICAgIH0pO1xuICAgICAgdGhpcy5kZWNvcmF0aW9ucy5wdXNoKG1pbmltYXBEZWNvcmF0aW9uKTtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMucmVtb3ZlRGVjb3JhdGlvbnMoKTtcbiAgICByZXR1cm4gdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHJlbW92ZURlY29yYXRpb25zKCkge1xuICAgIGlmICh0aGlzLmRlY29yYXRpb25zLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgIHRoaXMuZGVjb3JhdGlvbnMuZm9yRWFjaChkZWNvcmF0aW9uID0+IGRlY29yYXRpb24uZGVzdHJveSgpKTtcbiAgICB0aGlzLmRlY29yYXRpb25zID0gW107XG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/takaaki/.atom/packages/minimap-linter/lib/minimap-linter-binding.js
