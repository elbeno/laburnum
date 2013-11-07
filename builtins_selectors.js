//------------------------------------------------------------------------------
function FirstInternal(a, name) {
  if (a.isWord()) {
    if (a.value.length == 0) {
      throw { message: name + " doesn't like " + a.toString() + ' as input' };
    }
    return new Word(a.value[0]);
  }
  else if (a.isList()) {
    if (a.values.length == 0) {
      throw { message: name + " doesn't like " + a.toString() + ' as input' };
    }
    return a.values[0];
  }
  else {
    return new Word(a.origin);
  }
}

//------------------------------------------------------------------------------
function First(env) {
  var a = env.lookupVariable1('a');
  return FirstInternal(a, 'first');
}

//------------------------------------------------------------------------------
function Firsts(env) {
  var a = env.lookupVariable1('a');
  if (!a.isList()) {
    throw { message: "firsts doesn't like " + a.toString() + ' as input' };
  }

  var datums = a.values.map(function(x) {
    return FirstInternal(x, 'firsts');
  });

  return new List(datums);
}

//------------------------------------------------------------------------------
function Last(env) {
  var a = env.lookupVariable1('a');
  if (a.isWord() && a.value.length > 0) {
    return new Word(a.value[a.value.length - 1]);
  }
  else if (a.isList() && a.values.length != 0) {
    return a.values[a.values.length - 1];
  }
  throw { message: "last doesn't like " + a.toString() + ' as input' };
}

//------------------------------------------------------------------------------
function ButFirstInternal(a, name) {
  if (a.isWord()) {
    if (a.value.length == 0) {
      throw { message: name + " doesn't like " + a.toString() + ' as input' };
    }
    return new Word(a.value.substring(1));
  }
  else if (a.isList()) {
    if (a.values.length == 0) {
      throw { message: name + " doesn't like " + a.toString() + ' as input' };
    }
    return new List(a.values.slice(1));
  }
  else {
    throw { message: name + " doesn't like " + a.toString() + ' as input' };
  }
}

//------------------------------------------------------------------------------
function ButFirst(env, name) {
  var a = env.lookupVariable1('a');
  return ButFirstInternal(a, name);
}

//------------------------------------------------------------------------------
function ButFirsts(env, name) {
  var a = env.lookupVariable1('a');
  if (!a.isList()) {
    throw { message: name + " doesn't like " + a.toString() + ' as input' };
  }

  var datums = a.values.map(function(x) {
    return ButFirstInternal(x, name);
  });

  return new List(datums);
}

//------------------------------------------------------------------------------
function ButLast(env, name) {
  var a = env.lookupVariable1('a');
  if (a.isWord() && a.value.length > 0) {
    return new Word(a.value.substring(0, a.value.length - 1));
  }
  else if (a.isList() && a.values.length != 0) {
    return new List(a.values.slice(0, a.values.length - 1));
  }
  throw { message: name + " doesn't like " + a.toString() + ' as input' };
}

//------------------------------------------------------------------------------
function Item(env) {
  var i = env.lookupVariable1('i');
  if (!i.isNumeric()) {
    throw { message: "item doesn't like " + i.toString() + ' as input' };
  }

  var a = env.lookupVariable1('a');

  // In Logo, data structures are 1-based.
  var idx = i.jvalue - 1;

  if (a.isWord()) {
    if (idx >= 0 && a.value.length > idx) {
      return new Word(a.value[idx]);
    }
    throw { message: "item doesn't like " + i.toString() + ' as input' };
  }
  else if (a.isList()) {
    if (idx >= 0 && a.values.length > idx) {
      return a.values[idx];
    }
    throw { message: "item doesn't like " + i.toString() + ' as input' };
  }
  else if (a.isArray()) {
    // Arrays have an arbitrary base, so use the actual index value.
    return a.atIndex(i.jvalue, { message: "item doesn't like " + i.toString() + ' as input' });
  }

  throw { message: "item doesn't like " + a.toString() + ' as input' };
}

//------------------------------------------------------------------------------
function InstallBuiltins_Selectors(env) {

  env.bindFunction('first',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   First, '');
  env.bindFunction('firsts',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Firsts, '');
  env.bindFunction('last',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Last, '');
  env.bindFunction('butfirst',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   ButFirst, '');
  env.bindFunction('bf',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   ButFirst, '');
  env.bindFunction('butfirsts',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   ButFirsts, '');
  env.bindFunction('bfs',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   ButFirsts, '');
  env.bindFunction('butlast',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   ButLast, '');
  env.bindFunction('bl',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   ButLast, '');
  env.bindFunction('item',
                   { requiredArgs:['i', 'a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   Item, '');
  // TODO: mditem, pick, remove, remdup, quoted (library functions)
}

InstallBuiltins_Selectors(globalEnv);
