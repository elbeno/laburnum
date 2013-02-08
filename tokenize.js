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
  RIGHT_PAREN:8,
  TO:9,
  END:10,
  COLON:11,
  QUOTE:12,
  BOOL:13
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

  // a token queue is used for macro expansions, eg. : -> THING QUOTE
  this.tokenqueue = [];
}

//------------------------------------------------------------------------------
Tokenizer.prototype.matchToken = function(s) {

  switch (s.charAt(0)) {

  case ':':
    // dots
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.COLON, ':'));
    break;

  case '"':
    // quotes
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.QUOTE, '"'));
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
  case '%':
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.MULOP, s.substring(0,1)));
    break;

  case '+':
  case '-':
    this.input = s.substring(1);
    this.tokenqueue.push(new Token(token_ns.Enum.ADDOP, s.substring(0,1)));
    break;

  default:
    // TO special form
    if (s.substring(0, 3) == 'TO ') {
      this.input = s.substring(3);
      this.tokenqueue.push(new Token(token_ns.Enum.TO, 'TO'));
      break;
    }

    // END
    if (s.substring(0, 4) == 'END ') {
      this.input = s.substring(4);
      this.tokenqueue.push(new Token(token_ns.Enum.END, 'END'));
      break;
    }

    // TRUE
    if (s.substring(0, 5) == 'TRUE ') {
      this.input = s.substring(5);
      this.tokenqueue.push(new Token(token_ns.Enum.BOOL, 'TRUE'));
      break;
    }

    // FALSE
    if (s.substring(0, 6) == 'FALSE ') {
      this.input = s.substring(6);
      this.tokenqueue.push(new Token(token_ns.Enum.BOOL, 'FALSE'));
      break;
    }

    // numbers
    var numberRE = /^[0-9]+/;
    result = s.match(numberRE);
    if (result) {
      this.input = s.substring(result[0].length);
      this.tokenqueue.push(new Token(token_ns.Enum.NUMBER, result[0]));
    }
    else {
      // words
      var wordRE = /[^\s\[\]\(\)\+\-\*\/=<>]+/;
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
Tokenizer.prototype.expectType = function(type, err) {
  var t = this.consume();
  if (t == undefined || t.type != type) {
    throw err;
  }
  return t;
};

//------------------------------------------------------------------------------
Tokenizer.prototype.expectLexeme = function(lexeme, err) {
  var t = this.consume();
  if (t == undefined || t.lexeme != lexeme) {
    throw err;
  }
  return t;
};
