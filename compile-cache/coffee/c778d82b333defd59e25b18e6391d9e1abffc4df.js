(function() {
  var ProjectDialog;

  ProjectDialog = require('../../lib/dialogs/project-dialog');

  describe("ProjectDialog", function() {
    var gitControlView, projectDialog, stashPopSpy, stashSaveSpy;
    projectDialog = null;
    stashSaveSpy = null;
    stashPopSpy = null;
    gitControlView = null;
    beforeEach(function() {
      return projectDialog = new ProjectDialog();
    });
    it("should correctly set projectList when repo path is unix-style", function() {
      spyOn(atom.project, 'getRepositories').andReturn([
        {
          path: '/some/path/repository-name/.git'
        }
      ]);
      projectDialog.activate();
      expect(projectDialog.projectList).toBeTruthy();
      expect(projectDialog.projectList.length).toBe(1);
      return expect(projectDialog.projectList[0].textContent).toBe('repository-name');
    });
    return it("should correctly set projectList when repo path is windows-style", function() {
      spyOn(atom.project, 'getRepositories').andReturn([
        {
          path: 'c:\\some\\path\\repository-name\\.git'
        }
      ]);
      projectDialog.activate();
      expect(projectDialog.projectList).toBeTruthy();
      expect(projectDialog.projectList.length).toBe(1);
      return expect(projectDialog.projectList[0].textContent).toBe('repository-name');
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9zcGVjL2RpYWxvZ3MvcHJvamVjdC1kaWFsb2ctc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsYUFBQTs7QUFBQSxFQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtDQUFSLENBQWhCLENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBLEdBQUE7QUFDeEIsUUFBQSx3REFBQTtBQUFBLElBQUEsYUFBQSxHQUFnQixJQUFoQixDQUFBO0FBQUEsSUFDQSxZQUFBLEdBQWUsSUFEZixDQUFBO0FBQUEsSUFFQSxXQUFBLEdBQWMsSUFGZCxDQUFBO0FBQUEsSUFHQSxjQUFBLEdBQWlCLElBSGpCLENBQUE7QUFBQSxJQUtBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7YUFDVCxhQUFBLEdBQW9CLElBQUEsYUFBQSxDQUFBLEVBRFg7SUFBQSxDQUFYLENBTEEsQ0FBQTtBQUFBLElBUUEsRUFBQSxDQUFHLCtEQUFILEVBQW9FLFNBQUEsR0FBQTtBQUNsRSxNQUFBLEtBQUEsQ0FBTSxJQUFJLENBQUMsT0FBWCxFQUFvQixpQkFBcEIsQ0FBc0MsQ0FBQyxTQUF2QyxDQUFpRDtRQUFDO0FBQUEsVUFDaEQsSUFBQSxFQUFLLGlDQUQyQztTQUFEO09BQWpELENBQUEsQ0FBQTtBQUFBLE1BR0EsYUFBYSxDQUFDLFFBQWQsQ0FBQSxDQUhBLENBQUE7QUFBQSxNQUlBLE1BQUEsQ0FBTyxhQUFhLENBQUMsV0FBckIsQ0FBaUMsQ0FBQyxVQUFsQyxDQUFBLENBSkEsQ0FBQTtBQUFBLE1BS0EsTUFBQSxDQUFPLGFBQWEsQ0FBQyxXQUFXLENBQUMsTUFBakMsQ0FBd0MsQ0FBQyxJQUF6QyxDQUE4QyxDQUE5QyxDQUxBLENBQUE7YUFNQSxNQUFBLENBQU8sYUFBYSxDQUFDLFdBQVksQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFwQyxDQUFnRCxDQUFDLElBQWpELENBQXNELGlCQUF0RCxFQVBrRTtJQUFBLENBQXBFLENBUkEsQ0FBQTtXQWlCQSxFQUFBLENBQUcsa0VBQUgsRUFBdUUsU0FBQSxHQUFBO0FBQ3JFLE1BQUEsS0FBQSxDQUFNLElBQUksQ0FBQyxPQUFYLEVBQW9CLGlCQUFwQixDQUFzQyxDQUFDLFNBQXZDLENBQWlEO1FBQUM7QUFBQSxVQUNoRCxJQUFBLEVBQUssdUNBRDJDO1NBQUQ7T0FBakQsQ0FBQSxDQUFBO0FBQUEsTUFHQSxhQUFhLENBQUMsUUFBZCxDQUFBLENBSEEsQ0FBQTtBQUFBLE1BSUEsTUFBQSxDQUFPLGFBQWEsQ0FBQyxXQUFyQixDQUFpQyxDQUFDLFVBQWxDLENBQUEsQ0FKQSxDQUFBO0FBQUEsTUFLQSxNQUFBLENBQU8sYUFBYSxDQUFDLFdBQVcsQ0FBQyxNQUFqQyxDQUF3QyxDQUFDLElBQXpDLENBQThDLENBQTlDLENBTEEsQ0FBQTthQU1BLE1BQUEsQ0FBTyxhQUFhLENBQUMsV0FBWSxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQXBDLENBQWdELENBQUMsSUFBakQsQ0FBc0QsaUJBQXRELEVBUHFFO0lBQUEsQ0FBdkUsRUFsQndCO0VBQUEsQ0FBMUIsQ0FGQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/takaaki/.atom/packages/git-control/spec/dialogs/project-dialog-spec.coffee
