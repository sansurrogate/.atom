'use babel';
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var PackageDepsView = (function () {
  function PackageDepsView(packageName, packageNames) {
    _classCallCheck(this, PackageDepsView);

    this.packageName = packageName;
    this.packageNames = packageNames;

    this.progress = document.createElement('progress');
    this.progress.max = packageNames.length;
    this.progress.value = 0;
    this.progress.classList.add('display-inline');
    this.progress.style.width = '100%';
  }

  _createClass(PackageDepsView, [{
    key: 'createNotification',
    value: function createNotification() {
      var _this = this;

      return new Promise(function (resolve) {
        setTimeout(function () {
          _this.notification = atom.notifications.addInfo('Installing ' + _this.packageName + ' dependencies', {
            detail: 'Installing ' + _this.packageNames.join(', '),
            dismissable: true
          });
          _this.notificationEl = atom.views.getView(_this.notification);
          _this.notificationContentEl = _this.notificationEl.querySelector('.detail-content');
          if (_this.notificationContentEl) {
            // Future-proof
            _this.notificationContentEl.appendChild(_this.progress);
          }
          resolve();
        }, 20);
      });
    }
  }, {
    key: 'markFinished',
    value: function markFinished() {
      this.progress.value++;
      if (this.progress.value === this.progress.max) {
        var titleEl = this.notificationEl.querySelector('.message p');
        if (titleEl) {
          titleEl.textContent = 'Installed ' + this.packageName + ' dependencies';
        }
        this.notificationContentEl.textContent = 'Installed ' + this.packageNames.join(', ');
        this.notificationEl.classList.remove('info');
        this.notificationEl.classList.remove('icon-info');
        this.notificationEl.classList.add('success');
        this.notificationEl.classList.add('icon-check');
      }
    }
  }]);

  return PackageDepsView;
})();

