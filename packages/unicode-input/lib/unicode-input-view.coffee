{$, TextEditorView, View}  = require 'atom-space-pen-views'

module.exports =
class UnicodeInputView extends View
  @activate: -> new UnicodeInputView

  @content: ->
    @div =>
      @h1 'Unicode Input'
      @subview 'miniEditor', new TextEditorView(mini: true, placeHolderText: 'Unicode Hex Value')
      @div class: 'message', outlet: 'hexValueDisplay'

  initialize: ->
    @hexValueDisplay.text('Unicode character: ')
    @panel = atom.workspace.addModalPanel(item: this, visible: false)

    atom.commands.add 'atom-text-editor', 'unicode-input:toggle', => @toggle()

    @miniEditor.on 'blur', => @cancel()
    atom.commands.add @miniEditor.element, 'core:confirm', => @confirm()
    atom.commands.add @miniEditor.element, 'core:cancel', => @cancel()

    @miniEditor.getModel().getBuffer().onDidChange => @storeInputValue()

    @miniEditor.getModel().onWillInsertText ({cancel, text}) =>
      cancel() unless text.match(/[0-9a-fA-F]/)

  storeInputValue: ->
    @hexValueDisplay.text('Unicode character: ' + @findUnicodeChracter(@miniEditor.getText()))

  findUnicodeChracter: (text) ->
    return String.fromCharCode(parseInt(text, 16))

  toggle: ->
    if @panel.isVisible()
      @cancel()
    else
      @show()

  cancel: ->
    hexValueInputFocused = @miniEditor.hasFocus()
    @miniEditor.setText('')
    @panel.hide()
    @restoreFocus()

  confirm: ->
    hexValue = @miniEditor.getText()
    editor = atom.workspace.getActiveTextEditor()

    @cancel()

    return unless editor and hexValue.length
    editor.insertText(@findUnicodeChracter(hexValue))

  storeFocusedElement: ->
    @previouslyFocusedElement = $(document.activeElement)

  restoreFocus: ->
    @previouslyFocusedElement?.focus()

  show: ->
    @storeFocusedElement()
    @panel.show()
    @miniEditor.focus()
