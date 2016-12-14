Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

'use babel';

var BuildView = (function (_View) {
  _inherits(BuildView, _View);

  _createClass(BuildView, null, [{
    key: 'initialTimerText',
    value: function initialTimerText() {
      return '0.0 s';
    }
  }, {
    key: 'initialHeadingText',
    value: function initialHeadingText() {
      return 'Atom Build';
    }
  }, {
    key: 'content',
    value: function content() {
      var _this = this;

      this.div({ tabIndex: -1, 'class': 'build tool-panel native-key-bindings' }, function () {
        _this.div({ 'class': 'heading', outlet: 'panelHeading' }, function () {
          _this.div({ 'class': 'control-container opaque-hover' }, function () {
            _this.button({ 'class': 'btn btn-default icon icon-zap', click: 'build', title: 'Build current project' });
            _this.button({ 'class': 'btn btn-default icon icon-trashcan', click: 'clearOutput' });
            _this.button({ 'class': 'btn btn-default icon icon-x', click: 'close' });
            _this.div({ 'class': 'title', outlet: 'title' }, function () {
              _this.span({ 'class': 'build-timer', outlet: 'buildTimer' }, _this.initialTimerText());
            });
          });
          _this.div({ 'class': 'icon heading-text', outlet: 'heading' }, _this.initialHeadingText());
        });

        _this.div({ 'class': 'output panel-body', outlet: 'output' });
        _this.div({ 'class': 'resizer', outlet: 'resizer' });
      });
    }
  }]);

  function BuildView() {
    var _context,
        _this2 = this;

    _classCallCheck(this, BuildView);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _get(Object.getPrototypeOf(BuildView.prototype), 'constructor', this).apply(this, args);
    var Terminal = require('term.js');
    this.starttime = new Date();
    this.terminal = new Terminal({
      cursorBlink: false,
      convertEol: true,
      useFocus: false,
      termName: 'xterm-256color',
      scrollback: atom.config.get('build.terminalScrollback')
    });

    // On some systems, prependListern and prependOnceListener is expected to exist. Add them until terminal replacement is here.
    this.terminal.prependListener = function () {
      var _terminal;

      (_terminal = _this2.terminal).addListener.apply(_terminal, arguments);
    };
    this.terminal.prependOnceListener = function () {
      var _terminal2;

      (_terminal2 = _this2.terminal).addOnceListener.apply(_terminal2, arguments);
    };

    this.terminal.getContent = function () {
      return this.lines.reduce(function (m1, line) {
        return m1 + line.reduce(function (m2, col) {
          return m2 + col[1];
        }, '') + '\n';
      }, '');
    };

    this.fontGeometry = { w: 15, h: 15 };
    this.terminal.open(this.output[0]);
    this.destroyTerminal = (_context = this.terminal).destroy.bind(_context);
    this.terminal.destroy = this.terminal.destroySoon = function () {}; // This terminal will be open forever and reset when necessary
    this.terminalEl = (0, _atomSpacePenViews.$)(this.terminal.element);
    this.terminalEl[0].terminal = this.terminal; // For testing purposes

    this.resizeStarted = this.resizeStarted.bind(this);
    this.resizeMoved = this.resizeMoved.bind(this);
    this.resizeEnded = this.resizeEnded.bind(this);

    atom.config.observe('build.panelVisibility', this.visibleFromConfig.bind(this));
    atom.config.observe('build.panelOrientation', this.orientationFromConfig.bind(this));
    atom.config.observe('build.hidePanelHeading', function (hide) {
      hide && _this2.panelHeading.hide() || _this2.panelHeading.show();
    });
    atom.config.observe('build.overrideThemeColors', function (override) {
      _this2.output.removeClass('override-theme');
      override && _this2.output.addClass('override-theme');
    });
    atom.config.observe('editor.fontSize', this.fontSizeFromConfig.bind(this));
    atom.config.observe('editor.fontFamily', this.fontFamilyFromConfig.bind(this));
    atom.commands.add('atom-workspace', 'build:toggle-panel', this.toggle.bind(this));
  }

  _createClass(BuildView, [{
    key: 'destroy',
    value: function destroy() {
      this.destroyTerminal();
      clearInterval(this.detectResizeInterval);
    }
  }, {
    key: 'resizeStarted',
    value: function resizeStarted() {
      document.body.style['-webkit-user-select'] = 'none';
      document.addEventListener('mousemove', this.resizeMoved);
      document.addEventListener('mouseup', this.resizeEnded);
    }
  }, {
    key: 'resizeMoved',
    value: function resizeMoved(ev) {
      var h = this.fontGeometry.h;

      switch (atom.config.get('build.panelOrientation')) {
        case 'Bottom':
          {
            var delta = this.resizer.get(0).getBoundingClientRect().top - ev.y;
            if (Math.abs(delta) < h * 5 / 6) return;

            var nearestRowHeight = Math.round((this.terminalEl.height() + delta) / h) * h;
            var maxHeight = (0, _atomSpacePenViews.$)('.item-views').height() + (0, _atomSpacePenViews.$)('.build .output').height();
            this.terminalEl.css('height', Math.min(maxHeight, nearestRowHeight) + 'px');
            break;
          }

        case 'Top':
          {
            var delta = this.resizer.get(0).getBoundingClientRect().top - ev.y;
            if (Math.abs(delta) < h * 5 / 6) return;

            var nearestRowHeight = Math.round((this.terminalEl.height() - delta) / h) * h;
            var maxHeight = (0, _atomSpacePenViews.$)('.item-views').height() + (0, _atomSpacePenViews.$)('.build .output').height();
            this.terminalEl.css('height', Math.min(maxHeight, nearestRowHeight) + 'px');
            break;
          }

        case 'Left':
          {
            var delta = this.resizer.get(0).getBoundingClientRect().right - ev.x;
            this.css('width', this.width() - delta - this.resizer.outerWidth() + 'px');
            break;
          }

        case 'Right':
          {
            var delta = this.resizer.get(0).getBoundingClientRect().left - ev.x;
            this.css('width', this.width() + delta + 'px');
            break;
          }
      }

      this.resizeTerminal();
    }
  }, {
    key: 'resizeEnded',
    value: function resizeEnded() {
      document.body.style['-webkit-user-select'] = 'all';
      document.removeEventListener('mousemove', this.resizeMoved);
      document.removeEventListener('mouseup', this.resizeEnded);
    }
  }, {
    key: 'resizeToNearestRow',
    value: function resizeToNearestRow() {
      if (-1 !== ['Top', 'Bottom'].indexOf(atom.config.get('build.panelOrientation'))) {
        this.fixTerminalElHeight();
      }
      this.resizeTerminal();
    }
  }, {
    key: 'getFontGeometry',
    value: function getFontGeometry() {
      var o = (0, _atomSpacePenViews.$)('<div>A</div>').addClass('terminal').addClass('terminal-test').appendTo(this.output);
      var w = o[0].getBoundingClientRect().width;
      var h = o[0].getBoundingClientRect().height;
      o.remove();
      return { w: w, h: h };
    }
  }, {
    key: 'resizeTerminal',
    value: function resizeTerminal() {
      this.fontGeometry = this.getFontGeometry();
      var _fontGeometry = this.fontGeometry;
      var w = _fontGeometry.w;
      var h = _fontGeometry.h;

      if (0 === w || 0 === h) {
        return;
      }

      var terminalWidth = Math.floor(this.terminalEl.width() / w);
      var terminalHeight = Math.floor(this.terminalEl.height() / h);

      this.terminal.resize(terminalWidth, terminalHeight);
    }
  }, {
    key: 'getContent',
    value: function getContent() {
      return this.terminal.getContent();
    }
  }, {
    key: 'attach',
    value: function attach() {
      var force = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      if (!force) {
        switch (atom.config.get('build.panelVisibility')) {
          case 'Hidden':
          case 'Show on Error':
            return;
        }
      }

      if (this.panel) {
        this.panel.destroy();
      }

      var addfn = {
        Top: atom.workspace.addTopPanel,
        Bottom: atom.workspace.addBottomPanel,
        Left: atom.workspace.addLeftPanel,
        Right: atom.workspace.addRightPanel
      };
      var orientation = atom.config.get('build.panelOrientation') || 'Bottom';
      this.panel = addfn[orientation].call(atom.workspace, { item: this });
      this.fixTerminalElHeight();
      this.resizeToNearestRow();
    }
  }, {
    key: 'fixTerminalElHeight',
    value: function fixTerminalElHeight() {
      var nearestRowHeight = (0, _atomSpacePenViews.$)('.build .output').height();
      this.terminalEl.css('height', nearestRowHeight + 'px');
    }
  }, {
    key: 'detach',
    value: function detach(force) {
      force = force || false;
      if (atom.views.getView(atom.workspace) && document.activeElement === this[0]) {
        atom.views.getView(atom.workspace).focus();
      }
      if (this.panel && (force || 'Keep Visible' !== atom.config.get('build.panelVisibility'))) {
        this.panel.destroy();
        this.panel = null;
      }
    }
  }, {
    key: 'isAttached',
    value: function isAttached() {
      return !!this.panel;
    }
  }, {
    key: 'visibleFromConfig',
    value: function visibleFromConfig(val) {
      switch (val) {
        case 'Toggle':
        case 'Show on Error':
          if (!this.terminalEl.hasClass('error')) {
            this.detach();
          }
          return;
      }

      this.attach();
    }
  }, {
    key: 'orientationFromConfig',
    value: function orientationFromConfig(orientation) {
      var isVisible = this.isVisible();
      this.detach(true);
      if (isVisible) {
        this.attach();
      }

      this.resizer.get(0).removeEventListener('mousedown', this.resizeStarted);

      switch (orientation) {
        case 'Top':
        case 'Bottom':
          this.get(0).style.width = null;
          this.resizer.get(0).addEventListener('mousedown', this.resizeStarted);
          break;

        case 'Left':
        case 'Right':
          this.terminalEl.get(0).style.height = null;
          this.resizer.get(0).addEventListener('mousedown', this.resizeStarted);
          break;
      }

      this.resizeTerminal();
    }
  }, {
    key: 'fontSizeFromConfig',
    value: function fontSizeFromConfig(size) {
      this.css({ 'font-size': size });
      this.resizeToNearestRow();
    }
  }, {
    key: 'fontFamilyFromConfig',
    value: function fontFamilyFromConfig(family) {
      this.css({ 'font-family': family });
      this.resizeToNearestRow();
    }
  }, {
    key: 'reset',
    value: function reset() {
      clearTimeout(this.titleTimer);
      this.buildTimer.text(BuildView.initialTimerText());
      this.titleTimer = 0;
      this.terminal.reset();

      this.panelHeading.removeClass('success error');
      this.title.removeClass('success error');

      this.detach();
    }
  }, {
    key: 'updateTitle',
    value: function updateTitle() {
      this.buildTimer.text(((new Date() - this.starttime) / 1000).toFixed(1) + ' s');
      this.titleTimer = setTimeout(this.updateTitle.bind(this), 100);
    }
  }, {
    key: 'close',
    value: function close() {
      this.detach(true);
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      require('./google-analytics').sendEvent('view', 'panel toggled');
      this.isAttached() ? this.detach(true) : this.attach(true);
    }
  }, {
    key: 'clearOutput',
    value: function clearOutput() {
      this.terminal.reset();
    }
  }, {
    key: 'build',
    value: function build() {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'build:trigger');
    }
  }, {
    key: 'setHeading',
    value: function setHeading(heading) {
      this.heading.text(heading);
    }
  }, {
    key: 'buildStarted',
    value: function buildStarted() {
      this.starttime = new Date();
      this.reset();
      this.attach();
      if (atom.config.get('build.stealFocus')) {
        this.focus();
      }
      this.updateTitle();
    }
  }, {
    key: 'buildFinished',
    value: function buildFinished(success) {
      if (!success && !this.isAttached()) {
        this.attach(atom.config.get('build.panelVisibility') === 'Show on Error');
      }
      this.finalizeBuild(success);
    }
  }, {
    key: 'buildAbortInitiated',
    value: function buildAbortInitiated() {
      this.heading.addClass('icon-stop');
    }
  }, {
    key: 'buildAborted',
    value: function buildAborted() {
      this.finalizeBuild(false);
    }
  }, {
    key: 'finalizeBuild',
    value: function finalizeBuild(success) {
      this.title.addClass(success ? 'success' : 'error');
      this.panelHeading.addClass(success ? 'success' : 'error');
      this.heading.removeClass('icon-stop');
      clearTimeout(this.titleTimer);
    }
  }, {
    key: 'scrollTo',
    value: function scrollTo(text) {
      var content = this.getContent();
      var endPos = -1;
      var curPos = text.length;
      // We need to decrease the size of `text` until we find a match. This is because
      // terminal will insert line breaks ('\r\n') when width of terminal is reached.
      // It may have been that the middle of a matched error is on a line break.
      while (-1 === endPos && curPos > 0) {
        endPos = content.indexOf(text.substring(0, curPos--));
      }

      if (curPos === 0) {
        // No match - which is weird. Oh well - rather be defensive
        return;
      }

      var row = content.slice(0, endPos).split('\n').length;
      this.terminal.ydisp = 0;
      this.terminal.scrollDisp(row - 1);
    }
  }]);

  return BuildView;
})(_atomSpacePenViews.View);

