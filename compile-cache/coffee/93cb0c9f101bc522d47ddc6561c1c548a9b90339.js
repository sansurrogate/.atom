(function() {
  var $$, FigletFontView, SelectListView, TextEditorView, figlet, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), $$ = _ref.$$, SelectListView = _ref.SelectListView, TextEditorView = _ref.TextEditorView;

  figlet = require('figlet');

  module.exports = FigletFontView = (function(_super) {
    __extends(FigletFontView, _super);

    function FigletFontView() {
      return FigletFontView.__super__.constructor.apply(this, arguments);
    }

    FigletFontView.prototype.currentBuffer = null;

    FigletFontView.prototype.fontList = null;

    FigletFontView.content = function() {
      return this.div({
        "class": 'select-list'
      }, (function(_this) {
        return function() {
          _this.subview('filterEditorView', new TextEditorView({
            mini: true
          }));
          _this.div({
            "class": 'error-message',
            outlet: 'error'
          });
          _this.div({
            "class": 'loading',
            outlet: 'loadingArea'
          }, function() {
            _this.span({
              "class": 'loading-message',
              outlet: 'loading'
            });
            return _this.span({
              "class": 'badge',
              outlet: 'loadingBadge'
            });
          });
          return _this.ol({
            "class": 'list-group',
            outlet: 'list'
          });
        };
      })(this));
    };

    FigletFontView.prototype.initialize = function(editor, figletPackage) {
      var previousElement;
      this.figletPackage = figletPackage;
      previousElement = this.element;
      this.element = this[0] = document.createElement('atom-panel');
      this[0].appendChild(previousElement);
      FigletFontView.__super__.initialize.apply(this, arguments);
      this.addClass('modal figlet-font-list overlay from-top');
      this.setEditor(editor);
      return figlet.fonts((function(_this) {
        return function(err, data) {
          _this.setItems(data.map(function(f) {
            return {
              name: f
            };
          }));
          return requestAnimationFrame(function() {
            var itemView;
            itemView = _this.find("li[data-font='" + (atom.config.get('figlet.defaultFont')) + "']");
            return _this.selectItemView(itemView);
          });
        };
      })(this));
    };

    FigletFontView.prototype.getFilterKey = function() {
      return 'name';
    };

    FigletFontView.prototype.viewForItem = function(item) {
      return $$(function() {
        return this.li({
          'data-font': item.name
        }, (function(_this) {
          return function() {
            return _this.raw(item.name);
          };
        })(this));
      });
    };

    FigletFontView.prototype.setEditor = function(editor) {
      this.editor = editor;
      return this.setCurrentBuffer(this.editor.getBuffer());
    };

    FigletFontView.prototype.setCurrentBuffer = function(currentBuffer) {
      this.currentBuffer = currentBuffer;
    };

    FigletFontView.prototype.attach = function() {
      var workspaceElement;
      if (this.editor.getLastSelection().isEmpty()) {
        return;
      }
      this.storeFocusedElement();
      workspaceElement = atom.views.getView(atom.workspace);
      workspaceElement.querySelector('atom-panel-container.modal').appendChild(this.element);
      return this.focusFilterEditor();
    };

    FigletFontView.prototype.detach = function() {
      var _ref1;
      if (!this.hasParent()) {
        return;
      }
      if ((_ref1 = this.previouslyFocusedElement) != null) {
        _ref1.focus();
      }
      return FigletFontView.__super__.detach.apply(this, arguments);
    };

    FigletFontView.prototype.confirmed = function(item) {
      this.figletPackage.lastFont = item.name;
      this.figletPackage.convert(item.name);
      return this.detach();
    };

    FigletFontView.prototype.cancel = function() {
      return this.detach();
    };

    FigletFontView.prototype.destroy = function() {
      this.cancel();
      return this.remove();
    };

    return FigletFontView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9maWdsZXQvbGliL2ZpZ2xldC1mb250LXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdFQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUF3QyxPQUFBLENBQVEsc0JBQVIsQ0FBeEMsRUFBQyxVQUFBLEVBQUQsRUFBSyxzQkFBQSxjQUFMLEVBQXFCLHNCQUFBLGNBQXJCLENBQUE7O0FBQUEsRUFDQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVIsQ0FEVCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHFDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSw2QkFBQSxhQUFBLEdBQWUsSUFBZixDQUFBOztBQUFBLDZCQUNBLFFBQUEsR0FBVSxJQURWLENBQUE7O0FBQUEsSUFHQSxjQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxhQUFQO09BQUwsRUFBMkIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUN6QixVQUFBLEtBQUMsQ0FBQSxPQUFELENBQVMsa0JBQVQsRUFBaUMsSUFBQSxjQUFBLENBQWU7QUFBQSxZQUFBLElBQUEsRUFBTSxJQUFOO1dBQWYsQ0FBakMsQ0FBQSxDQUFBO0FBQUEsVUFDQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sZUFBUDtBQUFBLFlBQXdCLE1BQUEsRUFBUSxPQUFoQztXQUFMLENBREEsQ0FBQTtBQUFBLFVBRUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLFNBQVA7QUFBQSxZQUFrQixNQUFBLEVBQVEsYUFBMUI7V0FBTCxFQUE4QyxTQUFBLEdB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

//# sourceURL=/home/takaaki/.atom/packages/figlet/lib/figlet-font-view.coffee
