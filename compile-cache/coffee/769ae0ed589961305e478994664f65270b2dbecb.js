(function() {
  var MergeListView, git;

  git = require('../git');

  MergeListView = require('../views/merge-list-view');

  module.exports = function(repo, arg) {
    var args, extraArgs, noFastForward, ref, remote;
    ref = arg != null ? arg : {}, remote = ref.remote, noFastForward = ref.noFastForward;
    extraArgs = noFastForward ? ['--no-ff'] : [];
    args = ['branch', '--no-color'];
    if (remote) {
      args.push('-r');
    }
    return git.cmd(args, {
      cwd: repo.getWorkingDirectory()
    }).then(function(data) {
      return new MergeListView(repo, data, extraArgs);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1tZXJnZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixhQUFBLEdBQWdCLE9BQUEsQ0FBUSwwQkFBUjs7RUFFaEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxJQUFELEVBQU8sR0FBUDtBQUNmLFFBQUE7d0JBRHNCLE1BQXdCLElBQXZCLHFCQUFRO0lBQy9CLFNBQUEsR0FBZSxhQUFILEdBQXNCLENBQUMsU0FBRCxDQUF0QixHQUF1QztJQUNuRCxJQUFBLEdBQU8sQ0FBQyxRQUFELEVBQVcsWUFBWDtJQUNQLElBQWtCLE1BQWxCO01BQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWLEVBQUE7O1dBQ0EsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEVBQWM7TUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtLQUFkLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO2FBQWMsSUFBQSxhQUFBLENBQWMsSUFBZCxFQUFvQixJQUFwQixFQUEwQixTQUExQjtJQUFkLENBRE47RUFKZTtBQUhqQiIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbk1lcmdlTGlzdFZpZXcgPSByZXF1aXJlICcuLi92aWV3cy9tZXJnZS1saXN0LXZpZXcnXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8sIHtyZW1vdGUsIG5vRmFzdEZvcndhcmR9PXt9KSAtPlxuICBleHRyYUFyZ3MgPSBpZiBub0Zhc3RGb3J3YXJkIHRoZW4gWyctLW5vLWZmJ10gZWxzZSBbXVxuICBhcmdzID0gWydicmFuY2gnLCAnLS1uby1jb2xvciddXG4gIGFyZ3MucHVzaCAnLXInIGlmIHJlbW90ZVxuICBnaXQuY21kKGFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gIC50aGVuIChkYXRhKSAtPiBuZXcgTWVyZ2VMaXN0VmlldyhyZXBvLCBkYXRhLCBleHRyYUFyZ3MpXG4iXX0=
