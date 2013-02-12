//------------------------------------------------------------------------------
function Interpreter(input, env) {
  // replace any continuation prompts
  var s = input.replace(/\n>/g, '\n');
  this.tokenizer = new Tokenizer(s);
  this.env = env;
}

//------------------------------------------------------------------------------
Interpreter.prototype.interpret = function() {
  return this.relop();
};

//------------------------------------------------------------------------------
Interpreter.prototype.relop = function() {
  var lhs = this.addop();

  var t = this.tokenizer.peek();
  if (t != undefined && t.type == token_ns.Enum.RELOP) {
    this.tokenizer.consume();
    var rhs = this.addop();

    if (rhs == undefined) {
      throw "Not enough inputs to " + t.lexeme;
    }

    if (!lhs.isNumeric()) {
      throw t.lexeme + " doesn't like " + lhs.value + ' as input';
    }
    if (!rhs.isNumeric()) {
      throw t.lexeme + " doesn't like " + rhs.value + ' as input';
    }

    switch (t.lexeme) {
    case '>':
      return new Word(lhs.jvalue > rhs.jvalue);
    case '<':
      return new Word(lhs.jvalue < rhs.jvalue);
    case '>=':
      return new Word(lhs.jvalue >= rhs.jvalue);
    case '<=':
      return new Word(lhs.jvalue <= rhs.jvalue);
    case '<>':
      return new Word(lhs.jvalue != rhs.jvalue);
    case '=':
      return new Word(lhs.jvalue == rhs.jvalue);
    }
  }

  return lhs;
};

//------------------------------------------------------------------------------
Interpreter.prototype.addop = function() {
  var lhs = this.mulop();

  var t = this.tokenizer.peek();
  while (t != undefined && t.type == token_ns.Enum.ADDOP) {
    this.tokenizer.consume();
    var rhs = this.mulop();

    if (rhs == undefined) {
      throw "Not enough inputs to " + t.lexeme;
    }

    if (!lhs.isNumeric()) {
      throw t.lexeme + " doesn't like " + lhs.value + ' as input';
    }
    if (!rhs.isNumeric()) {
      throw t.lexeme + " doesn't like " + rhs.value + ' as input';
    }

    switch (t.lexeme) {
    case '+':
      lhs = new Word(lhs.jvalue + rhs.jvalue);
      break;
    case '-':
      lhs = new Word(lhs.jvalue - rhs.jvalue);
      break;
    }

    t = this.tokenizer.peek();
  }

  return lhs;
};

//------------------------------------------------------------------------------
Interpreter.prototype.mulop = function() {
  var lhs = this.unaryop();

  var t = this.tokenizer.peek();
  while (t != undefined && t.type == token_ns.Enum.MULOP) {
    this.tokenizer.consume();
    var rhs = this.unaryop();

    if (rhs == undefined) {
      throw "Not enough inputs to " + t.lexeme;
    }

    if (!lhs.isNumeric()) {
      throw t.lexeme + " doesn't like " + lhs.value + ' as input';
    }
    if (!rhs.isNumeric()) {
      throw t.lexeme + " doesn't like " + rhs.value + ' as input';
    }

    switch (t.lexeme) {
    case '*':
      lhs = new Word(lhs.jvalue * rhs.jvalue);
      break;
    case '/':
      lhs = new Word(lhs.jvalue / rhs.jvalue);
      break;
    case '%':
      lhs = new Word(lhs.jvalue % rhs.jvalue);
      break;
    }

    t = this.tokenizer.peek();
  }

  return lhs;
};

//------------------------------------------------------------------------------
Interpreter.prototype.unaryop = function() {
  var t = this.tokenizer.peek();
  if (t != undefined && t.type == token_ns.Enum.ADDOP) {
    this.tokenizer.consume();
    var e = this.expr();

    if (e == undefined) {
      throw "Not enough inputs to " + t.lexeme;
    }
    if (!e.isNumeric()) {
      throw t.lexeme + " doesn't like " + e.value + ' as input';
    }

    switch (t.lexeme) {
    case '-':
      return new Word(-e.jvalue);
      break;
    case '+':
      return e;
      break;
    }
  }

  return this.expr();
};

