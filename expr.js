//------------------------------------------------------------------------------
function Expression() {}

// An abstract expression has no evaluation.
Expression.prototype.eval = function(environment) {
  return this;
};

// And prints nothing.
Expression.prototype.toString = function() {
  return '';
};

//------------------------------------------------------------------------------
// A word is an expression with a name
Word.prototype = new Expression();
Word.prototype.constructor = Word;

function Word(name) {
  this.type = 'word';
  this.name = name;
}

// A word evaluates to itself.
Word.prototype.eval = function(env) {
  return this;
};

// Printing a word is printing its name
Word.prototype.toString = function() {
  return this.name;
};

//------------------------------------------------------------------------------
// A numeric value is an expression
Numeric.prototype = new Expression();
Numeric.prototype.constructor = Numeric;

function Numeric(value) {
  this.type = 'numeric';
  this.value = value;
}

// A number evaluates to itself
Numeric.prototype.eval = function(environment) {
  return this;
};

// And printing it prints its value
Numeric.prototype.toString = function() {
  return this.value.toString();
};

//------------------------------------------------------------------------------
// A boolean value is an expression
Bool.prototype = new Expression();
Bool.prototype.constructor = Bool;

function Bool(value) {
  this.type = 'bool';
  this.value = value;
}

// A boolean evaluates to itself
Bool.prototype.eval = function(environment) {
  return this;
};

// And printing it prints its value
Bool.prototype.toString = function() {
  return this.value.toString();
};

//------------------------------------------------------------------------------
// A function is an expression of a number of arguments
Func.prototype = new Expression();
Func.prototype.constructor = Func;

function Func(name, args) {
  this.type = 'function';
  this.name = name;
  this.args = args;
}

// To evaluate a function, look it up in the environment, evaluate the
// arguments, bind the arguments to the parameters in a cloned environment, and
// call the function.
Func.prototype.eval = function(env) {
  var f = env.lookupFunction(this.name);
  var newEnv = jQuery.extend(true, {}, env);

  for (var i = 0; i < this.args.length; ++i) {
    newEnv.bindVariable(f.arglist[i], this.args[i].eval(env));
  }

  return f.body.call(undefined, newEnv);
};

// And printing it is implementation defined.
Func.prototype.toString = function() {
  return '<function(' + this.name + ')>';
};

//------------------------------------------------------------------------------
// A list value is a list of expressions
List.prototype = new Expression();
List.prototype.constructor = List;

function List(elements) {
  this.type = 'list';
  this.elements = elements;
}

// A list evaluates all its elements and returns the last result.
List.prototype.eval = function(env) {
  var result;
  for (var i = 0; i < this.elements.length; ++i) {
    result = this.elements[i].eval(env);
  }
  return result;
};

// And printing it prints its value as a list.
List.prototype.toString = function() {
  var p = this.elements.map(function(x) { return x.toString(); });
  return '[' + p.join(' ') + ']';
};

//------------------------------------------------------------------------------
// A TO form is a function definition.
ToForm.prototype = new Expression();
ToForm.prototype.constructor = ToForm;

function ToForm(name, args, body) {
  this.type = 'TO';
  this.name = name;
  this.args = args;
  this.body = body;
}

// Evaluating a TO form binds the function body to the name.
ToForm.prototype.eval = function(env) {
  var b = this.body;
  env.bindFunction(this.name, this.args, function(e) { return b.eval(e); });
  return this;
};

// And printing it is implementation defined.
ToForm.prototype.toString = function() {
  return 'TO ' + this.name;
};
