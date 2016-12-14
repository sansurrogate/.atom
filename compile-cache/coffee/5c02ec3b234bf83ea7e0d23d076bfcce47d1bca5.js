(function() {
  var Dialog, ProjectDialog, git, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dialog = require('./dialog');

  git = require('../git');

  path = require('path');

  module.exports = ProjectDialog = (function(_super) {
    __extends(ProjectDialog, _super);

    function ProjectDialog() {
      return ProjectDialog.__super__.constructor.apply(this, arguments);
    }

    ProjectDialog.content = function() {
      return this.div({
        "class": 'dialog'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'heading'
          }, function() {
            _this.i({
              "class": 'icon x clickable',
              click: 'cancel'
            });
            return _this.strong('Project');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.label('Current Project');
            return _this.select({
              outlet: 'projectList'
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'changeProject'
            }, function() {
              _this.i({
                "class": 'icon icon-repo-pull'
              });
              return _this.span('Change');
            });
            return _this.button({
              click: 'cancel'
            }, function() {
              _this.i({
                "class": 'icon x'
              });
              return _this.span('Cancel');
            });
          });
        };
      })(this));
    };

    ProjectDialog.prototype.activate = function() {
      var projectIndex, projectList, repo, _fn, _i, _len, _ref;
      projectIndex = 0;
      projectList = this.projectList;
      projectList.html('');
      _ref = atom.project.getRepositories();
      _fn = function(repo) {
        var option;
        if (repo) {
          option = document.createElement("option");
          option.value = projectIndex;
          option.text = path.basename(path.resolve(repo.path, '..'));
          projectList.append(option);
        }
        return projectIndex = projectIndex + 1;
      };
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        repo = _ref[_i];
        _fn(repo);
      }
      projectList.val(git.getProjectIndex);
      return ProjectDialog.__super__.activate.call(this);
    };

    ProjectDialog.prototype.changeProject = function() {
      var repo;
      this.deactivate();
      git.setProjectIndex(this.projectList.val());
      repo = git.getRepository();
      this.parentView.setWorkspaceTitle(repo.path.split('/').reverse()[1]);
      this.parentView.update();
    };

    return ProjectDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZGlhbG9ncy9wcm9qZWN0LWRpYWxvZy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0NBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQUFULENBQUE7O0FBQUEsRUFFQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVIsQ0FGTixDQUFBOztBQUFBLEVBR0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBSFAsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixvQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxhQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxRQUFQO09BQUwsRUFBc0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNwQixVQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxTQUFQO1dBQUwsRUFBdUIsU0FBQSxHQUFBO0FBQ3JCLFlBQUEsS0FBQyxDQUFBLENBQUQsQ0FBRztBQUFBLGNBQUEsT0FBQSxFQUFPLGtCQUFQO0FBQUEsY0FBMkIsS0FBQSxFQUFPLFFBQWxDO2FBQUgsQ0FBQSxDQUFBO21CQUNBLEtBQUMsQ0FBQSxNQUFELENBQVEsU0FBUixFQUZxQjtVQUFBLENBQXZCLENBQUEsQ0FBQTtBQUFBLFVBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLE1BQVA7V0FBTCxFQUFvQixTQUFBLEdBQUE7QUFDbEIsWUFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLGlCQUFQLENBQUEsQ0FB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

//# sourceURL=/home/takaaki/.atom/packages/git-control/lib/dialogs/project-dialog.coffee
