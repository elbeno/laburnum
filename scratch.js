//------------------------------------------------------------------------------
$.fn.getCursorPosition = function() {
  var el = $(this).get(0);
  var pos = 0;
  if('selectionStart' in el) {
    pos = el.selectionStart;
  } else if('selection' in document) {
    el.focus();
    var Sel = document.selection.createRange();
    var SelLength = document.selection.createRange().text.length;
    Sel.moveStart('character', -el.value.length);
    pos = Sel.text.length - SelLength;
  }
  return pos;
}

$.fn.setCursorPosition = function(pos) {
  this.each(function(index, elem) {
    if (elem.setSelectionRange) {
      elem.setSelectionRange(pos, pos);
    } else if (elem.createTextRange) {
      var range = elem.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
  });
  return this;
};

$.fn.cursorToEnd = function() {
  this.setCursorPosition(this.val().length);
  return this;
}

$.fn.scrollToEnd = function() {
  this.scrollTop(
    this[0].scrollHeight - this.height()
  );
}

var welcomeMessage = 'Welcome!\n';
var expressionIndex = 0;

// Display a prompt and optional msg
function displayPrompt(target, msg)
{
  if (msg != undefined) {
    target.val(target.val() + msg);
  }

  target.val(target.val() + '[' + ++expressionIndex + ']> ');
  target[0].promptPosition = target.getCursorPosition();
  target.scrollToEnd();
}

$(document).ready(function() {
  var repl = $('#repl');
  displayPrompt(repl, welcomeMessage);
  repl.focus();
});

$(function() {
  $('#repl').keydown(function(event) {

    // Turn off up/down arrows (TODO: history)
    if (event.keyCode == 38 // up
        || event.keyCode == 40) { // down
      return false;
    }

    // Turn off pageup/pagedown
    if (event.keyCode == 33 // pageup
        || event.keyCode == 34) { // pagedown
      return false;
    }

    // Turn off undo (ctrl+z)
    if (event.ctrlKey && event.keyCode == 90) {
      return false;
    }

    var promptPos = $(this)[0].promptPosition;

    // Prevent backspace/arrowing past the prompt.
    var curpos = $(this).getCursorPosition();
    if (curpos == promptPos) {
      if (event.keyCode == 8 // backspace
         || event.keyCode == 37) { // left
        return false;
      }
    }

    // Home takes you to the prompt position.
    if (event.keyCode == 36) {
      $(this).setCursorPosition(promptPos);
      return false;
    }

    // Return causes a dispatch.
    if (event.keyCode == 13) { // return
      // print a newline
      $(this).val($(this).val() + '\n');

      // Capture the input.
      var input = $(this).val().substring(promptPos);

      try {
        // if the line ends with ~ (before the newline), do a continuation
        if (input[input.length - 2] == '~') {
          throw { continuationPrompt: '~ ' };
        }

        var terp = new Interpreter();
        var e = terp.interpret(input, globalEnv);

        // The result should be undefined...
        if (e != undefined) {
          $(this).val($(this).val() + "You don't say what to do with " + e.toString() + '\n');
        }

        // Now make a new prompt.
        displayPrompt($(this));
        return false;
      }
      catch (except) {
        // if the exception indicates a continuation line, do that
        if (except.continuationPrompt) {
          $(this).val($(this).val() + except.continuationPrompt);
          $(this).scrollToEnd();
        }
        else {
          // Display the error and make a new prompt
          $(this).val($(this).val() + except.message + '\n');
          displayPrompt($(this));
        }
        return false;
      }
    }

    return true;
  });
});
