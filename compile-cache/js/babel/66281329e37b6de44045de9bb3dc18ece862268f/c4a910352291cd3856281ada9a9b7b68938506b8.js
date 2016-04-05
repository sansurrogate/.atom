Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _messageElement = require('./message-element');

'use babel';

var Interact = require('interact.js');
var Clipboard = undefined;
try {
  Clipboard = require('electron').clipboard;
} catch (_) {
  Clipboard = require('clipboard');
}

var BottomPanel = (function () {
  function BottomPanel(scope) {
    var _this = this;

    _classCallCheck(this, BottomPanel);

    this.subscriptions = new _atom.CompositeDisposable();

    this.visibility = false;
    this.visibleMessages = 0;
    this.alwaysTakeMinimumSpace = atom.config.get('linter.alwaysTakeMinimumSpace');
    this.errorPanelHeight = atom.config.get('linter.errorPanelHeight');
    this.configVisibility = atom.config.get('linter.showErrorPanel');
    this.scope = scope;
    this.editorMessages = new Map();
    this.messages = new Map();

    var element = document.createElement('linter-panel'); // TODO(steelbrain): Make this a `div`
    element.tabIndex = '-1';
    this.messagesElement = document.createElement('div');
    element.appendChild(this.messagesElement);
    this.panel = atom.workspace.addBottomPanel({ item: element, visible: false, priority: 500 });
    Interact(element).resizable({ edges: { top: true } }).on('resizemove', function (event) {
      event.target.style.height = event.rect.height + 'px';
    }).on('resizeend', function (event) {
      atom.config.set('linter.errorPanelHeight', event.target.clientHeight);
    });
    element.addEventListener('keydown', function (e) {
      if (e.which === 67 && e.ctrlKey) {
        Clipboard.writeText(getSelection().toString());
      }
    });

    this.subscriptions.add(atom.config.onDidChange('linter.alwaysTakeMinimumSpace', function (_ref) {
      var newValue = _ref.newValue;

      _this.alwaysTakeMinimumSpace = newValue;
      _this.updateHeight();
    }));

    this.subscriptions.add(atom.config.onDidChange('linter.errorPanelHeight', function (_ref2) {
      var newValue = _ref2.newValue;

      _this.errorPanelHeight = newValue;
      _this.updateHeight();
    }));

    this.subscriptions.add(atom.config.onDidChange('linter.showErrorPanel', function (_ref3) {
      var newValue = _ref3.newValue;

      _this.configVisibility = newValue;
      _this.updateVisibility();
    }));

    this.subscriptions.add(atom.workspace.observeActivePaneItem(function (paneItem) {
      _this.paneVisibility = paneItem === atom.workspace.getActiveTextEditor();
      _this.updateVisibility();
    }));

    // Container for messages with no filePath
    var defaultContainer = document.createElement('div');
    this.editorMessages.set(null, defaultContainer);
    this.messagesElement.appendChild(defaultContainer);
    if (scope !== 'Project') {
      defaultContainer.setAttribute('hidden', true);
    }
  }

  _createClass(BottomPanel, [{
    key: 'setMessages',
    value: function setMessages(_ref4) {
      var _this2 = this;

      var added = _ref4.added;
      var removed = _ref4.removed;

      if (removed.length) {
        this.removeMessages(removed);
      }
      if (added.length) {
        (function () {
          var activeFile = atom.workspace.getActiveTextEditor();
          activeFile = activeFile ? activeFile.getPath() : undefined;
          added.forEach(function (message) {
            if (!_this2.editorMessages.has(message.filePath)) {
              var container = document.createElement('div');
              _this2.editorMessages.set(message.filePath, container);
              _this2.messagesElement.appendChild(container);
              if (!(_this2.scope === 'Project' || activeFile === message.filePath)) {
                container.setAttribute('hidden', true);
              }
            }
            var messageElement = _messageElement.Message.fromMessage(message);
            _this2.messages.set(message, messageElement);
            _this2.editorMessages.get(message.filePath).appendChild(messageElement);
            if (messageElement.updateVisibility(_this2.scope).visibility) {
              _this2.visibleMessages++;
            }
          });
        })();
      }

      this.editorMessages.forEach(function (child, key) {
        // Never delete the default container
        if (key !== null && !child.childNodes.length) {
          child.remove();
          _this2.editorMessages['delete'](key);
        }
      });

      this.updateVisibility();
    }
  }, {
    key: 'removeMessages',
    value: function removeMessages(messages) {
      var _this3 = this;

      messages.forEach(function (message) {
        var messageElement = _this3.messages.get(message);
        _this3.messages['delete'](message);
        messageElement.remove();
        if (messageElement.visibility) {
          _this3.visibleMessages--;
        }
      });
    }
  }, {
    key: 'refresh',
    value: function refresh(scope) {
      var _this4 = this;

      if (scope) {
        this.scope = scope;
      } else scope = this.scope;
      this.visibleMessages = 0;

      this.messages.forEach(function (messageElement) {
        if (messageElement.updateVisibility(scope).visibility && scope === 'Line') {
          _this4.visibleMessages++;
        }
      });

      if (scope === 'File') {
        (function () {
          var activeFile = atom.workspace.getActiveTextEditor();
          activeFile = activeFile ? activeFile.getPath() : undefined;
          _this4.editorMessages.forEach(function (messagesElement, filePath) {
            if (filePath === activeFile) {
              messagesElement.removeAttribute('hidden');
              _this4.visibleMessages = messagesElement.childNodes.length;
            } else messagesElement.setAttribute('hidden', true);
          });
        })();
      } else if (scope === 'Project') {
        this.visibleMessages = this.messages.size;
        this.editorMessages.forEach(function (messageElement) {
          messageElement.removeAttribute('hidden');
        });
      }

      this.updateVisibility();
    }
  }, {
    key: 'updateHeight',
    value: function updateHeight() {
      var height = this.errorPanelHeight;

      if (this.alwaysTakeMinimumSpace) {
        // Add `1px` for the top border.
        height = Math.min(this.messagesElement.clientHeight + 1, height);
      }

      this.messagesElement.parentNode.style.height = height + 'px';
    }
  }, {
    key: 'getVisibility',
    value: function getVisibility() {
      return this.visibility;
    }
  }, {
    key: 'updateVisibility',
    value: function updateVisibility() {
      this.visibility = this.configVisibility && this.paneVisibility && this.visibleMessages > 0;

      if (this.visibility) {
        this.panel.show();
        this.updateHeight();
      } else {
        this.panel.hide();
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
      this.messages.clear();
      try {
        this.panel.destroy();
      } catch (err) {
        // Atom fails weirdly sometimes when doing this
      }
    }
  }]);

  return BottomPanel;
})();

exports['default'] = BottomPanel;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi91aS9ib3R0b20tcGFuZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7b0JBU2tDLE1BQU07OzhCQUNsQixtQkFBbUI7O0FBVnpDLFdBQVcsQ0FBQTs7QUFFWCxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDdkMsSUFBSSxTQUFTLFlBQUEsQ0FBQTtBQUNiLElBQUk7QUFDRixXQUFTLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLFNBQVMsQ0FBQTtDQUMxQyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsV0FBUyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQTtDQUNqQzs7SUFJb0IsV0FBVztBQUNuQixXQURRLFdBQVcsQ0FDbEIsS0FBSyxFQUFFOzs7MEJBREEsV0FBVzs7QUFFNUIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBdUIsQ0FBQTs7QUFFNUMsUUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUE7QUFDdkIsUUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUE7QUFDeEIsUUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLCtCQUErQixDQUFDLENBQUE7QUFDOUUsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUE7QUFDbEUsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUE7QUFDaEUsUUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7QUFDbEIsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQy9CLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTs7QUFFekIsUUFBTSxP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bGludGVyL2xpYi91aS9ib3R0b20tcGFuZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5jb25zdCBJbnRlcmFjdCA9IHJlcXVpcmUoJ2ludGVyYWN0LmpzJylcbmxldCBDbGlwYm9hcmRcbnRyeSB7XG4gIENsaXBib2FyZCA9IHJlcXVpcmUoJ2VsZWN0cm9uJykuY2xpcGJvYXJkXG59IGNhdGNoIChfKSB7XG4gIENsaXBib2FyZCA9IHJlcXVpcmUoJ2NsaXBib2FyZCcpXG59XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nXG5pbXBvcnQge01lc3NhZ2V9IGZyb20gJy4vbWVzc2FnZS1lbGVtZW50J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCb3R0b21QYW5lbCB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgIHRoaXMudmlzaWJpbGl0eSA9IGZhbHNlXG4gICAgdGhpcy52aXNpYmxlTWVzc2FnZXMgPSAwXG4gICAgdGhpcy5hbHdheXNUYWtlTWluaW11bVNwYWNlID0gYXRvbS5jb25maWcuZ2V0KCdsaW50ZXIuYWx3YXlzVGFrZU1pbmltdW1TcGFjZScpXG4gICAgdGhpcy5lcnJvclBhbmVsSGVpZ2h0ID0gYXRvbS5jb25maWcuZ2V0KCdsaW50ZXIuZXJyb3JQYW5lbEhlaWdodCcpXG4gICAgdGhpcy5jb25maWdWaXNpYmlsaXR5ID0gYXRvbS5jb25maWcuZ2V0KCdsaW50ZXIuc2hvd0Vycm9yUGFuZWwnKVxuICAgIHRoaXMuc2NvcGUgPSBzY29wZVxuICAgIHRoaXMuZWRpdG9yTWVzc2FnZXMgPSBuZXcgTWFwKClcbiAgICB0aGlzLm1lc3NhZ2VzID0gbmV3IE1hcCgpXG5cbiAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGludGVyLXBhbmVsJykgLy8gVE9ETyhzdGVlbGJyYWluKTogTWFrZSB0aGlzIGEgYGRpdmBcbiAgICBlbGVtZW50LnRhYkluZGV4ID0gJy0xJ1xuICAgIHRoaXMubWVzc2FnZXNFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKHRoaXMubWVzc2FnZXNFbGVtZW50KVxuICAgIHRoaXMucGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbCh7aXRlbTogZWxlbWVudCwgdmlzaWJsZTogZmFsc2UsIHByaW9yaXR5OiA1MDB9KVxuICAgIEludGVyYWN0KGVsZW1lbnQpLnJlc2l6YWJsZSh7ZWRnZXM6IHt0b3A6IHRydWV9fSlcbiAgICAgIC5vbigncmVzaXplbW92ZScsIGV2ZW50ID0+IHtcbiAgICAgICAgZXZlbnQudGFyZ2V0LnN0eWxlLmhlaWdodCA9IGAke2V2ZW50LnJlY3QuaGVpZ2h0fXB4YFxuICAgICAgfSlcbiAgICAgIC5vbigncmVzaXplZW5kJywgZXZlbnQgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci5lcnJvclBhbmVsSGVpZ2h0JywgZXZlbnQudGFyZ2V0LmNsaWVudEhlaWdodClcbiAgICAgIH0pXG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKGUud2hpY2ggPT09IDY3ICYmIGUuY3RybEtleSkge1xuICAgICAgICBDbGlwYm9hcmQud3JpdGVUZXh0KGdldFNlbGVjdGlvbigpLnRvU3RyaW5nKCkpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2xpbnRlci5hbHdheXNUYWtlTWluaW11bVNwYWNlJywgKHtuZXdWYWx1ZX0pID0+IHtcbiAgICAgIHRoaXMuYWx3YXlzVGFrZU1pbmltdW1TcGFjZSA9IG5ld1ZhbHVlXG4gICAgICB0aGlzLnVwZGF0ZUhlaWdodCgpXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdsaW50ZXIuZXJyb3JQYW5lbEhlaWdodCcsICh7bmV3VmFsdWV9KSA9PiB7XG4gICAgICB0aGlzLmVycm9yUGFuZWxIZWlnaHQgPSBuZXdWYWx1ZVxuICAgICAgdGhpcy51cGRhdGVIZWlnaHQoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnbGludGVyLnNob3dFcnJvclBhbmVsJywgKHtuZXdWYWx1ZX0pID0+IHtcbiAgICAgIHRoaXMuY29uZmlnVmlzaWJpbGl0eSA9IG5ld1ZhbHVlXG4gICAgICB0aGlzLnVwZGF0ZVZpc2liaWxpdHkoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vYnNlcnZlQWN0aXZlUGFuZUl0ZW0ocGFuZUl0ZW0gPT4ge1xuICAgICAgdGhpcy5wYW5lVmlzaWJpbGl0eSA9IHBhbmVJdGVtID09PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIHRoaXMudXBkYXRlVmlzaWJpbGl0eSgpXG4gICAgfSkpXG5cbiAgICAvLyBDb250YWluZXIgZm9yIG1lc3NhZ2VzIHdpdGggbm8gZmlsZVBhdGhcbiAgICBjb25zdCBkZWZhdWx0Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLmVkaXRvck1lc3NhZ2VzLnNldChudWxsLCBkZWZhdWx0Q29udGFpbmVyKVxuICAgIHRoaXMubWVzc2FnZXNFbGVtZW50LmFwcGVuZENoaWxkKGRlZmF1bHRDb250YWluZXIpXG4gICAgaWYgKHNjb3BlICE9PSAnUHJvamVjdCcpIHtcbiAgICAgIGRlZmF1bHRDb250YWluZXIuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCB0cnVlKVxuICAgIH1cbiAgfVxuICBzZXRNZXNzYWdlcyh7YWRkZWQsIHJlbW92ZWR9KSB7XG4gICAgaWYgKHJlbW92ZWQubGVuZ3RoKSB7XG4gICAgICB0aGlzLnJlbW92ZU1lc3NhZ2VzKHJlbW92ZWQpXG4gICAgfVxuICAgIGlmIChhZGRlZC5sZW5ndGgpIHtcbiAgICAgIGxldCBhY3RpdmVGaWxlID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBhY3RpdmVGaWxlID0gYWN0aXZlRmlsZSA/IGFjdGl2ZUZpbGUuZ2V0UGF0aCgpIDogdW5kZWZpbmVkXG4gICAgICBhZGRlZC5mb3JFYWNoKG1lc3NhZ2UgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZWRpdG9yTWVzc2FnZXMuaGFzKG1lc3NhZ2UuZmlsZVBhdGgpKSB7XG4gICAgICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgICB0aGlzLmVkaXRvck1lc3NhZ2VzLnNldChtZXNzYWdlLmZpbGVQYXRoLCBjb250YWluZXIpXG4gICAgICAgICAgdGhpcy5tZXNzYWdlc0VsZW1lbnQuYXBwZW5kQ2hpbGQoY29udGFpbmVyKVxuICAgICAgICAgIGlmICghKHRoaXMuc2NvcGUgPT09ICdQcm9qZWN0JyB8fCBhY3RpdmVGaWxlID09PSBtZXNzYWdlLmZpbGVQYXRoKSkge1xuICAgICAgICAgICAgY29udGFpbmVyLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgdHJ1ZSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWVzc2FnZUVsZW1lbnQgPSBNZXNzYWdlLmZyb21NZXNzYWdlKG1lc3NhZ2UpXG4gICAgICAgIHRoaXMubWVzc2FnZXMuc2V0KG1lc3NhZ2UsIG1lc3NhZ2VFbGVtZW50KVxuICAgICAgICB0aGlzLmVkaXRvck1lc3NhZ2VzLmdldChtZXNzYWdlLmZpbGVQYXRoKS5hcHBlbmRDaGlsZChtZXNzYWdlRWxlbWVudClcbiAgICAgICAgaWYgKG1lc3NhZ2VFbGVtZW50LnVwZGF0ZVZpc2liaWxpdHkodGhpcy5zY29wZSkudmlzaWJpbGl0eSkge1xuICAgICAgICAgIHRoaXMudmlzaWJsZU1lc3NhZ2VzKytcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICB0aGlzLmVkaXRvck1lc3NhZ2VzLmZvckVhY2goKGNoaWxkLCBrZXkpID0+IHtcbiAgICAgIC8vIE5ldmVyIGRlbGV0ZSB0aGUgZGVmYXVsdCBjb250YWluZXJcbiAgICAgIGlmIChrZXkgIT09IG51bGwgJiYgIWNoaWxkLmNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICAgIGNoaWxkLnJlbW92ZSgpXG4gICAgICAgIHRoaXMuZWRpdG9yTWVzc2FnZXMuZGVsZXRlKGtleSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy51cGRhdGVWaXNpYmlsaXR5KClcbiAgfVxuICByZW1vdmVNZXNzYWdlcyhtZXNzYWdlcykge1xuICAgIG1lc3NhZ2VzLmZvckVhY2gobWVzc2FnZSA9PiB7XG4gICAgICBjb25zdCBtZXNzYWdlRWxlbWVudCA9IHRoaXMubWVzc2FnZXMuZ2V0KG1lc3NhZ2UpXG4gICAgICB0aGlzLm1lc3NhZ2VzLmRlbGV0ZShtZXNzYWdlKVxuICAgICAgbWVzc2FnZUVsZW1lbnQucmVtb3ZlKClcbiAgICAgIGlmIChtZXNzYWdlRWxlbWVudC52aXNpYmlsaXR5KSB7XG4gICAgICAgIHRoaXMudmlzaWJsZU1lc3NhZ2VzLS1cbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIHJlZnJlc2goc2NvcGUpIHtcbiAgICBpZiAoc2NvcGUpIHtcbiAgICAgIHRoaXMuc2NvcGUgPSBzY29wZVxuICAgIH0gZWxzZSBzY29wZSA9IHRoaXMuc2NvcGVcbiAgICB0aGlzLnZpc2libGVNZXNzYWdlcyA9IDBcblxuICAgIHRoaXMubWVzc2FnZXMuZm9yRWFjaChtZXNzYWdlRWxlbWVudCA9PiB7XG4gICAgICBpZiAobWVzc2FnZUVsZW1lbnQudXBkYXRlVmlzaWJpbGl0eShzY29wZSkudmlzaWJpbGl0eSAmJiBzY29wZSA9PT0gJ0xpbmUnKSB7XG4gICAgICAgIHRoaXMudmlzaWJsZU1lc3NhZ2VzKytcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgaWYgKHNjb3BlID09PSAnRmlsZScpIHtcbiAgICAgIGxldCBhY3RpdmVGaWxlID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBhY3RpdmVGaWxlID0gYWN0aXZlRmlsZSA/IGFjdGl2ZUZpbGUuZ2V0UGF0aCgpIDogdW5kZWZpbmVkXG4gICAgICB0aGlzLmVkaXRvck1lc3NhZ2VzLmZvckVhY2goKG1lc3NhZ2VzRWxlbWVudCwgZmlsZVBhdGgpID0+IHtcbiAgICAgICAgaWYgKGZpbGVQYXRoID09PSBhY3RpdmVGaWxlKSB7XG4gICAgICAgICAgbWVzc2FnZXNFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnaGlkZGVuJylcbiAgICAgICAgICB0aGlzLnZpc2libGVNZXNzYWdlcyA9IG1lc3NhZ2VzRWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aFxuICAgICAgICB9IGVsc2UgbWVzc2FnZXNFbGVtZW50LnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgdHJ1ZSlcbiAgICAgIH0pXG4gICAgfSBlbHNlIGlmIChzY29wZSA9PT0gJ1Byb2plY3QnKSB7XG4gICAgICB0aGlzLnZpc2libGVNZXNzYWdlcyA9IHRoaXMubWVzc2FnZXMuc2l6ZVxuICAgICAgdGhpcy5lZGl0b3JNZXNzYWdlcy5mb3JFYWNoKG1lc3NhZ2VFbGVtZW50ID0+IHtcbiAgICAgICAgbWVzc2FnZUVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdoaWRkZW4nKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZVZpc2liaWxpdHkoKVxuICB9XG4gIHVwZGF0ZUhlaWdodCgpIHtcbiAgICBsZXQgaGVpZ2h0ID0gdGhpcy5lcnJvclBhbmVsSGVpZ2h0XG5cbiAgICBpZiAodGhpcy5hbHdheXNUYWtlTWluaW11bVNwYWNlKSB7XG4gICAgICAvLyBBZGQgYDFweGAgZm9yIHRoZSB0b3AgYm9yZGVyLlxuICAgICAgaGVpZ2h0ID0gTWF0aC5taW4odGhpcy5tZXNzYWdlc0VsZW1lbnQuY2xpZW50SGVpZ2h0ICsgMSwgaGVpZ2h0KVxuICAgIH1cblxuICAgIHRoaXMubWVzc2FnZXNFbGVtZW50LnBhcmVudE5vZGUuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YFxuICB9XG4gIGdldFZpc2liaWxpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMudmlzaWJpbGl0eVxuICB9XG4gIHVwZGF0ZVZpc2liaWxpdHkoKSB7XG4gICAgdGhpcy52aXNpYmlsaXR5ID0gdGhpcy5jb25maWdWaXNpYmlsaXR5ICYmIHRoaXMucGFuZVZpc2liaWxpdHkgJiYgdGhpcy52aXNpYmxlTWVzc2FnZXMgPiAwXG5cbiAgICBpZiAodGhpcy52aXNpYmlsaXR5KSB7XG4gICAgICB0aGlzLnBhbmVsLnNob3coKVxuICAgICAgdGhpcy51cGRhdGVIZWlnaHQoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnBhbmVsLmhpZGUoKVxuICAgIH1cbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB0aGlzLm1lc3NhZ2VzLmNsZWFyKClcbiAgICB0cnkge1xuICAgICAgdGhpcy5wYW5lbC5kZXN0cm95KClcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8vIEF0b20gZmFpbHMgd2VpcmRseSBzb21ldGltZXMgd2hlbiBkb2luZyB0aGlzXG4gICAgfVxuICB9XG59XG4iXX0=
//# sourceURL=/home/takaaki/.atom/packages/linter/lib/ui/bottom-panel.js
