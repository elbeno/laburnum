//------------------------------------------------------------------------------
var token_ns = {};

token_ns.Enum = {
  RELOP:0,
  MULOP:1,
  ADDOP:2,
  LEFT_SQUARE_BRACKET:3,
  RIGHT_SQUARE_BRACKET:4,
  WORD:5,
  LEFT_PAREN:6,
  RIGHT_PAREN:7,
  COLON:8,
  QUOTE:9
};

function Token(type, lexeme) {
  this.type = type;
  this.lexeme = lexeme;
}

Token.prototype.toString = function() {
  return String(this.type) + ' ' + this.lexeme;
};

//------------------------------------------------------------------------------
function Tokenizer(input) {

  // replace any continuation prompts
  var s = input.replace(/(\n~ |\n\| |\n\\ |\n> )/g, '\n');

  // get rid of comments (but leave tildes at end)
  s = s.replace(/;[^\n~]*\n/g, '\n');
  s = s.replace(/;[^\n~]*~/g, '~');

  // elide any ~ continuation lines
  s = s.replace(/~\n/g, '');

  // the result of tokenizing
  this.tokenqueue = [];
  this.tokenize(s, 0);
}

//------------------------------------------------------------------------------
Tokenizer.prototype.tokenize = function(s, startIndex) {

  while (startIndex < s.length)
  {
    var c = s.charAt(startIndex);
    var c2;
    switch (c) {

    case '[': // begin list
      this.tokenqueue.push(new Token(token_ns.Enum.LEFT_SQUARE_BRACKET, c));
      startIndex = this.tokenizeList(s, ++startIndex);
      break;

    case '(':
      ++startIndex;
      this.tokenqueue.push(new Token(token_ns.Enum.LEFT_PAREN, c));
      break;

    case ')':
      ++startIndex;
      this.tokenqueue.push(new Token(token_ns.Enum.RIGHT_PAREN, c));
      break;

    case '=':
      ++startIndex;
      this.tokenqueue.push(new Token(token_ns.Enum.RELOP, c));
      break;

    case '<': // could be < or <= or <>
      ++startIndex;
      if (startIndex < s.length) {
        c2 = s.charAt(startIndex);
        if (c2 == '=' || c2 == '>') {
          c = c + c2;
        }
      }
      this.tokenqueue.push(new Token(token_ns.Enum.RELOP, c));
      startIndex += c.length - 1;
      break;

    case '>': // could be > or >=
      ++startIndex;
      if (startIndex < s.length && s.charAt(startIndex) == '=') {
        c = c + '=';
      }
      this.tokenqueue.push(new Token(token_ns.Enum.RELOP, c));
      startIndex += c.length - 1;
      break;

    case '*':
    case '/':
    case '%':
      ++startIndex;
      this.tokenqueue.push(new Token(token_ns.Enum.MULOP, c));
      break;

    case '+':
    case '-':
      ++startIndex;
      this.tokenqueue.push(new Token(token_ns.Enum.ADDOP, c));
      break;

    case '"':
      ++startIndex;
      this.tokenqueue.push(new Token(token_ns.Enum.QUOTE, c));
      startIndex = this.tokenizeWord(s, startIndex, /[\s\[\]\(\)]/);
      break;

    case ':':
      ++startIndex;
      this.tokenqueue.push(new Token(token_ns.Enum.COLON, c));
      startIndex = this.tokenizeWord(s, startIndex, /[\s\[\]\(\)\+\-\*\/=<>]/);
      break;

    default:
      if (!/\s/.test(c)) {
        startIndex = this.tokenizeWord(s, startIndex, /[\s\[\]\(\)\+\-\*\/=<>]/);
      }
      else {
        ++startIndex;
      }
      break;
    }
  }
};

//------------------------------------------------------------------------------
Tokenizer.prototype.tokenizeList = function(s, startIndex) {
  while (startIndex < s.length)
  {
    switch (s.charAt(startIndex)) {
    case ']': // right square bracket - end list
      this.tokenqueue.push(new Token(token_ns.Enum.RIGHT_SQUARE_BRACKET, ']'));
      return ++startIndex;

    case '[': // left square bracket - begin new list
      this.tokenqueue.push(new Token(token_ns.Enum.LEFT_SQUARE_BRACKET, '['));
      startIndex = this.tokenizeList(s, ++startIndex);
      break;

    default:
      var c = s.charAt(startIndex);
      if (!/\s/.test(c)) {
        startIndex = this.tokenizeWord(s, startIndex, /[\s\[\]]/);
      }
      else {
        ++startIndex;
      }
    }
  }

  return undefined;
};

//------------------------------------------------------------------------------
Tokenizer.prototype.tokenizeWord = function(s, startIndex, delimiters) {

  var lexeme = '';
  var barred = false;
  while (startIndex < s.length)
  {
    var c = s.charAt(startIndex);

    if (c == '\\') {
      ++startIndex;
      if (startIndex == s.length) {
        throw { continuationPrompt: '\\ ' };
      }
      c = s.charAt(startIndex);
      // if the last character is a \ we just escaped the newline and should continue
      if (c == '\n' && startIndex == s.length - 1) {
        throw { continuationPrompt: '\\ ' };
      }
      lexeme = lexeme + c;
    }
    else if (c == '|') {
      barred = !barred;
    }
    else if (barred) {
      lexeme = lexeme + c;
    }
    else {
      if (!delimiters.test(c)) {
        lexeme = lexeme + c;
      }
      else {
        this.tokenqueue.push(new Token(token_ns.Enum.WORD, lexeme));
        return startIndex;
      }
    }
    ++startIndex;
  }

  if (barred) {
    throw { continuationPrompt: '| ' };
  }

  this.tokenqueue.push(new Token(token_ns.Enum.WORD, lexeme));
  return startIndex;
}

//------------------------------------------------------------------------------
Tokenizer.prototype.peek = function() {
  return this.tokenqueue[0];
};

//------------------------------------------------------------------------------
Tokenizer.prototype.consume = function() {
  return this.tokenqueue.shift();
};

//------------------------------------------------------------------------------
Tokenizer.prototype.expect = function(lexeme, err) {
  var t = this.consume();
  if (t === undefined || t.lexeme != lexeme) {
    throw err;
  }
  return t;
};
