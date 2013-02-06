//------------------------------------------------------------------------------
function UnaryMinus(env) {
  var v = env.lookupVariable('arg');
  if (v.value == undefined) {
    throw 'Unary -: invalid argument type.';
  }
  return new Numeric(-v.value);
}

//------------------------------------------------------------------------------
function Add(env) {
  var a = env.lookupVariable('augend');
  if (a.value == undefined) {
    throw '+: invalid argument type (augend).';
  }

  var b = env.lookupVariable('addend');
  if (b.value == undefined) {
    throw '+: invalid argument type (addend).';
  }

  return new Numeric(a.value + b.value);
}

//------------------------------------------------------------------------------
function Sub(env) {
  var a = env.lookupVariable('minuend');
  if (a.value == undefined) {
    throw '-: invalid argument type (minuend).';
  }

  var b = env.lookupVariable('subtrahend');
  if (b.value == undefined) {
    throw '-: invalid argument type (subtrahend).';
  }

  return new Numeric(a.value - b.value);
}

//------------------------------------------------------------------------------
function Mul(env) {
  var a = env.lookupVariable('multiplier');
  if (a.value == undefined) {
    throw '*: invalid argument type (multiplier).';
  }

  var b = env.lookupVariable('multiplicand');
  if (b.value == undefined) {
    throw '*: invalid argument type (multiplicand).';
  }

  return new Numeric(a.value * b.value);
}

//------------------------------------------------------------------------------
function Div(env) {
  var a = env.lookupVariable('dividend');
  if (a.value == undefined) {
    throw '/: invalid argument type (dividend).';
  }

  var b = env.lookupVariable('divisor');
  if (b.value == undefined) {
    throw '/: invalid argument type (divisor).';
  }

  return new Numeric(a.value / b.value);
}

//------------------------------------------------------------------------------
function Print(env) {
  var a = env.lookupVariable('arg');

  var repl = $('#repl');
  var s = a.toString();
  repl.val(repl.val() + '\n' + s);
  return new Numeric(s.length);
}

//------------------------------------------------------------------------------
function InstallBuiltins(env) {
  env.bindFunction('~', ['arg'], UnaryMinus);
  env.bindFunction('+', ['augend', 'addend'], Add);
  env.bindFunction('-', ['minuend', 'subtrahend'], Sub);
  env.bindFunction('*', ['multiplier', 'multiplicand'], Mul);
  env.bindFunction('/', ['dividend', 'divisor'], Div);
  env.bindFunction('PRINT', ['arg'], Print);
}
