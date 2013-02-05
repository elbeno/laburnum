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
  NUMBER:6,
  LEFT_PAREN:7,
  RIGHT_PAREN:8
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
  this.input = input;

  // a token queue is used for macro expansions, eg. : -> THING QUOTE
  this.tokenqueue = [];
}

//------------------------------------------------------------------------------
Tokenizer.prototype.matchToken = function(s) {

  switch (s.charAt(0)) {

  case ':':
    // dots
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.WORD, 'THING'));
    this.tokenqueue.push(new Token(token_ns.Enum.WORD, 'QUOTE'));
    break;

  case '"':
    // quotes
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.WORD, 'QUOTE'));
    break;

  case '(':
    // left paren
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.LEFT_PAREN, '('));
    break;

  case ')':
    // right paren
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.RIGHT_PAREN, ')'));
    break;

  case '[':
    // left square bracket
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.LEFT_SQUARE_BRACKET, '['));
    break;

  case ']':
    // right square bracket
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.RIGHT_SQUARE_BRACKET, ']'));
    break;

  case '=':
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.RELOP, '='));
    break;

  case '<':
    var l = (s.charAt(1) == '=' || s.charAt(1) == '>') ? 2 : 1;
    this.input = s.substring(l);
    this.tokenqueue.push(new Token(token_ns.Enum.RELOP, s.substring(0,l)));
    break;

  case '>':
    var l = (s.charAt(1) == '=') ? 2 : 1;
    this.input = s.substring(l);
    this.tokenqueue.push(new Token(token_ns.Enum.RELOP, s.substring(0,l)));
    break;

  case '*':
  case '/':
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.MULOP, s.substring(0,1)));
    break;

  case '+':
  case '-':
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.ADDOP, s.substring(0,1)));
    break;

  default:
    // numbers
    var numberRE = /^[0-9]+/;
    result = s.match(numberRE);
    if (result) {
      this.input = s.substring(result[0].length);
      this.tokenqueue.push(new Token(token_ns.Enum.NUMBER, result[0]));
    }
    else {
      // words
      var wordRE = /[^ \[\]\(\)\+\-\*\/=<>]+/;
      result = s.match(wordRE);
      if (result) {
        this.input = s.substring(result[0].length);
        this.tokenqueue.push(new Token(token_ns.Enum.WORD, result[0]));
      }
    }
    break;
  }

};

//------------------------------------------------------------------------------
Tokenizer.prototype.peek = function() {
  // empty the queue first
  if (this.tokenqueue.length > 0) {
    return this.tokenqueue[0];
  }

  // drop any leading spaces
  var s = this.input.ltrim();

  // now match some things
  this.matchToken(s);

  // and return the thing matched, if any
  return this.tokenqueue[0];
}

//------------------------------------------------------------------------------
Tokenizer.prototype.consume = function() {

  if (this.tokenqueue.length == 0) {
    this.peek();
  }
  return this.tokenqueue.shift();
};

//------------------------------------------------------------------------------
Tokenizer.prototype.expect = function(type) {
  var t = this.consume();
  if (t.type != type) {
    throw "Expecting a " + type + ", found a " + t.type;
  }
};
