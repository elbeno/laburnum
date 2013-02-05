//------------------------------------------------------------------------------
function Expression() {}

// We can't evaluate an abstract expression
Expression.prototype.eval = function(environment) {
  throw "Attempt to evaluate an abstract expression.";
};

// But we can't evaluate an abstract expression
Expression.prototype.toString = function() {
  throw "Attempt to print an abstract expression.";
};

//------------------------------------------------------------------------------
// A word is an expression with a name
Word.prototype = new Expression();
Word.prototype.constructor = Word;

function Word(name) {
  this.name = name;
}

// To evaluate a word, we look it up in the environment
Word.prototype.eval = function(env) {
  return env.lookupVariable(this.name);
};

// Printing a word is printing its name
Word.prototype.toString = function() {
  return this.name;
};

//------------------------------------------------------------------------------
// A number is an expression
Number.prototype = new Expression();
Number.prototype.constructor = Number;

function Number(value) {
  this.value = value;
}

// A number evaluates to itself
Number.prototype.eval = function(environment) {
  return this;
};

// And printing it prints its value
Number.prototype.toString = function() {
  return this.value.toString();
};

//------------------------------------------------------------------------------
// A function is an expression of a number of arguments
Function.prototype = new Expression();
Function.prototype.constructor = Function;

function Function(name, args) {
  this.name = name;
  this.args = args;
}

// To evaluate a function, look it up in the environment, evaluate the
// arguments, bind the arguments to the parameters, and apply it.
Function.prototype.eval = function(env) {
  var f = env.lookupFunction(this.name);
  var args = this.args.map(function(x) { return x.eval(env); });
  return f.body.apply(undefined, args);
};

// And printing it is undefined...
Function.prototype.toString = function() {
  return '<function(' + this.name + ')>';
};
