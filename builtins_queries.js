//------------------------------------------------------------------------------
function Count(env) {
  var a = env.lookupVariable1('a');
  if (a.isWord()) {
    return new Word(a.value.length);
  }
  else {
    return new Word(a.values.length);
  }
}

//------------------------------------------------------------------------------
function Ascii(env) {
  var a = env.lookupVariable1('a');
  if (!a.isWord() || a.value.length > 1) {
    throw "ascii doesn't like " + a.toString() + ' as input';
  }
  else {
    return new Word(a.value.charCodeAt(0));
  }
}

//------------------------------------------------------------------------------
function Char(env) {
  var a = env.lookupVariable1('a');
  if (!a.isNumeric() || a.jvalue < 0 || a.jvalue > 255) {
    throw "ascii doesn't like " + a.toString() + ' as input';
  }
  else {
    return new Word(String.fromCharCode(a.jvalue));
  }
}

//------------------------------------------------------------------------------
function Member(env) {
  var a = env.lookupVariable1('a');
  var b = env.lookupVariable1('b');

  if (b.isWord()) {
    if (a.isWord()
        && a.value.length == 1) {
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
  else if (b.isList()) {
    for (var i = 0; i < b.values.length; ++i) {
      if (EqualPInternal(a, b.values[i])) {
        return new List(b.values.slice(i));
      }
    }
    return new List([]);
  }

  throw "member doesn't like " + b.toString() + ' as input';
}

//------------------------------------------------------------------------------
function LowerCase(env) {
  var a = env.lookupVariable1('a');
  if (!a.isWord()) {
    throw "lowercase doesn't like " + a.toString() + ' as input';
  }
  else {
    return new Word(a.value.toLowerCase());
  }
}

//------------------------------------------------------------------------------
function UpperCase(env) {
  var a = env.lookupVariable1('a');
  if (!a.isWord()) {
    throw "uppercase doesn't like " + a.toString() + ' as input';
  }
  else {
    return new Word(a.value.toUpperCase());
  }
}

//------------------------------------------------------------------------------
function InstallBuiltins_Queries(env) {

  env.bindFunction('sum',
                   { requiredArgs:[], optionalArgs:[], restArg:'rest',
                     defaultArgs:2, maxArgs:-1, minArgs:1 },
                   Sum, '');

  // Queries
  env.bindFunction('count',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Count, '');
  env.bindFunction('ascii',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Ascii, '');
  env.bindFunction('char',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Char, '');
  env.bindFunction('member',
                   { requiredArgs:['a', 'b'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   Member, '');
  env.bindFunction('lowercase',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   LowerCase, '');
  env.bindFunction('uppercase',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   UpperCase, '');
  // TODO: rawascii
  // TODO: standout, parse, runparse
}

InstallBuiltins_Queries(globalEnv);
