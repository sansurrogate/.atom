Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atomUtils = require('atom-utils');

var _mixinsDomStylesReader = require('./mixins/dom-styles-reader');

var _mixinsDomStylesReader2 = _interopRequireDefault(_mixinsDomStylesReader);

var _mixinsCanvasDrawer = require('./mixins/canvas-drawer');

var _mixinsCanvasDrawer2 = _interopRequireDefault(_mixinsCanvasDrawer);

var _decoratorsInclude = require('./decorators/include');

var _decoratorsInclude2 = _interopRequireDefault(_decoratorsInclude);

var _decoratorsElement = require('./decorators/element');

var _decoratorsElement2 = _interopRequireDefault(_decoratorsElement);

'use babel';

var Main = undefined,
    MinimapQuickSettingsElement = undefined,
    CompositeDisposable = undefined,
    Disposable = undefined;

var SPEC_MODE = atom.inSpecMode();

/**
 * Public: The MinimapElement is the view meant to render a {@link Minimap}
 * instance in the DOM.
 *
 * You can retrieve the MinimapElement associated to a Minimap
 * using the `atom.views.getView` method.
 *
 * Note that most interactions with the Minimap package is done through the
 * Minimap model so you should never have to access MinimapElement
 * instances.
 *
 * @example
 * let minimapElement = atom.views.getView(minimap)
 */

