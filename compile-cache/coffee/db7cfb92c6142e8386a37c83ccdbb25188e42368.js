(function() {
  var $, FileItem, FileView, View, git, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom-space-pen-views'), View = _ref.View, $ = _ref.$;

  git = require('../git');

  FileItem = (function(_super) {
    __extends(FileItem, _super);

    function FileItem() {
      return FileItem.__super__.constructor.apply(this, arguments);
    }

    FileItem.content = function(file) {
      console.log('file', file);
      return this.div({
        "class": "file " + file.type,
        'data-name': file.name
      }, (function(_this) {
        return function() {
          _this.span({
            "class": 'clickable text',
            click: 'select',
            title: file.name
          }, file.name);
          _this.i({
            "class": 'icon check clickable',
            click: 'select'
          });
          return _this.i({
            "class": "icon " + (file.type === 'modified' ? 'clickable' : '') + " file-" + file.type,
            click: 'showFileDiff'
          });
        };
      })(this));
    };

    FileItem.prototype.initialize = function(file) {
      return this.file = file;
    };

    FileItem.prototype.showFileDiff = function() {
      if (this.file.type === 'modified') {
        return this.file.showFileDiff(this.file.name);
      }
    };

    FileItem.prototype.select = function() {
      return this.file.select(this.file.name);
    };

    return FileItem;

  })(View);

  module.exports = FileView = (function(_super) {
    __extends(FileView, _super);

    function FileView() {
      return FileView.__super__.constructor.apply(this, arguments);
    }

    FileView.content = function() {
      return this.div({
        "class": 'files'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'heading clickable'
          }, function() {
            _this.i({
              click: 'toggleBranch',
              "class": 'icon forked'
            });
            _this.span({
              click: 'toggleBranch'
            }, 'Workspace:');
            _this.span('', {
              outlet: 'workspaceTitle'
            });
            return _this.div({
              "class": 'action',
              click: 'selectAll'
            }, function() {
              _this.span('Select all');
              _this.i({
                "class": 'icon check'
              });
              return _this.input({
                "class": 'invisible',
                type: 'checkbox',
                outlet: 'allCheckbox',
                checked: true
              });
            });
          });
          return _this.div({
            "class": 'placeholder'
          }, 'No local working copy changes detected');
        };
      })(this));
    };

    FileView.prototype.initialize = function() {
      this.files = {};
      this.arrayOfFiles = new Array;
      return this.hidden = false;
    };

    FileView.prototype.toggleBranch = function() {
      if (this.hidden) {
        this.addAll(this.arrayOfFiles);
      } else {
        this.clearAll();
      }
      return this.hidden = !this.hidden;
    };

    FileView.prototype.hasSelected = function() {
      var file, name, _ref1;
      _ref1 = this.files;
      for (name in _ref1) {
        file = _ref1[name];
        if (file.selected) {
          return true;
        }
      }
      return false;
    };

    FileView.prototype.getSelected = function() {
      var file, files, name, _ref1;
      files = {
        all: [],
        add: [],
        rem: []
      };
      _ref1 = this.files;
      for (name in _ref1) {
        file = _ref1[name];
        if (!file.selected) {
          continue;
        }
        files.all.push(file.name);
        switch (file.type) {
          case 'deleted':
            files.rem.push(file.name);
            break;
          default:
            files.add.push(file.name);
        }
      }
      return files;
    };

    FileView.prototype.showSelected = function() {
      var file, fnames, name, _ref1;
      fnames = [];
      this.arrayOfFiles = Object.keys(this.files).map((function(_this) {
        return function(file) {
          return _this.files[file];
        };
      })(this));
      this.find('.file').toArray().forEach((function(_this) {
        return function(div) {
          var f, name;
          f = $(div);
          if (name = f.attr('data-name')) {
            if (_this.files[name].selected) {
              fnames.push(name);
              f.addClass('active');
            } else {
              f.removeClass('active');
            }
          }
        };
      })(this));
      _ref1 = this.files;
      for (name in _ref1) {
        file = _ref1[name];
        if (__indexOf.call(fnames, name) < 0) {
          file.selected = false;
        }
      }
      this.parentView.showSelectedFiles();
    };

    FileView.prototype.clearAll = function() {
      this.find('>.file').remove();
    };

    FileView.prototype.addAll = function(files) {
      var file, fnames, name, select, showFileDiff, _ref1;
      fnames = [];
      this.clearAll();
      if (files.length) {
        this.removeClass('none');
        select = (function(_this) {
          return function(name) {
            return _this.selectFile(name);
          };
        })(this);
        showFileDiff = (function(_this) {
          return function(name) {
            return _this.showFileDiff(name);
          };
        })(this);
        files.forEach((function(_this) {
          return function(file) {
            var tempName, _base, _name;
            fnames.push(file.name);
            file.select = select;
            file.showFileDiff = showFileDiff;
            tempName = file.name;
            if (tempName.indexOf(' ') > 0) {
              tempName = '\"' + tempName + '\"';
            }
            (_base = _this.files)[_name = file.name] || (_base[_name] = {
              name: tempName
            });
            _this.files[file.name].type = file.type;
            _this.files[file.name].selected = file.selected;
            _this.append(new FileItem(file));
          };
        })(this));
      } else {
        this.addClass('none');
      }
      _ref1 = this.files;
      for (name in _ref1) {
        file = _ref1[name];
        if (__indexOf.call(fnames, name) < 0) {
          file.selected = false;
        }
      }
      this.showSelected();
    };

    FileView.prototype.showFileDiff = function(name) {
      return git.diff(name).then((function(_this) {
        return function(diffs) {
          _this.parentView.diffView.clearAll();
          return _this.parentView.diffView.addAll(diffs);
        };
      })(this));
    };

    FileView.prototype.selectFile = function(name) {
      if (name) {
        this.files[name].selected = !!!this.files[name].selected;
      }
      this.allCheckbox.prop('checked', false);
      this.showSelected();
    };

    FileView.prototype.selectAll = function() {
      var file, name, val, _ref1;
      if (this.hidden) {
        return;
      }
      val = !!!this.allCheckbox.prop('checked');
      this.allCheckbox.prop('checked', val);
      _ref1 = this.files;
      for (name in _ref1) {
        file = _ref1[name];
        file.selected = val;
      }
      this.showSelected();
    };

    FileView.prototype.unselectAll = function() {
      var file, name, _i, _len, _ref1;
      _ref1 = this.files;
      for (file = _i = 0, _len = _ref1.length; _i < _len; file = ++_i) {
        name = _ref1[file];
        if (file.selected) {
          file.selected = false;
        }
      }
    };

    FileView.prototype.setWorkspaceTitle = function(title) {
      this.workspaceTitle.text(title);
    };

    return FileView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvdmlld3MvZmlsZS12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxzQ0FBQTtJQUFBOzt5SkFBQTs7QUFBQSxFQUFBLE9BQVksT0FBQSxDQUFRLHNCQUFSLENBQVosRUFBQyxZQUFBLElBQUQsRUFBTyxTQUFBLENBQVAsQ0FBQTs7QUFBQSxFQUNBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUROLENBQUE7O0FBQUEsRUFHTTtBQUNKLCtCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFFBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxJQUFELEdBQUE7QUFDUixNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBWixFQUFvQixJQUFwQixDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQVEsT0FBQSxHQUFPLElBQUksQ0FBQyxJQUFwQjtBQUFBLFFBQTRCLFdBQUEsRUFBYSxJQUFJLENBQUMsSUFBOUM7T0FBTCxFQUF5RCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ3ZELFVBQUEsS0FBQyxDQUFBLElBQUQsQ0FBTTtBQUFBLFlBQUEsT0FBQSxFQUFPLGdCQUFQO0FBQUEsWUFBeUIsS0FBQSxFQUFPLFFBQWhDO0FBQUEsWUFBMEMsS0FBQSxFQUFPLElBQUksQ0FBQyxJQUF0RDtXQUFOLEVBQWtFLElBQUksQ0FBQyxJQUF2RSxDQUFBLENBQUE7QUFBQSxVQUNBLEtBQUMsQ0FBQSxDQUFELENBQUc7QUFBQSxZQUFBLE9BQUEsRUFBTyxzQkFBUDtBQUFBLFlBQStCLEtBQUEsRUFBTyxRQUF0QztXQUFILENBREEsQ0FBQTtpQkFFQSxLQUFDLENBQUEsQ0FBRCxDQUFH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

//# sourceURL=/home/takaaki/.atom/packages/git-control/lib/views/file-view.coffee
