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

var _decoratorsInclude = require('./decorators/include');

var _decoratorsInclude2 = _interopRequireDefault(_decoratorsInclude);

var _decoratorsElement = require('./decorators/element');

var _decoratorsElement2 = _interopRequireDefault(_decoratorsElement);

var _mixinsDomStylesReader = require('./mixins/dom-styles-reader');

var _mixinsDomStylesReader2 = _interopRequireDefault(_mixinsDomStylesReader);

var _mixinsCanvasDrawer = require('./mixins/canvas-drawer');

var _mixinsCanvasDrawer2 = _interopRequireDefault(_mixinsCanvasDrawer);

var _minimapQuickSettingsElement = require('./minimap-quick-settings-element');

var _minimapQuickSettingsElement2 = _interopRequireDefault(_minimapQuickSettingsElement);

'use babel';

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
      this.subscriptions = new _atom.CompositeDisposable();
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
      (parent || this.getTextEditorElementRoot()).appendChild(this);
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
          e.preventDefault();
          e.stopPropagation();

          if (_this5.quickSettingsElement != null) {
            _this5.quickSettingsElement.destroy();
            _this5.quickSettingsSubscription.dispose();
          } else {
            _this5.quickSettingsElement = new _minimapQuickSettingsElement2['default']();
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

      this.subscriptions.add(_main2['default'].onDidChangePluginOrder(function () {
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
          left: visibleAreaLeft + 'px'
        });
      } else {
        this.applyStyles(this.visibleArea, {
          width: visibleWidth + 'px',
          height: minimap.getTextEditorScaledHeight() + 'px',
          transform: this.makeTranslate(visibleAreaLeft, visibleAreaTop)
        });
      }

      this.applyStyles(this.controls, { width: visibleWidth + 'px' });

      var canvasTop = minimap.getFirstVisibleScreenRow() * minimap.getLineHeight() - minimap.getScrollTop();

      var canvasTransform = this.makeTranslate(0, canvasTop);
      if (devicePixelRatio !== 1) {
        canvasTransform += ' ' + this.makeScale(1 / devicePixelRatio);
      }

      if (this.smoothScrolling) {
        if (SPEC_MODE) {
          this.applyStyles(this.backLayer.canvas, { top: canvasTop + 'px' });
          this.applyStyles(this.tokensLayer.canvas, { top: canvasTop + 'px' });
          this.applyStyles(this.frontLayer.canvas, { top: canvasTop + 'px' });
        } else {
          this.applyStyles(this.backLayer.canvas, { transform: canvasTransform });
          this.applyStyles(this.tokensLayer.canvas, { transform: canvasTransform });
          this.applyStyles(this.frontLayer.canvas, { transform: canvasTransform });
        }
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

          if (softWrap && softWrapAtPreferredLineLength && lineLength && width <= this.width) {
            this.flexBasis = width;
            canvasWidth = width;
          } else {
            delete this.flexBasis;
          }
        } else {
          delete this.flexBasis;
        }

        this.updateCanvasesSize(canvasWidth);
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

      var scrollTop = row * textEditor.getLineHeightInPixels() - this.minimap.getTextEditorHeight() / 2;

      if (atom.config.get('minimap.scrollAnimation')) {
        var duration = atom.config.get('minimap.scrollAnimationDuration');
        var independentScroll = this.minimap.scrollIndependentlyOnMouseWheel();

        var from = this.minimap.getTextEditorScrollTop();
        var to = scrollTop;
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
        this.minimap.setTextEditorScrollTop(scrollTop);
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

      var query = 'screen and (-webkit-min-device-pixel-ratio: 1.5)';
      var mediaQuery = window.matchMedia(query);
      var mediaListener = function mediaListener(e) {
        _this9.requestForcedUpdate();
      };
      mediaQuery.addListener(mediaListener);

      return new _atom.Disposable(function () {
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

      this.dragSubscription = new _atom.Disposable(function () {
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
  }], [{
    key: 'registerViewProvider',

    /**
     * The method that registers the MinimapElement factory in the
     * `atom.views` registry with the Minimap model.
     */
    value: function registerViewProvider(Minimap) {
      atom.views.addViewProvider(Minimap, function (model) {
        var element = new MinimapElement();
        element.setModel(model);
        return element;
      });
    }
  }]);

  var _MinimapElement = MinimapElement;
  MinimapElement = (0, _decoratorsInclude2['default'])(_mixinsDomStylesReader2['default'], _mixinsCanvasDrawer2['default'], _atomUtils.EventsDelegation, _atomUtils.AncestorsMethods)(MinimapElement) || MinimapElement;
  MinimapElement = (0, _decoratorsElement2['default'])('atom-text-editor-minimap')(MinimapElement) || MinimapElement;
  return MinimapElement;
})();

exports['default'] = MinimapElement;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvbWluaW1hcC1lbGVtZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRThDLE1BQU07O3lCQUNILFlBQVk7O29CQUM1QyxRQUFROzs7O2lDQUNMLHNCQUFzQjs7OztpQ0FDdEIsc0JBQXNCOzs7O3FDQUNkLDRCQUE0Qjs7OztrQ0FDL0Isd0JBQXdCOzs7OzJDQUNULGtDQUFrQzs7OztBQVQxRSxXQUFXLENBQUE7O0FBV1gsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7OztJQWtCZCxjQUFjO1dBQWQsY0FBYzs7OztlQUFkLGNBQWM7Ozs7Ozs7Ozs7Ozs7Ozs7V0EyQmpCLDJCQUFHOzs7Ozs7OztBQU1qQixVQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQTs7OztBQUl4QixVQUFJLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQTs7OztBQUk5QixVQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQTs7OztBQUl0QixVQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQTs7Ozs7OztBQU92QixVQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBOzs7O0FBSTlDLFVBQUksQ0FBQyx1QkFBdUIsR0FBRyxTQUFTLENBQUE7Ozs7QUFJeEMsVUFBSSxDQUFDLHlCQUF5QixHQUFHLFNBQVMsQ0FBQTs7OztBQUkxQyxVQUFJLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFBOzs7O0FBSWpDLFVBQUksQ0FBQyw0QkFBNEIsR0FBRyxTQUFTLENBQUE7Ozs7Ozs7QUFPN0MsVUFBSSxDQUFDLG9CQUFvQixHQUFHLEtBQUssQ0FBQTs7OztBQUlqQyxVQUFJLENBQUMsc0JBQXNCLEdBQUcsU0FBUyxDQUFBOzs7O0FBSXZDLFVBQUksQ0FBQyxvQkFBb0IsR0FBRyxTQUFTLENBQUE7Ozs7QUFJckMsVUFBSSxDQUFDLHNCQUFz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QUNwQyxVQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxLQUFLLEVBQUU7QUFDbkQsWUFBSSxPQUFPLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQTtBQUNsQyxlQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ3ZCLGVBQU8sT0FBTyxDQUFBO09BQ2YsQ0FBQyxDQUFBO0tBQ0g7Ozt3QkFaa0IsY0FBYztBQUFkLGdCQUFjLEdBRGxDLGtLQUEwRSxDQUN0RCxjQUFjLEtBQWQsY0FBYztBQUFkLGdCQUFjLEdBRmxDLG9DQUFRLDBCQUEwQixDQUFDLENBRWYsY0FBYyxLQUFkLGNBQWM7U0FBZCxjQUFjOzs7cUJBQWQsY0FBYyIsImZpbGUiOiIvaG9tZS90YWthYWtpLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvbGliL21pbmltYXAtZWxlbWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSdcbmltcG9ydCB7RXZlbnRzRGVsZWdhdGlvbiwgQW5jZXN0b3JzTWV0aG9kc30gZnJvbSAnYXRvbS11dGlscydcbmltcG9ydCBNYWluIGZyb20gJy4vbWFpbidcbmltcG9ydCBpbmNsdWRlIGZyb20gJy4vZGVjb3JhdG9ycy9pbmNsdWRlJ1xuaW1wb3J0IGVsZW1lbnQgZnJvbSAnLi9kZWNvcmF0b3JzL2VsZW1lbnQnXG5pbXBvcnQgRE9NU3R5bGVzUmVhZGVyIGZyb20gJy4vbWl4aW5zL2RvbS1zdHlsZXMtcmVhZGVyJ1xuaW1wb3J0IENhbnZhc0RyYXdlciBmcm9tICcuL21peGlucy9jYW52YXMtZHJhd2VyJ1xuaW1wb3J0IE1pbmltYXBRdWlja1NldHRpbmdzRWxlbWVudCBmcm9tICcuL21pbmltYXAtcXVpY2stc2V0dGluZ3MtZWxlbWVudCdcblxuY29uc3QgU1BFQ19NT0RFID0gYXRvbS5pblNwZWNNb2RlKClcblxuLyoqXG4gKiBQdWJsaWM6IFRoZSBNaW5pbWFwRWxlbWVudCBpcyB0aGUgdmlldyBtZWFudCB0byByZW5kZXIgYSB7QGxpbmsgTWluaW1hcH1cbiAqIGluc3RhbmNlIGluIHRoZSBET00uXG4gKlxuICogWW91IGNhbiByZXRyaWV2ZSB0aGUgTWluaW1hcEVsZW1lbnQgYXNzb2NpYXRlZCB0byBhIE1pbmltYXBcbiAqIHVzaW5nIHRoZSBgYXRvbS52aWV3cy5nZXRWaWV3YCBtZXRob2QuXG4gKlxuICogTm90ZSB0aGF0IG1vc3QgaW50ZXJhY3Rpb25zIHdpdGggdGhlIE1pbmltYXAgcGFja2FnZSBpcyBkb25lIHRocm91Z2ggdGhlXG4gKiBNaW5pbWFwIG1vZGVsIHNvIHlvdSBzaG91bGQgbmV2ZXIgaGF2ZSB0byBhY2Nlc3MgTWluaW1hcEVsZW1lbnRcbiAqIGluc3RhbmNlcy5cbiAqXG4gKiBAZXhhbXBsZVxuICogbGV0IG1pbmltYXBFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KG1pbmltYXApXG4gKi9cbkBlbGVtZW50KCdhdG9tLXRleHQtZWRpdG9yLW1pbmltYXAnKVxuQGluY2x1ZGUoRE9NU3R5bGVzUmVhZGVyLCBDYW52YXNEcmF3ZXIsIEV2ZW50c0RlbGVnYXRpb24sIEFuY2VzdG9yc01ldGhvZHMpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNaW5pbWFwRWxlbWVudCB7XG5cbiAgLyoqXG4gICAqIFRoZSBtZXRob2QgdGhhdCByZWdpc3RlcnMgdGhlIE1pbmltYXBFbGVtZW50IGZhY3RvcnkgaW4gdGhlXG4gICAqIGBhdG9tLnZpZXdzYCByZWdpc3RyeSB3aXRoIHRoZSBNaW5pbWFwIG1vZGVsLlxuICAgKi9cbiAgc3RhdGljIHJlZ2lzdGVyVmlld1Byb3ZpZGVyIChNaW5pbWFwKSB7XG4gICAgYXRvbS52aWV3cy5hZGRWaWV3UHJvdmlkZXIoTWluaW1hcCwgZnVuY3Rpb24gKG1vZGVsKSB7XG4gICAgICBsZXQgZWxlbWVudCA9IG5ldyBNaW5pbWFwRWxlbWVudCgpXG4gICAgICBlbGVtZW50LnNldE1vZGVsKG1vZGVsKVxuICAgICAgcmV0dXJuIGVsZW1lbnRcbiAgICB9KVxuICB9XG5cbiAgLy8gICAgIyMgICAgICMjICAjIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgIyMgICMjIyMjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICMjICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgIyMgICAjI1xuICAvLyAgICAjIyMjIyMjIyMgIyMgICAgICMjICMjICAgICAjIyAjIyMjIyAgICAgIyMjIyMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAjIyAgICAgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgIyMgICMjICAgICMjXG4gIC8vICAgICMjICAgICAjIyAgIyMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjICAjIyMjIyNcblxuICAvKipcbiAgICogRE9NIGNhbGxiYWNrIGludm9rZWQgd2hlbiBhIG5ldyBNaW5pbWFwRWxlbWVudCBpcyBjcmVhdGVkLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGNyZWF0ZWRDYWxsYmFjayAoKSB7XG4gICAgLy8gQ29yZSBwcm9wZXJ0aWVzXG5cbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLm1pbmltYXAgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmVkaXRvckVsZW1lbnQgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLndpZHRoID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5oZWlnaHQgPSB1bmRlZmluZWRcblxuICAgIC8vIFN1YnNjcmlwdGlvbnNcblxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnZpc2libGVBcmVhU3Vic2NyaXB0aW9uID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5xdWlja1NldHRpbmdzU3Vic2NyaXB0aW9uID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5kcmFnU3Vic2NyaXB0aW9uID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5vcGVuUXVpY2tTZXR0aW5nU3Vic2NyaXB0aW9uID0gdW5kZWZpbmVkXG5cbiAgICAvLyBDb25maWdzXG5cbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5kaXNwbGF5TWluaW1hcE9uTGVmdCA9IGZhbHNlXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMubWluaW1hcFNjcm9sbEluZGljYXRvciA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLmRpc3BsYXlNaW5pbWFwT25MZWZ0ID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMuZGlzcGxheVBsdWdpbnNDb250cm9scyA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLnRleHRPcGFjaXR5ID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMuZGlzcGxheUNvZGVIaWdobGlnaHRzID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMuYWRqdXN0VG9Tb2Z0V3JhcCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLnVzZUhhcmR3YXJlQWNjZWxlcmF0aW9uID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMuYWJzb2x1dGVNb2RlID0gdW5kZWZpbmVkXG5cbiAgICAvLyBFbGVtZW50c1xuXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5zaGFkb3dSb290ID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy52aXNpYmxlQXJlYSA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuY29udHJvbHMgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnNjcm9sbEluZGljYXRvciA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMub3BlblF1aWNrU2V0dGluZ3MgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50ID0gdW5kZWZpbmVkXG5cbiAgICAvLyBTdGF0ZXNcblxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLmF0dGFjaGVkID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMuYXR0YWNoZWRUb1RleHRFZGl0b3IgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5zdGFuZEFsb25lID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy53YXNWaXNpYmxlID0gdW5kZWZpbmVkXG5cbiAgICAvLyBPdGhlclxuXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5vZmZzY3JlZW5GaXJzdFJvdyA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMub2Zmc2NyZWVuTGFzdFJvdyA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuZnJhbWVSZXF1ZXN0ZWQgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmZsZXhCYXNpcyA9IHVuZGVmaW5lZFxuXG4gICAgdGhpcy5pbml0aWFsaXplQ29udGVudCgpXG5cbiAgICByZXR1cm4gdGhpcy5vYnNlcnZlQ29uZmlnKHtcbiAgICAgICdtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0JzogKGRpc3BsYXlNaW5pbWFwT25MZWZ0KSA9PiB7XG4gICAgICAgIHRoaXMuZGlzcGxheU1pbmltYXBPbkxlZnQgPSBkaXNwbGF5TWluaW1hcE9uTGVmdFxuXG4gICAgICAgIHRoaXMudXBkYXRlTWluaW1hcEZsZXhQb3NpdGlvbigpXG4gICAgICB9LFxuXG4gICAgICAnbWluaW1hcC5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yJzogKG1pbmltYXBTY3JvbGxJbmRpY2F0b3IpID0+IHtcbiAgICAgICAgdGhpcy5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yID0gbWluaW1hcFNjcm9sbEluZGljYXRvclxuXG4gICAgICAgIGlmICh0aGlzLm1pbmltYXBTY3JvbGxJbmRpY2F0b3IgJiYgISh0aGlzLnNjcm9sbEluZGljYXRvciAhPSBudWxsKSAmJiAhdGhpcy5zdGFuZEFsb25lKSB7XG4gICAgICAgICAgdGhpcy5pbml0aWFsaXplU2Nyb2xsSW5kaWNhdG9yKClcbiAgICAgICAgfSBlbHNlIGlmICgodGhpcy5zY3JvbGxJbmRpY2F0b3IgIT0gbnVsbCkpIHtcbiAgICAgICAgICB0aGlzLmRpc3Bvc2VTY3JvbGxJbmRpY2F0b3IoKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0VXBkYXRlKCkgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scyc6IChkaXNwbGF5UGx1Z2luc0NvbnRyb2xzKSA9PiB7XG4gICAgICAgIHRoaXMuZGlzcGxheVBsdWdpbnNDb250cm9scyA9IGRpc3BsYXlQbHVnaW5zQ29udHJvbHNcblxuICAgICAgICBpZiAodGhpcy5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzICYmICEodGhpcy5vcGVuUXVpY2tTZXR0aW5ncyAhPSBudWxsKSAmJiAhdGhpcy5zdGFuZEFsb25lKSB7XG4gICAgICAgICAgdGhpcy5pbml0aWFsaXplT3BlblF1aWNrU2V0dGluZ3MoKVxuICAgICAgICB9IGVsc2UgaWYgKCh0aGlzLm9wZW5RdWlja1NldHRpbmdzICE9IG51bGwpKSB7XG4gICAgICAgICAgdGhpcy5kaXNwb3NlT3BlblF1aWNrU2V0dGluZ3MoKVxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAnbWluaW1hcC50ZXh0T3BhY2l0eSc6ICh0ZXh0T3BhY2l0eSkgPT4ge1xuICAgICAgICB0aGlzLnRleHRPcGFjaXR5ID0gdGV4dE9wYWNpdHlcblxuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKSB9XG4gICAgICB9LFxuXG4gICAgICAnbWluaW1hcC5kaXNwbGF5Q29kZUhpZ2hsaWdodHMnOiAoZGlzcGxheUNvZGVIaWdobGlnaHRzKSA9PiB7XG4gICAgICAgIHRoaXMuZGlzcGxheUNvZGVIaWdobGlnaHRzID0gZGlzcGxheUNvZGVIaWdobGlnaHRzXG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKCkgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAuc21vb3RoU2Nyb2xsaW5nJzogKHNtb290aFNjcm9sbGluZykgPT4ge1xuICAgICAgICB0aGlzLnNtb290aFNjcm9sbGluZyA9IHNtb290aFNjcm9sbGluZ1xuXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLnNtb290aFNjcm9sbGluZykge1xuICAgICAgICAgICAgdGhpcy5iYWNrTGF5ZXIuY2FudmFzLnN0eWxlLmNzc1RleHQgPSAnJ1xuICAgICAgICAgICAgdGhpcy50b2tlbnNMYXllci5jYW52YXMuc3R5bGUuY3NzVGV4dCA9ICcnXG4gICAgICAgICAgICB0aGlzLmZyb250TGF5ZXIuY2FudmFzLnN0eWxlLmNzc1RleHQgPSAnJ1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAuYWRqdXN0TWluaW1hcFdpZHRoVG9Tb2Z0V3JhcCc6IChhZGp1c3RUb1NvZnRXcmFwKSA9PiB7XG4gICAgICAgIHRoaXMuYWRqdXN0VG9Tb2Z0V3JhcCA9IGFkanVzdFRvU29mdFdyYXBcblxuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLm1lYXN1cmVIZWlnaHRBbmRXaWR0aCgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLnVzZUhhcmR3YXJlQWNjZWxlcmF0aW9uJzogKHVzZUhhcmR3YXJlQWNjZWxlcmF0aW9uKSA9PiB7XG4gICAgICAgIHRoaXMudXNlSGFyZHdhcmVBY2NlbGVyYXRpb24gPSB1c2VIYXJkd2FyZUFjY2VsZXJhdGlvblxuXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLmFic29sdXRlTW9kZSc6IChhYnNvbHV0ZU1vZGUpID0+IHtcbiAgICAgICAgdGhpcy5hYnNvbHV0ZU1vZGUgPSBhYnNvbHV0ZU1vZGVcblxuICAgICAgICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ2Fic29sdXRlJywgdGhpcy5hYnNvbHV0ZU1vZGUpXG4gICAgICB9LFxuXG4gICAgICAnbWluaW1hcC5hZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQnOiAoYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0KSA9PiB7XG4gICAgICAgIHRoaXMuYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0ID0gYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0XG5cbiAgICAgICAgdGhpcy5jbGFzc0xpc3QudG9nZ2xlKCdhZGp1c3QtYWJzb2x1dGUtaGVpZ2h0JywgdGhpcy5hZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQpXG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5tZWFzdXJlSGVpZ2h0QW5kV2lkdGgoKSB9XG4gICAgICB9LFxuXG4gICAgICAnbWluaW1hcC5pZ25vcmVXaGl0ZXNwYWNlc0luVG9rZW5zJzogKGlnbm9yZVdoaXRlc3BhY2VzSW5Ub2tlbnMpID0+IHtcbiAgICAgICAgdGhpcy5pZ25vcmVXaGl0ZXNwYWNlc0luVG9rZW5zID0gaWdub3JlV2hpdGVzcGFjZXNJblRva2Vuc1xuXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdlZGl0b3IucHJlZmVycmVkTGluZUxlbmd0aCc6ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5tZWFzdXJlSGVpZ2h0QW5kV2lkdGgoKSB9XG4gICAgICB9LFxuXG4gICAgICAnZWRpdG9yLnNvZnRXcmFwJzogKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLnJlcXVlc3RVcGRhdGUoKSB9XG4gICAgICB9LFxuXG4gICAgICAnZWRpdG9yLnNvZnRXcmFwQXRQcmVmZXJyZWRMaW5lTGVuZ3RoJzogKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLnJlcXVlc3RVcGRhdGUoKSB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBET00gY2FsbGJhY2sgaW52b2tlZCB3aGVuIGEgbmV3IE1pbmltYXBFbGVtZW50IGlzIGF0dGFjaGVkIHRvIHRoZSBET00uXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgYXR0YWNoZWRDYWxsYmFjayAoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLnZpZXdzLnBvbGxEb2N1bWVudCgoKSA9PiB7IHRoaXMucG9sbERPTSgpIH0pKVxuICAgIHRoaXMubWVhc3VyZUhlaWdodEFuZFdpZHRoKClcbiAgICB0aGlzLnVwZGF0ZU1pbmltYXBGbGV4UG9zaXRpb24oKVxuICAgIHRoaXMuYXR0YWNoZWQgPSB0cnVlXG4gICAgdGhpcy5hdHRhY2hlZFRvVGV4dEVkaXRvciA9IHRoaXMucGFyZW50Tm9kZSA9PT0gdGhpcy5nZXRUZXh0RWRpdG9yRWxlbWVudFJvb3QoKVxuXG4gICAgLypcbiAgICAgIFdlIHVzZSBgYXRvbS5zdHlsZXMub25EaWRBZGRTdHlsZUVsZW1lbnRgIGluc3RlYWQgb2ZcbiAgICAgIGBhdG9tLnRoZW1lcy5vbkRpZENoYW5nZUFjdGl2ZVRoZW1lc2AuXG4gICAgICBXaHk/IEN1cnJlbnRseSwgVGhlIHN0eWxlIGVsZW1lbnQgd2lsbCBiZSByZW1vdmVkIGZpcnN0LCBhbmQgdGhlbiByZS1hZGRlZFxuICAgICAgYW5kIHRoZSBgY2hhbmdlYCBldmVudCBoYXMgbm90IGJlIHRyaWdnZXJlZCBpbiB0aGUgcHJvY2Vzcy5cbiAgICAqL1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5zdHlsZXMub25EaWRBZGRTdHlsZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgdGhpcy5pbnZhbGlkYXRlRE9NU3R5bGVzQ2FjaGUoKVxuICAgICAgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5zdWJzY3JpYmVUb01lZGlhUXVlcnkoKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBET00gY2FsbGJhY2sgaW52b2tlZCB3aGVuIGEgbmV3IE1pbmltYXBFbGVtZW50IGlzIGRldGFjaGVkIGZyb20gdGhlIERPTS5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBkZXRhY2hlZENhbGxiYWNrICgpIHtcbiAgICB0aGlzLmF0dGFjaGVkID0gZmFsc2VcbiAgfVxuXG4gIC8vICAgICAgICMjIyAgICAjIyMjIyMjIyAjIyMjIyMjIyAgICAjIyMgICAgICMjIyMjIyAgIyMgICAgICMjXG4gIC8vICAgICAgIyMgIyMgICAgICAjIyAgICAgICAjIyAgICAgICMjICMjICAgIyMgICAgIyMgIyMgICAgICMjXG4gIC8vICAgICAjIyAgICMjICAgICAjIyAgICAgICAjIyAgICAgIyMgICAjIyAgIyMgICAgICAgIyMgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMjIyMjIyMjXG4gIC8vICAgICMjIyMjIyMjIyAgICAjIyAgICAgICAjIyAgICAjIyMjIyMjIyMgIyMgICAgICAgIyMgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjIyAgICAgIyMgIyMgICAgIyMgIyMgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjIyAgICAgIyMgICMjIyMjIyAgIyMgICAgICMjXG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgTWluaW1hcEVsZW1lbnQgaXMgY3VycmVudGx5IHZpc2libGUgb24gc2NyZWVuIG9yIG5vdC5cbiAgICpcbiAgICogVGhlIHZpc2liaWxpdHkgb2YgdGhlIG1pbmltYXAgaXMgZGVmaW5lZCBieSB0ZXN0aW5nIHRoZSBzaXplIG9mIHRoZSBvZmZzZXRcbiAgICogd2lkdGggYW5kIGhlaWdodCBvZiB0aGUgZWxlbWVudC5cbiAgICpcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gd2hldGhlciB0aGUgTWluaW1hcEVsZW1lbnQgaXMgY3VycmVudGx5IHZpc2libGUgb3Igbm90XG4gICAqL1xuICBpc1Zpc2libGUgKCkgeyByZXR1cm4gdGhpcy5vZmZzZXRXaWR0aCA+IDAgfHwgdGhpcy5vZmZzZXRIZWlnaHQgPiAwIH1cblxuICAvKipcbiAgICogQXR0YWNoZXMgdGhlIE1pbmltYXBFbGVtZW50IHRvIHRoZSBET00uXG4gICAqXG4gICAqIFRoZSBwb3NpdGlvbiBhdCB3aGljaCB0aGUgZWxlbWVudCBpcyBhdHRhY2hlZCBpcyBkZWZpbmVkIGJ5IHRoZVxuICAgKiBgZGlzcGxheU1pbmltYXBPbkxlZnRgIHNldHRpbmcuXG4gICAqXG4gICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBbcGFyZW50XSB0aGUgRE9NIG5vZGUgd2hlcmUgYXR0YWNoaW5nIHRoZSBtaW5pbWFwXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50XG4gICAqL1xuICBhdHRhY2ggKHBhcmVudCkge1xuICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHJldHVybiB9XG4gICAgKHBhcmVudCB8fCB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50Um9vdCgpKS5hcHBlbmRDaGlsZCh0aGlzKVxuICB9XG5cbiAgLyoqXG4gICAqIERldGFjaGVzIHRoZSBNaW5pbWFwRWxlbWVudCBmcm9tIHRoZSBET00uXG4gICAqL1xuICBkZXRhY2ggKCkge1xuICAgIGlmICghdGhpcy5hdHRhY2hlZCB8fCB0aGlzLnBhcmVudE5vZGUgPT0gbnVsbCkgeyByZXR1cm4gfVxuICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKVxuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIG1pbmltYXAgbGVmdC9yaWdodCBwb3NpdGlvbiBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgdGhlXG4gICAqIGBkaXNwbGF5TWluaW1hcE9uTGVmdGAgc2V0dGluZy5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICB1cGRhdGVNaW5pbWFwRmxleFBvc2l0aW9uICgpIHtcbiAgICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ2xlZnQnLCB0aGlzLmRpc3BsYXlNaW5pbWFwT25MZWZ0KVxuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoaXMgTWluaW1hcEVsZW1lbnRcbiAgICovXG4gIGRlc3Ryb3kgKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB0aGlzLmRldGFjaCgpXG4gICAgdGhpcy5taW5pbWFwID0gbnVsbFxuICB9XG5cbiAgLy8gICAgICMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjICMjIyMjIyMjICMjIyMjIyMjICMjICAgICMjICMjIyMjIyMjXG4gIC8vICAgICMjICAgICMjICMjICAgICAjIyAjIyMgICAjIyAgICAjIyAgICAjIyAgICAgICAjIyMgICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMjIyAgIyMgICAgIyMgICAgIyMgICAgICAgIyMjIyAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICAgIyMgICAgICMjICMjICMjICMjICAgICMjICAgICMjIyMjIyAgICMjICMjICMjICAgICMjXG4gIC8vICAgICMjICAgICAgICMjICAgICAjIyAjIyAgIyMjIyAgICAjIyAgICAjIyAgICAgICAjIyAgIyMjIyAgICAjI1xuICAvLyAgICAjIyAgICAjIyAjIyAgICAgIyMgIyMgICAjIyMgICAgIyMgICAgIyMgICAgICAgIyMgICAjIyMgICAgIyNcbiAgLy8gICAgICMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjICAgICMjICAgICMjIyMjIyMjICMjICAgICMjICAgICMjXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgdGhlIGNvbnRlbnQgb2YgdGhlIE1pbmltYXBFbGVtZW50IGFuZCBhdHRhY2hlcyB0aGUgbW91c2UgY29udHJvbFxuICAgKiBldmVudCBsaXN0ZW5lcnMuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZUNvbnRlbnQgKCkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZUNhbnZhcygpXG5cbiAgICB0aGlzLnNoYWRvd1Jvb3QgPSB0aGlzLmNyZWF0ZVNoYWRvd1Jvb3QoKVxuICAgIHRoaXMuYXR0YWNoQ2FudmFzZXModGhpcy5zaGFkb3dSb290KVxuXG4gICAgdGhpcy5jcmVhdGVWaXNpYmxlQXJlYSgpXG4gICAgdGhpcy5jcmVhdGVDb250cm9scygpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuc3Vic2NyaWJlVG8odGhpcywge1xuICAgICAgJ21vdXNld2hlZWwnOiAoZSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuc3RhbmRBbG9uZSkge1xuICAgICAgICAgIHRoaXMucmVsYXlNb3VzZXdoZWVsRXZlbnQoZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnN1YnNjcmliZVRvKHRoaXMuZ2V0RnJvbnRDYW52YXMoKSwge1xuICAgICAgJ21vdXNlZG93bic6IChlKSA9PiB7IHRoaXMuY2FudmFzUHJlc3NlZCh0aGlzLmV4dHJhY3RNb3VzZUV2ZW50RGF0YShlKSkgfSxcbiAgICAgICd0b3VjaHN0YXJ0JzogKGUpID0+IHsgdGhpcy5jYW52YXNQcmVzc2VkKHRoaXMuZXh0cmFjdFRvdWNoRXZlbnREYXRhKGUpKSB9XG4gICAgfSkpXG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIHZpc2libGUgYXJlYSBkaXYuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgY3JlYXRlVmlzaWJsZUFyZWEgKCkge1xuICAgIGlmICh0aGlzLnZpc2libGVBcmVhKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLnZpc2libGVBcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLnZpc2libGVBcmVhLmNsYXNzTGlzdC5hZGQoJ21pbmltYXAtdmlzaWJsZS1hcmVhJylcbiAgICB0aGlzLnNoYWRvd1Jvb3QuYXBwZW5kQ2hpbGQodGhpcy52aXNpYmxlQXJlYSlcbiAgICB0aGlzLnZpc2libGVBcmVhU3Vic2NyaXB0aW9uID0gdGhpcy5zdWJzY3JpYmVUbyh0aGlzLnZpc2libGVBcmVhLCB7XG4gICAgICAnbW91c2Vkb3duJzogKGUpID0+IHsgdGhpcy5zdGFydERyYWcodGhpcy5leHRyYWN0TW91c2VFdmVudERhdGEoZSkpIH0sXG4gICAgICAndG91Y2hzdGFydCc6IChlKSA9PiB7IHRoaXMuc3RhcnREcmFnKHRoaXMuZXh0cmFjdFRvdWNoRXZlbnREYXRhKGUpKSB9XG4gICAgfSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy52aXNpYmxlQXJlYVN1YnNjcmlwdGlvbilcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSB2aXNpYmxlIGFyZWEgZGl2LlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHJlbW92ZVZpc2libGVBcmVhICgpIHtcbiAgICBpZiAoIXRoaXMudmlzaWJsZUFyZWEpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5yZW1vdmUodGhpcy52aXNpYmxlQXJlYVN1YnNjcmlwdGlvbilcbiAgICB0aGlzLnZpc2libGVBcmVhU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgIHRoaXMuc2hhZG93Um9vdC5yZW1vdmVDaGlsZCh0aGlzLnZpc2libGVBcmVhKVxuICAgIGRlbGV0ZSB0aGlzLnZpc2libGVBcmVhXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyB0aGUgY29udHJvbHMgY29udGFpbmVyIGRpdi5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjcmVhdGVDb250cm9scyAoKSB7XG4gICAgaWYgKHRoaXMuY29udHJvbHMgfHwgdGhpcy5zdGFuZEFsb25lKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLmNvbnRyb2xzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLmNvbnRyb2xzLmNsYXNzTGlzdC5hZGQoJ21pbmltYXAtY29udHJvbHMnKVxuICAgIHRoaXMuc2hhZG93Um9vdC5hcHBlbmRDaGlsZCh0aGlzLmNvbnRyb2xzKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIGNvbnRyb2xzIGNvbnRhaW5lciBkaXYuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgcmVtb3ZlQ29udHJvbHMgKCkge1xuICAgIGlmICghdGhpcy5jb250cm9scykgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5zaGFkb3dSb290LnJlbW92ZUNoaWxkKHRoaXMuY29udHJvbHMpXG4gICAgZGVsZXRlIHRoaXMuY29udHJvbHNcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgc2Nyb2xsIGluZGljYXRvciBkaXYgd2hlbiB0aGUgYG1pbmltYXBTY3JvbGxJbmRpY2F0b3JgXG4gICAqIHNldHRpbmdzIGlzIGVuYWJsZWQuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZVNjcm9sbEluZGljYXRvciAoKSB7XG4gICAgaWYgKHRoaXMuc2Nyb2xsSW5kaWNhdG9yIHx8IHRoaXMuc3RhbmRBbG9uZSkgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5zY3JvbGxJbmRpY2F0b3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMuc2Nyb2xsSW5kaWNhdG9yLmNsYXNzTGlzdC5hZGQoJ21pbmltYXAtc2Nyb2xsLWluZGljYXRvcicpXG4gICAgdGhpcy5jb250cm9scy5hcHBlbmRDaGlsZCh0aGlzLnNjcm9sbEluZGljYXRvcilcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlcyB0aGUgc2Nyb2xsIGluZGljYXRvciBkaXYgd2hlbiB0aGUgYG1pbmltYXBTY3JvbGxJbmRpY2F0b3JgXG4gICAqIHNldHRpbmdzIGlzIGRpc2FibGVkLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRpc3Bvc2VTY3JvbGxJbmRpY2F0b3IgKCkge1xuICAgIGlmICghdGhpcy5zY3JvbGxJbmRpY2F0b3IpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuY29udHJvbHMucmVtb3ZlQ2hpbGQodGhpcy5zY3JvbGxJbmRpY2F0b3IpXG4gICAgZGVsZXRlIHRoaXMuc2Nyb2xsSW5kaWNhdG9yXG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIHF1aWNrIHNldHRpbmdzIG9wZW5lbmVyIGRpdiB3aGVuIHRoZVxuICAgKiBgZGlzcGxheVBsdWdpbnNDb250cm9sc2Agc2V0dGluZyBpcyBlbmFibGVkLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGluaXRpYWxpemVPcGVuUXVpY2tTZXR0aW5ncyAoKSB7XG4gICAgaWYgKHRoaXMub3BlblF1aWNrU2V0dGluZ3MgfHwgdGhpcy5zdGFuZEFsb25lKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLm9wZW5RdWlja1NldHRpbmdzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLm9wZW5RdWlja1NldHRpbmdzLmNsYXNzTGlzdC5hZGQoJ29wZW4tbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgdGhpcy5jb250cm9scy5hcHBlbmRDaGlsZCh0aGlzLm9wZW5RdWlja1NldHRpbmdzKVxuXG4gICAgdGhpcy5vcGVuUXVpY2tTZXR0aW5nU3Vic2NyaXB0aW9uID0gdGhpcy5zdWJzY3JpYmVUbyh0aGlzLm9wZW5RdWlja1NldHRpbmdzLCB7XG4gICAgICAnbW91c2Vkb3duJzogKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgICBpZiAoKHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQgIT0gbnVsbCkpIHtcbiAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LmRlc3Ryb3koKVxuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc1N1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50ID0gbmV3IE1pbmltYXBRdWlja1NldHRpbmdzRWxlbWVudCgpXG4gICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzRWxlbWVudC5zZXRNb2RlbCh0aGlzKVxuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc1N1YnNjcmlwdGlvbiA9IHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQgPSBudWxsXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGxldCB7dG9wLCBsZWZ0LCByaWdodH0gPSB0aGlzLmdldEZyb250Q2FudmFzKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LnN0eWxlLnRvcCA9IHRvcCArICdweCdcbiAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LmF0dGFjaCgpXG5cbiAgICAgICAgICBpZiAodGhpcy5kaXNwbGF5TWluaW1hcE9uTGVmdCkge1xuICAgICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzRWxlbWVudC5zdHlsZS5sZWZ0ID0gKHJpZ2h0KSArICdweCdcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzRWxlbWVudC5zdHlsZS5sZWZ0ID0gKGxlZnQgLSB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LmNsaWVudFdpZHRoKSArICdweCdcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2VzIHRoZSBxdWljayBzZXR0aW5ncyBvcGVuZW5lciBkaXYgd2hlbiB0aGUgYGRpc3BsYXlQbHVnaW5zQ29udHJvbHNgXG4gICAqIHNldHRpbmcgaXMgZGlzYWJsZWQuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZGlzcG9zZU9wZW5RdWlja1NldHRpbmdzICgpIHtcbiAgICBpZiAoIXRoaXMub3BlblF1aWNrU2V0dGluZ3MpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuY29udHJvbHMucmVtb3ZlQ2hpbGQodGhpcy5vcGVuUXVpY2tTZXR0aW5ncylcbiAgICB0aGlzLm9wZW5RdWlja1NldHRpbmdTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgZGVsZXRlIHRoaXMub3BlblF1aWNrU2V0dGluZ3NcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB0YXJnZXQgYFRleHRFZGl0b3JgIG9mIHRoZSBNaW5pbWFwLlxuICAgKlxuICAgKiBAcmV0dXJuIHtUZXh0RWRpdG9yfSB0aGUgbWluaW1hcCdzIHRleHQgZWRpdG9yXG4gICAqL1xuICBnZXRUZXh0RWRpdG9yICgpIHsgcmV0dXJuIHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yKCkgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBgVGV4dEVkaXRvckVsZW1lbnRgIGZvciB0aGUgTWluaW1hcCdzIGBUZXh0RWRpdG9yYC5cbiAgICpcbiAgICogQHJldHVybiB7VGV4dEVkaXRvckVsZW1lbnR9IHRoZSBtaW5pbWFwJ3MgdGV4dCBlZGl0b3IgZWxlbWVudFxuICAgKi9cbiAgZ2V0VGV4dEVkaXRvckVsZW1lbnQgKCkge1xuICAgIGlmICh0aGlzLmVkaXRvckVsZW1lbnQpIHsgcmV0dXJuIHRoaXMuZWRpdG9yRWxlbWVudCB9XG5cbiAgICB0aGlzLmVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5nZXRUZXh0RWRpdG9yKCkpXG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yRWxlbWVudFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJvb3Qgb2YgdGhlIGBUZXh0RWRpdG9yRWxlbWVudGAgY29udGVudC5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgaXMgbW9zdGx5IHVzZWQgdG8gZW5zdXJlIGNvbXBhdGliaWxpdHkgd2l0aCB0aGUgYHNoYWRvd0RvbWBcbiAgICogc2V0dGluZy5cbiAgICpcbiAgICogQHJldHVybiB7SFRNTEVsZW1lbnR9IHRoZSByb290IG9mIHRoZSBgVGV4dEVkaXRvckVsZW1lbnRgIGNvbnRlbnRcbiAgICovXG4gIGdldFRleHRFZGl0b3JFbGVtZW50Um9vdCAoKSB7XG4gICAgbGV0IGVkaXRvckVsZW1lbnQgPSB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50KClcblxuICAgIGlmIChlZGl0b3JFbGVtZW50LnNoYWRvd1Jvb3QpIHtcbiAgICAgIHJldHVybiBlZGl0b3JFbGVtZW50LnNoYWRvd1Jvb3RcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGVkaXRvckVsZW1lbnRcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcm9vdCB3aGVyZSB0byBpbmplY3QgdGhlIGR1bW15IG5vZGUgdXNlZCB0byByZWFkIERPTSBzdHlsZXMuXG4gICAqXG4gICAqIEBwYXJhbSAge2Jvb2xlYW59IHNoYWRvd1Jvb3Qgd2hldGhlciB0byB1c2UgdGhlIHRleHQgZWRpdG9yIHNoYWRvdyBET01cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvciBub3RcbiAgICogQHJldHVybiB7SFRNTEVsZW1lbnR9IHRoZSByb290IG5vZGUgd2hlcmUgYXBwZW5kaW5nIHRoZSBkdW1teSBub2RlXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZ2V0RHVtbXlET01Sb290IChzaGFkb3dSb290KSB7XG4gICAgaWYgKHNoYWRvd1Jvb3QpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50Um9vdCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50KClcbiAgICB9XG4gIH1cblxuICAvLyAgICAjIyAgICAgIyMgICMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMjIyAjI1xuICAvLyAgICAjIyMgICAjIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgICAjI1xuICAvLyAgICAjIyMjICMjIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgICAjI1xuICAvLyAgICAjIyAjIyMgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyMjIyMgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMjIyAjIyMjIyMjI1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBNaW5pbWFwIGZvciB3aGljaCB0aGlzIE1pbmltYXBFbGVtZW50IHdhcyBjcmVhdGVkLlxuICAgKlxuICAgKiBAcmV0dXJuIHtNaW5pbWFwfSB0aGlzIGVsZW1lbnQncyBNaW5pbWFwXG4gICAqL1xuICBnZXRNb2RlbCAoKSB7IHJldHVybiB0aGlzLm1pbmltYXAgfVxuXG4gIC8qKlxuICAgKiBEZWZpbmVzIHRoZSBNaW5pbWFwIG1vZGVsIGZvciB0aGlzIE1pbmltYXBFbGVtZW50IGluc3RhbmNlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtNaW5pbWFwfSBtaW5pbWFwIHRoZSBNaW5pbWFwIG1vZGVsIGZvciB0aGlzIGluc3RhbmNlLlxuICAgKiBAcmV0dXJuIHtNaW5pbWFwfSB0aGlzIGVsZW1lbnQncyBNaW5pbWFwXG4gICAqL1xuICBzZXRNb2RlbCAobWluaW1hcCkge1xuICAgIHRoaXMubWluaW1hcCA9IG1pbmltYXBcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMubWluaW1hcC5vbkRpZENoYW5nZVNjcm9sbFRvcCgoKSA9PiB7XG4gICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5taW5pbWFwLm9uRGlkQ2hhbmdlU2Nyb2xsTGVmdCgoKSA9PiB7XG4gICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5taW5pbWFwLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICB0aGlzLmRlc3Ryb3koKVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5taW5pbWFwLm9uRGlkQ2hhbmdlQ29uZmlnKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHJldHVybiB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKSB9XG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMubWluaW1hcC5vbkRpZENoYW5nZVN0YW5kQWxvbmUoKCkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGFuZEFsb25lKHRoaXMubWluaW1hcC5pc1N0YW5kQWxvbmUoKSlcbiAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMubWluaW1hcC5vbkRpZENoYW5nZSgoY2hhbmdlKSA9PiB7XG4gICAgICB0aGlzLnBlbmRpbmdDaGFuZ2VzLnB1c2goY2hhbmdlKVxuICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5taW5pbWFwLm9uRGlkQ2hhbmdlRGVjb3JhdGlvblJhbmdlKChjaGFuZ2UpID0+IHtcbiAgICAgIGNvbnN0IHt0eXBlfSA9IGNoYW5nZVxuICAgICAgaWYgKHR5cGUgPT09ICdsaW5lJyB8fCB0eXBlID09PSAnaGlnaGxpZ2h0LXVuZGVyJyB8fCB0eXBlID09PSAnYmFja2dyb3VuZC1jdXN0b20nKSB7XG4gICAgICAgIHRoaXMucGVuZGluZ0JhY2tEZWNvcmF0aW9uQ2hhbmdlcy5wdXNoKGNoYW5nZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucGVuZGluZ0Zyb250RGVjb3JhdGlvbkNoYW5nZXMucHVzaChjaGFuZ2UpXG4gICAgICB9XG4gICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChNYWluLm9uRGlkQ2hhbmdlUGx1Z2luT3JkZXIoKCkgPT4ge1xuICAgICAgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKClcbiAgICB9KSlcblxuICAgIHRoaXMuc2V0U3RhbmRBbG9uZSh0aGlzLm1pbmltYXAuaXNTdGFuZEFsb25lKCkpXG5cbiAgICBpZiAodGhpcy53aWR0aCAhPSBudWxsICYmIHRoaXMuaGVpZ2h0ICE9IG51bGwpIHtcbiAgICAgIHRoaXMubWluaW1hcC5zZXRTY3JlZW5IZWlnaHRBbmRXaWR0aCh0aGlzLmhlaWdodCwgdGhpcy53aWR0aClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5taW5pbWFwXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgc3RhbmQtYWxvbmUgbW9kZSBmb3IgdGhpcyBNaW5pbWFwRWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufSBzdGFuZEFsb25lIHRoZSBuZXcgbW9kZSBmb3IgdGhpcyBNaW5pbWFwRWxlbWVudFxuICAgKi9cbiAgc2V0U3RhbmRBbG9uZSAoc3RhbmRBbG9uZSkge1xuICAgIHRoaXMuc3RhbmRBbG9uZSA9IHN0YW5kQWxvbmVcblxuICAgIGlmICh0aGlzLnN0YW5kQWxvbmUpIHtcbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdzdGFuZC1hbG9uZScsIHRydWUpXG4gICAgICB0aGlzLmRpc3Bvc2VTY3JvbGxJbmRpY2F0b3IoKVxuICAgICAgdGhpcy5kaXNwb3NlT3BlblF1aWNrU2V0dGluZ3MoKVxuICAgICAgdGhpcy5yZW1vdmVDb250cm9scygpXG4gICAgICB0aGlzLnJlbW92ZVZpc2libGVBcmVhKClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoJ3N0YW5kLWFsb25lJylcbiAgICAgIHRoaXMuY3JlYXRlVmlzaWJsZUFyZWEoKVxuICAgICAgdGhpcy5jcmVhdGVDb250cm9scygpXG4gICAgICBpZiAodGhpcy5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yKSB7IHRoaXMuaW5pdGlhbGl6ZVNjcm9sbEluZGljYXRvcigpIH1cbiAgICAgIGlmICh0aGlzLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMpIHsgdGhpcy5pbml0aWFsaXplT3BlblF1aWNrU2V0dGluZ3MoKSB9XG4gICAgfVxuICB9XG5cbiAgLy8gICAgIyMgICAgICMjICMjIyMjIyMjICAjIyMjIyMjIyAgICAgIyMjICAgICMjIyMjIyMjICMjIyMjIyMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICAgIyMgIyMgICAgICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAgIyMgICAjIyAgICAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjIyMjIyMjICAjIyAgICAgIyMgIyMgICAgICMjICAgICMjICAgICMjIyMjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgICMjICAgICAjIyAjIyMjIyMjIyMgICAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAgICAjIyAgICAgIyMgIyMgICAgICMjICAgICMjICAgICMjXG4gIC8vICAgICAjIyMjIyMjICAjIyAgICAgICAgIyMjIyMjIyMgICMjICAgICAjIyAgICAjIyAgICAjIyMjIyMjI1xuXG4gIC8qKlxuICAgKiBSZXF1ZXN0cyBhbiB1cGRhdGUgdG8gYmUgcGVyZm9ybWVkIG9uIHRoZSBuZXh0IGZyYW1lLlxuICAgKi9cbiAgcmVxdWVzdFVwZGF0ZSAoKSB7XG4gICAgaWYgKHRoaXMuZnJhbWVSZXF1ZXN0ZWQpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuZnJhbWVSZXF1ZXN0ZWQgPSB0cnVlXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIHRoaXMudXBkYXRlKClcbiAgICAgIHRoaXMuZnJhbWVSZXF1ZXN0ZWQgPSBmYWxzZVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdHMgYW4gdXBkYXRlIHRvIGJlIHBlcmZvcm1lZCBvbiB0aGUgbmV4dCBmcmFtZSB0aGF0IHdpbGwgY29tcGxldGVseVxuICAgKiByZWRyYXcgdGhlIG1pbmltYXAuXG4gICAqL1xuICByZXF1ZXN0Rm9yY2VkVXBkYXRlICgpIHtcbiAgICB0aGlzLm9mZnNjcmVlbkZpcnN0Um93ID0gbnVsbFxuICAgIHRoaXMub2Zmc2NyZWVuTGFzdFJvdyA9IG51bGxcbiAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKVxuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIHRoZSBhY3R1YWwgTWluaW1hcEVsZW1lbnQgdXBkYXRlLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZSAoKSB7XG4gICAgaWYgKCEodGhpcy5hdHRhY2hlZCAmJiB0aGlzLmlzVmlzaWJsZSgpICYmIHRoaXMubWluaW1hcCkpIHsgcmV0dXJuIH1cbiAgICBsZXQgbWluaW1hcCA9IHRoaXMubWluaW1hcFxuICAgIG1pbmltYXAuZW5hYmxlQ2FjaGUoKVxuICAgIGxldCBjYW52YXMgPSB0aGlzLmdldEZyb250Q2FudmFzKClcblxuICAgIGNvbnN0IGRldmljZVBpeGVsUmF0aW8gPSB0aGlzLm1pbmltYXAuZ2V0RGV2aWNlUGl4ZWxSYXRpbygpXG4gICAgbGV0IHZpc2libGVBcmVhTGVmdCA9IG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZFNjcm9sbExlZnQoKVxuICAgIGxldCB2aXNpYmxlQXJlYVRvcCA9IG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZFNjcm9sbFRvcCgpIC0gbWluaW1hcC5nZXRTY3JvbGxUb3AoKVxuICAgIGxldCB2aXNpYmxlV2lkdGggPSBNYXRoLm1pbihjYW52YXMud2lkdGggLyBkZXZpY2VQaXhlbFJhdGlvLCB0aGlzLndpZHRoKVxuXG4gICAgaWYgKHRoaXMuYWRqdXN0VG9Tb2Z0V3JhcCAmJiB0aGlzLmZsZXhCYXNpcykge1xuICAgICAgdGhpcy5zdHlsZS5mbGV4QmFzaXMgPSB0aGlzLmZsZXhCYXNpcyArICdweCdcbiAgICAgIHRoaXMuc3R5bGUud2lkdGggPSB0aGlzLmZsZXhCYXNpcyArICdweCdcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdHlsZS5mbGV4QmFzaXMgPSBudWxsXG4gICAgICB0aGlzLnN0eWxlLndpZHRoID0gbnVsbFxuICAgIH1cblxuICAgIGlmIChTUEVDX01PREUpIHtcbiAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy52aXNpYmxlQXJlYSwge1xuICAgICAgICB3aWR0aDogdmlzaWJsZVdpZHRoICsgJ3B4JyxcbiAgICAgICAgaGVpZ2h0OiBtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRIZWlnaHQoKSArICdweCcsXG4gICAgICAgIHRvcDogdmlzaWJsZUFyZWFUb3AgKyAncHgnLFxuICAgICAgICBsZWZ0OiB2aXNpYmxlQXJlYUxlZnQgKyAncHgnXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMudmlzaWJsZUFyZWEsIHtcbiAgICAgICAgd2lkdGg6IHZpc2libGVXaWR0aCArICdweCcsXG4gICAgICAgIGhlaWdodDogbWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkSGVpZ2h0KCkgKyAncHgnLFxuICAgICAgICB0cmFuc2Zvcm06IHRoaXMubWFrZVRyYW5zbGF0ZSh2aXNpYmxlQXJlYUxlZnQsIHZpc2libGVBcmVhVG9wKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuY29udHJvbHMsIHt3aWR0aDogdmlzaWJsZVdpZHRoICsgJ3B4J30pXG5cbiAgICBsZXQgY2FudmFzVG9wID0gbWluaW1hcC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSAqIG1pbmltYXAuZ2V0TGluZUhlaWdodCgpIC0gbWluaW1hcC5nZXRTY3JvbGxUb3AoKVxuXG4gICAgbGV0IGNhbnZhc1RyYW5zZm9ybSA9IHRoaXMubWFrZVRyYW5zbGF0ZSgwLCBjYW52YXNUb3ApXG4gICAgaWYgKGRldmljZVBpeGVsUmF0aW8gIT09IDEpIHtcbiAgICAgIGNhbnZhc1RyYW5zZm9ybSArPSAnICcgKyB0aGlzLm1ha2VTY2FsZSgxIC8gZGV2aWNlUGl4ZWxSYXRpbylcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zbW9vdGhTY3JvbGxpbmcpIHtcbiAgICAgIGlmIChTUEVDX01PREUpIHtcbiAgICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLmJhY2tMYXllci5jYW52YXMsIHt0b3A6IGNhbnZhc1RvcCArICdweCd9KVxuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMudG9rZW5zTGF5ZXIuY2FudmFzLCB7dG9wOiBjYW52YXNUb3AgKyAncHgnfSlcbiAgICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLmZyb250TGF5ZXIuY2FudmFzLCB7dG9wOiBjYW52YXNUb3AgKyAncHgnfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy5iYWNrTGF5ZXIuY2FudmFzLCB7dHJhbnNmb3JtOiBjYW52YXNUcmFuc2Zvcm19KVxuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMudG9rZW5zTGF5ZXIuY2FudmFzLCB7dHJhbnNmb3JtOiBjYW52YXNUcmFuc2Zvcm19KVxuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuZnJvbnRMYXllci5jYW52YXMsIHt0cmFuc2Zvcm06IGNhbnZhc1RyYW5zZm9ybX0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubWluaW1hcFNjcm9sbEluZGljYXRvciAmJiBtaW5pbWFwLmNhblNjcm9sbCgpICYmICF0aGlzLnNjcm9sbEluZGljYXRvcikge1xuICAgICAgdGhpcy5pbml0aWFsaXplU2Nyb2xsSW5kaWNhdG9yKClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zY3JvbGxJbmRpY2F0b3IgIT0gbnVsbCkge1xuICAgICAgbGV0IG1pbmltYXBTY3JlZW5IZWlnaHQgPSBtaW5pbWFwLmdldFNjcmVlbkhlaWdodCgpXG4gICAgICBsZXQgaW5kaWNhdG9ySGVpZ2h0ID0gbWluaW1hcFNjcmVlbkhlaWdodCAqIChtaW5pbWFwU2NyZWVuSGVpZ2h0IC8gbWluaW1hcC5nZXRIZWlnaHQoKSlcbiAgICAgIGxldCBpbmRpY2F0b3JTY3JvbGwgPSAobWluaW1hcFNjcmVlbkhlaWdodCAtIGluZGljYXRvckhlaWdodCkgKiBtaW5pbWFwLmdldFNjcm9sbFJhdGlvKClcblxuICAgICAgaWYgKFNQRUNfTU9ERSkge1xuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuc2Nyb2xsSW5kaWNhdG9yLCB7XG4gICAgICAgICAgaGVpZ2h0OiBpbmRpY2F0b3JIZWlnaHQgKyAncHgnLFxuICAgICAgICAgIHRvcDogaW5kaWNhdG9yU2Nyb2xsICsgJ3B4J1xuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLnNjcm9sbEluZGljYXRvciwge1xuICAgICAgICAgIGhlaWdodDogaW5kaWNhdG9ySGVpZ2h0ICsgJ3B4JyxcbiAgICAgICAgICB0cmFuc2Zvcm06IHRoaXMubWFrZVRyYW5zbGF0ZSgwLCBpbmRpY2F0b3JTY3JvbGwpXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGlmICghbWluaW1hcC5jYW5TY3JvbGwoKSkgeyB0aGlzLmRpc3Bvc2VTY3JvbGxJbmRpY2F0b3IoKSB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYWJzb2x1dGVNb2RlICYmIHRoaXMuYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0KSB7IHRoaXMudXBkYXRlQ2FudmFzZXNTaXplKCkgfVxuXG4gICAgdGhpcy51cGRhdGVDYW52YXMoKVxuICAgIG1pbmltYXAuY2xlYXJDYWNoZSgpXG4gIH1cblxuICAvKipcbiAgICogRGVmaW5lcyB3aGV0aGVyIHRvIHJlbmRlciB0aGUgY29kZSBoaWdobGlnaHRzIG9yIG5vdC5cbiAgICpcbiAgICogQHBhcmFtIHtCb29sZWFufSBkaXNwbGF5Q29kZUhpZ2hsaWdodHMgd2hldGhlciB0byByZW5kZXIgdGhlIGNvZGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0cyBvciBub3RcbiAgICovXG4gIHNldERpc3BsYXlDb2RlSGlnaGxpZ2h0cyAoZGlzcGxheUNvZGVIaWdobGlnaHRzKSB7XG4gICAgdGhpcy5kaXNwbGF5Q29kZUhpZ2hsaWdodHMgPSBkaXNwbGF5Q29kZUhpZ2hsaWdodHNcbiAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKSB9XG4gIH1cblxuICAvKipcbiAgICogUG9sbGluZyBjYWxsYmFjayB1c2VkIHRvIGRldGVjdCB2aXNpYmlsaXR5IGFuZCBzaXplIGNoYW5nZXMuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgcG9sbERPTSAoKSB7XG4gICAgbGV0IHZpc2liaWxpdHlDaGFuZ2VkID0gdGhpcy5jaGVja0ZvclZpc2liaWxpdHlDaGFuZ2UoKVxuICAgIGlmICh0aGlzLmlzVmlzaWJsZSgpKSB7XG4gICAgICBpZiAoIXRoaXMud2FzVmlzaWJsZSkgeyB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKSB9XG5cbiAgICAgIHRoaXMubWVhc3VyZUhlaWdodEFuZFdpZHRoKHZpc2liaWxpdHlDaGFuZ2VkLCBmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCBjaGVja3MgZm9yIHZpc2liaWxpdHkgY2hhbmdlcyBpbiB0aGUgTWluaW1hcEVsZW1lbnQuXG4gICAqIFRoZSBtZXRob2QgcmV0dXJucyBgdHJ1ZWAgd2hlbiB0aGUgdmlzaWJpbGl0eSBjaGFuZ2VkIGZyb20gdmlzaWJsZSB0b1xuICAgKiBoaWRkZW4gb3IgZnJvbSBoaWRkZW4gdG8gdmlzaWJsZS5cbiAgICpcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gd2hldGhlciB0aGUgdmlzaWJpbGl0eSBjaGFuZ2VkIG9yIG5vdCBzaW5jZSB0aGUgbGFzdCBjYWxsXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgY2hlY2tGb3JWaXNpYmlsaXR5Q2hhbmdlICgpIHtcbiAgICBpZiAodGhpcy5pc1Zpc2libGUoKSkge1xuICAgICAgaWYgKHRoaXMud2FzVmlzaWJsZSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMud2FzVmlzaWJsZSA9IHRydWVcbiAgICAgICAgcmV0dXJuIHRoaXMud2FzVmlzaWJsZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy53YXNWaXNpYmxlKSB7XG4gICAgICAgIHRoaXMud2FzVmlzaWJsZSA9IGZhbHNlXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLndhc1Zpc2libGUgPSBmYWxzZVxuICAgICAgICByZXR1cm4gdGhpcy53YXNWaXNpYmxlXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHVzZWQgdG8gbWVhc3VyZSB0aGUgc2l6ZSBvZiB0aGUgTWluaW1hcEVsZW1lbnQgYW5kIHVwZGF0ZSBpbnRlcm5hbFxuICAgKiBjb21wb25lbnRzIGJhc2VkIG9uIHRoZSBuZXcgc2l6ZS5cbiAgICpcbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gdmlzaWJpbGl0eUNoYW5nZWQgZGlkIHRoZSB2aXNpYmlsaXR5IGNoYW5nZWQgc2luY2UgbGFzdFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZWFzdXJlbWVudFxuICAgKiBAcGFyYW0gIHtbdHlwZV19IFtmb3JjZVVwZGF0ZT10cnVlXSBmb3JjZXMgdGhlIHVwZGF0ZSBldmVuIHdoZW4gbm8gY2hhbmdlc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3ZXJlIGRldGVjdGVkXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgbWVhc3VyZUhlaWdodEFuZFdpZHRoICh2aXNpYmlsaXR5Q2hhbmdlZCwgZm9yY2VVcGRhdGUgPSB0cnVlKSB7XG4gICAgaWYgKCF0aGlzLm1pbmltYXApIHsgcmV0dXJuIH1cblxuICAgIGxldCB3YXNSZXNpemVkID0gdGhpcy53aWR0aCAhPT0gdGhpcy5jbGllbnRXaWR0aCB8fCB0aGlzLmhlaWdodCAhPT0gdGhpcy5jbGllbnRIZWlnaHRcblxuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5jbGllbnRIZWlnaHRcbiAgICB0aGlzLndpZHRoID0gdGhpcy5jbGllbnRXaWR0aFxuICAgIGxldCBjYW52YXNXaWR0aCA9IHRoaXMud2lkdGhcblxuICAgIGlmICgodGhpcy5taW5pbWFwICE9IG51bGwpKSB7XG4gICAgICB0aGlzLm1pbmltYXAuc2V0U2NyZWVuSGVpZ2h0QW5kV2lkdGgodGhpcy5oZWlnaHQsIHRoaXMud2lkdGgpXG4gICAgfVxuXG4gICAgaWYgKHdhc1Jlc2l6ZWQgfHwgdmlzaWJpbGl0eUNoYW5nZWQgfHwgZm9yY2VVcGRhdGUpIHtcbiAgICAgIHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpXG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmlzVmlzaWJsZSgpKSB7IHJldHVybiB9XG5cbiAgICBpZiAod2FzUmVzaXplZCB8fCBmb3JjZVVwZGF0ZSkge1xuICAgICAgaWYgKHRoaXMuYWRqdXN0VG9Tb2Z0V3JhcCkge1xuICAgICAgICBsZXQgbGluZUxlbmd0aCA9IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnByZWZlcnJlZExpbmVMZW5ndGgnKVxuICAgICAgICBsZXQgc29mdFdyYXAgPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zb2Z0V3JhcCcpXG4gICAgICAgIGxldCBzb2Z0V3JhcEF0UHJlZmVycmVkTGluZUxlbmd0aCA9IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnNvZnRXcmFwQXRQcmVmZXJyZWRMaW5lTGVuZ3RoJylcbiAgICAgICAgbGV0IHdpZHRoID0gbGluZUxlbmd0aCAqIHRoaXMubWluaW1hcC5nZXRDaGFyV2lkdGgoKVxuXG4gICAgICAgIGlmIChzb2Z0V3JhcCAmJiBzb2Z0V3JhcEF0UHJlZmVycmVkTGluZUxlbmd0aCAmJiBsaW5lTGVuZ3RoICYmIHdpZHRoIDw9IHRoaXMud2lkdGgpIHtcbiAgICAgICAgICB0aGlzLmZsZXhCYXNpcyA9IHdpZHRoXG4gICAgICAgICAgY2FudmFzV2lkdGggPSB3aWR0aFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLmZsZXhCYXNpc1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWxldGUgdGhpcy5mbGV4QmFzaXNcbiAgICAgIH1cblxuICAgICAgdGhpcy51cGRhdGVDYW52YXNlc1NpemUoY2FudmFzV2lkdGgpXG4gICAgfVxuICB9XG5cbiAgdXBkYXRlQ2FudmFzZXNTaXplIChjYW52YXNXaWR0aCA9IHRoaXMuZ2V0RnJvbnRDYW52YXMoKS53aWR0aCkge1xuICAgIGNvbnN0IGRldmljZVBpeGVsUmF0aW8gPSB0aGlzLm1pbmltYXAuZ2V0RGV2aWNlUGl4ZWxSYXRpbygpXG4gICAgY29uc3QgbWF4Q2FudmFzSGVpZ2h0ID0gdGhpcy5oZWlnaHQgKyB0aGlzLm1pbmltYXAuZ2V0TGluZUhlaWdodCgpXG4gICAgY29uc3QgbmV3SGVpZ2h0ID0gdGhpcy5hYnNvbHV0ZU1vZGUgJiYgdGhpcy5hZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQgPyBNYXRoLm1pbih0aGlzLm1pbmltYXAuZ2V0SGVpZ2h0KCksIG1heENhbnZhc0hlaWdodCkgOiBtYXhDYW52YXNIZWlnaHRcbiAgICBjb25zdCBjYW52YXMgPSB0aGlzLmdldEZyb250Q2FudmFzKClcbiAgICBpZiAoY2FudmFzV2lkdGggIT09IGNhbnZhcy53aWR0aCB8fCBuZXdIZWlnaHQgIT09IGNhbnZhcy5oZWlnaHQpIHtcbiAgICAgIHRoaXMuc2V0Q2FudmFzZXNTaXplKFxuICAgICAgICBjYW52YXNXaWR0aCAqIGRldmljZVBpeGVsUmF0aW8sXG4gICAgICAgIG5ld0hlaWdodCAqIGRldmljZVBpeGVsUmF0aW9cbiAgICAgIClcbiAgICAgIGlmICh0aGlzLmFic29sdXRlTW9kZSAmJiB0aGlzLmFkanVzdEFic29sdXRlTW9kZUhlaWdodCkge1xuICAgICAgICB0aGlzLm9mZnNjcmVlbkZpcnN0Um93ID0gbnVsbFxuICAgICAgICB0aGlzLm9mZnNjcmVlbkxhc3RSb3cgPSBudWxsXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gICAgIyMjIyMjIyMgIyMgICAgICMjICMjIyMjIyMjICMjICAgICMjICMjIyMjIyMjICAjIyMjIyNcbiAgLy8gICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICAgICMjIyAgICMjICAgICMjICAgICMjICAgICMjXG4gIC8vICAgICMjICAgICAgICMjICAgICAjIyAjIyAgICAgICAjIyMjICAjIyAgICAjIyAgICAjI1xuICAvLyAgICAjIyMjIyMgICAjIyAgICAgIyMgIyMjIyMjICAgIyMgIyMgIyMgICAgIyMgICAgICMjIyMjI1xuICAvLyAgICAjIyAgICAgICAgIyMgICAjIyAgIyMgICAgICAgIyMgICMjIyMgICAgIyMgICAgICAgICAgIyNcbiAgLy8gICAgIyMgICAgICAgICAjIyAjIyAgICMjICAgICAgICMjICAgIyMjICAgICMjICAgICMjICAgICMjXG4gIC8vICAgICMjIyMjIyMjICAgICMjIyAgICAjIyMjIyMjIyAjIyAgICAjIyAgICAjIyAgICAgIyMjIyMjXG5cbiAgLyoqXG4gICAqIEhlbHBlciBtZXRob2QgdG8gcmVnaXN0ZXIgY29uZmlnIG9ic2VydmVycy5cbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSBjb25maWdzPXt9IGFuIG9iamVjdCBtYXBwaW5nIHRoZSBjb25maWcgbmFtZSB0byBvYnNlcnZlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aXRoIHRoZSBmdW5jdGlvbiB0byBjYWxsIGJhY2sgd2hlbiBhIGNoYW5nZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2NjdXJzXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgb2JzZXJ2ZUNvbmZpZyAoY29uZmlncyA9IHt9KSB7XG4gICAgZm9yIChsZXQgY29uZmlnIGluIGNvbmZpZ3MpIHtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZShjb25maWcsIGNvbmZpZ3NbY29uZmlnXSkpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRyaWdnZXJlZCB3aGVuIHRoZSBtb3VzZSBpcyBwcmVzc2VkIG9uIHRoZSBNaW5pbWFwRWxlbWVudCBjYW52YXMuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0geSB0aGUgdmVydGljYWwgY29vcmRpbmF0ZSBvZiB0aGUgZXZlbnRcbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gaXNMZWZ0TW91c2Ugd2FzIHRoZSBsZWZ0IG1vdXNlIGJ1dHRvbiBwcmVzc2VkP1xuICAgKiBAcGFyYW0gIHtib29sZWFufSBpc01pZGRsZU1vdXNlIHdhcyB0aGUgbWlkZGxlIG1vdXNlIGJ1dHRvbiBwcmVzc2VkP1xuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGNhbnZhc1ByZXNzZWQgKHt5LCBpc0xlZnRNb3VzZSwgaXNNaWRkbGVNb3VzZX0pIHtcbiAgICBpZiAodGhpcy5taW5pbWFwLmlzU3RhbmRBbG9uZSgpKSB7IHJldHVybiB9XG4gICAgaWYgKGlzTGVmdE1vdXNlKSB7XG4gICAgICB0aGlzLmNhbnZhc0xlZnRNb3VzZVByZXNzZWQoeSlcbiAgICB9IGVsc2UgaWYgKGlzTWlkZGxlTW91c2UpIHtcbiAgICAgIHRoaXMuY2FudmFzTWlkZGxlTW91c2VQcmVzc2VkKHkpXG4gICAgICBsZXQge3RvcCwgaGVpZ2h0fSA9IHRoaXMudmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIHRoaXMuc3RhcnREcmFnKHt5OiB0b3AgKyBoZWlnaHQgLyAyLCBpc0xlZnRNb3VzZTogZmFsc2UsIGlzTWlkZGxlTW91c2U6IHRydWV9KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayB0cmlnZ2VyZWQgd2hlbiB0aGUgbW91c2UgbGVmdCBidXR0b24gaXMgcHJlc3NlZCBvbiB0aGVcbiAgICogTWluaW1hcEVsZW1lbnQgY2FudmFzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtNb3VzZUV2ZW50fSBlIHRoZSBtb3VzZSBldmVudCBvYmplY3RcbiAgICogQHBhcmFtICB7bnVtYmVyfSBlLnBhZ2VZIHRoZSBtb3VzZSB5IHBvc2l0aW9uIGluIHBhZ2VcbiAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGUudGFyZ2V0IHRoZSBzb3VyY2Ugb2YgdGhlIGV2ZW50XG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgY2FudmFzTGVmdE1vdXNlUHJlc3NlZCAoeSkge1xuICAgIGNvbnN0IGRlbHRhWSA9IHkgLSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcFxuICAgIGNvbnN0IHJvdyA9IE1hdGguZmxvb3IoZGVsdGFZIC8gdGhpcy5taW5pbWFwLmdldExpbmVIZWlnaHQoKSkgKyB0aGlzLm1pbmltYXAuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcblxuICAgIGNvbnN0IHRleHRFZGl0b3IgPSB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvcigpXG5cbiAgICBjb25zdCBzY3JvbGxUb3AgPSByb3cgKiB0ZXh0RWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpIC0gdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3JIZWlnaHQoKSAvIDJcblxuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuc2Nyb2xsQW5pbWF0aW9uJykpIHtcbiAgICAgIGNvbnN0IGR1cmF0aW9uID0gYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLnNjcm9sbEFuaW1hdGlvbkR1cmF0aW9uJylcbiAgICAgIGNvbnN0IGluZGVwZW5kZW50U2Nyb2xsID0gdGhpcy5taW5pbWFwLnNjcm9sbEluZGVwZW5kZW50bHlPbk1vdXNlV2hlZWwoKVxuXG4gICAgICBsZXQgZnJvbSA9IHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yU2Nyb2xsVG9wKClcbiAgICAgIGxldCB0byA9IHNjcm9sbFRvcFxuICAgICAgbGV0IHN0ZXBcblxuICAgICAgaWYgKGluZGVwZW5kZW50U2Nyb2xsKSB7XG4gICAgICAgIGNvbnN0IG1pbmltYXBGcm9tID0gdGhpcy5taW5pbWFwLmdldFNjcm9sbFRvcCgpXG4gICAgICAgIGNvbnN0IG1pbmltYXBUbyA9IE1hdGgubWluKDEsIHNjcm9sbFRvcCAvICh0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvck1heFNjcm9sbFRvcCgpIHx8IDEpKSAqIHRoaXMubWluaW1hcC5nZXRNYXhTY3JvbGxUb3AoKVxuXG4gICAgICAgIHN0ZXAgPSAobm93LCB0KSA9PiB7XG4gICAgICAgICAgdGhpcy5taW5pbWFwLnNldFRleHRFZGl0b3JTY3JvbGxUb3Aobm93LCB0cnVlKVxuICAgICAgICAgIHRoaXMubWluaW1hcC5zZXRTY3JvbGxUb3AobWluaW1hcEZyb20gKyAobWluaW1hcFRvIC0gbWluaW1hcEZyb20pICogdClcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFuaW1hdGUoe2Zyb206IGZyb20sIHRvOiB0bywgZHVyYXRpb246IGR1cmF0aW9uLCBzdGVwOiBzdGVwfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ZXAgPSAobm93KSA9PiB0aGlzLm1pbmltYXAuc2V0VGV4dEVkaXRvclNjcm9sbFRvcChub3cpXG4gICAgICAgIHRoaXMuYW5pbWF0ZSh7ZnJvbTogZnJvbSwgdG86IHRvLCBkdXJhdGlvbjogZHVyYXRpb24sIHN0ZXA6IHN0ZXB9KVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm1pbmltYXAuc2V0VGV4dEVkaXRvclNjcm9sbFRvcChzY3JvbGxUb3ApXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRyaWdnZXJlZCB3aGVuIHRoZSBtb3VzZSBtaWRkbGUgYnV0dG9uIGlzIHByZXNzZWQgb24gdGhlXG4gICAqIE1pbmltYXBFbGVtZW50IGNhbnZhcy5cbiAgICpcbiAgICogQHBhcmFtICB7TW91c2VFdmVudH0gZSB0aGUgbW91c2UgZXZlbnQgb2JqZWN0XG4gICAqIEBwYXJhbSAge251bWJlcn0gZS5wYWdlWSB0aGUgbW91c2UgeSBwb3NpdGlvbiBpbiBwYWdlXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgY2FudmFzTWlkZGxlTW91c2VQcmVzc2VkICh5KSB7XG4gICAgbGV0IHt0b3A6IG9mZnNldFRvcH0gPSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgbGV0IGRlbHRhWSA9IHkgLSBvZmZzZXRUb3AgLSB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpIC8gMlxuXG4gICAgbGV0IHJhdGlvID0gZGVsdGFZIC8gKHRoaXMubWluaW1hcC5nZXRWaXNpYmxlSGVpZ2h0KCkgLSB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpKVxuXG4gICAgdGhpcy5taW5pbWFwLnNldFRleHRFZGl0b3JTY3JvbGxUb3AocmF0aW8gKiB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvck1heFNjcm9sbFRvcCgpKVxuICB9XG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRoYXQgcmVsYXlzIHRoZSBgbW91c2V3aGVlbGAgZXZlbnRzIHJlY2VpdmVkIGJ5IHRoZSBNaW5pbWFwRWxlbWVudFxuICAgKiB0byB0aGUgYFRleHRFZGl0b3JFbGVtZW50YC5cbiAgICpcbiAgICogQHBhcmFtICB7TW91c2VFdmVudH0gZSB0aGUgbW91c2UgZXZlbnQgb2JqZWN0XG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgcmVsYXlNb3VzZXdoZWVsRXZlbnQgKGUpIHtcbiAgICBpZiAodGhpcy5taW5pbWFwLnNjcm9sbEluZGVwZW5kZW50bHlPbk1vdXNlV2hlZWwoKSkge1xuICAgICAgdGhpcy5taW5pbWFwLm9uTW91c2VXaGVlbChlKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50KCkuY29tcG9uZW50Lm9uTW91c2VXaGVlbChlKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB0aGF0IGV4dHJhY3RzIGRhdGEgZnJvbSBhIGBNb3VzZUV2ZW50YCB3aGljaCBjYW4gdGhlbiBiZSB1c2VkIHRvXG4gICAqIHByb2Nlc3MgY2xpY2tzIGFuZCBkcmFncyBvZiB0aGUgbWluaW1hcC5cbiAgICpcbiAgICogVXNlZCB0b2dldGhlciB3aXRoIGBleHRyYWN0VG91Y2hFdmVudERhdGFgIHRvIHByb3ZpZGUgYSB1bmlmaWVkIGludGVyZmFjZVxuICAgKiBmb3IgYE1vdXNlRXZlbnRgcyBhbmQgYFRvdWNoRXZlbnRgcy5cbiAgICpcbiAgICogQHBhcmFtICB7TW91c2VFdmVudH0gbW91c2VFdmVudCB0aGUgbW91c2UgZXZlbnQgb2JqZWN0XG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZXh0cmFjdE1vdXNlRXZlbnREYXRhIChtb3VzZUV2ZW50KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IG1vdXNlRXZlbnQucGFnZVgsXG4gICAgICB5OiBtb3VzZUV2ZW50LnBhZ2VZLFxuICAgICAgaXNMZWZ0TW91c2U6IG1vdXNlRXZlbnQud2hpY2ggPT09IDEsXG4gICAgICBpc01pZGRsZU1vdXNlOiBtb3VzZUV2ZW50LndoaWNoID09PSAyXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRoYXQgZXh0cmFjdHMgZGF0YSBmcm9tIGEgYFRvdWNoRXZlbnRgIHdoaWNoIGNhbiB0aGVuIGJlIHVzZWQgdG9cbiAgICogcHJvY2VzcyBjbGlja3MgYW5kIGRyYWdzIG9mIHRoZSBtaW5pbWFwLlxuICAgKlxuICAgKiBVc2VkIHRvZ2V0aGVyIHdpdGggYGV4dHJhY3RNb3VzZUV2ZW50RGF0YWAgdG8gcHJvdmlkZSBhIHVuaWZpZWQgaW50ZXJmYWNlXG4gICAqIGZvciBgTW91c2VFdmVudGBzIGFuZCBgVG91Y2hFdmVudGBzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtUb3VjaEV2ZW50fSB0b3VjaEV2ZW50IHRoZSB0b3VjaCBldmVudCBvYmplY3RcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBleHRyYWN0VG91Y2hFdmVudERhdGEgKHRvdWNoRXZlbnQpIHtcbiAgICAvLyBVc2UgdGhlIGZpcnN0IHRvdWNoIG9uIHRoZSB0YXJnZXQgYXJlYS4gT3RoZXIgdG91Y2hlcyB3aWxsIGJlIGlnbm9yZWQgaW5cbiAgICAvLyBjYXNlIG9mIG11bHRpLXRvdWNoLlxuICAgIGxldCB0b3VjaCA9IHRvdWNoRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF1cblxuICAgIHJldHVybiB7XG4gICAgICB4OiB0b3VjaC5wYWdlWCxcbiAgICAgIHk6IHRvdWNoLnBhZ2VZLFxuICAgICAgaXNMZWZ0TW91c2U6IHRydWUsIC8vIFRvdWNoIGlzIHRyZWF0ZWQgbGlrZSBhIGxlZnQgbW91c2UgYnV0dG9uIGNsaWNrXG4gICAgICBpc01pZGRsZU1vdXNlOiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmVzIHRvIGEgbWVkaWEgcXVlcnkgZm9yIGRldmljZSBwaXhlbCByYXRpbyBjaGFuZ2VzIGFuZCBmb3JjZXNcbiAgICogYSByZXBhaW50IHdoZW4gaXQgb2NjdXJzLlxuICAgKlxuICAgKiBAcmV0dXJuIHtEaXNwb3NhYmxlfSBhIGRpc3Bvc2FibGUgdG8gcmVtb3ZlIHRoZSBtZWRpYSBxdWVyeSBsaXN0ZW5lclxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHN1YnNjcmliZVRvTWVkaWFRdWVyeSAoKSB7XG4gICAgY29uc3QgcXVlcnkgPSAnc2NyZWVuIGFuZCAoLXdlYmtpdC1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAxLjUpJ1xuICAgIGNvbnN0IG1lZGlhUXVlcnkgPSB3aW5kb3cubWF0Y2hNZWRpYShxdWVyeSlcbiAgICBjb25zdCBtZWRpYUxpc3RlbmVyID0gKGUpID0+IHsgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKCkgfVxuICAgIG1lZGlhUXVlcnkuYWRkTGlzdGVuZXIobWVkaWFMaXN0ZW5lcilcblxuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBtZWRpYVF1ZXJ5LnJlbW92ZUxpc3RlbmVyKG1lZGlhTGlzdGVuZXIpXG4gICAgfSlcbiAgfVxuXG4gIC8vICAgICMjIyMjIyMjICAgICMjIyMgICAgIyMjIyMjIyNcbiAgLy8gICAgIyMgICAgICMjICAjIyAgIyMgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAgIyMjIyAgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAjIyMjICAgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAjIyAjIyAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgIyMgICAjIyAgICAgIyNcbiAgLy8gICAgIyMjIyMjIyMgICAjIyMjICAjIyAjIyMjIyMjI1xuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB0cmlnZ2VyZWQgd2hlbiB0aGUgbW91c2UgaXMgcHJlc3NlZCBvdmVyIHRoZSB2aXNpYmxlIGFyZWEgdGhhdFxuICAgKiBzdGFydHMgdGhlIGRyYWdnaW5nIGdlc3R1cmUuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0geSB0aGUgdmVydGljYWwgY29vcmRpbmF0ZSBvZiB0aGUgZXZlbnRcbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gaXNMZWZ0TW91c2Ugd2FzIHRoZSBsZWZ0IG1vdXNlIGJ1dHRvbiBwcmVzc2VkP1xuICAgKiBAcGFyYW0gIHtib29sZWFufSBpc01pZGRsZU1vdXNlIHdhcyB0aGUgbWlkZGxlIG1vdXNlIGJ1dHRvbiBwcmVzc2VkP1xuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHN0YXJ0RHJhZyAoe3ksIGlzTGVmdE1vdXNlLCBpc01pZGRsZU1vdXNlfSkge1xuICAgIGlmICghdGhpcy5taW5pbWFwKSB7IHJldHVybiB9XG4gICAgaWYgKCFpc0xlZnRNb3VzZSAmJiAhaXNNaWRkbGVNb3VzZSkgeyByZXR1cm4gfVxuXG4gICAgbGV0IHt0b3B9ID0gdGhpcy52aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGxldCB7dG9wOiBvZmZzZXRUb3B9ID0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuXG4gICAgbGV0IGRyYWdPZmZzZXQgPSB5IC0gdG9wXG5cbiAgICBsZXQgaW5pdGlhbCA9IHtkcmFnT2Zmc2V0LCBvZmZzZXRUb3B9XG5cbiAgICBsZXQgbW91c2Vtb3ZlSGFuZGxlciA9IChlKSA9PiB0aGlzLmRyYWcodGhpcy5leHRyYWN0TW91c2VFdmVudERhdGEoZSksIGluaXRpYWwpXG4gICAgbGV0IG1vdXNldXBIYW5kbGVyID0gKGUpID0+IHRoaXMuZW5kRHJhZygpXG5cbiAgICBsZXQgdG91Y2htb3ZlSGFuZGxlciA9IChlKSA9PiB0aGlzLmRyYWcodGhpcy5leHRyYWN0VG91Y2hFdmVudERhdGEoZSksIGluaXRpYWwpXG4gICAgbGV0IHRvdWNoZW5kSGFuZGxlciA9IChlKSA9PiB0aGlzLmVuZERyYWcoKVxuXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3VzZW1vdmVIYW5kbGVyKVxuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG1vdXNldXBIYW5kbGVyKVxuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIG1vdXNldXBIYW5kbGVyKVxuXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0b3VjaG1vdmVIYW5kbGVyKVxuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0b3VjaGVuZEhhbmRsZXIpXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRvdWNoZW5kSGFuZGxlcilcblxuICAgIHRoaXMuZHJhZ1N1YnNjcmlwdGlvbiA9IG5ldyBEaXNwb3NhYmxlKGZ1bmN0aW9uICgpIHtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW91c2Vtb3ZlSGFuZGxlcilcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG1vdXNldXBIYW5kbGVyKVxuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgbW91c2V1cEhhbmRsZXIpXG5cbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdG91Y2htb3ZlSGFuZGxlcilcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0b3VjaGVuZEhhbmRsZXIpXG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdG91Y2hlbmRIYW5kbGVyKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogVGhlIG1ldGhvZCBjYWxsZWQgZHVyaW5nIHRoZSBkcmFnIGdlc3R1cmUuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0geSB0aGUgdmVydGljYWwgY29vcmRpbmF0ZSBvZiB0aGUgZXZlbnRcbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gaXNMZWZ0TW91c2Ugd2FzIHRoZSBsZWZ0IG1vdXNlIGJ1dHRvbiBwcmVzc2VkP1xuICAgKiBAcGFyYW0gIHtib29sZWFufSBpc01pZGRsZU1vdXNlIHdhcyB0aGUgbWlkZGxlIG1vdXNlIGJ1dHRvbiBwcmVzc2VkP1xuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGluaXRpYWwuZHJhZ09mZnNldCB0aGUgbW91c2Ugb2Zmc2V0IHdpdGhpbiB0aGUgdmlzaWJsZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmVhXG4gICAqIEBwYXJhbSAge251bWJlcn0gaW5pdGlhbC5vZmZzZXRUb3AgdGhlIE1pbmltYXBFbGVtZW50IG9mZnNldCBhdCB0aGUgbW9tZW50XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2YgdGhlIGRyYWcgc3RhcnRcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBkcmFnICh7eSwgaXNMZWZ0TW91c2UsIGlzTWlkZGxlTW91c2V9LCBpbml0aWFsKSB7XG4gICAgaWYgKCF0aGlzLm1pbmltYXApIHsgcmV0dXJuIH1cbiAgICBpZiAoIWlzTGVmdE1vdXNlICYmICFpc01pZGRsZU1vdXNlKSB7IHJldHVybiB9XG4gICAgbGV0IGRlbHRhWSA9IHkgLSBpbml0aWFsLm9mZnNldFRvcCAtIGluaXRpYWwuZHJhZ09mZnNldFxuXG4gICAgbGV0IHJhdGlvID0gZGVsdGFZIC8gKHRoaXMubWluaW1hcC5nZXRWaXNpYmxlSGVpZ2h0KCkgLSB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpKVxuXG4gICAgdGhpcy5taW5pbWFwLnNldFRleHRFZGl0b3JTY3JvbGxUb3AocmF0aW8gKiB0aGlzLm1pbmltYXAuZ2V0VGV4dEVkaXRvck1heFNjcm9sbFRvcCgpKVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtZXRob2QgdGhhdCBlbmRzIHRoZSBkcmFnIGdlc3R1cmUuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZW5kRHJhZyAoKSB7XG4gICAgaWYgKCF0aGlzLm1pbmltYXApIHsgcmV0dXJuIH1cbiAgICB0aGlzLmRyYWdTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gIH1cblxuICAvLyAgICAgIyMjIyMjICAgIyMjIyMjICAgIyMjIyMjXG4gIC8vICAgICMjICAgICMjICMjICAgICMjICMjICAgICMjXG4gIC8vICAgICMjICAgICAgICMjICAgICAgICMjXG4gIC8vICAgICMjICAgICAgICAjIyMjIyMgICAjIyMjIyNcbiAgLy8gICAgIyMgICAgICAgICAgICAgIyMgICAgICAgIyNcbiAgLy8gICAgIyMgICAgIyMgIyMgICAgIyMgIyMgICAgIyNcbiAgLy8gICAgICMjIyMjIyAgICMjIyMjIyAgICMjIyMjI1xuXG4gIC8qKlxuICAgKiBBcHBsaWVzIHRoZSBwYXNzZWQtaW4gc3R5bGVzIHByb3BlcnRpZXMgdG8gdGhlIHNwZWNpZmllZCBlbGVtZW50XG4gICAqXG4gICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBlbGVtZW50IHRoZSBlbGVtZW50IG9udG8gd2hpY2ggYXBwbHkgdGhlIHN0eWxlc1xuICAgKiBAcGFyYW0gIHtPYmplY3R9IHN0eWxlcyB0aGUgc3R5bGVzIHRvIGFwcGx5XG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgYXBwbHlTdHlsZXMgKGVsZW1lbnQsIHN0eWxlcykge1xuICAgIGlmICghZWxlbWVudCkgeyByZXR1cm4gfVxuXG4gICAgbGV0IGNzc1RleHQgPSAnJ1xuICAgIGZvciAobGV0IHByb3BlcnR5IGluIHN0eWxlcykge1xuICAgICAgY3NzVGV4dCArPSBgJHtwcm9wZXJ0eX06ICR7c3R5bGVzW3Byb3BlcnR5XX07IGBcbiAgICB9XG5cbiAgICBlbGVtZW50LnN0eWxlLmNzc1RleHQgPSBjc3NUZXh0XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHN0cmluZyB3aXRoIGEgQ1NTIHRyYW5zbGF0aW9uIHRyYW5mb3JtIHZhbHVlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IFt4ID0gMF0gdGhlIHggb2Zmc2V0IG9mIHRoZSB0cmFuc2xhdGlvblxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IFt5ID0gMF0gdGhlIHkgb2Zmc2V0IG9mIHRoZSB0cmFuc2xhdGlvblxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IHRoZSBDU1MgdHJhbnNsYXRpb24gc3RyaW5nXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgbWFrZVRyYW5zbGF0ZSAoeCA9IDAsIHkgPSAwKSB7XG4gICAgaWYgKHRoaXMudXNlSGFyZHdhcmVBY2NlbGVyYXRpb24pIHtcbiAgICAgIHJldHVybiBgdHJhbnNsYXRlM2QoJHt4fXB4LCAke3l9cHgsIDApYFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYHRyYW5zbGF0ZSgke3h9cHgsICR7eX1weClgXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmcgd2l0aCBhIENTUyBzY2FsaW5nIHRyYW5mb3JtIHZhbHVlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IFt4ID0gMF0gdGhlIHggc2NhbGluZyBmYWN0b3JcbiAgICogQHBhcmFtICB7bnVtYmVyfSBbeSA9IDBdIHRoZSB5IHNjYWxpbmcgZmFjdG9yXG4gICAqIEByZXR1cm4ge3N0cmluZ30gdGhlIENTUyBzY2FsaW5nIHN0cmluZ1xuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIG1ha2VTY2FsZSAoeCA9IDAsIHkgPSB4KSB7XG4gICAgaWYgKHRoaXMudXNlSGFyZHdhcmVBY2NlbGVyYXRpb24pIHtcbiAgICAgIHJldHVybiBgc2NhbGUzZCgke3h9LCAke3l9LCAxKWBcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGBzY2FsZSgke3h9LCAke3l9KWBcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCByZXR1cm4gdGhlIGN1cnJlbnQgdGltZSBhcyBhIERhdGUuXG4gICAqXG4gICAqIFRoYXQgbWV0aG9kIGV4aXN0IHNvIHRoYXQgd2UgY2FuIG1vY2sgaXQgaW4gdGVzdHMuXG4gICAqXG4gICAqIEByZXR1cm4ge0RhdGV9IHRoZSBjdXJyZW50IHRpbWUgYXMgRGF0ZVxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGdldFRpbWUgKCkgeyByZXR1cm4gbmV3IERhdGUoKSB9XG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRoYXQgbWltaWMgdGhlIGpRdWVyeSBgYW5pbWF0ZWAgbWV0aG9kIGFuZCB1c2VkIHRvIGFuaW1hdGUgdGhlXG4gICAqIHNjcm9sbCB3aGVuIGNsaWNraW5nIG9uIHRoZSBNaW5pbWFwRWxlbWVudCBjYW52YXMuXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gcGFyYW0gdGhlIGFuaW1hdGlvbiBkYXRhIG9iamVjdFxuICAgKiBAcGFyYW0gIHtbdHlwZV19IHBhcmFtLmZyb20gdGhlIHN0YXJ0IHZhbHVlXG4gICAqIEBwYXJhbSAge1t0eXBlXX0gcGFyYW0udG8gdGhlIGVuZCB2YWx1ZVxuICAgKiBAcGFyYW0gIHtbdHlwZV19IHBhcmFtLmR1cmF0aW9uIHRoZSBhbmltYXRpb24gZHVyYXRpb25cbiAgICogQHBhcmFtICB7W3R5cGVdfSBwYXJhbS5zdGVwIHRoZSBlYXNpbmcgZnVuY3Rpb24gZm9yIHRoZSBhbmltYXRpb25cbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBhbmltYXRlICh7ZnJvbSwgdG8sIGR1cmF0aW9uLCBzdGVwfSkge1xuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5nZXRUaW1lKClcbiAgICBsZXQgcHJvZ3Jlc3NcblxuICAgIGNvbnN0IHN3aW5nID0gZnVuY3Rpb24gKHByb2dyZXNzKSB7XG4gICAgICByZXR1cm4gMC41IC0gTWF0aC5jb3MocHJvZ3Jlc3MgKiBNYXRoLlBJKSAvIDJcbiAgICB9XG5cbiAgICBjb25zdCB1cGRhdGUgPSAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMubWluaW1hcCkgeyByZXR1cm4gfVxuXG4gICAgICBjb25zdCBwYXNzZWQgPSB0aGlzLmdldFRpbWUoKSAtIHN0YXJ0XG4gICAgICBpZiAoZHVyYXRpb24gPT09IDApIHtcbiAgICAgICAgcHJvZ3Jlc3MgPSAxXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9ncmVzcyA9IHBhc3NlZCAvIGR1cmF0aW9uXG4gICAgICB9XG4gICAgICBpZiAocHJvZ3Jlc3MgPiAxKSB7IHByb2dyZXNzID0gMSB9XG4gICAgICBjb25zdCBkZWx0YSA9IHN3aW5nKHByb2dyZXNzKVxuICAgICAgY29uc3QgdmFsdWUgPSBmcm9tICsgKHRvIC0gZnJvbSkgKiBkZWx0YVxuICAgICAgc3RlcCh2YWx1ZSwgZGVsdGEpXG5cbiAgICAgIGlmIChwcm9ncmVzcyA8IDEpIHsgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHVwZGF0ZSkgfVxuICAgIH1cblxuICAgIHVwZGF0ZSgpXG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/takaaki/.atom/packages/minimap/lib/minimap-element.js
