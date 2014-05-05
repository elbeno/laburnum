/*jslint browser:true, debug:true, devel:true, indent:2, plusplus:true, vars:true */
/*global Datum, globalEnv*/

//------------------------------------------------------------------------------
function make(env, name) {
  'use strict';
  var n = env.lookupVariable1('name');

  if (!n.isWord() || n.isNumeric() || n.isBoolean()) {
    throw { message: name + " doesn't like " + n.toString() + ' as input' };
  }

  var v = env.lookupVariable1('value');
  env.assignVariable(n.value, v);
}

//------------------------------------------------------------------------------
function localInternal(env, name, defEnv) {
  'use strict';
  var n = env.lookupVariable1('name');

  var args = [];
  if (n.isList()) {
    args = n.values;
  } else {
    args = [n];
  }
  var rest = env.lookupVariable1('rest');
  if (rest !== undefined) {
    args = args.concat(rest.values);
  }

  args.map(function (n) {
    if (!n.isWord() || n.isNumeric() || n.isBoolean()) {
      throw { message: name + " doesn't like " + n.toString() + ' as input' };
    }
    defEnv.bindVariable(n.value, new Datum());
  });
}

//------------------------------------------------------------------------------
function local(env, name) {
  'use strict';
  localInternal(env, name, env);
}

//------------------------------------------------------------------------------
function localMake(env) {
  'use strict';
  var n = env.lookupVariable1('name');

  if (!n.isWord() || n.isNumeric() || n.isBoolean()) {
    throw { message: "localmake doesn't like " + n.toString() + ' as input' };
  }

  var v = env.lookupVariable1('value');
  env.bindVariable(n.value, v);
}

//------------------------------------------------------------------------------
function thing(env) {
  'use strict';
  var n = env.lookupVariable1('name');
  var e = env.lookupVariable(n.value);
  if (e === undefined || e.type === undefined) {
    throw { message: n.toString() + ' has no value' };
  }
  return e;
}

//------------------------------------------------------------------------------
function global(env, name) {
  'use strict';
  localInternal(env, name, globalEnv);
}

//------------------------------------------------------------------------------
function installBuiltins_Variables(env) {
  'use strict';

  env.bindFunction('make',
                   { requiredArgs: ['name', 'value'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 2, maxArgs: 2, minArgs: 2 },
                   make, '');
  env.bindFunction('name',
                   { requiredArgs: ['value', 'name'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 2, maxArgs: 2, minArgs: 2 },
                   make, '');
  env.bindFunction('local',
                   { requiredArgs: ['name'], optionalArgs: [], restArg: 'rest',
                     defaultArgs: 1, maxArgs: -1, minArgs: 1 },
                   local, '');
  env.bindFunction('localmake',
                   { requiredArgs: ['name', 'value'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 2, maxArgs: 2, minArgs: 2 },
                   localMake, '');
  env.bindFunction('thing',
                   { requiredArgs: ['name'], optionalArgs: [], restArg: 'rest',
                     defaultArgs: 1, maxArgs: -1, minArgs: 1 },
                   thing, '');
  env.bindFunction('global',
                   { requiredArgs: ['name'], optionalArgs: [], restArg: 'rest',
                     defaultArgs: 1, maxArgs: -1, minArgs: 1 },
                   global, '');
}

installBuiltins_Variables(globalEnv);
