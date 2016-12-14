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

'use babel';

var CompositeDisposable = undefined;

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
      if (!CompositeDisposable) {
        CompositeDisposable = require('atom').CompositeDisposable;
      }

      this.plugins[name] = plugin;
      this.pluginsSubscriptions[name] = new CompositeDisposable();

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

      var config = this.getConfigSchema();

      config.plugins.properties[name] = {
        type: 'boolean',
        title: name,
        description: 'Whether the ' + name + ' plugin is activated and displayed in the Minimap.',
        'default': true
      };

      config.plugins.properties[name + 'DecorationsZIndex'] = {
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
      delete this.getConfigSchema().plugins.properties[name];
    }
  }]);

  return PluginManagement;
})(_mixto2['default']);

exports['default'] = PluginManagement;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvbWl4aW5zL3BsdWdpbi1tYW5hZ2VtZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQkFFa0IsT0FBTzs7OztBQUZ6QixXQUFXLENBQUE7O0FBSVgsSUFBSSxtQkFBbUIsWUFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFpQkYsZ0JBQWdCO1lBQWhCLGdCQUFnQjs7V0FBaEIsZ0JBQWdCOzBCQUFoQixnQkFBZ0I7OytCQUFoQixnQkFBZ0I7OztlQUFoQixnQkFBZ0I7Ozs7Ozs7O1dBTVgsbUNBQUc7QUFBRSxhQUFPLElBQUksQ0FBQTtLQUFFOzs7Ozs7Ozs7V0FPeEIsNkJBQUc7Ozs7Ozs7QUFPbkIsVUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUE7Ozs7Ozs7QUFPakIsVUFBSSxDQUFDLG9CQUFvQixHQUFHLEVBQUUsQ0FBQTs7Ozs7Ozs7QUFROUIsVUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUE7S0FDMUI7Ozs7Ozs7Ozs7Ozs7OztXQWFjLHdCQUFDLElBQUksRUFBRSxNQUFNLEVBQUU7QUFDNUIsVUFBSSxDQUFDLG1CQUFtQixFQUFFO0FBQ3hCLDJCQUFtQixHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQTtPQUMxRDs7QUFFRCxVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQTtBQUMzQixVQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFBOztBQUUzRCxVQUFJLEtBQUssR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFBO0FBQzFDLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFBOztBQUUxQyxVQUFJLElBQUksQ0FB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QUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsMENBQ2pELElBQUksRUFBSyxZQUFNO0FBQ2hDLGNBQUssc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUE7T0FDbEMsRUFDRCxDQUFDLENBQUE7O0FBRUgsVUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFBO0tBQ2pDOzs7Ozs7Ozs7O1dBUXFCLCtCQUFDLElBQUksRUFBRTtBQUMzQixVQUFNLGdCQUFnQix3QkFBc0IsSUFBSSxzQkFBbUIsQ0FBQTs7QUFFbkUsVUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0tBQy9EOzs7Ozs7Ozs7V0FPZSwyQkFBRztBQUFFLGFBQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQTtLQUFFOzs7Ozs7Ozs7Ozs7V0FVekIsa0NBQUMsSUFBSSxFQUFFO0FBQzlCLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUN6QyxhQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN0QyxhQUFPLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQ3ZEOzs7U0E1UWtCLGdCQUFnQjs7O3FCQUFoQixnQkFBZ0IiLCJmaWxlIjoiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9taXhpbnMvcGx1Z2luLW1hbmFnZW1lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgTWl4aW4gZnJvbSAnbWl4dG8nXG5cbmxldCBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbi8qKlxuICogUHJvdmlkZXMgbWV0aG9kcyB0byBtYW5hZ2UgbWluaW1hcCBwbHVnaW5zLlxuICogTWluaW1hcCBwbHVnaW5zIGFyZSBBdG9tIHBhY2thZ2VzIHRoYXQgd2lsbCBhdWdtZW50IHRoZSBtaW5pbWFwLlxuICogVGhleSBoYXZlIGEgc2Vjb25kYXJ5IGFjdGl2YXRpb24gY3ljbGUgZ29pbmcgb24gY29uc3RyYWluZWQgYnkgdGhlIG1pbmltYXBcbiAqIHBhY2thZ2UgYWN0aXZhdGlvbi4gQSBtaW5pbWFwIHBsdWdpbiBsaWZlIGN5Y2xlIHdpbGwgZ2VuZXJhbGx5IGxvb2tcbiAqIGxpa2UgdGhpczpcbiAqXG4gKiAxLiBUaGUgcGx1Z2luIG1vZHVsZSBpcyBhY3RpdmF0ZWQgYnkgQXRvbSB0aHJvdWdoIHRoZSBgYWN0aXZhdGVgIG1ldGhvZFxuICogMi4gVGhlIHBsdWdpbiB0aGVuIHJlZ2lzdGVyIGl0c2VsZiBhcyBhIG1pbmltYXAgcGx1Z2luIHVzaW5nIGByZWdpc3RlclBsdWdpbmBcbiAqIDMuIFRoZSBwbHVnaW4gaXMgYWN0aXZhdGVkL2RlYWN0aXZhdGVkIGFjY29yZGluZyB0byB0aGUgbWluaW1hcCBzZXR0aW5ncy5cbiAqIDQuIE9uIHRoZSBwbHVnaW4gbW9kdWxlIGRlYWN0aXZhdGlvbiwgdGhlIHBsdWdpbiBtdXN0IHVucmVnaXN0ZXJzIGl0c2VsZlxuICogICAgZnJvbSB0aGUgbWluaW1hcCB1c2luZyB0aGUgYHVucmVnaXN0ZXJQbHVnaW5gLlxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsdWdpbk1hbmFnZW1lbnQgZXh0ZW5kcyBNaXhpbiB7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBNaW5pbWFwIG1haW4gbW9kdWxlIGluc3RhbmNlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtNYWlufSBUaGUgTWluaW1hcCBtYWluIG1vZHVsZSBpbnN0YW5jZS5cbiAgICovXG4gIHByb3ZpZGVNaW5pbWFwU2VydmljZVYxICgpIHsgcmV0dXJuIHRoaXMgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgcHJvcGVydGllcyBmb3IgcGx1Z2lucycgbWFuYWdlbWVudC5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplUGx1Z2lucyAoKSB7XG4gICAgLyoqXG4gICAgICogVGhlIHJlZ2lzdGVyZWQgTWluaW1hcCBwbHVnaW5zIHN0b3JlZCB1c2luZyB0aGVpciBuYW1lIGFzIGtleS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5wbHVnaW5zID0ge31cbiAgICAvKipcbiAgICAgKiBUaGUgcGx1Z2lucycgc3Vic2NyaXB0aW9ucyBzdG9yZWQgdXNpbmcgdGhlIHBsdWdpbiBuYW1lcyBhcyBrZXlzLlxuICAgICAqXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnBsdWdpbnNTdWJzY3JpcHRpb25zID0ge31cblxuICAgIC8qKlxuICAgICAqIEEgbWFwIHRoYXQgc3RvcmVzIHRoZSBkaXNwbGF5IG9yZGVyIGZvciBlYWNoIHBsdWdpblxuICAgICAqXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnBsdWdpbnNPcmRlck1hcCA9IHt9XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgbWluaW1hcCBgcGx1Z2luYCB3aXRoIHRoZSBnaXZlbiBgbmFtZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBpZGVudGlmeWluZyBuYW1lIG9mIHRoZSBwbHVnaW4uXG4gICAqICAgICAgICAgICAgICAgICAgICAgIEl0IHdpbGwgYmUgdXNlZCBhcyBhY3RpdmF0aW9uIHNldHRpbmdzIG5hbWVcbiAgICogICAgICAgICAgICAgICAgICAgICAgYXMgd2VsbCBhcyB0aGUga2V5IHRvIHVucmVnaXN0ZXIgdGhlIG1vZHVsZS5cbiAgICogQHBhcmFtIHtNaW5pbWFwUGx1Z2lufSBwbHVnaW4gVGhlIHBsdWdpbiB0byByZWdpc3Rlci5cbiAgICogQGVtaXRzIHtkaWQtYWRkLXBsdWdpbn0gd2l0aCB0aGUgbmFtZSBhbmQgYSByZWZlcmVuY2UgdG8gdGhlIGFkZGVkIHBsdWdpbi5cbiAgICogQGVtaXRzIHtkaWQtYWN0aXZhdGUtcGx1Z2lufSBpZiB0aGUgcGx1Z2luIHdhcyBhY3RpdmF0ZWQgZHVyaW5nXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIHJlZ2lzdHJhdGlvbi5cbiAgICovXG4gIHJlZ2lzdGVyUGx1Z2luIChuYW1lLCBwbHVnaW4pIHtcbiAgICBpZiAoIUNvbXBvc2l0ZURpc3Bvc2FibGUpIHtcbiAgICAgIENvbXBvc2l0ZURpc3Bvc2FibGUgPSByZXF1aXJlKCdhdG9tJykuQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIH1cblxuICAgIHRoaXMucGx1Z2luc1tuYW1lXSA9IHBsdWdpblxuICAgIHRoaXMucGx1Z2luc1N1YnNjcmlwdGlvbnNbbmFtZV0gPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICBsZXQgZXZlbnQgPSB7IG5hbWU6IG5hbWUsIHBsdWdpbjogcGx1Z2luIH1cbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWFkZC1wbHVnaW4nLCBldmVudClcblxuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scycpKSB7XG4gICAgICB0aGlzLnJlZ2lzdGVyUGx1Z2luQ29udHJvbHMobmFtZSwgcGx1Z2luKVxuICAgIH1cblxuICAgIHRoaXMudXBkYXRlc1BsdWdpbkFjdGl2YXRpb25TdGF0ZShuYW1lKVxuICB9XG5cbiAgLyoqXG4gICAqIFVucmVnaXN0ZXJzIGEgcGx1Z2luIGZyb20gdGhlIG1pbmltYXAuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBpZGVudGlmeWluZyBuYW1lIG9mIHRoZSBwbHVnaW4gdG8gdW5yZWdpc3Rlci5cbiAgICogQGVtaXRzIHtkaWQtcmVtb3ZlLXBsdWdpbn0gd2l0aCB0aGUgbmFtZSBhbmQgYSByZWZlcmVuY2VcbiAgICogICAgICAgIHRvIHRoZSBhZGRlZCBwbHVnaW4uXG4gICAqL1xuICB1bnJlZ2lzdGVyUGx1Z2luIChuYW1lKSB7XG4gICAgbGV0IHBsdWdpbiA9IHRoaXMucGx1Z2luc1tuYW1lXVxuXG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnbWluaW1hcC5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzJykpIHtcbiAgICAgIHRoaXMudW5yZWdpc3RlclBsdWdpbkNvbnRyb2xzKG5hbWUpXG4gICAgfVxuXG4gICAgZGVsZXRlIHRoaXMucGx1Z2luc1tuYW1lXVxuXG4gICAgbGV0IGV2ZW50ID0geyBuYW1lOiBuYW1lLCBwbHVnaW46IHBsdWdpbiB9XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1yZW1vdmUtcGx1Z2luJywgZXZlbnQpXG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgc3BlY2lmaWVkIHBsdWdpbiBhY3RpdmF0aW9uIHN0YXRlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IG5hbWUgICAgIFRoZSBuYW1lIG9mIHRoZSBwbHVnaW4uXG4gICAqIEBwYXJhbSAge2Jvb2xlYW59IGJvb2xlYW4gQW4gb3B0aW9uYWwgYm9vbGVhbiB0byBzZXQgdGhlIGFjdGl2YXRpb25cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZSBvZiB0aGUgcGx1Z2luLiBJZiBvbW1pdHRlZCB0aGUgbmV3IHBsdWdpblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlIHdpbGwgYmUgdGhlIHRoZSBpbnZlcnNlIG9mIGl0cyBjdXJyZW50XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuXG4gICAqIEBlbWl0cyB7ZGlkLWFjdGl2YXRlLXBsdWdpbn0gaWYgdGhlIHBsdWdpbiB3YXMgYWN0aXZhdGVkIGJ5IHRoZSBjYWxsLlxuICAgKiBAZW1pdHMge2RpZC1kZWFjdGl2YXRlLXBsdWdpbn0gaWYgdGhlIHBsdWdpbiB3YXMgZGVhY3RpdmF0ZWQgYnkgdGhlIGNhbGwuXG4gICAqL1xuICB0b2dnbGVQbHVnaW5BY3RpdmF0aW9uIChuYW1lLCBib29sZWFuKSB7XG4gICAgbGV0IHNldHRpbmdzS2V5ID0gYG1pbmltYXAucGx1Z2lucy4ke25hbWV9YFxuXG4gICAgaWYgKGJvb2xlYW4gIT09IHVuZGVmaW5lZCAmJiBib29sZWFuICE9PSBudWxsKSB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoc2V0dGluZ3NLZXksIGJvb2xlYW4pXG4gICAgfSBlbHNlIHtcbiAgICAgIGF0b20uY29uZmlnLnNldChzZXR0aW5nc0tleSwgIWF0b20uY29uZmlnLmdldChzZXR0aW5nc0tleSkpXG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVzUGx1Z2luQWN0aXZhdGlvblN0YXRlKG5hbWUpXG4gIH1cblxuICAvKipcbiAgICogRGVhY3RpdmF0ZXMgYWxsIHRoZSBwbHVnaW5zIHJlZ2lzdGVyZWQgaW4gdGhlIG1pbmltYXAgcGFja2FnZSBzbyBmYXIuXG4gICAqXG4gICAqIEBlbWl0cyB7ZGlkLWRlYWN0aXZhdGUtcGx1Z2lufSBmb3IgZWFjaCBwbHVnaW4gZGVhY3RpdmF0ZWQgYnkgdGhlIGNhbGwuXG4gICAqL1xuICBkZWFjdGl2YXRlQWxsUGx1Z2lucyAoKSB7XG4gICAgZm9yIChsZXQgW25hbWUsIHBsdWdpbl0gb2YgdGhpcy5lYWNoUGx1Z2luKCkpIHtcbiAgICAgIHBsdWdpbi5kZWFjdGl2YXRlUGx1Z2luKClcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtZGVhY3RpdmF0ZS1wbHVnaW4nLCB7IG5hbWU6IG5hbWUsIHBsdWdpbjogcGx1Z2luIH0pXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgZ2VuZXJhdG9yIGZ1bmN0aW9uIHRvIGl0ZXJhdGUgb3ZlciByZWdpc3RlcmVkIHBsdWdpbnMuXG4gICAqXG4gICAqIEByZXR1cm4gQW4gaXRlcmFibGUgdGhhdCB5aWVsZCB0aGUgbmFtZSBhbmQgcmVmZXJlbmNlIHRvIGV2ZXJ5IHBsdWdpblxuICAgKiAgICAgICAgIGFzIGFuIGFycmF5IGluIGVhY2ggaXRlcmF0aW9uLlxuICAgKi9cbiAgKiBlYWNoUGx1Z2luICgpIHtcbiAgICBmb3IgKGxldCBuYW1lIGluIHRoaXMucGx1Z2lucykge1xuICAgICAgeWllbGQgW25hbWUsIHRoaXMucGx1Z2luc1tuYW1lXV1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgcGx1Z2luIGFjdGl2YXRpb24gc3RhdGUgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IGNvbmZpZy5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIGlkZW50aWZ5aW5nIG5hbWUgb2YgdGhlIHBsdWdpbiB0byB1cGRhdGUuXG4gICAqIEBlbWl0cyB7ZGlkLWFjdGl2YXRlLXBsdWdpbn0gaWYgdGhlIHBsdWdpbiB3YXMgYWN0aXZhdGVkIGJ5IHRoZSBjYWxsLlxuICAgKiBAZW1pdHMge2RpZC1kZWFjdGl2YXRlLXBsdWdpbn0gaWYgdGhlIHBsdWdpbiB3YXMgZGVhY3RpdmF0ZWQgYnkgdGhlIGNhbGwuXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgdXBkYXRlc1BsdWdpbkFjdGl2YXRpb25TdGF0ZSAobmFtZSkge1xuICAgIGNvbnN0IHBsdWdpbiA9IHRoaXMucGx1Z2luc1tuYW1lXVxuICAgIGNvbnN0IHBsdWdpbkFjdGl2ZSA9IHBsdWdpbi5pc0FjdGl2ZSgpXG4gICAgY29uc3Qgc2V0dGluZ0FjdGl2ZSA9IGF0b20uY29uZmlnLmdldChgbWluaW1hcC5wbHVnaW5zLiR7bmFtZX1gKVxuXG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnbWluaW1hcC5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzJykpIHtcbiAgICAgIGlmIChzZXR0aW5nQWN0aXZlICYmICFwbHVnaW5BY3RpdmUpIHtcbiAgICAgICAgdGhpcy5hY3RpdmF0ZVBsdWdpbihuYW1lLCBwbHVnaW4pXG4gICAgICB9IGVsc2UgaWYgKHBsdWdpbkFjdGl2ZSAmJiAhc2V0dGluZ0FjdGl2ZSkge1xuICAgICAgICB0aGlzLmRlYWN0aXZhdGVQbHVnaW4obmFtZSwgcGx1Z2luKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXBsdWdpbkFjdGl2ZSkge1xuICAgICAgICB0aGlzLmFjdGl2YXRlUGx1Z2luKG5hbWUsIHBsdWdpbilcbiAgICAgIH0gZWxzZSBpZiAocGx1Z2luQWN0aXZlKSB7XG4gICAgICAgIHRoaXMuZGVhY3RpdmF0ZVBsdWdpbihuYW1lLCBwbHVnaW4pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYWN0aXZhdGVQbHVnaW4gKG5hbWUsIHBsdWdpbikge1xuICAgIGNvbnN0IGV2ZW50ID0geyBuYW1lOiBuYW1lLCBwbHVnaW46IHBsdWdpbiB9XG5cbiAgICBwbHVnaW4uYWN0aXZhdGVQbHVnaW4oKVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtYWN0aXZhdGUtcGx1Z2luJywgZXZlbnQpXG4gIH1cblxuICBkZWFjdGl2YXRlUGx1Z2luIChuYW1lLCBwbHVnaW4pIHtcbiAgICBjb25zdCBldmVudCA9IHsgbmFtZTogbmFtZSwgcGx1Z2luOiBwbHVnaW4gfVxuXG4gICAgcGx1Z2luLmRlYWN0aXZhdGVQbHVnaW4oKVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtZGVhY3RpdmF0ZS1wbHVnaW4nLCBldmVudClcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIHRoZSBgbWluaW1hcC5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzYCBzZXR0aW5nIGlzIHRvZ2dsZWQsXG4gICAqIHRoaXMgZnVuY3Rpb24gd2lsbCByZWdpc3RlciB0aGUgY29tbWFuZHMgYW5kIHNldHRpbmcgdG8gbWFuYWdlIHRoZSBwbHVnaW5cbiAgICogYWN0aXZhdGlvbiBmcm9tIHRoZSBtaW5pbWFwIHNldHRpbmdzLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgaWRlbnRpZnlpbmcgbmFtZSBvZiB0aGUgcGx1Z2luLlxuICAgKiBAcGFyYW0ge01pbmltYXBQbHVnaW59IHBsdWdpbiBUaGUgcGx1Z2luIGluc3RhbmNlIHRvIHJlZ2lzdGVyXG4gICAqICAgICAgICBjb250cm9scyBmb3IuXG4gICAqIEBsaXN0ZW5zIHttaW5pbWFwLnBsdWdpbnMuJHtuYW1lfX0gbGlzdGVuIHRvIHRoZSBzZXR0aW5nIHRvIHVwZGF0ZVxuICAgKiAgICAgICAgICB0aGUgcGx1Z2luIHN0YXRlIGFjY29yZGluZ2x5LlxuICAgKiBAbGlzdGVucyB7bWluaW1hcDp0b2dnbGUtJHtuYW1lfX0gbGlzdGVuIHRvIHRoZSBjb21tYW5kIG9uIGBhdG9tLXdvcmtzcGFjZWBcbiAgICogICAgICAgICAgdG8gdG9nZ2xlIHRoZSBwbHVnaW4gc3RhdGUuXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgcmVnaXN0ZXJQbHVnaW5Db250cm9scyAobmFtZSwgcGx1Z2luKSB7XG4gICAgY29uc3Qgc2V0dGluZ3NLZXkgPSBgbWluaW1hcC5wbHVnaW5zLiR7bmFtZX1gXG4gICAgY29uc3Qgb3JkZXJTZXR0aW5nc0tleSA9IGBtaW5pbWFwLnBsdWdpbnMuJHtuYW1lfURlY29yYXRpb25zWkluZGV4YFxuXG4gICAgY29uc3QgY29uZmlnID0gdGhpcy5nZXRDb25maWdTY2hlbWEoKVxuXG4gICAgY29uZmlnLnBsdWdpbnMucHJvcGVydGllc1tuYW1lXSA9IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIHRpdGxlOiBuYW1lLFxuICAgICAgZGVzY3JpcHRpb246IGBXaGV0aGVyIHRoZSAke25hbWV9IHBsdWdpbiBpcyBhY3RpdmF0ZWQgYW5kIGRpc3BsYXllZCBpbiB0aGUgTWluaW1hcC5gLFxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH1cblxuICAgIGNvbmZpZy5wbHVnaW5zLnByb3BlcnRpZXNbYCR7bmFtZX1EZWNvcmF0aW9uc1pJbmRleGBdID0ge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgdGl0bGU6IGAke25hbWV9IGRlY29yYXRpb25zIG9yZGVyYCxcbiAgICAgIGRlc2NyaXB0aW9uOiBgVGhlIHJlbGF0aXZlIG9yZGVyIG9mIHRoZSAke25hbWV9IHBsdWdpbidzIGRlY29yYXRpb25zIGluIHRoZSBsYXllciBpbnRvIHdoaWNoIHRoZXkgYXJlIGRyYXduLiBOb3RlIHRoYXQgdGhpcyBvcmRlciBvbmx5IGFwcGx5IGluc2lkZSBhIGxheWVyLCBzbyBoaWdobGlnaHQtb3ZlciBkZWNvcmF0aW9ucyB3aWxsIGFsd2F5cyBiZSBkaXNwbGF5ZWQgYWJvdmUgbGluZSBkZWNvcmF0aW9ucyBhcyB0aGV5IGFyZSByZW5kZXJlZCBpbiBkaWZmZXJlbnQgbGF5ZXJzLmAsXG4gICAgICBkZWZhdWx0OiAwXG4gICAgfVxuXG4gICAgaWYgKGF0b20uY29uZmlnLmdldChzZXR0aW5nc0tleSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYXRvbS5jb25maWcuc2V0KHNldHRpbmdzS2V5LCB0cnVlKVxuICAgIH1cblxuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQob3JkZXJTZXR0aW5nc0tleSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYXRvbS5jb25maWcuc2V0KG9yZGVyU2V0dGluZ3NLZXksIDApXG4gICAgfVxuXG4gICAgdGhpcy5wbHVnaW5zU3Vic2NyaXB0aW9uc1tuYW1lXS5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZShzZXR0aW5nc0tleSwgKCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVzUGx1Z2luQWN0aXZhdGlvblN0YXRlKG5hbWUpXG4gICAgfSkpXG5cbiAgICB0aGlzLnBsdWdpbnNTdWJzY3JpcHRpb25zW25hbWVdLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKG9yZGVyU2V0dGluZ3NLZXksIChvcmRlcikgPT4ge1xuICAgICAgdGhpcy51cGRhdGVQbHVnaW5zT3JkZXJNYXAobmFtZSlcbiAgICAgIGNvbnN0IGV2ZW50ID0geyBuYW1lOiBuYW1lLCBwbHVnaW46IHBsdWdpbiwgb3JkZXI6IG9yZGVyIH1cbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXBsdWdpbi1vcmRlcicsIGV2ZW50KVxuICAgIH0pKVxuXG4gICAgdGhpcy5wbHVnaW5zU3Vic2NyaXB0aW9uc1tuYW1lXS5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgW2BtaW5pbWFwOnRvZ2dsZS0ke25hbWV9YF06ICgpID0+IHtcbiAgICAgICAgdGhpcy50b2dnbGVQbHVnaW5BY3RpdmF0aW9uKG5hbWUpXG4gICAgICB9XG4gICAgfSkpXG5cbiAgICB0aGlzLnVwZGF0ZVBsdWdpbnNPcmRlck1hcChuYW1lKVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGRpc3BsYXkgb3JkZXIgaW4gdGhlIG1hcCBmb3IgdGhlIHBhc3NlZC1pbiBwbHVnaW4gbmFtZS5cbiAgICpcbiAgICogQHBhcmFtICB7c3RyaW5nfSBuYW1lIHRoZSBuYW1lIG9mIHRoZSBwbHVnaW4gdG8gdXBkYXRlXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgdXBkYXRlUGx1Z2luc09yZGVyTWFwIChuYW1lKSB7XG4gICAgY29uc3Qgb3JkZXJTZXR0aW5nc0tleSA9IGBtaW5pbWFwLnBsdWdpbnMuJHtuYW1lfURlY29yYXRpb25zWkluZGV4YFxuXG4gICAgdGhpcy5wbHVnaW5zT3JkZXJNYXBbbmFtZV0gPSBhdG9tLmNvbmZpZy5nZXQob3JkZXJTZXR0aW5nc0tleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwbHVnaW5zIGRpc3BsYXkgb3JkZXIgbWFwcGVkIGJ5IG5hbWUuXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gVGhlIHBsdWdpbnMgb3JkZXIgYnkgbmFtZVxuICAgKi9cbiAgZ2V0UGx1Z2luc09yZGVyICgpIHsgcmV0dXJuIHRoaXMucGx1Z2luc09yZGVyTWFwIH1cblxuICAvKipcbiAgICogV2hlbiB0aGUgYG1pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9sc2Agc2V0dGluZyBpcyB0b2dnbGVkLFxuICAgKiB0aGlzIGZ1bmN0aW9uIHdpbGwgdW5yZWdpc3RlciB0aGUgY29tbWFuZHMgYW5kIHNldHRpbmcgdGhhdFxuICAgKiB3YXMgY3JlYXRlZCBwcmV2aW91c2x5LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgaWRlbnRpZnlpbmcgbmFtZSBvZiB0aGUgcGx1Z2luLlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHVucmVnaXN0ZXJQbHVnaW5Db250cm9scyAobmFtZSkge1xuICAgIHRoaXMucGx1Z2luc1N1YnNjcmlwdGlvbnNbbmFtZV0uZGlzcG9zZSgpXG4gICAgZGVsZXRlIHRoaXMucGx1Z2luc1N1YnNjcmlwdGlvbnNbbmFtZV1cbiAgICBkZWxldGUgdGhpcy5nZXRDb25maWdTY2hlbWEoKS5wbHVnaW5zLnByb3BlcnRpZXNbbmFtZV1cbiAgfVxufVxuIl19
//# sourceURL=/home/takaaki/.atom/packages/minimap/lib/mixins/plugin-management.js
