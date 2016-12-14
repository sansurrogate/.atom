(function() {
  var $, $$$, BufferedProcess, Disposable, GitShow, LogListView, View, git, numberOfCommitsToShow, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Disposable = require('atom').Disposable;

  BufferedProcess = require('atom').BufferedProcess;

  _ref = require('atom-space-pen-views'), $ = _ref.$, $$$ = _ref.$$$, View = _ref.View;

  _ = require('underscore-plus');

  git = require('../git');

  GitShow = require('../models/git-show');

  numberOfCommitsToShow = function() {
    return atom.config.get('git-plus.numberOfCommitsToShow');
  };

  module.exports = LogListView = (function(_super) {
    __extends(LogListView, _super);

    function LogListView() {
      return LogListView.__super__.constructor.apply(this, arguments);
    }

    LogListView.content = function() {
      return this.div({
        "class": 'git-plus-log',
        tabindex: -1
      }, (function(_this) {
        return function() {
          return _this.table({
            id: 'git-plus-commits',
            outlet: 'commitsListView'
          });
        };
      })(this));
    };

    LogListView.prototype.getURI = function() {
      return 'atom://git-plus:log';
    };

    LogListView.prototype.getTitle = function() {
      return 'git-plus: Log';
    };

    LogListView.prototype.initialize = function() {
      this.skipCommits = 0;
      this.finished = false;
      this.on('click', '.commit-row', (function(_this) {
        return function(_arg) {
          var currentTarget;
          currentTarget = _arg.currentTarget;
          return _this.showCommitLog(currentTarget.getAttribute('hash'));
        };
      })(this));
      return this.scroll(_.debounce((function(_this) {
        return function() {
          if (_this.prop('scrollHeight') - _this.scrollTop() - _this.height() < 20) {
            return _this.getLog();
          }
        };
      })(this), 50));
    };

    LogListView.prototype.attached = function() {
      return this.commandSubscription = atom.commands.add(this.element, {
        'core:move-down': (function(_this) {
          return function() {
            return _this.selectNextResult();
          };
        })(this),
        'core:move-up': (function(_this) {
          return function() {
            return _this.selectPreviousResult();
          };
        })(this),
        'core:page-up': (function(_this) {
          return function() {
            return _this.selectPreviousResult(10);
          };
        })(this),
        'core:page-down': (function(_this) {
          return function() {
            return _this.selectNextResult(10);
          };
        })(this),
        'core:move-to-top': (function(_this) {
          return function() {
            return _this.selectFirstResult();
          };
        })(this),
        'core:move-to-bottom': (function(_this) {
          return function() {
            return _this.selectLastResult();
          };
        })(this),
        'core:confirm': (function(_this) {
          return function() {
            var hash;
            hash = _this.find('.selected').attr('hash');
            if (hash) {
              _this.showCommitLog(hash);
            }
            return false;
          };
        })(this)
      });
    };

    LogListView.prototype.detached = function() {
      this.commandSubscription.dispose();
      return this.commandSubscription = null;
    };

    LogListView.prototype.parseData = function(data) {
      var commits, newline, separator;
      if (data.length < 1) {
        this.finished = true;
        return;
      }
      separator = ';|';
      newline = '_.;._';
      data = data.substring(0, data.length - newline.length - 1);
      commits = data.split(newline).map(function(line) {
        var tmpData;
        if (line.trim() !== '') {
          tmpData = line.trim().split(separator);
          return {
            hashShort: tmpData[0],
            hash: tmpData[1],
            author: tmpData[2],
            email: tmpData[3],
            message: tmpData[4],
            date: tmpData[5]
          };
        }
      });
      return this.renderLog(commits);
    };

    LogListView.prototype.renderHeader = function() {
      var headerRow;
      headerRow = $$$(function() {
        return this.tr({
          "class": 'commit-header'
        }, (function(_this) {
          return function() {
            _this.td('Date');
            _this.td('Message');
            return _this.td({
              "class": 'hashShort'
            }, 'Short Hash');
          };
        })(this));
      });
      return this.commitsListView.append(headerRow);
    };

    LogListView.prototype.renderLog = function(commits) {
      commits.forEach((function(_this) {
        return function(commit) {
          return _this.renderCommit(commit);
        };
      })(this));
      return this.skipCommits += numberOfCommitsToShow();
    };

    LogListView.prototype.renderCommit = function(commit) {
      var commitRow;
      commitRow = $$$(function() {
        return this.tr({
          "class": 'commit-row',
          hash: "" + commit.hash
        }, (function(_this) {
          return function() {
            _this.td({
              "class": 'date'
            }, "" + commit.date + " by " + commit.author);
            _this.td({
              "class": 'message'
            }, "" + commit.message);
            return _this.td({
              "class": 'hashShort'
            }, "" + commit.hashShort);
          };
        })(this));
      });
      return this.commitsListView.append(commitRow);
    };

    LogListView.prototype.showCommitLog = function(hash) {
      return GitShow(this.repo, hash, this.onlyCurrentFile ? this.currentFile : void 0);
    };

    LogListView.prototype.branchLog = function(repo) {
      this.repo = repo;
      this.skipCommits = 0;
      this.commitsListView.empty();
      this.onlyCurrentFile = false;
      this.currentFile = null;
      this.renderHeader();
      return this.getLog();
    };

    LogListView.prototype.currentFileLog = function(repo, currentFile) {
      this.repo = repo;
      this.currentFile = currentFile;
      this.onlyCurrentFile = true;
      this.skipCommits = 0;
      this.commitsListView.empty();
      this.renderHeader();
      return this.getLog();
    };

    LogListView.prototype.getLog = function() {
      var args;
      if (this.finished) {
        return;
      }
      args = ['log', "--pretty=%h;|%H;|%aN;|%aE;|%s;|%ai_.;._", "-" + (numberOfCommitsToShow()), '--skip=' + this.skipCommits];
      if (this.onlyCurrentFile && (this.currentFile != null)) {
        args.push(this.currentFile);
      }
      return git.cmd(args, {
        cwd: this.repo.getWorkingDirectory()
      }).then((function(_this) {
        return function(data) {
          return _this.parseData(data);
        };
      })(this));
    };

    LogListView.prototype.selectFirstResult = function() {
      this.selectResult(this.find('.commit-row:first'));
      return this.scrollToTop();
    };

    LogListView.prototype.selectLastResult = function() {
      this.selectResult(this.find('.commit-row:last'));
      return this.scrollToBottom();
    };

    LogListView.prototype.selectNextResult = function(skip) {
      var nextView, selectedView;
      if (skip == null) {
        skip = 1;
      }
      selectedView = this.find('.selected');
      if (selectedView.length < 1) {
        return this.selectFirstResult();
      }
      nextView = this.getNextResult(selectedView, skip);
      this.selectResult(nextView);
      return this.scrollTo(nextView);
    };

    LogListView.prototype.selectPreviousResult = function(skip) {
      var prevView, selectedView;
      if (skip == null) {
        skip = 1;
      }
      selectedView = this.find('.selected');
      if (selectedView.length < 1) {
        return this.selectFirstResult();
      }
      prevView = this.getPreviousResult(selectedView, skip);
      this.selectResult(prevView);
      return this.scrollTo(prevView);
    };

    LogListView.prototype.getNextResult = function(element, skip) {
      var itemIndex, items;
      if (!(element != null ? element.length : void 0)) {
        return;
      }
      items = this.find('.commit-row');
      itemIndex = items.index(element);
      return $(items[Math.min(itemIndex + skip, items.length - 1)]);
    };

    LogListView.prototype.getPreviousResult = function(element, skip) {
      var itemIndex, items;
      if (!(element != null ? element.length : void 0)) {
        return;
      }
      items = this.find('.commit-row');
      itemIndex = items.index(element);
      return $(items[Math.max(itemIndex - skip, 0)]);
    };

    LogListView.prototype.selectResult = function(resultView) {
      if (!(resultView != null ? resultView.length : void 0)) {
        return;
      }
      this.find('.selected').removeClass('selected');
      return resultView.addClass('selected');
    };

    LogListView.prototype.scrollTo = function(element) {
      var bottom, top;
      if (!(element != null ? element.length : void 0)) {
        return;
      }
      top = this.scrollTop() + element.offset().top - this.offset().top;
      bottom = top + element.outerHeight();
      if (bottom > this.scrollBottom()) {
        this.scrollBottom(bottom);
      }
      if (top < this.scrollTop()) {
        return this.scrollTop(top);
      }
    };

    return LogListView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvdmlld3MvbG9nLWxpc3Qtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsb0dBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLGFBQWMsT0FBQSxDQUFRLE1BQVIsRUFBZCxVQUFELENBQUE7O0FBQUEsRUFDQyxrQkFBbUIsT0FBQSxDQUFRLE1BQVIsRUFBbkIsZUFERCxDQUFBOztBQUFBLEVBRUEsT0FBaUIsT0FBQSxDQUFRLHNCQUFSLENBQWpCLEVBQUMsU0FBQSxDQUFELEVBQUksV0FBQSxHQUFKLEVBQVMsWUFBQSxJQUZULENBQUE7O0FBQUEsRUFHQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBSEosQ0FBQTs7QUFBQSxFQUlBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUpOLENBQUE7O0FBQUEsRUFLQSxPQUFBLEdBQVUsT0FBQSxDQUFRLG9CQUFSLENBTFYsQ0FBQTs7QUFBQSxFQU9BLHFCQUFBLEdBQXdCLFNBQUEsR0FBQTtXQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnQ0FBaEIsRUFBSDtFQUFBLENBUHhCLENBQUE7O0FBQUEsRUFTQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osa0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsV0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sY0FBUDtBQUFBLFFBQXVCLFFBQUEsRUFBVSxDQUFBLENBQWpDO09BQUwsRUFBMEMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDeEMsS0FBQyxDQUFBLEtBQUQsQ0FBTztBQUFBLFlBQUEsRUFBQSxFQUFJ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

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/views/log-list-view.coffee
