(function() {
  var $, ConflictedEditor, GitOps, util, _;

  $ = require('space-pen').$;

  _ = require('underscore-plus');

  ConflictedEditor = require('../lib/conflicted-editor').ConflictedEditor;

  GitOps = require('../lib/git').GitOps;

  util = require('./util');

  describe('ConflictedEditor', function() {
    var cursors, detectDirty, editor, editorView, linesForMarker, m, pkg, state, _ref;
    _ref = [], editorView = _ref[0], editor = _ref[1], state = _ref[2], m = _ref[3], pkg = _ref[4];
    cursors = function() {
      var c, _i, _len, _ref1, _results;
      _ref1 = editor.getCursors();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        c = _ref1[_i];
        _results.push(c.getBufferPosition().toArray());
      }
      return _results;
    };
    detectDirty = function() {
      var sv, _i, _len, _ref1, _results;
      _ref1 = m.coveringViews;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        sv = _ref1[_i];
        if ('detectDirty' in sv) {
          _results.push(sv.detectDirty());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    linesForMarker = function(marker) {
      var fromBuffer, fromScreen, result, row, toBuffer, toScreen, _i, _len, _ref1;
      fromBuffer = marker.getTailBufferPosition();
      fromScreen = editor.screenPositionForBufferPosition(fromBuffer);
      toBuffer = marker.getHeadBufferPosition();
      toScreen = editor.screenPositionForBufferPosition(toBuffer);
      result = $();
      _ref1 = _.range(fromScreen.row, toScreen.row);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        row = _ref1[_i];
        result = result.add(editorView.component.lineNodeForScreenRow(row));
      }
      return result;
    };
    beforeEach(function() {
      return pkg = util.pkgEmitter();
    });
    afterEach(function() {
      pkg.dispose();
      return m != null ? m.cleanup() : void 0;
    });
    describe('with a merge conflict', function() {
      beforeEach(function() {
        return util.openPath("triple-2way-diff.txt", function(v) {
          editorView = v;
          editorView.getFirstVisibleScreenRow = function() {
            return 0;
          };
          editorView.getLastVisibleScreenRow = function() {
            return 999;
          };
          editor = editorView.getModel();
          state = {
            isRebase: false,
            relativize: function(filepath) {
              return filepath;
            },
            context: {
              isStaged: function(filepath) {
                return Promise.resolve(false);
              }
            }
          };
          m = new ConflictedEditor(state, pkg, editor);
          return m.mark();
        });
      });
      it('attaches two SideViews and a NavigationView for each conflict', function() {
        expect($(editorView).find('.side').length).toBe(6);
        return expect($(editorView).find('.navigation').length).toBe(3);
      });
      it('locates the correct lines', function() {
        var lines;
        lines = linesForMarker(m.conflicts[1].ours.marker);
        return expect(lines.text()).toBe("My middle changes");
      });
      it('applies the "ours" class to our sides of conflicts', function() {
        var lines;
        lines = linesForMarker(m.conflicts[0].ours.marker);
        return expect(lines.hasClass('conflict-ours')).toBe(true);
      });
      it('applies the "theirs" class to their sides of conflicts', function() {
        var lines;
        lines = linesForMarker(m.conflicts[0].theirs.marker);
        return expect(lines.hasClass('conflict-theirs')).toBe(true);
      });
      it('applies the "dirty" class to modified sides', function() {
        var lines;
        editor.setCursorBufferPosition([14, 0]);
        editor.insertText("Make conflict 1 dirty");
        detectDirty();
        lines = linesForMarker(m.conflicts[1].ours.marker);
        expect(lines.hasClass('conflict-dirty')).toBe(true);
        return expect(lines.hasClass('conflict-ours')).toBe(false);
      });
      it('broadcasts the onDidResolveConflict event', function() {
        var event;
        event = null;
        pkg.onDidResolveConflict(function(e) {
          return event = e;
        });
        m.conflicts[2].theirs.resolve();
        expect(event.file).toBe(editor.getPath());
        expect(event.total).toBe(3);
        expect(event.resolved).toBe(1);
        return expect(event.source).toBe(m);
      });
      it('tracks the active conflict side', function() {
        editor.setCursorBufferPosition([11, 0]);
        expect(m.active()).toEqual([]);
        editor.setCursorBufferPosition([14, 5]);
        return expect(m.active()).toEqual([m.conflicts[1].ours]);
      });
      describe('with an active merge conflict', function() {
        var active;
        active = [][0];
        beforeEach(function() {
          editor.setCursorBufferPosition([14, 5]);
          return active = m.conflicts[1];
        });
        it('accepts the current side with merge-conflicts:accept-current', function() {
          atom.commands.dispatch(editorView, 'merge-conflicts:accept-current');
          return expect(active.resolution).toBe(active.ours);
        });
        it("does nothing if you have cursors in both sides", function() {
          editor.addCursorAtBufferPosition([16, 2]);
          atom.commands.dispatch(editorView, 'merge-conflicts:accept-current');
          return expect(active.resolution).toBeNull();
        });
        it('accepts "ours" on merge-conflicts:accept-ours', function() {
          atom.commands.dispatch(editorView, 'merge-conflicts:accept-current');
          return expect(active.resolution).toBe(active.ours);
        });
        it('accepts "theirs" on merge-conflicts:accept-theirs', function() {
          atom.commands.dispatch(editorView, 'merge-conflicts:accept-theirs');
          return expect(active.resolution).toBe(active.theirs);
        });
        it('jumps to the next unresolved on merge-conflicts:next-unresolved', function() {
          atom.commands.dispatch(editorView, 'merge-conflicts:next-unresolved');
          return expect(cursors()).toEqual([[22, 0]]);
        });
        it('jumps to the previous unresolved on merge-conflicts:previous-unresolved', function() {
          atom.commands.dispatch(editorView, 'merge-conflicts:previous-unresolved');
          return expect(cursors()).toEqual([[5, 0]]);
        });
        it('reverts a dirty hunk on merge-conflicts:revert-current', function() {
          editor.insertText('this is a change');
          detectDirty();
          expect(active.ours.isDirty).toBe(true);
          atom.commands.dispatch(editorView, 'merge-conflicts:revert-current');
          detectDirty();
          return expect(active.ours.isDirty).toBe(false);
        });
        it('accepts ours-then-theirs on merge-conflicts:ours-then-theirs', function() {
          var t;
          atom.commands.dispatch(editorView, 'merge-conflicts:ours-then-theirs');
          expect(active.resolution).toBe(active.ours);
          t = editor.getTextInBufferRange(active.resolution.marker.getBufferRange());
          return expect(t).toBe("My middle changes\nYour middle changes\n");
        });
        return it('accepts theirs-then-ours on merge-conflicts:theirs-then-ours', function() {
          var t;
          atom.commands.dispatch(editorView, 'merge-conflicts:theirs-then-ours');
          expect(active.resolution).toBe(active.theirs);
          t = editor.getTextInBufferRange(active.resolution.marker.getBufferRange());
          return expect(t).toBe("Your middle changes\nMy middle changes\n");
        });
      });
      describe('without an active conflict', function() {
        beforeEach(function() {
          return editor.setCursorBufferPosition([11, 6]);
        });
        it('no-ops the resolution commands', function() {
          var c, e, _i, _len, _ref1, _results;
          _ref1 = ['accept-current', 'accept-ours', 'accept-theirs', 'revert-current'];
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            e = _ref1[_i];
            atom.commands.dispatch(editorView, "merge-conflicts:" + e);
            expect(m.active()).toEqual([]);
            _results.push((function() {
              var _j, _len1, _ref2, _results1;
              _ref2 = m.conflicts;
              _results1 = [];
              for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                c = _ref2[_j];
                _results1.push(expect(c.isResolved()).toBe(false));
              }
              return _results1;
            })());
          }
          return _results;
        });
        it('jumps to the next unresolved on merge-conflicts:next-unresolved', function() {
          expect(m.active()).toEqual([]);
          atom.commands.dispatch(editorView, 'merge-conflicts:next-unresolved');
          return expect(cursors()).toEqual([[14, 0]]);
        });
        return it('jumps to the previous unresolved on merge-conflicts:next-unresolved', function() {
          atom.commands.dispatch(editorView, 'merge-conflicts:previous-unresolved');
          return expect(cursors()).toEqual([[5, 0]]);
        });
      });
      describe('when the resolution is complete', function() {
        beforeEach(function() {
          var c, _i, _len, _ref1, _results;
          _ref1 = m.conflicts;
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            c = _ref1[_i];
            _results.push(c.ours.resolve());
          }
          return _results;
        });
        it('removes all of the CoveringViews', function() {
          expect($(editorView).find('.overlayer .side').length).toBe(0);
          return expect($(editorView).find('.overlayer .navigation').length).toBe(0);
        });
        return it('appends a ResolverView to the workspace', function() {
          var workspaceView;
          workspaceView = atom.views.getView(atom.workspace);
          return expect($(workspaceView).find('.resolver').length).toBe(1);
        });
      });
      return describe('when all resolutions are complete', function() {
        beforeEach(function() {
          var c, _i, _len, _ref1;
          _ref1 = m.conflicts;
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            c = _ref1[_i];
            c.theirs.resolve();
          }
          return pkg.didCompleteConflictResolution();
        });
        it('destroys all Conflict markers', function() {
          var c, marker, _i, _len, _ref1, _results;
          _ref1 = m.conflicts;
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            c = _ref1[_i];
            _results.push((function() {
              var _j, _len1, _ref2, _results1;
              _ref2 = c.markers();
              _results1 = [];
              for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                marker = _ref2[_j];
                _results1.push(expect(marker.isDestroyed()).toBe(true));
              }
              return _results1;
            })());
          }
          return _results;
        });
        return it('removes the .conflicted class', function() {
          return expect($(editorView).hasClass('conflicted')).toBe(false);
        });
      });
    });
    return describe('with a rebase conflict', function() {
      var active;
      active = [][0];
      beforeEach(function() {
        return util.openPath("rebase-2way-diff.txt", function(v) {
          editorView = v;
          editorView.getFirstVisibleScreenRow = function() {
            return 0;
          };
          editorView.getLastVisibleScreenRow = function() {
            return 999;
          };
          editor = editorView.getModel();
          state = {
            isRebase: true,
            relativize: function(filepath) {
              return filepath;
            },
            context: {
              isStaged: function() {
                return Promise.resolve(false);
              }
            }
          };
          m = new ConflictedEditor(state, pkg, editor);
          m.mark();
          editor.setCursorBufferPosition([3, 14]);
          return active = m.conflicts[0];
        });
      });
      it('accepts theirs-then-ours on merge-conflicts:theirs-then-ours', function() {
        var t;
        atom.commands.dispatch(editorView, 'merge-conflicts:theirs-then-ours');
        expect(active.resolution).toBe(active.theirs);
        t = editor.getTextInBufferRange(active.resolution.marker.getBufferRange());
        return expect(t).toBe("These are your changes\nThese are my changes\n");
      });
      return it('accepts ours-then-theirs on merge-conflicts:ours-then-theirs', function() {
        var t;
        atom.commands.dispatch(editorView, 'merge-conflicts:ours-then-theirs');
        expect(active.resolution).toBe(active.ours);
        t = editor.getTextInBufferRange(active.resolution.marker.getBufferRange());
        return expect(t).toBe("These are my changes\nThese are your changes\n");
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvc3BlYy9jb25mbGljdGVkLWVkaXRvci1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxvQ0FBQTs7QUFBQSxFQUFDLElBQUssT0FBQSxDQUFRLFdBQVIsRUFBTCxDQUFELENBQUE7O0FBQUEsRUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBREosQ0FBQTs7QUFBQSxFQUdDLG1CQUFvQixPQUFBLENBQVEsMEJBQVIsRUFBcEIsZ0JBSEQsQ0FBQTs7QUFBQSxFQUlDLFNBQVUsT0FBQSxDQUFRLFlBQVIsRUFBVixNQUpELENBQUE7O0FBQUEsRUFLQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FMUCxDQUFBOztBQUFBLEVBT0EsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtBQUMzQixRQUFBLDZFQUFBO0FBQUEsSUFBQSxPQUFzQyxFQUF0QyxFQUFDLG9CQUFELEVBQWEsZ0JBQWIsRUFBcUIsZUFBckIsRUFBNEIsV0FBNUIsRUFBK0IsYUFBL0IsQ0FBQTtBQUFBLElBRUEsT0FBQSxHQUFVLFNBQUEsR0FBQTtBQUFHLFVBQUEsNEJBQUE7QUFBQTtBQUFBO1dBQUEsNENBQUE7c0JBQUE7QUFBQSxzQkFBQSxDQUFDLENBQUMsaUJBQUYsQ0FBQSxDQUFxQixDQUFDLE9BQXRCLENBQUEsRUFBQSxDQUFBO0FBQUE7c0JBQUg7SUFBQSxDQUZWLENBQUE7QUFBQSxJQUlBLFdBQUEsR0FBYyxTQUFBLEdBQUE7QUFDWixVQUFBLDZCQUFBO0FBQUE7QUFBQTtXQUFBLDRDQUFBO3VCQUFBO0FBQ0UsUUFBQSxJQUFvQixhQUFBLElBQWlCLEVBQXJDO3dCQUFBLEVBQUUsQ0FBQyxXQUFILENBQUEsR0FBQTtTQUFBLE1BQUE7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

//# sourceURL=/home/takaaki/.atom/packages/merge-conflicts/spec/conflicted-editor-spec.coffee