var MinimapElement = (function () {
  function MinimapElement() {
    _classCallCheck(this, _MinimapElement);
  }

  _createClass(MinimapElement, [{
    key: 'createdCallback',

    //    ##     ##  #######   #######  ##    ##  ######
    //    ##     ## ##     ## ##     ## ##   ##  ##    ##
    //    ##     ## ##     ## ##     ## ##  ##   ##
    //    ######### ##     ## ##     ## #####     ######
    //    ##     ## ##     ## ##     ## ##  ##         ##
    //    ##     ## ##     ## ##     ## ##   ##  ##    ##
    //    ##     ##  #######   #######  ##    ##  ######

    /**
     * DOM callback invoked when a new MinimapElement is created.
     *
     * @access private
     */
    value: function createdCallback() {
      var _this = this;

      if (!CompositeDisposable) {
        var _require = require('atom');

        CompositeDisposable = _require.CompositeDisposable;
        Disposable = _require.Disposable;
      }

      // Core properties

      /**
       * @access private
       */
      this.minimap = undefined;
      /**
       * @access private
       */
      this.editorElement = undefined;
      /**
       * @access private
       */
      this.width = undefined;
      /**
       * @access private
       */
      this.height = undefined;

      // Subscriptions

      /**
       * @access private
       */
      this.subscriptions = new CompositeDisposable();
      /**
       * @access private
       */
      this.visibleAreaSubscription = undefined;
      /**
       * @access private
       */
      this.quickSettingsSubscription = undefined;
      /**
       * @access private
       */
      this.dragSubscription = undefined;
      /**
       * @access private
       */
      this.openQuickSettingSubscription = undefined;

      // Configs

      /**
      * @access private
      */
      this.displayMinimapOnLeft = false;
      /**
      * @access private
      */
      this.minimapScrollIndicator = undefined;
      /**
      * @access private
      */
      this.displayMinimapOnLeft = undefined;
      /**
      * @access private
      */
      this.displayPluginsControls = undefined;
      /**
      * @access private
      */
      this.textOpacity = undefined;
      /**
      * @access private
      */
      this.displayCodeHighlights = undefined;
      /**
      * @access private
      */
      this.adjustToSoftWrap = undefined;
      /**
      * @access private
      */
      this.useHardwareAcceleration = undefined;
      /**
      * @access private
      */
      this.absoluteMode = undefined;

      // Elements

      /**
       * @access private
       */
      this.shadowRoot = undefined;
      /**
       * @access private
       */
      this.visibleArea = undefined;
      /**
       * @access private
       */
      this.controls = undefined;
      /**
       * @access private
       */
      this.scrollIndicator = undefined;
      /**
       * @access private
       */
      this.openQuickSettings = undefined;
      /**
       * @access private
       */
      this.quickSettingsElement = undefined;

      // States

      /**
      * @access private
      */
      this.attached = undefined;
      /**
      * @access private
      */
      this.attachedToTextEditor = undefined;
      /**
      * @access private
      */
      this.standAlone = undefined;
      /**
       * @access private
       */
      this.wasVisible = undefined;

      // Other

      /**
       * @access private
       */
      this.offscreenFirstRow = undefined;
      /**
       * @access private
       */
      this.offscreenLastRow = undefined;
      /**
       * @access private
       */
      this.frameRequested = undefined;
      /**
       * @access private
       */
      this.flexBasis = undefined;

      this.initializeContent();

      return this.observeConfig({
        'minimap.displayMinimapOnLeft': function minimapDisplayMinimapOnLeft(displayMinimapOnLeft) {
          _this.displayMinimapOnLeft = displayMinimapOnLeft;

          _this.updateMinimapFlexPosition();
        },

        'minimap.minimapScrollIndicator': function minimapMinimapScrollIndicator(minimapScrollIndicator) {
          _this.minimapScrollIndicator = minimapScrollIndicator;

          if (_this.minimapScrollIndicator && !(_this.scrollIndicator != null) && !_this.standAlone) {
            _this.initializeScrollIndicator();
          } else if (_this.scrollIndicator != null) {
            _this.disposeScrollIndicator();
          }

          if (_this.attached) {
            _this.requestUpdate();
          }
        },

        'minimap.displayPluginsControls': function minimapDisplayPluginsControls(displayPluginsControls) {
          _this.displayPluginsControls = displayPluginsControls;

          if (_this.displayPluginsControls && !(_this.openQuickSettings != null) && !_this.standAlone) {
            _this.initializeOpenQuickSettings();
          } else if (_this.openQuickSettings != null) {
            _this.disposeOpenQuickSettings();
          }
        },

        'minimap.textOpacity': function minimapTextOpacity(textOpacity) {
          _this.textOpacity = textOpacity;

          if (_this.attached) {
            _this.requestForcedUpdate();
          }
        },

        'minimap.displayCodeHighlights': function minimapDisplayCodeHighlights(displayCodeHighlights) {
          _this.displayCodeHighlights = displayCodeHighlights;

          if (_this.attached) {
            _this.requestForcedUpdate();
          }
        },

        'minimap.smoothScrolling': function minimapSmoothScrolling(smoothScrolling) {
          _this.smoothScrolling = smoothScrolling;

          if (_this.attached) {
            if (!_this.smoothScrolling) {
              _this.backLayer.canvas.style.cssText = '';
              _this.tokensLayer.canvas.style.cssText = '';
              _this.frontLayer.canvas.style.cssText = '';
            } else {
              _this.requestUpdate();
            }
          }
        },

        'minimap.adjustMinimapWidthToSoftWrap': function minimapAdjustMinimapWidthToSoftWrap(adjustToSoftWrap) {
          _this.adjustToSoftWrap = adjustToSoftWrap;

          if (_this.attached) {
            _this.measureHeightAndWidth();
          }
        },

        'minimap.adjustMinimapWidthOnlyIfSmaller': function minimapAdjustMinimapWidthOnlyIfSmaller(adjustOnlyIfSmaller) {
          _this.adjustOnlyIfSmaller = adjustOnlyIfSmaller;

          if (_this.attached) {
            _this.measureHeightAndWidth();
          }
        },

        'minimap.useHardwareAcceleration': function minimapUseHardwareAcceleration(useHardwareAcceleration) {
          _this.useHardwareAcceleration = useHardwareAcceleration;

          if (_this.attached) {
            _this.requestUpdate();
          }
        },

        'minimap.absoluteMode': function minimapAbsoluteMode(absoluteMode) {
          _this.absoluteMode = absoluteMode;

          _this.classList.toggle('absolute', _this.absoluteMode);
        },

        'minimap.adjustAbsoluteModeHeight': function minimapAdjustAbsoluteModeHeight(adjustAbsoluteModeHeight) {
          _this.adjustAbsoluteModeHeight = adjustAbsoluteModeHeight;

          _this.classList.toggle('adjust-absolute-height', _this.adjustAbsoluteModeHeight);

          if (_this.attached) {
            _this.measureHeightAndWidth();
          }
        },

        'minimap.ignoreWhitespacesInTokens': function minimapIgnoreWhitespacesInTokens(ignoreWhitespacesInTokens) {
          _this.ignoreWhitespacesInTokens = ignoreWhitespacesInTokens;

          if (_this.attached) {
            _this.requestForcedUpdate();
          }
        },

        'editor.preferredLineLength': function editorPreferredLineLength() {
          if (_this.attached) {
            _this.measureHeightAndWidth();
          }
        },

        'editor.softWrap': function editorSoftWrap() {
          if (_this.attached) {
            _this.requestUpdate();
          }
        },

        'editor.showInvisibles': function editorShowInvisibles() {
          if (_this.attached) {
            _this.requestUpdate();
          }
        },

        'editor.invisibles': function editorInvisibles() {
          if (_this.attached) {
            _this.requestUpdate();
          }
        },

        'editor.softWrapAtPreferredLineLength': function editorSoftWrapAtPreferredLineLength() {
          if (_this.attached) {
            _this.requestUpdate();
          }
        }
      });
    }

    /**
     * DOM callback invoked when a new MinimapElement is attached to the DOM.
     *
     * @access private
     */
  }, {
    key: 'attachedCallback',
    value: function attachedCallback() {
      var _this2 = this;

      this.subscriptions.add(atom.views.pollDocument(function () {
        _this2.pollDOM();
      }));
      this.measureHeightAndWidth();
      this.updateMinimapFlexPosition();
      this.attached = true;
      this.attachedToTextEditor = this.parentNode === this.getTextEditorElementRoot();

      if (this.attachedToTextEditor) {
        this.getTextEditorElement().setAttribute('with-minimap', '');
      }

      /*
        We use `atom.styles.onDidAddStyleElement` instead of
        `atom.themes.onDidChangeActiveThemes`.
        Why? Currently, The style element will be removed first, and then re-added
        and the `change` event has not be triggered in the process.
      */
      this.subscriptions.add(atom.styles.onDidAddStyleElement(function () {
        _this2.invalidateDOMStylesCache();
        _this2.requestForcedUpdate();
      }));

      this.subscriptions.add(this.subscribeToMediaQuery());
    }

    /**
     * DOM callback invoked when a new MinimapElement is detached from the DOM.
     *
     * @access private
     */
  }, {
    key: 'detachedCallback',
    value: function detachedCallback() {
      this.getTextEditorElement().removeAttribute('with-minimap');
      this.attached = false;
    }

    //       ###    ######## ########    ###     ######  ##     ##
    //      ## ##      ##       ##      ## ##   ##    ## ##     ##
    //     ##   ##     ##       ##     ##   ##  ##       ##     ##
    //    ##     ##    ##       ##    ##     ## ##       #########
    //    #########    ##       ##    ######### ##       ##     ##
    //    ##     ##    ##       ##    ##     ## ##    ## ##     ##
    //    ##     ##    ##       ##    ##     ##  ######  ##     ##

    /**
     * Returns whether the MinimapElement is currently visible on screen or not.
     *
     * The visibility of the minimap is defined by testing the size of the offset
     * width and height of the element.
     *
     * @return {boolean} whether the MinimapElement is currently visible or not
     */
  }, {
    key: 'isVisible',
    value: function isVisible() {
      return this.offsetWidth > 0 || this.offsetHeight > 0;
    }

    /**
     * Attaches the MinimapElement to the DOM.
     *
     * The position at which the element is attached is defined by the
     * `displayMinimapOnLeft` setting.
     *
     * @param  {HTMLElement} [parent] the DOM node where attaching the minimap
     *                                element
     */
  }, {
    key: 'attach',
    value: function attach(parent) {
      if (this.attached) {
        return;
      }

      var container = parent || this.getTextEditorElementRoot();
      var minimaps = container.querySelectorAll('atom-text-editor-minimap');
      if (minimaps.length) {
        Array.prototype.forEach.call(minimaps, function (el) {
          el.destroy();
        });
      }
      container.appendChild(this);
    }

    /**
     * Detaches the MinimapElement from the DOM.
     */
  }, {
    key: 'detach',
    value: function detach() {
      if (!this.attached || this.parentNode == null) {
        return;
      }
      this.parentNode.removeChild(this);
    }

    /**
     * Toggles the minimap left/right position based on the value of the
     * `displayMinimapOnLeft` setting.
     *
     * @access private
     */
  }, {
    key: 'updateMinimapFlexPosition',
    value: function updateMinimapFlexPosition() {
      this.classList.toggle('left', this.displayMinimapOnLeft);
    }

    /**
     * Destroys this MinimapElement
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      this.subscriptions.dispose();
      this.detach();
      this.minimap = null;
    }

    //     ######   #######  ##    ## ######## ######## ##    ## ########
    //    ##    ## ##     ## ###   ##    ##    ##       ###   ##    ##
    //    ##       ##     ## ####  ##    ##    ##       ####  ##    ##
    //    ##       ##     ## ## ## ##    ##    ######   ## ## ##    ##
    //    ##       ##     ## ##  ####    ##    ##       ##  ####    ##
    //    ##    ## ##     ## ##   ###    ##    ##       ##   ###    ##
    //     ######   #######  ##    ##    ##    ######## ##    ##    ##

    /**
     * Creates the content of the MinimapElement and attaches the mouse control
     * event listeners.
     *
     * @access private
     */
  }, {
    key: 'initializeContent',
    value: function initializeContent() {
      var _this3 = this;

      this.initializeCanvas();

      this.shadowRoot = this.createShadowRoot();
      this.attachCanvases(this.shadowRoot);

      this.createVisibleArea();
      this.createControls();

      this.subscriptions.add(this.subscribeTo(this, {
        'mousewheel': function mousewheel(e) {
          if (!_this3.standAlone) {
            _this3.relayMousewheelEvent(e);
          }
        }
      }));

      this.subscriptions.add(this.subscribeTo(this.getFrontCanvas(), {
        'mousedown': function mousedown(e) {
          _this3.canvasPressed(_this3.extractMouseEventData(e));
        },
        'touchstart': function touchstart(e) {
          _this3.canvasPressed(_this3.extractTouchEventData(e));
        }
      }));
    }

    /**
     * Initializes the visible area div.
     *
     * @access private
     */
  }, {
    key: 'createVisibleArea',
    value: function createVisibleArea() {
      var _this4 = this;

      if (this.visibleArea) {
        return;
      }

      this.visibleArea = document.createElement('div');
      this.visibleArea.classList.add('minimap-visible-area');
      this.shadowRoot.appendChild(this.visibleArea);
      this.visibleAreaSubscription = this.subscribeTo(this.visibleArea, {
        'mousedown': function mousedown(e) {
          _this4.startDrag(_this4.extractMouseEventData(e));
        },
        'touchstart': function touchstart(e) {
          _this4.startDrag(_this4.extractTouchEventData(e));
        }
      });

      this.subscriptions.add(this.visibleAreaSubscription);
    }

    /**
     * Removes the visible area div.
     *
     * @access private
     */
  }, {
    key: 'removeVisibleArea',
    value: function removeVisibleArea() {
      if (!this.visibleArea) {
        return;
      }

      this.subscriptions.remove(this.visibleAreaSubscription);
      this.visibleAreaSubscription.dispose();
      this.shadowRoot.removeChild(this.visibleArea);
      delete this.visibleArea;
    }

    /**
     * Creates the controls container div.
     *
     * @access private
     */
  }, {
    key: 'createControls',
    value: function createControls() {
      if (this.controls || this.standAlone) {
        return;
      }

      this.controls = document.createElement('div');
      this.controls.classList.add('minimap-controls');
      this.shadowRoot.appendChild(this.controls);
    }

    /**
     * Removes the controls container div.
     *
     * @access private
     */
  }, {
    key: 'removeControls',
    value: function removeControls() {
      if (!this.controls) {
        return;
      }

      this.shadowRoot.removeChild(this.controls);
      delete this.controls;
    }

    /**
     * Initializes the scroll indicator div when the `minimapScrollIndicator`
     * settings is enabled.
     *
     * @access private
     */
  }, {
    key: 'initializeScrollIndicator',
    value: function initializeScrollIndicator() {
      if (this.scrollIndicator || this.standAlone) {
        return;
      }

      this.scrollIndicator = document.createElement('div');
      this.scrollIndicator.classList.add('minimap-scroll-indicator');
      this.controls.appendChild(this.scrollIndicator);
    }

    /**
     * Disposes the scroll indicator div when the `minimapScrollIndicator`
     * settings is disabled.
     *
     * @access private
     */
  }, {
    key: 'disposeScrollIndicator',
    value: function disposeScrollIndicator() {
      if (!this.scrollIndicator) {
        return;
      }

      this.controls.removeChild(this.scrollIndicator);
      delete this.scrollIndicator;
    }

    /**
     * Initializes the quick settings openener div when the
     * `displayPluginsControls` setting is enabled.
     *
     * @access private
     */
  }, {
    key: 'initializeOpenQuickSettings',
    value: function initializeOpenQuickSettings() {
      var _this5 = this;

      if (this.openQuickSettings || this.standAlone) {
        return;
      }

      this.openQuickSettings = document.createElement('div');
      this.openQuickSettings.classList.add('open-minimap-quick-settings');
      this.controls.appendChild(this.openQuickSettings);

      this.openQuickSettingSubscription = this.subscribeTo(this.openQuickSettings, {
        'mousedown': function mousedown(e) {
          if (!MinimapQuickSettingsElement) {
            MinimapQuickSettingsElement = require('./minimap-quick-settings-element');
          }

          e.preventDefault();
          e.stopPropagation();

          if (_this5.quickSettingsElement != null) {
            _this5.quickSettingsElement.destroy();
            _this5.quickSettingsSubscription.dispose();
          } else {
            _this5.quickSettingsElement = new MinimapQuickSettingsElement();
            _this5.quickSettingsElement.setModel(_this5);
            _this5.quickSettingsSubscription = _this5.quickSettingsElement.onDidDestroy(function () {
              _this5.quickSettingsElement = null;
            });

            var _getFrontCanvas$getBoundingClientRect = _this5.getFrontCanvas().getBoundingClientRect();

            var _top = _getFrontCanvas$getBoundingClientRect.top;
            var left = _getFrontCanvas$getBoundingClientRect.left;
            var right = _getFrontCanvas$getBoundingClientRect.right;

            _this5.quickSettingsElement.style.top = _top + 'px';
            _this5.quickSettingsElement.attach();

            if (_this5.displayMinimapOnLeft) {
              _this5.quickSettingsElement.style.left = right + 'px';
            } else {
              _this5.quickSettingsElement.style.left = left - _this5.quickSettingsElement.clientWidth + 'px';
            }
          }
        }
      });
    }

    /**
     * Disposes the quick settings openener div when the `displayPluginsControls`
     * setting is disabled.
     *
     * @access private
     */
  }, {
    key: 'disposeOpenQuickSettings',
    value: function disposeOpenQuickSettings() {
      if (!this.openQuickSettings) {
        return;
      }

      this.controls.removeChild(this.openQuickSettings);
      this.openQuickSettingSubscription.dispose();
      delete this.openQuickSettings;
    }

    /**
     * Returns the target `TextEditor` of the Minimap.
     *
     * @return {TextEditor} the minimap's text editor
     */
  }, {
    key: 'getTextEditor',
    value: function getTextEditor() {
      return this.minimap.getTextEditor();
    }

    /**
     * Returns the `TextEditorElement` for the Minimap's `TextEditor`.
     *
     * @return {TextEditorElement} the minimap's text editor element
     */
  }, {
    key: 'getTextEditorElement',
    value: function getTextEditorElement() {
      if (this.editorElement) {
        return this.editorElement;
      }

      this.editorElement = atom.views.getView(this.getTextEditor());
      return this.editorElement;
    }

    /**
     * Returns the root of the `TextEditorElement` content.
     *
     * This method is mostly used to ensure compatibility with the `shadowDom`
     * setting.
     *
     * @return {HTMLElement} the root of the `TextEditorElement` content
     */
  }, {
    key: 'getTextEditorElementRoot',
    value: function getTextEditorElementRoot() {
      var editorElement = this.getTextEditorElement();

      if (editorElement.shadowRoot) {
        return editorElement.shadowRoot;
      } else {
        return editorElement;
      }
    }

    /**
     * Returns the root where to inject the dummy node used to read DOM styles.
     *
     * @param  {boolean} shadowRoot whether to use the text editor shadow DOM
     *                              or not
     * @return {HTMLElement} the root node where appending the dummy node
     * @access private
     */
  }, {
    key: 'getDummyDOMRoot',
    value: function getDummyDOMRoot(shadowRoot) {
      if (shadowRoot) {
        return this.getTextEditorElementRoot();
      } else {
        return this.getTextEditorElement();
      }
    }

    //    ##     ##  #######  ########  ######## ##
    //    ###   ### ##     ## ##     ## ##       ##
    //    #### #### ##     ## ##     ## ##       ##
    //    ## ### ## ##     ## ##     ## ######   ##
    //    ##     ## ##     ## ##     ## ##       ##
    //    ##     ## ##     ## ##     ## ##       ##
    //    ##     ##  #######  ########  ######## ########

    /**
     * Returns the Minimap for which this MinimapElement was created.
     *
     * @return {Minimap} this element's Minimap
     */
  }, {
    key: 'getModel',
    value: function getModel() {
      return this.minimap;
    }

    /**
     * Defines the Minimap model for this MinimapElement instance.
     *
     * @param  {Minimap} minimap the Minimap model for this instance.
     * @return {Minimap} this element's Minimap
     */
  }, {
    key: 'setModel',
    value: function setModel(minimap) {
      var _this6 = this;

      if (!Main) {
        Main = require('./main');
      }

      this.minimap = minimap;
      this.subscriptions.add(this.minimap.onDidChangeScrollTop(function () {
        _this6.requestUpdate();
      }));
      this.subscriptions.add(this.minimap.onDidChangeScrollLeft(function () {
        _this6.requestUpdate();
      }));
      this.subscriptions.add(this.minimap.onDidDestroy(function () {
        _this6.destroy();
      }));
      this.subscriptions.add(this.minimap.onDidChangeConfig(function () {
        if (_this6.attached) {
          return _this6.requestForcedUpdate();
        }
      }));

      this.subscriptions.add(this.minimap.onDidChangeStandAlone(function () {
        _this6.setStandAlone(_this6.minimap.isStandAlone());
        _this6.requestUpdate();
      }));

      this.subscriptions.add(this.minimap.onDidChange(function (change) {
        _this6.pendingChanges.push(change);
        _this6.requestUpdate();
      }));

      this.subscriptions.add(this.minimap.onDidChangeDecorationRange(function (change) {
        var type = change.type;

        if (type === 'line' || type === 'highlight-under' || type === 'background-custom') {
          _this6.pendingBackDecorationChanges.push(change);
        } else {
          _this6.pendingFrontDecorationChanges.push(change);
        }
        _this6.requestUpdate();
      }));

      this.subscriptions.add(Main.onDidChangePluginOrder(function () {
        _this6.requestForcedUpdate();
      }));

      this.setStandAlone(this.minimap.isStandAlone());

      if (this.width != null && this.height != null) {
        this.minimap.setScreenHeightAndWidth(this.height, this.width);
      }

      return this.minimap;
    }

    /**
     * Sets the stand-alone mode for this MinimapElement.
     *
     * @param {boolean} standAlone the new mode for this MinimapElement
     */
  }, {
    key: 'setStandAlone',
    value: function setStandAlone(standAlone) {
      this.standAlone = standAlone;

      if (this.standAlone) {
        this.setAttribute('stand-alone', true);
        this.disposeScrollIndicator();
        this.disposeOpenQuickSettings();
        this.removeControls();
        this.removeVisibleArea();
      } else {
        this.removeAttribute('stand-alone');
        this.createVisibleArea();
        this.createControls();
        if (this.minimapScrollIndicator) {
          this.initializeScrollIndicator();
        }
        if (this.displayPluginsControls) {
          this.initializeOpenQuickSettings();
        }
      }
    }

    //    ##     ## ########  ########     ###    ######## ########
    //    ##     ## ##     ## ##     ##   ## ##      ##    ##
    //    ##     ## ##     ## ##     ##  ##   ##     ##    ##
    //    ##     ## ########  ##     ## ##     ##    ##    ######
    //    ##     ## ##        ##     ## #########    ##    ##
    //    ##     ## ##        ##     ## ##     ##    ##    ##
    //     #######  ##        ########  ##     ##    ##    ########

    /**
     * Requests an update to be performed on the next frame.
     */
  }, {
    key: 'requestUpdate',
    value: function requestUpdate() {
      var _this7 = this;

      if (this.frameRequested) {
        return;
      }

      this.frameRequested = true;
      requestAnimationFrame(function () {
        _this7.update();
        _this7.frameRequested = false;
      });
    }

    /**
     * Requests an update to be performed on the next frame that will completely
     * redraw the minimap.
     */
  }, {
    key: 'requestForcedUpdate',
    value: function requestForcedUpdate() {
      this.offscreenFirstRow = null;
      this.offscreenLastRow = null;
      this.requestUpdate();
    }

    /**
     * Performs the actual MinimapElement update.
     *
     * @access private
     */
  }, {
    key: 'update',
    value: function update() {
      if (!(this.attached && this.isVisible() && this.minimap)) {
        return;
      }
      var minimap = this.minimap;
      minimap.enableCache();
      var canvas = this.getFrontCanvas();

      var devicePixelRatio = this.minimap.getDevicePixelRatio();
      var visibleAreaLeft = minimap.getTextEditorScaledScrollLeft();
      var visibleAreaTop = minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop();
      var visibleWidth = Math.min(canvas.width / devicePixelRatio, this.width);

      if (this.adjustToSoftWrap && this.flexBasis) {
        this.style.flexBasis = this.flexBasis + 'px';
        this.style.width = this.flexBasis + 'px';
      } else {
        this.style.flexBasis = null;
        this.style.width = null;
      }

      if (SPEC_MODE) {
        this.applyStyles(this.visibleArea, {
          width: visibleWidth + 'px',
          height: minimap.getTextEditorScaledHeight() + 'px',
          top: visibleAreaTop + 'px',
          'border-left-width': visibleAreaLeft + 'px'
        });
      } else {
        this.applyStyles(this.visibleArea, {
          width: visibleWidth + 'px',
          height: minimap.getTextEditorScaledHeight() + 'px',
          transform: this.makeTranslate(0, visibleAreaTop),
          'border-left-width': visibleAreaLeft + 'px'
        });
      }

      this.applyStyles(this.controls, { width: visibleWidth + 'px' });

      var canvasTop = minimap.getFirstVisibleScreenRow() * minimap.getLineHeight() - minimap.getScrollTop();

      if (this.smoothScrolling) {
        if (SPEC_MODE) {
          this.applyStyles(this.backLayer.canvas, { top: canvasTop + 'px' });
          this.applyStyles(this.tokensLayer.canvas, { top: canvasTop + 'px' });
          this.applyStyles(this.frontLayer.canvas, { top: canvasTop + 'px' });
        } else {
          var canvasTransform = this.makeTranslate(0, canvasTop);
          if (devicePixelRatio !== 1) {
            canvasTransform += ' ' + this.makeScale(1 / devicePixelRatio);
          }
          this.applyStyles(this.backLayer.canvas, { transform: canvasTransform });
          this.applyStyles(this.tokensLayer.canvas, { transform: canvasTransform });
          this.applyStyles(this.frontLayer.canvas, { transform: canvasTransform });
        }
      } else {
        var canvasTransform = this.makeScale(1 / devicePixelRatio);
        this.applyStyles(this.backLayer.canvas, { transform: canvasTransform });
        this.applyStyles(this.tokensLayer.canvas, { transform: canvasTransform });
        this.applyStyles(this.frontLayer.canvas, { transform: canvasTransform });
      }

      if (this.minimapScrollIndicator && minimap.canScroll() && !this.scrollIndicator) {
        this.initializeScrollIndicator();
      }

      if (this.scrollIndicator != null) {
        var minimapScreenHeight = minimap.getScreenHeight();
        var indicatorHeight = minimapScreenHeight * (minimapScreenHeight / minimap.getHeight());
        var indicatorScroll = (minimapScreenHeight - indicatorHeight) * minimap.getScrollRatio();

        if (SPEC_MODE) {
          this.applyStyles(this.scrollIndicator, {
            height: indicatorHeight + 'px',
            top: indicatorScroll + 'px'
          });
        } else {
          this.applyStyles(this.scrollIndicator, {
            height: indicatorHeight + 'px',
            transform: this.makeTranslate(0, indicatorScroll)
          });
        }

        if (!minimap.canScroll()) {
          this.disposeScrollIndicator();
        }
      }

      if (this.absoluteMode && this.adjustAbsoluteModeHeight) {
        this.updateCanvasesSize();
      }

      this.updateCanvas();
      minimap.clearCache();
    }

    /**
     * Defines whether to render the code highlights or not.
     *
     * @param {Boolean} displayCodeHighlights whether to render the code
     *                                        highlights or not
     */
  }, {
    key: 'setDisplayCodeHighlights',
    value: function setDisplayCodeHighlights(displayCodeHighlights) {
      this.displayCodeHighlights = displayCodeHighlights;
      if (this.attached) {
        this.requestForcedUpdate();
      }
    }

    /**
     * Polling callback used to detect visibility and size changes.
     *
     * @access private
     */
  }, {
    key: 'pollDOM',
    value: function pollDOM() {
      var visibilityChanged = this.checkForVisibilityChange();
      if (this.isVisible()) {
        if (!this.wasVisible) {
          this.requestForcedUpdate();
        }

        this.measureHeightAndWidth(visibilityChanged, false);
      }
    }

    /**
     * A method that checks for visibility changes in the MinimapElement.
     * The method returns `true` when the visibility changed from visible to
     * hidden or from hidden to visible.
     *
     * @return {boolean} whether the visibility changed or not since the last call
     * @access private
     */
  }, {
    key: 'checkForVisibilityChange',
    value: function checkForVisibilityChange() {
      if (this.isVisible()) {
        if (this.wasVisible) {
          return false;
        } else {
          this.wasVisible = true;
          return this.wasVisible;
        }
      } else {
        if (this.wasVisible) {
          this.wasVisible = false;
          return true;
        } else {
          this.wasVisible = false;
          return this.wasVisible;
        }
      }
    }

    /**
     * A method used to measure the size of the MinimapElement and update internal
     * components based on the new size.
     *
     * @param  {boolean} visibilityChanged did the visibility changed since last
     *                                     measurement
     * @param  {[type]} [forceUpdate=true] forces the update even when no changes
     *                                     were detected
     * @access private
     */
  }, {
    key: 'measureHeightAndWidth',
    value: function measureHeightAndWidth(visibilityChanged) {
      var forceUpdate = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      if (!this.minimap) {
        return;
      }

      var safeFlexBasis = this.style.flexBasis;
      this.style.flexBasis = '';

      var wasResized = this.width !== this.clientWidth || this.height !== this.clientHeight;

      this.height = this.clientHeight;
      this.width = this.clientWidth;
      var canvasWidth = this.width;

      if (this.minimap != null) {
        this.minimap.setScreenHeightAndWidth(this.height, this.width);
      }

      if (wasResized || visibilityChanged || forceUpdate) {
        this.requestForcedUpdate();
      }

      if (!this.isVisible()) {
        return;
      }

      if (wasResized || forceUpdate) {
        if (this.adjustToSoftWrap) {
          var lineLength = atom.config.get('editor.preferredLineLength');
          var softWrap = atom.config.get('editor.softWrap');
          var softWrapAtPreferredLineLength = atom.config.get('editor.softWrapAtPreferredLineLength');
          var width = lineLength * this.minimap.getCharWidth();

          if (softWrap && softWrapAtPreferredLineLength && lineLength && (width <= this.width || !this.adjustOnlyIfSmaller)) {
            this.flexBasis = width;
            canvasWidth = width;
          } else {
            delete this.flexBasis;
          }
        } else {
          delete this.flexBasis;
        }

        this.updateCanvasesSize(canvasWidth);
      } else {
        this.style.flexBasis = safeFlexBasis;
      }
    }
  }, {
    key: 'updateCanvasesSize',
    value: function updateCanvasesSize() {
      var canvasWidth = arguments.length <= 0 || arguments[0] === undefined ? this.getFrontCanvas().width : arguments[0];

      var devicePixelRatio = this.minimap.getDevicePixelRatio();
      var maxCanvasHeight = this.height + this.minimap.getLineHeight();
      var newHeight = this.absoluteMode && this.adjustAbsoluteModeHeight ? Math.min(this.minimap.getHeight(), maxCanvasHeight) : maxCanvasHeight;
      var canvas = this.getFrontCanvas();
      if (canvasWidth !== canvas.width || newHeight !== canvas.height) {
        this.setCanvasesSize(canvasWidth * devicePixelRatio, newHeight * devicePixelRatio);
        if (this.absoluteMode && this.adjustAbsoluteModeHeight) {
          this.offscreenFirstRow = null;
          this.offscreenLastRow = null;
        }
      }
    }

    //    ######## ##     ## ######## ##    ## ########  ######
    //    ##       ##     ## ##       ###   ##    ##    ##    ##
    //    ##       ##     ## ##       ####  ##    ##    ##
    //    ######   ##     ## ######   ## ## ##    ##     ######
    //    ##        ##   ##  ##       ##  ####    ##          ##
    //    ##         ## ##   ##       ##   ###    ##    ##    ##
    //    ########    ###    ######## ##    ##    ##     ######

    /**
     * Helper method to register config observers.
     *
     * @param  {Object} configs={} an object mapping the config name to observe
     *                             with the function to call back when a change
     *                             occurs
     * @access private
     */
  }, {
    key: 'observeConfig',
    value: function observeConfig() {
      var configs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      for (var config in configs) {
        this.subscriptions.add(atom.config.observe(config, configs[config]));
      }
    }

    /**
     * Callback triggered when the mouse is pressed on the MinimapElement canvas.
     *
     * @param  {number} y the vertical coordinate of the event
     * @param  {boolean} isLeftMouse was the left mouse button pressed?
     * @param  {boolean} isMiddleMouse was the middle mouse button pressed?
     * @access private
     */
  }, {
    key: 'canvasPressed',
    value: function canvasPressed(_ref) {
      var y = _ref.y;
      var isLeftMouse = _ref.isLeftMouse;
      var isMiddleMouse = _ref.isMiddleMouse;

      if (this.minimap.isStandAlone()) {
        return;
      }
      if (isLeftMouse) {
        this.canvasLeftMousePressed(y);
      } else if (isMiddleMouse) {
        this.canvasMiddleMousePressed(y);

        var _visibleArea$getBoundingClientRect = this.visibleArea.getBoundingClientRect();

        var _top2 = _visibleArea$getBoundingClientRect.top;
        var height = _visibleArea$getBoundingClientRect.height;

        this.startDrag({ y: _top2 + height / 2, isLeftMouse: false, isMiddleMouse: true });
      }
    }

    /**
     * Callback triggered when the mouse left button is pressed on the
     * MinimapElement canvas.
     *
     * @param  {MouseEvent} e the mouse event object
     * @param  {number} e.pageY the mouse y position in page
     * @param  {HTMLElement} e.target the source of the event
     * @access private
     */
  }, {
    key: 'canvasLeftMousePressed',
    value: function canvasLeftMousePressed(y) {
      var _this8 = this;

      var deltaY = y - this.getBoundingClientRect().top;
      var row = Math.floor(deltaY / this.minimap.getLineHeight()) + this.minimap.getFirstVisibleScreenRow();

      var textEditor = this.minimap.getTextEditor();
      var textEditorElement = this.getTextEditorElement();

      var scrollTop = row * textEditor.getLineHeightInPixels() - this.minimap.getTextEditorHeight() / 2;
      var textEditorScrollTop = textEditorElement.pixelPositionForScreenPosition([row, 0]).top - this.minimap.getTextEditorHeight() / 2;

      if (atom.config.get('minimap.moveCursorOnMinimapClick')) {
        textEditor.setCursorScreenPosition([row, 0]);
      }

      if (atom.config.get('minimap.scrollAnimation')) {
        var duration = atom.config.get('minimap.scrollAnimationDuration');
        var independentScroll = this.minimap.scrollIndependentlyOnMouseWheel();

        var from = this.minimap.getTextEditorScrollTop();
        var to = textEditorScrollTop;
        var step = undefined;

        if (independentScroll) {
          (function () {
            var minimapFrom = _this8.minimap.getScrollTop();
            var minimapTo = Math.min(1, scrollTop / (_this8.minimap.getTextEditorMaxScrollTop() || 1)) * _this8.minimap.getMaxScrollTop();

            step = function (now, t) {
              _this8.minimap.setTextEditorScrollTop(now, true);
              _this8.minimap.setScrollTop(minimapFrom + (minimapTo - minimapFrom) * t);
            };
            _this8.animate({ from: from, to: to, duration: duration, step: step });
          })();
        } else {
          step = function (now) {
            return _this8.minimap.setTextEditorScrollTop(now);
          };
          this.animate({ from: from, to: to, duration: duration, step: step });
        }
      } else {
        this.minimap.setTextEditorScrollTop(textEditorScrollTop);
      }
    }

    /**
     * Callback triggered when the mouse middle button is pressed on the
     * MinimapElement canvas.
     *
     * @param  {MouseEvent} e the mouse event object
     * @param  {number} e.pageY the mouse y position in page
     * @access private
     */
  }, {
    key: 'canvasMiddleMousePressed',
    value: function canvasMiddleMousePressed(y) {
      var _getBoundingClientRect = this.getBoundingClientRect();

      var offsetTop = _getBoundingClientRect.top;

      var deltaY = y - offsetTop - this.minimap.getTextEditorScaledHeight() / 2;

      var ratio = deltaY / (this.minimap.getVisibleHeight() - this.minimap.getTextEditorScaledHeight());

      this.minimap.setTextEditorScrollTop(ratio * this.minimap.getTextEditorMaxScrollTop());
    }

    /**
     * A method that relays the `mousewheel` events received by the MinimapElement
     * to the `TextEditorElement`.
     *
     * @param  {MouseEvent} e the mouse event object
     * @access private
     */
  }, {
    key: 'relayMousewheelEvent',
    value: function relayMousewheelEvent(e) {
      if (this.minimap.scrollIndependentlyOnMouseWheel()) {
        this.minimap.onMouseWheel(e);
      } else {
        this.getTextEditorElement().component.onMouseWheel(e);
      }
    }

    /**
     * A method that extracts data from a `MouseEvent` which can then be used to
     * process clicks and drags of the minimap.
     *
     * Used together with `extractTouchEventData` to provide a unified interface
     * for `MouseEvent`s and `TouchEvent`s.
     *
     * @param  {MouseEvent} mouseEvent the mouse event object
     * @access private
     */
  }, {
    key: 'extractMouseEventData',
    value: function extractMouseEventData(mouseEvent) {
      return {
        x: mouseEvent.pageX,
        y: mouseEvent.pageY,
        isLeftMouse: mouseEvent.which === 1,
        isMiddleMouse: mouseEvent.which === 2
      };
    }

    /**
     * A method that extracts data from a `TouchEvent` which can then be used to
     * process clicks and drags of the minimap.
     *
     * Used together with `extractMouseEventData` to provide a unified interface
     * for `MouseEvent`s and `TouchEvent`s.
     *
     * @param  {TouchEvent} touchEvent the touch event object
     * @access private
     */
  }, {
    key: 'extractTouchEventData',
    value: function extractTouchEventData(touchEvent) {
      // Use the first touch on the target area. Other touches will be ignored in
      // case of multi-touch.
      var touch = touchEvent.changedTouches[0];

      return {
        x: touch.pageX,
        y: touch.pageY,
        isLeftMouse: true, // Touch is treated like a left mouse button click
        isMiddleMouse: false
      };
    }

    /**
     * Subscribes to a media query for device pixel ratio changes and forces
     * a repaint when it occurs.
     *
     * @return {Disposable} a disposable to remove the media query listener
     * @access private
     */
  }, {
    key: 'subscribeToMediaQuery',
    value: function subscribeToMediaQuery() {
      var _this9 = this;

      if (!Disposable) {
        var _require2 = require('atom');

        CompositeDisposable = _require2.CompositeDisposable;
        Disposable = _require2.Disposable;
      }

      var query = 'screen and (-webkit-min-device-pixel-ratio: 1.5)';
      var mediaQuery = window.matchMedia(query);
      var mediaListener = function mediaListener(e) {
        _this9.requestForcedUpdate();
      };
      mediaQuery.addListener(mediaListener);

      return new Disposable(function () {
        mediaQuery.removeListener(mediaListener);
      });
    }

    //    ########    ####    ########
    //    ##     ##  ##  ##   ##     ##
    //    ##     ##   ####    ##     ##
    //    ##     ##  ####     ##     ##
    //    ##     ## ##  ## ## ##     ##
    //    ##     ## ##   ##   ##     ##
    //    ########   ####  ## ########

    /**
     * A method triggered when the mouse is pressed over the visible area that
     * starts the dragging gesture.
     *
     * @param  {number} y the vertical coordinate of the event
     * @param  {boolean} isLeftMouse was the left mouse button pressed?
     * @param  {boolean} isMiddleMouse was the middle mouse button pressed?
     * @access private
     */
  }, {
    key: 'startDrag',
    value: function startDrag(_ref2) {
      var _this10 = this;

      var y = _ref2.y;
      var isLeftMouse = _ref2.isLeftMouse;
      var isMiddleMouse = _ref2.isMiddleMouse;

      if (!Disposable) {
        var _require3 = require('atom');

        CompositeDisposable = _require3.CompositeDisposable;
        Disposable = _require3.Disposable;
      }

      if (!this.minimap) {
        return;
      }
      if (!isLeftMouse && !isMiddleMouse) {
        return;
      }

      var _visibleArea$getBoundingClientRect2 = this.visibleArea.getBoundingClientRect();

      var top = _visibleArea$getBoundingClientRect2.top;

      var _getBoundingClientRect2 = this.getBoundingClientRect();

      var offsetTop = _getBoundingClientRect2.top;

      var dragOffset = y - top;

      var initial = { dragOffset: dragOffset, offsetTop: offsetTop };

      var mousemoveHandler = function mousemoveHandler(e) {
        return _this10.drag(_this10.extractMouseEventData(e), initial);
      };
      var mouseupHandler = function mouseupHandler(e) {
        return _this10.endDrag();
      };

      var touchmoveHandler = function touchmoveHandler(e) {
        return _this10.drag(_this10.extractTouchEventData(e), initial);
      };
      var touchendHandler = function touchendHandler(e) {
        return _this10.endDrag();
      };

      document.body.addEventListener('mousemove', mousemoveHandler);
      document.body.addEventListener('mouseup', mouseupHandler);
      document.body.addEventListener('mouseleave', mouseupHandler);

      document.body.addEventListener('touchmove', touchmoveHandler);
      document.body.addEventListener('touchend', touchendHandler);
      document.body.addEventListener('touchcancel', touchendHandler);

      this.dragSubscription = new Disposable(function () {
        document.body.removeEventListener('mousemove', mousemoveHandler);
        document.body.removeEventListener('mouseup', mouseupHandler);
        document.body.removeEventListener('mouseleave', mouseupHandler);

        document.body.removeEventListener('touchmove', touchmoveHandler);
        document.body.removeEventListener('touchend', touchendHandler);
        document.body.removeEventListener('touchcancel', touchendHandler);
      });
    }

    /**
     * The method called during the drag gesture.
     *
     * @param  {number} y the vertical coordinate of the event
     * @param  {boolean} isLeftMouse was the left mouse button pressed?
     * @param  {boolean} isMiddleMouse was the middle mouse button pressed?
     * @param  {number} initial.dragOffset the mouse offset within the visible
     *                                     area
     * @param  {number} initial.offsetTop the MinimapElement offset at the moment
     *                                    of the drag start
     * @access private
     */
  }, {
    key: 'drag',
    value: function drag(_ref3, initial) {
      var y = _ref3.y;
      var isLeftMouse = _ref3.isLeftMouse;
      var isMiddleMouse = _ref3.isMiddleMouse;

      if (!this.minimap) {
        return;
      }
      if (!isLeftMouse && !isMiddleMouse) {
        return;
      }
      var deltaY = y - initial.offsetTop - initial.dragOffset;

      var ratio = deltaY / (this.minimap.getVisibleHeight() - this.minimap.getTextEditorScaledHeight());

      this.minimap.setTextEditorScrollTop(ratio * this.minimap.getTextEditorMaxScrollTop());
    }

    /**
     * The method that ends the drag gesture.
     *
     * @access private
     */
  }, {
    key: 'endDrag',
    value: function endDrag() {
      if (!this.minimap) {
        return;
      }
      this.dragSubscription.dispose();
    }

    //     ######   ######   ######
    //    ##    ## ##    ## ##    ##
    //    ##       ##       ##
    //    ##        ######   ######
    //    ##             ##       ##
    //    ##    ## ##    ## ##    ##
    //     ######   ######   ######

    /**
     * Applies the passed-in styles properties to the specified element
     *
     * @param  {HTMLElement} element the element onto which apply the styles
     * @param  {Object} styles the styles to apply
     * @access private
     */
  }, {
    key: 'applyStyles',
    value: function applyStyles(element, styles) {
      if (!element) {
        return;
      }

      var cssText = '';
      for (var property in styles) {
        cssText += property + ': ' + styles[property] + '; ';
      }

      element.style.cssText = cssText;
    }

    /**
     * Returns a string with a CSS translation tranform value.
     *
     * @param  {number} [x = 0] the x offset of the translation
     * @param  {number} [y = 0] the y offset of the translation
     * @return {string} the CSS translation string
     * @access private
     */
  }, {
    key: 'makeTranslate',
    value: function makeTranslate() {
      var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

      if (this.useHardwareAcceleration) {
        return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
      } else {
        return 'translate(' + x + 'px, ' + y + 'px)';
      }
    }

    /**
     * Returns a string with a CSS scaling tranform value.
     *
     * @param  {number} [x = 0] the x scaling factor
     * @param  {number} [y = 0] the y scaling factor
     * @return {string} the CSS scaling string
     * @access private
     */
  }, {
    key: 'makeScale',
    value: function makeScale() {
      var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var y = arguments.length <= 1 || arguments[1] === undefined ? x : arguments[1];
      return (function () {
        if (this.useHardwareAcceleration) {
          return 'scale3d(' + x + ', ' + y + ', 1)';
        } else {
          return 'scale(' + x + ', ' + y + ')';
        }
      }).apply(this, arguments);
    }

    /**
     * A method that return the current time as a Date.
     *
     * That method exist so that we can mock it in tests.
     *
     * @return {Date} the current time as Date
     * @access private
     */
  }, {
    key: 'getTime',
    value: function getTime() {
      return new Date();
    }

    /**
     * A method that mimic the jQuery `animate` method and used to animate the
     * scroll when clicking on the MinimapElement canvas.
     *
     * @param  {Object} param the animation data object
     * @param  {[type]} param.from the start value
     * @param  {[type]} param.to the end value
     * @param  {[type]} param.duration the animation duration
     * @param  {[type]} param.step the easing function for the animation
     * @access private
     */
  }, {
    key: 'animate',
    value: function animate(_ref4) {
      var _this11 = this;

      var from = _ref4.from;
      var to = _ref4.to;
      var duration = _ref4.duration;
      var step = _ref4.step;

      var start = this.getTime();
      var progress = undefined;

      var swing = function swing(progress) {
        return 0.5 - Math.cos(progress * Math.PI) / 2;
      };

      var update = function update() {
        if (!_this11.minimap) {
          return;
        }

        var passed = _this11.getTime() - start;
        if (duration === 0) {
          progress = 1;
        } else {
          progress = passed / duration;
        }
        if (progress > 1) {
          progress = 1;
        }
        var delta = swing(progress);
        var value = from + (to - from) * delta;
        step(value, delta);

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };

      update();
    }
  }]);

  var _MinimapElement = MinimapElement;
  MinimapElement = (0, _decoratorsInclude2['default'])(_mixinsDomStylesReader2['default'], _mixinsCanvasDrawer2['default'], _atomUtils.EventsDelegation, _atomUtils.AncestorsMethods)(MinimapElement) || MinimapElement;
  MinimapElement = (0, _decoratorsElement2['default'])('atom-text-editor-minimap')(MinimapElement) || MinimapElement;
  return MinimapElement;
})();

