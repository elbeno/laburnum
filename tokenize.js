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

  // replace any manual continuation prompts
  this.input = input.replace(/~\n~ /g, '');
  // replace any automatic continuation prompts
  this.input = this.input.replace(/(~ |\| |> )/g, '');

  // a token queue is used for peeking
  this.tokenqueue = [];

  // we're not quoting
  this.quoteNextToken = false;
  // how many levels of quoted list we're in
  this.insideList = 0;

  // a word preceded by "
  this.quotedWordRE = /^[^\s\[\]\(\)]+/;
  // a normal word
  this.wordRE = /^[^\s\[\]\(\)\+\-\*\/=<>]+/;
}

//------------------------------------------------------------------------------
Tokenizer.prototype.matchWord = function(s, wordRE) {
  // TODO: match/pair bars in the middle of words

  // first, try a barred word
  var result = false;
  if (s.charAt(0) == '|') {
    result = s.match(/^\|[\w\W]*\|/);
    if (!result) {
      throw { continuationPrompt: '| ' };
    }
  }
  else {
    result = s.match(wordRE);
  }
  if (result) {
    this.input = s.substring(result[0].length);
    this.tokenqueue.push(new Token(token_ns.Enum.WORD, result[0]));
  }
  return result;
};

//------------------------------------------------------------------------------
Tokenizer.prototype.matchToken = function(s) {

  // if we're inside a list, words are delimited by whitespace and []
  if (this.insideList > 0) {
    if (this.matchWord(s, /^[^\s\[\]]+/)) {
      return;
    }
  }

  // otherwise, match something normal
  switch (s.charAt(0)) {

  case ':':
    // dots
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.COLON, ':'));
    // after dots we expect a normally-delimited word, so check if the next
    // character is NOT part of a word, and emit an empty word if so
    s = this.input;
    if (s === undefined || !this.wordRE.test(s)) {
      this.tokenqueue.push(new Token(token_ns.Enum.WORD, ''));
      return;
    }
    // otherwise eat the next word straight away
    this.matchWord(s, this.wordRE);
    return;

  case '"':
    // quotes
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.QUOTE, '"'));
    // after quote we expect a differently delimited word, so check if the next
    // character is NOT part of a word, and emit an empty word if so
    s = this.input;
    if (s === undefined || !this.quotedWordRE.test(s)) {
      this.tokenqueue.push(new Token(token_ns.Enum.WORD, ''));
      return;
    }
    // otherwise eat the next word straight away
    this.matchWord(s, this.quotedWordRE);
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
    throw { message: 'Illegal character in input: ' + s.charAt(0) };
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
  if (t === undefined || t.lexeme != lexeme) {
    throw err;
  }
  return t;
};
