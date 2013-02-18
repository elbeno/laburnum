//------------------------------------------------------------------------------
function Interpreter() {
}

//------------------------------------------------------------------------------
Interpreter.prototype.interpret = function(input, env) {
  this.env = env;
  this.tokenizer = new Tokenizer();

  if (/^to\s/i.test(input)) {
    return this.parseToForm(input, env);
  }

  this.tokenizer.tokenize(this.tokenizer.preprocess(input));
  return this.toplevel();
};

//------------------------------------------------------------------------------
Interpreter.prototype.run = function(tokenstream, env) {
  this.env = env;
  this.tokenizer = new Tokenizer();
  this.tokenizer.tokenqueue = tokenstream;
  return this.toplevel();
};

//------------------------------------------------------------------------------
Interpreter.prototype.toplevel = function() {
  var e = undefined;
  while (e === undefined && this.tokenizer.tokenqueue.length > 0) {
    e = this.relop();
  }
  return e;
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
      throw { message: t.lexeme + " doesn't like " + lhs.toString() + ' as input' };
    }
    if (!rhs.isNumeric()) {
      throw { message: t.lexeme + " doesn't like " + rhs.toString() + ' as input' };
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
      throw { message: t.lexeme + " doesn't like " + lhs.toString() + ' as input' };
    }
    if (!rhs.isNumeric()) {
      throw { message: t.lexeme + " doesn't like " + rhs.toString() + ' as input' };
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
      throw { message: t.lexeme + " doesn't like " + lhs.toString() + ' as input' };
    }
    if (!rhs.isNumeric()) {
      throw { message: t.lexeme + " doesn't like " + rhs.toString() + ' as input' };
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
      throw { message: t.lexeme + " doesn't like " + e.toString() + ' as input' };
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

  case token_ns.Enum.LEFT_CURLY_BRACKET:
    // list
    this.tokenizer.consume();
    return this.arrayexpr();
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

    case token_ns.Enum.LEFT_CURLY_BRACKET:
      this.tokenizer.consume();
      datums.push(this.arrayexpr());
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
Interpreter.prototype.arrayexpr = function() {
  var t = this.tokenizer.peek();

  var datums = [];
  while (t != undefined && t.type != token_ns.Enum.RIGHT_CURLY_BRACKET) {

    switch (t.type) {
    case token_ns.Enum.WORD:
      this.tokenizer.consume();
      datums.push(new Word(t.lexeme));
      break;

    case token_ns.Enum.LEFT_SQUARE_BRACKET:
      this.tokenizer.consume();
      datums.push(this.listexpr());
      break;

    case token_ns.Enum.LEFT_CURLY_BRACKET:
      this.tokenizer.consume();
      datums.push(this.arrayexpr());
      break;

    default:
      throw { message: "bad token in array: " + t.lexeme };
    }

    t = this.tokenizer.peek();
  }

  if (t === undefined) {
    throw { continuationPrompt: '~ ' };
  }

  this.tokenizer.consume();
  t = this.tokenizer.peek();

  // check for @base after array literal
  var base = 0;
  if (t != undefined && t.type == token_ns.Enum.AT_SIGN) {
    this.tokenizer.consume();

    // if the next token is a word and is numeric, treat it as the base,
    // otherwise the base is 0
    t = this.tokenizer.peek();
    if (t != undefined && t.type == token_ns.Enum.WORD) {
      e = new Word(t.lexeme);
      if (e.isNumeric()) {
        base = e.jvalue;
      }
    }
  }

  return new LArray(datums, base);
};

//------------------------------------------------------------------------------
Interpreter.prototype.value = function(name, eatExtraArgs) {
  // prefer a variable
  var v = this.env.lookupVariable(name);
  if (v != undefined) {
    return v;
  }

  // otherwise do a function call
  if (name.toLowerCase() == 'to') {
    // TODO: disallow use of TO
  }
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

  try {
    return this.env.callFunction(f, args, extraArgs);
  }
  catch (e) {
    // if the message starts with the function name, don't add it
    var re = new RegExp('^' + name + ' ');
    if (re.test(e.message)) {
      throw e;
    }
    throw { message: e.message + ' in ' + name };
  }
};

//------------------------------------------------------------------------------
Interpreter.prototype.parseToForm = function(input, env) {

  // store the source for printout (with only > prompts removed)
  var src = input.replace(/\n> /g, '\n');

  // replace any > continuations and split into lines
  var lines = this.tokenizer.preprocess(input).replace(/\n> /g, '\n').split('\n');
  // the last line is empty
  lines.pop();

  // first line is TO name arg1 arg2 ...
  this.tokenizer.tokenize(lines[0]);
  // throw away the TO
  this.tokenizer.consume();

  // the next lexeme is the function name: it must not be numeric (although it
  // can be a boolean lexeme)
  var t = this.tokenizer.consume();
  if (t === undefined) {
    throw { message: 'not enough inputs to to' };
  }
  var e = new Word(t.lexeme);
  if (e.isNumeric()) {
    throw { message: "to doesn't like " + e.toString() + ' as input' };
  }
  var funcName = t.lexeme;

  // deal with redefinition of function
  try {
    env.lookupFunction(funcName);
    throw { message: funcName  + ' is already defined', rethrow:true };
  }
  catch (e) {
    if (e.rethrow) {
      throw e;
    }
  }

  // now, if we don't have end on the last line, we can early-out
  if (!/^end$/i.test(lines[lines.length - 1])) {
    throw { continuationPrompt: '> ' };
  }

  // any other tokens are parameter names. They may be appended with :
  var args = [];
  t = this.tokenizer.consume();
  while (t != undefined) {
    if (t.type != token_ns.Enum.COLON) {
      e = new Word(t.lexeme);
      if (e.isNumeric()) {
        throw { message: "to doesn't like " + e.toString() + ' as input' };
      }
      args.push(t.lexeme);
    }
    t = this.tokenizer.consume();
  }

  // drop the TO and END lines, join and tokenize
  lines.shift();
  lines.pop();
  this.tokenizer.tokenize(lines.join('\n'));
  var tokenstream = this.tokenizer.tokenqueue;

  // bind this function in the global env
  globalEnv.bindFunction(funcName, args, function(env) {
    var terp = new Interpreter();
    return terp.run(tokenstream.slice(0), env);
  }, src);
};
