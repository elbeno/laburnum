//------------------------------------------------------------------------------
var WordP = function(env) {
  var a = env.lookupVariable1('a');
  return new Word(a.isWord().toString());
};

//------------------------------------------------------------------------------
var ListP = function(env) {
  var a = env.lookupVariable1('a');
  return new Word(a.isList().toString());
};

//------------------------------------------------------------------------------
var ArrayP = function(env) {
  var a = env.lookupVariable1('a');
  return new Word(a.isArray().toString());
};

//------------------------------------------------------------------------------
var EmptyP = function(env) {
  var a = env.lookupVariable1('a');
  var empty = a.value == '' || (a.isArray() && a.value == '{}');
  return new Word(empty.toString());
};

//------------------------------------------------------------------------------
var EqualPInternal = function(a, b) {
  if (a.type != b.type) {
    return false;
  }

  if (a.isNumeric() || a.isBoolean()) {
    return a.jvalue == b.jvalue;
  }
  else if (a.isWord()) {
    // TODO: CASEIGNOREDP
    return a.value == b.value;
  }
  else if (a.isList()) {
    for (var i = 0; i < a.values.length; ++i) {
      if (i >= b.values.length || !EqualPInternal(a.values[i], b.values[i])) {
        return false;
      }
    }
    return true;
  }
  else if (a.isArray()) {
    // TODO: array references
    return false;
  }

  return false;
}

var EqualP = function(env) {
  var a = env.lookupVariable1('a');
  var b = env.lookupVariable1('b');

  return new Word(EqualPInternal(a, b).toString());
};

var NotEqualP = function(env) {
  var a = env.lookupVariable1('a');
  var b = env.lookupVariable1('b');

  return new Word((!EqualPInternal(a, b)).toString());
};

//------------------------------------------------------------------------------
var BeforeP = function(env, name) {
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
var MemberP = function(env, name) {
  var a = env.lookupVariable1('a');
  var b = env.lookupVariable1('b');

  if (b.isWord()) {
    if (a.isWord()
        && a.value.length == 1) {
      // TODO: CASEIGNOREDP
      var re = new RegExp(a.value);
      return new Word(re.test(b.value).toString());
    }
    return new Word('false');
  }
  else {
    for (var i = 0; i < b.values.length; ++i) {
      if (EqualPInternal(a, b.values[i])) {
        return new Word('true');
      }
    }
  }

  return new Word('false');
};

//------------------------------------------------------------------------------
var SubstringP = function(env, name) {
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
var NumberP = function(env) {
  var a = env.lookupVariable1('a');
  return new Word(a.isNumeric().toString());
};

//------------------------------------------------------------------------------
function InstallBuiltins_Predicates(env) {

  env.bindFunction('wordp',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   WordP, '');
  env.bindFunction('word?',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   WordP, '');
  env.bindFunction('listp',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   ListP, '');
  env.bindFunction('list?',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   ListP, '');
  env.bindFunction('arrayp',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   ArrayP, '');
  env.bindFunction('array?',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   ArrayP, '');
  env.bindFunction('emptyp',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   EmptyP, '');
  env.bindFunction('empty?',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   EmptyP, '');
  env.bindFunction('equalp',
                   { requiredArgs:['a', 'b'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   EqualP, '');
  env.bindFunction('equal?',
                   { requiredArgs:['a', 'b'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   EqualP, '');
  env.bindFunction('notequalp',
                   { requiredArgs:['a', 'b'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   NotEqualP, '');
  env.bindFunction('notequal?',
                   { requiredArgs:['a', 'b'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   NotEqualP, '');
  env.bindFunction('beforep',
                   { requiredArgs:['a', 'b'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   BeforeP, '');
  env.bindFunction('before?',
                   { requiredArgs:['a', 'b'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   BeforeP, '');
  env.bindFunction('memberp',
                   { requiredArgs:['a', 'b'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   MemberP, '');
  env.bindFunction('member?',
                   { requiredArgs:['a', 'b'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   MemberP, '');
  env.bindFunction('substringp',
                   { requiredArgs:['a', 'b'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   SubstringP, '');
  env.bindFunction('substring?',
                   { requiredArgs:['a', 'b'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   SubstringP, '');
  env.bindFunction('numberp',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   NumberP, '');
  env.bindFunction('number?',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   NumberP, '');

  // TODO: .eq
  // TODO: vbarredp, vbarred?
  // TODO: backslashedp. backslashed? (library functions)
}

InstallBuiltins_Predicates(globalEnv);
