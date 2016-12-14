Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

'use babel';

var stylesheetPath = _path2['default'].resolve(__dirname, '../../styles/minimap.less');
var stylesheet = atom.themes.loadStylesheet(stylesheetPath);

exports['default'] = { stylesheet: stylesheet };

beforeEach(function () {
  if (!atom.workspace.buildTextEditor) {
    (function () {
      var _require = require('atom');

      var TextEditor = _require.TextEditor;

      atom.workspace.buildTextEditor = function (opts) {
        return new TextEditor(opts);
      };
    })();
  }

  var jasmineContent = document.body.querySelector('#jasmine-content');
  var styleNode = document.createElement('style');
  styleNode.textContent = '\n    ' + stylesheet + '\n    atom-text-editor {\n      position: relative;\n    }\n\n    atom-text-editor-minimap[stand-alone] {\n      width: 100px;\n      height: 100px;\n    }\n\n    atom-text-editor, atom-text-editor::shadow {\n      line-height: 17px;\n    }\n\n    atom-text-editor atom-text-editor-minimap, atom-text-editor::shadow atom-text-editor-minimap {\n      background: rgba(255,0,0,0.3);\n    }\n\n    atom-text-editor atom-text-editor-minimap::shadow .minimap-scroll-indicator, atom-text-editor::shadow atom-text-editor-minimap::shadow .minimap-scroll-indicator {\n      background: rgba(0,0,255,0.3);\n    }\n\n    atom-text-editor atom-text-editor-minimap::shadow .minimap-visible-area, atom-text-editor::shadow atom-text-editor-minimap::shadow .minimap-visible-area {\n      background: rgba(0,255,0,0.3);\n      opacity: 1;\n    }\n\n    atom-text-editor::shadow atom-text-editor-minimap::shadow .open-minimap-quick-settings {\n      opacity: 1 !important;\n    }\n  ';

  jasmineContent.appendChild(styleNode);
});
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9zcGVjL2hlbHBlcnMvd29ya3NwYWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztvQkFFaUIsTUFBTTs7OztBQUZ2QixXQUFXLENBQUE7O0FBSVgsSUFBSSxjQUFjLEdBQUcsa0JBQUssT0FBTyxDQUFDLFNBQVMsRUFBRSwyQkFBMkIsQ0FBQyxDQUFBO0FBQ3pFLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFBOztxQkFFNUMsRUFBQyxVQUFVLEVBQVYsVUFBVSxFQUFDOztBQUUzQixVQUFVLENBQUMsWUFBTTtBQUNmLE1BQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRTs7cUJBQ2hCLE9BQU8sQ0FBQyxNQUFNLENBQUM7O1VBQTdCLFVBQVUsWUFBVixVQUFVOztBQUNmLFVBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFHLFVBQVUsSUFBSSxFQUFFO0FBQy9DLGVBQU8sSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUE7T0FDNUIsQ0FBQTs7R0FDRjs7QUFFRCxNQUFJLGNBQWMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO0FBQ3BFLE1BQUksU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDL0MsV0FBUyxDQUFDLFdBQVcsY0FDakIsVUFBVSwwOEJBOEJiLENBQUE7O0FBRUQsZ0JBQWMsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUE7Q0FDdEMsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9zcGVjL2hlbHBlcnMvd29ya3NwYWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxubGV0IHN0eWxlc2hlZXRQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3N0eWxlcy9taW5pbWFwLmxlc3MnKVxubGV0IHN0eWxlc2hlZXQgPSBhdG9tLnRoZW1lcy5sb2FkU3R5bGVzaGVldChzdHlsZXNoZWV0UGF0aClcblxuZXhwb3J0IGRlZmF1bHQge3N0eWxlc2hlZXR9XG5cbmJlZm9yZUVhY2goKCkgPT4ge1xuICBpZiAoIWF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcikge1xuICAgIGxldCB7VGV4dEVkaXRvcn0gPSByZXF1aXJlKCdhdG9tJylcbiAgICBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3IgPSBmdW5jdGlvbiAob3B0cykge1xuICAgICAgcmV0dXJuIG5ldyBUZXh0RWRpdG9yKG9wdHMpXG4gICAgfVxuICB9XG5cbiAgbGV0IGphc21pbmVDb250ZW50ID0gZG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yKCcjamFzbWluZS1jb250ZW50JylcbiAgbGV0IHN0eWxlTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcbiAgc3R5bGVOb2RlLnRleHRDb250ZW50ID0gYFxuICAgICR7c3R5bGVzaGVldH1cbiAgICBhdG9tLXRleHQtZWRpdG9yIHtcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICB9XG5cbiAgICBhdG9tLXRleHQtZWRpdG9yLW1pbmltYXBbc3RhbmQtYWxvbmVdIHtcbiAgICAgIHdpZHRoOiAxMDBweDtcbiAgICAgIGhlaWdodDogMTAwcHg7XG4gICAgfVxuXG4gICAgYXRvbS10ZXh0LWVkaXRvciwgYXRvbS10ZXh0LWVkaXRvcjo6c2hhZG93IHtcbiAgICAgIGxpbmUtaGVpZ2h0OiAxN3B4O1xuICAgIH1cblxuICAgIGF0b20tdGV4dC1lZGl0b3IgYXRvbS10ZXh0LWVkaXRvci1taW5pbWFwLCBhdG9tLXRleHQtZWRpdG9yOjpzaGFkb3cgYXRvbS10ZXh0LWVkaXRvci1taW5pbWFwIHtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LDAsMCwwLjMpO1xuICAgIH1cblxuICAgIGF0b20tdGV4dC1lZGl0b3IgYXRvbS10ZXh0LWVkaXRvci1taW5pbWFwOjpzaGFkb3cgLm1pbmltYXAtc2Nyb2xsLWluZGljYXRvciwgYXRvbS10ZXh0LWVkaXRvcjo6c2hhZG93IGF0b20tdGV4dC1lZGl0b3ItbWluaW1hcDo6c2hhZG93IC5taW5pbWFwLXNjcm9sbC1pbmRpY2F0b3Ige1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgwLDAsMjU1LDAuMyk7XG4gICAgfVxuXG4gICAgYXRvbS10ZXh0LWVkaXRvciBhdG9tLXRleHQtZWRpdG9yLW1pbmltYXA6OnNoYWRvdyAubWluaW1hcC12aXNpYmxlLWFyZWEsIGF0b20tdGV4dC1lZGl0b3I6OnNoYWRvdyBhdG9tLXRleHQtZWRpdG9yLW1pbmltYXA6OnNoYWRvdyAubWluaW1hcC12aXNpYmxlLWFyZWEge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgwLDI1NSwwLDAuMyk7XG4gICAgICBvcGFjaXR5OiAxO1xuICAgIH1cblxuICAgIGF0b20tdGV4dC1lZGl0b3I6OnNoYWRvdyBhdG9tLXRleHQtZWRpdG9yLW1pbmltYXA6OnNoYWRvdyAub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzIHtcbiAgICAgIG9wYWNpdHk6IDEgIWltcG9ydGFudDtcbiAgICB9XG4gIGBcblxuICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZChzdHlsZU5vZGUpXG59KVxuIl19
//# sourceURL=/home/takaaki/.atom/packages/minimap/spec/helpers/workspace.js
