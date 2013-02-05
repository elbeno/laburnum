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
    return new Function(t.lexeme, [lhs, rhs]);
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
    lhs = new Function(t.lexeme, [lhs, rhs]);
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
    lhs = new Function(t.lexeme, [lhs, rhs]);
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
    return new Function('~', [e]);
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

  case token_ns.Enum.NUMBER:
    // plain number
    tokenizer.consume();
    return new Number(parseInt(t.lexeme));

  case token_ns.Enum.WORD:
    // a word that must be a function, so find the arity and parse that many
    // arguments
    tokenizer.consume();
    var arity = env.arity(t.lexeme);
    var arguments = [];
    for (var i = 0; i < arity; ++i) {
      arguments.push(parseRelop(tokenizer, env));
    }
    return new Function(t.lexeme, arguments);

  }

  throw "Bad parse";
}
