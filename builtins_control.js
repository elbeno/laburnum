//------------------------------------------------------------------------------
function Run(env) {
  var instructionList = env.lookupVariable1('r');
  if (instructionList.isArray()) {
    throw { message: "run doesn't like " + instructionList.toString() + ' as input' };
  }

  var terp = new Interpreter();
  return terp.interpret(instructionList.value, env);
}

//------------------------------------------------------------------------------
function RunResult(env) {
  var instructionList = env.lookupVariable1('r');
  if (instructionList.isArray()) {
    throw { message: "runresult doesn't like " + instructionList.toString() + ' as input' };
  }

  var terp = new Interpreter();
  var e = terp.interpret(instructionList.value, env);
  if (e === undefined) {
    return new List([]);
  }
  return new List([e]);
}

//------------------------------------------------------------------------------
function Repeat(env, name) {
  var n = env.lookupVariable1('n');
  if (!n.isNumeric()) {
    throw { message: name + " doesn't like " + n.toString() + ' as input' };
  }

  var instructionList = env.lookupVariable1('r');
  if (instructionList.isArray()) {
    throw { message: "repeat doesn't like " + instructionList.toString() + ' as input' };
  }

  var tokenizer = new Tokenizer();
  tokenizer.tokenize(instructionList.value);

  var terp = new Interpreter();
  var e = undefined;
  for (var i = 0; i < n; ++i) {
    env.bindFunction('repcount', [], function(env) { return new Word(i + 1); }, '');
    e = terp.run(tokenizer.tokenqueue.slice(0), env);
    if (e != undefined) {
      return e;
    }
  }

  return undefined;
}

//------------------------------------------------------------------------------
function Forever(env, name) {
  var instructionList = env.lookupVariable1('r');
  if (instructionList.isArray()) {
    throw { message: "forever doesn't like " + instructionList.toString() + ' as input' };
  }

  var tokenizer = new Tokenizer();
  tokenizer.tokenize(instructionList.value);

  var terp = new Interpreter();
  var e = undefined;
  for (var i = 0; true; ++i) {
    env.bindFunction('repcount', [], function(env) { return new Word(i + 1); }, '');
    e = terp.run(tokenizer.tokenqueue.slice(0), env);
    if (e != undefined) {
      return e;
    }
  }

  return undefined;
}

//------------------------------------------------------------------------------
function If(env, name) {
  var cond  = env.lookupVariable1('cond');
  if (!cond.isBoolean()) {
    throw { message: name + " doesn't like " + cond.toString() + ' as input' };
  }

  var r1 = env.lookupVariable1('r1');
  if (r1.isArray()) {
    throw { message: name + " doesn't like " + r1.toString() + ' as input' };
  }

  var terp = new Interpreter();
  if (cond.jvalue) {
    return terp.interpret(r1.value, env);
  }

  var r2 = env.lookupVariable1('r2');
  if (r2 != undefined) {
    if (r2.isArray()) {
      throw { message: name + " doesn't like " + r2.toString() + ' as input' };
    }
    return terp.interpret(r2].value, env);
  }

  return undefined;
}

//------------------------------------------------------------------------------
function Stop(env, name) {
  throw { message: name + ' can only be used inside a procedure',
          stop: true };
}

//------------------------------------------------------------------------------
function Output(env, name) {
  var a = env.lookupVariable1('a');
  throw { message: name + ' can only be used inside a procedure',
          output: a };
}

//------------------------------------------------------------------------------
function Ignore(env) {
  return undefined;
}

//------------------------------------------------------------------------------
function For(env, name) {
  var control  = env.lookupVariable1('control');
  if (!control.isList() || control.values.length < 3 || control.values.length > 4) {
    throw { message: name + " doesn't like " + control.toString() + ' as input' };
  }

  var instructionList  = env.lookupVariable1('instlist');
  if (instructionList.isArray()) {
    throw { message: name + " doesn't like " + instructionList.toString() + ' as input' };
  }

  var ctrlVar = control.values[0];
  if (!ctrlVar.isWord()) {
    throw { message: name + " doesn't like " + ctrlVar.toString() + ' as input' };
  }

  var terp = new Interpreter();

  var startVal = terp.interpret(control.values[1].value, env);
  if (!startVal.isNumeric()) {
    throw { message: name + " doesn't like " + startVal.toString() + ' as input' };
  }

  var endVal = terp.interpret(control.values[2].value, env);
  if (!endVal.isNumeric()) {
    throw { message: name + " doesn't like " + endVal.toString() + ' as input' };
  }

  var step = startVal.jvalue > endVal.jvalue ? -1 : 1;
  if (control.values.length > 3) {
    var stepVal = terp.interpret(control.values[3].value, env);
    if (!stepVal.isNumeric()) {
      throw { message: name + " doesn't like " + stepVal.toString() + ' as input' };
    }
    step = stepVal.jvalue;
  }

  var tokenizer = new Tokenizer();
  tokenizer.tokenize(instructionList.value);

  var e = undefined;
  for (var i = startVal.jvalue;
       (step > 0 && i <= endVal.jvalue) || (step < 0 && i >= endVal.jvalue);
       i = i + step) {
    env.bindVariable(ctrlVar.value, new Word(i));
    e = terp.run(tokenizer.tokenqueue.slice(0), env);
    if (e != undefined) {
      return e;
    }
  }
  return undefined;
}

