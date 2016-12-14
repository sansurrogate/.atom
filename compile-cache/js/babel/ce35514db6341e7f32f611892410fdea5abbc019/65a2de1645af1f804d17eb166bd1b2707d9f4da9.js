Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _uiBottomPanel = require('./ui/bottom-panel');

var _uiBottomPanel2 = _interopRequireDefault(_uiBottomPanel);

var _uiBottomContainer = require('./ui/bottom-container');

var _uiBottomContainer2 = _interopRequireDefault(_uiBottomContainer);

var _uiMessageElement = require('./ui/message-element');

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _uiMessageBubble = require('./ui/message-bubble');

'use babel';

var LinterViews = (function () {
  function LinterViews(scope, editorRegistry) {
    var _this = this;

    _classCallCheck(this, LinterViews);

    this.subscriptions = new _atom.CompositeDisposable();
    this.emitter = new _atom.Emitter();
    this.bottomPanel = new _uiBottomPanel2['default'](scope);
    this.bottomContainer = _uiBottomContainer2['default'].create(scope);
    this.editors = editorRegistry;
    this.bottomBar = null; // To be added when status-bar service is consumed
    this.bubble = null;
    this.bubbleRange = null;

    this.subscriptions.add(this.bottomPanel);
    this.subscriptions.add(this.bottomContainer);
    this.subscriptions.add(this.emitter);

    this.count = {
      Line: 0,
      File: 0,
      Project: 0
    };
    this.messages = [];
    this.subscriptions.add(atom.config.observe('linter.showErrorInline', function (showBubble) {
      return _this.showBubble = showBubble;
    }));
    this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem(function (paneItem) {
      var isEditor = false;
      _this.editors.forEach(function (editorLinter) {
        isEditor = (editorLinter.active = editorLinter.editor === paneItem) || isEditor;
      });
      _this.updateCounts();
      _this.bottomPanel.refresh();
      _this.bottomContainer.visibility = isEditor;
    }));
    this.subscriptions.add(this.bottomContainer.onDidChangeTab(function (scope) {
      _this.emitter.emit('did-update-scope', scope);
      atom.config.set('linter.showErrorPanel', true);
      _this.bottomPanel.refresh(scope);
    }));
    this.subscriptions.add(this.bottomContainer.onShouldTogglePanel(function () {
      atom.config.set('linter.showErrorPanel', !atom.config.get('linter.showErrorPanel'));
    }));

    this._renderBubble = this.renderBubble;
    this.subscriptions.add(atom.config.observe('linter.inlineTooltipInterval', function (bubbleInterval) {
      return _this.renderBubble = _helpers2['default'].debounce(_this._renderBubble, bubbleInterval);
    }));
  }

  _createClass(LinterViews, [{
    key: 'render',
    value: function render(_ref) {
      var added = _ref.added;
      var removed = _ref.removed;
      var messages = _ref.messages;

      this.messages = messages;
      this.notifyEditorLinters({ added: added, removed: removed });
      this.bottomPanel.setMessages({ added: added, removed: removed });
      this.updateCounts();
    }
  }, {
    key: 'updateCounts',
    value: function updateCounts() {
      var activeEditorLinter = this.editors.ofActiveTextEditor();

      this.count.Project = this.messages.length;
      this.count.File = activeEditorLinter ? activeEditorLinter.getMessages().size : 0;
      this.count.Line = activeEditorLinter ? activeEditorLinter.countLineMessages : 0;
      this.bottomContainer.setCount(this.count);
    }
  }, {
    key: 'renderBubble',
    value: function renderBubble(editorLinter) {
      if (!this.showBubble || !editorLinter.messages.size) {
        this.removeBubble();
        return;
      }
      var point = editorLinter.editor.getCursorBufferPosition();
      if (this.bubbleRange && this.bubbleRange.containsPoint(point)) {
        return; // The marker remains the same
      }
      this.removeBubble();
      for (var message of editorLinter.messages) {
        if (message.range && message.range.containsPoint(point)) {
          this.bubbleRange = _atom.Range.fromObject([point, point]);
          this.bubble = editorLinter.editor.markBufferRange(this.bubbleRange, { invalidate: 'never' });
          editorLinter.editor.decorateMarker(this.bubble, {
            type: 'overlay',
            item: (0, _uiMessageBubble.create)(message)
          });
          return;
        }
      }
      this.bubbleRange = null;
    }
  }, {
    key: 'removeBubble',
    value: function removeBubble() {
      if (this.bubble) {
        this.bubble.destroy();
        this.bubble = null;
      }
    }
  }, {
    key: 'notifyEditorLinters',
    value: function notifyEditorLinters(_ref2) {
      var _this2 = this;

      var added = _ref2.added;
      var removed = _ref2.removed;

      var editorLinter = undefined;
      removed.forEach(function (message) {
        if (message.filePath && (editorLinter = _this2.editors.ofPath(message.filePath))) {
          editorLinter.deleteMessage(message);
        }
      });
      added.forEach(function (message) {
        if (message.filePath && (editorLinter = _this2.editors.ofPath(message.filePath))) {
          editorLinter.addMessage(message);
        }
      });
      editorLinter = this.editors.ofActiveTextEditor();
      if (editorLinter) {
        editorLinter.calculateLineMessages(null);
        this.renderBubble(editorLinter);
      } else {
        this.removeBubble();
      }
    }
  }, {
    key: 'notifyEditorLinter',
    value: function notifyEditorLinter(editorLinter) {
      var path = editorLinter.editor.getPath();
      if (!path) return;
      this.messages.forEach(function (message) {
        if (message.filePath && message.filePath === path) {
          editorLinter.addMessage(message);
        }
      });
    }
  }, {
    key: 'attachBottom',
    value: function attachBottom(statusBar) {
      var _this3 = this;

      this.subscriptions.add(atom.config.observe('linter.statusIconPosition', function (position) {
        if (_this3.bottomBar) {
          _this3.bottomBar.destroy();
        }
        _this3.bottomBar = statusBar['add' + position + 'Tile']({
          item: _this3.bottomContainer,
          priority: position === 'Left' ? -100 : 100
        });
      }));
    }
  }, {
    key: 'onDidUpdateScope',
    value: function onDidUpdateScope(callback) {
      return this.emitter.on('did-update-scope', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      // No need to notify editors of this, we're being disposed means the package is
      // being deactivated. They'll be disposed automatically by the registry.
      this.subscriptions.dispose();
      if (this.bottomBar) {
        this.bottomBar.destroy();
      }
      if (this.bubble) {
        this.bubble.destroy();
        this.bubbleRange = null;
      }
    }
  }]);

  return LinterViews;
})();

