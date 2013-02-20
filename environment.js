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
};

//------------------------------------------------------------------------------
// we can bind functions and variables

Environment.prototype.bindFunction = function(name, arglist, body, src) {
  this.functions[name.toLowerCase()] = { 'name':name, 'arglist':arglist, 'body':body, src:src };
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

Environment.prototype.callFunction = function(name, f, args, extraArgs) {
  var newEnv = new Environment(this);

  for (var i = 0; i < f.arglist.length; ++i) {
    newEnv.bindVariable(f.arglist[i], args[i]);
  }

  if (extraArgs != undefined && extraArgs.length > 0) {
    newEnv.bindVariable('[rest]', new List(extraArgs));
  }

  return f.body.call(undefined, newEnv, name);
};

//------------------------------------------------------------------------------
var globalEnv = new Environment(undefined);
