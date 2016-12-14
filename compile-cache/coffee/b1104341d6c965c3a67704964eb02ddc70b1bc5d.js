
/*≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

	CONFIG DIRECTORY

	_Variables
	_DistractionFree

 * ≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
 */

(function() {
  module.exports = {
    apply: function() {
      var hideIdleStatus, hideIdleTabs, hideInactiveFiles, hideSpotifiedPackage, root;
      root = document.documentElement;
      hideInactiveFiles = function(boolean) {
        if (boolean) {
          return root.classList.add('hide-tree-items');
        } else {
          return root.classList.remove('hide-tree-items');
        }
      };
      atom.config.onDidChange('genesis-ui.distractionFree.hideFiles', function() {
        return hideInactiveFiles(atom.config.get('genesis-ui.distractionFree.hideFiles'));
      });
      hideInactiveFiles(atom.config.get('genesis-ui.distractionFree.hideFiles'));
      hideIdleTabs = function(boolean) {
        if (boolean) {
          return root.classList.add('hide-idle-tabs');
        } else {
          return root.classList.remove('hide-idle-tabs');
        }
      };
      atom.config.onDidChange('genesis-ui.distractionFree.hideTabs', function() {
        return hideIdleTabs(atom.config.get('genesis-ui.distractionFree.hideTabs'));
      });
      hideIdleTabs(atom.config.get('genesis-ui.distractionFree.hideTabs'));
      hideIdleStatus = function(boolean) {
        if (boolean) {
          return root.classList.add('hide-status-bar');
        } else {
          return root.classList.remove('hide-status-bar');
        }
      };
      atom.config.onDidChange('genesis-ui.distractionFree.hideBottom', function() {
        return hideIdleStatus(atom.config.get('genesis-ui.distractionFree.hideBottom'));
      });
      hideIdleStatus(atom.config.get('genesis-ui.distractionFree.hideBottom'));
      hideSpotifiedPackage = function(boolean) {
        if (boolean) {
          return root.classList.add('hide-spotified');
        } else {
          return root.classList.remove('hide-spotified');
        }
      };
      atom.config.onDidChange('genesis-ui.distractionFree.hideSpotified', function() {
        return hideSpotifiedPackage(atom.config.get('genesis-ui.distractionFree.hideSpotified'));
      });
      return hideSpotifiedPackage(atom.config.get('genesis-ui.distractionFree.hideSpotified'));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9nZW5lc2lzLXVpL2xpYi9jb25maWcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7Ozs7Ozs7R0FBQTtBQUFBO0FBQUE7QUFBQSxFQVNBLE1BQU0sQ0FBQyxPQUFQLEdBQ0M7QUFBQSxJQUFBLEtBQUEsRUFBTyxTQUFBLEdBQUE7QUFNTixVQUFBLDJFQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sUUFBUSxDQUFDLGVBQWhCLENBQUE7QUFBQSxNQVlBLGlCQUFBLEdBQW9CLFNBQUMsT0FBRCxHQUFBO0FBQ25CLFFBQUEsSUFBRyxPQUFIO2lCQUNDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBZixDQUFtQixpQkFBbkIsRUFERDtTQUFBLE1BQUE7aUJBR0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFmLENBQXNCLGlCQUF0QixFQUhEO1NBRG1CO01BQUEsQ0FacEIsQ0FBQTtBQUFBLE1Ba0JBLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixzQ0FBeEIsRUFBZ0UsU0FBQSxHQUFBO2VBQy9ELGlCQUFBLENBQWtCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzQ0FBaEIsQ0FBbEIsRUFEK0Q7TUFBQSxDQUFoRSxDQWxCQSxDQUFBO0FBQUEsTUFxQkEsaUJBQUEsQ0FBa0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNDQUFoQixDQUFsQixDQXJCQSxDQUFBO0FBQUEsTUF3QkEsWUFBQSxHQUFlLFNBQUMsT0FBRCxHQUFBO0FBQ2QsUUFBQSxJQUFHLE9BQUg7aUJBQ0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFmLENBQW1CLGdCQUFuQixFQUREO1NBQUEsTUFBQTtpQkFHQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQWYsQ0FBc0IsZ0JBQXRCLEVBSEQ7U0FEYztNQUFBLENBeEJmLENBQUE7QUFBQSxNQThCQSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0IscUNBQXhCLEVBQStELFNBQUEsR0FBQTtlQUM5RCxZQUFBLENBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHFDQUFoQixDQUFiLEVBRDhEO01BQUEsQ0FBL0QsQ0E5QkEsQ0FBQTtBQUFBLE1BaUNBLFlBQUEsQ0FBYSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUNBQWhCLENBQWIsQ0FqQ0EsQ0FBQTtBQUFBLE1Bb0NBLGNBQUEsR0FBaUIsU0FBQyxPQUFELEdBQUE7QUFDaEIsUUFBQSxJQUFHLE9BQUg7aUJBQ0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFmLENBQW1CLGlCQUFuQixFQUREO1NBQUEsTUFBQTtpQkFHQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQWYsQ0FBc0IsaUJBQXRCLEVBSEQ7U0FEZ0I7TUFBQSxDQXBDakIsQ0FBQTtBQUFBLE1BMENBLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3Qix1Q0FBeEIsRUFBaUUsU0FBQSxHQUFBO2VBQ2hFLGNBQUEsQ0FBZSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUNBQWhCLENBQWYsRUFEZ0U7TUFBQSxDQUFqRSxDQTFDQSxDQUFBO0FBQUEsTUE2Q0EsY0FBQSxDQUFlLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1Q0FBaEIsQ0FBZixDQTdDQSxDQUFBO0FBQUEsTUFnREEsb0JBQUEsR0FBdUIsU0FBQyxPQUFELEdBQUE7QUFDdEIsUUFBQSxJQUFHLE9BQUg7aUJBQ0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFmLENBQW1CLGdCQUFuQixFQUREO1NBQUEsTUFBQTtpQkFHQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQWYsQ0FBc0IsZ0JBQXRCLEVBSEQ7U0FEc0I7TUFBQSxDQWhEdkIsQ0FBQTtBQUFBLE1Bc0RBLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QiwwQ0FBeEIsRUFBb0UsU0FBQSxHQUFBO2VBQ25FLG9CQUFBLENBQXFCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwwQ0FBaEIsQ0FBckIsRUFEbUU7TUFBQSxDQUFwRSxDQXREQSxDQUFBO2FBeURBLG9CQUFBLENBQXFCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwwQ0FBaEIsQ0FBckIsRUEvRE07SUFBQSxDQUFQO0dBVkQsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/takaaki/.atom/packages/genesis-ui/lib/config.coffee