exports['default'] = LinterViews;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9saW50ZXItdmlld3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFa0QsTUFBTTs7NkJBQ2hDLG1CQUFtQjs7OztpQ0FDZix1QkFBdUI7Ozs7Z0NBQzdCLHNCQUFzQjs7dUJBQ3hCLFdBQVc7Ozs7K0JBQ00scUJBQXFCOztBQVAxRCxXQUFXLENBQUE7O0lBU1UsV0FBVztBQUNuQixXQURRLFdBQVcsQ0FDbEIsS0FBSyxFQUFFLGNBQWMsRUFBRTs7OzBCQURoQixXQUFXOztBQUU1QixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBO0FBQzlDLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsV0FBVyxHQUFHLCtCQUFnQixLQUFLLENBQUMsQ0FBQTtBQUN6QyxRQUFJLENBQUMsZUFBZSxHQUFHLCtCQUFnQixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDcEQsUUFBSSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUE7QUFDN0IsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7QUFDckIsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUE7QUFDbEIsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUE7O0FBRXZCLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUN4QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDNUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBOztBQUVwQyxRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsVUFBSSxFQUFFLENBQUM7QUFDUCxVQUFJLEVBQUUsQ0FBQztBQUNQLGFBQU8sRUFBRSxDQUFDO0tBQ1gsQ0FBQTtBQUNE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SUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNsQixZQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFBO09BQ3pCO0FBQ0QsVUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ2YsWUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUNyQixZQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTtPQUN4QjtLQUNGOzs7U0FqSmtCLFdBQVc7OztxQkFBWCxXQUFXIiwiZmlsZSI6Ii9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9saW50ZXItdmlld3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQge0VtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGUsIFJhbmdlfSBmcm9tICdhdG9tJ1xuaW1wb3J0IEJvdHRvbVBhbmVsIGZyb20gJy4vdWkvYm90dG9tLXBhbmVsJ1xuaW1wb3J0IEJvdHRvbUNvbnRhaW5lciBmcm9tICcuL3VpL2JvdHRvbS1jb250YWluZXInXG5pbXBvcnQge01lc3NhZ2V9IGZyb20gJy4vdWkvbWVzc2FnZS1lbGVtZW50J1xuaW1wb3J0IEhlbHBlcnMgZnJvbSAnLi9oZWxwZXJzJ1xuaW1wb3J0IHtjcmVhdGUgYXMgY3JlYXRlQnViYmxlfSBmcm9tICcuL3VpL21lc3NhZ2UtYnViYmxlJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMaW50ZXJWaWV3cyB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlLCBlZGl0b3JSZWdpc3RyeSkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5ib3R0b21QYW5lbCA9IG5ldyBCb3R0b21QYW5lbChzY29wZSlcbiAgICB0aGlzLmJvdHRvbUNvbnRhaW5lciA9IEJvdHRvbUNvbnRhaW5lci5jcmVhdGUoc2NvcGUpXG4gICAgdGhpcy5lZGl0b3JzID0gZWRpdG9yUmVnaXN0cnlcbiAgICB0aGlzLmJvdHRvbUJhciA9IG51bGwgLy8gVG8gYmUgYWRkZWQgd2hlbiBzdGF0dXMtYmFyIHNlcnZpY2UgaXMgY29uc3VtZWRcbiAgICB0aGlzLmJ1YmJsZSA9IG51bGxcbiAgICB0aGlzLmJ1YmJsZVJhbmdlID0gbnVsbFxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmJvdHRvbVBhbmVsKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5ib3R0b21Db250YWluZXIpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVtaXR0ZXIpXG5cbiAgICB0aGlzLmNvdW50ID0ge1xuICAgICAgTGluZTogMCxcbiAgICAgIEZpbGU6IDAsXG4gICAgICBQcm9qZWN0OiAwXG4gICAgfVxuICAgIHRoaXMubWVzc2FnZXMgPSBbXVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLnNob3dFcnJvcklubGluZScsIHNob3dCdWJibGUgPT5cbiAgICAgIHRoaXMuc2hvd0J1YmJsZSA9IHNob3dCdWJibGVcbiAgICApKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbShwYW5lSXRlbSA9PiB7XG4gICAgICBsZXQgaXNFZGl0b3IgPSBmYWxzZVxuICAgICAgdGhpcy5lZGl0b3JzLmZvckVhY2goZnVuY3Rpb24oZWRpdG9yTGludGVyKSB7XG4gICAgICAgIGlzRWRpdG9yID0gKGVkaXRvckxpbnRlci5hY3RpdmUgPSBlZGl0b3JMaW50ZXIuZWRpdG9yID09PSBwYW5lSXRlbSkgfHwgaXNFZGl0b3JcbiAgICAgIH0pXG4gICAgICB0aGlzLnVwZGF0ZUNvdW50cygpXG4gICAgICB0aGlzLmJvdHRvbVBhbmVsLnJlZnJlc2goKVxuICAgICAgdGhpcy5ib3R0b21Db250YWluZXIudmlzaWJpbGl0eSA9IGlzRWRpdG9yXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmJvdHRvbUNvbnRhaW5lci5vbkRpZENoYW5nZVRhYihzY29wZSA9PiB7XG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLXVwZGF0ZS1zY29wZScsIHNjb3BlKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXIuc2hvd0Vycm9yUGFuZWwnLCB0cnVlKVxuICAgICAgdGhpcy5ib3R0b21QYW5lbC5yZWZyZXNoKHNjb3BlKVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5ib3R0b21Db250YWluZXIub25TaG91bGRUb2dnbGVQYW5lbChmdW5jdGlvbigpIHtcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLnNob3dFcnJvclBhbmVsJywgIWF0b20uY29uZmlnLmdldCgnbGludGVyLnNob3dFcnJvclBhbmVsJykpXG4gICAgfSkpXG5cbiAgICB0aGlzLl9yZW5kZXJCdWJibGUgPSB0aGlzLnJlbmRlckJ1YmJsZVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLmlubGluZVRvb2x0aXBJbnRlcnZhbCcsIGJ1YmJsZUludGVydmFsID0+XG4gICAgICB0aGlzLnJlbmRlckJ1YmJsZSA9IEhlbHBlcnMuZGVib3VuY2UodGhpcy5fcmVuZGVyQnViYmxlLCBidWJibGVJbnRlcnZhbClcbiAgICApKVxuICB9XG4gIHJlbmRlcih7YWRkZWQsIHJlbW92ZWQsIG1lc3NhZ2VzfSkge1xuICAgIHRoaXMubWVzc2FnZXMgPSBtZXNzYWdlc1xuICAgIHRoaXMubm90aWZ5RWRpdG9yTGludGVycyh7YWRkZWQsIHJlbW92ZWR9KVxuICAgIHRoaXMuYm90dG9tUGFuZWwuc2V0TWVzc2FnZXMoe2FkZGVkLCByZW1vdmVkfSlcbiAgICB0aGlzLnVwZGF0ZUNvdW50cygpXG4gIH1cbiAgdXBkYXRlQ291bnRzKCkge1xuICAgIGNvbnN0IGFjdGl2ZUVkaXRvckxpbnRlciA9IHRoaXMuZWRpdG9ycy5vZkFjdGl2ZVRleHRFZGl0b3IoKVxuXG4gICAgdGhpcy5jb3VudC5Qcm9qZWN0ID0gdGhpcy5tZXNzYWdlcy5sZW5ndGhcbiAgICB0aGlzLmNvdW50LkZpbGUgPSBhY3RpdmVFZGl0b3JMaW50ZXIgPyBhY3RpdmVFZGl0b3JMaW50ZXIuZ2V0TWVzc2FnZXMoKS5zaXplIDogMFxuICAgIHRoaXMuY291bnQuTGluZSA9IGFjdGl2ZUVkaXRvckxpbnRlciA/IGFjdGl2ZUVkaXRvckxpbnRlci5jb3VudExpbmVNZXNzYWdlcyA6IDBcbiAgICB0aGlzLmJvdHRvbUNvbnRhaW5lci5zZXRDb3VudCh0aGlzLmNvdW50KVxuICB9XG4gIHJlbmRlckJ1YmJsZShlZGl0b3JMaW50ZXIpIHtcbiAgICBpZiAoIXRoaXMuc2hvd0J1YmJsZSB8fCAhZWRpdG9yTGludGVyLm1lc3NhZ2VzLnNpemUpIHtcbiAgICAgIHRoaXMucmVtb3ZlQnViYmxlKClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBwb2ludCA9IGVkaXRvckxpbnRlci5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgIGlmICh0aGlzLmJ1YmJsZVJhbmdlICYmIHRoaXMuYnViYmxlUmFuZ2UuY29udGFpbnNQb2ludChwb2ludCkpIHtcbiAgICAgIHJldHVybiAvLyBUaGUgbWFya2VyIHJlbWFpbnMgdGhlIHNhbWVcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVCdWJibGUoKVxuICAgIGZvciAobGV0IG1lc3NhZ2Ugb2YgZWRpdG9yTGludGVyLm1lc3NhZ2VzKSB7XG4gICAgICBpZiAobWVzc2FnZS5yYW5nZSAmJiBtZXNzYWdlLnJhbmdlLmNvbnRhaW5zUG9pbnQocG9pbnQpKSB7XG4gICAgICAgIHRoaXMuYnViYmxlUmFuZ2UgPSBSYW5nZS5mcm9tT2JqZWN0KFtwb2ludCwgcG9pbnRdKVxuICAgICAgICB0aGlzLmJ1YmJsZSA9IGVkaXRvckxpbnRlci5lZGl0b3IubWFya0J1ZmZlclJhbmdlKHRoaXMuYnViYmxlUmFuZ2UsIHtpbnZhbGlkYXRlOiAnbmV2ZXInfSlcbiAgICAgICAgZWRpdG9yTGludGVyLmVkaXRvci5kZWNvcmF0ZU1hcmtlcih0aGlzLmJ1YmJsZSwge1xuICAgICAgICAgIHR5cGU6ICdvdmVybGF5JyxcbiAgICAgICAgICBpdGVtOiBjcmVhdGVCdWJibGUobWVzc2FnZSlcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuYnViYmxlUmFuZ2UgPSBudWxsXG4gIH1cbiAgcmVtb3ZlQnViYmxlKCkge1xuICAgIGlmICh0aGlzLmJ1YmJsZSkge1xuICAgICAgdGhpcy5idWJibGUuZGVzdHJveSgpXG4gICAgICB0aGlzLmJ1YmJsZSA9IG51bGxcbiAgICB9XG4gIH1cbiAgbm90aWZ5RWRpdG9yTGludGVycyh7YWRkZWQsIHJlbW92ZWR9KSB7XG4gICAgbGV0IGVkaXRvckxpbnRlclxuICAgIHJlbW92ZWQuZm9yRWFjaChtZXNzYWdlID0+IHtcbiAgICAgIGlmIChtZXNzYWdlLmZpbGVQYXRoICYmIChlZGl0b3JMaW50ZXIgPSB0aGlzLmVkaXRvcnMub2ZQYXRoKG1lc3NhZ2UuZmlsZVBhdGgpKSkge1xuICAgICAgICBlZGl0b3JMaW50ZXIuZGVsZXRlTWVzc2FnZShtZXNzYWdlKVxuICAgICAgfVxuICAgIH0pXG4gICAgYWRkZWQuZm9yRWFjaChtZXNzYWdlID0+IHtcbiAgICAgIGlmIChtZXNzYWdlLmZpbGVQYXRoICYmIChlZGl0b3JMaW50ZXIgPSB0aGlzLmVkaXRvcnMub2ZQYXRoKG1lc3NhZ2UuZmlsZVBhdGgpKSkge1xuICAgICAgICBlZGl0b3JMaW50ZXIuYWRkTWVzc2FnZShtZXNzYWdlKVxuICAgICAgfVxuICAgIH0pXG4gICAgZWRpdG9yTGludGVyID0gdGhpcy5lZGl0b3JzLm9mQWN0aXZlVGV4dEVkaXRvcigpXG4gICAgaWYgKGVkaXRvckxpbnRlcikge1xuICAgICAgZWRpdG9yTGludGVyLmNhbGN1bGF0ZUxpbmVNZXNzYWdlcyhudWxsKVxuICAgICAgdGhpcy5yZW5kZXJCdWJibGUoZWRpdG9yTGludGVyKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlbW92ZUJ1YmJsZSgpXG4gICAgfVxuICB9XG4gIG5vdGlmeUVkaXRvckxpbnRlcihlZGl0b3JMaW50ZXIpIHtcbiAgICBjb25zdCBwYXRoID0gZWRpdG9yTGludGVyLmVkaXRvci5nZXRQYXRoKClcbiAgICBpZiAoIXBhdGgpIHJldHVyblxuICAgIHRoaXMubWVzc2FnZXMuZm9yRWFjaChmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICBpZiAobWVzc2FnZS5maWxlUGF0aCAmJiBtZXNzYWdlLmZpbGVQYXRoID09PSBwYXRoKSB7XG4gICAgICAgIGVkaXRvckxpbnRlci5hZGRNZXNzYWdlKG1lc3NhZ2UpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBhdHRhY2hCb3R0b20oc3RhdHVzQmFyKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXIuc3RhdHVzSWNvblBvc2l0aW9uJywgcG9zaXRpb24gPT4ge1xuICAgICAgaWYgKHRoaXMuYm90dG9tQmFyKSB7XG4gICAgICAgIHRoaXMuYm90dG9tQmFyLmRlc3Ryb3koKVxuICAgICAgfVxuICAgICAgdGhpcy5ib3R0b21CYXIgPSBzdGF0dXNCYXJbYGFkZCR7cG9zaXRpb259VGlsZWBdKHtcbiAgICAgICAgaXRlbTogdGhpcy5ib3R0b21Db250YWluZXIsXG4gICAgICAgIHByaW9yaXR5OiBwb3NpdGlvbiA9PT0gJ0xlZnQnID8gLTEwMCA6IDEwMFxuICAgICAgfSlcbiAgICB9KSlcbiAgfVxuXG4gIG9uRGlkVXBkYXRlU2NvcGUoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtdXBkYXRlLXNjb3BlJywgY2FsbGJhY2spXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICAvLyBObyBuZWVkIHRvIG5vdGlmeSBlZGl0b3JzIG9mIHRoaXMsIHdlJ3JlIGJlaW5nIGRpc3Bvc2VkIG1lYW5zIHRoZSBwYWNrYWdlIGlzXG4gICAgLy8gYmVpbmcgZGVhY3RpdmF0ZWQuIFRoZXknbGwgYmUgZGlzcG9zZWQgYXV0b21hdGljYWxseSBieSB0aGUgcmVnaXN0cnkuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIGlmICh0aGlzLmJvdHRvbUJhcikge1xuICAgICAgdGhpcy5ib3R0b21CYXIuZGVzdHJveSgpXG4gICAgfVxuICAgIGlmICh0aGlzLmJ1YmJsZSkge1xuICAgICAgdGhpcy5idWJibGUuZGVzdHJveSgpXG4gICAgICB0aGlzLmJ1YmJsZVJhbmdlID0gbnVsbFxuICAgIH1cbiAgfVxufVxuIl19
//# sourceURL=/home/takaaki/.atom/packages/linter/lib/linter-views.js
