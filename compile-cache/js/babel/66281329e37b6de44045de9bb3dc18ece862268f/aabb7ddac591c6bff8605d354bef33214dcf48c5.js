Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _mixto = require('mixto');

var _mixto2 = _interopRequireDefault(_mixto);

var _atom = require('atom');

/**
 * Provides methods to manage minimap plugins.
 * Minimap plugins are Atom packages that will augment the minimap.
 * They have a secondary activation cycle going on constrained by the minimap
 * package activation. A minimap plugin life cycle will generally look
 * like this:
 *
 * 1. The plugin module is activated by Atom through the `activate` method
 * 2. The plugin then register itself as a minimap plugin using `registerPlugin`
 * 3. The plugin is activated/deactivated according to the minimap settings.
 * 4. On the plugin module deactivation, the plugin must unregisters itself
 *    from the minimap using the `unregisterPlugin`.
 *
 * @access public
 */
'use babel';

var PluginManagement = (function (_Mixin) {
  _inherits(PluginManagement, _Mixin);

  function PluginManagement() {
    _classCallCheck(this, PluginManagement);

    _get(Object.getPrototypeOf(PluginManagement.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(PluginManagement, [{
    key: 'provideMinimapServiceV1',

    /**
     * Returns the Minimap main module instance.
     *
     * @return {Main} The Minimap main module instance.
     */
    value: function provideMinimapServiceV1() {
      return this;
    }

    /**
     * Initializes the properties for plugins' management.
     *
     * @access private
     */
  }, {
    key: 'initializePlugins',
    value: function initializePlugins() {
      /**
       * The registered Minimap plugins stored using their name as key.
       *
       * @type {Object}
       * @access private
       */
      this.plugins = {};
      /**
       * The plugins' subscriptions stored using the plugin names as keys.
       *
       * @type {Object}
       * @access private
       */
      this.pluginsSubscriptions = {};

      /**
       * A map that stores the display order for each plugin
       *
       * @type {Object}
       * @access private
       */
      this.pluginsOrderMap = {};
    }

    /**
     * Registers a minimap `plugin` with the given `name`.
     *
     * @param {string} name The identifying name of the plugin.
     *                      It will be used as activation settings name
     *                      as well as the key to unregister the module.
     * @param {MinimapPlugin} plugin The plugin to register.
     * @emits {did-add-plugin} with the name and a reference to the added plugin.
     * @emits {did-activate-plugin} if the plugin was activated during
     *                              the registration.
     */
  }, {
    key: 'registerPlugin',
    value: function registerPlugin(name, plugin) {
      this.plugins[name] = plugin;
      this.pluginsSubscriptions[name] = new _atom.CompositeDisposable();

      var event = { name: name, plugin: plugin };
      this.emitter.emit('did-add-plugin', event);

      if (atom.config.get('minimap.displayPluginsControls')) {
        this.registerPluginControls(name, plugin);
      }

      this.updatesPluginActivationState(name);
    }

    /**
     * Unregisters a plugin from the minimap.
     *
     * @param {string} name The identifying name of the plugin to unregister.
     * @emits {did-remove-plugin} with the name and a reference
     *        to the added plugin.
     */
  }, {
    key: 'unregisterPlugin',
    value: function unregisterPlugin(name) {
      var plugin = this.plugins[name];

      if (atom.config.get('minimap.displayPluginsControls')) {
        this.unregisterPluginControls(name);
      }

      delete this.plugins[name];

      var event = { name: name, plugin: plugin };
      this.emitter.emit('did-remove-plugin', event);
    }

    /**
     * Toggles the specified plugin activation state.
     *
     * @param  {string} name     The name of the plugin.
     * @param  {boolean} boolean An optional boolean to set the activation
     *                           state of the plugin. If ommitted the new plugin
     *                           state will be the the inverse of its current
     *                           state.
     * @emits {did-activate-plugin} if the plugin was activated by the call.
     * @emits {did-deactivate-plugin} if the plugin was deactivated by the call.
     */
  }, {
    key: 'togglePluginActivation',
    value: function togglePluginActivation(name, boolean) {
      var settingsKey = 'minimap.plugins.' + name;

      if (boolean !== undefined && boolean !== null) {
        atom.config.set(settingsKey, boolean);
      } else {
        atom.config.set(settingsKey, !atom.config.get(settingsKey));
      }

      this.updatesPluginActivationState(name);
    }

    /**
     * Deactivates all the plugins registered in the minimap package so far.
     *
     * @emits {did-deactivate-plugin} for each plugin deactivated by the call.
     */
  }, {
    key: 'deactivateAllPlugins',
    value: function deactivateAllPlugins() {
      for (var _ref3 of this.eachPlugin()) {
        var _ref2 = _slicedToArray(_ref3, 2);

        var _name = _ref2[0];
        var plugin = _ref2[1];

        plugin.deactivatePlugin();
        this.emitter.emit('did-deactivate-plugin', { name: _name, plugin: plugin });
      }
    }

    /**
     * A generator function to iterate over registered plugins.
     *
     * @return An iterable that yield the name and reference to every plugin
     *         as an array in each iteration.
     */
  }, {
    key: 'eachPlugin',
    value: function* eachPlugin() {
      for (var _name2 in this.plugins) {
        yield [_name2, this.plugins[_name2]];
      }
    }

    /**
     * Updates the plugin activation state according to the current config.
     *
     * @param {string} name The identifying name of the plugin to update.
     * @emits {did-activate-plugin} if the plugin was activated by the call.
     * @emits {did-deactivate-plugin} if the plugin was deactivated by the call.
     * @access private
     */
  }, {
    key: 'updatesPluginActivationState',
    value: function updatesPluginActivationState(name) {
      var plugin = this.plugins[name];
      var pluginActive = plugin.isActive();
      var settingActive = atom.config.get('minimap.plugins.' + name);

      if (atom.config.get('minimap.displayPluginsControls')) {
        if (settingActive && !pluginActive) {
          this.activatePlugin(name, plugin);
        } else if (pluginActive && !settingActive) {
          this.deactivatePlugin(name, plugin);
        }
      } else {
        if (!pluginActive) {
          this.activatePlugin(name, plugin);
        } else if (pluginActive) {
          this.deactivatePlugin(name, plugin);
        }
      }
    }
  }, {
    key: 'activatePlugin',
    value: function activatePlugin(name, plugin) {
      var event = { name: name, plugin: plugin };

      plugin.activatePlugin();
      this.emitter.emit('did-activate-plugin', event);
    }
  }, {
    key: 'deactivatePlugin',
    value: function deactivatePlugin(name, plugin) {
      var event = { name: name, plugin: plugin };

      plugin.deactivatePlugin();
      this.emitter.emit('did-deactivate-plugin', event);
    }

    /**
     * When the `minimap.displayPluginsControls` setting is toggled,
     * this function will register the commands and setting to manage the plugin
     * activation from the minimap settings.
     *
     * @param {string} name The identifying name of the plugin.
     * @param {MinimapPlugin} plugin The plugin instance to register
     *        controls for.
     * @listens {minimap.plugins.${name}} listen to the setting to update
     *          the plugin state accordingly.
     * @listens {minimap:toggle-${name}} listen to the command on `atom-workspace`
     *          to toggle the plugin state.
     * @access private
     */
  }, {
    key: 'registerPluginControls',
    value: function registerPluginControls(name, plugin) {
      var _this = this;

      var settingsKey = 'minimap.plugins.' + name;
      var orderSettingsKey = 'minimap.plugins.' + name + 'DecorationsZIndex';

      this.config.plugins.properties[name] = {
        type: 'boolean',
        title: name,
        description: 'Whether the ' + name + ' plugin is activated and displayed in the Minimap.',
        'default': true
      };

      this.config.plugins.properties[name + 'DecorationsZIndex'] = {
        type: 'integer',
        title: name + ' decorations order',
        description: 'The relative order of the ' + name + ' plugin\'s decorations in the layer into which they are drawn. Note that this order only apply inside a layer, so highlight-over decorations will always be displayed above line decorations as they are rendered in different layers.',
        'default': 0
      };

      if (atom.config.get(settingsKey) === undefined) {
        atom.config.set(settingsKey, true);
      }

      if (atom.config.get(orderSettingsKey) === undefined) {
        atom.config.set(orderSettingsKey, 0);
      }

      this.pluginsSubscriptions[name].add(atom.config.observe(settingsKey, function () {
        _this.updatesPluginActivationState(name);
      }));

      this.pluginsSubscriptions[name].add(atom.config.observe(orderSettingsKey, function (order) {
        _this.updatePluginsOrderMap(name);
        var event = { name: name, plugin: plugin, order: order };
        _this.emitter.emit('did-change-plugin-order', event);
      }));

      this.pluginsSubscriptions[name].add(atom.commands.add('atom-workspace', _defineProperty({}, 'minimap:toggle-' + name, function () {
        _this.togglePluginActivation(name);
      })));

      this.updatePluginsOrderMap(name);
    }

    /**
     * Updates the display order in the map for the passed-in plugin name.
     *
     * @param  {string} name the name of the plugin to update
     * @access private
     */
  }, {
    key: 'updatePluginsOrderMap',
    value: function updatePluginsOrderMap(name) {
      var orderSettingsKey = 'minimap.plugins.' + name + 'DecorationsZIndex';

      this.pluginsOrderMap[name] = atom.config.get(orderSettingsKey);
    }

    /**
     * Returns the plugins display order mapped by name.
     *
     * @return {Object} The plugins order by name
     */
  }, {
    key: 'getPluginsOrder',
    value: function getPluginsOrder() {
      return this.pluginsOrderMap;
    }

    /**
     * When the `minimap.displayPluginsControls` setting is toggled,
     * this function will unregister the commands and setting that
     * was created previously.
     *
     * @param {string} name The identifying name of the plugin.
     * @access private
     */
  }, {
    key: 'unregisterPluginControls',
    value: function unregisterPluginControls(name) {
      this.pluginsSubscriptions[name].dispose();
      delete this.pluginsSubscriptions[name];
      delete this.config.plugins.properties[name];
    }
  }]);

  return PluginManagement;
})(_mixto2['default']);

exports['default'] = PluginManagement;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvbWl4aW5zL3BsdWdpbi1tYW5hZ2VtZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQkFFa0IsT0FBTzs7OztvQkFDVyxNQUFNOzs7Ozs7Ozs7Ozs7Ozs7OztBQUgxQyxXQUFXLENBQUE7O0lBb0JVLGdCQUFnQjtZQUFoQixnQkFBZ0I7O1dBQWhCLGdCQUFnQjswQkFBaEIsZ0JBQWdCOzsrQkFBaEIsZ0JBQWdCOzs7ZUFBaEIsZ0JBQWdCOzs7Ozs7OztXQU1YLG1DQUFHO0FBQUUsYUFBTyxJQUFJLENBQUE7S0FBRTs7Ozs7Ozs7O1dBT3hCLDZCQUFHOzs7Ozs7O0FBT25CLFVBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFBOzs7Ozs7O0FBT2pCLFVBQUksQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLENBQUE7Ozs7Ozs7O0FBUTlCLFVBQUksQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFBO0tBQzFCOzs7Ozs7Ozs7Ozs7Ozs7V0FhYyx3QkFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFO0FBQzVCLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFBO0FBQzNCLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsR0FBRywrQkFBeUIsQ0FBQTs7QUFFM0QsVUFBSSxLQUFLLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQTtBQUMxQyxVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQTs7QUFFMUMsVUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxFQUFFO0FBQ3JELFlBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7T0FDMUM7O0FBRUQsVUFBSSxDQUFDLDRC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LENBQUMsQ0FBQTtLQUNqQzs7Ozs7Ozs7OztXQVFxQiwrQkFBQyxJQUFJLEVBQUU7QUFDM0IsVUFBTSxnQkFBZ0Isd0JBQXNCLElBQUksc0JBQW1CLENBQUE7O0FBRW5FLFVBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtLQUMvRDs7Ozs7Ozs7O1dBT2UsMkJBQUc7QUFBRSxhQUFPLElBQUksQ0FBQyxlQUFlLENBQUE7S0FBRTs7Ozs7Ozs7Ozs7O1dBVXpCLGtDQUFDLElBQUksRUFBRTtBQUM5QixVQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDekMsYUFBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDdEMsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDNUM7OztTQXRRa0IsZ0JBQWdCOzs7cUJBQWhCLGdCQUFnQiIsImZpbGUiOiIvaG9tZS90YWthYWtpLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvbGliL21peGlucy9wbHVnaW4tbWFuYWdlbWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBNaXhpbiBmcm9tICdtaXh0bydcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuXG4vKipcbiAqIFByb3ZpZGVzIG1ldGhvZHMgdG8gbWFuYWdlIG1pbmltYXAgcGx1Z2lucy5cbiAqIE1pbmltYXAgcGx1Z2lucyBhcmUgQXRvbSBwYWNrYWdlcyB0aGF0IHdpbGwgYXVnbWVudCB0aGUgbWluaW1hcC5cbiAqIFRoZXkgaGF2ZSBhIHNlY29uZGFyeSBhY3RpdmF0aW9uIGN5Y2xlIGdvaW5nIG9uIGNvbnN0cmFpbmVkIGJ5IHRoZSBtaW5pbWFwXG4gKiBwYWNrYWdlIGFjdGl2YXRpb24uIEEgbWluaW1hcCBwbHVnaW4gbGlmZSBjeWNsZSB3aWxsIGdlbmVyYWxseSBsb29rXG4gKiBsaWtlIHRoaXM6XG4gKlxuICogMS4gVGhlIHBsdWdpbiBtb2R1bGUgaXMgYWN0aXZhdGVkIGJ5IEF0b20gdGhyb3VnaCB0aGUgYGFjdGl2YXRlYCBtZXRob2RcbiAqIDIuIFRoZSBwbHVnaW4gdGhlbiByZWdpc3RlciBpdHNlbGYgYXMgYSBtaW5pbWFwIHBsdWdpbiB1c2luZyBgcmVnaXN0ZXJQbHVnaW5gXG4gKiAzLiBUaGUgcGx1Z2luIGlzIGFjdGl2YXRlZC9kZWFjdGl2YXRlZCBhY2NvcmRpbmcgdG8gdGhlIG1pbmltYXAgc2V0dGluZ3MuXG4gKiA0LiBPbiB0aGUgcGx1Z2luIG1vZHVsZSBkZWFjdGl2YXRpb24sIHRoZSBwbHVnaW4gbXVzdCB1bnJlZ2lzdGVycyBpdHNlbGZcbiAqICAgIGZyb20gdGhlIG1pbmltYXAgdXNpbmcgdGhlIGB1bnJlZ2lzdGVyUGx1Z2luYC5cbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbHVnaW5NYW5hZ2VtZW50IGV4dGVuZHMgTWl4aW4ge1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgTWluaW1hcCBtYWluIG1vZHVsZSBpbnN0YW5jZS5cbiAgICpcbiAgICogQHJldHVybiB7TWFpbn0gVGhlIE1pbmltYXAgbWFpbiBtb2R1bGUgaW5zdGFuY2UuXG4gICAqL1xuICBwcm92aWRlTWluaW1hcFNlcnZpY2VWMSAoKSB7IHJldHVybiB0aGlzIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIHByb3BlcnRpZXMgZm9yIHBsdWdpbnMnIG1hbmFnZW1lbnQuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZVBsdWdpbnMgKCkge1xuICAgIC8qKlxuICAgICAqIFRoZSByZWdpc3RlcmVkIE1pbmltYXAgcGx1Z2lucyBzdG9yZWQgdXNpbmcgdGhlaXIgbmFtZSBhcyBrZXkuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMucGx1Z2lucyA9IHt9XG4gICAgLyoqXG4gICAgICogVGhlIHBsdWdpbnMnIHN1YnNjcmlwdGlvbnMgc3RvcmVkIHVzaW5nIHRoZSBwbHVnaW4gbmFtZXMgYXMga2V5cy5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5wbHVnaW5zU3Vic2NyaXB0aW9ucyA9IHt9XG5cbiAgICAvKipcbiAgICAgKiBBIG1hcCB0aGF0IHN0b3JlcyB0aGUgZGlzcGxheSBvcmRlciBmb3IgZWFjaCBwbHVnaW5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5wbHVnaW5zT3JkZXJNYXAgPSB7fVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIG1pbmltYXAgYHBsdWdpbmAgd2l0aCB0aGUgZ2l2ZW4gYG5hbWVgLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgaWRlbnRpZnlpbmcgbmFtZSBvZiB0aGUgcGx1Z2luLlxuICAgKiAgICAgICAgICAgICAgICAgICAgICBJdCB3aWxsIGJlIHVzZWQgYXMgYWN0aXZhdGlvbiBzZXR0aW5ncyBuYW1lXG4gICAqICAgICAgICAgICAgICAgICAgICAgIGFzIHdlbGwgYXMgdGhlIGtleSB0byB1bnJlZ2lzdGVyIHRoZSBtb2R1bGUuXG4gICAqIEBwYXJhbSB7TWluaW1hcFBsdWdpbn0gcGx1Z2luIFRoZSBwbHVnaW4gdG8gcmVnaXN0ZXIuXG4gICAqIEBlbWl0cyB7ZGlkLWFkZC1wbHVnaW59IHdpdGggdGhlIG5hbWUgYW5kIGEgcmVmZXJlbmNlIHRvIHRoZSBhZGRlZCBwbHVnaW4uXG4gICAqIEBlbWl0cyB7ZGlkLWFjdGl2YXRlLXBsdWdpbn0gaWYgdGhlIHBsdWdpbiB3YXMgYWN0aXZhdGVkIGR1cmluZ1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSByZWdpc3RyYXRpb24uXG4gICAqL1xuICByZWdpc3RlclBsdWdpbiAobmFtZSwgcGx1Z2luKSB7XG4gICAgdGhpcy5wbHVnaW5zW25hbWVdID0gcGx1Z2luXG4gICAgdGhpcy5wbHVnaW5zU3Vic2NyaXB0aW9uc1tuYW1lXSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIGxldCBldmVudCA9IHsgbmFtZTogbmFtZSwgcGx1Z2luOiBwbHVnaW4gfVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtYWRkLXBsdWdpbicsIGV2ZW50KVxuXG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnbWluaW1hcC5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzJykpIHtcbiAgICAgIHRoaXMucmVnaXN0ZXJQbHVnaW5Db250cm9scyhuYW1lLCBwbHVnaW4pXG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVzUGx1Z2luQWN0aXZhdGlvblN0YXRlKG5hbWUpXG4gIH1cblxuICAvKipcbiAgICogVW5yZWdpc3RlcnMgYSBwbHVnaW4gZnJvbSB0aGUgbWluaW1hcC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIGlkZW50aWZ5aW5nIG5hbWUgb2YgdGhlIHBsdWdpbiB0byB1bnJlZ2lzdGVyLlxuICAgKiBAZW1pdHMge2RpZC1yZW1vdmUtcGx1Z2lufSB3aXRoIHRoZSBuYW1lIGFuZCBhIHJlZmVyZW5jZVxuICAgKiAgICAgICAgdG8gdGhlIGFkZGVkIHBsdWdpbi5cbiAgICovXG4gIHVucmVnaXN0ZXJQbHVnaW4gKG5hbWUpIHtcbiAgICBsZXQgcGx1Z2luID0gdGhpcy5wbHVnaW5zW25hbWVdXG5cbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMnKSkge1xuICAgICAgdGhpcy51bnJlZ2lzdGVyUGx1Z2luQ29udHJvbHMobmFtZSlcbiAgICB9XG5cbiAgICBkZWxldGUgdGhpcy5wbHVnaW5zW25hbWVdXG5cbiAgICBsZXQgZXZlbnQgPSB7IG5hbWU6IG5hbWUsIHBsdWdpbjogcGx1Z2luIH1cbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLXJlbW92ZS1wbHVnaW4nLCBldmVudClcbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBzcGVjaWZpZWQgcGx1Z2luIGFjdGl2YXRpb24gc3RhdGUuXG4gICAqXG4gICAqIEBwYXJhbSAge3N0cmluZ30gbmFtZSAgICAgVGhlIG5hbWUgb2YgdGhlIHBsdWdpbi5cbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gYm9vbGVhbiBBbiBvcHRpb25hbCBib29sZWFuIHRvIHNldCB0aGUgYWN0aXZhdGlvblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlIG9mIHRoZSBwbHVnaW4uIElmIG9tbWl0dGVkIHRoZSBuZXcgcGx1Z2luXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgd2lsbCBiZSB0aGUgdGhlIGludmVyc2Ugb2YgaXRzIGN1cnJlbnRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5cbiAgICogQGVtaXRzIHtkaWQtYWN0aXZhdGUtcGx1Z2lufSBpZiB0aGUgcGx1Z2luIHdhcyBhY3RpdmF0ZWQgYnkgdGhlIGNhbGwuXG4gICAqIEBlbWl0cyB7ZGlkLWRlYWN0aXZhdGUtcGx1Z2lufSBpZiB0aGUgcGx1Z2luIHdhcyBkZWFjdGl2YXRlZCBieSB0aGUgY2FsbC5cbiAgICovXG4gIHRvZ2dsZVBsdWdpbkFjdGl2YXRpb24gKG5hbWUsIGJvb2xlYW4pIHtcbiAgICBsZXQgc2V0dGluZ3NLZXkgPSBgbWluaW1hcC5wbHVnaW5zLiR7bmFtZX1gXG5cbiAgICBpZiAoYm9vbGVhbiAhPT0gdW5kZWZpbmVkICYmIGJvb2xlYW4gIT09IG51bGwpIHtcbiAgICAgIGF0b20uY29uZmlnLnNldChzZXR0aW5nc0tleSwgYm9vbGVhbilcbiAgICB9IGVsc2Uge1xuICAgICAgYXRvbS5jb25maWcuc2V0KHNldHRpbmdzS2V5LCAhYXRvbS5jb25maWcuZ2V0KHNldHRpbmdzS2V5KSlcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZXNQbHVnaW5BY3RpdmF0aW9uU3RhdGUobmFtZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWFjdGl2YXRlcyBhbGwgdGhlIHBsdWdpbnMgcmVnaXN0ZXJlZCBpbiB0aGUgbWluaW1hcCBwYWNrYWdlIHNvIGZhci5cbiAgICpcbiAgICogQGVtaXRzIHtkaWQtZGVhY3RpdmF0ZS1wbHVnaW59IGZvciBlYWNoIHBsdWdpbiBkZWFjdGl2YXRlZCBieSB0aGUgY2FsbC5cbiAgICovXG4gIGRlYWN0aXZhdGVBbGxQbHVnaW5zICgpIHtcbiAgICBmb3IgKGxldCBbbmFtZSwgcGx1Z2luXSBvZiB0aGlzLmVhY2hQbHVnaW4oKSkge1xuICAgICAgcGx1Z2luLmRlYWN0aXZhdGVQbHVnaW4oKVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1kZWFjdGl2YXRlLXBsdWdpbicsIHsgbmFtZTogbmFtZSwgcGx1Z2luOiBwbHVnaW4gfSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSBnZW5lcmF0b3IgZnVuY3Rpb24gdG8gaXRlcmF0ZSBvdmVyIHJlZ2lzdGVyZWQgcGx1Z2lucy5cbiAgICpcbiAgICogQHJldHVybiBBbiBpdGVyYWJsZSB0aGF0IHlpZWxkIHRoZSBuYW1lIGFuZCByZWZlcmVuY2UgdG8gZXZlcnkgcGx1Z2luXG4gICAqICAgICAgICAgYXMgYW4gYXJyYXkgaW4gZWFjaCBpdGVyYXRpb24uXG4gICAqL1xuICAqIGVhY2hQbHVnaW4gKCkge1xuICAgIGZvciAobGV0IG5hbWUgaW4gdGhpcy5wbHVnaW5zKSB7XG4gICAgICB5aWVsZCBbbmFtZSwgdGhpcy5wbHVnaW5zW25hbWVdXVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBwbHVnaW4gYWN0aXZhdGlvbiBzdGF0ZSBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgY29uZmlnLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgaWRlbnRpZnlpbmcgbmFtZSBvZiB0aGUgcGx1Z2luIHRvIHVwZGF0ZS5cbiAgICogQGVtaXRzIHtkaWQtYWN0aXZhdGUtcGx1Z2lufSBpZiB0aGUgcGx1Z2luIHdhcyBhY3RpdmF0ZWQgYnkgdGhlIGNhbGwuXG4gICAqIEBlbWl0cyB7ZGlkLWRlYWN0aXZhdGUtcGx1Z2lufSBpZiB0aGUgcGx1Z2luIHdhcyBkZWFjdGl2YXRlZCBieSB0aGUgY2FsbC5cbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICB1cGRhdGVzUGx1Z2luQWN0aXZhdGlvblN0YXRlIChuYW1lKSB7XG4gICAgY29uc3QgcGx1Z2luID0gdGhpcy5wbHVnaW5zW25hbWVdXG4gICAgY29uc3QgcGx1Z2luQWN0aXZlID0gcGx1Z2luLmlzQWN0aXZlKClcbiAgICBjb25zdCBzZXR0aW5nQWN0aXZlID0gYXRvbS5jb25maWcuZ2V0KGBtaW5pbWFwLnBsdWdpbnMuJHtuYW1lfWApXG5cbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMnKSkge1xuICAgICAgaWYgKHNldHRpbmdBY3RpdmUgJiYgIXBsdWdpbkFjdGl2ZSkge1xuICAgICAgICB0aGlzLmFjdGl2YXRlUGx1Z2luKG5hbWUsIHBsdWdpbilcbiAgICAgIH0gZWxzZSBpZiAocGx1Z2luQWN0aXZlICYmICFzZXR0aW5nQWN0aXZlKSB7XG4gICAgICAgIHRoaXMuZGVhY3RpdmF0ZVBsdWdpbihuYW1lLCBwbHVnaW4pXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghcGx1Z2luQWN0aXZlKSB7XG4gICAgICAgIHRoaXMuYWN0aXZhdGVQbHVnaW4obmFtZSwgcGx1Z2luKVxuICAgICAgfSBlbHNlIGlmIChwbHVnaW5BY3RpdmUpIHtcbiAgICAgICAgdGhpcy5kZWFjdGl2YXRlUGx1Z2luKG5hbWUsIHBsdWdpbilcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhY3RpdmF0ZVBsdWdpbiAobmFtZSwgcGx1Z2luKSB7XG4gICAgY29uc3QgZXZlbnQgPSB7IG5hbWU6IG5hbWUsIHBsdWdpbjogcGx1Z2luIH1cblxuICAgIHBsdWdpbi5hY3RpdmF0ZVBsdWdpbigpXG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1hY3RpdmF0ZS1wbHVnaW4nLCBldmVudClcbiAgfVxuXG4gIGRlYWN0aXZhdGVQbHVnaW4gKG5hbWUsIHBsdWdpbikge1xuICAgIGNvbnN0IGV2ZW50ID0geyBuYW1lOiBuYW1lLCBwbHVnaW46IHBsdWdpbiB9XG5cbiAgICBwbHVnaW4uZGVhY3RpdmF0ZVBsdWdpbigpXG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1kZWFjdGl2YXRlLXBsdWdpbicsIGV2ZW50KVxuICB9XG5cbiAgLyoqXG4gICAqIFdoZW4gdGhlIGBtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHNgIHNldHRpbmcgaXMgdG9nZ2xlZCxcbiAgICogdGhpcyBmdW5jdGlvbiB3aWxsIHJlZ2lzdGVyIHRoZSBjb21tYW5kcyBhbmQgc2V0dGluZyB0byBtYW5hZ2UgdGhlIHBsdWdpblxuICAgKiBhY3RpdmF0aW9uIGZyb20gdGhlIG1pbmltYXAgc2V0dGluZ3MuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBpZGVudGlmeWluZyBuYW1lIG9mIHRoZSBwbHVnaW4uXG4gICAqIEBwYXJhbSB7TWluaW1hcFBsdWdpbn0gcGx1Z2luIFRoZSBwbHVnaW4gaW5zdGFuY2UgdG8gcmVnaXN0ZXJcbiAgICogICAgICAgIGNvbnRyb2xzIGZvci5cbiAgICogQGxpc3RlbnMge21pbmltYXAucGx1Z2lucy4ke25hbWV9fSBsaXN0ZW4gdG8gdGhlIHNldHRpbmcgdG8gdXBkYXRlXG4gICAqICAgICAgICAgIHRoZSBwbHVnaW4gc3RhdGUgYWNjb3JkaW5nbHkuXG4gICAqIEBsaXN0ZW5zIHttaW5pbWFwOnRvZ2dsZS0ke25hbWV9fSBsaXN0ZW4gdG8gdGhlIGNvbW1hbmQgb24gYGF0b20td29ya3NwYWNlYFxuICAgKiAgICAgICAgICB0byB0b2dnbGUgdGhlIHBsdWdpbiBzdGF0ZS5cbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICByZWdpc3RlclBsdWdpbkNvbnRyb2xzIChuYW1lLCBwbHVnaW4pIHtcbiAgICBjb25zdCBzZXR0aW5nc0tleSA9IGBtaW5pbWFwLnBsdWdpbnMuJHtuYW1lfWBcbiAgICBjb25zdCBvcmRlclNldHRpbmdzS2V5ID0gYG1pbmltYXAucGx1Z2lucy4ke25hbWV9RGVjb3JhdGlvbnNaSW5kZXhgXG5cbiAgICB0aGlzLmNvbmZpZy5wbHVnaW5zLnByb3BlcnRpZXNbbmFtZV0gPSB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICB0aXRsZTogbmFtZSxcbiAgICAgIGRlc2NyaXB0aW9uOiBgV2hldGhlciB0aGUgJHtuYW1lfSBwbHVnaW4gaXMgYWN0aXZhdGVkIGFuZCBkaXNwbGF5ZWQgaW4gdGhlIE1pbmltYXAuYCxcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9XG5cbiAgICB0aGlzLmNvbmZpZy5wbHVnaW5zLnByb3BlcnRpZXNbYCR7bmFtZX1EZWNvcmF0aW9uc1pJbmRleGBdID0ge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgdGl0bGU6IGAke25hbWV9IGRlY29yYXRpb25zIG9yZGVyYCxcbiAgICAgIGRlc2NyaXB0aW9uOiBgVGhlIHJlbGF0aXZlIG9yZGVyIG9mIHRoZSAke25hbWV9IHBsdWdpbidzIGRlY29yYXRpb25zIGluIHRoZSBsYXllciBpbnRvIHdoaWNoIHRoZXkgYXJlIGRyYXduLiBOb3RlIHRoYXQgdGhpcyBvcmRlciBvbmx5IGFwcGx5IGluc2lkZSBhIGxheWVyLCBzbyBoaWdobGlnaHQtb3ZlciBkZWNvcmF0aW9ucyB3aWxsIGFsd2F5cyBiZSBkaXNwbGF5ZWQgYWJvdmUgbGluZSBkZWNvcmF0aW9ucyBhcyB0aGV5IGFyZSByZW5kZXJlZCBpbiBkaWZmZXJlbnQgbGF5ZXJzLmAsXG4gICAgICBkZWZhdWx0OiAwXG4gICAgfVxuXG4gICAgaWYgKGF0b20uY29uZmlnLmdldChzZXR0aW5nc0tleSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYXRvbS5jb25maWcuc2V0KHNldHRpbmdzS2V5LCB0cnVlKVxuICAgIH1cblxuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQob3JkZXJTZXR0aW5nc0tleSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYXRvbS5jb25maWcuc2V0KG9yZGVyU2V0dGluZ3NLZXksIDApXG4gICAgfVxuXG4gICAgdGhpcy5wbHVnaW5zU3Vic2NyaXB0aW9uc1tuYW1lXS5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZShzZXR0aW5nc0tleSwgKCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVzUGx1Z2luQWN0aXZhdGlvblN0YXRlKG5hbWUpXG4gICAgfSkpXG5cbiAgICB0aGlzLnBsdWdpbnNTdWJzY3JpcHRpb25zW25hbWVdLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKG9yZGVyU2V0dGluZ3NLZXksIChvcmRlcikgPT4ge1xuICAgICAgdGhpcy51cGRhdGVQbHVnaW5zT3JkZXJNYXAobmFtZSlcbiAgICAgIGNvbnN0IGV2ZW50ID0geyBuYW1lOiBuYW1lLCBwbHVnaW46IHBsdWdpbiwgb3JkZXI6IG9yZGVyIH1cbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXBsdWdpbi1vcmRlcicsIGV2ZW50KVxuICAgIH0pKVxuXG4gICAgdGhpcy5wbHVnaW5zU3Vic2NyaXB0aW9uc1tuYW1lXS5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgW2BtaW5pbWFwOnRvZ2dsZS0ke25hbWV9YF06ICgpID0+IHtcbiAgICAgICAgdGhpcy50b2dnbGVQbHVnaW5BY3RpdmF0aW9uKG5hbWUpXG4gICAgICB9XG4gICAgfSkpXG5cbiAgICB0aGlzLnVwZGF0ZVBsdWdpbnNPcmRlck1hcChuYW1lKVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGRpc3BsYXkgb3JkZXIgaW4gdGhlIG1hcCBmb3IgdGhlIHBhc3NlZC1pbiBwbHVnaW4gbmFtZS5cbiAgICpcbiAgICogQHBhcmFtICB7c3RyaW5nfSBuYW1lIHRoZSBuYW1lIG9mIHRoZSBwbHVnaW4gdG8gdXBkYXRlXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgdXBkYXRlUGx1Z2luc09yZGVyTWFwIChuYW1lKSB7XG4gICAgY29uc3Qgb3JkZXJTZXR0aW5nc0tleSA9IGBtaW5pbWFwLnBsdWdpbnMuJHtuYW1lfURlY29yYXRpb25zWkluZGV4YFxuXG4gICAgdGhpcy5wbHVnaW5zT3JkZXJNYXBbbmFtZV0gPSBhdG9tLmNvbmZpZy5nZXQob3JkZXJTZXR0aW5nc0tleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwbHVnaW5zIGRpc3BsYXkgb3JkZXIgbWFwcGVkIGJ5IG5hbWUuXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gVGhlIHBsdWdpbnMgb3JkZXIgYnkgbmFtZVxuICAgKi9cbiAgZ2V0UGx1Z2luc09yZGVyICgpIHsgcmV0dXJuIHRoaXMucGx1Z2luc09yZGVyTWFwIH1cblxuICAvKipcbiAgICogV2hlbiB0aGUgYG1pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9sc2Agc2V0dGluZyBpcyB0b2dnbGVkLFxuICAgKiB0aGlzIGZ1bmN0aW9uIHdpbGwgdW5yZWdpc3RlciB0aGUgY29tbWFuZHMgYW5kIHNldHRpbmcgdGhhdFxuICAgKiB3YXMgY3JlYXRlZCBwcmV2aW91c2x5LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgaWRlbnRpZnlpbmcgbmFtZSBvZiB0aGUgcGx1Z2luLlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHVucmVnaXN0ZXJQbHVnaW5Db250cm9scyAobmFtZSkge1xuICAgIHRoaXMucGx1Z2luc1N1YnNjcmlwdGlvbnNbbmFtZV0uZGlzcG9zZSgpXG4gICAgZGVsZXRlIHRoaXMucGx1Z2luc1N1YnNjcmlwdGlvbnNbbmFtZV1cbiAgICBkZWxldGUgdGhpcy5jb25maWcucGx1Z2lucy5wcm9wZXJ0aWVzW25hbWVdXG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/takaaki/.atom/packages/minimap/lib/mixins/plugin-management.js
