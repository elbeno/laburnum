//------------------------------------------------------------------------------
if (!String.prototype.ltrim) {
  String.prototype.ltrim = function() {
    return this.replace(/^\s+/, '');
  };
}

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
  // add a space to ease end-of-input detection
  this.input = input + ' ';

  // a token queue is used for peeking
  this.tokenqueue = [];

  // we're not quoting
  this.quoteNextToken = false;
  // how many levels of quoted list we're in
  this.insideList = 0;

  // word delimiters change with quoting
  // a word inside []
  this.listWordRE = /[^\s\[\]]+/;
  // a word preceded by "
  this.quotedWordRE = /[^\s\[\]\(\)]+/;
  // a normal word
  this.wordRE = /[^\s\[\]\(\)\+\-\*\/=<>]+/;
}

//------------------------------------------------------------------------------
Tokenizer.prototype.matchWord = function(s, wordRE) {
  result = s.match(wordRE);
  if (result) {
    this.input = s.substring(result[0].length);
    this.tokenqueue.push(new Token(token_ns.Enum.WORD, result[0]));
  }
  return result;
};

//------------------------------------------------------------------------------
Tokenizer.prototype.matchToken = function(s) {

  // if we're inside a list, match the word with the listWordRE
  if (this.insideList > 0) {
    if (this.matchWord(s, this.listWordRE)) {
      return;
    }
  }

  // if we're quoting, check for the empty word, then match with the
  // quotedWordRE
  if (this.quoteNextToken) {
    if (s == undefined || /[\s\[\]]/.test(s.charAt(0))) {
      this.tokenqueue.push(new Token(token_ns.Enum.WORD, ''));
      this.quoteNextToken = false;
      // whitespace will be eaten next time around
      return;
    }

    if (this.matchWord(s, this.quotedWordRE)) {
      this.quoteNextToken = false;
      return;
    }
  }

  // otherwise, match something normal
  switch (s.charAt(0)) {

  case ':':
    // dots
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.COLON, ':'));
    // oddly, after dots the quotedWordRE is NOT used
    return;

  case '"':
    // quotes
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.QUOTE, '"'));
    this.quoteNextToken = true;
    return;

  case '(':
    // left paren
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.LEFT_PAREN, '('));
    return;

  case ')':
    // right paren
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.RIGHT_PAREN, ')'));
    return;

  case '[':
    // left square bracket
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.LEFT_SQUARE_BRACKET, '['));
    this.insideList++;
    return;

  case ']':
    // right square bracket
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.RIGHT_SQUARE_BRACKET, ']'));
    this.insideList--;
    return;

  case '=':
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.RELOP, '='));
    return;

  case '<':
    var l = (s.charAt(1) == '=' || s.charAt(1) == '>') ? 2 : 1;
    this.input = s.substring(l);
    this.tokenqueue.push(new Token(token_ns.Enum.RELOP, s.substring(0,l)));
    return;

  case '>':
    var l = (s.charAt(1) == '=') ? 2 : 1;
    this.input = s.substring(l);
    this.tokenqueue.push(new Token(token_ns.Enum.RELOP, s.substring(0,l)));
    return;

  case '*':
  case '/':
  case '%':
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.MULOP, s.substring(0,1)));
    return;

  case '+':
  case '-':
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.ADDOP, s.substring(0,1)));
    return;

  default:
    if (this.matchWord(s, this.wordRE)) {
      return;
    }
    break;
  }

  // if we're not at the end of the string, it must be an illegal character
  if (s) {
    throw 'Illegal character in input: ' + s.charAt(0);
  }
};

//------------------------------------------------------------------------------
Tokenizer.prototype.peek = function() {
  // empty the queue first
  if (this.tokenqueue.length > 0) {
    return this.tokenqueue[0];
  }

  if (!this.quoteNextToken) {
    // drop any leading spaces
    this.input = this.input.ltrim();
  }

  // now match some things
  this.matchToken(this.input);

  // and return the thing matched, if any
  return this.tokenqueue[0];
};

//------------------------------------------------------------------------------
Tokenizer.prototype.consume = function() {

  if (this.tokenqueue.length == 0) {
    this.peek();
  }
  return this.tokenqueue.shift();
};

//------------------------------------------------------------------------------
Tokenizer.prototype.expect = function(lexeme, err) {
  var t = this.consume();
  if (t == undefined || t.lexeme != lexeme) {
    throw err;
  }
  return t;
};
