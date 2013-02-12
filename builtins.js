//------------------------------------------------------------------------------
function Print(env) {
  var a = env.lookupVariable('arg');

  var repl = $('#repl');
  repl.val(repl.val() + a.value + '\n');
  return undefined;
}

//------------------------------------------------------------------------------
function Make(env) {
  var n = env.lookupVariable('name');
  var v = env.lookupVariable('value');

  globalEnv.bindVariable(n.value, v);
  return undefined;
}

//------------------------------------------------------------------------------
function InstallBuiltins(env) {
  env.bindFunction('print', ['arg'], Print);
  env.bindFunction('make', ['name', 'value'], Make);
}
