//------------------------------------------------------------------------------
function SetItem(env) {
  var i = env.lookupVariable1('i');
  if (!i.isNumeric()) {
    throw { message: "setitem doesn't like " + i.toString() + ' as input' };
  }

  var a = env.lookupVariable1('a');
  if (!a.isArray()) {
    throw { message: "setitem doesn't like " + a.toString() + ' as input' };
  }

  var v = env.lookupVariable1('v');

  // TODO: check for circular refs

  a.values[a.computeIndex(i.jvalue,
                          { message: "setitem doesn't like " + i.toString() + ' as input' })] = v;
  a.value = a.toString();
}

//------------------------------------------------------------------------------
function InstallBuiltins_Mutators(env) {

  env.bindFunction('setitem',
                   { requiredArgs:['i', 'a', 'v'], optionalArgs:[], restArg:undefined,
                     defaultArgs:3, maxArgs:3, minArgs:3 },
                   SetItem, '');
  // TODO: mdsetitem library function
  // TODO: .setfirst, .setbf, .setitem
  // TODO: push, pop, queue, dequeue (library functions)
}

InstallBuiltins_Mutators(globalEnv);
