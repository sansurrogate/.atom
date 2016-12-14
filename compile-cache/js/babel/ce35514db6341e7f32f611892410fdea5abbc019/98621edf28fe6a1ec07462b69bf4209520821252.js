'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = {
  panelVisibility: {
    title: 'Panel Visibility',
    description: 'Set when the build panel should be visible.',
    type: 'string',
    'default': 'Toggle',
    'enum': ['Toggle', 'Keep Visible', 'Show on Error', 'Hidden'],
    order: 1
  },
  hidePanelHeading: {
    title: 'Hide panel heading',
    description: 'Set whether to hide the build command and control buttons in the build panel',
    type: 'boolean',
    'default': false,
    order: 2
  },
  buildOnSave: {
    title: 'Automatically build on save',
    description: 'Automatically build your project each time an editor is saved.',
    type: 'boolean',
    'default': false,
    order: 3
  },
  saveOnBuild: {
    title: 'Automatically save on build',
    description: 'Automatically save all edited files when triggering a build.',
    type: 'boolean',
    'default': false,
    order: 4
  },
  matchedErrorFailsBuild: {
    title: 'Any matched error will fail the build',
    description: 'Even if the build has a return code of zero it is marked as "failed" if any error is being matched in the output.',
    type: 'boolean',
    'default': true,
    order: 5
  },
  scrollOnError: {
    title: 'Automatically scroll on build error',
    description: 'Automatically scroll to first matched error when a build failed.',
    type: 'boolean',
    'default': false,
    order: 6
  },
  stealFocus: {
    title: 'Steal Focus',
    description: 'Steal focus when opening build panel.',
    type: 'boolean',
    'default': true,
    order: 7
  },
  overrideThemeColors: {
    title: 'Override Theme Colors',
    description: 'Override theme background- and text color inside the terminal',
    type: 'boolean',
    'default': true,
    order: 8
  },
  selectTriggers: {
    title: 'Selecting new target triggers the build',
    description: 'When selecting a new target (through status-bar, cmd-alt-t, etc), the newly selected target will be triggered.',
    type: 'boolean',
    'default': true,
    order: 9
  },
  refreshOnShowTargetList: {
    title: 'Refresh targets when the target list is shown',
    description: 'When opening the targets menu, the targets will be refreshed.',
    type: 'boolean',
    'default': false,
    order: 10
  },
  notificationOnRefresh: {
    title: 'Show notification when targets are refreshed',
    description: 'When targets are refreshed a notification with information about the number of targets will be displayed.',
    type: 'boolean',
    'default': false,
    order: 11
  },
  beepWhenDone: {
    title: 'Beep when the build completes',
    description: 'Make a "beep" notification sound when the build is complete - in success or failure.',
    type: 'boolean',
    'default': false,
    order: 12
  },
  panelOrientation: {
    title: 'Panel Orientation',
    description: 'Where to attach the build panel',
    type: 'string',
    'default': 'Bottom',
    'enum': ['Bottom', 'Top', 'Left', 'Right'],
    order: 13
  },
  statusBar: {
    title: 'Status Bar',
    description: 'Where to place the status bar. Set to `Disable` to disable status bar display.',
    type: 'string',
    'default': 'Left',
    'enum': ['Left', 'Right', 'Disable'],
    order: 14
  },
  statusBarPriority: {
    title: 'Priority on Status Bar',
    description: 'Lower priority tiles are placed further to the left/right, depends on where you choose to place Status Bar.',
    type: 'number',
    'default': -1000,
    order: 15
  },
  terminalScrollback: {
    title: 'Terminal Scrollback Size',
    description: 'Max number of lines of build log kept in the terminal',
    type: 'number',
    'default': 1000,
    order: 16
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQvbGliL2NvbmZpZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7O3FCQUVHO0FBQ2IsaUJBQWUsRUFBRTtBQUNmLFNBQUssRUFBRSxrQkFBa0I7QUFDekIsZUFBVyxFQUFFLDZDQUE2QztBQUMxRCxRQUFJLEVBQUUsUUFBUTtBQUNkLGVBQVMsUUFBUTtBQUNqQixZQUFNLENBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsUUFBUSxDQUFFO0FBQzdELFNBQUssRUFBRSxDQUFDO0dBQ1Q7QUFDRCxrQkFBZ0IsRUFBRTtBQUNoQixTQUFLLEVBQUUsb0JBQW9CO0FBQzNCLGVBQVcsRUFBRSw4RUFBOEU7QUFDM0YsUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLEtBQUs7QUFDZCxTQUFLLEVBQUUsQ0FBQztHQUNUO0FBQ0QsYUFBVyxFQUFFO0FBQ1gsU0FBSyxFQUFFLDZCQUE2QjtBQUNwQyxlQUFXLEVBQUUsZ0VBQWdFO0FBQzdFLFFBQUksRUFBRSxTQUFTO0FBQ2YsZUFBUyxLQUFLO0FBQ2QsU0FBSyxFQUFFLENBQUM7R0FDVDtBQUNELGFBQVcsRUFBRTtBQUNYLFNBQUssRUFBRSw2QkFBNkI7QUFDcEMsZUFBVyxFQUFFLDhEQUE4RDtBQUMzRSxRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsS0FBSztBQUNkLFNBQUssRUFBRSxDQUFDO0dBQ1Q7QUFDRCx3QkFBc0IsRUFBRTtBQUN0QixTQUFLLEVBQUUsdUNBQXVDO0FBQzlDLGVBQVcsRUFBRSxtSEFBbUg7QUFDaEksUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLElBQUk7QUFDYixTQUFLLEVBQUUsQ0FBQztHQUNUO0FBQ0QsZUFBYSxFQUFFO0FBQ2IsU0FBSyxFQUFFLHFDQUFxQztBQUM1QyxlQUFXLEVBQUUsa0VBQWtFO0FBQy9FLFFBQUksRUFBRSxTQUFTO0FBQ2YsZUFBUyxLQUFLO0FBQ2QsU0FBSyxFQUFFLENBQUM7R0FDVDtBQUNELFlBQVUsRUFBRTtBQUNWLFNBQUssRUFBRSxhQUFhO0FBQ3BCLGVBQVcsRUFBRSx1Q0FBdUM7QUFDcEQsUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLElBQUk7QUFDYixTQUFLLEVBQUUsQ0FBQztHQUNUO0FBQ0QscUJBQW1CLEVBQUU7QUFDbkIsU0FBSyxFQUFFLHVCQUF1QjtBQUM5QixlQUFXLEVBQUUsK0RBQStEO0FBQzVFLFFBQUksRUFBRSxTQUFTO0FBQ2YsZUFBUyxJQUFJO0FBQ2IsU0FBSyxFQUFFLENBQUM7R0FDVDtBQUNELGdCQUFjLEVBQUU7QUFDZCxTQUFLLEVBQUUseUNBQXlDO0FBQ2hELGVBQVcsRUFBRSxnSEFBZ0g7QUFDN0gsUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLElBQUk7QUFDYixTQUFLLEVBQUUsQ0FBQztHQUNUO0FBQ0QseUJBQXVCLEVBQUU7QUFDdkIsU0FBSyxFQUFFLCtDQUErQztBQUN0RCxlQUFXLEVBQUUsK0RBQStEO0FBQzVFLFFBQUksRUFBRSxTQUFTO0FBQ2YsZUFBUyxLQUFLO0FBQ2QsU0FBSyxFQUFFLEVBQUU7R0FDVjtBQUNELHVCQUFxQixFQUFFO0FBQ3JCLFNBQUssRUFBRSw4Q0FBOEM7QUFDckQsZUFBVyxFQUFFLDJHQUEyRztBQUN4SCxRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsS0FBSztBQUNkLFNBQUssRUFBRSxFQUFFO0dBQ1Y7QUFDRCxjQUFZLEVBQUU7QUFDWixTQUFLLEVBQUUsK0JBQStCO0FBQ3RDLGVBQVcsRUFBRSxzRkFBc0Y7QUFDbkcsUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLEtBQUs7QUFDZCxTQUFLLEVBQUUsRUFBRTtHQUNWO0FBQ0Qsa0JBQWdCLEVBQUU7QUFDaEIsU0FBSyxFQUFFLG1CQUFtQjtBQUMxQixlQUFXLEVBQUUsaUNBQWlDO0FBQzlDLFFBQUksRUFBRSxRQUFRO0FBQ2QsZUFBUyxRQUFRO0FBQ2pCLFlBQU0sQ0FBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUU7QUFDMUMsU0FBSyxFQUFFLEVBQUU7R0FDVjtBQUNELFdBQVMsRUFBRTtBQUNULFNBQUssRUFBRSxZQUFZO0FBQ25CLGVBQVcsRUFBRSxnRkFBZ0Y7QUFDN0YsUUFBSSxFQUFFLFFBQVE7QUFDZCxlQUFTLE1BQU07QUFDZixZQUFNLENBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUU7QUFDcEMsU0FBSyxFQUFFLEVBQUU7R0FDVjtBQUNELG1CQUFpQixFQUFFO0FBQ2pCLFNBQUssRUFBRSx3QkFBd0I7QUFDL0IsZUFBVyxFQUFFLDZHQUE2RztBQUMxSCxRQUFJLEVBQUUsUUFBUTtBQUNkLGVBQVMsQ0FBQyxJQUFJO0FBQ2QsU0FBSyxFQUFFLEVBQUU7R0FDVjtBQUNELG9CQUFrQixFQUFFO0FBQ2xCLFNBQUssRUFBRSwwQkFBMEI7QUFDakMsZUFBVyxFQUFFLHVEQUF1RDtBQUNwRSxRQUFJLEVBQUUsUUFBUTtBQUNkLGVBQVMsSUFBSTtBQUNiLFNBQUssRUFBRSxFQUFFO0dBQ1Y7Q0FDRiIsImZpbGUiOiIvaG9tZS90YWthYWtpLy5hdG9tL3BhY2thZ2VzL2J1aWxkL2xpYi9jb25maWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBwYW5lbFZpc2liaWxpdHk6IHtcbiAgICB0aXRsZTogJ1BhbmVsIFZpc2liaWxpdHknLFxuICAgIGRlc2NyaXB0aW9uOiAnU2V0IHdoZW4gdGhlIGJ1aWxkIHBhbmVsIHNob3VsZCBiZSB2aXNpYmxlLicsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ1RvZ2dsZScsXG4gICAgZW51bTogWyAnVG9nZ2xlJywgJ0tlZXAgVmlzaWJsZScsICdTaG93IG9uIEVycm9yJywgJ0hpZGRlbicgXSxcbiAgICBvcmRlcjogMVxuICB9LFxuICBoaWRlUGFuZWxIZWFkaW5nOiB7XG4gICAgdGl0bGU6ICdIaWRlIHBhbmVsIGhlYWRpbmcnLFxuICAgIGRlc2NyaXB0aW9uOiAnU2V0IHdoZXRoZXIgdG8gaGlkZSB0aGUgYnVpbGQgY29tbWFuZCBhbmQgY29udHJvbCBidXR0b25zIGluIHRoZSBidWlsZCBwYW5lbCcsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiAyXG4gIH0sXG4gIGJ1aWxkT25TYXZlOiB7XG4gICAgdGl0bGU6ICdBdXRvbWF0aWNhbGx5IGJ1aWxkIG9uIHNhdmUnLFxuICAgIGRlc2NyaXB0aW9uOiAnQXV0b21hdGljYWxseSBidWlsZCB5b3VyIHByb2plY3QgZWFjaCB0aW1lIGFuIGVkaXRvciBpcyBzYXZlZC4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogM1xuICB9LFxuICBzYXZlT25CdWlsZDoge1xuICAgIHRpdGxlOiAnQXV0b21hdGljYWxseSBzYXZlIG9uIGJ1aWxkJyxcbiAgICBkZXNjcmlwdGlvbjogJ0F1dG9tYXRpY2FsbHkgc2F2ZSBhbGwgZWRpdGVkIGZpbGVzIHdoZW4gdHJpZ2dlcmluZyBhIGJ1aWxkLicsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiA0XG4gIH0sXG4gIG1hdGNoZWRFcnJvckZhaWxzQnVpbGQ6IHtcbiAgICB0aXRsZTogJ0FueSBtYXRjaGVkIGVycm9yIHdpbGwgZmFpbCB0aGUgYnVpbGQnLFxuICAgIGRlc2NyaXB0aW9uOiAnRXZlbiBpZiB0aGUgYnVpbGQgaGFzIGEgcmV0dXJuIGNvZGUgb2YgemVybyBpdCBpcyBtYXJrZWQgYXMgXCJmYWlsZWRcIiBpZiBhbnkgZXJyb3IgaXMgYmVpbmcgbWF0Y2hlZCBpbiB0aGUgb3V0cHV0LicsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgb3JkZXI6IDVcbiAgfSxcbiAgc2Nyb2xsT25FcnJvcjoge1xuICAgIHRpdGxlOiAnQXV0b21hdGljYWxseSBzY3JvbGwgb24gYnVpbGQgZXJyb3InLFxuICAgIGRlc2NyaXB0aW9uOiAnQXV0b21hdGljYWxseSBzY3JvbGwgdG8gZmlyc3QgbWF0Y2hlZCBlcnJvciB3aGVuIGEgYnVpbGQgZmFpbGVkLicsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiA2XG4gIH0sXG4gIHN0ZWFsRm9jdXM6IHtcbiAgICB0aXRsZTogJ1N0ZWFsIEZvY3VzJyxcbiAgICBkZXNjcmlwdGlvbjogJ1N0ZWFsIGZvY3VzIHdoZW4gb3BlbmluZyBidWlsZCBwYW5lbC4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG9yZGVyOiA3XG4gIH0sXG4gIG92ZXJyaWRlVGhlbWVDb2xvcnM6IHtcbiAgICB0aXRsZTogJ092ZXJyaWRlIFRoZW1lIENvbG9ycycsXG4gICAgZGVzY3JpcHRpb246ICdPdmVycmlkZSB0aGVtZSBiYWNrZ3JvdW5kLSBhbmQgdGV4dCBjb2xvciBpbnNpZGUgdGhlIHRlcm1pbmFsJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBvcmRlcjogOFxuICB9LFxuICBzZWxlY3RUcmlnZ2Vyczoge1xuICAgIHRpdGxlOiAnU2VsZWN0aW5nIG5ldyB0YXJnZXQgdHJpZ2dlcnMgdGhlIGJ1aWxkJyxcbiAgICBkZXNjcmlwdGlvbjogJ1doZW4gc2VsZWN0aW5nIGEgbmV3IHRhcmdldCAodGhyb3VnaCBzdGF0dXMtYmFyLCBjbWQtYWx0LXQsIGV0YyksIHRoZSBuZXdseSBzZWxlY3RlZCB0YXJnZXQgd2lsbCBiZSB0cmlnZ2VyZWQuJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBvcmRlcjogOVxuICB9LFxuICByZWZyZXNoT25TaG93VGFyZ2V0TGlzdDoge1xuICAgIHRpdGxlOiAnUmVmcmVzaCB0YXJnZXRzIHdoZW4gdGhlIHRhcmdldCBsaXN0IGlzIHNob3duJyxcbiAgICBkZXNjcmlwdGlvbjogJ1doZW4gb3BlbmluZyB0aGUgdGFyZ2V0cyBtZW51LCB0aGUgdGFyZ2V0cyB3aWxsIGJlIHJlZnJlc2hlZC4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogMTBcbiAgfSxcbiAgbm90aWZpY2F0aW9uT25SZWZyZXNoOiB7XG4gICAgdGl0bGU6ICdTaG93IG5vdGlmaWNhdGlvbiB3aGVuIHRhcmdldHMgYXJlIHJlZnJlc2hlZCcsXG4gICAgZGVzY3JpcHRpb246ICdXaGVuIHRhcmdldHMgYXJlIHJlZnJlc2hlZCBhIG5vdGlmaWNhdGlvbiB3aXRoIGluZm9ybWF0aW9uIGFib3V0IHRoZSBudW1iZXIgb2YgdGFyZ2V0cyB3aWxsIGJlIGRpc3BsYXllZC4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogMTFcbiAgfSxcbiAgYmVlcFdoZW5Eb25lOiB7XG4gICAgdGl0bGU6ICdCZWVwIHdoZW4gdGhlIGJ1aWxkIGNvbXBsZXRlcycsXG4gICAgZGVzY3JpcHRpb246ICdNYWtlIGEgXCJiZWVwXCIgbm90aWZpY2F0aW9uIHNvdW5kIHdoZW4gdGhlIGJ1aWxkIGlzIGNvbXBsZXRlIC0gaW4gc3VjY2VzcyBvciBmYWlsdXJlLicsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiAxMlxuICB9LFxuICBwYW5lbE9yaWVudGF0aW9uOiB7XG4gICAgdGl0bGU6ICdQYW5lbCBPcmllbnRhdGlvbicsXG4gICAgZGVzY3JpcHRpb246ICdXaGVyZSB0byBhdHRhY2ggdGhlIGJ1aWxkIHBhbmVsJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAnQm90dG9tJyxcbiAgICBlbnVtOiBbICdCb3R0b20nLCAnVG9wJywgJ0xlZnQnLCAnUmlnaHQnIF0sXG4gICAgb3JkZXI6IDEzXG4gIH0sXG4gIHN0YXR1c0Jhcjoge1xuICAgIHRpdGxlOiAnU3RhdHVzIEJhcicsXG4gICAgZGVzY3JpcHRpb246ICdXaGVyZSB0byBwbGFjZSB0aGUgc3RhdHVzIGJhci4gU2V0IHRvIGBEaXNhYmxlYCB0byBkaXNhYmxlIHN0YXR1cyBiYXIgZGlzcGxheS4nLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICdMZWZ0JyxcbiAgICBlbnVtOiBbICdMZWZ0JywgJ1JpZ2h0JywgJ0Rpc2FibGUnIF0sXG4gICAgb3JkZXI6IDE0XG4gIH0sXG4gIHN0YXR1c0JhclByaW9yaXR5OiB7XG4gICAgdGl0bGU6ICdQcmlvcml0eSBvbiBTdGF0dXMgQmFyJyxcbiAgICBkZXNjcmlwdGlvbjogJ0xvd2VyIHByaW9yaXR5IHRpbGVzIGFyZSBwbGFjZWQgZnVydGhlciB0byB0aGUgbGVmdC9yaWdodCwgZGVwZW5kcyBvbiB3aGVyZSB5b3UgY2hvb3NlIHRvIHBsYWNlIFN0YXR1cyBCYXIuJyxcbiAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiAtMTAwMCxcbiAgICBvcmRlcjogMTVcbiAgfSxcbiAgdGVybWluYWxTY3JvbGxiYWNrOiB7XG4gICAgdGl0bGU6ICdUZXJtaW5hbCBTY3JvbGxiYWNrIFNpemUnLFxuICAgIGRlc2NyaXB0aW9uOiAnTWF4IG51bWJlciBvZiBsaW5lcyBvZiBidWlsZCBsb2cga2VwdCBpbiB0aGUgdGVybWluYWwnLFxuICAgIHR5cGU6ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IDEwMDAsXG4gICAgb3JkZXI6IDE2XG4gIH1cbn07XG4iXX0=
//# sourceURL=/home/takaaki/.atom/packages/build/lib/config.js
