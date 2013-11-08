//------------------------------------------------------------------------------
function Environment(parentEnv) {
  this.variables = {};
  this.functions = {};
  this.parentEnv = parentEnv;
}

//------------------------------------------------------------------------------
// we can look up functions and variables by name

Environment.prototype.lookupFunction = function(name) {
  var f = this.functions[name.toLowerCase()];
  if (f != undefined) {
    return f;
  }

  if (this.parentEnv != undefined) {
    f = this.parentEnv.lookupFunction(name);
    if (f != undefined) {
      return f;
    }
  }

  throw { message: "I don't know how to " + name };
};

Environment.prototype.lookupVariable = function(name) {
  var v = this.variables[name.toLowerCase()];
  if (v != undefined && v.type != undefined) {
    return v;
  }

  if (this.parentEnv != undefined) {
    v = this.parentEnv.lookupVariable(name);
    if (v != undefined && v.type != undefined) {
      return v;
    }
  }

  return undefined;
};

//------------------------------------------------------------------------------
// we can look up variables by name, just in the enclosing env

Environment.prototype.lookupVariable1 = function(name) {
  return this.variables[name.toLowerCase()];
};

//------------------------------------------------------------------------------
// we can bind functions and variables

Environment.prototype.bindFunction = function(name, argspec, body, src) {
  this.functions[name.toLowerCase()] = { 'name':name, 'argspec':argspec, 'body':body, src:src };
};

Environment.prototype.bindVariable = function(name, value) {
  this.variables[name.toLowerCase()] = value;
};

//------------------------------------------------------------------------------
// assign a variable to the most local environment it's already declared in

Environment.prototype.assignVariable = function(name, value) {
  var env = this;
  while (env != undefined) {
    var v = this.variables[name.toLowerCase()];
    if (v != undefined || env.parentEnv === undefined) {
      env.variables[name.toLowerCase()] = value;
      break;
    }
    env = env.parentEnv;
  }
};

//------------------------------------------------------------------------------
// we can bind functions and variables

Environment.prototype.eraseFunction = function(name) {
  this.functions[name.toLowerCase()] = undefined;
};

//------------------------------------------------------------------------------
// we can call functions

Environment.prototype.callFunction = function(name, f, args) {
  var newEnv = new Environment(this);
  var i = 0;

  // bind the required args
  for (; i < f.argspec.requiredArgs.length; ++i) {
    newEnv.bindVariable(f.argspec.requiredArgs[i], args[i]);
  }

  // bind any optional args passed in
  var j = 0;
  for (; i < args.length && j < f.argspec.optionalArgs.length; ++i, ++j) {
    newEnv.bindVariable(f.argspec.optionalArgs[j].name, args[i]);
  }

  // evaluate defaults for remaining optionals and bind them in the new env
  var terp = new Interpreter();
  terp.env = newEnv;
  terp.tokenizer = new Tokenizer();
  for (; j < f.argspec.optionalArgs.length; ++j) {
    if (f.argspec.optionalArgs[j].expr != undefined) {
      // re-tokenize the expression since it was in a list before
      var input = f.argspec.optionalArgs[j].expr.map(
        function(x) { return x.lexeme; }).join(' ');
      terp.tokenizer.tokenize(input);
      newEnv.bindVariable(f.argspec.optionalArgs[j].name, terp.toplevel());
    }
  }

  // bind the rest of the arguments
  if (f.argspec.restArg != undefined) {
    newEnv.bindVariable(f.argspec.restArg, new List(args.slice(i)));
  }

  return f.body.call(undefined, newEnv, name);
};

//------------------------------------------------------------------------------
var globalEnv = new Environment(undefined);
