/*jslint browser:true, debug:true, devel:true, indent:2, plusplus:true, vars:true */
/*global Word, List, globalEnv*/

//------------------------------------------------------------------------------
function firstInternal(a, name) {
  'use strict';
  if (a.isWord()) {
    if (a.value.length === 0) {
      throw { message: name + " doesn't like " + a.toString() + ' as input' };
    }
    return new Word(a.value[0]);
  }
  if (a.isList()) {
    if (a.values.length === 0) {
      throw { message: name + " doesn't like " + a.toString() + ' as input' };
    }
    return a.values[0];
  }
  return new Word(a.origin);
}

//------------------------------------------------------------------------------
function first(env) {
  'use strict';
  var a = env.lookupVariable1('a');
  return firstInternal(a, 'first');
}

//------------------------------------------------------------------------------
function firsts(env) {
  'use strict';
  var a = env.lookupVariable1('a');
  if (!a.isList()) {
    throw { message: "firsts doesn't like " + a.toString() + ' as input' };
  }

  var datums = a.values.map(function (x) {
    return firstInternal(x, 'firsts');
  });

  return new List(datums);
}

//------------------------------------------------------------------------------
function last(env) {
  'use strict';
  var a = env.lookupVariable1('a');
  if (a.isWord() && a.value.length > 0) {
    return new Word(a.value[a.value.length - 1]);
  }
  if (a.isList() && a.values.length !== 0) {
    return a.values[a.values.length - 1];
  }
  throw { message: "last doesn't like " + a.toString() + ' as input' };
}

//------------------------------------------------------------------------------
function butFirstInternal(a, name) {
  'use strict';
  if (a.isWord()) {
    if (a.value.length === 0) {
      throw { message: name + " doesn't like " + a.toString() + ' as input' };
    }
    return new Word(a.value.substring(1));
  }
  if (a.isList()) {
    if (a.values.length === 0) {
      throw { message: name + " doesn't like " + a.toString() + ' as input' };
    }
    return new List(a.values.slice(1));
  }
  throw { message: name + " doesn't like " + a.toString() + ' as input' };
}

//------------------------------------------------------------------------------
function butFirst(env, name) {
  'use strict';
  var a = env.lookupVariable1('a');
  return butFirstInternal(a, name);
}

//------------------------------------------------------------------------------
function butFirsts(env, name) {
  'use strict';
  var a = env.lookupVariable1('a');
  if (!a.isList()) {
    throw { message: name + " doesn't like " + a.toString() + ' as input' };
  }

  var datums = a.values.map(function (x) {
    return butFirstInternal(x, name);
  });

  return new List(datums);
}

//------------------------------------------------------------------------------
function butLast(env, name) {
  'use strict';
  var a = env.lookupVariable1('a');
  if (a.isWord() && a.value.length > 0) {
    return new Word(a.value.substring(0, a.value.length - 1));
  }
  if (a.isList() && a.values.length !== 0) {
    return new List(a.values.slice(0, a.values.length - 1));
  }
  throw { message: name + " doesn't like " + a.toString() + ' as input' };
}

//------------------------------------------------------------------------------
function item(env) {
  'use strict';
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
  if (a.isList()) {
    if (idx >= 0 && a.values.length > idx) {
      return a.values[idx];
    }
    throw { message: "item doesn't like " + i.toString() + ' as input' };
  }
  if (a.isArray()) {
    // Arrays have an arbitrary base, so use the actual index value.
    return a.atIndex(i.jvalue, { message: "item doesn't like " + i.toString() + ' as input' });
  }

  throw { message: "item doesn't like " + a.toString() + ' as input' };
}

//------------------------------------------------------------------------------
function installBuiltins_Selectors(env) {
  'use strict';

  env.bindFunction('first',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   first, '');
  env.bindFunction('firsts',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   firsts, '');
  env.bindFunction('last',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   last, '');
  env.bindFunction('butfirst',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   butFirst, '');
  env.bindFunction('bf',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   butFirst, '');
  env.bindFunction('butfirsts',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   butFirsts, '');
  env.bindFunction('bfs',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   butFirsts, '');
  env.bindFunction('butlast',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   butLast, '');
  env.bindFunction('bl',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   butLast, '');
  env.bindFunction('item',
                   { requiredArgs: ['i', 'a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 2, maxArgs: 2, minArgs: 2 },
                   item, '');
  // TODO: mditem, pick, remove, remdup, quoted (library functions)
}

installBuiltins_Selectors(globalEnv);
