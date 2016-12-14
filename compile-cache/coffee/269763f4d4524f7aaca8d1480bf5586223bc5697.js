(function() {
  var $, FindLabels, LabelView, SelectListView, fs, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), $ = _ref.$, SelectListView = _ref.SelectListView;

  FindLabels = require('./find-labels');

  fs = require('fs-plus');

  module.exports = LabelView = (function(_super) {
    __extends(LabelView, _super);

    function LabelView() {
      return LabelView.__super__.constructor.apply(this, arguments);
    }

    LabelView.prototype.editor = null;

    LabelView.prototype.panel = null;

    LabelView.prototype.initialize = function() {
      LabelView.__super__.initialize.apply(this, arguments);
      return this.addClass('overlay from-top label-view');
    };

    LabelView.prototype.show = function(editor) {
      var absolutFilePath, basePath, error, file, labels, match, texRootRex, text, _ref1;
      if (editor == null) {
        return;
      }
      this.editor = editor;
      file = editor != null ? (_ref1 = editor.buffer) != null ? _ref1.file : void 0 : void 0;
      basePath = file != null ? file.path : void 0;
      texRootRex = /%!TEX root = (.+)/g;
      while ((match = texRootRex.exec(this.editor.getText()))) {
        absolutFilePath = FindLabels.getAbsolutePath(basePath, match[1]);
        try {
          text = fs.readFileSync(absolutFilePath).toString();
          labels = FindLabels.getLabelsByText(text, absolutFilePath);
        } catch (_error) {
          error = _error;
          atom.notifications.addError('could not load content of ' + absolutFilePath, {
            dismissable: true
          });
          console.log(error);
        }
      }
      if (labels === void 0 || labels.length === 0) {
        labels = FindLabels.getLabelsByText(this.editor.getText(), basePath);
      }
      this.setItems(labels);
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.storeFocusedElement();
      return this.focusFilterEditor();
    };

    LabelView.prototype.hide = function() {
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.hide() : void 0;
    };

    LabelView.prototype.getEmptyMessage = function() {
      return "No labels found";
    };

    LabelView.prototype.getFilterKey = function() {
      return "label";
    };

    LabelView.prototype.viewForItem = function(_arg) {
      var label;
      label = _arg.label;
      return "<li>" + label + "</li>";
    };

    LabelView.prototype.confirmed = function(_arg) {
      var label;
      label = _arg.label;
      this.editor.insertText(label);
      this.restoreFocus();
      return this.hide();
    };

    LabelView.prototype.cancel = function() {
      LabelView.__super__.cancel.apply(this, arguments);
      return this.hide();
    };

    return LabelView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9sYXRleGVyL2xpYi9sYWJlbC12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrREFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsT0FBcUIsT0FBQSxDQUFRLHNCQUFSLENBQXJCLEVBQUMsU0FBQSxDQUFELEVBQUcsc0JBQUEsY0FBSCxDQUFBOztBQUFBLEVBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBRGIsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQUZMLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osZ0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHdCQUFBLE1BQUEsR0FBUSxJQUFSLENBQUE7O0FBQUEsd0JBQ0EsS0FBQSxHQUFPLElBRFAsQ0FBQTs7QUFBQSx3QkFHQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSwyQ0FBQSxTQUFBLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsNkJBQVYsRUFGVTtJQUFBLENBSFosQ0FBQTs7QUFBQSx3QkFPQSxJQUFBLEdBQU0sU0FBQyxNQUFELEdBQUE7QUFDSixVQUFBLDhFQUFBO0FBQUEsTUFBQSxJQUFjLGNBQWQ7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxNQURWLENBQUE7QUFBQSxNQUVBLElBQUEsMkRBQXFCLENBQUUsc0JBRnZCLENBQUE7QUFBQSxNQUdBLFFBQUEsa0JBQVcsSUFBSSxDQUFFLGFBSGpCLENBQUE7QUFBQSxNQUlBLFVBQUEsR0FBYSxvQkFKYixDQUFBO0FBS0EsYUFBSyxDQUFDLEtBQUEsR0FBUSxVQUFVLENBQUMsSUFBWCxDQUFnQixJQUFDLENBQUEs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

//# sourceURL=/home/takaaki/.atom/packages/latexer/lib/label-view.coffee
