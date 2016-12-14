(function() {
  var FigletFontView, Point, Range, figlet, _ref;

  figlet = require('figlet');

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range;

  FigletFontView = require('./figlet-font-view');

  module.exports = {
    figletView: null,
    lastFont: null,
    config: {
      defaultFont: {
        type: 'string',
        "default": 'Banner'
      }
    },
    activate: function(state) {
      return atom.commands.add('atom-text-editor', {
        'figlet:convert': (function(_this) {
          return function() {
            var editor;
            editor = atom.workspace.getActiveTextEditor();
            if (editor == null) {
              return;
            }
            if (_this.figletView != null) {
              _this.figletView.setEditor(editor);
            } else {
              _this.figletView = new FigletFontView(editor, _this);
            }
            if (_this.figletView.hasParent()) {
              return _this.figletView.cancel();
            } else {
              return _this.figletView.attach();
            }
          };
        })(this),
        'figlet:convert-last': (function(_this) {
          return function() {
            var _ref1;
            return _this.convert((_ref1 = _this.lastFont) != null ? _ref1 : atom.config.get('figlet.defaultFont'));
          };
        })(this)
      });
    },
    deactivate: function() {},
    convert: function(font) {
      var editor, end, prefix, start, textToConvert, _ref1;
      editor = atom.workspace.getActiveTextEditor();
      _ref1 = this.getTextToConvert(editor), prefix = _ref1[0], textToConvert = _ref1[1], start = _ref1[2], end = _ref1[3];
      return figlet.text(textToConvert, {
        font: font
      }, (function(_this) {
        return function(err, data) {
          var text;
          text = data.split('\n').map(function(l) {
            return (prefix + l).replace(/\s+$/, '');
          }).filter(function(l) {
            return l.length > 0;
          }).join('\n');
          return editor.setTextInBufferRange([[start.row, 0], end], text);
        };
      })(this));
    },
    getTextToConvert: function(editor) {
      var commentEndString, commentStartRegex, commentStartRegexString, commentStartString, end, escapeRegExp, indentInSelection, length, match, precedingText, scope, selection, selectionText, start, _base, _ref1, _ref2, _ref3;
      escapeRegExp = function(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
      };
      selection = editor.getLastSelection();
      _ref1 = selection.getBufferRange(), start = _ref1.start, end = _ref1.end;
      start = Point.fromObject([start.row, 0]);
      selectionText = editor.getTextInRange([start, end]);
      indentInSelection = /[^\s]/.exec(selectionText).index;
      if (indentInSelection > 0) {
        start.column += indentInSelection;
        selectionText = selectionText.slice(indentInSelection);
      }
      scope = editor.scopeDescriptorForBufferPosition([start.row, 0]);
      _ref3 = (_ref2 = typeof (_base = editor.languageMode).commentStartAndEndStringsForScope === "function" ? _base.commentStartAndEndStringsForScope(scope) : void 0) != null ? _ref2 : editor.getCommentStrings(scope), commentStartString = _ref3.commentStartString, commentEndString = _ref3.commentEndString;
      if (commentStartString != null) {
        commentStartRegexString = escapeRegExp(commentStartString).replace(/(\s+)$/, '');
        commentStartRegex = new RegExp("^(\\s*)(" + commentStartRegexString + ")*\\s+");
        match = commentStartRegex.exec(selectionText);
        if (match != null) {
          length = match[0].length;
          start.column += length;
          selectionText = selectionText.slice(length);
        }
      }
      precedingText = editor.getTextInRange([[start.row, 0], start]);
      return [precedingText, selectionText, start, end];
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9maWdsZXQvbGliL2ZpZ2xldC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMENBQUE7O0FBQUEsRUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVIsQ0FBVCxDQUFBOztBQUFBLEVBQ0EsT0FBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxhQUFBLEtBQUQsRUFBUSxhQUFBLEtBRFIsQ0FBQTs7QUFBQSxFQUdBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG9CQUFSLENBSGpCLENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxVQUFBLEVBQVksSUFBWjtBQUFBLElBQ0EsUUFBQSxFQUFVLElBRFY7QUFBQSxJQUdBLE1BQUEsRUFDRTtBQUFBLE1BQUEsV0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLFFBRFQ7T0FERjtLQUpGO0FBQUEsSUFRQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7YUFDUixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0Isa0JBQWxCLEVBQ0U7QUFBQSxRQUFBLGdCQUFBLEVBQWtCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO0FBQ2hCLGdCQUFBLE1BQUE7QUFBQSxZQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBVCxDQUFBO0FBQ0EsWUFBQSxJQUFjLGNBQWQ7QUFBQSxvQkFBQSxDQUFBO2FBREE7QUFHQSxZQUFBLElBQUcsd0JBQUg7QUFDRSxjQUFBLEtBQUMsQ0FBQSxVQUFVLENBQUMsU0FBWixDQUFzQixNQUF0QixDQUFBLENBREY7YUFBQSxNQUFBO0FBR0UsY0FBQSxLQUFDLENBQUEs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

//# sourceURL=/home/takaaki/.atom/packages/figlet/lib/figlet.coffee
