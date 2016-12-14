Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _atomUtils = require('atom-utils');

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

var _decoratorsElement = require('./decorators/element');

var _decoratorsElement2 = _interopRequireDefault(_decoratorsElement);

var _decoratorsInclude = require('./decorators/include');

var _decoratorsInclude2 = _interopRequireDefault(_decoratorsInclude);

/**
 * @access private
 */
'use babel';

var MinimapQuickSettingsElement = (function () {
  function MinimapQuickSettingsElement() {
    _classCallCheck(this, _MinimapQuickSettingsElement);
  }

  _createClass(MinimapQuickSettingsElement, [{
    key: 'createdCallback',
    value: function createdCallback() {
      this.buildContent();
    }
  }, {
    key: 'setModel',
    value: function setModel(minimap) {
      var _this = this;

      this.selectedItem = null;
      this.minimap = minimap;
      this.emitter = new _atom.Emitter();
      this.subscriptions = new _atom.CompositeDisposable();
      this.plugins = {};
      this.itemsActions = new WeakMap();

      var subs = this.subscriptions;

      subs.add(_main2['default'].onDidAddPlugin(function (_ref) {
        var name = _ref.name;
        var plugin = _ref.plugin;

        return _this.addItemFor(name, plugin);
      }));
      subs.add(_main2['default'].onDidRemovePlugin(function (_ref2) {
        var name = _ref2.name;
        var plugin = _ref2.plugin;

        return _this.removeItemFor(name, plugin);
      }));
      subs.add(_main2['default'].onDidActivatePlugin(function (_ref3) {
        var name = _ref3.name;
        var plugin = _ref3.plugin;

        return _this.activateItem(name, plugin);
      }));
      subs.add(_main2['default'].onDidDeactivatePlugin(function (_ref4) {
        var name = _ref4.name;
        var plugin = _ref4.plugin;

        return _this.deactivateItem(name, plugin);
      }));

      subs.add(atom.commands.add('minimap-quick-settings', {
        'core:move-up': function coreMoveUp() {
          _this.selectPreviousItem();
        },
        'core:move-down': function coreMoveDown() {
          _this.selectNextItem();
        },
        'core:move-left': function coreMoveLeft() {
          atom.config.set('minimap.displayMinimapOnLeft', true);
        },
        'core:move-right': function coreMoveRight() {
          atom.config.set('minimap.displayMinimapOnLeft', false);
        },
        'core:cancel': function coreCancel() {
          _this.destroy();
        },
        'core:confirm': function coreConfirm() {
          _this.toggleSelectedItem();
        }
      }));

      this.codeHighlights.classList.toggle('active', this.minimap.displayCodeHighlights);

      subs.add(this.subscribeTo(this.codeHighlights, {
        'mousedown': function mousedown(e) {
          e.preventDefault();
          atom.config.set('minimap.displayCodeHighlights', !_this.minimap.displayCodeHighlights);
        }
      }));

      this.itemsActions.set(this.codeHighlights, function () {
        atom.config.set('minimap.displayCodeHighlights', !_this.minimap.displayCodeHighlights);
      });

      subs.add(this.subscribeTo(this.absoluteMode, {
        'mousedown': function mousedown(e) {
          e.preventDefault();
          atom.config.set('minimap.absoluteMode', !atom.config.get('minimap.absoluteMode'));
        }
      }));

      this.itemsActions.set(this.absoluteMode, function () {
        atom.config.set('minimap.absoluteMode', !atom.config.get('minimap.absoluteMode'));
      });

      subs.add(this.subscribeTo(this.adjustAbsoluteModeHeight, {
        'mousedown': function mousedown(e) {
          e.preventDefault();
          atom.config.set('minimap.adjustAbsoluteModeHeight', !atom.config.get('minimap.adjustAbsoluteModeHeight'));
        }
      }));

      this.itemsActions.set(this.adjustAbsoluteModeHeight, function () {
        atom.config.set('minimap.adjustAbsoluteModeHeight', !atom.config.get('minimap.adjustAbsoluteModeHeight'));
      });

      subs.add(this.subscribeTo(this.hiddenInput, {
        'focusout': function focusout(e) {
          _this.destroy();
        }
      }));

      subs.add(this.subscribeTo(this.onLeftButton, {
        'mousedown': function mousedown(e) {
          e.preventDefault();
          atom.config.set('minimap.displayMinimapOnLeft', true);
        }
      }));

      subs.add(this.subscribeTo(this.onRightButton, {
        'mousedown': function mousedown(e) {
          e.preventDefault();
          atom.config.set('minimap.displayMinimapOnLeft', false);
        }
      }));

      subs.add(atom.config.observe('minimap.displayCodeHighlights', function (bool) {
        _this.codeHighlights.classList.toggle('active', bool);
      }));

      subs.add(atom.config.observe('minimap.absoluteMode', function (bool) {
        _this.absoluteMode.classList.toggle('active', bool);
      }));

      subs.add(atom.config.observe('minimap.adjustAbsoluteModeHeight', function (bool) {
        _this.adjustAbsoluteModeHeight.classList.toggle('active', bool);
      }));

      subs.add(atom.config.observe('minimap.displayMinimapOnLeft', function (bool) {
        _this.onLeftButton.classList.toggle('selected', bool);
        _this.onRightButton.classList.toggle('selected', !bool);
      }));

      this.initList();
    }
  }, {
    key: 'onDidDestroy',
    value: function onDidDestroy(callback) {
      return this.emitter.on('did-destroy', callback);
    }
  }, {
    key: 'attach',
    value: function attach() {
      var workspaceElement = atom.views.getView(atom.workspace);
      workspaceElement.appendChild(this);
      this.hiddenInput.focus();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.emitter.emit('did-destroy');
      this.subscriptions.dispose();
      this.parentNode.removeChild(this);
    }
  }, {
    key: 'initList',
    value: function initList() {
      this.itemsDisposables = new WeakMap();
      for (var _name in _main2['default'].plugins) {
        this.addItemFor(_name, _main2['default'].plugins[_name]);
      }
    }
  }, {
    key: 'toggleSelectedItem',
    value: function toggleSelectedItem() {
      var fn = this.itemsActions.get(this.selectedItem);
      if (typeof fn === 'function') {
        fn();
      }
    }
  }, {
    key: 'selectNextItem',
    value: function selectNextItem() {
      this.selectedItem.classList.remove('selected');
      if (this.selectedItem.nextSibling != null) {
        this.selectedItem = this.selectedItem.nextSibling;
        if (this.selectedItem.matches('.separator')) {
          this.selectedItem = this.selectedItem.nextSibling;
        }
      } else {
        this.selectedItem = this.list.firstChild;
      }
      this.selectedItem.classList.add('selected');
    }
  }, {
    key: 'selectPreviousItem',
    value: function selectPreviousItem() {
      this.selectedItem.classList.remove('selected');
      if (this.selectedItem.previousSibling != null) {
        this.selectedItem = this.selectedItem.previousSibling;
        if (this.selectedItem.matches('.separator')) {
          this.selectedItem = this.selectedItem.previousSibling;
        }
      } else {
        this.selectedItem = this.list.lastChild;
      }
      this.selectedItem.classList.add('selected');
    }
  }, {
    key: 'addItemFor',
    value: function addItemFor(name, plugin) {
      var item = document.createElement('li');
      var action = function action() {
        _main2['default'].togglePluginActivation(name);
      };

      if (plugin.isActive()) {
        item.classList.add('active');
      }

      item.textContent = name;

      this.itemsActions.set(item, action);
      this.itemsDisposables.set(item, this.addDisposableEventListener(item, 'mousedown', function (e) {
        e.preventDefault();
        action();
      }));

      this.plugins[name] = item;
      this.list.insertBefore(item, this.separator);

      if (!(this.selectedItem != null)) {
        this.selectedItem = item;
        this.selectedItem.classList.add('selected');
      }
    }
  }, {
    key: 'removeItemFor',
    value: function removeItemFor(name, plugin) {
      try {
        this.list.removeChild(this.plugins[name]);
      } catch (error) {}

      delete this.plugins[name];
    }
  }, {
    key: 'activateItem',
    value: function activateItem(name, plugin) {
      this.plugins[name].classList.add('active');
    }
  }, {
    key: 'deactivateItem',
    value: function deactivateItem(name, plugin) {
      this.plugins[name].classList.remove('active');
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this2 = this;

      this.div({ 'class': 'select-list popover-list minimap-quick-settings' }, function () {
        _this2.input({ type: 'text', 'class': 'hidden-input', outlet: 'hiddenInput' });
        _this2.ol({ 'class': 'list-group mark-active', outlet: 'list' }, function () {
          _this2.li({ 'class': 'separator', outlet: 'separator' });
          _this2.li({ 'class': 'code-highlights', outlet: 'codeHighlights' }, 'code-highlights');
          _this2.li({ 'class': 'absolute-mode', outlet: 'absoluteMode' }, 'absolute-mode');
          _this2.li({ 'class': 'adjust-absolute-mode-height', outlet: 'adjustAbsoluteModeHeight' }, 'adjust-absolute-mode-height');
        });
        _this2.div({ 'class': 'btn-group' }, function () {
          _this2.button({ 'class': 'btn btn-default', outlet: 'onLeftButton' }, 'On Left');
          _this2.button({ 'class': 'btn btn-default', outlet: 'onRightButton' }, 'On Right');
        });
      });
    }
  }]);

  var _MinimapQuickSettingsElement = MinimapQuickSettingsElement;
  MinimapQuickSettingsElement = (0, _decoratorsInclude2['default'])(_atomUtils.EventsDelegation, _atomUtils.SpacePenDSL.Babel)(MinimapQuickSettingsElement) || MinimapQuickSettingsElement;
  MinimapQuickSettingsElement = (0, _decoratorsElement2['default'])('minimap-quick-settings')(MinimapQuickSettingsElement) || MinimapQuickSettingsElement;
  return MinimapQuickSettingsElement;
})();

