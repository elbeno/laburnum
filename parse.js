//------------------------------------------------------------------------------
function parse(input, env) {

  var tokenizer = new Tokenizer(input);
  return parseRelop(tokenizer, env);
}

//------------------------------------------------------------------------------
function parseRelop(tokenizer, env) {
  var lhs = parseAddop(tokenizer, env);

  var t = tokenizer.peek();
  if (t != undefined && t.type == token_ns.Enum.RELOP) {
    tokenizer.consume();
    var rhs = parseAddop(tokenizer, env);
    return new Func(t.lexeme, [lhs, rhs]);
  }

  return lhs;
}

//------------------------------------------------------------------------------
function parseAddop(tokenizer, env) {
  var lhs = parseMulop(tokenizer, env);

  // while loop here so that we can do a + b + c etc
  var t = tokenizer.peek();
  while (t != undefined && t.type == token_ns.Enum.ADDOP) {
    tokenizer.consume();
    var rhs = parseMulop(tokenizer, env);
    lhs = new Func(t.lexeme, [lhs, rhs]);
    t = tokenizer.peek();
  }

  return lhs;
}

//------------------------------------------------------------------------------
function parseMulop(tokenizer, env) {
  var lhs = parseUnary(tokenizer, env);

  // while loop here so that we can do a * b * c etc
  var t = tokenizer.peek();
  while (t != undefined && t.type == token_ns.Enum.MULOP) {
    tokenizer.consume();
    var rhs = parseUnary(tokenizer, env);
    lhs = new Func(t.lexeme, [lhs, rhs]);
    t = tokenizer.peek();
  }

  return lhs;
}

//------------------------------------------------------------------------------
function parseUnary(tokenizer, env) {

  var t = tokenizer.peek();
  if (t != undefined
      && t.lexeme == '-') {
    tokenizer.consume();
    var e = parseExpr(tokenizer, env);
    return new Func('~', [e]);
  }

  return parseExpr(tokenizer, env);
}

//------------------------------------------------------------------------------
function parseExpr(tokenizer, env) {

  var t = tokenizer.peek();

  switch (t.type) {

  case token_ns.Enum.LEFT_PAREN:
    // parenthesised expression
    tokenizer.consume();
    var expr = parseRelop(tokenizer, env);
    tokenizer.expect(token_ns.Enum.RIGHT_PAREN);
    return expr;

  case token_ns.Enum.LEFT_SQUARE_BRACKET:
    // list expression
    tokenizer.consume();
    var l = parseList(tokenizer, env, token_ns.Enum.RIGHT_SQUARE_BRACKET);
    return l;

  case token_ns.Enum.NUMBER:
    // plain number
    tokenizer.consume();
    return new Numeric(parseInt(t.lexeme));

  case token_ns.Enum.WORD:
    // a word that must be a function, so find the arity and parse that many
    // arguments
    tokenizer.consume();
    var arity = env.arity(t.lexeme);
    var arguments = [];
    for (var i = 0; i < arity; ++i) {
      arguments.push(parseRelop(tokenizer, env));
    }
    return new Func(t.lexeme, arguments);

  case token_ns.Enum.FORM:
    // a special form is parsed according to its own rules
    tokenizer.consume();
    switch (t.lexeme) {
    case 'QUOTE':
      return parseQuote(tokenizer, env);

    case 'TO':
      return parseTo(tokenizer, env);
    }

  }

  throw 'Bad parse.';
}

//------------------------------------------------------------------------------
function parseList(tokenizer, env, end) {
  var exprs = [];
  var t = tokenizer.peek();
  while (t != undefined && t.type != end) {
    exprs.push(parseRelop(tokenizer, env));
    t = tokenizer.peek();
  }
  tokenizer.expect(end);
  return new List(exprs);
}

//------------------------------------------------------------------------------
function parseQuote(tokenizer, env) {
  var t = tokenizer.peek();

  switch (t.type) {
  case token_ns.Enum.NUMBER:
    tokenizer.consume();
    return new Numeric(parseInt(t.lexeme));

  case token_ns.Enum.WORD:
    tokenizer.consume();
    return new Word(t.lexeme);

  default:
    throw 'Quote expected a word or a number.';
  }
}

//------------------------------------------------------------------------------
function parseTo(tokenizer, env) {
  // name of the procedure
  var name = tokenizer.expect(token_ns.Enum.WORD).lexeme;

  // collect argument names
  var args = [];
  var t = tokenizer.peek();
  while (t != undefined && t.type == token_ns.Enum.COLON) {
    tokenizer.consume();
    args.push(tokenizer.expect(token_ns.Enum.WORD).lexeme);
    t = tokenizer.peek();
  }

  // parse a list of commands, ending with END
  var body = parseList(tokenizer, env, token_ns.Enum.END);

  // create a new function
  env.bindFunction(name, args, function(env) { return body.eval(env); });

  return new Numeric(0);
}
