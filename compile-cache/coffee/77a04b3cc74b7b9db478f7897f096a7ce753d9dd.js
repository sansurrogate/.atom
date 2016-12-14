(function() {
  var $, $$, Citation, CiteView, FindLabels, SelectListView, fs, pathModule, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), SelectListView = _ref.SelectListView, $ = _ref.$, $$ = _ref.$$;

  Citation = require('./citation');

  FindLabels = require('./find-labels');

  fs = require('fs-plus');

  pathModule = require('path');

  module.exports = CiteView = (function(_super) {
    __extends(CiteView, _super);

    function CiteView() {
      return CiteView.__super__.constructor.apply(this, arguments);
    }

    CiteView.prototype.editor = null;

    CiteView.prototype.panel = null;

    CiteView.prototype.initialize = function() {
      CiteView.__super__.initialize.apply(this, arguments);
      return this.addClass('overlay from-top cite-view');
    };

    CiteView.prototype.show = function(editor) {
      var cites;
      if (editor == null) {
        return;
      }
      this.editor = editor;
      cites = this.getCitations();
      this.setItems(cites);
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.storeFocusedElement();
      return this.focusFilterEditor();
    };

    CiteView.prototype.getEmptyMessage = function() {
      return "No citations found";
    };

    CiteView.prototype.getFilterKey = function() {
      return "filterKey";
    };

    CiteView.prototype.viewForItem = function(_arg) {
      var author, key, title;
      title = _arg.title, key = _arg.key, author = _arg.author;
      return "<li><span style='display:block;'>" + title + "</span><span style='display:block;font-size:xx-small;'>" + author + "</span></li>";
    };

    CiteView.prototype.hide = function() {
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.hide() : void 0;
    };

    CiteView.prototype.confirmed = function(_arg) {
      var author, key, title;
      title = _arg.title, key = _arg.key, author = _arg.author;
      this.editor.insertText(key);
      this.restoreFocus();
      return this.hide();
    };

    CiteView.prototype.cancel = function() {
      CiteView.__super__.cancel.apply(this, arguments);
      return this.hide();
    };

    CiteView.prototype.getCitations = function() {
      var bibFile, bibFiles, cites, _i, _len;
      cites = [];
      bibFiles = this.getBibFiles();
      for (_i = 0, _len = bibFiles.length; _i < _len; _i++) {
        bibFile = bibFiles[_i];
        cites = cites.concat(this.getCitationsFromPath(bibFile));
      }
      return cites;
    };

    CiteView.prototype.getBibFiles = function() {
      var absolutFilePath, activePaneItemPath, basePath, bfpath, bibFiles, editor, error, file, match, result, texRootRex, text, _i, _len, _ref1;
      editor = atom.workspace.getActivePaneItem();
      file = editor != null ? (_ref1 = editor.buffer) != null ? _ref1.file : void 0 : void 0;
      basePath = file != null ? file.path : void 0;
      activePaneItemPath = basePath;
      if (basePath.lastIndexOf(pathModule.sep) !== -1) {
        basePath = basePath.substring(0, basePath.lastIndexOf(pathModule.sep));
      }
      bibFiles = this.getBibFileFromText(this.editor.getText());
      if (bibFiles === null || bibFiles.length === 0) {
        texRootRex = /%(\s+)?!TEX root(\s+)?=(\s+)?(.+)/g;
        while ((match = texRootRex.exec(this.editor.getText()))) {
          absolutFilePath = FindLabels.getAbsolutePath(activePaneItemPath, match[4]);
          basePath = pathModule.dirname(absolutFilePath);
          try {
            text = fs.readFileSync(absolutFilePath).toString();
            bibFiles = this.getBibFileFromText(text);
            if (bibFiles !== null && bibFiles.length !== 0) {
              break;
            }
          } catch (_error) {
            error = _error;
            atom.notifications.addError('could not load content ' + match[4], {
              dismissable: true
            });
            console.log(error);
          }
        }
      }
      result = [];
      basePath = basePath + pathModule.sep;
      for (_i = 0, _len = bibFiles.length; _i < _len; _i++) {
        bfpath = bibFiles[_i];
        result = result.concat(FindLabels.getAbsolutePath(basePath, bfpath));
      }
      return result;
    };

    CiteView.prototype.getBibFileFromText = function(text) {
      var bibFiles, bibRex, found, foundBibs, match, _i, _len;
      bibFiles = [];
      bibRex = /\\(?:bibliography|addbibresource|addglobalbib){([^}]+)}/g;
      while ((match = bibRex.exec(text))) {
        foundBibs = match[1].split(",");
        for (_i = 0, _len = foundBibs.length; _i < _len; _i++) {
          found = foundBibs[_i];
          if (!/\.bib$/.test(found)) {
            found += ".bib";
          }
          bibFiles = bibFiles.concat(found);
        }
      }
      return bibFiles;
    };

    CiteView.prototype.getCitationsFromPath = function(path) {
      var cite, cites, ct, error, filter, key, text, textSplit, _i, _j, _len, _len1, _ref1;
      cites = [];
      text = null;
      try {
        text = fs.readFileSync(path).toString();
      } catch (_error) {
        error = _error;
        console.log(error);
        return [];
      }
      if (text == null) {
        return [];
      }
      text = text.replace(/(\r\n|\n|\r)/gm, "");
      textSplit = text.split("@");
      textSplit.shift();
      for (_i = 0, _len = textSplit.length; _i < _len; _i++) {
        cite = textSplit[_i];
        if (cite == null) {
          continue;
        }
        ct = new Citation;
        ct.parse(cite);
        filter = "";
        _ref1 = atom.config.get("latexer.parameters_to_search_citations_by");
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          key = _ref1[_j];
          filter += ct.get(key) + " ";
        }
        cites.push({
          title: ct.get("title"),
          key: ct.get("key"),
          author: ct.get("author"),
          filterKey: filter
        });
      }
      return cites;
    };

    return CiteView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9sYXRleGVyL2xpYi9jaXRlLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJFQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUEwQixPQUFBLENBQVEsc0JBQVIsQ0FBMUIsRUFBQyxzQkFBQSxjQUFELEVBQWlCLFNBQUEsQ0FBakIsRUFBb0IsVUFBQSxFQUFwQixDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUVBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUixDQUZiLENBQUE7O0FBQUEsRUFHQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FITCxDQUFBOztBQUFBLEVBSUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxNQUFSLENBSmIsQ0FBQTs7QUFBQSxFQU1BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiwrQkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsdUJBQUEsTUFBQSxHQUFRLElBQVIsQ0FBQTs7QUFBQSx1QkFDQSxLQUFBLEdBQU8sSUFEUCxDQUFBOztBQUFBLHVCQUdBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLDBDQUFBLFNBQUEsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSw0QkFBVixFQUZVO0lBQUEsQ0FIWixDQUFBOztBQUFBLHVCQU9BLElBQUEsR0FBTSxTQUFDLE1BQUQsR0FBQTtBQUNKLFVBQUEsS0FBQTtBQUFBLE1BQUEsSUFBYyxjQUFkO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFELEdBQVUsTUFEVixDQUFBO0FBQUEsTUFFQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQUZSLENBQUE7QUFBQSxNQUdB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

//# sourceURL=/home/takaaki/.atom/packages/latexer/lib/cite-view.coffee