exports['default'] = MinimapQuickSettingsElement;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvbWluaW1hcC1xdWljay1zZXR0aW5ncy1lbGVtZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRTJDLE1BQU07O3lCQUNMLFlBQVk7O29CQUV2QyxRQUFROzs7O2lDQUNMLHNCQUFzQjs7OztpQ0FDdEIsc0JBQXNCOzs7Ozs7O0FBUDFDLFdBQVcsQ0FBQTs7SUFjVSwyQkFBMkI7V0FBM0IsMkJBQTJCOzs7O2VBQTNCLDJCQUEyQjs7V0FrQjlCLDJCQUFHO0FBQ2pCLFVBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtLQUNwQjs7O1dBRVEsa0JBQUMsT0FBTyxFQUFFOzs7QUFDakIsVUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUE7QUFDeEIsVUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7QUFDdEIsVUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBYSxDQUFBO0FBQzVCLFVBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7QUFDOUMsVUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUE7QUFDakIsVUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFBOztBQUVqQyxVQUFJLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFBOztBQUU3QixVQUFJLENBQUMsR0FBRyxDQUFDLGtCQUFLLGNBQWMsQ0FBQyxVQUFDLElBQWMsRUFBSztZQUFsQixJQUFJLEdBQUwsSUFBYyxDQUFiLElBQUk7WUFBRSxNQUFNLEdBQWIsSUFBYyxDQUFQLE1BQU07O0FBQ3pDLGVBQU8sTUFBSyxVQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFBO09BQ3JDLENBQUMsQ0FBQyxDQUFBO0FBQ0gsVUFBSSxDQUFDLEdBQUcsQ0FBQyxrQkFBSyxpQkFBaUIsQ0FBQyxVQUFDLEtBQWMsRUFBSztZQUFsQixJQUFJLEdBQUwsS0FBYyxDQUFiLElBQUk7WUFB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RUFBQyxFQUFFLDZCQUE2QixDQUFDLENBQUE7U0FDbkgsQ0FBQyxDQUFBO0FBQ0YsZUFBSyxHQUFHLENBQUMsRUFBQyxTQUFPLFdBQVcsRUFBQyxFQUFFLFlBQU07QUFDbkMsaUJBQUssTUFBTSxDQUFDLEVBQUMsU0FBTyxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFDLEVBQUUsU0FBUyxDQUFDLENBQUE7QUFDMUUsaUJBQUssTUFBTSxDQUFDLEVBQUMsU0FBTyxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFDLEVBQUUsVUFBVSxDQUFDLENBQUE7U0FDN0UsQ0FBQyxDQUFBO09BQ0gsQ0FBQyxDQUFBO0tBQ0g7OztxQ0FoQmtCLDJCQUEyQjtBQUEzQiw2QkFBMkIsR0FEL0MsaUVBQTBCLHVCQUFZLEtBQUssQ0FBQyxDQUN4QiwyQkFBMkIsS0FBM0IsMkJBQTJCO0FBQTNCLDZCQUEyQixHQUYvQyxvQ0FBUSx3QkFBd0IsQ0FBQyxDQUViLDJCQUEyQixLQUEzQiwyQkFBMkI7U0FBM0IsMkJBQTJCOzs7cUJBQTNCLDJCQUEyQiIsImZpbGUiOiIvaG9tZS90YWthYWtpLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvbGliL21pbmltYXAtcXVpY2stc2V0dGluZ3MtZWxlbWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlcn0gZnJvbSAnYXRvbSdcbmltcG9ydCB7RXZlbnRzRGVsZWdhdGlvbiwgU3BhY2VQZW5EU0x9IGZyb20gJ2F0b20tdXRpbHMnXG5cbmltcG9ydCBNYWluIGZyb20gJy4vbWFpbidcbmltcG9ydCBlbGVtZW50IGZyb20gJy4vZGVjb3JhdG9ycy9lbGVtZW50J1xuaW1wb3J0IGluY2x1ZGUgZnJvbSAnLi9kZWNvcmF0b3JzL2luY2x1ZGUnXG5cbi8qKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKi9cbkBlbGVtZW50KCdtaW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbkBpbmNsdWRlKEV2ZW50c0RlbGVnYXRpb24sIFNwYWNlUGVuRFNMLkJhYmVsKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWluaW1hcFF1aWNrU2V0dGluZ3NFbGVtZW50IHtcblxuICBzdGF0aWMgY29udGVudCAoKSB7XG4gICAgdGhpcy5kaXYoe2NsYXNzOiAnc2VsZWN0LWxpc3QgcG9wb3Zlci1saXN0IG1pbmltYXAtcXVpY2stc2V0dGluZ3MnfSwgKCkgPT4ge1xuICAgICAgdGhpcy5pbnB1dCh7dHlwZTogJ3RleHQnLCBjbGFzczogJ2hpZGRlbi1pbnB1dCcsIG91dGxldDogJ2hpZGRlbklucHV0J30pXG4gICAgICB0aGlzLm9sKHtjbGFzczogJ2xpc3QtZ3JvdXAgbWFyay1hY3RpdmUnLCBvdXRsZXQ6ICdsaXN0J30sICgpID0+IHtcbiAgICAgICAgdGhpcy5saSh7Y2xhc3M6ICdzZXBhcmF0b3InLCBvdXRsZXQ6ICdzZXBhcmF0b3InfSlcbiAgICAgICAgdGhpcy5saSh7Y2xhc3M6ICdjb2RlLWhpZ2hsaWdodHMnLCBvdXRsZXQ6ICdjb2RlSGlnaGxpZ2h0cyd9LCAnY29kZS1oaWdobGlnaHRzJylcbiAgICAgICAgdGhpcy5saSh7Y2xhc3M6ICdhYnNvbHV0ZS1tb2RlJywgb3V0bGV0OiAnYWJzb2x1dGVNb2RlJ30sICdhYnNvbHV0ZS1tb2RlJylcbiAgICAgICAgdGhpcy5saSh7Y2xhc3M6ICdhZGp1c3QtYWJzb2x1dGUtbW9kZS1oZWlnaHQnLCBvdXRsZXQ6ICdhZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQnfSwgJ2FkanVzdC1hYnNvbHV0ZS1tb2RlLWhlaWdodCcpXG4gICAgICB9KVxuICAgICAgdGhpcy5kaXYoe2NsYXNzOiAnYnRuLWdyb3VwJ30sICgpID0+IHtcbiAgICAgICAgdGhpcy5idXR0b24oe2NsYXNzOiAnYnRuIGJ0bi1kZWZhdWx0Jywgb3V0bGV0OiAnb25MZWZ0QnV0dG9uJ30sICdPbiBMZWZ0JylcbiAgICAgICAgdGhpcy5idXR0b24oe2NsYXNzOiAnYnRuIGJ0bi1kZWZhdWx0Jywgb3V0bGV0OiAnb25SaWdodEJ1dHRvbid9LCAnT24gUmlnaHQnKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgY3JlYXRlZENhbGxiYWNrICgpIHtcbiAgICB0aGlzLmJ1aWxkQ29udGVudCgpXG4gIH1cblxuICBzZXRNb2RlbCAobWluaW1hcCkge1xuICAgIHRoaXMuc2VsZWN0ZWRJdGVtID0gbnVsbFxuICAgIHRoaXMubWluaW1hcCA9IG1pbmltYXBcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMucGx1Z2lucyA9IHt9XG4gICAgdGhpcy5pdGVtc0FjdGlvbnMgPSBuZXcgV2Vha01hcCgpXG5cbiAgICBsZXQgc3VicyA9IHRoaXMuc3Vic2NyaXB0aW9uc1xuXG4gICAgc3Vicy5hZGQoTWFpbi5vbkRpZEFkZFBsdWdpbigoe25hbWUsIHBsdWdpbn0pID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmFkZEl0ZW1Gb3IobmFtZSwgcGx1Z2luKVxuICAgIH0pKVxuICAgIHN1YnMuYWRkKE1haW4ub25EaWRSZW1vdmVQbHVnaW4oKHtuYW1lLCBwbHVnaW59KSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW1vdmVJdGVtRm9yKG5hbWUsIHBsdWdpbilcbiAgICB9KSlcbiAgICBzdWJzLmFkZChNYWluLm9uRGlkQWN0aXZhdGVQbHVnaW4oKHtuYW1lLCBwbHVnaW59KSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5hY3RpdmF0ZUl0ZW0obmFtZSwgcGx1Z2luKVxuICAgIH0pKVxuICAgIHN1YnMuYWRkKE1haW4ub25EaWREZWFjdGl2YXRlUGx1Z2luKCh7bmFtZSwgcGx1Z2lufSkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuZGVhY3RpdmF0ZUl0ZW0obmFtZSwgcGx1Z2luKVxuICAgIH0pKVxuXG4gICAgc3Vicy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ21pbmltYXAtcXVpY2stc2V0dGluZ3MnLCB7XG4gICAgICAnY29yZTptb3ZlLXVwJzogKCkgPT4ge1xuICAgICAgICB0aGlzLnNlbGVjdFByZXZpb3VzSXRlbSgpXG4gICAgICB9LFxuICAgICAgJ2NvcmU6bW92ZS1kb3duJzogKCkgPT4ge1xuICAgICAgICB0aGlzLnNlbGVjdE5leHRJdGVtKClcbiAgICAgIH0sXG4gICAgICAnY29yZTptb3ZlLWxlZnQnOiAoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCcsIHRydWUpXG4gICAgICB9LFxuICAgICAgJ2NvcmU6bW92ZS1yaWdodCc6ICgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0JywgZmFsc2UpXG4gICAgICB9LFxuICAgICAgJ2NvcmU6Y2FuY2VsJzogKCkgPT4ge1xuICAgICAgICB0aGlzLmRlc3Ryb3koKVxuICAgICAgfSxcbiAgICAgICdjb3JlOmNvbmZpcm0nOiAoKSA9PiB7XG4gICAgICAgIHRoaXMudG9nZ2xlU2VsZWN0ZWRJdGVtKClcbiAgICAgIH1cbiAgICB9KSlcblxuICAgIHRoaXMuY29kZUhpZ2hsaWdodHMuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJywgdGhpcy5taW5pbWFwLmRpc3BsYXlDb2RlSGlnaGxpZ2h0cylcblxuICAgIHN1YnMuYWRkKHRoaXMuc3Vic2NyaWJlVG8odGhpcy5jb2RlSGlnaGxpZ2h0cywge1xuICAgICAgJ21vdXNlZG93bic6IChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheUNvZGVIaWdobGlnaHRzJywgIXRoaXMubWluaW1hcC5kaXNwbGF5Q29kZUhpZ2hsaWdodHMpXG4gICAgICB9XG4gICAgfSkpXG5cbiAgICB0aGlzLml0ZW1zQWN0aW9ucy5zZXQodGhpcy5jb2RlSGlnaGxpZ2h0cywgKCkgPT4ge1xuICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlDb2RlSGlnaGxpZ2h0cycsICF0aGlzLm1pbmltYXAuZGlzcGxheUNvZGVIaWdobGlnaHRzKVxuICAgIH0pXG5cbiAgICBzdWJzLmFkZCh0aGlzLnN1YnNjcmliZVRvKHRoaXMuYWJzb2x1dGVNb2RlLCB7XG4gICAgICAnbW91c2Vkb3duJzogKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5hYnNvbHV0ZU1vZGUnLCAhYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLmFic29sdXRlTW9kZScpKVxuICAgICAgfVxuICAgIH0pKVxuXG4gICAgdGhpcy5pdGVtc0FjdGlvbnMuc2V0KHRoaXMuYWJzb2x1dGVNb2RlLCAoKSA9PiB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuYWJzb2x1dGVNb2RlJywgIWF0b20uY29uZmlnLmdldCgnbWluaW1hcC5hYnNvbHV0ZU1vZGUnKSlcbiAgICB9KVxuXG4gICAgc3Vicy5hZGQodGhpcy5zdWJzY3JpYmVUbyh0aGlzLmFkanVzdEFic29sdXRlTW9kZUhlaWdodCwge1xuICAgICAgJ21vdXNlZG93bic6IChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0JywgIWF0b20uY29uZmlnLmdldCgnbWluaW1hcC5hZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQnKSlcbiAgICAgIH1cbiAgICB9KSlcblxuICAgIHRoaXMuaXRlbXNBY3Rpb25zLnNldCh0aGlzLmFkanVzdEFic29sdXRlTW9kZUhlaWdodCwgKCkgPT4ge1xuICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmFkanVzdEFic29sdXRlTW9kZUhlaWdodCcsICFhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0JykpXG4gICAgfSlcblxuICAgIHN1YnMuYWRkKHRoaXMuc3Vic2NyaWJlVG8odGhpcy5oaWRkZW5JbnB1dCwge1xuICAgICAgJ2ZvY3Vzb3V0JzogKGUpID0+IHsgdGhpcy5kZXN0cm95KCkgfVxuICAgIH0pKVxuXG4gICAgc3Vicy5hZGQodGhpcy5zdWJzY3JpYmVUbyh0aGlzLm9uTGVmdEJ1dHRvbiwge1xuICAgICAgJ21vdXNlZG93bic6IChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheU1pbmltYXBPbkxlZnQnLCB0cnVlKVxuICAgICAgfVxuICAgIH0pKVxuXG4gICAgc3Vicy5hZGQodGhpcy5zdWJzY3JpYmVUbyh0aGlzLm9uUmlnaHRCdXR0b24sIHtcbiAgICAgICdtb3VzZWRvd24nOiAoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0JywgZmFsc2UpXG4gICAgICB9XG4gICAgfSkpXG5cbiAgICBzdWJzLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdtaW5pbWFwLmRpc3BsYXlDb2RlSGlnaGxpZ2h0cycsIChib29sKSA9PiB7XG4gICAgICB0aGlzLmNvZGVIaWdobGlnaHRzLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScsIGJvb2wpXG4gICAgfSkpXG5cbiAgICBzdWJzLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdtaW5pbWFwLmFic29sdXRlTW9kZScsIChib29sKSA9PiB7XG4gICAgICB0aGlzLmFic29sdXRlTW9kZS5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnLCBib29sKVxuICAgIH0pKVxuXG4gICAgc3Vicy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbWluaW1hcC5hZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQnLCAoYm9vbCkgPT4ge1xuICAgICAgdGhpcy5hZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJywgYm9vbClcbiAgICB9KSlcblxuICAgIHN1YnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ21pbmltYXAuZGlzcGxheU1pbmltYXBPbkxlZnQnLCAoYm9vbCkgPT4ge1xuICAgICAgdGhpcy5vbkxlZnRCdXR0b24uY2xhc3NMaXN0LnRvZ2dsZSgnc2VsZWN0ZWQnLCBib29sKVxuICAgICAgdGhpcy5vblJpZ2h0QnV0dG9uLmNsYXNzTGlzdC50b2dnbGUoJ3NlbGVjdGVkJywgIWJvb2wpXG4gICAgfSkpXG5cbiAgICB0aGlzLmluaXRMaXN0KClcbiAgfVxuXG4gIG9uRGlkRGVzdHJveSAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtZGVzdHJveScsIGNhbGxiYWNrKVxuICB9XG5cbiAgYXR0YWNoICgpIHtcbiAgICBsZXQgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICB3b3Jrc3BhY2VFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMpXG4gICAgdGhpcy5oaWRkZW5JbnB1dC5mb2N1cygpXG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWRlc3Ryb3knKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcylcbiAgfVxuXG4gIGluaXRMaXN0ICgpIHtcbiAgICB0aGlzLml0ZW1zRGlzcG9zYWJsZXMgPSBuZXcgV2Vha01hcCgpXG4gICAgZm9yIChsZXQgbmFtZSBpbiBNYWluLnBsdWdpbnMpIHtcbiAgICAgIHRoaXMuYWRkSXRlbUZvcihuYW1lLCBNYWluLnBsdWdpbnNbbmFtZV0pXG4gICAgfVxuICB9XG5cbiAgdG9nZ2xlU2VsZWN0ZWRJdGVtICgpIHtcbiAgICBsZXQgZm4gPSB0aGlzLml0ZW1zQWN0aW9ucy5nZXQodGhpcy5zZWxlY3RlZEl0ZW0pXG4gICAgaWYgKHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykgeyBmbigpIH1cbiAgfVxuXG4gIHNlbGVjdE5leHRJdGVtICgpIHtcbiAgICB0aGlzLnNlbGVjdGVkSXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpXG4gICAgaWYgKCh0aGlzLnNlbGVjdGVkSXRlbS5uZXh0U2libGluZyAhPSBudWxsKSkge1xuICAgICAgdGhpcy5zZWxlY3RlZEl0ZW0gPSB0aGlzLnNlbGVjdGVkSXRlbS5uZXh0U2libGluZ1xuICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRJdGVtLm1hdGNoZXMoJy5zZXBhcmF0b3InKSkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbSA9IHRoaXMuc2VsZWN0ZWRJdGVtLm5leHRTaWJsaW5nXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtID0gdGhpcy5saXN0LmZpcnN0Q2hpbGRcbiAgICB9XG4gICAgdGhpcy5zZWxlY3RlZEl0ZW0uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKVxuICB9XG5cbiAgc2VsZWN0UHJldmlvdXNJdGVtICgpIHtcbiAgICB0aGlzLnNlbGVjdGVkSXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpXG4gICAgaWYgKCh0aGlzLnNlbGVjdGVkSXRlbS5wcmV2aW91c1NpYmxpbmcgIT0gbnVsbCkpIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtID0gdGhpcy5zZWxlY3RlZEl0ZW0ucHJldmlvdXNTaWJsaW5nXG4gICAgICBpZiAodGhpcy5zZWxlY3RlZEl0ZW0ubWF0Y2hlcygnLnNlcGFyYXRvcicpKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtID0gdGhpcy5zZWxlY3RlZEl0ZW0ucHJldmlvdXNTaWJsaW5nXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtID0gdGhpcy5saXN0Lmxhc3RDaGlsZFxuICAgIH1cbiAgICB0aGlzLnNlbGVjdGVkSXRlbS5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpXG4gIH1cblxuICBhZGRJdGVtRm9yIChuYW1lLCBwbHVnaW4pIHtcbiAgICBsZXQgaXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJylcbiAgICBsZXQgYWN0aW9uID0gKCkgPT4geyBNYWluLnRvZ2dsZVBsdWdpbkFjdGl2YXRpb24obmFtZSkgfVxuXG4gICAgaWYgKHBsdWdpbi5pc0FjdGl2ZSgpKSB7IGl0ZW0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJykgfVxuXG4gICAgaXRlbS50ZXh0Q29udGVudCA9IG5hbWVcblxuICAgIHRoaXMuaXRlbXNBY3Rpb25zLnNldChpdGVtLCBhY3Rpb24pXG4gICAgdGhpcy5pdGVtc0Rpc3Bvc2FibGVzLnNldChpdGVtLCB0aGlzLmFkZERpc3Bvc2FibGVFdmVudExpc3RlbmVyKGl0ZW0sICdtb3VzZWRvd24nLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBhY3Rpb24oKVxuICAgIH0pKVxuXG4gICAgdGhpcy5wbHVnaW5zW25hbWVdID0gaXRlbVxuICAgIHRoaXMubGlzdC5pbnNlcnRCZWZvcmUoaXRlbSwgdGhpcy5zZXBhcmF0b3IpXG5cbiAgICBpZiAoISh0aGlzLnNlbGVjdGVkSXRlbSAhPSBudWxsKSkge1xuICAgICAgdGhpcy5zZWxlY3RlZEl0ZW0gPSBpdGVtXG4gICAgICB0aGlzLnNlbGVjdGVkSXRlbS5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpXG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlSXRlbUZvciAobmFtZSwgcGx1Z2luKSB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMubGlzdC5yZW1vdmVDaGlsZCh0aGlzLnBsdWdpbnNbbmFtZV0pXG4gICAgfSBjYXRjaCAoZXJyb3IpIHt9XG5cbiAgICBkZWxldGUgdGhpcy5wbHVnaW5zW25hbWVdXG4gIH1cblxuICBhY3RpdmF0ZUl0ZW0gKG5hbWUsIHBsdWdpbikge1xuICAgIHRoaXMucGx1Z2luc1tuYW1lXS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKVxuICB9XG5cbiAgZGVhY3RpdmF0ZUl0ZW0gKG5hbWUsIHBsdWdpbikge1xuICAgIHRoaXMucGx1Z2luc1tuYW1lXS5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKVxuICB9XG59XG4iXX0=
//# sourceURL=/home/takaaki/.atom/packages/minimap/lib/minimap-quick-settings-element.js
