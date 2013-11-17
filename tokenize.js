//------------------------------------------------------------------------------
var token_ns = {};

token_ns.Enum = {
  RELOP:0,
  MULOP:1,
  ADDOP:2,
  LEFT_PAREN:3,
  RIGHT_PAREN:4,
  LEFT_SQUARE_BRACKET:5,
  RIGHT_SQUARE_BRACKET:6,
  WORD:7,
  COLON:8,
  QUOTE:9,
  LEFT_CURLY_BRACKET:10,
  RIGHT_CURLY_BRACKET:11,
  AT_SIGN:12,
  UNARY_MINUS:13
};

//------------------------------------------------------------------------------
function Tokenizer() {
}

//------------------------------------------------------------------------------
Tokenizer.prototype.preprocess = function(input) {
  // replace any continuation prompts
  var s = input.replace(/(\n~ |\n\| |\n\\ )/g, '\n');

  // get rid of comments (but leave tildes at end)
  s = s.replace(/;[^\n~]*\n/g, '\n');
  s = s.replace(/;[^\n~]*~\n/g, '~\n');
  s = s.replace(/;[^\n~]*$/g, '');

  // elide any ~ continuation lines
  s = s.replace(/~\n/g, '');

  return s;
};

//------------------------------------------------------------------------------
Tokenizer.prototype.tokenize = function(s) {
  var lastSpace = -1;
  var startIndex = 0;
  this.tokenqueue = [];

  while (startIndex < s.length)
  {
    var c = s[startIndex];
    var c2;
    switch (c) {

    case '[': // begin list
      this.tokenqueue.push({type:token_ns.Enum.LEFT_SQUARE_BRACKET, lexeme:c});
      startIndex = this.tokenizeList(s, ++startIndex,
                                    {type:token_ns.Enum.RIGHT_SQUARE_BRACKET, lexeme:']'});
      break;

    case ']':
      ++startIndex;
      this.tokenqueue.push({type:token_ns.Enum.RIGHT_SQUARE_BRACKET, lexeme:c});
      break;

    case '{': // begin array
      this.tokenqueue.push({type:token_ns.Enum.LEFT_CURLY_BRACKET, lexeme:c});
      startIndex = this.tokenizeList(s, ++startIndex,
                                     {type:token_ns.Enum.RIGHT_CURLY_BRACKET, lexeme:'}'});
      break;

    case '}':
      ++startIndex;
      this.tokenqueue.push({type:token_ns.Enum.RIGHT_CURLY_BRACKET, lexeme:c});
      break;

    case '@': // array base
      ++startIndex;
      this.tokenqueue.push({type:token_ns.Enum.AT_SIGN, lexeme:c});
      break;

    case '(':
      ++startIndex;
      this.tokenqueue.push({type:token_ns.Enum.LEFT_PAREN, lexeme:c});
      break;

    case ')':
      ++startIndex;
      this.tokenqueue.push({type:token_ns.Enum.RIGHT_PAREN, lexeme:c});
      break;

    case '=':
      ++startIndex;
      this.tokenqueue.push({type:token_ns.Enum.RELOP, lexeme:c});
      break;

    case '<': // could be < or <= or <>
      ++startIndex;
      if (startIndex < s.length) {
        c2 = s[startIndex];
        if (c2 == '=' || c2 == '>') {
          c = c + c2;
        }
      }
      this.tokenqueue.push({type:token_ns.Enum.RELOP, lexeme:c});
      startIndex += c.length - 1;
      break;

    case '>': // could be > or >=
      ++startIndex;
      if (startIndex < s.length && s[startIndex] == '=') {
        c = c + '=';
      }
      this.tokenqueue.push({type:token_ns.Enum.RELOP, lexeme:c});
      startIndex += c.length - 1;
      break;

    case '*':
    case '/':
    case '%':
      ++startIndex;
      this.tokenqueue.push({type:token_ns.Enum.MULOP, lexeme:c});
      break;

    // Minus sign means unary minus if the previous token is an infix operator
    // or open parenthesis, or it is preceded by a space and followed by a
    // nonspace.
    case '-':
      if ((this.tokenqueue.length == 0
           || this.tokenqueue[this.tokenqueue.length - 1].type <= token_ns.Enum.LEFT_PAREN)
          ||
          (lastSpace == startIndex - 1
           && (startIndex + 1 == s.length || !/\s/.test(s[startIndex + 1])))) {
        ++startIndex;
        this.tokenqueue.push({type:token_ns.Enum.UNARY_MINUS, lexeme:c});
        break;
      }
      // fall through

    case '+':
      ++startIndex;
      this.tokenqueue.push({type:token_ns.Enum.ADDOP, lexeme:c});
      break;

    case '"': // quote word
      ++startIndex;
      this.tokenqueue.push({type:token_ns.Enum.QUOTE, lexeme:c});
      startIndex = this.tokenizeWord(s, startIndex, /[\s\[\]\(\)\{\}]/);
      break;

    case ':': // contents of word
      ++startIndex;
      this.tokenqueue.push({type:token_ns.Enum.COLON, lexeme:c});
      startIndex = this.tokenizeWord(s, startIndex, /[\s\[\]\(\)\{\}\+\-\*\/=<>]/);
      break;

    default:
      if (!/\s/.test(c)) {
        startIndex = this.tokenizeWord(s, startIndex, /[\s\[\]\(\)\{\}\+\-\*\/=<>]/);
      }
      else {
        lastSpace = startIndex;
        ++startIndex;
      }
      break;
    }
  }
};

//------------------------------------------------------------------------------
Tokenizer.prototype.tokenizeList = function(s, startIndex, endToken) {
  while (startIndex < s.length)
  {
    if (s[startIndex] == endToken.lexeme) {
      this.tokenqueue.push(endToken);
      return ++startIndex;
    }

    switch (s[startIndex]) {
    case '[': // left square bracket - begin new list
      this.tokenqueue.push({type:token_ns.Enum.LEFT_SQUARE_BRACKET, lexeme:'['});
      startIndex = this.tokenizeList(s, ++startIndex,
                                     {type:token_ns.Enum.RIGHT_SQUARE_BRACKET, lexeme:']'});
      break;

    case '{': // left curly bracket - begin new array
      this.tokenqueue.push({type:token_ns.Enum.LEFT_CURLY_BRACKET, lexeme:'{'});
      startIndex = this.tokenizeList(s, ++startIndex,
                                     {type:token_ns.Enum.RIGHT_CURLY_BRACKET, lexeme:'}'});
      break;

    default:
      var c = s[startIndex];
      if (!/\s/.test(c)) {
        startIndex = this.tokenizeWord(s, startIndex, /[\s\[\]\{\}]/);
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
    var c = s[startIndex];

    if (c == '\\') {
      ++startIndex;
      if (startIndex == s.length) {
        throw { continuationPrompt: '\\ ' };
      }
      c = s[startIndex];
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
        this.tokenqueue.push({type:token_ns.Enum.WORD, lexeme:lexeme});
        return startIndex;
      }
    }
    ++startIndex;
  }

  if (barred) {
    throw { continuationPrompt: '| ' };
  }

  this.tokenqueue.push({type:token_ns.Enum.WORD, lexeme:lexeme});
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