exports['default'] = BuildView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQvbGliL2J1aWxkLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2lDQUV3QixzQkFBc0I7O0FBRjlDLFdBQVcsQ0FBQzs7SUFJUyxTQUFTO1lBQVQsU0FBUzs7ZUFBVCxTQUFTOztXQUVMLDRCQUFHO0FBQ3hCLGFBQU8sT0FBTyxDQUFDO0tBQ2hCOzs7V0FFd0IsOEJBQUc7QUFDMUIsYUFBTyxZQUFZLENBQUM7S0FDckI7OztXQUVhLG1CQUFHOzs7QUFDZixVQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQU8sc0NBQXNDLEVBQUUsRUFBRSxZQUFNO0FBQzlFLGNBQUssR0FBRyxDQUFDLEVBQUUsU0FBTyxTQUFTLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxFQUFFLFlBQU07QUFDM0QsZ0JBQUssR0FBRyxDQUFDLEVBQUUsU0FBTyxnQ0FBZ0MsRUFBRSxFQUFFLFlBQU07QUFDMUQsa0JBQUssTUFBTSxDQUFDLEVBQUUsU0FBTywrQkFBK0IsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSx1QkFBdUIsRUFBRSxDQUFDLENBQUM7QUFDeEcsa0JBQUssTUFBTSxDQUFDLEVBQUUsU0FBTyxvQ0FBb0MsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQztBQUNuRixrQkFBSyxNQUFNLENBQUMsRUFBRSxTQUFPLDZCQUE2QixFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ3RFLGtCQUFLLEdBQUcsQ0FBQyxFQUFFLFNBQU8sT0FBTyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRSxZQUFNO0FBQ2xELG9CQUFLLElBQUksQ0FBQyxFQUFFLFNBQU8sYUFBYSxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsRUFBRSxNQUFLLGdCQUFnQixFQUFFLENBQUMsQ0FBQzthQUNwRixDQUFD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LGNBQU0sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztPQUN2RDs7QUFFRCxVQUFJLE1BQU0sS0FBSyxDQUFDLEVBQUU7O0FBRWhCLGVBQU87T0FDUjs7QUFFRCxVQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQ3hELFVBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUN4QixVQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDbkM7OztTQW5Xa0IsU0FBUzs7O3FCQUFULFNBQVMiLCJmaWxlIjoiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvYnVpbGQtdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBWaWV3LCAkIH0gZnJvbSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCdWlsZFZpZXcgZXh0ZW5kcyBWaWV3IHtcblxuICBzdGF0aWMgaW5pdGlhbFRpbWVyVGV4dCgpIHtcbiAgICByZXR1cm4gJzAuMCBzJztcbiAgfVxuXG4gIHN0YXRpYyBpbml0aWFsSGVhZGluZ1RleHQoKSB7XG4gICAgcmV0dXJuICdBdG9tIEJ1aWxkJztcbiAgfVxuXG4gIHN0YXRpYyBjb250ZW50KCkge1xuICAgIHRoaXMuZGl2KHsgdGFiSW5kZXg6IC0xLCBjbGFzczogJ2J1aWxkIHRvb2wtcGFuZWwgbmF0aXZlLWtleS1iaW5kaW5ncycgfSwgKCkgPT4ge1xuICAgICAgdGhpcy5kaXYoeyBjbGFzczogJ2hlYWRpbmcnLCBvdXRsZXQ6ICdwYW5lbEhlYWRpbmcnIH0sICgpID0+IHtcbiAgICAgICAgdGhpcy5kaXYoeyBjbGFzczogJ2NvbnRyb2wtY29udGFpbmVyIG9wYXF1ZS1ob3ZlcicgfSwgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuYnV0dG9uKHsgY2xhc3M6ICdidG4gYnRuLWRlZmF1bHQgaWNvbiBpY29uLXphcCcsIGNsaWNrOiAnYnVpbGQnLCB0aXRsZTogJ0J1aWxkIGN1cnJlbnQgcHJvamVjdCcgfSk7XG4gICAgICAgICAgdGhpcy5idXR0b24oeyBjbGFzczogJ2J0biBidG4tZGVmYXVsdCBpY29uIGljb24tdHJhc2hjYW4nLCBjbGljazogJ2NsZWFyT3V0cHV0JyB9KTtcbiAgICAgICAgICB0aGlzLmJ1dHRvbih7IGNsYXNzOiAnYnRuIGJ0bi1kZWZhdWx0IGljb24gaWNvbi14JywgY2xpY2s6ICdjbG9zZScgfSk7XG4gICAgICAgICAgdGhpcy5kaXYoeyBjbGFzczogJ3RpdGxlJywgb3V0bGV0OiAndGl0bGUnIH0sICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc3Bhbih7IGNsYXNzOiAnYnVpbGQtdGltZXInLCBvdXRsZXQ6ICdidWlsZFRpbWVyJyB9LCB0aGlzLmluaXRpYWxUaW1lclRleHQoKSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmRpdih7IGNsYXNzOiAnaWNvbiBoZWFkaW5nLXRleHQnLCBvdXRsZXQ6ICdoZWFkaW5nJyB9LCB0aGlzLmluaXRpYWxIZWFkaW5nVGV4dCgpKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmRpdih7IGNsYXNzOiAnb3V0cHV0IHBhbmVsLWJvZHknLCBvdXRsZXQ6ICdvdXRwdXQnIH0pO1xuICAgICAgdGhpcy5kaXYoeyBjbGFzczogJ3Jlc2l6ZXInLCBvdXRsZXQ6ICdyZXNpemVyJyB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcbiAgICBzdXBlciguLi5hcmdzKTtcbiAgICBjb25zdCBUZXJtaW5hbCA9IHJlcXVpcmUoJ3Rlcm0uanMnKTtcbiAgICB0aGlzLnN0YXJ0dGltZSA9IG5ldyBEYXRlKCk7XG4gICAgdGhpcy50ZXJtaW5hbCA9IG5ldyBUZXJtaW5hbCh7XG4gICAgICBjdXJzb3JCbGluazogZmFsc2UsXG4gICAgICBjb252ZXJ0RW9sOiB0cnVlLFxuICAgICAgdXNlRm9jdXM6IGZhbHNlLFxuICAgICAgdGVybU5hbWU6ICd4dGVybS0yNTZjb2xvcicsXG4gICAgICBzY3JvbGxiYWNrOiBhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLnRlcm1pbmFsU2Nyb2xsYmFjaycpXG4gICAgfSk7XG5cbiAgICAvLyBPbiBzb21lIHN5c3RlbXMsIHByZXBlbmRMaXN0ZXJuIGFuZCBwcmVwZW5kT25jZUxpc3RlbmVyIGlzIGV4cGVjdGVkIHRvIGV4aXN0LiBBZGQgdGhlbSB1bnRpbCB0ZXJtaW5hbCByZXBsYWNlbWVudCBpcyBoZXJlLlxuICAgIHRoaXMudGVybWluYWwucHJlcGVuZExpc3RlbmVyID0gKC4uLmEpID0+IHtcbiAgICAgIHRoaXMudGVybWluYWwuYWRkTGlzdGVuZXIoLi4uYSk7XG4gICAgfTtcbiAgICB0aGlzLnRlcm1pbmFsLnByZXBlbmRPbmNlTGlzdGVuZXIgPSAoLi4uYSkgPT4ge1xuICAgICAgdGhpcy50ZXJtaW5hbC5hZGRPbmNlTGlzdGVuZXIoLi4uYSk7XG4gICAgfTtcblxuICAgIHRoaXMudGVybWluYWwuZ2V0Q29udGVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLmxpbmVzLnJlZHVjZSgobTEsIGxpbmUpID0+IHtcbiAgICAgICAgcmV0dXJuIG0xICsgbGluZS5yZWR1Y2UoKG0yLCBjb2wpID0+IG0yICsgY29sWzFdLCAnJykgKyAnXFxuJztcbiAgICAgIH0sICcnKTtcbiAgICB9O1xuXG4gICAgdGhpcy5mb250R2VvbWV0cnkgPSB7IHc6IDE1LCBoOiAxNSB9O1xuICAgIHRoaXMudGVybWluYWwub3Blbih0aGlzLm91dHB1dFswXSk7XG4gICAgdGhpcy5kZXN0cm95VGVybWluYWwgPSA6Oih0aGlzLnRlcm1pbmFsKS5kZXN0cm95O1xuICAgIHRoaXMudGVybWluYWwuZGVzdHJveSA9IHRoaXMudGVybWluYWwuZGVzdHJveVNvb24gPSAoKSA9PiB7fTsgLy8gVGhpcyB0ZXJtaW5hbCB3aWxsIGJlIG9wZW4gZm9yZXZlciBhbmQgcmVzZXQgd2hlbiBuZWNlc3NhcnlcbiAgICB0aGlzLnRlcm1pbmFsRWwgPSAkKHRoaXMudGVybWluYWwuZWxlbWVudCk7XG4gICAgdGhpcy50ZXJtaW5hbEVsWzBdLnRlcm1pbmFsID0gdGhpcy50ZXJtaW5hbDsgLy8gRm9yIHRlc3RpbmcgcHVycG9zZXNcblxuICAgIHRoaXMucmVzaXplU3RhcnRlZCA9IDo6dGhpcy5yZXNpemVTdGFydGVkO1xuICAgIHRoaXMucmVzaXplTW92ZWQgPSA6OnRoaXMucmVzaXplTW92ZWQ7XG4gICAgdGhpcy5yZXNpemVFbmRlZCA9IDo6dGhpcy5yZXNpemVFbmRlZDtcblxuICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2J1aWxkLnBhbmVsVmlzaWJpbGl0eScsIDo6dGhpcy52aXNpYmxlRnJvbUNvbmZpZyk7XG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnYnVpbGQucGFuZWxPcmllbnRhdGlvbicsIDo6dGhpcy5vcmllbnRhdGlvbkZyb21Db25maWcpO1xuICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2J1aWxkLmhpZGVQYW5lbEhlYWRpbmcnLCAoaGlkZSkgPT4ge1xuICAgICAgaGlkZSAmJiB0aGlzLnBhbmVsSGVhZGluZy5oaWRlKCkgfHwgdGhpcy5wYW5lbEhlYWRpbmcuc2hvdygpO1xuICAgIH0pO1xuICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2J1aWxkLm92ZXJyaWRlVGhlbWVDb2xvcnMnLCAob3ZlcnJpZGUpID0+IHtcbiAgICAgIHRoaXMub3V0cHV0LnJlbW92ZUNsYXNzKCdvdmVycmlkZS10aGVtZScpO1xuICAgICAgb3ZlcnJpZGUgJiYgdGhpcy5vdXRwdXQuYWRkQ2xhc3MoJ292ZXJyaWRlLXRoZW1lJyk7XG4gICAgfSk7XG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnZWRpdG9yLmZvbnRTaXplJywgOjp0aGlzLmZvbnRTaXplRnJvbUNvbmZpZyk7XG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnZWRpdG9yLmZvbnRGYW1pbHknLCA6OnRoaXMuZm9udEZhbWlseUZyb21Db25maWcpO1xuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdidWlsZDp0b2dnbGUtcGFuZWwnLCA6OnRoaXMudG9nZ2xlKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5kZXN0cm95VGVybWluYWwoKTtcbiAgICBjbGVhckludGVydmFsKHRoaXMuZGV0ZWN0UmVzaXplSW50ZXJ2YWwpO1xuICB9XG5cbiAgcmVzaXplU3RhcnRlZCgpIHtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlWyctd2Via2l0LXVzZXItc2VsZWN0J10gPSAnbm9uZSc7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5yZXNpemVNb3ZlZCk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMucmVzaXplRW5kZWQpO1xuICB9XG5cbiAgcmVzaXplTW92ZWQoZXYpIHtcbiAgICBjb25zdCB7IGggfSA9IHRoaXMuZm9udEdlb21ldHJ5O1xuXG4gICAgc3dpdGNoIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLnBhbmVsT3JpZW50YXRpb24nKSkge1xuICAgICAgY2FzZSAnQm90dG9tJzoge1xuICAgICAgICBjb25zdCBkZWx0YSA9IHRoaXMucmVzaXplci5nZXQoMCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wIC0gZXYueTtcbiAgICAgICAgaWYgKE1hdGguYWJzKGRlbHRhKSA8IChoICogNSAvIDYpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgbmVhcmVzdFJvd0hlaWdodCA9IE1hdGgucm91bmQoKHRoaXMudGVybWluYWxFbC5oZWlnaHQoKSArIGRlbHRhKSAvIGgpICogaDtcbiAgICAgICAgY29uc3QgbWF4SGVpZ2h0ID0gJCgnLml0ZW0tdmlld3MnKS5oZWlnaHQoKSArICQoJy5idWlsZCAub3V0cHV0JykuaGVpZ2h0KCk7XG4gICAgICAgIHRoaXMudGVybWluYWxFbC5jc3MoJ2hlaWdodCcsIGAke01hdGgubWluKG1heEhlaWdodCwgbmVhcmVzdFJvd0hlaWdodCl9cHhgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGNhc2UgJ1RvcCc6IHtcbiAgICAgICAgY29uc3QgZGVsdGEgPSB0aGlzLnJlc2l6ZXIuZ2V0KDApLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCAtIGV2Lnk7XG4gICAgICAgIGlmIChNYXRoLmFicyhkZWx0YSkgPCAoaCAqIDUgLyA2KSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IG5lYXJlc3RSb3dIZWlnaHQgPSBNYXRoLnJvdW5kKCh0aGlzLnRlcm1pbmFsRWwuaGVpZ2h0KCkgLSBkZWx0YSkgLyBoKSAqIGg7XG4gICAgICAgIGNvbnN0IG1heEhlaWdodCA9ICQoJy5pdGVtLXZpZXdzJykuaGVpZ2h0KCkgKyAkKCcuYnVpbGQgLm91dHB1dCcpLmhlaWdodCgpO1xuICAgICAgICB0aGlzLnRlcm1pbmFsRWwuY3NzKCdoZWlnaHQnLCBgJHtNYXRoLm1pbihtYXhIZWlnaHQsIG5lYXJlc3RSb3dIZWlnaHQpfXB4YCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBjYXNlICdMZWZ0Jzoge1xuICAgICAgICBjb25zdCBkZWx0YSA9IHRoaXMucmVzaXplci5nZXQoMCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQgLSBldi54O1xuICAgICAgICB0aGlzLmNzcygnd2lkdGgnLCBgJHt0aGlzLndpZHRoKCkgLSBkZWx0YSAtIHRoaXMucmVzaXplci5vdXRlcldpZHRoKCl9cHhgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGNhc2UgJ1JpZ2h0Jzoge1xuICAgICAgICBjb25zdCBkZWx0YSA9IHRoaXMucmVzaXplci5nZXQoMCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCAtIGV2Lng7XG4gICAgICAgIHRoaXMuY3NzKCd3aWR0aCcsIGAke3RoaXMud2lkdGgoKSArIGRlbHRhfXB4YCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucmVzaXplVGVybWluYWwoKTtcbiAgfVxuXG4gIHJlc2l6ZUVuZGVkKCkge1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGVbJy13ZWJraXQtdXNlci1zZWxlY3QnXSA9ICdhbGwnO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMucmVzaXplTW92ZWQpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLnJlc2l6ZUVuZGVkKTtcbiAgfVxuXG4gIHJlc2l6ZVRvTmVhcmVzdFJvdygpIHtcbiAgICBpZiAoLTEgIT09IFsgJ1RvcCcsICdCb3R0b20nIF0uaW5kZXhPZihhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLnBhbmVsT3JpZW50YXRpb24nKSkpIHtcbiAgICAgIHRoaXMuZml4VGVybWluYWxFbEhlaWdodCgpO1xuICAgIH1cbiAgICB0aGlzLnJlc2l6ZVRlcm1pbmFsKCk7XG4gIH1cblxuICBnZXRGb250R2VvbWV0cnkoKSB7XG4gICAgY29uc3QgbyA9ICQoJzxkaXY+QTwvZGl2PicpXG4gICAgICAuYWRkQ2xhc3MoJ3Rlcm1pbmFsJylcbiAgICAgIC5hZGRDbGFzcygndGVybWluYWwtdGVzdCcpXG4gICAgICAuYXBwZW5kVG8odGhpcy5vdXRwdXQpO1xuICAgIGNvbnN0IHcgPSBvWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xuICAgIGNvbnN0IGggPSBvWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcbiAgICBvLnJlbW92ZSgpO1xuICAgIHJldHVybiB7IHcsIGggfTtcbiAgfVxuXG4gIHJlc2l6ZVRlcm1pbmFsKCkge1xuICAgIHRoaXMuZm9udEdlb21ldHJ5ID0gdGhpcy5nZXRGb250R2VvbWV0cnkoKTtcbiAgICBjb25zdCB7IHcsIGggfSA9IHRoaXMuZm9udEdlb21ldHJ5O1xuICAgIGlmICgwID09PSB3IHx8IDAgPT09IGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB0ZXJtaW5hbFdpZHRoID0gTWF0aC5mbG9vcigodGhpcy50ZXJtaW5hbEVsLndpZHRoKCkpIC8gdyk7XG4gICAgY29uc3QgdGVybWluYWxIZWlnaHQgPSBNYXRoLmZsb29yKCh0aGlzLnRlcm1pbmFsRWwuaGVpZ2h0KCkpIC8gaCk7XG5cbiAgICB0aGlzLnRlcm1pbmFsLnJlc2l6ZSh0ZXJtaW5hbFdpZHRoLCB0ZXJtaW5hbEhlaWdodCk7XG4gIH1cblxuICBnZXRDb250ZW50KCkge1xuICAgIHJldHVybiB0aGlzLnRlcm1pbmFsLmdldENvbnRlbnQoKTtcbiAgfVxuXG4gIGF0dGFjaChmb3JjZSA9IGZhbHNlKSB7XG4gICAgaWYgKCFmb3JjZSkge1xuICAgICAgc3dpdGNoIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLnBhbmVsVmlzaWJpbGl0eScpKSB7XG4gICAgICAgIGNhc2UgJ0hpZGRlbic6XG4gICAgICAgIGNhc2UgJ1Nob3cgb24gRXJyb3InOlxuICAgICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5wYW5lbCkge1xuICAgICAgdGhpcy5wYW5lbC5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgY29uc3QgYWRkZm4gPSB7XG4gICAgICBUb3A6IGF0b20ud29ya3NwYWNlLmFkZFRvcFBhbmVsLFxuICAgICAgQm90dG9tOiBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbCxcbiAgICAgIExlZnQ6IGF0b20ud29ya3NwYWNlLmFkZExlZnRQYW5lbCxcbiAgICAgIFJpZ2h0OiBhdG9tLndvcmtzcGFjZS5hZGRSaWdodFBhbmVsXG4gICAgfTtcbiAgICBjb25zdCBvcmllbnRhdGlvbiA9IGF0b20uY29uZmlnLmdldCgnYnVpbGQucGFuZWxPcmllbnRhdGlvbicpIHx8ICdCb3R0b20nO1xuICAgIHRoaXMucGFuZWwgPSBhZGRmbltvcmllbnRhdGlvbl0uY2FsbChhdG9tLndvcmtzcGFjZSwgeyBpdGVtOiB0aGlzIH0pO1xuICAgIHRoaXMuZml4VGVybWluYWxFbEhlaWdodCgpO1xuICAgIHRoaXMucmVzaXplVG9OZWFyZXN0Um93KCk7XG4gIH1cblxuICBmaXhUZXJtaW5hbEVsSGVpZ2h0KCkge1xuICAgIGNvbnN0IG5lYXJlc3RSb3dIZWlnaHQgPSAkKCcuYnVpbGQgLm91dHB1dCcpLmhlaWdodCgpO1xuICAgIHRoaXMudGVybWluYWxFbC5jc3MoJ2hlaWdodCcsIGAke25lYXJlc3RSb3dIZWlnaHR9cHhgKTtcbiAgfVxuXG4gIGRldGFjaChmb3JjZSkge1xuICAgIGZvcmNlID0gZm9yY2UgfHwgZmFsc2U7XG4gICAgaWYgKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSkgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gdGhpc1swXSkge1xuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKS5mb2N1cygpO1xuICAgIH1cbiAgICBpZiAodGhpcy5wYW5lbCAmJiAoZm9yY2UgfHwgJ0tlZXAgVmlzaWJsZScgIT09IGF0b20uY29uZmlnLmdldCgnYnVpbGQucGFuZWxWaXNpYmlsaXR5JykpKSB7XG4gICAgICB0aGlzLnBhbmVsLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMucGFuZWwgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGlzQXR0YWNoZWQoKSB7XG4gICAgcmV0dXJuICEhdGhpcy5wYW5lbDtcbiAgfVxuXG4gIHZpc2libGVGcm9tQ29uZmlnKHZhbCkge1xuICAgIHN3aXRjaCAodmFsKSB7XG4gICAgICBjYXNlICdUb2dnbGUnOlxuICAgICAgY2FzZSAnU2hvdyBvbiBFcnJvcic6XG4gICAgICAgIGlmICghdGhpcy50ZXJtaW5hbEVsLmhhc0NsYXNzKCdlcnJvcicpKSB7XG4gICAgICAgICAgdGhpcy5kZXRhY2goKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5hdHRhY2goKTtcbiAgfVxuXG4gIG9yaWVudGF0aW9uRnJvbUNvbmZpZyhvcmllbnRhdGlvbikge1xuICAgIGNvbnN0IGlzVmlzaWJsZSA9IHRoaXMuaXNWaXNpYmxlKCk7XG4gICAgdGhpcy5kZXRhY2godHJ1ZSk7XG4gICAgaWYgKGlzVmlzaWJsZSkge1xuICAgICAgdGhpcy5hdHRhY2goKTtcbiAgICB9XG5cbiAgICB0aGlzLnJlc2l6ZXIuZ2V0KDApLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMucmVzaXplU3RhcnRlZCk7XG5cbiAgICBzd2l0Y2ggKG9yaWVudGF0aW9uKSB7XG4gICAgICBjYXNlICdUb3AnOlxuICAgICAgY2FzZSAnQm90dG9tJzpcbiAgICAgICAgdGhpcy5nZXQoMCkuc3R5bGUud2lkdGggPSBudWxsO1xuICAgICAgICB0aGlzLnJlc2l6ZXIuZ2V0KDApLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMucmVzaXplU3RhcnRlZCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdMZWZ0JzpcbiAgICAgIGNhc2UgJ1JpZ2h0JzpcbiAgICAgICAgdGhpcy50ZXJtaW5hbEVsLmdldCgwKS5zdHlsZS5oZWlnaHQgPSBudWxsO1xuICAgICAgICB0aGlzLnJlc2l6ZXIuZ2V0KDApLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMucmVzaXplU3RhcnRlZCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHRoaXMucmVzaXplVGVybWluYWwoKTtcbiAgfVxuXG4gIGZvbnRTaXplRnJvbUNvbmZpZyhzaXplKSB7XG4gICAgdGhpcy5jc3MoeyAnZm9udC1zaXplJzogc2l6ZSB9KTtcbiAgICB0aGlzLnJlc2l6ZVRvTmVhcmVzdFJvdygpO1xuICB9XG5cbiAgZm9udEZhbWlseUZyb21Db25maWcoZmFtaWx5KSB7XG4gICAgdGhpcy5jc3MoeyAnZm9udC1mYW1pbHknOiBmYW1pbHkgfSk7XG4gICAgdGhpcy5yZXNpemVUb05lYXJlc3RSb3coKTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLnRpdGxlVGltZXIpO1xuICAgIHRoaXMuYnVpbGRUaW1lci50ZXh0KEJ1aWxkVmlldy5pbml0aWFsVGltZXJUZXh0KCkpO1xuICAgIHRoaXMudGl0bGVUaW1lciA9IDA7XG4gICAgdGhpcy50ZXJtaW5hbC5yZXNldCgpO1xuXG4gICAgdGhpcy5wYW5lbEhlYWRpbmcucmVtb3ZlQ2xhc3MoJ3N1Y2Nlc3MgZXJyb3InKTtcbiAgICB0aGlzLnRpdGxlLnJlbW92ZUNsYXNzKCdzdWNjZXNzIGVycm9yJyk7XG5cbiAgICB0aGlzLmRldGFjaCgpO1xuICB9XG5cbiAgdXBkYXRlVGl0bGUoKSB7XG4gICAgdGhpcy5idWlsZFRpbWVyLnRleHQoKChuZXcgRGF0ZSgpIC0gdGhpcy5zdGFydHRpbWUpIC8gMTAwMCkudG9GaXhlZCgxKSArICcgcycpO1xuICAgIHRoaXMudGl0bGVUaW1lciA9IHNldFRpbWVvdXQodGhpcy51cGRhdGVUaXRsZS5iaW5kKHRoaXMpLCAxMDApO1xuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgdGhpcy5kZXRhY2godHJ1ZSk7XG4gIH1cblxuICB0b2dnbGUoKSB7XG4gICAgcmVxdWlyZSgnLi9nb29nbGUtYW5hbHl0aWNzJykuc2VuZEV2ZW50KCd2aWV3JywgJ3BhbmVsIHRvZ2dsZWQnKTtcbiAgICB0aGlzLmlzQXR0YWNoZWQoKSA/IHRoaXMuZGV0YWNoKHRydWUpIDogdGhpcy5hdHRhY2godHJ1ZSk7XG4gIH1cblxuICBjbGVhck91dHB1dCgpIHtcbiAgICB0aGlzLnRlcm1pbmFsLnJlc2V0KCk7XG4gIH1cblxuICBidWlsZCgpIHtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICdidWlsZDp0cmlnZ2VyJyk7XG4gIH1cblxuICBzZXRIZWFkaW5nKGhlYWRpbmcpIHtcbiAgICB0aGlzLmhlYWRpbmcudGV4dChoZWFkaW5nKTtcbiAgfVxuXG4gIGJ1aWxkU3RhcnRlZCgpIHtcbiAgICB0aGlzLnN0YXJ0dGltZSA9IG5ldyBEYXRlKCk7XG4gICAgdGhpcy5yZXNldCgpO1xuICAgIHRoaXMuYXR0YWNoKCk7XG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQuc3RlYWxGb2N1cycpKSB7XG4gICAgICB0aGlzLmZvY3VzKCk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlVGl0bGUoKTtcbiAgfVxuXG4gIGJ1aWxkRmluaXNoZWQoc3VjY2Vzcykge1xuICAgIGlmICghc3VjY2VzcyAmJiAhdGhpcy5pc0F0dGFjaGVkKCkpIHtcbiAgICAgIHRoaXMuYXR0YWNoKGF0b20uY29uZmlnLmdldCgnYnVpbGQucGFuZWxWaXNpYmlsaXR5JykgPT09ICdTaG93IG9uIEVycm9yJyk7XG4gICAgfVxuICAgIHRoaXMuZmluYWxpemVCdWlsZChzdWNjZXNzKTtcbiAgfVxuXG4gIGJ1aWxkQWJvcnRJbml0aWF0ZWQoKSB7XG4gICAgdGhpcy5oZWFkaW5nLmFkZENsYXNzKCdpY29uLXN0b3AnKTtcbiAgfVxuXG4gIGJ1aWxkQWJvcnRlZCgpIHtcbiAgICB0aGlzLmZpbmFsaXplQnVpbGQoZmFsc2UpO1xuICB9XG5cbiAgZmluYWxpemVCdWlsZChzdWNjZXNzKSB7XG4gICAgdGhpcy50aXRsZS5hZGRDbGFzcyhzdWNjZXNzID8gJ3N1Y2Nlc3MnIDogJ2Vycm9yJyk7XG4gICAgdGhpcy5wYW5lbEhlYWRpbmcuYWRkQ2xhc3Moc3VjY2VzcyA/ICdzdWNjZXNzJyA6ICdlcnJvcicpO1xuICAgIHRoaXMuaGVhZGluZy5yZW1vdmVDbGFzcygnaWNvbi1zdG9wJyk7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMudGl0bGVUaW1lcik7XG4gIH1cblxuICBzY3JvbGxUbyh0ZXh0KSB7XG4gICAgY29uc3QgY29udGVudCA9IHRoaXMuZ2V0Q29udGVudCgpO1xuICAgIGxldCBlbmRQb3MgPSAtMTtcbiAgICBsZXQgY3VyUG9zID0gdGV4dC5sZW5ndGg7XG4gICAgLy8gV2UgbmVlZCB0byBkZWNyZWFzZSB0aGUgc2l6ZSBvZiBgdGV4dGAgdW50aWwgd2UgZmluZCBhIG1hdGNoLiBUaGlzIGlzIGJlY2F1c2VcbiAgICAvLyB0ZXJtaW5hbCB3aWxsIGluc2VydCBsaW5lIGJyZWFrcyAoJ1xcclxcbicpIHdoZW4gd2lkdGggb2YgdGVybWluYWwgaXMgcmVhY2hlZC5cbiAgICAvLyBJdCBtYXkgaGF2ZSBiZWVuIHRoYXQgdGhlIG1pZGRsZSBvZiBhIG1hdGNoZWQgZXJyb3IgaXMgb24gYSBsaW5lIGJyZWFrLlxuICAgIHdoaWxlICgtMSA9PT0gZW5kUG9zICYmIGN1clBvcyA+IDApIHtcbiAgICAgIGVuZFBvcyA9IGNvbnRlbnQuaW5kZXhPZih0ZXh0LnN1YnN0cmluZygwLCBjdXJQb3MtLSkpO1xuICAgIH1cblxuICAgIGlmIChjdXJQb3MgPT09IDApIHtcbiAgICAgIC8vIE5vIG1hdGNoIC0gd2hpY2ggaXMgd2VpcmQuIE9oIHdlbGwgLSByYXRoZXIgYmUgZGVmZW5zaXZlXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgcm93ID0gY29udGVudC5zbGljZSgwLCBlbmRQb3MpLnNwbGl0KCdcXG4nKS5sZW5ndGg7XG4gICAgdGhpcy50ZXJtaW5hbC55ZGlzcCA9IDA7XG4gICAgdGhpcy50ZXJtaW5hbC5zY3JvbGxEaXNwKHJvdyAtIDEpO1xuICB9XG59XG4iXX0=