//------------------------------------------------------------------------------
Interpreter.prototype.expr = function() {
  var t = this.tokenizer.peek();

  if (t == undefined) {
    return undefined;
  }

  switch (t.type) {

  case token_ns.Enum.QUOTE:
    this.tokenizer.consume();
    t = this.tokenizer.consume();
    if (t.type != token_ns.Enum.WORD) {
      throw 'tokenization error: expecting word after "';
    }
    return new Word(t.lexeme);
    break;

  case token_ns.Enum.COLON:
    this.tokenizer.consume();
    t = this.tokenizer.peek();
    // dots expects a word, but doesn't use the quoted word delimiters, so
    // failure to match a word here should be treated as the empty word
    if (t.type != token_ns.Enum.WORD) {
      return new Word('');
    }
    // thing returns the variable bound to that name
    e = this.env.lookupVariable(t.lexeme);
    if (e == undefined) {
      throw t.lexeme + ' has no value';
    }
    return e;
    break;

  case token_ns.Enum.WORD:
    this.tokenizer.consume();
    e = new Word(t.lexeme);
    // number or bool -> return that
    if (e.isNumeric() || e.isBoolean()) {
      return e;
    }
    // otherwise, a word should be interpreted as a function or variable
    return this.value(t.lexeme, false);
    break;

  case token_ns.Enum.RIGHT_PAREN:
    // right paren should be matched with expect after left paren
    throw 'unexpected )';
    break;

  case token_ns.Enum.RIGHT_SQUARE_BRACKET:
    // right square bracket should be matched by list
    throw 'unexpected ]';
    break;

  case token_ns.Enum.LEFT_PAREN:
    // parenthesised expression
    this.tokenizer.consume();
    t = this.tokenizer.peek();

    if (t == undefined) {
      throw 'unmatched (';
    }

    if (t.type == token_ns.Enum.RIGHT_PAREN) {
      throw 'unexpected )';
    }

    // if the next token is a word and is not numeric or boolean, treat it as a
    // value, and if it's a function interpret arguments until the close paren
    if (t.type == token_ns.Enum.WORD) {
      e = new Word(t.lexeme);
      if (!e.isNumeric() && !e.isBoolean()) {
        this.tokenizer.consume();
        return this.value(t.lexeme, true);
      }
    }

    // a number or bool: start interpretation again at the top level
    e = this.interpret();
    this.tokenizer.expect(')', 'unmatched (');
    return e;
    break;

  case token_ns.Enum.LEFT_SQUARE_BRACKET:
    // list
    this.tokenizer.consume();
    return this.listexpr();
    break;
  }

  return undefined;
};

//------------------------------------------------------------------------------
Interpreter.prototype.listexpr = function() {
  var t = this.tokenizer.peek();

  var datums = [];
  while (t != undefined && t.type != token_ns.Enum.RIGHT_SQUARE_BRACKET) {

    switch (t.type) {
    case token_ns.Enum.WORD:
      datums.push(new Word(t.lexeme));
      break;

    case token_ns.Enum.LEFT_SQUARE_BRACKET:
      datums.push(this.listexpr());
      break;

    default:
      throw "bad token in list: " + t.lexeme;
    }

    this.tokenizer.consume();
    t = this.tokenizer.peek();
  }

  if (t == undefined) {
    return undefined;
  }

  this.tokenizer.consume();
  return new List(datums);
};

//------------------------------------------------------------------------------
Interpreter.prototype.value = function(name, eatExtraArgs) {
  // prefer a variable
  var v = this.env.lookupVariable(name);
  if (v != undefined) {
    return v;
  }

  // otherwise do a function call
  var f = this.env.lookupFunction(name);

  var args = [];
  for (var i = 0; i < f.arglist.length; ++i) {
    var e = this.relop();
    if (e == undefined) {
      throw 'not enough inputs to ' + name;
    }
    args.push(e);
  }

  var extraArgs = [];
  if (eatExtraArgs) {
    var t = this.tokenizer.peek();
    while (t != undefined && t != token_ns.Enum.RIGHT_SQUARE_BRACKET) {
      extraArgs.push(this.relop());
      t = this.tokenizer.peek();
    }
  }

  return this.env.callFunction(f, args, extraArgs);
};