exports['default'] = PackageDepsView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbGludGVyLWdjYy9ub2RlX21vZHVsZXMvYXRvbS1wYWNrYWdlLWRlcHMvbGliL3ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7SUFDVSxlQUFlO0FBQ3ZCLFdBRFEsZUFBZSxDQUN0QixXQUFXLEVBQUUsWUFBWSxFQUFDOzBCQURuQixlQUFlOztBQUVoQyxRQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQTtBQUM5QixRQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQTs7QUFFaEMsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQ2xELFFBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUE7QUFDdkMsUUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFBO0FBQ3ZCLFFBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0FBQzdDLFFBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUE7R0FFbkM7O2VBWGtCLGVBQWU7O1dBWWhCLDhCQUFHOzs7QUFDbkIsYUFBTyxJQUFJLE9BQU8sQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUM1QixrQkFBVSxDQUFDLFlBQU07QUFDZixnQkFBSyxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLGlCQUFlLE1BQUssV0FBVyxvQkFBaUI7QUFDNUYsa0JBQU0sRUFBRSxhQUFhLEdBQUcsTUFBSyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNwRCx1QkFBVyxFQUFFLElBQUk7V0FDbEIsQ0FBQyxDQUFBO0FBQ0YsZ0JBQUssY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQUssWUFBWSxDQUFDLENBQUE7QUFDM0QsZ0JBQUsscUJBQXFCLEdBQUcsTUFBSyxjQUFjLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUE7QUFDakYsY0FBSSxNQUFLLHFCQUFxQixFQUFFOztBQUM5QixrQkFBSyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsTUFBSyxRQUFRLENBQUMsQ0FBQTtXQUN0RDtBQUNELGlCQUFPLEVBQUUsQ0FBQTtTQUNWLEVBQUUsRUFBRSxDQUFDLENBQUE7T0FDUCxDQUFDLENBQUE7S0FDSDs7O1dBQ1csd0JBQUc7QUFDYixVQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ3JCLFVBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUU7QUFDN0MsWUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUE7QUFDL0QsWUFBSSxPQUFPLEVBQUU7QUFDWCxpQkFBTyxDQUFDLFdBQVcsa0JBQWdCLElBQUksQ0FBQyxXQUFXLGtCQUFlLENBQUE7U0FDbkU7QUFDRCxZQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxHQUFHLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNwRixZQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDNUMsWUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ2pELFlBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUM1QyxZQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7T0FDaEQ7S0FDRjs7O1NBekNrQixlQUFlOzs7cUJBQWYsZUFBZSIsImZpbGUiOiIvaG9tZS90YWthYWtpLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1nY2Mvbm9kZV9tb2R1bGVzL2F0b20tcGFja2FnZS1kZXBzL2xpYi92aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhY2thZ2VEZXBzVmlldyB7XG4gIGNvbnN0cnVjdG9yKHBhY2thZ2VOYW1lLCBwYWNrYWdlTmFtZXMpe1xuICAgIHRoaXMucGFja2FnZU5hbWUgPSBwYWNrYWdlTmFtZVxuICAgIHRoaXMucGFja2FnZU5hbWVzID0gcGFja2FnZU5hbWVzXG5cbiAgICB0aGlzLnByb2dyZXNzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJvZ3Jlc3MnKVxuICAgIHRoaXMucHJvZ3Jlc3MubWF4ID0gcGFja2FnZU5hbWVzLmxlbmd0aFxuICAgIHRoaXMucHJvZ3Jlc3MudmFsdWUgPSAwXG4gICAgdGhpcy5wcm9ncmVzcy5jbGFzc0xpc3QuYWRkKCdkaXNwbGF5LWlubGluZScpXG4gICAgdGhpcy5wcm9ncmVzcy5zdHlsZS53aWR0aCA9ICcxMDAlJ1xuXG4gIH1cbiAgY3JlYXRlTm90aWZpY2F0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLm5vdGlmaWNhdGlvbiA9IGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKGBJbnN0YWxsaW5nICR7dGhpcy5wYWNrYWdlTmFtZX0gZGVwZW5kZW5jaWVzYCwge1xuICAgICAgICAgIGRldGFpbDogJ0luc3RhbGxpbmcgJyArIHRoaXMucGFja2FnZU5hbWVzLmpvaW4oJywgJyksXG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5ub3RpZmljYXRpb25FbCA9IGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLm5vdGlmaWNhdGlvbilcbiAgICAgICAgdGhpcy5ub3RpZmljYXRpb25Db250ZW50RWwgPSB0aGlzLm5vdGlmaWNhdGlvbkVsLnF1ZXJ5U2VsZWN0b3IoJy5kZXRhaWwtY29udGVudCcpXG4gICAgICAgIGlmICh0aGlzLm5vdGlmaWNhdGlvbkNvbnRlbnRFbCkgeyAvLyBGdXR1cmUtcHJvb2ZcbiAgICAgICAgICB0aGlzLm5vdGlmaWNhdGlvbkNvbnRlbnRFbC5hcHBlbmRDaGlsZCh0aGlzLnByb2dyZXNzKVxuICAgICAgICB9XG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfSwgMjApXG4gICAgfSlcbiAgfVxuICBtYXJrRmluaXNoZWQoKSB7XG4gICAgdGhpcy5wcm9ncmVzcy52YWx1ZSsrXG4gICAgaWYgKHRoaXMucHJvZ3Jlc3MudmFsdWUgPT09IHRoaXMucHJvZ3Jlc3MubWF4KSB7XG4gICAgICBjb25zdCB0aXRsZUVsID0gdGhpcy5ub3RpZmljYXRpb25FbC5xdWVyeVNlbGVjdG9yKCcubWVzc2FnZSBwJylcbiAgICAgIGlmICh0aXRsZUVsKSB7XG4gICAgICAgIHRpdGxlRWwudGV4dENvbnRlbnQgPSBgSW5zdGFsbGVkICR7dGhpcy5wYWNrYWdlTmFtZX0gZGVwZW5kZW5jaWVzYFxuICAgICAgfVxuICAgICAgdGhpcy5ub3RpZmljYXRpb25Db250ZW50RWwudGV4dENvbnRlbnQgPSAnSW5zdGFsbGVkICcgKyB0aGlzLnBhY2thZ2VOYW1lcy5qb2luKCcsICcpXG4gICAgICB0aGlzLm5vdGlmaWNhdGlvbkVsLmNsYXNzTGlzdC5yZW1vdmUoJ2luZm8nKVxuICAgICAgdGhpcy5ub3RpZmljYXRpb25FbC5jbGFzc0xpc3QucmVtb3ZlKCdpY29uLWluZm8nKVxuICAgICAgdGhpcy5ub3RpZmljYXRpb25FbC5jbGFzc0xpc3QuYWRkKCdzdWNjZXNzJylcbiAgICAgIHRoaXMubm90aWZpY2F0aW9uRWwuY2xhc3NMaXN0LmFkZCgnaWNvbi1jaGVjaycpXG4gICAgfVxuICB9XG59XG4iXX0=
//# sourceURL=/home/takaaki/.atom/packages/linter-gcc/node_modules/atom-package-deps/lib/view.js
