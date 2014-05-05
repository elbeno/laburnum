/*jslint browser:true, debug:true, devel:true, indent:2, plusplus:true, vars:true */
/*global Word, globalEnv*/

//------------------------------------------------------------------------------
var wordP = function (env) {
  'use strict';
  var a = env.lookupVariable1('a');
  return new Word(a.isWord().toString());
};

//------------------------------------------------------------------------------
var listP = function (env) {
  'use strict';
  var a = env.lookupVariable1('a');
  return new Word(a.isList().toString());
};

//------------------------------------------------------------------------------
var arrayP = function (env) {
  'use strict';
  var a = env.lookupVariable1('a');
  return new Word(a.isArray().toString());
};

//------------------------------------------------------------------------------
var emptyP = function (env) {
  'use strict';
  var a = env.lookupVariable1('a');
  var empty = a.value === '' || (a.isArray() && a.value === '{}');
  return new Word(empty.toString());
};

//------------------------------------------------------------------------------
var equalPInternal = function (a, b) {
  'use strict';
  var i;

  if (a.type !== b.type) {
    return false;
  }

  if (a.isNumeric() || a.isBoolean()) {
    return a.jvalue === b.jvalue;
  }
  if (a.isWord()) {
    // TODO: CASEIGNOREDP
    return a.value === b.value;
  }
  if (a.isList()) {
    for (i = 0; i < a.values.length; ++i) {
      if (i >= b.values.length || !equalPInternal(a.values[i], b.values[i])) {
        return false;
      }
    }
    return true;
  }
  if (a.isArray()) {
    // TODO: array references
    return false;
  }

  return false;
};

var equalP = function (env) {
  'use strict';
  var a = env.lookupVariable1('a');
  var b = env.lookupVariable1('b');

  return new Word(equalPInternal(a, b).toString());
};

var notEqualP = function (env) {
  'use strict';
  var a = env.lookupVariable1('a');
  var b = env.lookupVariable1('b');

  return new Word((!equalPInternal(a, b)).toString());
};

//------------------------------------------------------------------------------
var beforeP = function (env, name) {
  'use strict';
  var a = env.lookupVariable1('a');
  if (!a.isWord()) {
    throw { message: name + " doesn't like " + a.toString + ' as input' };
  }
  var b = env.lookupVariable1('b');
  if (!b.isWord()) {
    throw { message: name + " doesn't like " + b.toString + ' as input' };
  }

  return new Word(a.value < b.value);
};

//------------------------------------------------------------------------------
var memberP = function (env, name) {
  'use strict';
  var i;
  var a = env.lookupVariable1('a');
  var b = env.lookupVariable1('b');

  if (b.isWord()) {
    if (a.isWord()
        && a.value.length === 1) {
      // TODO: CASEIGNOREDP
      var re = new RegExp(a.value);
      return new Word(re.test(b.value).toString());
    }
    return new Word('false');
  }
  for (i = 0; i < b.values.length; ++i) {
    if (equalPInternal(a, b.values[i])) {
      return new Word('true');
    }
  }

  return new Word('false');
};

//------------------------------------------------------------------------------
var substringP = function (env, name) {
  'use strict';
  var a = env.lookupVariable1('a');
  var b = env.lookupVariable1('b');

  if (!a.isWord() || !b.isWord()) {
    return new Word('false');
  }

  // TODO: CASEIGNOREDP
  var re = new RegExp(a.value);
  return new Word(re.test(b.value).toString());
};

//------------------------------------------------------------------------------
var numberP = function(env) {
  'use strict';
  var a = env.lookupVariable1('a');
  return new Word(a.isNumeric().toString());
};

//------------------------------------------------------------------------------
function installBuiltins_Predicates(env) {
  'use strict';

  env.bindFunction('wordp',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   wordP, '');
  env.bindFunction('word?',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   wordP, '');
  env.bindFunction('listp',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   listP, '');
  env.bindFunction('list?',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   listP, '');
  env.bindFunction('arrayp',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   arrayP, '');
  env.bindFunction('array?',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   arrayP, '');
  env.bindFunction('emptyp',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   emptyP, '');
  env.bindFunction('empty?',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   emptyP, '');
  env.bindFunction('equalp',
                   { requiredArgs: ['a', 'b'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 2, maxArgs: 2, minArgs: 2 },
                   equalP, '');
  env.bindFunction('equal?',
                   { requiredArgs: ['a', 'b'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 2, maxArgs: 2, minArgs: 2 },
                   equalP, '');
  env.bindFunction('notequalp',
                   { requiredArgs: ['a', 'b'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 2, maxArgs: 2, minArgs: 2 },
                   notEqualP, '');
  env.bindFunction('notequal?',
                   { requiredArgs: ['a', 'b'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 2, maxArgs: 2, minArgs: 2 },
                   notEqualP, '');
  env.bindFunction('beforep',
                   { requiredArgs: ['a', 'b'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 2, maxArgs: 2, minArgs: 2 },
                   beforeP, '');
  env.bindFunction('before?',
                   { requiredArgs: ['a', 'b'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 2, maxArgs: 2, minArgs: 2 },
                   beforeP, '');
  env.bindFunction('memberp',
                   { requiredArgs: ['a', 'b'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 2, maxArgs: 2, minArgs: 2 },
                   memberP, '');
  env.bindFunction('member?',
                   { requiredArgs: ['a', 'b'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 2, maxArgs: 2, minArgs: 2 },
                   memberP, '');
  env.bindFunction('substringp',
                   { requiredArgs: ['a', 'b'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 2, maxArgs: 2, minArgs: 2 },
                   substringP, '');
  env.bindFunction('substring?',
                   { requiredArgs: ['a', 'b'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 2, maxArgs: 2, minArgs: 2 },
                   substringP, '');
  env.bindFunction('numberp',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   numberP, '');
  env.bindFunction('number?',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   numberP, '');

  // TODO: .eq
  // TODO: vbarredp, vbarred?
  // TODO: backslashedp. backslashed? (library functions)
}

installBuiltins_Predicates(globalEnv);
