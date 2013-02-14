//------------------------------------------------------------------------------
function Interpreter() {
}

//------------------------------------------------------------------------------
Interpreter.prototype.interpret = function(input, env) {

  // if the line ends with ~, do a continuation
  if (input.charAt(input.length - 1) == '~') {
    throw { continuationPrompt: '~ ' };
  }

  this.env = env;
  this.tokenizer = new Tokenizer(input);

  return this.relop();
};

//------------------------------------------------------------------------------
Interpreter.prototype.relop = function() {
  var lhs = this.addop();

  var t = this.tokenizer.peek();
  if (t != undefined && t.type == token_ns.Enum.RELOP) {
    this.tokenizer.consume();
    var rhs = this.addop();

    if (rhs === undefined) {
      throw { message: "Not enough inputs to " + t.lexeme };
    }

    if (!lhs.isNumeric()) {
      throw { message: t.lexeme + " doesn't like " + lhs.value + ' as input' };
    }
    if (!rhs.isNumeric()) {
      throw { message: t.lexeme + " doesn't like " + rhs.value + ' as input' };
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

    if (rhs === undefined) {
      throw { message: "Not enough inputs to " + t.lexeme };
    }

    if (!lhs.isNumeric()) {
      throw { message: t.lexeme + " doesn't like " + lhs.value + ' as input' };
    }
    if (!rhs.isNumeric()) {
      throw { message: t.lexeme + " doesn't like " + rhs.value + ' as input' };
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

    if (rhs === undefined) {
      throw { message: "Not enough inputs to " + t.lexeme };
    }

    if (!lhs.isNumeric()) {
      throw { message: t.lexeme + " doesn't like " + lhs.value + ' as input' };
    }
    if (!rhs.isNumeric()) {
      throw { message: t.lexeme + " doesn't like " + rhs.value + ' as input' };
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

    if (e === undefined) {
      throw { message: "Not enough inputs to " + t.lexeme };
    }
    if (!e.isNumeric()) {
      throw { message: t.lexeme + " doesn't like " + e.value + ' as input' };
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

  if (t === undefined) {
    return undefined;
  }

  switch (t.type) {

  case token_ns.Enum.QUOTE:
    this.tokenizer.consume();
    t = this.tokenizer.consume();
    return new Word(t.lexeme);
    break;

  case token_ns.Enum.COLON:
    this.tokenizer.consume();
    t = this.tokenizer.consume();
    e = this.env.lookupVariable(t.lexeme);
    if (e === undefined) {
      e = new Word(t.lexeme);
      throw { message: e.toString() + ' has no value' };
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

  case token_ns.Enum.RIGHT_SQUARE_BRACKET:
    // right square bracket should be matched by list
    throw { message: 'unexpected ]' };
    break;

  case token_ns.Enum.LEFT_PAREN:
    // parenthesised expression
    this.tokenizer.consume();
    t = this.tokenizer.peek();

    if (t === undefined) {
      throw { continuationPrompt: '~ ' };
    }

    if (t.type == token_ns.Enum.RIGHT_PAREN) {
      throw { message: 'unexpected )' };
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
    e = this.relop();
    t = this.tokenizer.expect(')', { continuationPrompt: '~ ' });
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
      this.tokenizer.consume();
      datums.push(new Word(t.lexeme));
      break;

    case token_ns.Enum.LEFT_SQUARE_BRACKET:
      this.tokenizer.consume();
      datums.push(this.listexpr());
      break;

    default:
      throw { message: "bad token in list: " + t.lexeme };
    }

    t = this.tokenizer.peek();
  }

  if (t === undefined) {
    throw { continuationPrompt: '~ ' };
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
    if (e === undefined) {
      throw 'not enough inputs to ' + name;
    }
    args.push(e);
  }

  var extraArgs = [];
  if (eatExtraArgs) {
    var t = this.tokenizer.peek();
    while (t != undefined && t.type != token_ns.Enum.RIGHT_PAREN) {
      var e = this.relop();
      if (e != undefined) {
        extraArgs.push(e);
      }
      t = this.tokenizer.peek();
    }

    if (t === undefined) {
      throw 'unmatched (';
    }

    this.tokenizer.consume();
  }

  return this.env.callFunction(f, args, extraArgs);
};