//------------------------------------------------------------------------------
function While(env, name) {
  var cond  = env.lookupVariable1('cond');
  if (cond.isArray()) {
    throw { message: name + " doesn't like " + cond.toString() + ' as input' };
  }

  var r = env.lookupVariable1('r');
  if (r.isArray()) {
    throw { message: name + " doesn't like " + r.toString() + ' as input' };
  }

  var tokenizer = new Tokenizer();
  tokenizer.tokenize(cond.value);
  var condexpr = tokenizer.tokenqueue.slice(0);
  tokenizer.tokenize(r.value);
  var instlist = tokenizer.tokenqueue.slice(0);

  var terp = new Interpreter();
  var c = undefined;
  var e = undefined;

  while (true) {
    c = terp.run(condexpr.slice(0), env);
    if (!c.isBoolean()) {
      throw { message: name + " doesn't like " + c.toString() + ' as input' };
    }
    if (!c.jvalue) {
      return undefined;
    }
    e = terp.run(instlist.slice(0), env);
    if (e != undefined) {
      return e;
    }
  }
}

//------------------------------------------------------------------------------
function DoWhile(env) {
  var cond  = env.lookupVariable1('cond');
  if (cond.isArray()) {
    throw { message: name + " doesn't like " + cond.toString() + ' as input' };
  }

  var r = env.lookupVariable1('r');
  if (r.isArray()) {
    throw { message: name + " doesn't like " + r.toString() + ' as input' };
  }

  var tokenizer = new Tokenizer();
  tokenizer.tokenize(cond.value);
  var condexpr = tokenizer.tokenqueue.slice(0);
  tokenizer.tokenize(r.value);
  var instlist = tokenizer.tokenqueue.slice(0);

  var terp = new Interpreter();
  var c = undefined;
  var e = undefined;

  while (true) {
    e = terp.run(instlist.slice(0), env);
    if (e != undefined) {
      return e;
    }
    c = terp.run(condexpr.slice(0), env);
    if (!c.isBoolean()) {
      throw { message: name + " doesn't like " + c.toString() + ' as input' };
    }
    if (!c.jvalue) {
      return undefined;
    }
  }
}

//------------------------------------------------------------------------------
function Until(env) {
  var cond  = env.lookupVariable1('cond');
  if (cond.isArray()) {
    throw { message: name + " doesn't like " + cond.toString() + ' as input' };
  }

  var r = env.lookupVariable1('r');
  if (r.isArray()) {
    throw { message: name + " doesn't like " + r.toString() + ' as input' };
  }

  var tokenizer = new Tokenizer();
  tokenizer.tokenize(cond.value);
  var condexpr = tokenizer.tokenqueue.slice(0);
  tokenizer.tokenize(r.value);
  var instlist = tokenizer.tokenqueue.slice(0);

  var terp = new Interpreter();
  var c = undefined;
  var e = undefined;

  while (true) {
    c = terp.run(condexpr.slice(0), env);
    if (!c.isBoolean()) {
      throw { message: name + " doesn't like " + c.toString() + ' as input' };
    }
    if (c.jvalue) {
      return undefined;
    }
    e = terp.run(instlist.slice(0), env);
    if (e != undefined) {
      return e;
    }
  }
}

//------------------------------------------------------------------------------
function DoUntil(env) {
  var cond  = env.lookupVariable1('cond');
  if (cond.isArray()) {
    throw { message: name + " doesn't like " + cond.toString() + ' as input' };
  }

  var r = env.lookupVariable1('r');
  if (r.isArray()) {
    throw { message: name + " doesn't like " + r.toString() + ' as input' };
  }

  var tokenizer = new Tokenizer();
  tokenizer.tokenize(cond.value);
  var condexpr = tokenizer.tokenqueue.slice(0);
  tokenizer.tokenize(r.value);
  var instlist = tokenizer.tokenqueue.slice(0);

  var terp = new Interpreter();
  var c = undefined;
  var e = undefined;

  while (true) {
    e = terp.run(instlist.slice(0), env);
    if (e != undefined) {
      return e;
    }
    c = terp.run(condexpr.slice(0), env);
    if (!c.isBoolean()) {
      throw { message: name + " doesn't like " + c.toString() + ' as input' };
    }
    if (c.jvalue) {
      return undefined;
    }
  }
}

//------------------------------------------------------------------------------
function InstallBuiltins_Control(env) {

  env.bindFunction('run',
                   { requiredArgs:['r'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Run, '');
  env.bindFunction('runresult',
                   { requiredArgs:['r'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   RunResult, '');
  env.bindFunction('repeat',
                   { requiredArgs:['n', 'r'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   Repeat, '');
  env.bindFunction('forever',
                   { requiredArgs:['r'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Forever, '');
  env.bindFunction('if',
                   { requiredArgs:['cond', 'r1'], optionalArgs:['r2'], restArg:undefined,
                     defaultArgs:2, maxArgs:3, minArgs:2 },
                   If, '');
  env.bindFunction('ifelse',
                   { requiredArgs:['cond', 'r1', 'r2'], optionalArgs:[], restArg:undefined,
                     defaultArgs:3, maxArgs:3, minArgs:3 },
                   If, '');
  env.bindFunction('stop',
                   { requiredArgs:[], optionalArgs:[], restArg:undefined,
                     defaultArgs:0, maxArgs:0, minArgs:0 },
                   Stop, '');
  env.bindFunction('output',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Output, '');
  env.bindFunction('op',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Output, '');
  env.bindFunction('ignore',
                   { requiredArgs:['e'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Ignore, '');
  env.bindFunction('for',
                   { requiredArgs:['control', 'instlist'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   For, '');
  env.bindFunction('while',
                   { requiredArgs:['cond', 'r'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   While, '');
  env.bindFunction('do.while',
                   { requiredArgs:['r', 'cond'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   DoWhile, '');
  env.bindFunction('until',
                   { requiredArgs:['cond', 'r'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   Until, '');
  env.bindFunction('do.until',
                   { requiredArgs:['r', 'cond'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   DoUntil, '');
}

InstallBuiltins_Control(globalEnv);
