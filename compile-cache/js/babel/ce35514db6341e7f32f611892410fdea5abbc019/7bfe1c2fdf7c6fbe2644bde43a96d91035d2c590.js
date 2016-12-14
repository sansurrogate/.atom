Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mixto = require('mixto');

var _mixto2 = _interopRequireDefault(_mixto);

var _atom = require('atom');

var _decoration2 = require('../decoration');

var _decoration3 = _interopRequireDefault(_decoration2);

/**
 * The mixin that provides the decorations API to the minimap editor
 * view.
 *
 * This mixin is injected into the `Minimap` prototype, so every methods defined
 * in this file will be available on any `Minimap` instance.
 */
'use babel';

var DecorationManagement = (function (_Mixin) {
  _inherits(DecorationManagement, _Mixin);

  function DecorationManagement() {
    _classCallCheck(this, DecorationManagement);

    _get(Object.getPrototypeOf(DecorationManagement.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DecorationManagement, [{
    key: 'initializeDecorations',

    /**
     * Initializes the decorations related properties.
     */
    value: function initializeDecorations() {
      if (this.emitter == null) {
        /**
         * The minimap emitter, lazily created if not created yet.
         * @type {Emitter}
         * @access private
         */
        this.emitter = new _atom.Emitter();
      }

      /**
       * A map with the decoration id as key and the decoration as value.
       * @type {Object}
       * @access private
       */
      this.decorationsById = {};
      /**
       * The decorations stored in an array indexed with their marker id.
       * @type {Object}
       * @access private
       */
      this.decorationsByMarkerId = {};
      /**
       * The subscriptions to the markers `did-change` event indexed using the
       * marker id.
       * @type {Object}
       * @access private
       */
      this.decorationMarkerChangedSubscriptions = {};
      /**
       * The subscriptions to the markers `did-destroy` event indexed using the
       * marker id.
       * @type {Object}
       * @access private
       */
      this.decorationMarkerDestroyedSubscriptions = {};
      /**
       * The subscriptions to the decorations `did-change-properties` event
       * indexed using the decoration id.
       * @type {Object}
       * @access private
       */
      this.decorationUpdatedSubscriptions = {};
      /**
       * The subscriptions to the decorations `did-destroy` event indexed using
       * the decoration id.
       * @type {Object}
       * @access private
       */
      this.decorationDestroyedSubscriptions = {};
    }

    /**
     * Returns all the decorations registered in the current `Minimap`.
     *
     * @return {Array<Decoration>} all the decorations in this `Minimap`
     */
  }, {
    key: 'getDecorations',
    value: function getDecorations() {
      var decorations = this.decorationsById;
      var results = [];

      for (var id in decorations) {
        results.push(decorations[id]);
      }

      return results;
    }

    /**
     * Registers an event listener to the `did-add-decoration` event.
     *
     * @param  {function(event:Object):void} callback a function to call when the
     *                                               event is triggered.
     *                                               the callback will be called
     *                                               with an event object with
     *                                               the following properties:
     * - marker: the marker object that was decorated
     * - decoration: the decoration object that was created
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidAddDecoration',
    value: function onDidAddDecoration(callback) {
      return this.emitter.on('did-add-decoration', callback);
    }

    /**
     * Registers an event listener to the `did-remove-decoration` event.
     *
     * @param  {function(event:Object):void} callback a function to call when the
     *                                               event is triggered.
     *                                               the callback will be called
     *                                               with an event object with
     *                                               the following properties:
     * - marker: the marker object that was decorated
     * - decoration: the decoration object that was created
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidRemoveDecoration',
    value: function onDidRemoveDecoration(callback) {
      return this.emitter.on('did-remove-decoration', callback);
    }

    /**
     * Registers an event listener to the `did-change-decoration` event.
     *
     * This event is triggered when the marker targeted by the decoration
     * was changed.
     *
     * @param  {function(event:Object):void} callback a function to call when the
     *                                               event is triggered.
     *                                               the callback will be called
     *                                               with an event object with
     *                                               the following properties:
     * - marker: the marker object that was decorated
     * - decoration: the decoration object that was created
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidChangeDecoration',
    value: function onDidChangeDecoration(callback) {
      return this.emitter.on('did-change-decoration', callback);
    }

    /**
     * Registers an event listener to the `did-change-decoration-range` event.
     *
     * This event is triggered when the marker range targeted by the decoration
     * was changed.
     *
     * @param  {function(event:Object):void} callback a function to call when the
     *                                               event is triggered.
     *                                               the callback will be called
     *                                               with an event object with
     *                                               the following properties:
     * - marker: the marker object that was decorated
     * - decoration: the decoration object that was created
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidChangeDecorationRange',
    value: function onDidChangeDecorationRange(callback) {
      return this.emitter.on('did-change-decoration-range', callback);
    }

    /**
     * Registers an event listener to the `did-update-decoration` event.
     *
     * This event is triggered when the decoration itself is modified.
     *
     * @param  {function(decoration:Decoration):void} callback a function to call
     *                                                         when the event is
     *                                                         triggered
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidUpdateDecoration',
    value: function onDidUpdateDecoration(callback) {
      return this.emitter.on('did-update-decoration', callback);
    }

    /**
     * Returns the decoration with the passed-in id.
     *
     * @param  {number} id the decoration id
     * @return {Decoration} the decoration with the given id
     */
  }, {
    key: 'decorationForId',
    value: function decorationForId(id) {
      return this.decorationsById[id];
    }

    /**
     * Returns all the decorations that intersect the passed-in row range.
     *
     * @param  {number} startScreenRow the first row of the range
     * @param  {number} endScreenRow the last row of the range
     * @return {Array<Decoration>} the decorations that intersect the passed-in
     *                             range
     */
  }, {
    key: 'decorationsForScreenRowRange',
    value: function decorationsForScreenRowRange(startScreenRow, endScreenRow) {
      var decorationsByMarkerId = {};
      var markers = this.findMarkers({
        intersectsScreenRowRange: [startScreenRow, endScreenRow]
      });

      for (var i = 0, len = markers.length; i < len; i++) {
        var marker = markers[i];
        var decorations = this.decorationsByMarkerId[marker.id];

        if (decorations != null) {
          decorationsByMarkerId[marker.id] = decorations;
        }
      }

      return decorationsByMarkerId;
    }

    /**
     * Returns the decorations that intersects the passed-in row range
     * in a structured way.
     *
     * At the first level, the keys are the available decoration types.
     * At the second level, the keys are the row index for which there
     * are decorations available. The value is an array containing the
     * decorations that intersects with the corresponding row.
     *
     * @return {Object} the decorations grouped by type and then rows
     * @property {Object} line all the line decorations by row
     * @property {Array<Decoration>} line[row] all the line decorations
     *                                    at a given row
     * @property {Object} highlight-under all the highlight-under decorations
     *                                    by row
     * @property {Array<Decoration>} highlight-under[row] all the highlight-under
     *                                    decorations at a given row
     * @property {Object} highlight-over all the highlight-over decorations
     *                                    by row
     * @property {Array<Decoration>} highlight-over[row] all the highlight-over
     *                                    decorations at a given row
     * @property {Object} highlight-outine all the highlight-outine decorations
     *                                    by row
     * @property {Array<Decoration>} highlight-outine[row] all the
     *                                    highlight-outine decorations at a given
     *                                    row
     */
  }, {
    key: 'decorationsByTypeThenRows',
    value: function decorationsByTypeThenRows() {
      if (this.decorationsByTypeThenRowsCache != null) {
        return this.decorationsByTypeThenRowsCache;
      }

      var cache = {};
      for (var id in this.decorationsById) {
        var decoration = this.decorationsById[id];
        var range = decoration.marker.getScreenRange();
        var type = decoration.getProperties().type;

        if (cache[type] == null) {
          cache[type] = {};
        }

        for (var row = range.start.row, len = range.end.row; row <= len; row++) {
          if (cache[type][row] == null) {
            cache[type][row] = [];
          }

          cache[type][row].push(decoration);
        }
      }

      /**
       * The grouped decorations cache.
       * @type {Object}
       * @access private
       */
      this.decorationsByTypeThenRowsCache = cache;
      return cache;
    }

    /**
     * Invalidates the decoration by screen rows cache.
     */
  }, {
    key: 'invalidateDecorationForScreenRowsCache',
    value: function invalidateDecorationForScreenRowsCache() {
      this.decorationsByTypeThenRowsCache = null;
    }

    /**
     * Adds a decoration that tracks a `Marker`. When the marker moves,
     * is invalidated, or is destroyed, the decoration will be updated to reflect
     * the marker's state.
     *
     * @param  {Marker} marker the marker you want this decoration to follow
     * @param  {Object} decorationParams the decoration properties
     * @param  {string} decorationParams.type the decoration type in the following
     *                                        list:
     * - __line__: Fills the line background with the decoration color.
     * - __highlight__: Renders a colored rectangle on the minimap. The highlight
     *   is rendered above the line's text.
     * - __highlight-over__: Same as __highlight__.
     * - __highlight-under__: Renders a colored rectangle on the minimap. The
     *   highlight is rendered below the line's text.
     * - __highlight-outline__: Renders a colored outline on the minimap. The
     *   highlight box is rendered above the line's text.
     * - __foreground-custom__: A decoration type for which you have the control
     *   over the render routine. Note that your routine should implement a render
     *   on a per-line basis to avoid any side-effect with the offset bitmap cache
     *   mechanism. These decorations are rendred on the foreground decorations
     *   layer.
     * - __background-custom__: A decoration type for which you have the control
     *   over the render routine. Note that your routine should implement a render
     *   on a per-line basis to avoid any side-effect with the offset bitmap cache
     *   mechanism. These decorations are rendred on the background decorations
     *   layer.
     * @param  {string} [decorationParams.class] the CSS class to use to retrieve
     *                                        the background color of the
     *                                        decoration by building a scop
     *                                        corresponding to
     *                                        `.minimap .editor <your-class>`
     * @param  {string} [decorationParams.scope] the scope to use to retrieve the
     *                                        decoration background. Note that if
     *                                        the `scope` property is set, the
     *                                        `class` won't be used.
     * @param  {string} [decorationParams.color] the CSS color to use to render
     *                                           the decoration. When set, neither
     *                                           `scope` nor `class` are used.
     * @param  {string} [decorationParams.plugin] the name of the plugin that
     *                                            created this decoration. It'll
     *                                            be used to order the decorations
     *                                            on the same layer and that are
     *                                            overlapping. If the parameter is
     *                                            omitted the Minimap will attempt
     *                                            to infer the plugin origin from
     *                                            the path of the caller function.
     * @param  {function} [decorationParams.render] the render routine for custom
     *                                              decorations. The function
     *                                              receives the decoration and
     *                                              the render data for the
     *                                              current render pass.
     * @return {Decoration} the created decoration
     * @emits  {did-add-decoration} when the decoration is created successfully
     * @emits  {did-change} when the decoration is created successfully
     */
  }, {
    key: 'decorateMarker',
    value: function decorateMarker(marker, decorationParams) {
      var _this = this;

      if (this.destroyed || marker == null) {
        return;
      }

      var id = marker.id;

      if (decorationParams.type === 'highlight') {
        decorationParams.type = 'highlight-over';
      }

      var type = decorationParams.type;
      var plugin = decorationParams.plugin;

      if (plugin == null) {
        decorationParams.plugin = this.getOriginatorPackageName();
      }

      if (decorationParams.scope == null && decorationParams['class'] != null) {
        var cls = decorationParams['class'].split(' ').join('.');
        decorationParams.scope = '.minimap .' + cls;
      }

      if (this.decorationMarkerDestroyedSubscriptions[id] == null) {
        this.decorationMarkerDestroyedSubscriptions[id] = marker.onDidDestroy(function () {
          _this.removeAllDecorationsForMarker(marker);
        });
      }

      if (this.decorationMarkerChangedSubscriptions[id] == null) {
        this.decorationMarkerChangedSubscriptions[id] = marker.onDidChange(function (event) {
          var decorations = _this.decorationsByMarkerId[id];

          _this.invalidateDecorationForScreenRowsCache();

          if (decorations != null) {
            for (var i = 0, len = decorations.length; i < len; i++) {
              var _decoration = decorations[i];
              _this.emitter.emit('did-change-decoration', {
                marker: marker,
                decoration: _decoration,
                event: event
              });
            }
          }
          var oldStart = event.oldTailScreenPosition;
          var oldEnd = event.oldHeadScreenPosition;
          var newStart = event.newTailScreenPosition;
          var newEnd = event.newHeadScreenPosition;

          if (oldStart.row > oldEnd.row) {
            var _ref = [oldEnd, oldStart];
            oldStart = _ref[0];
            oldEnd = _ref[1];
          }
          if (newStart.row > newEnd.row) {
            var _ref2 = [newEnd, newStart];
            newStart = _ref2[0];
            newEnd = _ref2[1];
          }

          var rangesDiffs = _this.computeRangesDiffs(oldStart, oldEnd, newStart, newEnd);

          for (var i = 0, len = rangesDiffs.length; i < len; i++) {
            var _rangesDiffs$i = _slicedToArray(rangesDiffs[i], 2);

            var start = _rangesDiffs$i[0];
            var end = _rangesDiffs$i[1];

            _this.emitRangeChanges(type, {
              start: start,
              end: end
            }, 0);
          }
        });
      }

      var decoration = new _decoration3['default'](marker, this, decorationParams);

      if (this.decorationsByMarkerId[id] == null) {
        this.decorationsByMarkerId[id] = [];
      }

      this.decorationsByMarkerId[id].push(decoration);
      this.decorationsById[decoration.id] = decoration;

      if (this.decorationUpdatedSubscriptions[decoration.id] == null) {
        this.decorationUpdatedSubscriptions[decoration.id] = decoration.onDidChangeProperties(function (event) {
          _this.emitDecorationChanges(type, decoration);
        });
      }

      this.decorationDestroyedSubscriptions[decoration.id] = decoration.onDidDestroy(function () {
        _this.removeDecoration(decoration);
      });

      this.emitDecorationChanges(type, decoration);
      this.emitter.emit('did-add-decoration', {
        marker: marker,
        decoration: decoration
      });

      return decoration;
    }
  }, {
    key: 'getOriginatorPackageName',
    value: function getOriginatorPackageName() {
      var line = new Error().stack.split('\n')[3];
      var filePath = line.split('(')[1].replace(')', '');
      var re = new RegExp(atom.packages.getPackageDirPaths().join('|') + _underscorePlus2['default'].escapeRegExp(_path2['default'].sep));
      var plugin = filePath.replace(re, '').split(_path2['default'].sep)[0].replace(/minimap-|-minimap/, '');
      return plugin.indexOf(_path2['default'].sep) < 0 ? plugin : undefined;
    }

    /**
     * Given two ranges, it returns an array of ranges representing the
     * differences between them.
     *
     * @param  {number} oldStart the row index of the first range start
     * @param  {number} oldEnd the row index of the first range end
     * @param  {number} newStart the row index of the second range start
     * @param  {number} newEnd the row index of the second range end
     * @return {Array<Object>} the array of diff ranges
     * @access private
     */
  }, {
    key: 'computeRangesDiffs',
    value: function computeRangesDiffs(oldStart, oldEnd, newStart, newEnd) {
      var diffs = [];

      if (oldStart.isLessThan(newStart)) {
        diffs.push([oldStart, newStart]);
      } else if (newStart.isLessThan(oldStart)) {
        diffs.push([newStart, oldStart]);
      }

      if (oldEnd.isLessThan(newEnd)) {
        diffs.push([oldEnd, newEnd]);
      } else if (newEnd.isLessThan(oldEnd)) {
        diffs.push([newEnd, oldEnd]);
      }

      return diffs;
    }

    /**
     * Emits a change in the `Minimap` corresponding to the
     * passed-in decoration.
     *
     * @param  {string} type the type of decoration that changed
     * @param  {Decoration} decoration the decoration for which emitting an event
     * @access private
     */
  }, {
    key: 'emitDecorationChanges',
    value: function emitDecorationChanges(type, decoration) {
      if (this.textEditor.isDestroyed()) {
        return;
      }

      this.invalidateDecorationForScreenRowsCache();

      var range = decoration.marker.getScreenRange();
      if (range == null) {
        return;
      }

      this.emitRangeChanges(type, range, 0);
    }

    /**
     * Emits a change for the specified range.
     *
     * @param  {string} type the type of decoration that changed
     * @param  {Object} range the range where changes occured
     * @param  {number} [screenDelta] an optional screen delta for the
     *                                change object
     * @access private
     */
  }, {
    key: 'emitRangeChanges',
    value: function emitRangeChanges(type, range, screenDelta) {
      var startScreenRow = range.start.row;
      var endScreenRow = range.end.row;
      var lastRenderedScreenRow = this.getLastVisibleScreenRow();
      var firstRenderedScreenRow = this.getFirstVisibleScreenRow();

      if (screenDelta == null) {
        screenDelta = lastRenderedScreenRow - firstRenderedScreenRow - (endScreenRow - startScreenRow);
      }

      var changeEvent = {
        start: startScreenRow,
        end: endScreenRow,
        screenDelta: screenDelta,
        type: type
      };

      this.emitter.emit('did-change-decoration-range', changeEvent);
    }

    /**
     * Removes a `Decoration` from this minimap.
     *
     * @param  {Decoration} decoration the decoration to remove
     * @emits  {did-change} when the decoration is removed
     * @emits  {did-remove-decoration} when the decoration is removed
     */
  }, {
    key: 'removeDecoration',
    value: function removeDecoration(decoration) {
      if (decoration == null) {
        return;
      }

      var marker = decoration.marker;
      var subscription = undefined;

      delete this.decorationsById[decoration.id];

      subscription = this.decorationUpdatedSubscriptions[decoration.id];
      if (subscription != null) {
        subscription.dispose();
      }

      subscription = this.decorationDestroyedSubscriptions[decoration.id];
      if (subscription != null) {
        subscription.dispose();
      }

      delete this.decorationUpdatedSubscriptions[decoration.id];
      delete this.decorationDestroyedSubscriptions[decoration.id];

      var decorations = this.decorationsByMarkerId[marker.id];
      if (!decorations) {
        return;
      }

      this.emitDecorationChanges(decoration.getProperties().type, decoration);

      var index = decorations.indexOf(decoration);
      if (index > -1) {
        decorations.splice(index, 1);

        this.emitter.emit('did-remove-decoration', {
          marker: marker,
          decoration: decoration
        });

        if (decorations.length === 0) {
          this.removedAllMarkerDecorations(marker);
        }
      }
    }

    /**
     * Removes all the decorations registered for the passed-in marker.
     *
     * @param  {Marker} marker the marker for which removing its decorations
     * @emits  {did-change} when a decoration have been removed
     * @emits  {did-remove-decoration} when a decoration have been removed
     */
  }, {
    key: 'removeAllDecorationsForMarker',
    value: function removeAllDecorationsForMarker(marker) {
      if (marker == null) {
        return;
      }

      var decorations = this.decorationsByMarkerId[marker.id];
      if (!decorations) {
        return;
      }

      for (var i = 0, len = decorations.length; i < len; i++) {
        var decoration = decorations[i];

        this.emitDecorationChanges(decoration.getProperties().type, decoration);
        this.emitter.emit('did-remove-decoration', {
          marker: marker,
          decoration: decoration
        });
      }

      this.removedAllMarkerDecorations(marker);
    }

    /**
     * Performs the removal of a decoration for a given marker.
     *
     * @param  {Marker} marker the marker for which removing decorations
     * @access private
     */
  }, {
    key: 'removedAllMarkerDecorations',
    value: function removedAllMarkerDecorations(marker) {
      if (marker == null) {
        return;
      }

      this.decorationMarkerChangedSubscriptions[marker.id].dispose();
      this.decorationMarkerDestroyedSubscriptions[marker.id].dispose();

      delete this.decorationsByMarkerId[marker.id];
      delete this.decorationMarkerChangedSubscriptions[marker.id];
      delete this.decorationMarkerDestroyedSubscriptions[marker.id];
    }

    /**
     * Removes all the decorations that was created in the current `Minimap`.
     */
  }, {
    key: 'removeAllDecorations',
    value: function removeAllDecorations() {
      for (var id in this.decorationMarkerChangedSubscriptions) {
        this.decorationMarkerChangedSubscriptions[id].dispose();
      }

      for (var id in this.decorationMarkerDestroyedSubscriptions) {
        this.decorationMarkerDestroyedSubscriptions[id].dispose();
      }

      for (var id in this.decorationUpdatedSubscriptions) {
        this.decorationUpdatedSubscriptions[id].dispose();
      }

      for (var id in this.decorationDestroyedSubscriptions) {
        this.decorationDestroyedSubscriptions[id].dispose();
      }

      for (var id in this.decorationsById) {
        this.decorationsById[id].destroy();
      }

      this.decorationsById = {};
      this.decorationsByMarkerId = {};
      this.decorationMarkerChangedSubscriptions = {};
      this.decorationMarkerDestroyedSubscriptions = {};
      this.decorationUpdatedSubscriptions = {};
      this.decorationDestroyedSubscriptions = {};
    }
  }]);

  return DecorationManagement;
})(_mixto2['default']);

exports['default'] = DecorationManagement;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvbWl4aW5zL2RlY29yYXRpb24tbWFuYWdlbWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OzhCQUVjLGlCQUFpQjs7OztvQkFDZCxNQUFNOzs7O3FCQUNMLE9BQU87Ozs7b0JBQ0gsTUFBTTs7MkJBQ0wsZUFBZTs7Ozs7Ozs7Ozs7QUFOdEMsV0FBVyxDQUFBOztJQWVVLG9CQUFvQjtZQUFwQixvQkFBb0I7O1dBQXBCLG9CQUFvQjswQkFBcEIsb0JBQW9COzsrQkFBcEIsb0JBQW9COzs7ZUFBcEIsb0JBQW9COzs7Ozs7V0FLakIsaUNBQUc7QUFDdkIsVUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksRUFBRTs7Ozs7O0FBTXhCLFlBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQTtPQUM3Qjs7Ozs7OztBQU9ELFVBQUksQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFBOzs7Ozs7QUFNekIsVUFBSSxDQUFDLHFCQUFxQixHQUFHLEVBQUUsQ0FBQTs7Ozs7OztBQU8vQixVQUFJLENBQUMsb0NBQW9DLEdBQUcsRUFBRSxDQUFBOzs7Ozs7O0FBTzlDLFVBQUksQ0FBQyxzQ0FBc0MsR0FBRyxFQUFFLENBQUE7Ozs7Ozs7QUFPaEQsVUFBSSxDQUFDLDhCQUE4QixHQUFHLEVBQUUsQ0FBQTs7Ozs7OztBQU94QyxVQUFJLENBQUMsZ0NBQWdDLEdBQUcsRUFBRSxDQUFBO0tBQzNDOzs7Ozs7Ozs7V0FPYywwQkFBRztBQUNoQixVQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFBO0FBQ3RDLFVBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQTs7QUFFaEIsV0FBSyxJQUFJLEVBQUUsSUFBSSxXQUFXLEVBQUU7QUFBRSxlQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO09BQUU7O0FBRTdELGFBQU8sT0FBTyxDQUFBO0tB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QUcsRUFBRSxDQUFBO0FBQzlDLFVBQUksQ0FBQyxzQ0FBc0MsR0FBRyxFQUFFLENBQUE7QUFDaEQsVUFBSSxDQUFDLDhCQUE4QixHQUFHLEVBQUUsQ0FBQTtBQUN4QyxVQUFJLENBQUMsZ0NBQWdDLEdBQUcsRUFBRSxDQUFBO0tBQzNDOzs7U0F4bUJrQixvQkFBb0I7OztxQkFBcEIsb0JBQW9CIiwiZmlsZSI6Ii9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvbWl4aW5zL2RlY29yYXRpb24tbWFuYWdlbWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUtcGx1cydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgTWl4aW4gZnJvbSAnbWl4dG8nXG5pbXBvcnQge0VtaXR0ZXJ9IGZyb20gJ2F0b20nXG5pbXBvcnQgRGVjb3JhdGlvbiBmcm9tICcuLi9kZWNvcmF0aW9uJ1xuXG4vKipcbiAqIFRoZSBtaXhpbiB0aGF0IHByb3ZpZGVzIHRoZSBkZWNvcmF0aW9ucyBBUEkgdG8gdGhlIG1pbmltYXAgZWRpdG9yXG4gKiB2aWV3LlxuICpcbiAqIFRoaXMgbWl4aW4gaXMgaW5qZWN0ZWQgaW50byB0aGUgYE1pbmltYXBgIHByb3RvdHlwZSwgc28gZXZlcnkgbWV0aG9kcyBkZWZpbmVkXG4gKiBpbiB0aGlzIGZpbGUgd2lsbCBiZSBhdmFpbGFibGUgb24gYW55IGBNaW5pbWFwYCBpbnN0YW5jZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVjb3JhdGlvbk1hbmFnZW1lbnQgZXh0ZW5kcyBNaXhpbiB7XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBkZWNvcmF0aW9ucyByZWxhdGVkIHByb3BlcnRpZXMuXG4gICAqL1xuICBpbml0aWFsaXplRGVjb3JhdGlvbnMgKCkge1xuICAgIGlmICh0aGlzLmVtaXR0ZXIgPT0gbnVsbCkge1xuICAgICAgLyoqXG4gICAgICAgKiBUaGUgbWluaW1hcCBlbWl0dGVyLCBsYXppbHkgY3JlYXRlZCBpZiBub3QgY3JlYXRlZCB5ZXQuXG4gICAgICAgKiBAdHlwZSB7RW1pdHRlcn1cbiAgICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAgICovXG4gICAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBtYXAgd2l0aCB0aGUgZGVjb3JhdGlvbiBpZCBhcyBrZXkgYW5kIHRoZSBkZWNvcmF0aW9uIGFzIHZhbHVlLlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5kZWNvcmF0aW9uc0J5SWQgPSB7fVxuICAgIC8qKlxuICAgICAqIFRoZSBkZWNvcmF0aW9ucyBzdG9yZWQgaW4gYW4gYXJyYXkgaW5kZXhlZCB3aXRoIHRoZWlyIG1hcmtlciBpZC5cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuZGVjb3JhdGlvbnNCeU1hcmtlcklkID0ge31cbiAgICAvKipcbiAgICAgKiBUaGUgc3Vic2NyaXB0aW9ucyB0byB0aGUgbWFya2VycyBgZGlkLWNoYW5nZWAgZXZlbnQgaW5kZXhlZCB1c2luZyB0aGVcbiAgICAgKiBtYXJrZXIgaWQuXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmRlY29yYXRpb25NYXJrZXJDaGFuZ2VkU3Vic2NyaXB0aW9ucyA9IHt9XG4gICAgLyoqXG4gICAgICogVGhlIHN1YnNjcmlwdGlvbnMgdG8gdGhlIG1hcmtlcnMgYGRpZC1kZXN0cm95YCBldmVudCBpbmRleGVkIHVzaW5nIHRoZVxuICAgICAqIG1hcmtlciBpZC5cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuZGVjb3JhdGlvbk1hcmtlckRlc3Ryb3llZFN1YnNjcmlwdGlvbnMgPSB7fVxuICAgIC8qKlxuICAgICAqIFRoZSBzdWJzY3JpcHRpb25zIHRvIHRoZSBkZWNvcmF0aW9ucyBgZGlkLWNoYW5nZS1wcm9wZXJ0aWVzYCBldmVudFxuICAgICAqIGluZGV4ZWQgdXNpbmcgdGhlIGRlY29yYXRpb24gaWQuXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmRlY29yYXRpb25VcGRhdGVkU3Vic2NyaXB0aW9ucyA9IHt9XG4gICAgLyoqXG4gICAgICogVGhlIHN1YnNjcmlwdGlvbnMgdG8gdGhlIGRlY29yYXRpb25zIGBkaWQtZGVzdHJveWAgZXZlbnQgaW5kZXhlZCB1c2luZ1xuICAgICAqIHRoZSBkZWNvcmF0aW9uIGlkLlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5kZWNvcmF0aW9uRGVzdHJveWVkU3Vic2NyaXB0aW9ucyA9IHt9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbGwgdGhlIGRlY29yYXRpb25zIHJlZ2lzdGVyZWQgaW4gdGhlIGN1cnJlbnQgYE1pbmltYXBgLlxuICAgKlxuICAgKiBAcmV0dXJuIHtBcnJheTxEZWNvcmF0aW9uPn0gYWxsIHRoZSBkZWNvcmF0aW9ucyBpbiB0aGlzIGBNaW5pbWFwYFxuICAgKi9cbiAgZ2V0RGVjb3JhdGlvbnMgKCkge1xuICAgIGxldCBkZWNvcmF0aW9ucyA9IHRoaXMuZGVjb3JhdGlvbnNCeUlkXG4gICAgbGV0IHJlc3VsdHMgPSBbXVxuXG4gICAgZm9yIChsZXQgaWQgaW4gZGVjb3JhdGlvbnMpIHsgcmVzdWx0cy5wdXNoKGRlY29yYXRpb25zW2lkXSkgfVxuXG4gICAgcmV0dXJuIHJlc3VsdHNcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYW4gZXZlbnQgbGlzdGVuZXIgdG8gdGhlIGBkaWQtYWRkLWRlY29yYXRpb25gIGV2ZW50LlxuICAgKlxuICAgKiBAcGFyYW0gIHtmdW5jdGlvbihldmVudDpPYmplY3QpOnZvaWR9IGNhbGxiYWNrIGEgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQgaXMgdHJpZ2dlcmVkLlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aXRoIGFuIGV2ZW50IG9iamVjdCB3aXRoXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gICAqIC0gbWFya2VyOiB0aGUgbWFya2VyIG9iamVjdCB0aGF0IHdhcyBkZWNvcmF0ZWRcbiAgICogLSBkZWNvcmF0aW9uOiB0aGUgZGVjb3JhdGlvbiBvYmplY3QgdGhhdCB3YXMgY3JlYXRlZFxuICAgKiBAcmV0dXJuIHtEaXNwb3NhYmxlfSBhIGRpc3Bvc2FibGUgdG8gc3RvcCBsaXN0ZW5pbmcgdG8gdGhlIGV2ZW50XG4gICAqL1xuICBvbkRpZEFkZERlY29yYXRpb24gKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWFkZC1kZWNvcmF0aW9uJywgY2FsbGJhY2spXG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSBgZGlkLXJlbW92ZS1kZWNvcmF0aW9uYCBldmVudC5cbiAgICpcbiAgICogQHBhcmFtICB7ZnVuY3Rpb24oZXZlbnQ6T2JqZWN0KTp2b2lkfSBjYWxsYmFjayBhIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiB0aGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50IGlzIHRyaWdnZXJlZC5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2l0aCBhbiBldmVudCBvYmplY3Qgd2l0aFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICAgKiAtIG1hcmtlcjogdGhlIG1hcmtlciBvYmplY3QgdGhhdCB3YXMgZGVjb3JhdGVkXG4gICAqIC0gZGVjb3JhdGlvbjogdGhlIGRlY29yYXRpb24gb2JqZWN0IHRoYXQgd2FzIGNyZWF0ZWRcbiAgICogQHJldHVybiB7RGlzcG9zYWJsZX0gYSBkaXNwb3NhYmxlIHRvIHN0b3AgbGlzdGVuaW5nIHRvIHRoZSBldmVudFxuICAgKi9cbiAgb25EaWRSZW1vdmVEZWNvcmF0aW9uIChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1yZW1vdmUtZGVjb3JhdGlvbicsIGNhbGxiYWNrKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhbiBldmVudCBsaXN0ZW5lciB0byB0aGUgYGRpZC1jaGFuZ2UtZGVjb3JhdGlvbmAgZXZlbnQuXG4gICAqXG4gICAqIFRoaXMgZXZlbnQgaXMgdHJpZ2dlcmVkIHdoZW4gdGhlIG1hcmtlciB0YXJnZXRlZCBieSB0aGUgZGVjb3JhdGlvblxuICAgKiB3YXMgY2hhbmdlZC5cbiAgICpcbiAgICogQHBhcmFtICB7ZnVuY3Rpb24oZXZlbnQ6T2JqZWN0KTp2b2lkfSBjYWxsYmFjayBhIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiB0aGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50IGlzIHRyaWdnZXJlZC5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2l0aCBhbiBldmVudCBvYmplY3Qgd2l0aFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICAgKiAtIG1hcmtlcjogdGhlIG1hcmtlciBvYmplY3QgdGhhdCB3YXMgZGVjb3JhdGVkXG4gICAqIC0gZGVjb3JhdGlvbjogdGhlIGRlY29yYXRpb24gb2JqZWN0IHRoYXQgd2FzIGNyZWF0ZWRcbiAgICogQHJldHVybiB7RGlzcG9zYWJsZX0gYSBkaXNwb3NhYmxlIHRvIHN0b3AgbGlzdGVuaW5nIHRvIHRoZSBldmVudFxuICAgKi9cbiAgb25EaWRDaGFuZ2VEZWNvcmF0aW9uIChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtZGVjb3JhdGlvbicsIGNhbGxiYWNrKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhbiBldmVudCBsaXN0ZW5lciB0byB0aGUgYGRpZC1jaGFuZ2UtZGVjb3JhdGlvbi1yYW5nZWAgZXZlbnQuXG4gICAqXG4gICAqIFRoaXMgZXZlbnQgaXMgdHJpZ2dlcmVkIHdoZW4gdGhlIG1hcmtlciByYW5nZSB0YXJnZXRlZCBieSB0aGUgZGVjb3JhdGlvblxuICAgKiB3YXMgY2hhbmdlZC5cbiAgICpcbiAgICogQHBhcmFtICB7ZnVuY3Rpb24oZXZlbnQ6T2JqZWN0KTp2b2lkfSBjYWxsYmFjayBhIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiB0aGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50IGlzIHRyaWdnZXJlZC5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2l0aCBhbiBldmVudCBvYmplY3Qgd2l0aFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICAgKiAtIG1hcmtlcjogdGhlIG1hcmtlciBvYmplY3QgdGhhdCB3YXMgZGVjb3JhdGVkXG4gICAqIC0gZGVjb3JhdGlvbjogdGhlIGRlY29yYXRpb24gb2JqZWN0IHRoYXQgd2FzIGNyZWF0ZWRcbiAgICogQHJldHVybiB7RGlzcG9zYWJsZX0gYSBkaXNwb3NhYmxlIHRvIHN0b3AgbGlzdGVuaW5nIHRvIHRoZSBldmVudFxuICAgKi9cbiAgb25EaWRDaGFuZ2VEZWNvcmF0aW9uUmFuZ2UgKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS1kZWNvcmF0aW9uLXJhbmdlJywgY2FsbGJhY2spXG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSBgZGlkLXVwZGF0ZS1kZWNvcmF0aW9uYCBldmVudC5cbiAgICpcbiAgICogVGhpcyBldmVudCBpcyB0cmlnZ2VyZWQgd2hlbiB0aGUgZGVjb3JhdGlvbiBpdHNlbGYgaXMgbW9kaWZpZWQuXG4gICAqXG4gICAqIEBwYXJhbSAge2Z1bmN0aW9uKGRlY29yYXRpb246RGVjb3JhdGlvbik6dm9pZH0gY2FsbGJhY2sgYSBmdW5jdGlvbiB0byBjYWxsXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiB0aGUgZXZlbnQgaXNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyZWRcbiAgICogQHJldHVybiB7RGlzcG9zYWJsZX0gYSBkaXNwb3NhYmxlIHRvIHN0b3AgbGlzdGVuaW5nIHRvIHRoZSBldmVudFxuICAgKi9cbiAgb25EaWRVcGRhdGVEZWNvcmF0aW9uIChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC11cGRhdGUtZGVjb3JhdGlvbicsIGNhbGxiYWNrKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGRlY29yYXRpb24gd2l0aCB0aGUgcGFzc2VkLWluIGlkLlxuICAgKlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGlkIHRoZSBkZWNvcmF0aW9uIGlkXG4gICAqIEByZXR1cm4ge0RlY29yYXRpb259IHRoZSBkZWNvcmF0aW9uIHdpdGggdGhlIGdpdmVuIGlkXG4gICAqL1xuICBkZWNvcmF0aW9uRm9ySWQgKGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuZGVjb3JhdGlvbnNCeUlkW2lkXVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYWxsIHRoZSBkZWNvcmF0aW9ucyB0aGF0IGludGVyc2VjdCB0aGUgcGFzc2VkLWluIHJvdyByYW5nZS5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSBzdGFydFNjcmVlblJvdyB0aGUgZmlyc3Qgcm93IG9mIHRoZSByYW5nZVxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGVuZFNjcmVlblJvdyB0aGUgbGFzdCByb3cgb2YgdGhlIHJhbmdlXG4gICAqIEByZXR1cm4ge0FycmF5PERlY29yYXRpb24+fSB0aGUgZGVjb3JhdGlvbnMgdGhhdCBpbnRlcnNlY3QgdGhlIHBhc3NlZC1pblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmFuZ2VcbiAgICovXG4gIGRlY29yYXRpb25zRm9yU2NyZWVuUm93UmFuZ2UgKHN0YXJ0U2NyZWVuUm93LCBlbmRTY3JlZW5Sb3cpIHtcbiAgICBsZXQgZGVjb3JhdGlvbnNCeU1hcmtlcklkID0ge31cbiAgICBsZXQgbWFya2VycyA9IHRoaXMuZmluZE1hcmtlcnMoe1xuICAgICAgaW50ZXJzZWN0c1NjcmVlblJvd1JhbmdlOiBbc3RhcnRTY3JlZW5Sb3csIGVuZFNjcmVlblJvd11cbiAgICB9KVxuXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IG1hcmtlcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGxldCBtYXJrZXIgPSBtYXJrZXJzW2ldXG4gICAgICBsZXQgZGVjb3JhdGlvbnMgPSB0aGlzLmRlY29yYXRpb25zQnlNYXJrZXJJZFttYXJrZXIuaWRdXG5cbiAgICAgIGlmIChkZWNvcmF0aW9ucyAhPSBudWxsKSB7XG4gICAgICAgIGRlY29yYXRpb25zQnlNYXJrZXJJZFttYXJrZXIuaWRdID0gZGVjb3JhdGlvbnNcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGVjb3JhdGlvbnNCeU1hcmtlcklkXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZGVjb3JhdGlvbnMgdGhhdCBpbnRlcnNlY3RzIHRoZSBwYXNzZWQtaW4gcm93IHJhbmdlXG4gICAqIGluIGEgc3RydWN0dXJlZCB3YXkuXG4gICAqXG4gICAqIEF0IHRoZSBmaXJzdCBsZXZlbCwgdGhlIGtleXMgYXJlIHRoZSBhdmFpbGFibGUgZGVjb3JhdGlvbiB0eXBlcy5cbiAgICogQXQgdGhlIHNlY29uZCBsZXZlbCwgdGhlIGtleXMgYXJlIHRoZSByb3cgaW5kZXggZm9yIHdoaWNoIHRoZXJlXG4gICAqIGFyZSBkZWNvcmF0aW9ucyBhdmFpbGFibGUuIFRoZSB2YWx1ZSBpcyBhbiBhcnJheSBjb250YWluaW5nIHRoZVxuICAgKiBkZWNvcmF0aW9ucyB0aGF0IGludGVyc2VjdHMgd2l0aCB0aGUgY29ycmVzcG9uZGluZyByb3cuXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gdGhlIGRlY29yYXRpb25zIGdyb3VwZWQgYnkgdHlwZSBhbmQgdGhlbiByb3dzXG4gICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBsaW5lIGFsbCB0aGUgbGluZSBkZWNvcmF0aW9ucyBieSByb3dcbiAgICogQHByb3BlcnR5IHtBcnJheTxEZWNvcmF0aW9uPn0gbGluZVtyb3ddIGFsbCB0aGUgbGluZSBkZWNvcmF0aW9uc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0IGEgZ2l2ZW4gcm93XG4gICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBoaWdobGlnaHQtdW5kZXIgYWxsIHRoZSBoaWdobGlnaHQtdW5kZXIgZGVjb3JhdGlvbnNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBieSByb3dcbiAgICogQHByb3BlcnR5IHtBcnJheTxEZWNvcmF0aW9uPn0gaGlnaGxpZ2h0LXVuZGVyW3Jvd10gYWxsIHRoZSBoaWdobGlnaHQtdW5kZXJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNvcmF0aW9ucyBhdCBhIGdpdmVuIHJvd1xuICAgKiBAcHJvcGVydHkge09iamVjdH0gaGlnaGxpZ2h0LW92ZXIgYWxsIHRoZSBoaWdobGlnaHQtb3ZlciBkZWNvcmF0aW9uc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ5IHJvd1xuICAgKiBAcHJvcGVydHkge0FycmF5PERlY29yYXRpb24+fSBoaWdobGlnaHQtb3Zlcltyb3ddIGFsbCB0aGUgaGlnaGxpZ2h0LW92ZXJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNvcmF0aW9ucyBhdCBhIGdpdmVuIHJvd1xuICAgKiBAcHJvcGVydHkge09iamVjdH0gaGlnaGxpZ2h0LW91dGluZSBhbGwgdGhlIGhpZ2hsaWdodC1vdXRpbmUgZGVjb3JhdGlvbnNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBieSByb3dcbiAgICogQHByb3BlcnR5IHtBcnJheTxEZWNvcmF0aW9uPn0gaGlnaGxpZ2h0LW91dGluZVtyb3ddIGFsbCB0aGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHQtb3V0aW5lIGRlY29yYXRpb25zIGF0IGEgZ2l2ZW5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dcbiAgICovXG4gIGRlY29yYXRpb25zQnlUeXBlVGhlblJvd3MgKCkge1xuICAgIGlmICh0aGlzLmRlY29yYXRpb25zQnlUeXBlVGhlblJvd3NDYWNoZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWNvcmF0aW9uc0J5VHlwZVRoZW5Sb3dzQ2FjaGVcbiAgICB9XG5cbiAgICBsZXQgY2FjaGUgPSB7fVxuICAgIGZvciAobGV0IGlkIGluIHRoaXMuZGVjb3JhdGlvbnNCeUlkKSB7XG4gICAgICBsZXQgZGVjb3JhdGlvbiA9IHRoaXMuZGVjb3JhdGlvbnNCeUlkW2lkXVxuICAgICAgbGV0IHJhbmdlID0gZGVjb3JhdGlvbi5tYXJrZXIuZ2V0U2NyZWVuUmFuZ2UoKVxuICAgICAgbGV0IHR5cGUgPSBkZWNvcmF0aW9uLmdldFByb3BlcnRpZXMoKS50eXBlXG5cbiAgICAgIGlmIChjYWNoZVt0eXBlXSA9PSBudWxsKSB7IGNhY2hlW3R5cGVdID0ge30gfVxuXG4gICAgICBmb3IgKGxldCByb3cgPSByYW5nZS5zdGFydC5yb3csIGxlbiA9IHJhbmdlLmVuZC5yb3c7IHJvdyA8PSBsZW47IHJvdysrKSB7XG4gICAgICAgIGlmIChjYWNoZVt0eXBlXVtyb3ddID09IG51bGwpIHsgY2FjaGVbdHlwZV1bcm93XSA9IFtdIH1cblxuICAgICAgICBjYWNoZVt0eXBlXVtyb3ddLnB1c2goZGVjb3JhdGlvbilcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZ3JvdXBlZCBkZWNvcmF0aW9ucyBjYWNoZS5cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuZGVjb3JhdGlvbnNCeVR5cGVUaGVuUm93c0NhY2hlID0gY2FjaGVcbiAgICByZXR1cm4gY2FjaGVcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnZhbGlkYXRlcyB0aGUgZGVjb3JhdGlvbiBieSBzY3JlZW4gcm93cyBjYWNoZS5cbiAgICovXG4gIGludmFsaWRhdGVEZWNvcmF0aW9uRm9yU2NyZWVuUm93c0NhY2hlICgpIHtcbiAgICB0aGlzLmRlY29yYXRpb25zQnlUeXBlVGhlblJvd3NDYWNoZSA9IG51bGxcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgZGVjb3JhdGlvbiB0aGF0IHRyYWNrcyBhIGBNYXJrZXJgLiBXaGVuIHRoZSBtYXJrZXIgbW92ZXMsXG4gICAqIGlzIGludmFsaWRhdGVkLCBvciBpcyBkZXN0cm95ZWQsIHRoZSBkZWNvcmF0aW9uIHdpbGwgYmUgdXBkYXRlZCB0byByZWZsZWN0XG4gICAqIHRoZSBtYXJrZXIncyBzdGF0ZS5cbiAgICpcbiAgICogQHBhcmFtICB7TWFya2VyfSBtYXJrZXIgdGhlIG1hcmtlciB5b3Ugd2FudCB0aGlzIGRlY29yYXRpb24gdG8gZm9sbG93XG4gICAqIEBwYXJhbSAge09iamVjdH0gZGVjb3JhdGlvblBhcmFtcyB0aGUgZGVjb3JhdGlvbiBwcm9wZXJ0aWVzXG4gICAqIEBwYXJhbSAge3N0cmluZ30gZGVjb3JhdGlvblBhcmFtcy50eXBlIHRoZSBkZWNvcmF0aW9uIHR5cGUgaW4gdGhlIGZvbGxvd2luZ1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0OlxuICAgKiAtIF9fbGluZV9fOiBGaWxscyB0aGUgbGluZSBiYWNrZ3JvdW5kIHdpdGggdGhlIGRlY29yYXRpb24gY29sb3IuXG4gICAqIC0gX19oaWdobGlnaHRfXzogUmVuZGVycyBhIGNvbG9yZWQgcmVjdGFuZ2xlIG9uIHRoZSBtaW5pbWFwLiBUaGUgaGlnaGxpZ2h0XG4gICAqICAgaXMgcmVuZGVyZWQgYWJvdmUgdGhlIGxpbmUncyB0ZXh0LlxuICAgKiAtIF9faGlnaGxpZ2h0LW92ZXJfXzogU2FtZSBhcyBfX2hpZ2hsaWdodF9fLlxuICAgKiAtIF9faGlnaGxpZ2h0LXVuZGVyX186IFJlbmRlcnMgYSBjb2xvcmVkIHJlY3RhbmdsZSBvbiB0aGUgbWluaW1hcC4gVGhlXG4gICAqICAgaGlnaGxpZ2h0IGlzIHJlbmRlcmVkIGJlbG93IHRoZSBsaW5lJ3MgdGV4dC5cbiAgICogLSBfX2hpZ2hsaWdodC1vdXRsaW5lX186IFJlbmRlcnMgYSBjb2xvcmVkIG91dGxpbmUgb24gdGhlIG1pbmltYXAuIFRoZVxuICAgKiAgIGhpZ2hsaWdodCBib3ggaXMgcmVuZGVyZWQgYWJvdmUgdGhlIGxpbmUncyB0ZXh0LlxuICAgKiAtIF9fZm9yZWdyb3VuZC1jdXN0b21fXzogQSBkZWNvcmF0aW9uIHR5cGUgZm9yIHdoaWNoIHlvdSBoYXZlIHRoZSBjb250cm9sXG4gICAqICAgb3ZlciB0aGUgcmVuZGVyIHJvdXRpbmUuIE5vdGUgdGhhdCB5b3VyIHJvdXRpbmUgc2hvdWxkIGltcGxlbWVudCBhIHJlbmRlclxuICAgKiAgIG9uIGEgcGVyLWxpbmUgYmFzaXMgdG8gYXZvaWQgYW55IHNpZGUtZWZmZWN0IHdpdGggdGhlIG9mZnNldCBiaXRtYXAgY2FjaGVcbiAgICogICBtZWNoYW5pc20uIFRoZXNlIGRlY29yYXRpb25zIGFyZSByZW5kcmVkIG9uIHRoZSBmb3JlZ3JvdW5kIGRlY29yYXRpb25zXG4gICAqICAgbGF5ZXIuXG4gICAqIC0gX19iYWNrZ3JvdW5kLWN1c3RvbV9fOiBBIGRlY29yYXRpb24gdHlwZSBmb3Igd2hpY2ggeW91IGhhdmUgdGhlIGNvbnRyb2xcbiAgICogICBvdmVyIHRoZSByZW5kZXIgcm91dGluZS4gTm90ZSB0aGF0IHlvdXIgcm91dGluZSBzaG91bGQgaW1wbGVtZW50IGEgcmVuZGVyXG4gICAqICAgb24gYSBwZXItbGluZSBiYXNpcyB0byBhdm9pZCBhbnkgc2lkZS1lZmZlY3Qgd2l0aCB0aGUgb2Zmc2V0IGJpdG1hcCBjYWNoZVxuICAgKiAgIG1lY2hhbmlzbS4gVGhlc2UgZGVjb3JhdGlvbnMgYXJlIHJlbmRyZWQgb24gdGhlIGJhY2tncm91bmQgZGVjb3JhdGlvbnNcbiAgICogICBsYXllci5cbiAgICogQHBhcmFtICB7c3RyaW5nfSBbZGVjb3JhdGlvblBhcmFtcy5jbGFzc10gdGhlIENTUyBjbGFzcyB0byB1c2UgdG8gcmV0cmlldmVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIGJhY2tncm91bmQgY29sb3Igb2YgdGhlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlY29yYXRpb24gYnkgYnVpbGRpbmcgYSBzY29wXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvcnJlc3BvbmRpbmcgdG9cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYC5taW5pbWFwIC5lZGl0b3IgPHlvdXItY2xhc3M+YFxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IFtkZWNvcmF0aW9uUGFyYW1zLnNjb3BlXSB0aGUgc2NvcGUgdG8gdXNlIHRvIHJldHJpZXZlIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNvcmF0aW9uIGJhY2tncm91bmQuIE5vdGUgdGhhdCBpZlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgYHNjb3BlYCBwcm9wZXJ0eSBpcyBzZXQsIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgY2xhc3NgIHdvbid0IGJlIHVzZWQuXG4gICAqIEBwYXJhbSAge3N0cmluZ30gW2RlY29yYXRpb25QYXJhbXMuY29sb3JdIHRoZSBDU1MgY29sb3IgdG8gdXNlIHRvIHJlbmRlclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgZGVjb3JhdGlvbi4gV2hlbiBzZXQsIG5laXRoZXJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYHNjb3BlYCBub3IgYGNsYXNzYCBhcmUgdXNlZC5cbiAgICogQHBhcmFtICB7c3RyaW5nfSBbZGVjb3JhdGlvblBhcmFtcy5wbHVnaW5dIHRoZSBuYW1lIG9mIHRoZSBwbHVnaW4gdGhhdFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZCB0aGlzIGRlY29yYXRpb24uIEl0J2xsXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZSB1c2VkIHRvIG9yZGVyIHRoZSBkZWNvcmF0aW9uc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb24gdGhlIHNhbWUgbGF5ZXIgYW5kIHRoYXQgYXJlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdmVybGFwcGluZy4gSWYgdGhlIHBhcmFtZXRlciBpc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb21pdHRlZCB0aGUgTWluaW1hcCB3aWxsIGF0dGVtcHRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIGluZmVyIHRoZSBwbHVnaW4gb3JpZ2luIGZyb21cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBwYXRoIG9mIHRoZSBjYWxsZXIgZnVuY3Rpb24uXG4gICAqIEBwYXJhbSAge2Z1bmN0aW9ufSBbZGVjb3JhdGlvblBhcmFtcy5yZW5kZXJdIHRoZSByZW5kZXIgcm91dGluZSBmb3IgY3VzdG9tXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlY29yYXRpb25zLiBUaGUgZnVuY3Rpb25cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjZWl2ZXMgdGhlIGRlY29yYXRpb24gYW5kXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSByZW5kZXIgZGF0YSBmb3IgdGhlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQgcmVuZGVyIHBhc3MuXG4gICAqIEByZXR1cm4ge0RlY29yYXRpb259IHRoZSBjcmVhdGVkIGRlY29yYXRpb25cbiAgICogQGVtaXRzICB7ZGlkLWFkZC1kZWNvcmF0aW9ufSB3aGVuIHRoZSBkZWNvcmF0aW9uIGlzIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAqIEBlbWl0cyAge2RpZC1jaGFuZ2V9IHdoZW4gdGhlIGRlY29yYXRpb24gaXMgY3JlYXRlZCBzdWNjZXNzZnVsbHlcbiAgICovXG4gIGRlY29yYXRlTWFya2VyIChtYXJrZXIsIGRlY29yYXRpb25QYXJhbXMpIHtcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQgfHwgbWFya2VyID09IG51bGwpIHsgcmV0dXJuIH1cblxuICAgIGxldCB7aWR9ID0gbWFya2VyXG5cbiAgICBpZiAoZGVjb3JhdGlvblBhcmFtcy50eXBlID09PSAnaGlnaGxpZ2h0Jykge1xuICAgICAgZGVjb3JhdGlvblBhcmFtcy50eXBlID0gJ2hpZ2hsaWdodC1vdmVyJ1xuICAgIH1cblxuICAgIGNvbnN0IHt0eXBlLCBwbHVnaW59ID0gZGVjb3JhdGlvblBhcmFtc1xuXG4gICAgaWYgKHBsdWdpbiA9PSBudWxsKSB7XG4gICAgICBkZWNvcmF0aW9uUGFyYW1zLnBsdWdpbiA9IHRoaXMuZ2V0T3JpZ2luYXRvclBhY2thZ2VOYW1lKClcbiAgICB9XG5cbiAgICBpZiAoZGVjb3JhdGlvblBhcmFtcy5zY29wZSA9PSBudWxsICYmIGRlY29yYXRpb25QYXJhbXNbJ2NsYXNzJ10gIT0gbnVsbCkge1xuICAgICAgbGV0IGNscyA9IGRlY29yYXRpb25QYXJhbXNbJ2NsYXNzJ10uc3BsaXQoJyAnKS5qb2luKCcuJylcbiAgICAgIGRlY29yYXRpb25QYXJhbXMuc2NvcGUgPSBgLm1pbmltYXAgLiR7Y2xzfWBcbiAgICB9XG5cbiAgICBpZiAodGhpcy5kZWNvcmF0aW9uTWFya2VyRGVzdHJveWVkU3Vic2NyaXB0aW9uc1tpZF0gPT0gbnVsbCkge1xuICAgICAgdGhpcy5kZWNvcmF0aW9uTWFya2VyRGVzdHJveWVkU3Vic2NyaXB0aW9uc1tpZF0gPVxuICAgICAgbWFya2VyLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIHRoaXMucmVtb3ZlQWxsRGVjb3JhdGlvbnNGb3JNYXJrZXIobWFya2VyKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiAodGhpcy5kZWNvcmF0aW9uTWFya2VyQ2hhbmdlZFN1YnNjcmlwdGlvbnNbaWRdID09IG51bGwpIHtcbiAgICAgIHRoaXMuZGVjb3JhdGlvbk1hcmtlckNoYW5nZWRTdWJzY3JpcHRpb25zW2lkXSA9XG4gICAgICBtYXJrZXIub25EaWRDaGFuZ2UoKGV2ZW50KSA9PiB7XG4gICAgICAgIGxldCBkZWNvcmF0aW9ucyA9IHRoaXMuZGVjb3JhdGlvbnNCeU1hcmtlcklkW2lkXVxuXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZURlY29yYXRpb25Gb3JTY3JlZW5Sb3dzQ2FjaGUoKVxuXG4gICAgICAgIGlmIChkZWNvcmF0aW9ucyAhPSBudWxsKSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGRlY29yYXRpb25zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgZGVjb3JhdGlvbiA9IGRlY29yYXRpb25zW2ldXG4gICAgICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1kZWNvcmF0aW9uJywge1xuICAgICAgICAgICAgICBtYXJrZXI6IG1hcmtlcixcbiAgICAgICAgICAgICAgZGVjb3JhdGlvbjogZGVjb3JhdGlvbixcbiAgICAgICAgICAgICAgZXZlbnQ6IGV2ZW50XG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsZXQgb2xkU3RhcnQgPSBldmVudC5vbGRUYWlsU2NyZWVuUG9zaXRpb25cbiAgICAgICAgbGV0IG9sZEVuZCA9IGV2ZW50Lm9sZEhlYWRTY3JlZW5Qb3NpdGlvblxuICAgICAgICBsZXQgbmV3U3RhcnQgPSBldmVudC5uZXdUYWlsU2NyZWVuUG9zaXRpb25cbiAgICAgICAgbGV0IG5ld0VuZCA9IGV2ZW50Lm5ld0hlYWRTY3JlZW5Qb3NpdGlvblxuXG4gICAgICAgIGlmIChvbGRTdGFydC5yb3cgPiBvbGRFbmQucm93KSB7XG4gICAgICAgICAgW29sZFN0YXJ0LCBvbGRFbmRdID0gW29sZEVuZCwgb2xkU3RhcnRdXG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5ld1N0YXJ0LnJvdyA+IG5ld0VuZC5yb3cpIHtcbiAgICAgICAgICBbbmV3U3RhcnQsIG5ld0VuZF0gPSBbbmV3RW5kLCBuZXdTdGFydF1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCByYW5nZXNEaWZmcyA9IHRoaXMuY29tcHV0ZVJhbmdlc0RpZmZzKFxuICAgICAgICAgIG9sZFN0YXJ0LCBvbGRFbmQsXG4gICAgICAgICAgbmV3U3RhcnQsIG5ld0VuZFxuICAgICAgICApXG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHJhbmdlc0RpZmZzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgbGV0IFtzdGFydCwgZW5kXSA9IHJhbmdlc0RpZmZzW2ldXG4gICAgICAgICAgdGhpcy5lbWl0UmFuZ2VDaGFuZ2VzKHR5cGUsIHtcbiAgICAgICAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgICAgICAgIGVuZDogZW5kXG4gICAgICAgICAgfSwgMClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBsZXQgZGVjb3JhdGlvbiA9IG5ldyBEZWNvcmF0aW9uKG1hcmtlciwgdGhpcywgZGVjb3JhdGlvblBhcmFtcylcblxuICAgIGlmICh0aGlzLmRlY29yYXRpb25zQnlNYXJrZXJJZFtpZF0gPT0gbnVsbCkge1xuICAgICAgdGhpcy5kZWNvcmF0aW9uc0J5TWFya2VySWRbaWRdID0gW11cbiAgICB9XG5cbiAgICB0aGlzLmRlY29yYXRpb25zQnlNYXJrZXJJZFtpZF0ucHVzaChkZWNvcmF0aW9uKVxuICAgIHRoaXMuZGVjb3JhdGlvbnNCeUlkW2RlY29yYXRpb24uaWRdID0gZGVjb3JhdGlvblxuXG4gICAgaWYgKHRoaXMuZGVjb3JhdGlvblVwZGF0ZWRTdWJzY3JpcHRpb25zW2RlY29yYXRpb24uaWRdID09IG51bGwpIHtcbiAgICAgIHRoaXMuZGVjb3JhdGlvblVwZGF0ZWRTdWJzY3JpcHRpb25zW2RlY29yYXRpb24uaWRdID1cbiAgICAgIGRlY29yYXRpb24ub25EaWRDaGFuZ2VQcm9wZXJ0aWVzKChldmVudCkgPT4ge1xuICAgICAgICB0aGlzLmVtaXREZWNvcmF0aW9uQ2hhbmdlcyh0eXBlLCBkZWNvcmF0aW9uKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICB0aGlzLmRlY29yYXRpb25EZXN0cm95ZWRTdWJzY3JpcHRpb25zW2RlY29yYXRpb24uaWRdID1cbiAgICBkZWNvcmF0aW9uLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICB0aGlzLnJlbW92ZURlY29yYXRpb24oZGVjb3JhdGlvbilcbiAgICB9KVxuXG4gICAgdGhpcy5lbWl0RGVjb3JhdGlvbkNoYW5nZXModHlwZSwgZGVjb3JhdGlvbilcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWFkZC1kZWNvcmF0aW9uJywge1xuICAgICAgbWFya2VyOiBtYXJrZXIsXG4gICAgICBkZWNvcmF0aW9uOiBkZWNvcmF0aW9uXG4gICAgfSlcblxuICAgIHJldHVybiBkZWNvcmF0aW9uXG4gIH1cblxuICBnZXRPcmlnaW5hdG9yUGFja2FnZU5hbWUgKCkge1xuICAgIGNvbnN0IGxpbmUgPSBuZXcgRXJyb3IoKS5zdGFjay5zcGxpdCgnXFxuJylbM11cbiAgICBjb25zdCBmaWxlUGF0aCA9IGxpbmUuc3BsaXQoJygnKVsxXS5yZXBsYWNlKCcpJywgJycpXG4gICAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKFxuICAgICAgYXRvbS5wYWNrYWdlcy5nZXRQYWNrYWdlRGlyUGF0aHMoKS5qb2luKCd8JykgKyBfLmVzY2FwZVJlZ0V4cChwYXRoLnNlcClcbiAgICApXG4gICAgY29uc3QgcGx1Z2luID0gZmlsZVBhdGgucmVwbGFjZShyZSwgJycpLnNwbGl0KHBhdGguc2VwKVswXS5yZXBsYWNlKC9taW5pbWFwLXwtbWluaW1hcC8sICcnKVxuICAgIHJldHVybiBwbHVnaW4uaW5kZXhPZihwYXRoLnNlcCkgPCAwID8gcGx1Z2luIDogdW5kZWZpbmVkXG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gdHdvIHJhbmdlcywgaXQgcmV0dXJucyBhbiBhcnJheSBvZiByYW5nZXMgcmVwcmVzZW50aW5nIHRoZVxuICAgKiBkaWZmZXJlbmNlcyBiZXR3ZWVuIHRoZW0uXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0gb2xkU3RhcnQgdGhlIHJvdyBpbmRleCBvZiB0aGUgZmlyc3QgcmFuZ2Ugc3RhcnRcbiAgICogQHBhcmFtICB7bnVtYmVyfSBvbGRFbmQgdGhlIHJvdyBpbmRleCBvZiB0aGUgZmlyc3QgcmFuZ2UgZW5kXG4gICAqIEBwYXJhbSAge251bWJlcn0gbmV3U3RhcnQgdGhlIHJvdyBpbmRleCBvZiB0aGUgc2Vjb25kIHJhbmdlIHN0YXJ0XG4gICAqIEBwYXJhbSAge251bWJlcn0gbmV3RW5kIHRoZSByb3cgaW5kZXggb2YgdGhlIHNlY29uZCByYW5nZSBlbmRcbiAgICogQHJldHVybiB7QXJyYXk8T2JqZWN0Pn0gdGhlIGFycmF5IG9mIGRpZmYgcmFuZ2VzXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgY29tcHV0ZVJhbmdlc0RpZmZzIChvbGRTdGFydCwgb2xkRW5kLCBuZXdTdGFydCwgbmV3RW5kKSB7XG4gICAgbGV0IGRpZmZzID0gW11cblxuICAgIGlmIChvbGRTdGFydC5pc0xlc3NUaGFuKG5ld1N0YXJ0KSkge1xuICAgICAgZGlmZnMucHVzaChbb2xkU3RhcnQsIG5ld1N0YXJ0XSlcbiAgICB9IGVsc2UgaWYgKG5ld1N0YXJ0LmlzTGVzc1RoYW4ob2xkU3RhcnQpKSB7XG4gICAgICBkaWZmcy5wdXNoKFtuZXdTdGFydCwgb2xkU3RhcnRdKVxuICAgIH1cblxuICAgIGlmIChvbGRFbmQuaXNMZXNzVGhhbihuZXdFbmQpKSB7XG4gICAgICBkaWZmcy5wdXNoKFtvbGRFbmQsIG5ld0VuZF0pXG4gICAgfSBlbHNlIGlmIChuZXdFbmQuaXNMZXNzVGhhbihvbGRFbmQpKSB7XG4gICAgICBkaWZmcy5wdXNoKFtuZXdFbmQsIG9sZEVuZF0pXG4gICAgfVxuXG4gICAgcmV0dXJuIGRpZmZzXG4gIH1cblxuICAvKipcbiAgICogRW1pdHMgYSBjaGFuZ2UgaW4gdGhlIGBNaW5pbWFwYCBjb3JyZXNwb25kaW5nIHRvIHRoZVxuICAgKiBwYXNzZWQtaW4gZGVjb3JhdGlvbi5cbiAgICpcbiAgICogQHBhcmFtICB7c3RyaW5nfSB0eXBlIHRoZSB0eXBlIG9mIGRlY29yYXRpb24gdGhhdCBjaGFuZ2VkXG4gICAqIEBwYXJhbSAge0RlY29yYXRpb259IGRlY29yYXRpb24gdGhlIGRlY29yYXRpb24gZm9yIHdoaWNoIGVtaXR0aW5nIGFuIGV2ZW50XG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZW1pdERlY29yYXRpb25DaGFuZ2VzICh0eXBlLCBkZWNvcmF0aW9uKSB7XG4gICAgaWYgKHRoaXMudGV4dEVkaXRvci5pc0Rlc3Ryb3llZCgpKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLmludmFsaWRhdGVEZWNvcmF0aW9uRm9yU2NyZWVuUm93c0NhY2hlKClcblxuICAgIGxldCByYW5nZSA9IGRlY29yYXRpb24ubWFya2VyLmdldFNjcmVlblJhbmdlKClcbiAgICBpZiAocmFuZ2UgPT0gbnVsbCkgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5lbWl0UmFuZ2VDaGFuZ2VzKHR5cGUsIHJhbmdlLCAwKVxuICB9XG5cbiAgLyoqXG4gICAqIEVtaXRzIGEgY2hhbmdlIGZvciB0aGUgc3BlY2lmaWVkIHJhbmdlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IHR5cGUgdGhlIHR5cGUgb2YgZGVjb3JhdGlvbiB0aGF0IGNoYW5nZWRcbiAgICogQHBhcmFtICB7T2JqZWN0fSByYW5nZSB0aGUgcmFuZ2Ugd2hlcmUgY2hhbmdlcyBvY2N1cmVkXG4gICAqIEBwYXJhbSAge251bWJlcn0gW3NjcmVlbkRlbHRhXSBhbiBvcHRpb25hbCBzY3JlZW4gZGVsdGEgZm9yIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlIG9iamVjdFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGVtaXRSYW5nZUNoYW5nZXMgKHR5cGUsIHJhbmdlLCBzY3JlZW5EZWx0YSkge1xuICAgIGxldCBzdGFydFNjcmVlblJvdyA9IHJhbmdlLnN0YXJ0LnJvd1xuICAgIGxldCBlbmRTY3JlZW5Sb3cgPSByYW5nZS5lbmQucm93XG4gICAgbGV0IGxhc3RSZW5kZXJlZFNjcmVlblJvdyA9IHRoaXMuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgIGxldCBmaXJzdFJlbmRlcmVkU2NyZWVuUm93ID0gdGhpcy5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuXG4gICAgaWYgKHNjcmVlbkRlbHRhID09IG51bGwpIHtcbiAgICAgIHNjcmVlbkRlbHRhID0gKGxhc3RSZW5kZXJlZFNjcmVlblJvdyAtIGZpcnN0UmVuZGVyZWRTY3JlZW5Sb3cpIC1cbiAgICAgICAgICAgICAgICAgICAgKGVuZFNjcmVlblJvdyAtIHN0YXJ0U2NyZWVuUm93KVxuICAgIH1cblxuICAgIGxldCBjaGFuZ2VFdmVudCA9IHtcbiAgICAgIHN0YXJ0OiBzdGFydFNjcmVlblJvdyxcbiAgICAgIGVuZDogZW5kU2NyZWVuUm93LFxuICAgICAgc2NyZWVuRGVsdGE6IHNjcmVlbkRlbHRhLFxuICAgICAgdHlwZTogdHlwZVxuICAgIH1cblxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLWRlY29yYXRpb24tcmFuZ2UnLCBjaGFuZ2VFdmVudClcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgYERlY29yYXRpb25gIGZyb20gdGhpcyBtaW5pbWFwLlxuICAgKlxuICAgKiBAcGFyYW0gIHtEZWNvcmF0aW9ufSBkZWNvcmF0aW9uIHRoZSBkZWNvcmF0aW9uIHRvIHJlbW92ZVxuICAgKiBAZW1pdHMgIHtkaWQtY2hhbmdlfSB3aGVuIHRoZSBkZWNvcmF0aW9uIGlzIHJlbW92ZWRcbiAgICogQGVtaXRzICB7ZGlkLXJlbW92ZS1kZWNvcmF0aW9ufSB3aGVuIHRoZSBkZWNvcmF0aW9uIGlzIHJlbW92ZWRcbiAgICovXG4gIHJlbW92ZURlY29yYXRpb24gKGRlY29yYXRpb24pIHtcbiAgICBpZiAoZGVjb3JhdGlvbiA9PSBudWxsKSB7IHJldHVybiB9XG5cbiAgICBsZXQgbWFya2VyID0gZGVjb3JhdGlvbi5tYXJrZXJcbiAgICBsZXQgc3Vic2NyaXB0aW9uXG5cbiAgICBkZWxldGUgdGhpcy5kZWNvcmF0aW9uc0J5SWRbZGVjb3JhdGlvbi5pZF1cblxuICAgIHN1YnNjcmlwdGlvbiA9IHRoaXMuZGVjb3JhdGlvblVwZGF0ZWRTdWJzY3JpcHRpb25zW2RlY29yYXRpb24uaWRdXG4gICAgaWYgKHN1YnNjcmlwdGlvbiAhPSBudWxsKSB7IHN1YnNjcmlwdGlvbi5kaXNwb3NlKCkgfVxuXG4gICAgc3Vic2NyaXB0aW9uID0gdGhpcy5kZWNvcmF0aW9uRGVzdHJveWVkU3Vic2NyaXB0aW9uc1tkZWNvcmF0aW9uLmlkXVxuICAgIGlmIChzdWJzY3JpcHRpb24gIT0gbnVsbCkgeyBzdWJzY3JpcHRpb24uZGlzcG9zZSgpIH1cblxuICAgIGRlbGV0ZSB0aGlzLmRlY29yYXRpb25VcGRhdGVkU3Vic2NyaXB0aW9uc1tkZWNvcmF0aW9uLmlkXVxuICAgIGRlbGV0ZSB0aGlzLmRlY29yYXRpb25EZXN0cm95ZWRTdWJzY3JpcHRpb25zW2RlY29yYXRpb24uaWRdXG5cbiAgICBsZXQgZGVjb3JhdGlvbnMgPSB0aGlzLmRlY29yYXRpb25zQnlNYXJrZXJJZFttYXJrZXIuaWRdXG4gICAgaWYgKCFkZWNvcmF0aW9ucykgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5lbWl0RGVjb3JhdGlvbkNoYW5nZXMoZGVjb3JhdGlvbi5nZXRQcm9wZXJ0aWVzKCkudHlwZSwgZGVjb3JhdGlvbilcblxuICAgIGxldCBpbmRleCA9IGRlY29yYXRpb25zLmluZGV4T2YoZGVjb3JhdGlvbilcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgZGVjb3JhdGlvbnMuc3BsaWNlKGluZGV4LCAxKVxuXG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLXJlbW92ZS1kZWNvcmF0aW9uJywge1xuICAgICAgICBtYXJrZXI6IG1hcmtlcixcbiAgICAgICAgZGVjb3JhdGlvbjogZGVjb3JhdGlvblxuICAgICAgfSlcblxuICAgICAgaWYgKGRlY29yYXRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLnJlbW92ZWRBbGxNYXJrZXJEZWNvcmF0aW9ucyhtYXJrZXIpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYWxsIHRoZSBkZWNvcmF0aW9ucyByZWdpc3RlcmVkIGZvciB0aGUgcGFzc2VkLWluIG1hcmtlci5cbiAgICpcbiAgICogQHBhcmFtICB7TWFya2VyfSBtYXJrZXIgdGhlIG1hcmtlciBmb3Igd2hpY2ggcmVtb3ZpbmcgaXRzIGRlY29yYXRpb25zXG4gICAqIEBlbWl0cyAge2RpZC1jaGFuZ2V9IHdoZW4gYSBkZWNvcmF0aW9uIGhhdmUgYmVlbiByZW1vdmVkXG4gICAqIEBlbWl0cyAge2RpZC1yZW1vdmUtZGVjb3JhdGlvbn0gd2hlbiBhIGRlY29yYXRpb24gaGF2ZSBiZWVuIHJlbW92ZWRcbiAgICovXG4gIHJlbW92ZUFsbERlY29yYXRpb25zRm9yTWFya2VyIChtYXJrZXIpIHtcbiAgICBpZiAobWFya2VyID09IG51bGwpIHsgcmV0dXJuIH1cblxuICAgIGxldCBkZWNvcmF0aW9ucyA9IHRoaXMuZGVjb3JhdGlvbnNCeU1hcmtlcklkW21hcmtlci5pZF1cbiAgICBpZiAoIWRlY29yYXRpb25zKSB7IHJldHVybiB9XG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gZGVjb3JhdGlvbnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGxldCBkZWNvcmF0aW9uID0gZGVjb3JhdGlvbnNbaV1cblxuICAgICAgdGhpcy5lbWl0RGVjb3JhdGlvbkNoYW5nZXMoZGVjb3JhdGlvbi5nZXRQcm9wZXJ0aWVzKCkudHlwZSwgZGVjb3JhdGlvbilcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtcmVtb3ZlLWRlY29yYXRpb24nLCB7XG4gICAgICAgIG1hcmtlcjogbWFya2VyLFxuICAgICAgICBkZWNvcmF0aW9uOiBkZWNvcmF0aW9uXG4gICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMucmVtb3ZlZEFsbE1hcmtlckRlY29yYXRpb25zKG1hcmtlcilcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyB0aGUgcmVtb3ZhbCBvZiBhIGRlY29yYXRpb24gZm9yIGEgZ2l2ZW4gbWFya2VyLlxuICAgKlxuICAgKiBAcGFyYW0gIHtNYXJrZXJ9IG1hcmtlciB0aGUgbWFya2VyIGZvciB3aGljaCByZW1vdmluZyBkZWNvcmF0aW9uc1xuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHJlbW92ZWRBbGxNYXJrZXJEZWNvcmF0aW9ucyAobWFya2VyKSB7XG4gICAgaWYgKG1hcmtlciA9PSBudWxsKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLmRlY29yYXRpb25NYXJrZXJDaGFuZ2VkU3Vic2NyaXB0aW9uc1ttYXJrZXIuaWRdLmRpc3Bvc2UoKVxuICAgIHRoaXMuZGVjb3JhdGlvbk1hcmtlckRlc3Ryb3llZFN1YnNjcmlwdGlvbnNbbWFya2VyLmlkXS5kaXNwb3NlKClcblxuICAgIGRlbGV0ZSB0aGlzLmRlY29yYXRpb25zQnlNYXJrZXJJZFttYXJrZXIuaWRdXG4gICAgZGVsZXRlIHRoaXMuZGVjb3JhdGlvbk1hcmtlckNoYW5nZWRTdWJzY3JpcHRpb25zW21hcmtlci5pZF1cbiAgICBkZWxldGUgdGhpcy5kZWNvcmF0aW9uTWFya2VyRGVzdHJveWVkU3Vic2NyaXB0aW9uc1ttYXJrZXIuaWRdXG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhbGwgdGhlIGRlY29yYXRpb25zIHRoYXQgd2FzIGNyZWF0ZWQgaW4gdGhlIGN1cnJlbnQgYE1pbmltYXBgLlxuICAgKi9cbiAgcmVtb3ZlQWxsRGVjb3JhdGlvbnMgKCkge1xuICAgIGZvciAobGV0IGlkIGluIHRoaXMuZGVjb3JhdGlvbk1hcmtlckNoYW5nZWRTdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLmRlY29yYXRpb25NYXJrZXJDaGFuZ2VkU3Vic2NyaXB0aW9uc1tpZF0uZGlzcG9zZSgpXG4gICAgfVxuXG4gICAgZm9yIChsZXQgaWQgaW4gdGhpcy5kZWNvcmF0aW9uTWFya2VyRGVzdHJveWVkU3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5kZWNvcmF0aW9uTWFya2VyRGVzdHJveWVkU3Vic2NyaXB0aW9uc1tpZF0uZGlzcG9zZSgpXG4gICAgfVxuXG4gICAgZm9yIChsZXQgaWQgaW4gdGhpcy5kZWNvcmF0aW9uVXBkYXRlZFN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuZGVjb3JhdGlvblVwZGF0ZWRTdWJzY3JpcHRpb25zW2lkXS5kaXNwb3NlKClcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpZCBpbiB0aGlzLmRlY29yYXRpb25EZXN0cm95ZWRTdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLmRlY29yYXRpb25EZXN0cm95ZWRTdWJzY3JpcHRpb25zW2lkXS5kaXNwb3NlKClcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpZCBpbiB0aGlzLmRlY29yYXRpb25zQnlJZCkge1xuICAgICAgdGhpcy5kZWNvcmF0aW9uc0J5SWRbaWRdLmRlc3Ryb3koKVxuICAgIH1cblxuICAgIHRoaXMuZGVjb3JhdGlvbnNCeUlkID0ge31cbiAgICB0aGlzLmRlY29yYXRpb25zQnlNYXJrZXJJZCA9IHt9XG4gICAgdGhpcy5kZWNvcmF0aW9uTWFya2VyQ2hhbmdlZFN1YnNjcmlwdGlvbnMgPSB7fVxuICAgIHRoaXMuZGVjb3JhdGlvbk1hcmtlckRlc3Ryb3llZFN1YnNjcmlwdGlvbnMgPSB7fVxuICAgIHRoaXMuZGVjb3JhdGlvblVwZGF0ZWRTdWJzY3JpcHRpb25zID0ge31cbiAgICB0aGlzLmRlY29yYXRpb25EZXN0cm95ZWRTdWJzY3JpcHRpb25zID0ge31cbiAgfVxufVxuIl19
//# sourceURL=/home/takaaki/.atom/packages/minimap/lib/mixins/decoration-management.js
