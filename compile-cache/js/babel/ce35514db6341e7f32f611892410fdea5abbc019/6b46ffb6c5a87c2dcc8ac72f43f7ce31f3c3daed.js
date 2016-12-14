Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.observeConfig = observeConfig;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _autohideTreeViewJs = require('./autohide-tree-view.js');

var _hoverEventsJs = require('./hover-events.js');

var _clickEventsJs = require('./click-events.js');

var _touchEventsJs = require('./touch-events.js');

var _pinViewJs = require('./pin-view.js');

var _pinViewJs2 = _interopRequireDefault(_pinViewJs);

'use babel';
var schema = {
  showOn: {
    description: 'The type of event that triggers the tree view to show or hide. The touch events require atom-touch-events (https://atom.io/packages/atom-touch-events) to be installed. You\'ll need to restart Atom after installing atom-touch-events for touch events to become available.',
    type: 'string',
    'default': 'hover',
    'enum': ['hover', 'click', 'touch', 'hover + click', 'hover + touch', 'click + touch', 'hover + click + touch', 'none'],
    order: 0
  },
  showDelay: {
    description: 'The delay in milliseconds before the tree view will show. Only applies to hover events.',
    type: 'integer',
    'default': 200,
    minimum: 0,
    order: 1
  },
  hideDelay: {
    description: 'The delay in milliseconds before the tree view will hide. Only applies to hover events.',
    type: 'integer',
    'default': 200,
    minimum: 0,
    order: 2
  },
  minWidth: {
    description: 'The width in pixels of the tree view when it is hidden.',
    type: 'integer',
    'default': 5,
    minimum: 0,
    order: 3
  },
  maxWidth: {
    description: 'The max width in pixels of the tree view when it is expanded. Set to 0 to always extend to the max filename width.',
    type: 'integer',
    'default': 0,
    minimum: 0,
    order: 4
  },
  animationSpeed: {
    description: 'The speed in 1000 pixels per second of the animation. Set to 0 to disable the animation.',
    type: 'number',
    'default': 1,
    minimum: 0,
    order: 5
  },
  pushEditor: {
    description: 'Push the edge of the editor around to keep the entire editor contents visible.',
    type: 'boolean',
    'default': false,
    order: 6
  },
  triggerAreaSize: {
    description: 'Size of the area at the edge of the screen where hover/click events will trigger the tree view to show/hide',
    type: 'integer',
    'default': 0,
    minimum: 0,
    order: 7
  },
  touchAreaSize: {
    description: 'Width of an invisible area at the edge of the screen where touch events will be triggered.',
    type: 'integer',
    'default': 50,
    minimum: 0,
    order: 8
  },
  maxWindowWidth: {
    description: 'Autohide will be disabled when the window is wider than this. Set to 0 to always enable autohide.',
    type: 'integer',
    'default': 0,
    minimum: 0,
    order: 9
  },
  showPinButton: {
    description: 'Shows a pin button at the top of the tree view that enables/disables autohide.',
    type: 'boolean',
    'default': true,
    order: 10
  }
};

exports.schema = schema;
var config = Object.create(null);
exports['default'] = config;

var _loop = function (key) {
  Object.defineProperty(config, key, {
    get: function get() {
      // eslint-disable-line no-loop-func
      return atom.config.get('autohide-tree-view.' + key);
    }
  });
};

for (var key of Object.keys(schema)) {
  _loop(key);
}

