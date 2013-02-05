//------------------------------------------------------------------------------
function UnaryMinus(a) {
  return new Number(-a.value);
}

//------------------------------------------------------------------------------
function Add(a, b) {
  return new Number(a.value + b.value);
}

//------------------------------------------------------------------------------
function Sub(a, b) {
  return new Number(a.value - b.value);
}

//------------------------------------------------------------------------------
function Mul(a, b) {
  return new Number(a.value * b.value);
}

//------------------------------------------------------------------------------
function Div(a, b) {
  return new Number(a.value / b.value);
}

//------------------------------------------------------------------------------
function InstallBuiltins(env) {
  env.bindFunction('~', 1, UnaryMinus);
  env.bindFunction('+', 2, Add);
  env.bindFunction('-', 2, Sub);
  env.bindFunction('*', 2, Mul);
  env.bindFunction('/', 2, Div);
}
