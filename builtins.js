/*jslint browser:true, debug:true, devel:true, indent:2, plusplus:true, vars:true */
/*global $, globalEnv*/

//------------------------------------------------------------------------------
// Transmitters
//------------------------------------------------------------------------------
function transmitInternal(env, stdout, fn) {
  'use strict';
  var a = env.lookupVariable1('arg');

  var args = [a];
  var rest = env.lookupVariable1('rest');
  if (rest !== undefined) {
    args = args.concat(rest.values);
  }

  var s = args.map(fn).join(' ');

  if (stdout === undefined) {
    stdout = env.lookupVariable('stdout');
  }
  stdout.write(s);
}

//------------------------------------------------------------------------------
/*jslint unparam: true*/
function type(env, name, stdout) {
  'use strict';
  transmitInternal(env, stdout, function (x) { return x.value; });
}

//------------------------------------------------------------------------------
function show(env, name, stdout) {
  'use strict';
  transmitInternal(env, stdout, function (x) { return x.toString(); });
}
/*jslint unparam: false*/

//------------------------------------------------------------------------------
function print(env, name) {
  'use strict';
  var stdout = env.lookupVariable('stdout');
  type(env, name, stdout);
  stdout.write('\n');
}

//------------------------------------------------------------------------------
// Inspection
//------------------------------------------------------------------------------
function printout(env, name) {
  'use strict';
  var n = env.lookupVariable1('name');
  if (n.isArray()) {
    throw { message: name + " doesn't like " + n.toString() + ' as input' };
  }

  var f = env.lookupFunction(n.toString());
  var repl = $('#repl');
  if (f.src === undefined) {
    throw { message: "I don't know how to " + n.toString() };
  }
  if (f.src !== '') {
    repl.val(repl.val() + f.src + '\n');
  } else {
    repl.val(repl.val() + n.toString() + ' is a primitive\n');
  }
}

//------------------------------------------------------------------------------
// Workspace control
//------------------------------------------------------------------------------
function erase(env) {
  'use strict';
  var n = env.lookupVariable1('name');
  if (n.isArray()) {
    throw { message: "erase doesn't like " + n.toString() + ' as input' };
  }

  globalEnv.eraseFunction(n.toString());
}

//------------------------------------------------------------------------------
function installBuiltins(env) {
  'use strict';

  // Transmitters
  env.bindFunction('print',
                   { requiredArgs: ['arg'], optionalArgs: [], restArg: 'rest',
                     defaultArgs: 1, maxArgs: -1, minArgs: 1 },
                   print, '');
  env.bindFunction('pr',
                   { requiredArgs: ['arg'], optionalArgs: [], restArg: 'rest',
                     defaultArgs: 1, maxArgs: -1, minArgs: 1 },
                   print, '');
  env.bindFunction('type',
                   { requiredArgs: ['arg'], optionalArgs: [], restArg: 'rest',
                     defaultArgs: 1, maxArgs: -1, minArgs: 1 },
                   type, '');
  env.bindFunction('show',
                   { requiredArgs: ['arg'], optionalArgs: [], restArg: 'rest',
                     defaultArgs: 1, maxArgs: -1, minArgs: 1 },
                   show, '');

  // Inspection
  env.bindFunction('printout',
                   { requiredArgs: ['name'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   printout, '');
  env.bindFunction('po',
                   { requiredArgs: ['name'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   printout, '');

  // Workspace control
  env.bindFunction('erase',
                   { requiredArgs: ['name'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   erase, '');
}

installBuiltins(globalEnv);