exports['default'] = MinimapElement;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvbWluaW1hcC1lbGVtZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7eUJBRWlELFlBQVk7O3FDQUNqQyw0QkFBNEI7Ozs7a0NBQy9CLHdCQUF3Qjs7OztpQ0FDN0Isc0JBQXNCOzs7O2lDQUN0QixzQkFBc0I7Ozs7QUFOMUMsV0FBVyxDQUFBOztBQVFYLElBQUksSUFBSSxZQUFBO0lBQUUsMkJBQTJCLFlBQUE7SUFBRSxtQkFBbUIsWUFBQTtJQUFFLFVBQVUsWUFBQSxDQUFBOztBQUV0RSxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBa0JkLGNBQWM7V0FBZCxjQUFjOzs7O2VBQWQsY0FBYzs7Ozs7Ozs7Ozs7Ozs7OztXQWVqQiwyQkFBRzs7O0FBQ2pCLFVBQUksQ0FBQyxtQkFBbUIsRUFBRTt1QkFDYSxPQUFPLENBQUMsTUFBTSxDQUFDOztBQUFsRCwyQkFBbUIsWUFBbkIsbUJBQW1CO0FBQUUsa0JBQVUsWUFBVixVQUFVO09BQ2xDOzs7Ozs7O0FBT0QsVUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUE7Ozs7QUFJeEIsVUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUE7Ozs7QUFJOUIsVUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUE7Ozs7QUFJdEIsVUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUE7Ozs7Ozs7QUFPdkIsVUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUE7Ozs7QUFJOUMsVUFBSSxDQUFDLHVCQUF1QixHQUFHLFNBQVMsQ0FBQTs7OztBQUl4QyxVQUFJLENBQUMseUJBQXlCLEdBQUcsU0FBUyxDQUFBOzs7O0FBSTFDLFVBQUksQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUE7Ozs7QUFJakMsVUFBSSxDQUFDLDRCQUE0QixHQUFHLFNBQVMsQ0FB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QUFDRCxZQUFJLFFBQVEsR0FBRyxDQUFDLEVBQUU7QUFBRSxrQkFBUSxHQUFHLENBQUMsQ0FBQTtTQUFFO0FBQ2xDLFlBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUM3QixZQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFBLEdBQUksS0FBSyxDQUFBO0FBQ3hDLFlBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUE7O0FBRWxCLFlBQUksUUFBUSxHQUFHLENBQUMsRUFBRTtBQUFFLCtCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFBO1NBQUU7T0FDcEQsQ0FBQTs7QUFFRCxZQUFNLEVBQUUsQ0FBQTtLQUNUOzs7d0JBbjBDa0IsY0FBYztBQUFkLGdCQUFjLEdBRGxDLGtLQUEwRSxDQUN0RCxjQUFjLEtBQWQsY0FBYztBQUFkLGdCQUFjLEdBRmxDLG9DQUFRLDBCQUEwQixDQUFDLENBRWYsY0FBYyxLQUFkLGNBQWM7U0FBZCxjQUFjOzs7cUJBQWQsY0FBYyIsImZpbGUiOiIvaG9tZS90YWthYWtpLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvbGliL21pbmltYXAtZWxlbWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7RXZlbnRzRGVsZWdhdGlvbiwgQW5jZXN0b3JzTWV0aG9kc30gZnJvbSAnYXRvbS11dGlscydcbmltcG9ydCBET01TdHlsZXNSZWFkZXIgZnJvbSAnLi9taXhpbnMvZG9tLXN0eWxlcy1yZWFkZXInXG5pbXBvcnQgQ2FudmFzRHJhd2VyIGZyb20gJy4vbWl4aW5zL2NhbnZhcy1kcmF3ZXInXG5pbXBvcnQgaW5jbHVkZSBmcm9tICcuL2RlY29yYXRvcnMvaW5jbHVkZSdcbmltcG9ydCBlbGVtZW50IGZyb20gJy4vZGVjb3JhdG9ycy9lbGVtZW50J1xuXG5sZXQgTWFpbiwgTWluaW1hcFF1aWNrU2V0dGluZ3NFbGVtZW50LCBDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlXG5cbmNvbnN0IFNQRUNfTU9ERSA9IGF0b20uaW5TcGVjTW9kZSgpXG5cbi8qKlxuICogUHVibGljOiBUaGUgTWluaW1hcEVsZW1lbnQgaXMgdGhlIHZpZXcgbWVhbnQgdG8gcmVuZGVyIGEge0BsaW5rIE1pbmltYXB9XG4gKiBpbnN0YW5jZSBpbiB0aGUgRE9NLlxuICpcbiAqIFlvdSBjYW4gcmV0cmlldmUgdGhlIE1pbmltYXBFbGVtZW50IGFzc29jaWF0ZWQgdG8gYSBNaW5pbWFwXG4gKiB1c2luZyB0aGUgYGF0b20udmlld3MuZ2V0Vmlld2AgbWV0aG9kLlxuICpcbiAqIE5vdGUgdGhhdCBtb3N0IGludGVyYWN0aW9ucyB3aXRoIHRoZSBNaW5pbWFwIHBhY2thZ2UgaXMgZG9uZSB0aHJvdWdoIHRoZVxuICogTWluaW1hcCBtb2RlbCBzbyB5b3Ugc2hvdWxkIG5ldmVyIGhhdmUgdG8gYWNjZXNzIE1pbmltYXBFbGVtZW50XG4gKiBpbnN0YW5jZXMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGxldCBtaW5pbWFwRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhtaW5pbWFwKVxuICovXG5AZWxlbWVudCgnYXRvbS10ZXh0LWVkaXRvci1taW5pbWFwJylcbkBpbmNsdWRlKERPTVN0eWxlc1JlYWRlciwgQ2FudmFzRHJhd2VyLCBFdmVudHNEZWxlZ2F0aW9uLCBBbmNlc3RvcnNNZXRob2RzKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWluaW1hcEVsZW1lbnQge1xuXG4gIC8vICAgICMjICAgICAjIyAgIyMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjICAjIyMjIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAjIyAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgIyMgIyMgICMjICAgIyNcbiAgLy8gICAgIyMjIyMjIyMjICMjICAgICAjIyAjIyAgICAgIyMgIyMjIyMgICAgICMjIyMjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgIyMgICAgICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICMjICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICMjIyMjIyMgICAjIyMjIyMjICAjIyAgICAjIyAgIyMjIyMjXG5cbiAgLyoqXG4gICAqIERPTSBjYWxsYmFjayBpbnZva2VkIHdoZW4gYSBuZXcgTWluaW1hcEVsZW1lbnQgaXMgY3JlYXRlZC5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjcmVhdGVkQ2FsbGJhY2sgKCkge1xuICAgIGlmICghQ29tcG9zaXRlRGlzcG9zYWJsZSkge1xuICAgICAgKHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKSlcbiAgICB9XG5cbiAgICAvLyBDb3JlIHByb3BlcnRpZXNcblxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMubWluaW1hcCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuZWRpdG9yRWxlbWVudCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMud2lkdGggPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmhlaWdodCA9IHVuZGVmaW5lZFxuXG4gICAgLy8gU3Vic2NyaXB0aW9uc1xuXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMudmlzaWJsZUFyZWFTdWJzY3JpcHRpb24gPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnF1aWNrU2V0dGluZ3NTdWJzY3JpcHRpb24gPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmRyYWdTdWJzY3JpcHRpb24gPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLm9wZW5RdWlja1NldHRpbmdTdWJzY3JpcHRpb24gPSB1bmRlZmluZWRcblxuICAgIC8vIENvbmZpZ3NcblxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLmRpc3BsYXlNaW5pbWFwT25MZWZ0ID0gZmFsc2VcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMuZGlzcGxheU1pbmltYXBPbkxlZnQgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMudGV4dE9wYWNpdHkgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5kaXNwbGF5Q29kZUhpZ2hsaWdodHMgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5hZGp1c3RUb1NvZnRXcmFwID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMudXNlSGFyZHdhcmVBY2NlbGVyYXRpb24gPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5hYnNvbHV0ZU1vZGUgPSB1bmRlZmluZWRcblxuICAgIC8vIEVsZW1lbnRzXG5cbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnNoYWRvd1Jvb3QgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnZpc2libGVBcmVhID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5jb250cm9scyA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuc2Nyb2xsSW5kaWNhdG9yID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5vcGVuUXVpY2tTZXR0aW5ncyA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQgPSB1bmRlZmluZWRcblxuICAgIC8vIFN0YXRlc1xuXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMuYXR0YWNoZWQgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5hdHRhY2hlZFRvVGV4dEVkaXRvciA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLnN0YW5kQWxvbmUgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLndhc1Zpc2libGUgPSB1bmRlZmluZWRcblxuICAgIC8vIE90aGVyXG5cbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLm9mZnNjcmVlbkZpcnN0Um93ID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5vZmZzY3JlZW5MYXN0Um93ID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5mcmFtZVJlcXVlc3RlZCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuZmxleEJhc2lzID0gdW5kZWZpbmVkXG5cbiAgICB0aGlzLmluaXRpYWxpemVDb250ZW50KClcblxuICAgIHJldHVybiB0aGlzLm9ic2VydmVDb25maWcoe1xuICAgICAgJ21pbmltYXAuZGlzcGxheU1pbmltYXBPbkxlZnQnOiAoZGlzcGxheU1pbmltYXBPbkxlZnQpID0+IHtcbiAgICAgICAgdGhpcy5kaXNwbGF5TWluaW1hcE9uTGVmdCA9IGRpc3BsYXlNaW5pbWFwT25MZWZ0XG5cbiAgICAgICAgdGhpcy51cGRhdGVNaW5pbWFwRmxleFBvc2l0aW9uKClcbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLm1pbmltYXBTY3JvbGxJbmRpY2F0b3InOiAobWluaW1hcFNjcm9sbEluZGljYXRvcikgPT4ge1xuICAgICAgICB0aGlzLm1pbmltYXBTY3JvbGxJbmRpY2F0b3IgPSBtaW5pbWFwU2Nyb2xsSW5kaWNhdG9yXG5cbiAgICAgICAgaWYgKHRoaXMubWluaW1hcFNjcm9sbEluZGljYXRvciAmJiAhKHRoaXMuc2Nyb2xsSW5kaWNhdG9yICE9IG51bGwpICYmICF0aGlzLnN0YW5kQWxvbmUpIHtcbiAgICAgICAgICB0aGlzLmluaXRpYWxpemVTY3JvbGxJbmRpY2F0b3IoKVxuICAgICAgICB9IGVsc2UgaWYgKCh0aGlzLnNjcm9sbEluZGljYXRvciAhPSBudWxsKSkge1xuICAgICAgICAgIHRoaXMuZGlzcG9zZVNjcm9sbEluZGljYXRvcigpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLnJlcXVlc3RVcGRhdGUoKSB9XG4gICAgICB9LFxuXG4gICAgICAnbWluaW1hcC5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzJzogKGRpc3BsYXlQbHVnaW5zQ29udHJvbHMpID0+IHtcbiAgICAgICAgdGhpcy5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzID0gZGlzcGxheVBsdWdpbnNDb250cm9sc1xuXG4gICAgICAgIGlmICh0aGlzLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMgJiYgISh0aGlzLm9wZW5RdWlja1NldHRpbmdzICE9IG51bGwpICYmICF0aGlzLnN0YW5kQWxvbmUpIHtcbiAgICAgICAgICB0aGlzLmluaXRpYWxpemVPcGVuUXVpY2tTZXR0aW5ncygpXG4gICAgICAgIH0gZWxzZSBpZiAoKHRoaXMub3BlblF1aWNrU2V0dGluZ3MgIT0gbnVsbCkpIHtcbiAgICAgICAgICB0aGlzLmRpc3Bvc2VPcGVuUXVpY2tTZXR0aW5ncygpXG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLnRleHRPcGFjaXR5JzogKHRleHRPcGFjaXR5KSA9PiB7XG4gICAgICAgIHRoaXMudGV4dE9wYWNpdHkgPSB0ZXh0T3BhY2l0eVxuXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLmRpc3BsYXlDb2RlSGlnaGxpZ2h0cyc6IChkaXNwbGF5Q29kZUhpZ2hsaWdodHMpID0+IHtcbiAgICAgICAgdGhpcy5kaXNwbGF5Q29kZUhpZ2hsaWdodHMgPSBkaXNwbGF5Q29kZUhpZ2hsaWdodHNcblxuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKSB9XG4gICAgICB9LFxuXG4gICAgICAnbWluaW1hcC5zbW9vdGhTY3JvbGxpbmcnOiAoc21vb3RoU2Nyb2xsaW5nKSA9PiB7XG4gICAgICAgIHRoaXMuc21vb3RoU2Nyb2xsaW5nID0gc21vb3RoU2Nyb2xsaW5nXG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHtcbiAgICAgICAgICBpZiAoIXRoaXMuc21vb3RoU2Nyb2xsaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmJhY2tMYXllci5jYW52YXMuc3R5bGUuY3NzVGV4dCA9ICcnXG4gICAgICAgICAgICB0aGlzLnRva2Vuc0xheWVyLmNhbnZhcy5zdHlsZS5jc3NUZXh0ID0gJydcbiAgICAgICAgICAgIHRoaXMuZnJvbnRMYXllci5jYW52YXMuc3R5bGUuY3NzVGV4dCA9ICcnXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAnbWluaW1hcC5hZGp1c3RNaW5pbWFwV2lkdGhUb1NvZnRXcmFwJzogKGFkanVzdFRvU29mdFdyYXApID0+IHtcbiAgICAgICAgdGhpcy5hZGp1c3RUb1NvZnRXcmFwID0gYWRqdXN0VG9Tb2Z0V3JhcFxuXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMubWVhc3VyZUhlaWdodEFuZFdpZHRoKCkgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAuYWRqdXN0TWluaW1hcFdpZHRoT25seUlmU21hbGxlcic6IChhZGp1c3RPbmx5SWZTbWFsbGVyKSA9PiB7XG4gICAgICAgIHRoaXMuYWRqdXN0T25seUlmU21hbGxlciA9IGFkanVzdE9ubHlJZlNtYWxsZXJcblxuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLm1lYXN1cmVIZWlnaHRBbmRXaWR0aCgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLnVzZUhhcmR3YXJlQWNjZWxlcmF0aW9uJzogKHVzZUhhcmR3YXJlQWNjZWxlcmF0aW9uKSA9PiB7XG4gICAgICAgIHRoaXMudXNlSGFyZHdhcmVBY2NlbGVyYXRpb24gPSB1c2VIYXJkd2FyZUFjY2VsZXJhdGlvblxuXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLmFic29sdXRlTW9kZSc6IChhYnNvbHV0ZU1vZGUpID0+IHtcbiAgICAgICAgdGhpcy5hYnNvbHV0ZU1vZGUgPSBhYnNvbHV0ZU1vZGVcblxuICAgICAgICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ2Fic29sdXRlJywgdGhpcy5hYnNvbHV0ZU1vZGUpXG4gICAgICB9LFxuXG4gICAgICAnbWluaW1hcC5hZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQnOiAoYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0KSA9PiB7XG4gICAgICAgIHRoaXMuYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0ID0gYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0XG5cbiAgICAgICAgdGhpcy5jbGFzc0xpc3QudG9nZ2xlKCdhZGp1c3QtYWJzb2x1dGUtaGVpZ2h0JywgdGhpcy5hZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQpXG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5tZWFzdXJlSGVpZ2h0QW5kV2lkdGgoKSB9XG4gICAgICB9LFxuXG4gICAgICAnbWluaW1hcC5pZ25vcmVXaGl0ZXNwYWNlc0luVG9rZW5zJzogKGlnbm9yZVdoaXRlc3BhY2VzSW5Ub2tlbnMpID0+IHtcbiAgICAgICAgdGhpcy5pZ25vcmVXaGl0ZXNwYWNlc0luVG9rZW5zID0gaWdub3JlV2hpdGVzcGFjZXNJblRva2Vuc1xuXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdlZGl0b3IucHJlZmVycmVkTGluZUxlbmd0aCc6ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5tZWFzdXJlSGVpZ2h0QW5kV2lkdGgoKSB9XG4gICAgICB9LFxuXG4gICAgICAnZWRpdG9yLnNvZnRXcmFwJzogKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLnJlcXVlc3RVcGRhdGUoKSB9XG4gICAgICB9LFxuXG4gICAgICAnZWRpdG9yLnNob3dJbnZpc2libGVzJzogKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLnJlcXVlc3RVcGRhdGUoKSB9XG4gICAgICB9LFxuXG4gICAgICAnZWRpdG9yLmludmlzaWJsZXMnOiAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdlZGl0b3Iuc29mdFdyYXBBdFByZWZlcnJlZExpbmVMZW5ndGgnOiAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdFVwZGF0ZSgpIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIERPTSBjYWxsYmFjayBpbnZva2VkIHdoZW4gYSBuZXcgTWluaW1hcEVsZW1lbnQgaXMgYXR0YWNoZWQgdG8gdGhlIERPTS5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBhdHRhY2hlZENhbGxiYWNrICgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20udmlld3MucG9sbERvY3VtZW50KCgpID0+IHsgdGhpcy5wb2xsRE9NKCkgfSkpXG4gICAgdGhpcy5tZWFzdXJlSGVpZ2h0QW5kV2lkdGgoKVxuICAgIHRoaXMudXBkYXRlTWluaW1hcEZsZXhQb3NpdGlvbigpXG4gICAgdGhpcy5hdHRhY2hlZCA9IHRydWVcbiAgICB0aGlzLmF0dGFjaGVkVG9UZXh0RWRpdG9yID0gdGhpcy5wYXJlbnROb2RlID09PSB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50Um9vdCgpXG5cbiAgICBpZiAodGhpcy5hdHRhY2hlZFRvVGV4dEVkaXRvcikge1xuICAgICAgdGhpcy5nZXRUZXh0RWRpdG9yRWxlbWVudCgpLnNldEF0dHJpYnV0ZSgnd2l0aC1taW5pbWFwJywgJycpXG4gICAgfVxuXG4gICAgLypcbiAgICAgIFdlIHVzZSBgYXRvbS5zdHlsZXMub25EaWRBZGRTdHlsZUVsZW1lbnRgIGluc3RlYWQgb2ZcbiAgICAgIGBhdG9tLnRoZW1lcy5vbkRpZENoYW5nZUFjdGl2ZVRoZW1lc2AuXG4gICAgICBXaHk/IEN1cnJlbnRseSwgVGhlIHN0eWxlIGVsZW1lbnQgd2lsbCBiZSByZW1vdmVkIGZpcnN0LCBhbmQgdGhlbiByZS1hZGRlZFxuICAgICAgYW5kIHRoZSBgY2hhbmdlYCBldmVudCBoYXMgbm90IGJlIHRyaWdnZXJlZCBpbiB0aGUgcHJvY2Vzcy5cbiAgICAqL1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5zdHlsZXMub25EaWRBZGRTdHlsZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgdGhpcy5pbnZhbGlkYXRlRE9NU3R5bGVzQ2FjaGUoKVxuICAgICAgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5zdWJzY3JpYmVUb01lZGlhUXVlcnkoKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBET00gY2FsbGJhY2sgaW52b2tlZCB3aGVuIGEgbmV3IE1pbmltYXBFbGVtZW50IGlzIGRldGFjaGVkIGZyb20gdGhlIERPTS5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBkZXRhY2hlZENhbGxiYWNrICgpIHtcbiAgICB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50KCkucmVtb3ZlQXR0cmlidXRlKCd3aXRoLW1pbmltYXAnKVxuICAgIHRoaXMuYXR0YWNoZWQgPSBmYWxzZVxuICB9XG5cbiAgLy8gICAgICAgIyMjICAgICMjIyMjIyMjICMjIyMjIyMjICAgICMjIyAgICAgIyMjIyMjICAjIyAgICAgIyNcbiAgLy8gICAgICAjIyAjIyAgICAgICMjICAgICAgICMjICAgICAgIyMgIyMgICAjIyAgICAjIyAjIyAgICAgIyNcbiAgLy8gICAgICMjICAgIyMgICAgICMjICAgICAgICMjICAgICAjIyAgICMjICAjIyAgICAgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjICAgICAjIyAjIyAgICAgICAjIyMjIyMjIyNcbiAgLy8gICAgIyMjIyMjIyMjICAgICMjICAgICAgICMjICAgICMjIyMjIyMjIyAjIyAgICAgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjICAgICAjIyAjIyAgICAjIyAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjICAgICAjIyAgIyMjIyMjICAjIyAgICAgIyNcblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBNaW5pbWFwRWxlbWVudCBpcyBjdXJyZW50bHkgdmlzaWJsZSBvbiBzY3JlZW4gb3Igbm90LlxuICAgKlxuICAgKiBUaGUgdmlzaWJpbGl0eSBvZiB0aGUgbWluaW1hcCBpcyBkZWZpbmVkIGJ5IHRlc3RpbmcgdGhlIHNpemUgb2YgdGhlIG9mZnNldFxuICAgKiB3aWR0aCBhbmQgaGVpZ2h0IG9mIHRoZSBlbGVtZW50LlxuICAgKlxuICAgKiBAcmV0dXJuIHtib29sZWFufSB3aGV0aGVyIHRoZSBNaW5pbWFwRWxlbWVudCBpcyBjdXJyZW50bHkgdmlzaWJsZSBvciBub3RcbiAgICovXG4gIGlzVmlzaWJsZSAoKSB7IHJldHVybiB0aGlzLm9mZnNldFdpZHRoID4gMCB8fCB0aGlzLm9mZnNldEhlaWdodCA+IDAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyB0aGUgTWluaW1hcEVsZW1lbnQgdG8gdGhlIERPTS5cbiAgICpcbiAgICogVGhlIHBvc2l0aW9uIGF0IHdoaWNoIHRoZSBlbGVtZW50IGlzIGF0dGFjaGVkIGlzIGRlZmluZWQgYnkgdGhlXG4gICAqIGBkaXNwbGF5TWluaW1hcE9uTGVmdGAgc2V0dGluZy5cbiAgICpcbiAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IFtwYXJlbnRdIHRoZSBET00gbm9kZSB3aGVyZSBhdHRhY2hpbmcgdGhlIG1pbmltYXBcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRcbiAgICovXG4gIGF0dGFjaCAocGFyZW50KSB7XG4gICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgcmV0dXJuIH1cblxuICAgIGNvbnN0IGNvbnRhaW5lciA9IHBhcmVudCB8fCB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50Um9vdCgpXG4gICAgbGV0IG1pbmltYXBzID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJ2F0b20tdGV4dC1lZGl0b3ItbWluaW1hcCcpXG4gICAgaWYgKG1pbmltYXBzLmxlbmd0aCkge1xuICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChtaW5pbWFwcywgKGVsKSA9PiB7IGVsLmRlc3Ryb3koKSB9KVxuICAgIH1cbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcylcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRhY2hlcyB0aGUgTWluaW1hcEVsZW1lbnQgZnJvbSB0aGUgRE9NLlxuICAgKi9cbiAgZGV0YWNoICgpIHtcbiAgICBpZiAoIXRoaXMuYXR0YWNoZWQgfHwgdGhpcy5wYXJlbnROb2RlID09IG51bGwpIHsgcmV0dXJuIH1cbiAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcylcbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBtaW5pbWFwIGxlZnQvcmlnaHQgcG9zaXRpb24gYmFzZWQgb24gdGhlIHZhbHVlIG9mIHRoZVxuICAgKiBgZGlzcGxheU1pbmltYXBPbkxlZnRgIHNldHRpbmcuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgdXBkYXRlTWluaW1hcEZsZXhQb3NpdGlvbiAoKSB7XG4gICAgdGhpcy5jbGFzc0xpc3QudG9nZ2xlKCdsZWZ0JywgdGhpcy5kaXNwbGF5TWluaW1hcE9uTGVmdClcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGlzIE1pbmltYXBFbGVtZW50XG4gICAqL1xuICBkZXN0cm95ICgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgdGhpcy5kZXRhY2goKVxuICAgIHRoaXMubWluaW1hcCA9IG51bGxcbiAgfVxuXG4gIC8vICAgICAjIyMjIyMgICAjIyMjIyMjICAjIyAgICAjIyAjIyMjIyMjIyAjIyMjIyMjIyAjIyAgICAjIyAjIyMjIyMjI1xuICAvLyAgICAjIyAgICAjIyAjIyAgICAgIyMgIyMjICAgIyMgICAgIyMgICAgIyMgICAgICAgIyMjICAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICAgIyMgICAgICMjICMjIyMgICMjICAgICMjICAgICMjICAgICAgICMjIyMgICMjICAgICMjXG4gIC8vICAgICMjICAgICAgICMjICAgICAjIyAjIyAjIyAjIyAgICAjIyAgICAjIyMjIyMgICAjIyAjIyAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICMjIyMgICAgIyMgICAgIyMgICAgICAgIyMgICMjIyMgICAgIyNcbiAgLy8gICAgIyMgICAgIyMgIyMgICAgICMjICMjICAgIyMjICAgICMjICAgICMjICAgICAgICMjICAgIyMjICAgICMjXG4gIC8vICAgICAjIyMjIyMgICAjIyMjIyMjICAjIyAgICAjIyAgICAjIyAgICAjIyMjIyMjIyAjIyAgICAjIyAgICAjI1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHRoZSBjb250ZW50IG9mIHRoZSBNaW5pbWFwRWxlbWVudCBhbmQgYXR0YWNoZXMgdGhlIG1vdXNlIGNvbnRyb2xcbiAgICogZXZlbnQgbGlzdGVuZXJzLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGluaXRpYWxpemVDb250ZW50ICgpIHtcbiAgICB0aGlzLmluaXRpYWxpemVDYW52YXMoKVxuXG4gICAgdGhpcy5zaGFkb3dSb290ID0gdGhpcy5jcmVhdGVTaGFkb3dSb290KClcbiAgICB0aGlzLmF0dGFjaENhbnZhc2VzKHRoaXMuc2hhZG93Um9vdClcblxuICAgIHRoaXMuY3JlYXRlVmlzaWJsZUFyZWEoKVxuICAgIHRoaXMuY3JlYXRlQ29udHJvbHMoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnN1YnNjcmliZVRvKHRoaXMsIHtcbiAgICAgICdtb3VzZXdoZWVsJzogKGUpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YW5kQWxvbmUpIHtcbiAgICAgICAgICB0aGlzLnJlbGF5TW91c2V3aGVlbEV2ZW50KGUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5zdWJzY3JpYmVUbyh0aGlzLmdldEZyb250Q2FudmFzKCksIHtcbiAgICAgICdtb3VzZWRvd24nOiAoZSkgPT4geyB0aGlzLmNhbnZhc1ByZXNzZWQodGhpcy5leHRyYWN0TW91c2VFdmVudERhdGEoZSkpIH0sXG4gICAgICAndG91Y2hzdGFydCc6IChlKSA9PiB7IHRoaXMuY2FudmFzUHJlc3NlZCh0aGlzLmV4dHJhY3RUb3VjaEV2ZW50RGF0YShlKSkgfVxuICAgIH0pKVxuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSB2aXNpYmxlIGFyZWEgZGl2LlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGNyZWF0ZVZpc2libGVBcmVhICgpIHtcbiAgICBpZiAodGhpcy52aXNpYmxlQXJlYSkgeyByZXR1cm4gfVxuXG4gICAgdGhpcy52aXNpYmxlQXJlYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdGhpcy52aXNpYmxlQXJlYS5jbGFzc0xpc3QuYWRkKCdtaW5pbWFwLXZpc2libGUtYXJlYScpXG4gICAgdGhpcy5zaGFkb3dSb290LmFwcGVuZENoaWxkKHRoaXMudmlzaWJsZUFyZWEpXG4gICAgdGhpcy52aXNpYmxlQXJlYVN1YnNjcmlwdGlvbiA9IHRoaXMuc3Vic2NyaWJlVG8odGhpcy52aXNpYmxlQXJlYSwge1xuICAgICAgJ21vdXNlZG93bic6IChlKSA9PiB7IHRoaXMuc3RhcnREcmFnKHRoaXMuZXh0cmFjdE1vdXNlRXZlbnREYXRhKGUpKSB9LFxuICAgICAgJ3RvdWNoc3RhcnQnOiAoZSkgPT4geyB0aGlzLnN0YXJ0RHJhZyh0aGlzLmV4dHJhY3RUb3VjaEV2ZW50RGF0YShlKSkgfVxuICAgIH0pXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMudmlzaWJsZUFyZWFTdWJzY3JpcHRpb24pXG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyB0aGUgdmlzaWJsZSBhcmVhIGRpdi5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICByZW1vdmVWaXNpYmxlQXJlYSAoKSB7XG4gICAgaWYgKCF0aGlzLnZpc2libGVBcmVhKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMucmVtb3ZlKHRoaXMudmlzaWJsZUFyZWFTdWJzY3JpcHRpb24pXG4gICAgdGhpcy52aXNpYmxlQXJlYVN1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICB0aGlzLnNoYWRvd1Jvb3QucmVtb3ZlQ2hpbGQodGhpcy52aXNpYmxlQXJlYSlcbiAgICBkZWxldGUgdGhpcy52aXNpYmxlQXJlYVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgdGhlIGNvbnRyb2xzIGNvbnRhaW5lciBkaXYuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgY3JlYXRlQ29udHJvbHMgKCkge1xuICAgIGlmICh0aGlzLmNvbnRyb2xzIHx8IHRoaXMuc3RhbmRBbG9uZSkgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5jb250cm9scyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdGhpcy5jb250cm9scy5jbGFzc0xpc3QuYWRkKCdtaW5pbWFwLWNvbnRyb2xzJylcbiAgICB0aGlzLnNoYWRvd1Jvb3QuYXBwZW5kQ2hpbGQodGhpcy5jb250cm9scylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSBjb250cm9scyBjb250YWluZXIgZGl2LlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHJlbW92ZUNvbnRyb2xzICgpIHtcbiAgICBpZiAoIXRoaXMuY29udHJvbHMpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuc2hhZG93Um9vdC5yZW1vdmVDaGlsZCh0aGlzLmNvbnRyb2xzKVxuICAgIGRlbGV0ZSB0aGlzLmNvbnRyb2xzXG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIHNjcm9sbCBpbmRpY2F0b3IgZGl2IHdoZW4gdGhlIGBtaW5pbWFwU2Nyb2xsSW5kaWNhdG9yYFxuICAgKiBzZXR0aW5ncyBpcyBlbmFibGVkLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGluaXRpYWxpemVTY3JvbGxJbmRpY2F0b3IgKCkge1xuICAgIGlmICh0aGlzLnNjcm9sbEluZGljYXRvciB8fCB0aGlzLnN0YW5kQWxvbmUpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuc2Nyb2xsSW5kaWNhdG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLnNjcm9sbEluZGljYXRvci5jbGFzc0xpc3QuYWRkKCdtaW5pbWFwLXNjcm9sbC1pbmRpY2F0b3InKVxuICAgIHRoaXMuY29udHJvbHMuYXBwZW5kQ2hpbGQodGhpcy5zY3JvbGxJbmRpY2F0b3IpXG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZXMgdGhlIHNjcm9sbCBpbmRpY2F0b3IgZGl2IHdoZW4gdGhlIGBtaW5pbWFwU2Nyb2xsSW5kaWNhdG9yYFxuICAgKiBzZXR0aW5ncyBpcyBkaXNhYmxlZC5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBkaXNwb3NlU2Nyb2xsSW5kaWNhdG9yICgpIHtcbiAgICBpZiAoIXRoaXMuc2Nyb2xsSW5kaWNhdG9yKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLmNvbnRyb2xzLnJlbW92ZUNoaWxkKHRoaXMuc2Nyb2xsSW5kaWNhdG9yKVxuICAgIGRlbGV0ZSB0aGlzLnNjcm9sbEluZGljYXRvclxuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBxdWljayBzZXR0aW5ncyBvcGVuZW5lciBkaXYgd2hlbiB0aGVcbiAgICogYGRpc3BsYXlQbHVnaW5zQ29udHJvbHNgIHNldHRpbmcgaXMgZW5hYmxlZC5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplT3BlblF1aWNrU2V0dGluZ3MgKCkge1xuICAgIGlmICh0aGlzLm9wZW5RdWlja1NldHRpbmdzIHx8IHRoaXMuc3RhbmRBbG9uZSkgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5vcGVuUXVpY2tTZXR0aW5ncyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdGhpcy5vcGVuUXVpY2tTZXR0aW5ncy5jbGFzc0xpc3QuYWRkKCdvcGVuLW1pbmltYXAtcXVpY2stc2V0dGluZ3MnKVxuICAgIHRoaXMuY29udHJvbHMuYXBwZW5kQ2hpbGQodGhpcy5vcGVuUXVpY2tTZXR0aW5ncylcblxuICAgIHRoaXMub3BlblF1aWNrU2V0dGluZ1N1YnNjcmlwdGlvbiA9IHRoaXMuc3Vic2NyaWJlVG8odGhpcy5vcGVuUXVpY2tTZXR0aW5ncywge1xuICAgICAgJ21vdXNlZG93bic6IChlKSA9PiB7XG4gICAgICAgIGlmICghTWluaW1hcFF1aWNrU2V0dGluZ3NFbGVtZW50KSB7XG4gICAgICAgICAgTWluaW1hcFF1aWNrU2V0dGluZ3NFbGVtZW50ID0gcmVxdWlyZSgnLi9taW5pbWFwLXF1aWNrLXNldHRpbmdzLWVsZW1lbnQnKVxuICAgICAgICB9XG5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgICBpZiAoKHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQgIT0gbnVsbCkpIHtcbiAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LmRlc3Ryb3koKVxuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc1N1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50ID0gbmV3IE1pbmltYXBRdWlja1NldHRpbmdzRWxlbWVudCgpXG4gICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzRWxlbWVudC5zZXRNb2RlbCh0aGlzKVxuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc1N1YnNjcmlwdGlvbiA9IHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQgPSBudWxsXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGxldCB7dG9wLCBsZWZ0LCByaWdodH0gPSB0aGlzLmdldEZyb250Q2FudmFzKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LnN0eWxlLnRvcCA9IHRvcCArICdweCdcbiAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LmF0dGFjaCgpXG5cbiAgICAgICAgICBpZiAodGhpcy5kaXNwbGF5TWluaW1hcE9uTGVmdCkge1xuICAgICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzRWxlbWVudC5zdHlsZS5sZWZ0ID0gKHJpZ2h0KSArICdweCdcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzRWxlbWVudC5zdHlsZS5sZWZ0ID0gKGxlZnQgLSB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LmNsaWVudFdpZHRoKSArICdweCdcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2VzIHRoZSBxdWljayBzZXR0aW5ncyBvcGVuZW5lciBkaXYgd2hlbiB0aGUgYGRpc3BsYXlQbHVnaW5zQ29udHJvbHNgXG4gICAqIHNldHRpbmcgaXMgZGlzYWJsZWQuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZGlzcG9zZU9wZW5RdWlja1NldHRpbmdzICgpIHtcbiAgICBpZiAoIXRoaXMub3BlblF1aWNrU2V0dGluZ3MpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuY29udHJvbHMucmVtb3ZlQ2hpbGQodGhpcy5vcGVuUXVpY2tTZXR0aW5ncylcbiAgICB0aGlzLm9wZW5RdWlja1NldHRpbmdTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgZGVsZXRlIHRoaXMub3BlblF1aWNrU2V0dGluZ3NcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB0YXJnZXQgYFRleHRFZGl0b3JgIG9mIHRoZSBNaW5pbWFwLlxuICAgKlxuICAgKiBAcmV0dXJuIHtUZXh0RWRpdG9yfSB0aGUgbWluaW1hcCdzIHRleHQgZWRpdG9yXG4gICAqL1xuICBnZXRUZXh0RWRpdG9yICgpIHsgcmV0dXJuIHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yKCkgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBgVGV4dEVkaXRvckVsZW1lbnRgIGZvciB0aGUgTWluaW1hcCdzIGBUZXh0RWRpdG9yYC5cbiAgICpcbiAgICogQHJldHVybiB7VGV4dEVkaXRvckVsZW1lbnR9IHRoZSBtaW5pbWFwJ3MgdGV4dCBlZGl0b3IgZWxlbWVudFxuICAgKi9cbiAgZ2V0VGV4dEVkaXRvckVsZW1lbnQgKCkge1xuICAgIGlmICh0aGlzLmVkaXRvckVsZW1lbnQpIHsgcmV0dXJuIHRoaXMuZWRpdG9yRWxlbWVudCB9XG5cbiAgICB0aGlzLmVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5nZXRUZXh0RWRpdG9yKCkpXG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yRWxlbWVudFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJvb3Qgb2YgdGhlIGBUZXh0RWRpdG9yRWxlbWVudGAgY29udGVudC5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgaXMgbW9zdGx5IHVzZWQgdG8gZW5zdXJlIGNvbXBhdGliaWxpdHkgd2l0aCB0aGUgYHNoYWRvd0RvbWBcbiAgICogc2V0dGluZy5cbiAgICpcbiAgICogQHJldHVybiB7SFRNTEVsZW1lbnR9IHRoZSByb290IG9mIHRoZSBgVGV4dEVkaXRvckVsZW1lbnRgIGNvbnRlbnRcbiAgICovXG4gIGdldFRleHRFZGl0b3JFbGVtZW50Um9vdCAoKSB7XG4gICAgbGV0IGVkaXRvckVsZW1lbnQgPSB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50KClcblxuICAgIGlmIChlZGl0b3JFbGVtZW50LnNoYWRvd1Jvb3QpIHtcbiAgICAgIHJldHVybiBlZGl0b3JFbGVtZW50LnNoYWRvd1Jvb3RcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGVkaXRvckVsZW1lbnRcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcm9vdCB3aGVyZSB0byBpbmplY3QgdGhlIGR1bW15IG5vZGUgdXNlZCB0byByZWFkIERPTSBzdHlsZXMuXG4gICAqXG4gICAqIEBwYXJhbSAge2Jvb2xlYW59IHNoYWRvd1Jvb3Qgd2hldGhlciB0byB1c2UgdGhlIHRleHQgZWRpdG9yIHNoYWRvdyBET01cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvciBub3RcbiAgICogQHJldHVybiB7SFRNTEVsZW1lbnR9IHRoZSByb290IG5vZGUgd2hlcmUgYXBwZW5kaW5nIHRoZSBkdW1teSBub2RlXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZ2V0RHVtbXlET01Sb290IChzaGFkb3dSb290KSB7XG4gICAgaWYgKHNoYWRvd1Jvb3QpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50Um9vdCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50KClcbiAgICB9XG4gIH1cblxuICAvLyAgICAjIyAgICAgIyMgICMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMjIyAjI1xuICAvLyAgICAjIyMgICAjIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgICAjI1xuICAvLyAgICAjIyMjICMjIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgICAjI1xuICAvLyAgICAjIyAjIyMgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyMjIyMgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMjIyAjIyMjIyMjI1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBNaW5pbWFwIGZvciB3aGljaCB0aGlzIE1pbmltYXBFbGVtZW50IHdhcyBjcmVhdGVkLlxuICAgKlxuICAgKiBAcmV0dXJuIHtNaW5pbWFwfSB0aGlzIGVsZW1lbnQncyBNaW5pbWFwXG4gICAqL1xuICBnZXRNb2RlbCAoKSB7IHJldHVybiB0aGlzLm1pbmltYXAgfVxuXG4gIC8qKlxuICAgKiBEZWZpbmVzIHRoZSBNaW5pbWFwIG1vZGVsIGZvciB0aGlzIE1pbmltYXBFbGVtZW50IGluc3RhbmNlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtNaW5pbWFwfSBtaW5pbWFwIHRoZSBNaW5pbWFwIG1vZGVsIGZvciB0aGlzIGluc3RhbmNlLlxuICAgKiBAcmV0dXJuIHtNaW5pbWFwfSB0aGlzIGVsZW1lbnQncyBNaW5pbWFwXG4gICAqL1xuICBzZXRNb2RlbCAobWluaW1hcCkge1xuICAgIGlmICghTWFpbikgeyBNYWluID0gcmVxdWlyZSgnLi9tYWluJykgfVxuXG4gICAgdGhpcy5taW5pbWFwID0gbWluaW1hcFxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5taW5pbWFwLm9uRGlkQ2hhbmdlU2Nyb2xsVG9wKCgpID0+IHtcbiAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1pbmltYXAub25EaWRDaGFuZ2VTY3JvbGxMZWZ0KCgpID0+IHtcbiAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1pbmltYXAub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgIHRoaXMuZGVzdHJveSgpXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1pbmltYXAub25EaWRDaGFuZ2VDb25maWcoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgcmV0dXJuIHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpIH1cbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5taW5pbWFwLm9uRGlkQ2hhbmdlU3RhbmRBbG9uZSgoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YW5kQWxvbmUodGhpcy5taW5pbWFwLmlzU3RhbmRBbG9uZSgpKVxuICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5taW5pbWFwLm9uRGlkQ2hhbmdlKChjaGFuZ2UpID0+IHtcbiAgICAgIHRoaXMucGVuZGluZ0NoYW5nZXMucHVzaChjaGFuZ2UpXG4gICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1pbmltYXAub25EaWRDaGFuZ2VEZWNvcmF0aW9uUmFuZ2UoKGNoYW5nZSkgPT4ge1xuICAgICAgY29uc3Qge3R5cGV9ID0gY2hhbmdlXG4gICAgICBpZiAodHlwZSA9PT0gJ2xpbmUnIHx8IHR5cGUgPT09ICdoaWdobGlnaHQtdW5kZXInIHx8IHR5cGUgPT09ICdiYWNrZ3JvdW5kLWN1c3RvbScpIHtcbiAgICAgICAgdGhpcy5wZW5kaW5nQmFja0RlY29yYXRpb25DaGFuZ2VzLnB1c2goY2hhbmdlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wZW5kaW5nRnJvbnREZWNvcmF0aW9uQ2hhbmdlcy5wdXNoKGNoYW5nZSlcbiAgICAgIH1cbiAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKE1haW4ub25EaWRDaGFuZ2VQbHVnaW5PcmRlcigoKSA9PiB7XG4gICAgICB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zZXRTdGFuZEFsb25lKHRoaXMubWluaW1hcC5pc1N0YW5kQWxvbmUoKSlcblxuICAgIGlmICh0aGlzLndpZHRoICE9IG51bGwgJiYgdGhpcy5oZWlnaHQgIT0gbnVsbCkge1xuICAgICAgdGhpcy5taW5pbWFwLnNldFNjcmVlbkhlaWdodEFuZFdpZHRoKHRoaXMuaGVpZ2h0LCB0aGlzLndpZHRoKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm1pbmltYXBcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBzdGFuZC1hbG9uZSBtb2RlIGZvciB0aGlzIE1pbmltYXBFbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHN0YW5kQWxvbmUgdGhlIG5ldyBtb2RlIGZvciB0aGlzIE1pbmltYXBFbGVtZW50XG4gICAqL1xuICBzZXRTdGFuZEFsb25lIChzdGFuZEFsb25lKSB7XG4gICAgdGhpcy5zdGFuZEFsb25lID0gc3RhbmRBbG9uZVxuXG4gICAgaWYgKHRoaXMuc3RhbmRBbG9uZSkge1xuICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ3N0YW5kLWFsb25lJywgdHJ1ZSlcbiAgICAgIHRoaXMuZGlzcG9zZVNjcm9sbEluZGljYXRvcigpXG4gICAgICB0aGlzLmRpc3Bvc2VPcGVuUXVpY2tTZXR0aW5ncygpXG4gICAgICB0aGlzLnJlbW92ZUNvbnRyb2xzKClcbiAgICAgIHRoaXMucmVtb3ZlVmlzaWJsZUFyZWEoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnc3RhbmQtYWxvbmUnKVxuICAgICAgdGhpcy5jcmVhdGVWaXNpYmxlQXJlYSgpXG4gICAgICB0aGlzLmNyZWF0ZUNvbnRyb2xzKClcbiAgICAgIGlmICh0aGlzLm1pbmltYXBTY3JvbGxJbmRpY2F0b3IpIHsgdGhpcy5pbml0aWFsaXplU2Nyb2xsSW5kaWNhdG9yKCkgfVxuICAgICAgaWYgKHRoaXMuZGlzcGxheVBsdWdpbnNDb250cm9scykgeyB0aGlzLmluaXRpYWxpemVPcGVuUXVpY2tTZXR0aW5ncygpIH1cbiAgICB9XG4gIH1cblxuICAvLyAgICAjIyAgICAgIyMgIyMjIyMjIyMgICMjIyMjIyMjICAgICAjIyMgICAgIyMjIyMjIyMgIyMjIyMjIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgIyMgICAjIyAjIyAgICAgICMjICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICAjIyAgICMjICAgICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMjIyMjIyMgICMjICAgICAjIyAjIyAgICAgIyMgICAgIyMgICAgIyMjIyMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgICAgIyMgICAgICMjICMjIyMjIyMjIyAgICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgICMjICAgICAjIyAjIyAgICAgIyMgICAgIyMgICAgIyNcbiAgLy8gICAgICMjIyMjIyMgICMjICAgICAgICAjIyMjIyMjIyAgIyMgICAgICMjICAgICMjICAgICMjIyMjIyMjXG5cbiAgLyoqXG4gICAqIFJlcXVlc3RzIGFuIHVwZGF0ZSB0byBiZSBwZXJmb3JtZWQgb24gdGhlIG5leHQgZnJhbWUuXG4gICAqL1xuICByZXF1ZXN0VXBkYXRlICgpIHtcbiAgICBpZiAodGhpcy5mcmFtZVJlcXVlc3RlZCkgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5mcmFtZVJlcXVlc3RlZCA9IHRydWVcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGUoKVxuICAgICAgdGhpcy5mcmFtZVJlcXVlc3RlZCA9IGZhbHNlXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXF1ZXN0cyBhbiB1cGRhdGUgdG8gYmUgcGVyZm9ybWVkIG9uIHRoZSBuZXh0IGZyYW1lIHRoYXQgd2lsbCBjb21wbGV0ZWx5XG4gICAqIHJlZHJhdyB0aGUgbWluaW1hcC5cbiAgICovXG4gIHJlcXVlc3RGb3JjZWRVcGRhdGUgKCkge1xuICAgIHRoaXMub2Zmc2NyZWVuRmlyc3RSb3cgPSBudWxsXG4gICAgdGhpcy5vZmZzY3JlZW5MYXN0Um93ID0gbnVsbFxuICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpXG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgdGhlIGFjdHVhbCBNaW5pbWFwRWxlbWVudCB1cGRhdGUuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgdXBkYXRlICgpIHtcbiAgICBpZiAoISh0aGlzLmF0dGFjaGVkICYmIHRoaXMuaXNWaXNpYmxlKCkgJiYgdGhpcy5taW5pbWFwKSkgeyByZXR1cm4gfVxuICAgIGNvbnN0IG1pbmltYXAgPSB0aGlzLm1pbmltYXBcbiAgICBtaW5pbWFwLmVuYWJsZUNhY2hlKClcbiAgICBjb25zdCBjYW52YXMgPSB0aGlzLmdldEZyb250Q2FudmFzKClcblxuICAgIGNvbnN0IGRldmljZVBpeGVsUmF0aW8gPSB0aGlzLm1pbmltYXAuZ2V0RGV2aWNlUGl4ZWxSYXRpbygpXG4gICAgY29uc3QgdmlzaWJsZUFyZWFMZWZ0ID0gbWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkU2Nyb2xsTGVmdCgpXG4gICAgY29uc3QgdmlzaWJsZUFyZWFUb3AgPSBtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRTY3JvbGxUb3AoKSAtIG1pbmltYXAuZ2V0U2Nyb2xsVG9wKClcbiAgICBjb25zdCB2aXNpYmxlV2lkdGggPSBNYXRoLm1pbihjYW52YXMud2lkdGggLyBkZXZpY2VQaXhlbFJhdGlvLCB0aGlzLndpZHRoKVxuXG4gICAgaWYgKHRoaXMuYWRqdXN0VG9Tb2Z0V3JhcCAmJiB0aGlzLmZsZXhCYXNpcykge1xuICAgICAgdGhpcy5zdHlsZS5mbGV4QmFzaXMgPSB0aGlzLmZsZXhCYXNpcyArICdweCdcbiAgICAgIHRoaXMuc3R5bGUud2lkdGggPSB0aGlzLmZsZXhCYXNpcyArICdweCdcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdHlsZS5mbGV4QmFzaXMgPSBudWxsXG4gICAgICB0aGlzLnN0eWxlLndpZHRoID0gbnVsbFxuICAgIH1cblxuICAgIGlmIChTUEVDX01PREUpIHtcbiAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy52aXNpYmxlQXJlYSwge1xuICAgICAgICB3aWR0aDogdmlzaWJsZVdpZHRoICsgJ3B4JyxcbiAgICAgICAgaGVpZ2h0OiBtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRIZWlnaHQoKSArICdweCcsXG4gICAgICAgIHRvcDogdmlzaWJsZUFyZWFUb3AgKyAncHgnLFxuICAgICAgICAnYm9yZGVyLWxlZnQtd2lkdGgnOiB2aXNpYmxlQXJlYUxlZnQgKyAncHgnXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMudmlzaWJsZUFyZWEsIHtcbiAgICAgICAgd2lkdGg6IHZpc2libGVXaWR0aCArICdweCcsXG4gICAgICAgIGhlaWdodDogbWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkSGVpZ2h0KCkgKyAncHgnLFxuICAgICAgICB0cmFuc2Zvcm06IHRoaXMubWFrZVRyYW5zbGF0ZSgwLCB2aXNpYmxlQXJlYVRvcCksXG4gICAgICAgICdib3JkZXItbGVmdC13aWR0aCc6IHZpc2libGVBcmVhTGVmdCArICdweCdcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLmNvbnRyb2xzLCB7d2lkdGg6IHZpc2libGVXaWR0aCArICdweCd9KVxuXG4gICAgbGV0IGNhbnZhc1RvcCA9IG1pbmltYXAuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KCkgKiBtaW5pbWFwLmdldExpbmVIZWlnaHQoKSAtIG1pbmltYXAuZ2V0U2Nyb2xsVG9wKClcblxuICAgIGlmICh0aGlzLnNtb290aFNjcm9sbGluZykge1xuICAgICAgaWYgKFNQRUNfTU9ERSkge1xuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuYmFja0xheWVyLmNhbnZhcywge3RvcDogY2FudmFzVG9wICsgJ3B4J30pXG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy50b2tlbnNMYXllci5jYW52YXMsIHt0b3A6IGNhbnZhc1RvcCArICdweCd9KVxuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuZnJvbnRMYXllci5jYW52YXMsIHt0b3A6IGNhbnZhc1RvcCArICdweCd9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGNhbnZhc1RyYW5zZm9ybSA9IHRoaXMubWFrZVRyYW5zbGF0ZSgwLCBjYW52YXNUb3ApXG4gICAgICAgIGlmIChkZXZpY2VQaXhlbFJhdGlvICE9PSAxKSB7XG4gICAgICAgICAgY2FudmFzVHJhbnNmb3JtICs9ICcgJyArIHRoaXMubWFrZVNjYWxlKDEgLyBkZXZpY2VQaXhlbFJhdGlvKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy5iYWNrTGF5ZXIuY2FudmFzLCB7dHJhbnNmb3JtOiBjYW52YXNUcmFuc2Zvcm19KVxuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMudG9rZW5zTGF5ZXIuY2FudmFzLCB7dHJhbnNmb3JtOiBjYW52YXNUcmFuc2Zvcm19KVxuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuZnJvbnRMYXllci5jYW52YXMsIHt0cmFuc2Zvcm06IGNhbnZhc1RyYW5zZm9ybX0pXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGNhbnZhc1RyYW5zZm9ybSA9IHRoaXMubWFrZVNjYWxlKDEgLyBkZXZpY2VQaXhlbFJhdGlvKVxuICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLmJhY2tMYXllci5jYW52YXMsIHt0cmFuc2Zvcm06IGNhbnZhc1RyYW5zZm9ybX0pXG4gICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMudG9rZW5zTGF5ZXIuY2FudmFzLCB7dHJhbnNmb3JtOiBjYW52YXNUcmFuc2Zvcm19KVxuICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLmZyb250TGF5ZXIuY2FudmFzLCB7dHJhbnNmb3JtOiBjYW52YXNUcmFuc2Zvcm19KVxuICAgIH1cblxuICAgIGlmICh0aGlzLm1pbmltYXBTY3JvbGxJbmRpY2F0b3IgJiYgbWluaW1hcC5jYW5TY3JvbGwoKSAmJiAhdGhpcy5zY3JvbGxJbmRpY2F0b3IpIHtcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZVNjcm9sbEluZGljYXRvcigpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2Nyb2xsSW5kaWNhdG9yICE9IG51bGwpIHtcbiAgICAgIGxldCBtaW5pbWFwU2NyZWVuSGVpZ2h0ID0gbWluaW1hcC5nZXRTY3JlZW5IZWlnaHQoKVxuICAgICAgbGV0IGluZGljYXRvckhlaWdodCA9IG1pbmltYXBTY3JlZW5IZWlnaHQgKiAobWluaW1hcFNjcmVlbkhlaWdodCAvIG1pbmltYXAuZ2V0SGVpZ2h0KCkpXG4gICAgICBsZXQgaW5kaWNhdG9yU2Nyb2xsID0gKG1pbmltYXBTY3JlZW5IZWlnaHQgLSBpbmRpY2F0b3JIZWlnaHQpICogbWluaW1hcC5nZXRTY3JvbGxSYXRpbygpXG5cbiAgICAgIGlmIChTUEVDX01PREUpIHtcbiAgICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLnNjcm9sbEluZGljYXRvciwge1xuICAgICAgICAgIGhlaWdodDogaW5kaWNhdG9ySGVpZ2h0ICsgJ3B4JyxcbiAgICAgICAgICB0b3A6IGluZGljYXRvclNjcm9sbCArICdweCdcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy5zY3JvbGxJbmRpY2F0b3IsIHtcbiAgICAgICAgICBoZWlnaHQ6IGluZGljYXRvckhlaWdodCArICdweCcsXG4gICAgICAgICAgdHJhbnNmb3JtOiB0aGlzLm1ha2VUcmFuc2xhdGUoMCwgaW5kaWNhdG9yU2Nyb2xsKVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBpZiAoIW1pbmltYXAuY2FuU2Nyb2xsKCkpIHsgdGhpcy5kaXNwb3NlU2Nyb2xsSW5kaWNhdG9yKCkgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmFic29sdXRlTW9kZSAmJiB0aGlzLmFkanVzdEFic29sdXRlTW9kZUhlaWdodCkgeyB0aGlzLnVwZGF0ZUNhbnZhc2VzU2l6ZSgpIH1cblxuICAgIHRoaXMudXBkYXRlQ2FudmFzKClcbiAgICBtaW5pbWFwLmNsZWFyQ2FjaGUoKVxuICB9XG5cbiAgLyoqXG4gICAqIERlZmluZXMgd2hldGhlciB0byByZW5kZXIgdGhlIGNvZGUgaGlnaGxpZ2h0cyBvciBub3QuXG4gICAqXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gZGlzcGxheUNvZGVIaWdobGlnaHRzIHdoZXRoZXIgdG8gcmVuZGVyIHRoZSBjb2RlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodHMgb3Igbm90XG4gICAqL1xuICBzZXREaXNwbGF5Q29kZUhpZ2hsaWdodHMgKGRpc3BsYXlDb2RlSGlnaGxpZ2h0cykge1xuICAgIHRoaXMuZGlzcGxheUNvZGVIaWdobGlnaHRzID0gZGlzcGxheUNvZGVIaWdobGlnaHRzXG4gICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKCkgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBvbGxpbmcgY2FsbGJhY2sgdXNlZCB0byBkZXRlY3QgdmlzaWJpbGl0eSBhbmQgc2l6ZSBjaGFuZ2VzLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHBvbGxET00gKCkge1xuICAgIGxldCB2aXNpYmlsaXR5Q2hhbmdlZCA9IHRoaXMuY2hlY2tGb3JWaXNpYmlsaXR5Q2hhbmdlKClcbiAgICBpZiAodGhpcy5pc1Zpc2libGUoKSkge1xuICAgICAgaWYgKCF0aGlzLndhc1Zpc2libGUpIHsgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKCkgfVxuXG4gICAgICB0aGlzLm1lYXN1cmVIZWlnaHRBbmRXaWR0aCh2aXNpYmlsaXR5Q2hhbmdlZCwgZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRoYXQgY2hlY2tzIGZvciB2aXNpYmlsaXR5IGNoYW5nZXMgaW4gdGhlIE1pbmltYXBFbGVtZW50LlxuICAgKiBUaGUgbWV0aG9kIHJldHVybnMgYHRydWVgIHdoZW4gdGhlIHZpc2liaWxpdHkgY2hhbmdlZCBmcm9tIHZpc2libGUgdG9cbiAgICogaGlkZGVuIG9yIGZyb20gaGlkZGVuIHRvIHZpc2libGUuXG4gICAqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IHdoZXRoZXIgdGhlIHZpc2liaWxpdHkgY2hhbmdlZCBvciBub3Qgc2luY2UgdGhlIGxhc3QgY2FsbFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGNoZWNrRm9yVmlzaWJpbGl0eUNoYW5nZSAoKSB7XG4gICAgaWYgKHRoaXMuaXNWaXNpYmxlKCkpIHtcbiAgICAgIGlmICh0aGlzLndhc1Zpc2libGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLndhc1Zpc2libGUgPSB0cnVlXG4gICAgICAgIHJldHVybiB0aGlzLndhc1Zpc2libGVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMud2FzVmlzaWJsZSkge1xuICAgICAgICB0aGlzLndhc1Zpc2libGUgPSBmYWxzZVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy53YXNWaXNpYmxlID0gZmFsc2VcbiAgICAgICAgcmV0dXJuIHRoaXMud2FzVmlzaWJsZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB1c2VkIHRvIG1lYXN1cmUgdGhlIHNpemUgb2YgdGhlIE1pbmltYXBFbGVtZW50IGFuZCB1cGRhdGUgaW50ZXJuYWxcbiAgICogY29tcG9uZW50cyBiYXNlZCBvbiB0aGUgbmV3IHNpemUuXG4gICAqXG4gICAqIEBwYXJhbSAge2Jvb2xlYW59IHZpc2liaWxpdHlDaGFuZ2VkIGRpZCB0aGUgdmlzaWJpbGl0eSBjaGFuZ2VkIHNpbmNlIGxhc3RcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVhc3VyZW1lbnRcbiAgICogQHBhcmFtICB7W3R5cGVdfSBbZm9yY2VVcGRhdGU9dHJ1ZV0gZm9yY2VzIHRoZSB1cGRhdGUgZXZlbiB3aGVuIG5vIGNoYW5nZXNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2VyZSBkZXRlY3RlZFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIG1lYXN1cmVIZWlnaHRBbmRXaWR0aCAodmlzaWJpbGl0eUNoYW5nZWQsIGZvcmNlVXBkYXRlID0gdHJ1ZSkge1xuICAgIGlmICghdGhpcy5taW5pbWFwKSB7IHJldHVybiB9XG5cbiAgICBjb25zdCBzYWZlRmxleEJhc2lzID0gdGhpcy5zdHlsZS5mbGV4QmFzaXNcbiAgICB0aGlzLnN0eWxlLmZsZXhCYXNpcyA9ICcnXG5cbiAgICBsZXQgd2FzUmVzaXplZCA9IHRoaXMud2lkdGggIT09IHRoaXMuY2xpZW50V2lkdGggfHwgdGhpcy5oZWlnaHQgIT09IHRoaXMuY2xpZW50SGVpZ2h0XG5cbiAgICB0aGlzLmhlaWdodCA9IHRoaXMuY2xpZW50SGVpZ2h0XG4gICAgdGhpcy53aWR0aCA9IHRoaXMuY2xpZW50V2lkdGhcbiAgICBsZXQgY2FudmFzV2lkdGggPSB0aGlzLndpZHRoXG5cbiAgICBpZiAoKHRoaXMubWluaW1hcCAhPSBudWxsKSkge1xuICAgICAgdGhpcy5taW5pbWFwLnNldFNjcmVlbkhlaWdodEFuZFdpZHRoKHRoaXMuaGVpZ2h0LCB0aGlzLndpZHRoKVxuICAgIH1cblxuICAgIGlmICh3YXNSZXNpemVkIHx8IHZpc2liaWxpdHlDaGFuZ2VkIHx8IGZvcmNlVXBkYXRlKSB7XG4gICAgICB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKVxuICAgIH1cblxuICAgIGlmICghdGhpcy5pc1Zpc2libGUoKSkgeyByZXR1cm4gfVxuXG4gICAgaWYgKHdhc1Jlc2l6ZWQgfHwgZm9yY2VVcGRhdGUpIHtcbiAgICAgIGlmICh0aGlzLmFkanVzdFRvU29mdFdyYXApIHtcbiAgICAgICAgbGV0IGxpbmVMZW5ndGggPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5wcmVmZXJyZWRMaW5lTGVuZ3RoJylcbiAgICAgICAgbGV0IHNvZnRXcmFwID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iuc29mdFdyYXAnKVxuICAgICAgICBsZXQgc29mdFdyYXBBdFByZWZlcnJlZExpbmVMZW5ndGggPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zb2Z0V3JhcEF0UHJlZmVycmVkTGluZUxlbmd0aCcpXG4gICAgICAgIGxldCB3aWR0aCA9IGxpbmVMZW5ndGggKiB0aGlzLm1pbmltYXAuZ2V0Q2hhcldpZHRoKClcblxuICAgICAgICBpZiAoc29mdFdyYXAgJiYgc29mdFdyYXBBdFByZWZlcnJlZExpbmVMZW5ndGggJiYgbGluZUxlbmd0aCAmJiAod2lkdGggPD0gdGhpcy53aWR0aCB8fCAhdGhpcy5hZGp1c3RPbmx5SWZTbWFsbGVyKSkge1xuICAgICAgICAgIHRoaXMuZmxleEJhc2lzID0gd2lkdGhcbiAgICAgICAgICBjYW52YXNXaWR0aCA9IHdpZHRoXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuZmxleEJhc2lzXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmZsZXhCYXNpc1xuICAgICAgfVxuXG4gICAgICB0aGlzLnVwZGF0ZUNhbnZhc2VzU2l6ZShjYW52YXNXaWR0aClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdHlsZS5mbGV4QmFzaXMgPSBzYWZlRmxleEJhc2lzXG4gICAgfVxuICB9XG5cbiAgdXBkYXRlQ2FudmFzZXNTaXplIChjYW52YXNXaWR0aCA9IHRoaXMuZ2V0RnJvbnRDYW52YXMoKS53aWR0aCkge1xuICAgIGNvbnN0IGRldmljZVBpeGVsUmF0aW8gPSB0aGlzLm1pbmltYXAuZ2V0RGV2aWNlUGl4ZWxSYXRpbygpXG4gICAgY29uc3QgbWF4Q2FudmFzSGVpZ2h0ID0gdGhpcy5oZWlnaHQgKyB0aGlzLm1pbmltYXAuZ2V0TGluZUhlaWdodCgpXG4gICAgY29uc3QgbmV3SGVpZ2h0ID0gdGhpcy5hYnNvbHV0ZU1vZGUgJiYgdGhpcy5hZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQgPyBNYXRoLm1pbih0aGlzLm1pbmltYXAuZ2V0SGVpZ2h0KCksIG1heENhbnZhc0hlaWdodCkgOiBtYXhDYW52YXNIZWlnaHRcbiAgICBjb25zdCBjYW52YXMgPSB0aGlzLmdldEZyb250Q2FudmFzKClcbiAgICBpZiAoY2FudmFzV2lkdGggIT09IGNhbnZhcy53aWR0aCB8fCBuZXdIZWlnaHQgIT09IGNhbnZhcy5oZWlnaHQpIHtcbiAgICAgIHRoaXMuc2V0Q2FudmFzZXNTaXplKFxuICAgICAgICBjYW52YXNXaWR0aCAqIGRldmljZVBpeGVsUmF0aW8sXG4gICAgICAgIG5ld0hlaWdodCAqIGRldmljZVBpeGVsUmF0aW9cbiAgICAgIClcbiAgICAgIGlmICh0aGlzLmFic29sdXRlTW9kZSAmJiB0aGlzLmFkanVzdEFic29sdXRlTW9kZUhlaWdodCkge1xuICAgICAgICB0aGlzLm9mZnNjcmVlbkZpcnN0Um93ID0gbnVsbFxuICAgICAgICB0aGlzLm9mZnNjcmVlbkxhc3RSb3cgPSBudWxsXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gICAgIyMjIyMjIyMgIyMgICAgICMjICMjIyMjIyMjICMjICAgICMjICMjIyMjIyMjICAjIyMjIyNcbiAgLy8gICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICAgICMjIyAgICMjICAgICMjICAgICMjICAgICMjXG4gIC8vICAgICMjICAgICAgICMjICAgICAjIyAjIyAgICAgICAjIyMjICAjIyAgICAjIyAgICAjI1xuICAvLyAgICAjIyMjIyMgICAjIyAgICAgIyMgIyMjIyMjICAgIyMgIyMgIyMgICAgIyMgICAgICMjIyMjI1xuICAvLyAgICAjIyAgICAgICAgIyMgICAjIyAgIyMgICAgICAgIyMgICMjIyMgICAgIyMgICAgICAgICAgIyNcbiAgLy8gICAgIyMgICAgICAgICAjIyAjIyAgICMjICAgICAgICMjICAgIyMjICAgICMjICAgICMjICAgICMjXG4gIC8vICAgICMjIyMjIyMjICAgICMjIyAgICAjIyMjIyMjIyAjIyAgICAjIyAgICAjIyAgICAgIyMjIyMjXG5cbiAgLyoqXG4gICAqIEhlbHBlciBtZXRob2QgdG8gcmVnaXN0ZXIgY29uZmlnIG9ic2VydmVycy5cbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSBjb25maWdzPXt9IGFuIG9iamVjdCBtYXBwaW5nIHRoZSBjb25maWcgbmFtZSB0byBvYnNlcnZlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aXRoIHRoZSBmdW5jdGlvbiB0byBjYWxsIGJhY2sgd2hlbiBhIGNoYW5nZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2NjdXJzXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgb2JzZXJ2ZUNvbmZpZyAoY29uZmlncyA9IHt9KSB7XG4gICAgZm9yIChsZXQgY29uZmlnIGluIGNvbmZpZ3MpIHtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZShjb25maWcsIGNvbmZpZ3NbY29uZmlnXSkpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRyaWdnZXJlZCB3aGVuIHRoZSBtb3VzZSBpcyBwcmVzc2VkIG9uIHRoZSBNaW5pbWFwRWxlbWVudCBjYW52YXMuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0geSB0aGUgdmVydGljYWwgY29vcmRpbmF0ZSBvZiB0aGUgZXZlbnRcbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gaXNMZWZ0TW91c2Ugd2FzIHRoZSBsZWZ0IG1vdXNlIGJ1dHRvbiBwcmVzc2VkP1xuICAgKiBAcGFyYW0gIHtib29sZWFufSBpc01pZGRsZU1vdXNlIHdhcyB0aGUgbWlkZGxlIG1vdXNlIGJ1dHRvbiBwcmVzc2VkP1xuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGNhbnZhc1ByZXNzZWQgKHt5LCBpc0xlZnRNb3VzZSwgaXNNaWRkbGVNb3VzZX0pIHtcbiAgICBpZiAodGhpcy5taW5pbWFwLmlzU3RhbmRBbG9uZSgpKSB7IHJldHVybiB9XG4gICAgaWYgKGlzTGVmdE1vdXNlKSB7XG4gICAgICB0aGlzLmNhbnZhc0xlZnRNb3VzZVByZXNzZWQoeSlcbiAgICB9IGVsc2UgaWYgKGlzTWlkZGxlTW91c2UpIHtcbiAgICAgIHRoaXMuY2FudmFzTWlkZGxlTW91c2VQcmVzc2VkKHkpXG4gICAgICBsZXQge3RvcCwgaGVpZ2h0fSA9IHRoaXMudmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIHRoaXMuc3RhcnREcmFnKHt5OiB0b3AgKyBoZWlnaHQgLyAyLCBpc0xlZnRNb3VzZTogZmFsc2UsIGlzTWlkZGxlTW91c2U6IHRydWV9KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayB0cmlnZ2VyZWQgd2hlbiB0aGUgbW91c2UgbGVmdCBidXR0b24gaXMgcHJlc3NlZCBvbiB0aGVcbiAgICogTWluaW1hcEVsZW1lbnQgY2FudmFzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtNb3VzZUV2ZW50fSBlIHRoZSBtb3VzZSBldmVudCBvYmplY3RcbiAgICogQHBhcmFtICB7bnVtYmVyfSBlLnBhZ2VZIHRoZSBtb3VzZSB5IHBvc2l0aW9uIGluIHBhZ2VcbiAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGUudGFyZ2V0IHRoZSBzb3VyY2Ugb2YgdGhlIGV2ZW50XG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgY2FudmFzTGVmdE1vdXNlUHJlc3NlZCAoeSkge1xuICAgIGNvbnN0IGRlbHRhWSA9IHkgLSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcFxuICAgIGNvbnN0IHJvdyA9IE1hdGguZmxvb3IoZGVsdGFZIC8gdGhpcy5taW5pbWFwLmdldExpbmVIZWlnaHQoKSkgKyB0aGlzLm1pbmltYXAuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcblxuICAgIGNvbnN0IHRleHRFZGl0b3IgPSB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvcigpXG4gICAgY29uc3QgdGV4dEVkaXRvckVsZW1lbnQgPSB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50KClcblxuICAgIGNvbnN0IHNjcm9sbFRvcCA9IHJvdyAqIHRleHRFZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkgLSB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvckhlaWdodCgpIC8gMlxuICAgIGNvbnN0IHRleHRFZGl0b3JTY3JvbGxUb3AgPSB0ZXh0RWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oW3JvdywgMF0pLnRvcCAtIHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9ySGVpZ2h0KCkgLyAyXG5cbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLm1vdmVDdXJzb3JPbk1pbmltYXBDbGljaycpKSB7XG4gICAgICB0ZXh0RWRpdG9yLnNldEN1cnNvclNjcmVlblBvc2l0aW9uKFtyb3csIDBdKVxuICAgIH1cblxuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuc2Nyb2xsQW5pbWF0aW9uJykpIHtcbiAgICAgIGNvbnN0IGR1cmF0aW9uID0gYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLnNjcm9sbEFuaW1hdGlvbkR1cmF0aW9uJylcbiAgICAgIGNvbnN0IGluZGVwZW5kZW50U2Nyb2xsID0gdGhpcy5taW5pbWFwLnNjcm9sbEluZGVwZW5kZW50bHlPbk1vdXNlV2hlZWwoKVxuXG4gICAgICBsZXQgZnJvbSA9IHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yU2Nyb2xsVG9wKClcbiAgICAgIGxldCB0byA9IHRleHRFZGl0b3JTY3JvbGxUb3BcbiAgICAgIGxldCBzdGVwXG5cbiAgICAgIGlmIChpbmRlcGVuZGVudFNjcm9sbCkge1xuICAgICAgICBjb25zdCBtaW5pbWFwRnJvbSA9IHRoaXMubWluaW1hcC5nZXRTY3JvbGxUb3AoKVxuICAgICAgICBjb25zdCBtaW5pbWFwVG8gPSBNYXRoLm1pbigxLCBzY3JvbGxUb3AgLyAodGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3JNYXhTY3JvbGxUb3AoKSB8fCAxKSkgKiB0aGlzLm1pbmltYXAuZ2V0TWF4U2Nyb2xsVG9wKClcblxuICAgICAgICBzdGVwID0gKG5vdywgdCkgPT4ge1xuICAgICAgICAgIHRoaXMubWluaW1hcC5zZXRUZXh0RWRpdG9yU2Nyb2xsVG9wKG5vdywgdHJ1ZSlcbiAgICAgICAgICB0aGlzLm1pbmltYXAuc2V0U2Nyb2xsVG9wKG1pbmltYXBGcm9tICsgKG1pbmltYXBUbyAtIG1pbmltYXBGcm9tKSAqIHQpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hbmltYXRlKHtmcm9tOiBmcm9tLCB0bzogdG8sIGR1cmF0aW9uOiBkdXJhdGlvbiwgc3RlcDogc3RlcH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGVwID0gKG5vdykgPT4gdGhpcy5taW5pbWFwLnNldFRleHRFZGl0b3JTY3JvbGxUb3Aobm93KVxuICAgICAgICB0aGlzLmFuaW1hdGUoe2Zyb206IGZyb20sIHRvOiB0bywgZHVyYXRpb246IGR1cmF0aW9uLCBzdGVwOiBzdGVwfSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5taW5pbWFwLnNldFRleHRFZGl0b3JTY3JvbGxUb3AodGV4dEVkaXRvclNjcm9sbFRvcClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGJhY2sgdHJpZ2dlcmVkIHdoZW4gdGhlIG1vdXNlIG1pZGRsZSBidXR0b24gaXMgcHJlc3NlZCBvbiB0aGVcbiAgICogTWluaW1hcEVsZW1lbnQgY2FudmFzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtNb3VzZUV2ZW50fSBlIHRoZSBtb3VzZSBldmVudCBvYmplY3RcbiAgICogQHBhcmFtICB7bnVtYmVyfSBlLnBhZ2VZIHRoZSBtb3VzZSB5IHBvc2l0aW9uIGluIHBhZ2VcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjYW52YXNNaWRkbGVNb3VzZVByZXNzZWQgKHkpIHtcbiAgICBsZXQge3RvcDogb2Zmc2V0VG9wfSA9IHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBsZXQgZGVsdGFZID0geSAtIG9mZnNldFRvcCAtIHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkSGVpZ2h0KCkgLyAyXG5cbiAgICBsZXQgcmF0aW8gPSBkZWx0YVkgLyAodGhpcy5taW5pbWFwLmdldFZpc2libGVIZWlnaHQoKSAtIHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkSGVpZ2h0KCkpXG5cbiAgICB0aGlzLm1pbmltYXAuc2V0VGV4dEVkaXRvclNjcm9sbFRvcChyYXRpbyAqIHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yTWF4U2Nyb2xsVG9wKCkpXG4gIH1cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCByZWxheXMgdGhlIGBtb3VzZXdoZWVsYCBldmVudHMgcmVjZWl2ZWQgYnkgdGhlIE1pbmltYXBFbGVtZW50XG4gICAqIHRvIHRoZSBgVGV4dEVkaXRvckVsZW1lbnRgLlxuICAgKlxuICAgKiBAcGFyYW0gIHtNb3VzZUV2ZW50fSBlIHRoZSBtb3VzZSBldmVudCBvYmplY3RcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICByZWxheU1vdXNld2hlZWxFdmVudCAoZSkge1xuICAgIGlmICh0aGlzLm1pbmltYXAuc2Nyb2xsSW5kZXBlbmRlbnRseU9uTW91c2VXaGVlbCgpKSB7XG4gICAgICB0aGlzLm1pbmltYXAub25Nb3VzZVdoZWVsKGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnQoKS5jb21wb25lbnQub25Nb3VzZVdoZWVsKGUpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRoYXQgZXh0cmFjdHMgZGF0YSBmcm9tIGEgYE1vdXNlRXZlbnRgIHdoaWNoIGNhbiB0aGVuIGJlIHVzZWQgdG9cbiAgICogcHJvY2VzcyBjbGlja3MgYW5kIGRyYWdzIG9mIHRoZSBtaW5pbWFwLlxuICAgKlxuICAgKiBVc2VkIHRvZ2V0aGVyIHdpdGggYGV4dHJhY3RUb3VjaEV2ZW50RGF0YWAgdG8gcHJvdmlkZSBhIHVuaWZpZWQgaW50ZXJmYWNlXG4gICAqIGZvciBgTW91c2VFdmVudGBzIGFuZCBgVG91Y2hFdmVudGBzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtNb3VzZUV2ZW50fSBtb3VzZUV2ZW50IHRoZSBtb3VzZSBldmVudCBvYmplY3RcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBleHRyYWN0TW91c2VFdmVudERhdGEgKG1vdXNlRXZlbnQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgeDogbW91c2VFdmVudC5wYWdlWCxcbiAgICAgIHk6IG1vdXNlRXZlbnQucGFnZVksXG4gICAgICBpc0xlZnRNb3VzZTogbW91c2VFdmVudC53aGljaCA9PT0gMSxcbiAgICAgIGlzTWlkZGxlTW91c2U6IG1vdXNlRXZlbnQud2hpY2ggPT09IDJcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCBleHRyYWN0cyBkYXRhIGZyb20gYSBgVG91Y2hFdmVudGAgd2hpY2ggY2FuIHRoZW4gYmUgdXNlZCB0b1xuICAgKiBwcm9jZXNzIGNsaWNrcyBhbmQgZHJhZ3Mgb2YgdGhlIG1pbmltYXAuXG4gICAqXG4gICAqIFVzZWQgdG9nZXRoZXIgd2l0aCBgZXh0cmFjdE1vdXNlRXZlbnREYXRhYCB0byBwcm92aWRlIGEgdW5pZmllZCBpbnRlcmZhY2VcbiAgICogZm9yIGBNb3VzZUV2ZW50YHMgYW5kIGBUb3VjaEV2ZW50YHMuXG4gICAqXG4gICAqIEBwYXJhbSAge1RvdWNoRXZlbnR9IHRvdWNoRXZlbnQgdGhlIHRvdWNoIGV2ZW50IG9iamVjdFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGV4dHJhY3RUb3VjaEV2ZW50RGF0YSAodG91Y2hFdmVudCkge1xuICAgIC8vIFVzZSB0aGUgZmlyc3QgdG91Y2ggb24gdGhlIHRhcmdldCBhcmVhLiBPdGhlciB0b3VjaGVzIHdpbGwgYmUgaWdub3JlZCBpblxuICAgIC8vIGNhc2Ugb2YgbXVsdGktdG91Y2guXG4gICAgbGV0IHRvdWNoID0gdG91Y2hFdmVudC5jaGFuZ2VkVG91Y2hlc1swXVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IHRvdWNoLnBhZ2VYLFxuICAgICAgeTogdG91Y2gucGFnZVksXG4gICAgICBpc0xlZnRNb3VzZTogdHJ1ZSwgLy8gVG91Y2ggaXMgdHJlYXRlZCBsaWtlIGEgbGVmdCBtb3VzZSBidXR0b24gY2xpY2tcbiAgICAgIGlzTWlkZGxlTW91c2U6IGZhbHNlXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZXMgdG8gYSBtZWRpYSBxdWVyeSBmb3IgZGV2aWNlIHBpeGVsIHJhdGlvIGNoYW5nZXMgYW5kIGZvcmNlc1xuICAgKiBhIHJlcGFpbnQgd2hlbiBpdCBvY2N1cnMuXG4gICAqXG4gICAqIEByZXR1cm4ge0Rpc3Bvc2FibGV9IGEgZGlzcG9zYWJsZSB0byByZW1vdmUgdGhlIG1lZGlhIHF1ZXJ5IGxpc3RlbmVyXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgc3Vic2NyaWJlVG9NZWRpYVF1ZXJ5ICgpIHtcbiAgICBpZiAoIURpc3Bvc2FibGUpIHtcbiAgICAgICh7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJykpXG4gICAgfVxuXG4gICAgY29uc3QgcXVlcnkgPSAnc2NyZWVuIGFuZCAoLXdlYmtpdC1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAxLjUpJ1xuICAgIGNvbnN0IG1lZGlhUXVlcnkgPSB3aW5kb3cubWF0Y2hNZWRpYShxdWVyeSlcbiAgICBjb25zdCBtZWRpYUxpc3RlbmVyID0gKGUpID0+IHsgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKCkgfVxuICAgIG1lZGlhUXVlcnkuYWRkTGlzdGVuZXIobWVkaWFMaXN0ZW5lcilcblxuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBtZWRpYVF1ZXJ5LnJlbW92ZUxpc3RlbmVyKG1lZGlhTGlzdGVuZXIpXG4gICAgfSlcbiAgfVxuXG4gIC8vICAgICMjIyMjIyMjICAgICMjIyMgICAgIyMjIyMjIyNcbiAgLy8gICAgIyMgICAgICMjICAjIyAgIyMgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAgIyMjIyAgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAjIyMjICAgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAjIyAjIyAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgIyMgICAjIyAgICAgIyNcbiAgLy8gICAgIyMjIyMjIyMgICAjIyMjICAjIyAjIyMjIyMjI1xuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB0cmlnZ2VyZWQgd2hlbiB0aGUgbW91c2UgaXMgcHJlc3NlZCBvdmVyIHRoZSB2aXNpYmxlIGFyZWEgdGhhdFxuICAgKiBzdGFydHMgdGhlIGRyYWdnaW5nIGdlc3R1cmUuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0geSB0aGUgdmVydGljYWwgY29vcmRpbmF0ZSBvZiB0aGUgZXZlbnRcbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gaXNMZWZ0TW91c2Ugd2FzIHRoZSBsZWZ0IG1vdXNlIGJ1dHRvbiBwcmVzc2VkP1xuICAgKiBAcGFyYW0gIHtib29sZWFufSBpc01pZGRsZU1vdXNlIHdhcyB0aGUgbWlkZGxlIG1vdXNlIGJ1dHRvbiBwcmVzc2VkP1xuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHN0YXJ0RHJhZyAoe3ksIGlzTGVmdE1vdXNlLCBpc01pZGRsZU1vdXNlfSkge1xuICAgIGlmICghRGlzcG9zYWJsZSkge1xuICAgICAgKHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKSlcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMubWluaW1hcCkgeyByZXR1cm4gfVxuICAgIGlmICghaXNMZWZ0TW91c2UgJiYgIWlzTWlkZGxlTW91c2UpIHsgcmV0dXJuIH1cblxuICAgIGxldCB7dG9wfSA9IHRoaXMudmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBsZXQge3RvcDogb2Zmc2V0VG9wfSA9IHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblxuICAgIGxldCBkcmFnT2Zmc2V0ID0geSAtIHRvcFxuXG4gICAgbGV0IGluaXRpYWwgPSB7ZHJhZ09mZnNldCwgb2Zmc2V0VG9wfVxuXG4gICAgbGV0IG1vdXNlbW92ZUhhbmRsZXIgPSAoZSkgPT4gdGhpcy5kcmFnKHRoaXMuZXh0cmFjdE1vdXNlRXZlbnREYXRhKGUpLCBpbml0aWFsKVxuICAgIGxldCBtb3VzZXVwSGFuZGxlciA9IChlKSA9PiB0aGlzLmVuZERyYWcoKVxuXG4gICAgbGV0IHRvdWNobW92ZUhhbmRsZXIgPSAoZSkgPT4gdGhpcy5kcmFnKHRoaXMuZXh0cmFjdFRvdWNoRXZlbnREYXRhKGUpLCBpbml0aWFsKVxuICAgIGxldCB0b3VjaGVuZEhhbmRsZXIgPSAoZSkgPT4gdGhpcy5lbmREcmFnKClcblxuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW91c2Vtb3ZlSGFuZGxlcilcbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBtb3VzZXVwSGFuZGxlcilcbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBtb3VzZXVwSGFuZGxlcilcblxuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdG91Y2htb3ZlSGFuZGxlcilcbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdG91Y2hlbmRIYW5kbGVyKVxuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0b3VjaGVuZEhhbmRsZXIpXG5cbiAgICB0aGlzLmRyYWdTdWJzY3JpcHRpb24gPSBuZXcgRGlzcG9zYWJsZShmdW5jdGlvbiAoKSB7XG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdXNlbW92ZUhhbmRsZXIpXG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBtb3VzZXVwSGFuZGxlcilcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIG1vdXNldXBIYW5kbGVyKVxuXG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRvdWNobW92ZUhhbmRsZXIpXG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdG91Y2hlbmRIYW5kbGVyKVxuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRvdWNoZW5kSGFuZGxlcilcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtZXRob2QgY2FsbGVkIGR1cmluZyB0aGUgZHJhZyBnZXN0dXJlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IHkgdGhlIHZlcnRpY2FsIGNvb3JkaW5hdGUgb2YgdGhlIGV2ZW50XG4gICAqIEBwYXJhbSAge2Jvb2xlYW59IGlzTGVmdE1vdXNlIHdhcyB0aGUgbGVmdCBtb3VzZSBidXR0b24gcHJlc3NlZD9cbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gaXNNaWRkbGVNb3VzZSB3YXMgdGhlIG1pZGRsZSBtb3VzZSBidXR0b24gcHJlc3NlZD9cbiAgICogQHBhcmFtICB7bnVtYmVyfSBpbml0aWFsLmRyYWdPZmZzZXQgdGhlIG1vdXNlIG9mZnNldCB3aXRoaW4gdGhlIHZpc2libGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJlYVxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGluaXRpYWwub2Zmc2V0VG9wIHRoZSBNaW5pbWFwRWxlbWVudCBvZmZzZXQgYXQgdGhlIG1vbWVudFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mIHRoZSBkcmFnIHN0YXJ0XG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZHJhZyAoe3ksIGlzTGVmdE1vdXNlLCBpc01pZGRsZU1vdXNlfSwgaW5pdGlhbCkge1xuICAgIGlmICghdGhpcy5taW5pbWFwKSB7IHJldHVybiB9XG4gICAgaWYgKCFpc0xlZnRNb3VzZSAmJiAhaXNNaWRkbGVNb3VzZSkgeyByZXR1cm4gfVxuICAgIGxldCBkZWx0YVkgPSB5IC0gaW5pdGlhbC5vZmZzZXRUb3AgLSBpbml0aWFsLmRyYWdPZmZzZXRcblxuICAgIGxldCByYXRpbyA9IGRlbHRhWSAvICh0aGlzLm1pbmltYXAuZ2V0VmlzaWJsZUhlaWdodCgpIC0gdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRIZWlnaHQoKSlcblxuICAgIHRoaXMubWluaW1hcC5zZXRUZXh0RWRpdG9yU2Nyb2xsVG9wKHJhdGlvICogdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3JNYXhTY3JvbGxUb3AoKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWV0aG9kIHRoYXQgZW5kcyB0aGUgZHJhZyBnZXN0dXJlLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGVuZERyYWcgKCkge1xuICAgIGlmICghdGhpcy5taW5pbWFwKSB7IHJldHVybiB9XG4gICAgdGhpcy5kcmFnU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICB9XG5cbiAgLy8gICAgICMjIyMjIyAgICMjIyMjIyAgICMjIyMjI1xuICAvLyAgICAjIyAgICAjIyAjIyAgICAjIyAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgICAjIyAgICAgICAjI1xuICAvLyAgICAjIyAgICAgICAgIyMjIyMjICAgIyMjIyMjXG4gIC8vICAgICMjICAgICAgICAgICAgICMjICAgICAgICMjXG4gIC8vICAgICMjICAgICMjICMjICAgICMjICMjICAgICMjXG4gIC8vICAgICAjIyMjIyMgICAjIyMjIyMgICAjIyMjIyNcblxuICAvKipcbiAgICogQXBwbGllcyB0aGUgcGFzc2VkLWluIHN0eWxlcyBwcm9wZXJ0aWVzIHRvIHRoZSBzcGVjaWZpZWQgZWxlbWVudFxuICAgKlxuICAgKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gZWxlbWVudCB0aGUgZWxlbWVudCBvbnRvIHdoaWNoIGFwcGx5IHRoZSBzdHlsZXNcbiAgICogQHBhcmFtICB7T2JqZWN0fSBzdHlsZXMgdGhlIHN0eWxlcyB0byBhcHBseVxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGFwcGx5U3R5bGVzIChlbGVtZW50LCBzdHlsZXMpIHtcbiAgICBpZiAoIWVsZW1lbnQpIHsgcmV0dXJuIH1cblxuICAgIGxldCBjc3NUZXh0ID0gJydcbiAgICBmb3IgKGxldCBwcm9wZXJ0eSBpbiBzdHlsZXMpIHtcbiAgICAgIGNzc1RleHQgKz0gYCR7cHJvcGVydHl9OiAke3N0eWxlc1twcm9wZXJ0eV19OyBgXG4gICAgfVxuXG4gICAgZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gY3NzVGV4dFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmcgd2l0aCBhIENTUyB0cmFuc2xhdGlvbiB0cmFuZm9ybSB2YWx1ZS5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSBbeCA9IDBdIHRoZSB4IG9mZnNldCBvZiB0aGUgdHJhbnNsYXRpb25cbiAgICogQHBhcmFtICB7bnVtYmVyfSBbeSA9IDBdIHRoZSB5IG9mZnNldCBvZiB0aGUgdHJhbnNsYXRpb25cbiAgICogQHJldHVybiB7c3RyaW5nfSB0aGUgQ1NTIHRyYW5zbGF0aW9uIHN0cmluZ1xuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIG1ha2VUcmFuc2xhdGUgKHggPSAwLCB5ID0gMCkge1xuICAgIGlmICh0aGlzLnVzZUhhcmR3YXJlQWNjZWxlcmF0aW9uKSB7XG4gICAgICByZXR1cm4gYHRyYW5zbGF0ZTNkKCR7eH1weCwgJHt5fXB4LCAwKWBcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGB0cmFuc2xhdGUoJHt4fXB4LCAke3l9cHgpYFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIHdpdGggYSBDU1Mgc2NhbGluZyB0cmFuZm9ybSB2YWx1ZS5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSBbeCA9IDBdIHRoZSB4IHNjYWxpbmcgZmFjdG9yXG4gICAqIEBwYXJhbSAge251bWJlcn0gW3kgPSAwXSB0aGUgeSBzY2FsaW5nIGZhY3RvclxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IHRoZSBDU1Mgc2NhbGluZyBzdHJpbmdcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBtYWtlU2NhbGUgKHggPSAwLCB5ID0geCkge1xuICAgIGlmICh0aGlzLnVzZUhhcmR3YXJlQWNjZWxlcmF0aW9uKSB7XG4gICAgICByZXR1cm4gYHNjYWxlM2QoJHt4fSwgJHt5fSwgMSlgXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBgc2NhbGUoJHt4fSwgJHt5fSlgXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRoYXQgcmV0dXJuIHRoZSBjdXJyZW50IHRpbWUgYXMgYSBEYXRlLlxuICAgKlxuICAgKiBUaGF0IG1ldGhvZCBleGlzdCBzbyB0aGF0IHdlIGNhbiBtb2NrIGl0IGluIHRlc3RzLlxuICAgKlxuICAgKiBAcmV0dXJuIHtEYXRlfSB0aGUgY3VycmVudCB0aW1lIGFzIERhdGVcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBnZXRUaW1lICgpIHsgcmV0dXJuIG5ldyBEYXRlKCkgfVxuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB0aGF0IG1pbWljIHRoZSBqUXVlcnkgYGFuaW1hdGVgIG1ldGhvZCBhbmQgdXNlZCB0byBhbmltYXRlIHRoZVxuICAgKiBzY3JvbGwgd2hlbiBjbGlja2luZyBvbiB0aGUgTWluaW1hcEVsZW1lbnQgY2FudmFzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IHBhcmFtIHRoZSBhbmltYXRpb24gZGF0YSBvYmplY3RcbiAgICogQHBhcmFtICB7W3R5cGVdfSBwYXJhbS5mcm9tIHRoZSBzdGFydCB2YWx1ZVxuICAgKiBAcGFyYW0gIHtbdHlwZV19IHBhcmFtLnRvIHRoZSBlbmQgdmFsdWVcbiAgICogQHBhcmFtICB7W3R5cGVdfSBwYXJhbS5kdXJhdGlvbiB0aGUgYW5pbWF0aW9uIGR1cmF0aW9uXG4gICAqIEBwYXJhbSAge1t0eXBlXX0gcGFyYW0uc3RlcCB0aGUgZWFzaW5nIGZ1bmN0aW9uIGZvciB0aGUgYW5pbWF0aW9uXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgYW5pbWF0ZSAoe2Zyb20sIHRvLCBkdXJhdGlvbiwgc3RlcH0pIHtcbiAgICBjb25zdCBzdGFydCA9IHRoaXMuZ2V0VGltZSgpXG4gICAgbGV0IHByb2dyZXNzXG5cbiAgICBjb25zdCBzd2luZyA9IGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICAgICAgcmV0dXJuIDAuNSAtIE1hdGguY29zKHByb2dyZXNzICogTWF0aC5QSSkgLyAyXG4gICAgfVxuXG4gICAgY29uc3QgdXBkYXRlID0gKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLm1pbmltYXApIHsgcmV0dXJuIH1cblxuICAgICAgY29uc3QgcGFzc2VkID0gdGhpcy5nZXRUaW1lKCkgLSBzdGFydFxuICAgICAgaWYgKGR1cmF0aW9uID09PSAwKSB7XG4gICAgICAgIHByb2dyZXNzID0gMVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvZ3Jlc3MgPSBwYXNzZWQgLyBkdXJhdGlvblxuICAgICAgfVxuICAgICAgaWYgKHByb2dyZXNzID4gMSkgeyBwcm9ncmVzcyA9IDEgfVxuICAgICAgY29uc3QgZGVsdGEgPSBzd2luZyhwcm9ncmVzcylcbiAgICAgIGNvbnN0IHZhbHVlID0gZnJvbSArICh0byAtIGZyb20pICogZGVsdGFcbiAgICAgIHN0ZXAodmFsdWUsIGRlbHRhKVxuXG4gICAgICBpZiAocHJvZ3Jlc3MgPCAxKSB7IHJlcXVlc3RBbmltYXRpb25GcmFtZSh1cGRhdGUpIH1cbiAgICB9XG5cbiAgICB1cGRhdGUoKVxuICB9XG59XG4iXX0=
//# sourceURL=/home/takaaki/.atom/packages/minimap/lib/minimap-element.js