function observeConfig() {
  return new _atom.CompositeDisposable(
  // changes to these settings should trigger an update
  atom.config.onDidChange('autohide-tree-view.pushEditor', function () {
    return (0, _autohideTreeViewJs.updateTreeView)();
  }), atom.config.onDidChange('autohide-tree-view.minWidth', function () {
    (0, _autohideTreeViewJs.updateTreeView)();
    (0, _autohideTreeViewJs.updateTriggerArea)();
  }), atom.config.onDidChange('tree-view.showOnRightSide', function () {
    return (0, _autohideTreeViewJs.updateTreeView)();
  }), atom.config.onDidChange('tree-view.hideIgnoredNames', function () {
    return (0, _autohideTreeViewJs.updateTreeView)();
  }), atom.config.onDidChange('tree-view.hideVcsIgnoredFiles', function () {
    return (0, _autohideTreeViewJs.updateTreeView)();
  }), atom.config.onDidChange('core.ignoredNames', function () {
    return (0, _autohideTreeViewJs.updateTreeView)();
  }), atom.config.observe('autohide-tree-view.triggerAreaSize', function () {
    return (0, _autohideTreeViewJs.updateTriggerArea)();
  }),

  // enable or disable the event types
  atom.config.observe('autohide-tree-view.showOn', function (showOn) {
    showOn.match('hover') ? (0, _hoverEventsJs.enableHoverEvents)() : (0, _hoverEventsJs.disableHoverEvents)();
    showOn.match('click') ? (0, _clickEventsJs.enableClickEvents)() : (0, _clickEventsJs.disableClickEvents)();
    showOn.match('touch') ? (0, _touchEventsJs.enableTouchEvents)() : (0, _touchEventsJs.disableTouchEvents)();
  }), atom.config.observe('autohide-tree-view.showPinButton', function (showPinButton) {
    return showPinButton ? _pinViewJs2['default'].show() : _pinViewJs2['default'].hide();
  }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYXV0b2hpZGUtdHJlZS12aWV3L2xpYi9jb25maWcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztvQkFDa0MsTUFBTTs7a0NBQ1EseUJBQXlCOzs2QkFDckIsbUJBQW1COzs2QkFDbkIsbUJBQW1COzs2QkFDbkIsbUJBQW1COzt5QkFDbkQsZUFBZTs7OztBQU5uQyxXQUFXLENBQUM7QUFRTCxJQUFNLE1BQU0sR0FBRztBQUNwQixRQUFNLEVBQUU7QUFDTixlQUFXLEVBQUUsK1FBQStRO0FBQzVSLFFBQUksRUFBRSxRQUFRO0FBQ2QsZUFBUyxPQUFPO0FBQ2hCLFlBQU0sQ0FDSixPQUFPLEVBQ1AsT0FBTyxFQUNQLE9BQU8sRUFDUCxlQUFlLEVBQ2YsZUFBZSxFQUNmLGVBQWUsRUFDZix1QkFBdUIsRUFDdkIsTUFBTSxDQUNQO0FBQ0QsU0FBSyxFQUFFLENBQUM7R0FDVDtBQUNELFdBQVMsRUFBRTtBQUNULGVBQVcsRUFBRSx5RkFBeUY7QUFDdEcsUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLEdBQUc7QUFDWixXQUFPLEVBQUUsQ0FBQztBQUNWLFNBQUssRUFBRSxDQUFDO0dBQ1Q7QUFDRCxXQUFTLEVBQUU7QUFDVCxlQUFXLEVBQUUseUZBQXlGO0FBQ3RHLFFBQUksRUFBRSxTQUFTO0FBQ2YsZUFBUyxHQUFHO0FBQ1osV0FBTyxFQUFFLENBQUM7QUFDVixTQUFLLEVBQUUsQ0FBQztHQUNUO0FBQ0QsVUFBUSxFQUFFO0FBQ1IsZUFBVyxFQUFFLHlEQUF5RDtBQUN0RSxRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsQ0FBQztBQUNWLFdBQU8sRUFBRSxDQUFDO0FBQ1YsU0FBSyxFQUFFLENBQUM7R0FDVDtBQUNELFVBQVEsRUFBRTtBQUNSLGVBQVcsRUFBRSxvSEFBb0g7QUFDakksUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLENBQUM7QUFDVixXQUFPLEVBQUUsQ0FBQztBQUNWLFNBQUssRUFB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Ryx3Q0FBb0IsQ0FBQztHQUNwRSxDQUFDLEVBRUYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsa0NBQWtDLEVBQUUsVUFBQSxhQUFhO1dBQ25FLGFBQWEsR0FBRyx1QkFBUSxJQUFJLEVBQUUsR0FBRyx1QkFBUSxJQUFJLEVBQUU7R0FBQSxDQUNoRCxDQUNGLENBQUM7Q0FDSCIsImZpbGUiOiIvaG9tZS90YWthYWtpLy5hdG9tL3BhY2thZ2VzL2F1dG9oaWRlLXRyZWUtdmlldy9saWIvY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHt1cGRhdGVUcmVlVmlldywgdXBkYXRlVHJpZ2dlckFyZWF9IGZyb20gJy4vYXV0b2hpZGUtdHJlZS12aWV3LmpzJztcbmltcG9ydCB7ZW5hYmxlSG92ZXJFdmVudHMsIGRpc2FibGVIb3ZlckV2ZW50c30gZnJvbSAnLi9ob3Zlci1ldmVudHMuanMnO1xuaW1wb3J0IHtlbmFibGVDbGlja0V2ZW50cywgZGlzYWJsZUNsaWNrRXZlbnRzfSBmcm9tICcuL2NsaWNrLWV2ZW50cy5qcyc7XG5pbXBvcnQge2VuYWJsZVRvdWNoRXZlbnRzLCBkaXNhYmxlVG91Y2hFdmVudHN9IGZyb20gJy4vdG91Y2gtZXZlbnRzLmpzJztcbmltcG9ydCBwaW5WaWV3IGZyb20gJy4vcGluLXZpZXcuanMnO1xuXG5leHBvcnQgY29uc3Qgc2NoZW1hID0ge1xuICBzaG93T246IHtcbiAgICBkZXNjcmlwdGlvbjogJ1RoZSB0eXBlIG9mIGV2ZW50IHRoYXQgdHJpZ2dlcnMgdGhlIHRyZWUgdmlldyB0byBzaG93IG9yIGhpZGUuIFRoZSB0b3VjaCBldmVudHMgcmVxdWlyZSBhdG9tLXRvdWNoLWV2ZW50cyAoaHR0cHM6Ly9hdG9tLmlvL3BhY2thZ2VzL2F0b20tdG91Y2gtZXZlbnRzKSB0byBiZSBpbnN0YWxsZWQuIFlvdVxcJ2xsIG5lZWQgdG8gcmVzdGFydCBBdG9tIGFmdGVyIGluc3RhbGxpbmcgYXRvbS10b3VjaC1ldmVudHMgZm9yIHRvdWNoIGV2ZW50cyB0byBiZWNvbWUgYXZhaWxhYmxlLicsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ2hvdmVyJyxcbiAgICBlbnVtOiBbXG4gICAgICAnaG92ZXInLFxuICAgICAgJ2NsaWNrJyxcbiAgICAgICd0b3VjaCcsXG4gICAgICAnaG92ZXIgKyBjbGljaycsXG4gICAgICAnaG92ZXIgKyB0b3VjaCcsXG4gICAgICAnY2xpY2sgKyB0b3VjaCcsXG4gICAgICAnaG92ZXIgKyBjbGljayArIHRvdWNoJyxcbiAgICAgICdub25lJyxcbiAgICBdLFxuICAgIG9yZGVyOiAwLFxuICB9LFxuICBzaG93RGVsYXk6IHtcbiAgICBkZXNjcmlwdGlvbjogJ1RoZSBkZWxheSBpbiBtaWxsaXNlY29uZHMgYmVmb3JlIHRoZSB0cmVlIHZpZXcgd2lsbCBzaG93LiBPbmx5IGFwcGxpZXMgdG8gaG92ZXIgZXZlbnRzLicsXG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIGRlZmF1bHQ6IDIwMCxcbiAgICBtaW5pbXVtOiAwLFxuICAgIG9yZGVyOiAxLFxuICB9LFxuICBoaWRlRGVsYXk6IHtcbiAgICBkZXNjcmlwdGlvbjogJ1RoZSBkZWxheSBpbiBtaWxsaXNlY29uZHMgYmVmb3JlIHRoZSB0cmVlIHZpZXcgd2lsbCBoaWRlLiBPbmx5IGFwcGxpZXMgdG8gaG92ZXIgZXZlbnRzLicsXG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIGRlZmF1bHQ6IDIwMCxcbiAgICBtaW5pbXVtOiAwLFxuICAgIG9yZGVyOiAyLFxuICB9LFxuICBtaW5XaWR0aDoge1xuICAgIGRlc2NyaXB0aW9uOiAnVGhlIHdpZHRoIGluIHBpeGVscyBvZiB0aGUgdHJlZSB2aWV3IHdoZW4gaXQgaXMgaGlkZGVuLicsXG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIGRlZmF1bHQ6IDUsXG4gICAgbWluaW11bTogMCxcbiAgICBvcmRlcjogMyxcbiAgfSxcbiAgbWF4V2lkdGg6IHtcbiAgICBkZXNjcmlwdGlvbjogJ1RoZSBtYXggd2lkdGggaW4gcGl4ZWxzIG9mIHRoZSB0cmVlIHZpZXcgd2hlbiBpdCBpcyBleHBhbmRlZC4gU2V0IHRvIDAgdG8gYWx3YXlzIGV4dGVuZCB0byB0aGUgbWF4IGZpbGVuYW1lIHdpZHRoLicsXG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIGRlZmF1bHQ6IDAsXG4gICAgbWluaW11bTogMCxcbiAgICBvcmRlcjogNCxcbiAgfSxcbiAgYW5pbWF0aW9uU3BlZWQ6IHtcbiAgICBkZXNjcmlwdGlvbjogJ1RoZSBzcGVlZCBpbiAxMDAwIHBpeGVscyBwZXIgc2Vjb25kIG9mIHRoZSBhbmltYXRpb24uIFNldCB0byAwIHRvIGRpc2FibGUgdGhlIGFuaW1hdGlvbi4nLFxuICAgIHR5cGU6ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IDEsXG4gICAgbWluaW11bTogMCxcbiAgICBvcmRlcjogNSxcbiAgfSxcbiAgcHVzaEVkaXRvcjoge1xuICAgIGRlc2NyaXB0aW9uOiAnUHVzaCB0aGUgZWRnZSBvZiB0aGUgZWRpdG9yIGFyb3VuZCB0byBrZWVwIHRoZSBlbnRpcmUgZWRpdG9yIGNvbnRlbnRzIHZpc2libGUuJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDYsXG4gIH0sXG4gIHRyaWdnZXJBcmVhU2l6ZToge1xuICAgIGRlc2NyaXB0aW9uOiAnU2l6ZSBvZiB0aGUgYXJlYSBhdCB0aGUgZWRnZSBvZiB0aGUgc2NyZWVuIHdoZXJlIGhvdmVyL2NsaWNrIGV2ZW50cyB3aWxsIHRyaWdnZXIgdGhlIHRyZWUgdmlldyB0byBzaG93L2hpZGUnLFxuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBkZWZhdWx0OiAwLFxuICAgIG1pbmltdW06IDAsXG4gICAgb3JkZXI6IDcsXG4gIH0sXG4gIHRvdWNoQXJlYVNpemU6IHtcbiAgICBkZXNjcmlwdGlvbjogJ1dpZHRoIG9mIGFuIGludmlzaWJsZSBhcmVhIGF0IHRoZSBlZGdlIG9mIHRoZSBzY3JlZW4gd2hlcmUgdG91Y2ggZXZlbnRzIHdpbGwgYmUgdHJpZ2dlcmVkLicsXG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIGRlZmF1bHQ6IDUwLFxuICAgIG1pbmltdW06IDAsXG4gICAgb3JkZXI6IDgsXG4gIH0sXG4gIG1heFdpbmRvd1dpZHRoOiB7XG4gICAgZGVzY3JpcHRpb246ICdBdXRvaGlkZSB3aWxsIGJlIGRpc2FibGVkIHdoZW4gdGhlIHdpbmRvdyBpcyB3aWRlciB0aGFuIHRoaXMuIFNldCB0byAwIHRvIGFsd2F5cyBlbmFibGUgYXV0b2hpZGUuJyxcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgZGVmYXVsdDogMCxcbiAgICBtaW5pbXVtOiAwLFxuICAgIG9yZGVyOiA5LFxuICB9LFxuICBzaG93UGluQnV0dG9uOiB7XG4gICAgZGVzY3JpcHRpb246ICdTaG93cyBhIHBpbiBidXR0b24gYXQgdGhlIHRvcCBvZiB0aGUgdHJlZSB2aWV3IHRoYXQgZW5hYmxlcy9kaXNhYmxlcyBhdXRvaGlkZS4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG9yZGVyOiAxMCxcbiAgfSxcbn07XG5cbnZhciBjb25maWcgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuZXhwb3J0IGRlZmF1bHQgY29uZmlnO1xuXG5mb3IobGV0IGtleSBvZiBPYmplY3Qua2V5cyhzY2hlbWEpKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb25maWcsIGtleSwge1xuICAgIGdldCgpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1sb29wLWZ1bmNcbiAgICAgIHJldHVybiBhdG9tLmNvbmZpZy5nZXQoYGF1dG9oaWRlLXRyZWUtdmlldy4ke2tleX1gKTtcbiAgICB9LFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9ic2VydmVDb25maWcoKSB7XG4gIHJldHVybiBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAvLyBjaGFuZ2VzIHRvIHRoZXNlIHNldHRpbmdzIHNob3VsZCB0cmlnZ2VyIGFuIHVwZGF0ZVxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdhdXRvaGlkZS10cmVlLXZpZXcucHVzaEVkaXRvcicsICgpID0+XG4gICAgICB1cGRhdGVUcmVlVmlldygpXG4gICAgKSxcbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXV0b2hpZGUtdHJlZS12aWV3Lm1pbldpZHRoJywgKCkgPT4ge1xuICAgICAgdXBkYXRlVHJlZVZpZXcoKTtcbiAgICAgIHVwZGF0ZVRyaWdnZXJBcmVhKCk7XG4gICAgfSksXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ3RyZWUtdmlldy5zaG93T25SaWdodFNpZGUnLCAoKSA9PlxuICAgICAgdXBkYXRlVHJlZVZpZXcoKVxuICAgICksXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ3RyZWUtdmlldy5oaWRlSWdub3JlZE5hbWVzJywgKCkgPT5cbiAgICAgIHVwZGF0ZVRyZWVWaWV3KClcbiAgICApLFxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCd0cmVlLXZpZXcuaGlkZVZjc0lnbm9yZWRGaWxlcycsICgpID0+XG4gICAgICB1cGRhdGVUcmVlVmlldygpXG4gICAgKSxcbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnY29yZS5pZ25vcmVkTmFtZXMnLCAoKSA9PlxuICAgICAgdXBkYXRlVHJlZVZpZXcoKVxuICAgICksXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnYXV0b2hpZGUtdHJlZS12aWV3LnRyaWdnZXJBcmVhU2l6ZScsICgpID0+XG4gICAgICB1cGRhdGVUcmlnZ2VyQXJlYSgpXG4gICAgKSxcblxuICAgIC8vIGVuYWJsZSBvciBkaXNhYmxlIHRoZSBldmVudCB0eXBlc1xuICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2F1dG9oaWRlLXRyZWUtdmlldy5zaG93T24nLCBzaG93T24gPT4ge1xuICAgICAgc2hvd09uLm1hdGNoKCdob3ZlcicpID8gZW5hYmxlSG92ZXJFdmVudHMoKSA6IGRpc2FibGVIb3ZlckV2ZW50cygpO1xuICAgICAgc2hvd09uLm1hdGNoKCdjbGljaycpID8gZW5hYmxlQ2xpY2tFdmVudHMoKSA6IGRpc2FibGVDbGlja0V2ZW50cygpO1xuICAgICAgc2hvd09uLm1hdGNoKCd0b3VjaCcpID8gZW5hYmxlVG91Y2hFdmVudHMoKSA6IGRpc2FibGVUb3VjaEV2ZW50cygpO1xuICAgIH0pLFxuXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnYXV0b2hpZGUtdHJlZS12aWV3LnNob3dQaW5CdXR0b24nLCBzaG93UGluQnV0dG9uID0+XG4gICAgICBzaG93UGluQnV0dG9uID8gcGluVmlldy5zaG93KCkgOiBwaW5WaWV3LmhpZGUoKVxuICAgICksXG4gICk7XG59XG4iXX0=
//# sourceURL=/home/takaaki/.atom/packages/autohide-tree-view/lib/config.js
