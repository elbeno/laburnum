//------------------------------------------------------------------------------
function Environment() {
  this.variables = {};
  this.functions = {};

  InstallBuiltins(this);
}

//------------------------------------------------------------------------------
// we can look up functions and variables by name

Environment.prototype.lookupFunction = function(name) {
  var f = this.functions[name];
  if (f != undefined)
    return f;

  throw "Function " + name + " is undefined.";
};

Environment.prototype.lookupVariable = function(name) {
  var v = this.variables[name];
  if (v != undefined)
    return v;

  throw "Variable " + name + " is undefined.";
};

//------------------------------------------------------------------------------
// we can bind functions and variables

Environment.prototype.bindFunction = function(name, arity, body) {
  this.functions[name] = { "arity":arity, "body":body };
};

Environment.prototype.lookupVariable = function(name, value) {
  this.variables[name] = value;
};

//------------------------------------------------------------------------------
// we can find the arity of a function

Environment.prototype.arity = function(name) {
  var f = this.functions[name];
  if (f != undefined)
    return f.arity;

  throw "Function " + name + " is undefined.";
};
