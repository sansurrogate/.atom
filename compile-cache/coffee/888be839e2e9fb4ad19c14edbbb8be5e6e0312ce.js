(function() {
  var $, TextEditorView, UnicodeInputView, View, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), $ = _ref.$, TextEditorView = _ref.TextEditorView, View = _ref.View;

  module.exports = UnicodeInputView = (function(_super) {
    __extends(UnicodeInputView, _super);

    function UnicodeInputView() {
      return UnicodeInputView.__super__.constructor.apply(this, arguments);
    }

    UnicodeInputView.activate = function() {
      return new UnicodeInputView;
    };

    UnicodeInputView.content = function() {
      return this.div((function(_this) {
        return function() {
          _this.h1('Unicode Input');
          _this.subview('miniEditor', new TextEditorView({
            mini: true,
            placeHolderText: 'Unicode Hex Value'
          }));
          return _this.div({
            "class": 'message',
            outlet: 'hexValueDisplay'
          });
        };
      })(this));
    };

    UnicodeInputView.prototype.initialize = function() {
      this.hexValueDisplay.text('Unicode character: ');
      this.panel = atom.workspace.addModalPanel({
        item: this,
        visible: false
      });
      atom.commands.add('atom-text-editor', 'unicode-input:toggle', (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
      this.miniEditor.on('blur', (function(_this) {
        return function() {
          return _this.cancel();
        };
      })(this));
      atom.commands.add(this.miniEditor.element, 'core:confirm', (function(_this) {
        return function() {
          return _this.confirm();
        };
      })(this));
      atom.commands.add(this.miniEditor.element, 'core:cancel', (function(_this) {
        return function() {
          return _this.cancel();
        };
      })(this));
      this.miniEditor.getModel().getBuffer().onDidChange((function(_this) {
        return function() {
          return _this.storeInputValue();
        };
      })(this));
      return this.miniEditor.getModel().onWillInsertText((function(_this) {
        return function(_arg) {
          var cancel, text;
          cancel = _arg.cancel, text = _arg.text;
          if (!text.match(/[0-9a-fA-F]/)) {
            return cancel();
          }
        };
      })(this));
    };

    UnicodeInputView.prototype.storeInputValue = function() {
      return this.hexValueDisplay.text('Unicode character: ' + this.findUnicodeChracter(this.miniEditor.getText()));
    };

    UnicodeInputView.prototype.findUnicodeChracter = function(text) {
      return String.fromCharCode(parseInt(text, 16));
    };

    UnicodeInputView.prototype.toggle = function() {
      if (this.panel.isVisible()) {
        return this.cancel();
      } else {
        return this.show();
      }
    };

    UnicodeInputView.prototype.cancel = function() {
      var hexValueInputFocused;
      hexValueInputFocused = this.miniEditor.hasFocus();
      this.miniEditor.setText('');
      this.panel.hide();
      return this.restoreFocus();
    };

    UnicodeInputView.prototype.confirm = function() {
      var editor, hexValue;
      hexValue = this.miniEditor.getText();
      editor = atom.workspace.getActiveTextEditor();
      this.cancel();
      if (!(editor && hexValue.length)) {
        return;
      }
      return editor.insertText(this.findUnicodeChracter(hexValue));
    };

    UnicodeInputView.prototype.storeFocusedElement = function() {
      return this.previouslyFocusedElement = $(document.activeElement);
    };

    UnicodeInputView.prototype.restoreFocus = function() {
      var _ref1;
      return (_ref1 = this.previouslyFocusedElement) != null ? _ref1.focus() : void 0;
    };

    UnicodeInputView.prototype.show = function() {
      this.storeFocusedElement();
      this.panel.show();
      return this.miniEditor.focus();
    };

    return UnicodeInputView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy91bmljb2RlLWlucHV0L2xpYi91bmljb2RlLWlucHV0LXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUE2QixPQUFBLENBQVEsc0JBQVIsQ0FBN0IsRUFBQyxTQUFBLENBQUQsRUFBSSxzQkFBQSxjQUFKLEVBQW9CLFlBQUEsSUFBcEIsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSix1Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxnQkFBQyxDQUFBLFFBQUQsR0FBVyxTQUFBLEdBQUE7YUFBRyxHQUFBLENBQUEsaUJBQUg7SUFBQSxDQUFYLENBQUE7O0FBQUEsSUFFQSxnQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDSCxVQUFBLEtBQUMsQ0FBQSxFQUFELENBQUksZUFBSixDQUFBLENBQUE7QUFBQSxVQUNBLEtBQUMsQ0FBQSxPQUFELENBQVMsWUFBVCxFQUEyQixJQUFBLGNBQUEsQ0FBZTtBQUFBLFlBQUEsSUFBQSxFQUFNLElBQU47QUFBQSxZQUFZLGVBQUEsRUFBaUIsbUJBQTdCO1dBQWYsQ0FBM0IsQ0FEQSxDQUFBO2lCQUVBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxTQUFQO0FBQUEsWUFBa0IsTUFBQSxFQUFRLGlCQUExQjtXQUFMLEVBSEc7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFMLEVBRFE7SUFBQSxDQUZWLENBQUE7O0FBQUEsK0JBUUEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNW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

//# sourceURL=/home/takaaki/.atom/packages/unicode-input/lib/unicode-input-view.coffee
