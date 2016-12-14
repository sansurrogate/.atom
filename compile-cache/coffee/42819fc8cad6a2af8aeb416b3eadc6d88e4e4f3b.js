(function() {
  module.exports = {
    includeStagedDiff: {
      title: 'Include staged diffs?',
      type: 'boolean',
      "default": true
    },
    openInPane: {
      type: 'boolean',
      "default": true,
      description: 'Allow commands to open new panes'
    },
    splitPane: {
      title: 'Split pane direction',
      type: 'string',
      "default": 'Down',
      description: 'Where should new panes go? (Defaults to Right)',
      "enum": ['Up', 'Right', 'Down', 'Left']
    },
    wordDiff: {
      type: 'boolean',
      "default": true,
      description: 'Should word diffs be highlighted in diffs?'
    },
    syntaxHighlighting: {
      title: 'Enable syntax highlighting in diffs?',
      type: 'boolean',
      "default": true
    },
    numberOfCommitsToShow: {
      type: 'integer',
      "default": 25,
      minimum: 1
    },
    gitPath: {
      type: 'string',
      "default": 'git',
      description: 'Where is your git?'
    },
    messageTimeout: {
      type: 'integer',
      "default": 5,
      description: 'How long should success/error messages be shown?'
    },
    showFormat: {
      description: 'Which format to use for git show? (none will use your git config default)',
      type: 'string',
      "default": 'full',
      "enum": ['oneline', 'short', 'medium', 'full', 'fuller', 'email', 'raw', 'none']
    },
    pullBeforePush: {
      description: 'Pull from remote before pushing',
      type: 'string',
      "default": 'no',
      "enum": ['no', 'pull', 'pull --rebase']
    },
    experimental: {
      description: 'Enable beta features and behavior',
      type: 'boolean',
      "default": false
    },
    verboseCommits: {
      description: '(Experimental) Show diffs in commit pane?',
      type: 'boolean',
      "default": false
    },
    enableStatusBarIcon: {
      type: 'boolean',
      "default": true
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvY29uZmlnLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxpQkFBQSxFQUNFO0FBQUEsTUFBQSxLQUFBLEVBQU8sdUJBQVA7QUFBQSxNQUNBLElBQUEsRUFBTSxTQUROO0FBQUEsTUFFQSxTQUFBLEVBQVMsSUFGVDtLQURGO0FBQUEsSUFJQSxVQUFBLEVBQ0U7QUFBQSxNQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsTUFDQSxTQUFBLEVBQVMsSUFEVDtBQUFBLE1BRUEsV0FBQSxFQUFhLGtDQUZiO0tBTEY7QUFBQSxJQVFBLFNBQUEsRUFDRTtBQUFBLE1BQUEsS0FBQSxFQUFPLHNCQUFQO0FBQUEsTUFDQSxJQUFBLEVBQU0sUUFETjtBQUFBLE1BRUEsU0FBQSxFQUFTLE1BRlQ7QUFBQSxNQUdBLFdBQUEsRUFBYSxnREFIYjtBQUFBLE1BSUEsTUFBQSxFQUFNLENBQUMsSUFBRCxFQUFPLE9BQVAsRUFBZ0IsTUFBaEIsRUFBd0IsTUFBeEIsQ0FKTjtLQVRGO0FBQUEsSUFjQSxRQUFBLEVBQ0U7QUFBQSxNQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsTUFDQSxTQUFBLEVBQVMsSUFEVDtBQUFBLE1BRUEsV0FBQSxFQUFhLDRDQUZiO0tBZkY7QUFBQSxJQWtCQSxrQkFBQSxFQUNFO0FBQUEsTUFBQSxLQUFBLEVBQU8sc0NBQVA7QUFBQSxNQUNBLElBQUEsRUFBTSxTQUROO0FBQUEsTUFFQSxTQUFBLEVBQVMsSUFGVDtLQW5CRjtBQUFBLElBc0JBLHFCQUFBLEVBQ0U7QUFBQSxNQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsTUFDQSxTQUFBLEVBQVMsRUFEVDtBQUFBLE1BRUEsT0FBQSxFQUFTLENBRlQ7S0F2QkY7QUFBQSxJQTBCQSxPQUFBLEVBQ0U7QUFBQSxNQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsTUFDQSxTQUFBLEVBQVMsS0FEVDtBQUFBLE1BRUEsV0FBQSxFQUFhLG9CQUZiO0tBM0JGO0FBQUEsSUE4QkEsY0FBQSxFQUNFO0FBQUEsTUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLE1BQ0EsU0FBQSxFQUFTLENBRFQ7QUFBQSxNQUVBLFdBQUEsRUFBYSxrREFGYjtLQS9CRjtBQUFBLElBa0NBLFVBQUEsRUFDRTtBQUFBLE1BQUEsV0FBQSxFQUFhLDJFQUFiO0FBQUEsTUFDQSxJQUFBLEVBQU0sUUFETjtBQUFBLE1BRUEsU0FBQSxFQUFTLE1BRlQ7QUFBQSxNQUdBLE1BQUEsRUFBTSxDQUFDLFNBQUQsRUFBWSxPQUFaLEVBQXFCLFFBQXJCLEVBQStCLE1BQS9CLEVBQXVDLFFBQXZDLEVBQWlELE9BQWpELEVBQTBELEtBQTFELEVBQWlFLE1BQWpFLENBSE47S0FuQ0Y7QUFBQSxJQXVDQSxjQUFBLEVBQ0U7QUFBQSxNQUFBLFdBQUEsRUFBYSxpQ0FBYjtBQUFBLE1BQ0EsSUFBQSxFQUFNLFFBRE47QUFBQSxNQUVBLFNBQUEsRUFBUyxJQUZUO0FBQUEsTUFHQSxNQUFBLEVBQU0sQ0FBQyxJQUFELEVBQU8sTUFBUCxFQUFlLGVBQWYsQ0FITjtLQXhDRjtBQUFBLElBNENBLFlBQUEsRUFDRTtBQUFBLE1BQUEsV0FBQSxFQUFhLG1DQUFiO0FBQUEsTUFDQSxJQUFBLEVBQU0sU0FETjtBQUFBLE1BRUEsU0FBQSxFQUFTLEtBRlQ7S0E3Q0Y7QUFBQSxJQWdEQSxjQUFBLEVBQ0U7QUFBQSxNQUFBLFdBQUEsRUFBYSwyQ0FBYjtBQUFBLE1BQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxNQUVBLFNBQUEsRUFBUyxLQUZUO0tBakRGO0FBQUEsSUFvREEsbUJBQUEsRUFDRTtBQUFBLE1BQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxNQUNBLFNBQUEsRUFBUyxJQURUO0tBckRGO0dBREYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/config.coffee
