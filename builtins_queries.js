/*jslint browser:true, debug:true, devel:true, indent:2, plusplus:true, vars:true */
/*global Word, List, globalEnv, equalPInternal*/

//------------------------------------------------------------------------------
function count(env) {
  'use strict';
  var a = env.lookupVariable1('a');
  if (a.isWord()) {
    return new Word(a.value.length);
  }
  return new Word(a.values.length);
}

//------------------------------------------------------------------------------
function ascii(env) {
  'use strict';
  var a = env.lookupVariable1('a');
  if (!a.isWord() || a.value.length > 1) {
    throw "ascii doesn't like " + a.toString() + ' as input';
  }
  return new Word(a.value.charCodeAt(0));
}

//------------------------------------------------------------------------------
function char(env) {
  'use strict';
  var a = env.lookupVariable1('a');
  if (!a.isNumeric() || a.jvalue < 0 || a.jvalue > 255) {
    throw "ascii doesn't like " + a.toString() + ' as input';
  }
  return new Word(String.fromCharCode(a.jvalue));
}

//------------------------------------------------------------------------------
function member(env) {
  'use strict';
  var i;
  var a = env.lookupVariable1('a');
  var b = env.lookupVariable1('b');

  if (b.isWord()) {
    if (a.isWord()
        && a.value.length === 1) {
      // TODO: CASEIGNOREDP
      var re = new RegExp(a.value + '.*');
      var result = b.value.match(re);
      if (!result) {
        return new Word('');
      }
      return new Word(result[0]);
    }
    return new Word('');
  }
  if (b.isList()) {
    for (i = 0; i < b.values.length; ++i) {
      if (equalPInternal(a, b.values[i])) {
        return new List(b.values.slice(i));
      }
    }
    return new List([]);
  }

  throw "member doesn't like " + b.toString() + ' as input';
}

//------------------------------------------------------------------------------
function lowerCase(env) {
  'use strict';
  var a = env.lookupVariable1('a');
  if (!a.isWord()) {
    throw "lowercase doesn't like " + a.toString() + ' as input';
  }
  return new Word(a.value.toLowerCase());
}

//------------------------------------------------------------------------------
function upperCase(env) {
  'use strict';
  var a = env.lookupVariable1('a');
  if (!a.isWord()) {
    throw "uppercase doesn't like " + a.toString() + ' as input';
  }
  return new Word(a.value.toUpperCase());
}

//------------------------------------------------------------------------------
function installBuiltins_Queries(env) {
  'use strict';

  // Queries
  env.bindFunction('count',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   count, '');
  env.bindFunction('ascii',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   ascii, '');
  env.bindFunction('char',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   char, '');
  env.bindFunction('member',
                   { requiredArgs: ['a', 'b'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 2, maxArgs: 2, minArgs: 2 },
                   member, '');
  env.bindFunction('lowercase',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   lowerCase, '');
  env.bindFunction('uppercase',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   upperCase, '');
  // TODO: rawascii
  // TODO: standout, parse, runparse
}

installBuiltins_Queries(globalEnv);
