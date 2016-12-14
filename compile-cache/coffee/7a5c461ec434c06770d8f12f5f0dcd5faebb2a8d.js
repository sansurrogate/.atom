(function() {
  var Citation, CiteView, FindLabels, LabelView, Latexer, fs;

  Latexer = require('../lib/latexer');

  LabelView = require('../lib/label-view');

  CiteView = require('../lib/cite-view');

  Citation = require('../lib/citation');

  FindLabels = require('../lib/find-labels');

  fs = require('fs-plus');

  describe("Latexer", function() {
    describe("finding labels", function() {
      return it("gets the correct labels", function() {
        var i, label, labels, text, _i, _len, _results;
        text = "\\label{value0} some text \\label{value1} \\other{things} \\label{value2}";
        labels = FindLabels.getLabelsByText(text);
        _results = [];
        for (i = _i = 0, _len = labels.length; _i < _len; i = ++_i) {
          label = labels[i];
          _results.push(expect(label.label).toBe("value" + i));
        }
        return _results;
      });
    });
    describe("new citation is created", function() {
      return it("extracts the correct values", function() {
        var cite, i, testCite, _i, _len, _ref, _results;
        testCite = "@test {key,\nfield0 = {vfield0},\nfield1 = {vfield1},\nfield2 = \"vfield2\",\nfield3 = \"vfield3\"\n}";
        cite = new Citation;
        cite.parse(testCite);
        expect(cite.get("key")).toBe("key");
        _ref = [0, 1, 2, 3];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];
          _results.push(expect(cite.get("field" + i)).toBe("vfield" + i));
        }
        return _results;
      });
    });
    describe("the views", function() {
      var bibText, citeText, editor, labelText, workspaceElement, _ref;
      _ref = [], workspaceElement = _ref[0], editor = _ref[1];
      citeText = "\\bibliography{bibfile.bib}\\cite{";
      labelText = "\\label{value}\\ref{";
      bibText = "@{key0, title = {title0}, author = {author0} } comments here @{key1, title = {title1}, author = {author1} }";
      beforeEach(function() {
        runs(function() {
          return workspaceElement = atom.views.getView(atom.workspace);
        });
        waitsFor(function() {
          return workspaceElement;
        });
        runs(function() {
          return jasmine.attachToDOM(workspaceElement);
        });
        waitsForPromise(function() {
          return atom.workspace.open("sample.tex");
        });
        waitsFor(function() {
          return editor = atom.workspace.getActiveTextEditor();
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage("latexer");
        });
        return runs(function() {
          spyOn(FindLabels, "getAbsolutePath").andReturn("bibfile.bib");
          return spyOn(fs, "readFileSync").andReturn(bibText);
        });
      });
      describe("typing \\ref{", function() {
        return it("shows the labels to select from", function() {
          var displayedLabels, labelElement;
          editor.setText(labelText);
          advanceClock(editor.getBuffer().getStoppedChangingDelay());
          labelElement = workspaceElement.querySelector('.label-view');
          expect(labelElement).toExist();
          displayedLabels = labelElement.querySelectorAll('li');
          expect(displayedLabels.length).toBe(1);
          return expect(displayedLabels[0].textContent).toBe("value");
        });
      });
      return describe("typing \\cite{", function() {
        return it("show the bibliography", function() {
          var cite, citeElement, displayedCites, i, info, _i, _len, _results;
          editor.setText(citeText);
          advanceClock(editor.getBuffer().getStoppedChangingDelay());
          expect(fs.readFileSync).toHaveBeenCalledWith("bibfile.bib");
          citeElement = workspaceElement.querySelector('.cite-view');
          expect(citeElement).toExist();
          displayedCites = citeElement.querySelectorAll('li');
          expect(displayedCites.length).toBe(2);
          _results = [];
          for (i = _i = 0, _len = displayedCites.length; _i < _len; i = ++_i) {
            cite = displayedCites[i];
            info = cite.querySelectorAll("span");
            expect(info.length).toBe(2);
            expect(info[0].textContent).toBe("title" + i);
            _results.push(expect(info[1].textContent).toBe("author" + i));
          }
          return _results;
        });
      });
    });
    return describe("typing \\begin{evironment} or \\[", function() {
      var editor, workspaceElement, _ref;
      _ref = [], workspaceElement = _ref[0], editor = _ref[1];
      beforeEach(function() {
        runs(function() {
          return workspaceElement = atom.views.getView(atom.workspace);
        });
        waitsFor(function() {
          return workspaceElement;
        });
        runs(function() {
          return jasmine.attachToDOM(workspaceElement);
        });
        waitsForPromise(function() {
          return atom.workspace.open("sample.tex");
        });
        waitsFor(function() {
          return editor = atom.workspace.getActiveTextEditor();
        });
        return waitsForPromise(function() {
          return atom.packages.activatePackage("latexer");
        });
      });
      it("autocompletes the environment", function() {
        editor.setText("\\begin{env}\n");
        advanceClock(editor.getBuffer().getStoppedChangingDelay());
        expect(editor.getText()).toBe("\\begin{env}\n\n\\end{env}");
        editor.setText("\\[\n");
        advanceClock(editor.getBuffer().getStoppedChangingDelay());
        return expect(editor.getText()).toBe("\\[\n\n\\]");
      });
      it("ignores comments", function() {
        editor.setText("%\\begin{env}\n");
        advanceClock(editor.getBuffer().getStoppedChangingDelay());
        expect(editor.getText()).toBe("%\\begin{env}\n");
        editor.setText("%\\[\n");
        advanceClock(editor.getBuffer().getStoppedChangingDelay());
        return expect(editor.getText()).toBe("%\\[\n");
      });
      return it("ignores extra backslashes for \\[", function() {
        editor.setText("\\\\[\n");
        advanceClock(editor.getBuffer().getStoppedChangingDelay());
        return expect(editor.getText()).toBe("\\\\[\n");
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9sYXRleGVyL3NwZWMvbGF0ZXhlci1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxzREFBQTs7QUFBQSxFQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsZ0JBQVIsQ0FBVixDQUFBOztBQUFBLEVBQ0EsU0FBQSxHQUFZLE9BQUEsQ0FBUSxtQkFBUixDQURaLENBQUE7O0FBQUEsRUFFQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGtCQUFSLENBRlgsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVIsQ0FIWCxDQUFBOztBQUFBLEVBSUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxvQkFBUixDQUpiLENBQUE7O0FBQUEsRUFLQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FMTCxDQUFBOztBQUFBLEVBT0EsUUFBQSxDQUFTLFNBQVQsRUFBb0IsU0FBQSxHQUFBO0FBRWxCLElBQUEsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUEsR0FBQTthQUN6QixFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQSxHQUFBO0FBQzVCLFlBQUEsMENBQUE7QUFBQSxRQUFBLElBQUEsR0FBTywyRUFBUCxDQUFBO0FBQUEsUUFDQSxNQUFBLEdBQVMsVUFBVSxDQUFDLGVBQVgsQ0FBMkIsSUFBM0IsQ0FEVCxDQUFBO0FBRUE7YUFBQSxxREFBQTs0QkFBQTtBQUNFLHdCQUFBLE1BQUEsQ0FBTyxLQUFLLENBQUMsS0FBYixDQUFtQixDQUFDLElBQXBCLENBQTBCLE9BQUEsR0FBTyxDQUFqQyxFQUFBLENBREY7QUFBQTt3QkFINEI7TUFBQSxDQUE5QixFQUR5QjtJQUFBLENBQTNCLENBQUEsQ0FBQTtBQUFBLElBT0EsUUFBQSxDQUFTLHlCQUFULEVBQW9DLFNBQUEsR0FBQTth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

//# sourceURL=/home/takaaki/.atom/packages/latexer/spec/latexer-spec.coffee
