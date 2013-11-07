//------------------------------------------------------------------------------
function Make(env, name) {
  var n = env.lookupVariable1('name');

  if (!n.isWord() || n.isNumeric() || n.isBoolean()) {
    throw { message: name + " doesn't like " + n.toString() + ' as input' };
  }

  var v = env.lookupVariable1('value');
  env.assignVariable(n.value, v);
}

//------------------------------------------------------------------------------
function LocalInternal(env, name, defEnv) {
  var n = env.lookupVariable1('name');

  var args = [];
  if (n.isList()) {
    args = n.values;
  } else {
    args = [n];
  }
  var rest = env.lookupVariable1('rest');
  if (rest != undefined) {
    args = args.concat(rest.values);
  }

  args.map(function(n) {
    if (!n.isWord() || n.isNumeric() || n.isBoolean()) {
      throw { message: name + " doesn't like " + n.toString() + ' as input' };
    }
    defEnv.bindVariable(n.value, new Datum());
  });
}

//------------------------------------------------------------------------------
function Local(env, name) {
  LocalInternal(env, name, env);
}

//------------------------------------------------------------------------------
function LocalMake(env) {
  var n = env.lookupVariable1('name');

  if (!n.isWord() || n.isNumeric() || n.isBoolean()) {
    throw { message: "localmake doesn't like " + n.toString() + ' as input' };
  }

  var v = env.lookupVariable1('value');
  env.bindVariable(n.value, v);
}

//------------------------------------------------------------------------------
function Thing(env) {
  var n = env.lookupVariable1('name');
  var e = env.lookupVariable(n.value);
  if (e === undefined || e.type === undefined) {
    throw { message: n.toString() + ' has no value' };
  }
  return e;
}

//------------------------------------------------------------------------------
function Global(env, name) {
  LocalInternal(env, name, globalEnv);
}

//------------------------------------------------------------------------------
function InstallBuiltins_Variables(env) {

  env.bindFunction('make',
                   { requiredArgs:['name', 'value'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   Make, '');
  env.bindFunction('name',
                   { requiredArgs:['value', 'name'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   Make, '');
  env.bindFunction('local',
                   { requiredArgs:['name'], optionalArgs:[], restArg:'rest',
                     defaultArgs:1, maxArgs:-1, minArgs:1 },
                   Local, '');
  env.bindFunction('localmake',
                   { requiredArgs:['name', 'value'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   LocalMake, '');
  env.bindFunction('thing',
                   { requiredArgs:['name'], optionalArgs:[], restArg:'rest',
                     defaultArgs:1, maxArgs:-1, minArgs:1 },
                   Thing, '');
  env.bindFunction('global',
                   { requiredArgs:['name'], optionalArgs:[], restArg:'rest',
                     defaultArgs:1, maxArgs:-1, minArgs:1 },
                   Global, '');
}

InstallBuiltins_Variables(globalEnv);
