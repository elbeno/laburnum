//------------------------------------------------------------------------------
function UnaryMinus(env) {
  var v = env.lookupVariable('arg');
  if (v.type != 'numeric') {
    throw 'Unary -: invalid argument type (expecting numeric, found ' + v.type + ').';
  }
  return new Numeric(-v.value);
}

//------------------------------------------------------------------------------
function Add(env) {
  var a = env.lookupVariable('augend');
  if (a.type != 'numeric') {
    throw '+: invalid argument type for augend (expecting numeric, found ' + a.type + ').';
  }

  var b = env.lookupVariable('addend');
  if (b.type != 'numeric') {
    throw '+: invalid argument type for addend (expecting numeric, found ' + b.type + ').';
  }

  return new Numeric(a.value + b.value);
}

//------------------------------------------------------------------------------
function Sub(env) {
  var a = env.lookupVariable('minuend');
  if (a.type != 'numeric') {
    throw '-: invalid argument type for minend (expecting numeric, found ' + a.type + ').';
  }

  var b = env.lookupVariable('subtrahend');
  if (b.type != 'numeric') {
    throw '-: invalid argument type for subtrahend (expecting numeric, found ' + b.type + ').';
  }

  return new Numeric(a.value - b.value);
}

//------------------------------------------------------------------------------
function Mul(env) {
  var a = env.lookupVariable('multiplier');
  if (a.type != 'numeric') {
    throw '*: invalid argument type for multiplier (expecting numeric, found ' + a.type + ').';
  }

  var b = env.lookupVariable('multiplicand');
  if (b.type != 'numeric') {
    throw '*: invalid argument type for multiplicand (expecting numeric, found ' + b.type + ').';
  }

  return new Numeric(a.value * b.value);
}

//------------------------------------------------------------------------------
function Div(env) {
  var a = env.lookupVariable('dividend');
  if (a.type != 'numeric') {
    throw '/: invalid argument type for dividend (expecting numeric, found ' + a.type + ').';
  }

  var b = env.lookupVariable('divisor');
  if (b.type != 'numeric') {
    throw '/: invalid argument type for divisor (expecting numeric, found ' + b.type + ').';
  }

  return new Numeric(a.value / b.value);
}

//------------------------------------------------------------------------------
function Mod(env) {
  var a = env.lookupVariable('dividend');
  if (a.type != 'numeric') {
    throw '%: invalid argument type for dividend (expecting numeric, found ' + a.type + ').';
  }

  var b = env.lookupVariable('divisor');
  if (b.type != 'numeric') {
    throw '%: invalid argument type for divisor (expecting numeric, found ' + b.type + ').';
  }

  return new Numeric(a.value % b.value);
}

//------------------------------------------------------------------------------
function Equals(env) {
  var a = env.lookupVariable('a');
  var b = env.lookupVariable('b');

  // TODO: compare functions for all types
  return new Bool(a.type == b.type && a.value == b.value);
}

//------------------------------------------------------------------------------
function GreaterThan(env) {
  var a = env.lookupVariable('a');
  if (a.type != 'numeric') {
    throw '>: invalid argument type (expecting numeric, found ' + a.type + ').';
  }

  var b = env.lookupVariable('b');
  if (b.type != 'numeric') {
    throw '>: invalid argument type (expecting numeric, found ' + b.type + ').';
  }

  return new Bool(a.value > b.value);
}

//------------------------------------------------------------------------------
function LessThan(env) {
  var a = env.lookupVariable('a');
  if (a.type != 'numeric') {
    throw '<: invalid argument type (expecting numeric, found ' + a.type + ').';
  }

  var b = env.lookupVariable('b');
  if (b.type != 'numeric') {
    throw '<: invalid argument type (expecting numeric, found ' + b.type + ').';
  }

  return new Bool(a.value < b.value);
}

//------------------------------------------------------------------------------
function GreaterThanOrEqual(env) {
  var a = env.lookupVariable('a');
  if (a.type != 'numeric') {
    throw '>=: invalid argument type (expecting numeric, found ' + a.type + ').';
  }

  var b = env.lookupVariable('b');
  if (b.type != 'numeric') {
    throw '>=: invalid argument type (expecting numeric, found ' + b.type + ').';
  }

  return new Bool(a.value >= b.value);
}

//------------------------------------------------------------------------------
function LessThanOrEqual(env) {
  var a = env.lookupVariable('a');
  if (a.type != 'numeric') {
    throw '<=: invalid argument type (expecting numeric, found ' + a.type + ').';
  }

  var b = env.lookupVariable('b');
  if (b.type != 'numeric') {
    throw '<=: invalid argument type (expecting numeric, found ' + b.type + ').';
  }

  return new Bool(a.value <= b.value);
}

//------------------------------------------------------------------------------
function Print(env) {
  var a = env.lookupVariable('arg');

  var repl = $('#repl');
  var s = a.toString();
  repl.val(repl.val() + s + '\n');
  return new Expression();
}

//------------------------------------------------------------------------------
function InstallBuiltins(env) {
  env.bindFunction('~', ['arg'], UnaryMinus);
  env.bindFunction('+', ['augend', 'addend'], Add);
  env.bindFunction('-', ['minuend', 'subtrahend'], Sub);
  env.bindFunction('*', ['multiplier', 'multiplicand'], Mul);
  env.bindFunction('/', ['dividend', 'divisor'], Div);
  env.bindFunction('%', ['dividend', 'divisor'], Mod);
  env.bindFunction('=', ['a', 'b'], Equals);
  env.bindFunction('PRINT', ['arg'], Print);
}
