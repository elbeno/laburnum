//------------------------------------------------------------------------------
function Reducer(env, f, init) {
  var a = env.lookupVariable1('a');
  var b = env.lookupVariable1('b');

  var args = [a, b];
  var rest = env.lookupVariable1('[rest]');
  if (rest != undefined) {
    args = args.concat(rest.values);
  }

  return new Word(args.reduce(f, init));
}


//------------------------------------------------------------------------------
// Constructors
//------------------------------------------------------------------------------
var BuildWord = function(env) {
  return Reducer(env, function(a, b) {
    if (b.isList()) {
      throw { message: "word doesn't like " + b.toString() + ' as input' };
    }
    return a + b.value;
  }, '');
};

//------------------------------------------------------------------------------
function BuildList(env) {
  var a = env.lookupVariable1('a');
  var b = env.lookupVariable1('b');

  var datums = [a, b];
  var rest = env.lookupVariable1('[rest]');
  if (rest != undefined) {
    rest.values.map(function(x) { datums.push(x); });
  }

  return new List(datums);
}

//------------------------------------------------------------------------------
function Sentence(env) {
  var a = env.lookupVariable1('a');
  var b = env.lookupVariable1('b');

  var args = [a, b];
  var rest = env.lookupVariable1('[rest]');
  if (rest != undefined) {
    args = args.concat(rest.values);
  }

  var datums = [];
  args.map(function(x) {
    if (x.isList()) {
      x.values.map(function(x) { datums.push(x); });
    }
    else {
      datums.push(x);
    }
  });

  return new List(datums);
}

//------------------------------------------------------------------------------
function FPut(env) {
  var car = env.lookupVariable1('car');
  var cdr = env.lookupVariable1('cdr');

  // if the second arg is a word, the first arg must be a word of one letter
  if (cdr.isWord()) {
    if (car.isList() || car.value.length > 1) {
      throw { message: "fput doesn't like " + cdr.toString() + ' as input' };
    }

    return new Word(car.value + cdr.value);
  }

  return new List([car].concat(cdr.values));
}

//------------------------------------------------------------------------------
function LPut(env) {
  var car = env.lookupVariable1('car');
  var cdr = env.lookupVariable1('cdr');

  // if the second arg is a word, the first arg must be a word of one letter
  if (cdr.isWord()) {
    if (car.isList() || car.value.length > 1) {
      throw { message: "lput doesn't like " + cdr.toString() + ' as input' };
    }

    return new Word(cdr.value + car.value);
  }

  return new List(cdr.values.concat([car]));
}

//------------------------------------------------------------------------------
function MakeArray(env) {
  var size = env.lookupVariable1('size');
  if (!size.isNumeric()) {
    throw { message: "array doesn't like " + size.toString() + ' as input' };
  }

  var origin = 0;
  var rest = env.lookupVariable1('[rest]');
  if (rest != undefined) {
    if (!rest.values[0].isNumeric()) {
      throw { message: "array doesn't like " + rest.values[0].toString() + ' as input' };
    }
    origin = rest.values[0].jvalue;
  }

  var datums = [];
  for (var i = 0; i < size.jvalue; ++i) {
    datums.push(new List([]));
  }
  return new LArray(datums, origin);
}

//------------------------------------------------------------------------------
function ListToArray(env) {
  var list = env.lookupVariable1('list');
  if (!list.isList()) {
    throw { message: "listtoarray doesn't like " + list.toString() + ' as input' };
  }

  var origin = 0;
  var rest = env.lookupVariable1('[rest]');
  if (rest != undefined) {
    if (!rest.values[0].isNumeric()) {
      throw { message: "listtoarray doesn't like " + rest.values[0].toString() + ' as input' };
    }
    origin = rest.values[0].jvalue;
  }

  return new LArray(list.values, origin);
}

//------------------------------------------------------------------------------
function ArrayToList(env) {
  var array = env.lookupVariable1('array');
  if (!array.isArray()) {
    throw { message: "arraytolist doesn't like " + array.toString() + ' as input' };
  }

  return new List(array.values);
}

//------------------------------------------------------------------------------
function Combine(env) {
  var b = env.lookupVariable1('b');

  if (b.isList()) {
    return FPut(env);
  }
  return BuildWord(env);
}

//------------------------------------------------------------------------------
function Reverse(env) {
  var a = env.lookupVariable1('a');

  if (a.isList()) {
    return new List(a.values.reverse());
  }
  return new Word(a.value.split('').reverse().join(''));
}

//------------------------------------------------------------------------------
var gensymIndex = 0;

function Gensym(env) {
  return new Word('g' + ++gensymIndex);
}

//------------------------------------------------------------------------------
// Selectors
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
// Mutators
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
// Predicates
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
// Transmitters
//------------------------------------------------------------------------------
function Print(env) {
  Type(env);
  var repl = $('#repl');
  repl.val(repl.val() + '\n');
}

//------------------------------------------------------------------------------
function Type(env) {
  var a = env.lookupVariable1('arg');

  var args = [a];
  var rest = env.lookupVariable1('[rest]');
  if (rest != undefined) {
    args = args.concat(rest.values);
  }

  var s = args.map(function(x) { return x.value; }).join(' ');

  var repl = $('#repl');
  repl.val(repl.val() + s);
}

//------------------------------------------------------------------------------
function Show(env) {
  var a = env.lookupVariable1('arg');

  var args = [a];
  var rest = env.lookupVariable1('[rest]');
  if (rest != undefined) {
    args = args.concat(rest.values);
  }

  var s = args.map(function(x) { return x.toString(); }).join(' ');

  var repl = $('#repl');
  repl.val(repl.val() + s + '\n');
}

//------------------------------------------------------------------------------
// Queries
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
// Variable definition
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
  var rest = env.lookupVariable1('[rest]');
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
function Printout(env, name) {
  var n = env.lookupVariable1('name');
  if (n.isArray()) {
    throw { message: name + " doesn't like " + n.toString() + ' as input' };
  }

  var f = env.lookupFunction(n.toString());
  var repl = $('#repl');
  if (f.src === undefined) {
    throw { message: "I don't know how to " + n.toString() };
  }
  else if (f.src != '') {
    repl.val(repl.val() + f.src + '\n');
  }
  else {
    repl.val(repl.val() + name + ' is a primitive\n');
  }
}

//------------------------------------------------------------------------------
function Erase(env) {
  var n = env.lookupVariable1('name');
  if (n.isArray()) {
    throw { message: "erase doesn't like " + n.toString() + ' as input' };
  }

  globalEnv.eraseFunction(n.toString());
}

//------------------------------------------------------------------------------
// Control structures
//------------------------------------------------------------------------------
function Run(env) {
  var instructionList = env.lookupVariable1('r');
  if (instructionList.isArray()) {
    throw { message: "run doesn't like " + instructionList.toString() + ' as input' };
  }

  var terp = new Interpreter();
  return terp.interpret(instructionList.value, env);
}

//------------------------------------------------------------------------------
function RunResult(env) {
  var instructionList = env.lookupVariable1('r');
  if (instructionList.isArray()) {
    throw { message: "runresult doesn't like " + instructionList.toString() + ' as input' };
  }

  var terp = new Interpreter();
  var e = terp.interpret(instructionList.value, env);
  if (e === undefined) {
    return new List([]);
  }
  return new List([e]);
}

//------------------------------------------------------------------------------
function Repeat(env, name) {
  var n = env.lookupVariable1('n');
  if (!n.isNumeric()) {
    throw { message: name + " doesn't like " + n.toString() + ' as input' };
  }

  var instructionList = env.lookupVariable1('r');
  if (instructionList.isArray()) {
    throw { message: "repeat doesn't like " + instructionList.toString() + ' as input' };
  }

  var tokenizer = new Tokenizer();
  tokenizer.tokenize(instructionList.value);

  var terp = new Interpreter();
  var e = undefined;
  for (var i = 0; i < n; ++i) {
    env.bindFunction('repcount', [], function(env) { return new Word(i + 1); }, '');
    e = terp.run(tokenizer.tokenqueue.slice(0), env);
    if (e != undefined) {
      return e;
    }
  }

  return undefined;
}

//------------------------------------------------------------------------------
function Forever(env, name) {
  var instructionList = env.lookupVariable1('r');
  if (instructionList.isArray()) {
    throw { message: "forever doesn't like " + instructionList.toString() + ' as input' };
  }

  var tokenizer = new Tokenizer();
  tokenizer.tokenize(instructionList.value);

  var terp = new Interpreter();
  var e = undefined;
  for (var i = 0; true; ++i) {
    env.bindFunction('repcount', [], function(env) { return new Word(i + 1); }, '');
    e = terp.run(tokenizer.tokenqueue.slice(0), env);
    if (e != undefined) {
      return e;
    }
  }

  return undefined;
}

//------------------------------------------------------------------------------
function If(env, name) {
  var cond  = env.lookupVariable1('cond');
  if (!cond.isBoolean()) {
    throw { message: name + " doesn't like " + cond.toString() + ' as input' };
  }

  var r = env.lookupVariable1('r');
  if (r.isArray()) {
    throw { message: name + " doesn't like " + r.toString() + ' as input' };
  }

  var terp = new Interpreter();
  if (cond.jvalue) {
    return terp.interpret(r.value, env);
  }

  var rest = env.lookupVariable1('[rest]');
  if (rest != undefined) {
    if (rest.values.length > 1) {
      throw { message: name + ' has too many inputs' };
    }
    if (rest.values[0].isArray()) {
      throw { message: name + " doesn't like " + rest.values[0].toString() + ' as input' };
    }
    return terp.interpret(rest.values[0].value, env);
  }

  return undefined;
}

//------------------------------------------------------------------------------
function IfElse(env, name) {
  var cond  = env.lookupVariable1('cond');
  if (!cond.isBoolean()) {
    throw { message: name + " doesn't like " + cond.toString() + ' as input' };
  }

  var r1 = env.lookupVariable1('r1');
  if (r1.isArray()) {
    throw { message: name + " doesn't like " + r1.toString() + ' as input' };
  }

  var terp = new Interpreter();
  if (cond.jvalue) {
    return terp.interpret(r1.value, env);
  }

  var r2 = env.lookupVariable1('r2');
  if (r2.isArray()) {
    throw { message: name + " doesn't like " + r2.toString() + ' as input' };
  }
  return terp.interpret(r2.value, env);
}

//------------------------------------------------------------------------------
function Stop(env, name) {
  throw { message: name + ' can only be used inside a procedure',
          stop: true };
}

//------------------------------------------------------------------------------
function Output(env, name) {
  var a = env.lookupVariable1('a');
  throw { message: name + ' can only be used inside a procedure',
          output: a };
}

//------------------------------------------------------------------------------
function Ignore(env) {
  return undefined;
}

//------------------------------------------------------------------------------
function For(env, name) {
  var control  = env.lookupVariable1('control');
  if (!control.isList() || control.values.length < 3 || control.values.length > 4) {
    throw { message: name + " doesn't like " + control.toString() + ' as input' };
  }

  var instructionList  = env.lookupVariable1('instlist');
  if (instructionList.isArray()) {
    throw { message: name + " doesn't like " + instructionList.toString() + ' as input' };
  }

  var ctrlVar = control.values[0];
  if (!ctrlVar.isWord()) {
    throw { message: name + " doesn't like " + ctrlVar.toString() + ' as input' };
  }

  var terp = new Interpreter();

  var startVal = terp.interpret(control.values[1].value, env);
  if (!startVal.isNumeric()) {
    throw { message: name + " doesn't like " + startVal.toString() + ' as input' };
  }

  var endVal = terp.interpret(control.values[2].value, env);
  if (!endVal.isNumeric()) {
    throw { message: name + " doesn't like " + endVal.toString() + ' as input' };
  }

  var step = startVal.jvalue > endVal.jvalue ? -1 : 1;
  if (control.values.length > 3) {
    var stepVal = terp.interpret(control.values[3].value, env);
    if (!stepVal.isNumeric()) {
      throw { message: name + " doesn't like " + stepVal.toString() + ' as input' };
    }
    step = stepVal.jvalue;
  }

  var tokenizer = new Tokenizer();
  tokenizer.tokenize(instructionList.value);

  var e = undefined;
  for (var i = startVal.jvalue;
       (step > 0 && i <= endVal.jvalue) || (step < 0 && i >= endVal.jvalue);
       i = i + step) {
    env.bindVariable(ctrlVar.value, new Word(i));
    e = terp.run(tokenizer.tokenqueue.slice(0), env);
    if (e != undefined) {
      return e;
    }
  }
  return undefined;
}

//------------------------------------------------------------------------------
function While(env, name) {
  var cond  = env.lookupVariable1('cond');
  if (cond.isArray()) {
    throw { message: name + " doesn't like " + cond.toString() + ' as input' };
  }

  var r = env.lookupVariable1('r');
  if (r.isArray()) {
    throw { message: name + " doesn't like " + r.toString() + ' as input' };
  }

  var tokenizer = new Tokenizer();
  tokenizer.tokenize(cond.value);
  var condexpr = tokenizer.tokenqueue.slice(0);
  tokenizer.tokenize(r.value);
  var instlist = tokenizer.tokenqueue.slice(0);

  var terp = new Interpreter();
  var c = undefined;
  var e = undefined;

  while (true) {
    c = terp.run(condexpr.slice(0), env);
    if (!c.isBoolean()) {
      throw { message: name + " doesn't like " + c.toString() + ' as input' };
    }
    if (!c.jvalue) {
      return undefined;
    }
    e = terp.run(instlist.slice(0), env);
    if (e != undefined) {
      return e;
    }
  }
}

//------------------------------------------------------------------------------
function DoWhile(env) {
  var cond  = env.lookupVariable1('cond');
  if (cond.isArray()) {
    throw { message: name + " doesn't like " + cond.toString() + ' as input' };
  }

  var r = env.lookupVariable1('r');
  if (r.isArray()) {
    throw { message: name + " doesn't like " + r.toString() + ' as input' };
  }

  var tokenizer = new Tokenizer();
  tokenizer.tokenize(cond.value);
  var condexpr = tokenizer.tokenqueue.slice(0);
  tokenizer.tokenize(r.value);
  var instlist = tokenizer.tokenqueue.slice(0);

  var terp = new Interpreter();
  var c = undefined;
  var e = undefined;

  while (true) {
    e = terp.run(instlist.slice(0), env);
    if (e != undefined) {
      return e;
    }
    c = terp.run(condexpr.slice(0), env);
    if (!c.isBoolean()) {
      throw { message: name + " doesn't like " + c.toString() + ' as input' };
    }
    if (!c.jvalue) {
      return undefined;
    }
  }
}

//------------------------------------------------------------------------------
function Until(env) {
  var cond  = env.lookupVariable1('cond');
  if (cond.isArray()) {
    throw { message: name + " doesn't like " + cond.toString() + ' as input' };
  }

  var r = env.lookupVariable1('r');
  if (r.isArray()) {
    throw { message: name + " doesn't like " + r.toString() + ' as input' };
  }

  var tokenizer = new Tokenizer();
  tokenizer.tokenize(cond.value);
  var condexpr = tokenizer.tokenqueue.slice(0);
  tokenizer.tokenize(r.value);
  var instlist = tokenizer.tokenqueue.slice(0);

  var terp = new Interpreter();
  var c = undefined;
  var e = undefined;

  while (true) {
    c = terp.run(condexpr.slice(0), env);
    if (!c.isBoolean()) {
      throw { message: name + " doesn't like " + c.toString() + ' as input' };
    }
    if (c.jvalue) {
      return undefined;
    }
    e = terp.run(instlist.slice(0), env);
    if (e != undefined) {
      return e;
    }
  }
}

//------------------------------------------------------------------------------
function DoUntil(env) {
  var cond  = env.lookupVariable1('cond');
  if (cond.isArray()) {
    throw { message: name + " doesn't like " + cond.toString() + ' as input' };
  }

  var r = env.lookupVariable1('r');
  if (r.isArray()) {
    throw { message: name + " doesn't like " + r.toString() + ' as input' };
  }

  var tokenizer = new Tokenizer();
  tokenizer.tokenize(cond.value);
  var condexpr = tokenizer.tokenqueue.slice(0);
  tokenizer.tokenize(r.value);
  var instlist = tokenizer.tokenqueue.slice(0);

  var terp = new Interpreter();
  var c = undefined;
  var e = undefined;

  while (true) {
    e = terp.run(instlist.slice(0), env);
    if (e != undefined) {
      return e;
    }
    c = terp.run(condexpr.slice(0), env);
    if (!c.isBoolean()) {
      throw { message: name + " doesn't like " + c.toString() + ' as input' };
    }
    if (c.jvalue) {
      return undefined;
    }
  }
}

//------------------------------------------------------------------------------
var Sum = function(env) {
  return Reducer(env, function(a, b) {
    if (b == undefined) {
      return a;
    }
    if (b.type != 'numeric') {
      throw { message: "sum doesn't like " + b.toString() + ' as input' };
    }
    return a + b.jvalue;
  }, 0);
};

//------------------------------------------------------------------------------
var Difference = function(env) {
  var a  = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "difference doesn't like " + a.toString() + ' as input' };
  }
  var b  = env.lookupVariable1('b');
  if (!b.isNumeric()) {
    throw { message: "difference doesn't like " + b.toString() + ' as input' };
  }
  return new Word(a.jvalue - b.jvalue);
};

//------------------------------------------------------------------------------
var Minus = function(env) {
  var a  = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "minus doesn't like " + a.toString() + ' as input' };
  }
  return new Word(-a.jvalue);
};

//------------------------------------------------------------------------------
var Product = function(env) {
  return Reducer(env, function(a, b) {
    if (b == undefined) {
      return a;
    }
    if (b.type != 'numeric') {
      throw { message: "product doesn't like " + b.toString() + ' as input' };
    }
    return a * b.jvalue;
  }, 1);
};

//------------------------------------------------------------------------------
var Quotient = function(env) {

  var rest = env.lookupVariable1('[rest]');
  if (rest != undefined) {
    throw { message: 'quotient has too many inputs' };
  }

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "quotient doesn't like " + a.toString() + ' as input' };
  }

  var b = env.lookupVariable1('b');
  if (b != undefined) {
    if (!b.isNumeric()) {
      throw { message: "quotient doesn't like " + b.toString() + ' as input' };
    }
    return new Word(a.jvalue / b.jvalue)
  }
  else {
    return new Word(1 / a.jvalue);
  }
};

//------------------------------------------------------------------------------
var Mod = function(env, name, signmatch) {

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: name + " doesn't like " + a.toString() + ' as input' };
  }

  var b = env.lookupVariable1('b');
  if (!b.isNumeric()) {
    throw { message: name +" doesn't like " + b.toString() + ' as input' };
  }

  var c = a.jvalue % b.jvalue;

  if (signmatch == 'b' && a.jvalue * b.jvalue < 0)
  {
    return new Word(b.jvalue + c);
  }
  return new Word(c);
};

//------------------------------------------------------------------------------
var Remainder = function(env) {
  return Mod(env, 'remainder', 'a');
}

//------------------------------------------------------------------------------
var Modulo = function(env) {
  return Mod(env, 'modulo', 'b');
}

//------------------------------------------------------------------------------
var Int = function(env) {

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "int doesn't like " + a.toString() + ' as input' };
  }

  return new Word(0|a.jvalue);
};

//------------------------------------------------------------------------------
var Round = function(env) {

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "round doesn't like " + a.toString() + ' as input' };
  }

  return new Word(Math.round(a.jvalue));
};

//------------------------------------------------------------------------------
var Sqrt = function(env) {

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "round doesn't like " + a.toString() + ' as input' };
  }

  return new Word(Math.sqrt(a.jvalue));
};

//------------------------------------------------------------------------------
var Power = function(env) {
  var a  = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "power doesn't like " + a.toString() + ' as input' };
  }
  var b  = env.lookupVariable1('b');
  if (!b.isNumeric()) {
    throw { message: "power doesn't like " + b.toString() + ' as input' };
  }
  return new Word(Math.pow(a.jvalue, b.jvalue));
};

//------------------------------------------------------------------------------
var Exp = function(env) {

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "exp doesn't like " + a.toString() + ' as input' };
  }

  return new Word(Math.exp(a.jvalue));
};

//------------------------------------------------------------------------------
var Log10 = function(env) {

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "log10 doesn't like " + a.toString() + ' as input' };
  }

  return new Word(Math.log(a.jvalue) / Math.log(10));
};

//------------------------------------------------------------------------------
var Ln = function(env) {

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "ln doesn't like " + a.toString() + ' as input' };
  }

  return new Word(Math.log(a.jvalue));
};

//------------------------------------------------------------------------------
var Sin = function(env) {

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "sin doesn't like " + a.toString() + ' as input' };
  }

  return new Word(Math.sin(a.jvalue * Math.PI / 180));
};

//------------------------------------------------------------------------------
var Radsin = function(env) {

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "radsin doesn't like " + a.toString() + ' as input' };
  }

  return new Word(Math.sin(a.jvalue));
};

//------------------------------------------------------------------------------
var Cos = function(env) {

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "cos doesn't like " + a.toString() + ' as input' };
  }

  return new Word(Math.cos(a.jvalue * Math.PI / 180));
};

//------------------------------------------------------------------------------
var Radcos = function(env) {

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "radcos doesn't like " + a.toString() + ' as input' };
  }

  return new Word(Math.cos(a.jvalue));
};

//------------------------------------------------------------------------------
var Radarctan = function(env) {

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "arctan doesn't like " + a.toString() + ' as input' };
  }

  var rest = env.lookupVariable1('[rest]');
  if (rest != undefined) {
    if (rest.values.length > 1) {
      throw { message: 'radarctan has too many inputs' };
    }
    if (!rest.values[0].isNumeric()) {
      throw { message: "radarctan doesn't like " + rest.values[0].toString() + ' as input' };
    }

    if (a.jvalue == 0) {
      if (rest.values[0].jvalue > 0) {
        return new Word(Math.PI/2);
      }
      else if (rest.values[0].jvalue < 0) {
        return new Word(-Math.PI/2);
      }
      return new Word('0');
    }
    return new Word(Math.atan(rest.values[0].jvalue / a.jvalue));
  }
  else {
    return new Word(Math.atan(a.jvalue));
  }
};

//------------------------------------------------------------------------------
var Arctan = function(env) {
  var ret = Radarctan(env);
  return new Word(ret.jvalue / Math.PI * 180);
};

//------------------------------------------------------------------------------
function InstallBuiltins(env) {
  // Constructors
  env.bindFunction('word', ['a', 'b'], BuildWord, '');
  env.bindFunction('list', ['a', 'b'], BuildList, '');
  env.bindFunction('sentence', ['a', 'b'], Sentence, '');
  env.bindFunction('se', ['a', 'b'], Sentence, '');
  env.bindFunction('fput', ['car', 'cdr'], FPut, '');
  env.bindFunction('lput', ['car', 'cdr'], LPut, '');
  env.bindFunction('array', ['size'], MakeArray, '');
  // TODO: mdarray library function
  env.bindFunction('listtoarray', ['list'], ListToArray, '');
  env.bindFunction('arraytolist', ['array'], ArrayToList, '');
  // TODO: the next 3 should be library functions
  env.bindFunction('combine', ['a', 'b'], Combine, '');
  env.bindFunction('reverse', ['a'], Reverse, '');
  env.bindFunction('gensym', [], Gensym, '');

  // Selectors
  env.bindFunction('first', ['a'], First, '');
  env.bindFunction('firsts', ['a'], Firsts, '');
  env.bindFunction('last', ['a'], Last, '');
  env.bindFunction('butfirst', ['a'], ButFirst, '');
  env.bindFunction('bf', ['a'], ButFirst, '');
  env.bindFunction('butfirsts', ['a'], ButFirsts, '');
  env.bindFunction('bfs', ['a'], ButFirsts, '');
  env.bindFunction('butlast', ['a'], ButLast, '');
  env.bindFunction('bl', ['a'], ButLast, '');
  env.bindFunction('item', ['i', 'a'], Item, '');
  // TODO: mditem, pick, remove, remdup, quoted (library functions)

  // Mutators
  env.bindFunction('setitem', ['i', 'a', 'v'], SetItem, '');
  // TODO: mdsetitem library function
  // TODO: .setfirst, .setbf, .setitem
  // TODO: push, pop, queue, dequeue (library functions)

  // Predicates
  env.bindFunction('wordp', ['a'], WordP, '');
  env.bindFunction('word?', ['a'], WordP, '');
  env.bindFunction('listp', ['a'], ListP, '');
  env.bindFunction('list?', ['a'], ListP, '');
  env.bindFunction('arrayp', ['a'], ArrayP, '');
  env.bindFunction('array?', ['a'], ArrayP, '');
  env.bindFunction('emptyp', ['a'], EmptyP, '');
  env.bindFunction('empty?', ['a'], EmptyP, '');
  env.bindFunction('equalp', ['a', 'b'], EqualP, '');
  env.bindFunction('equal?', ['a', 'b'], EqualP, '');
  env.bindFunction('=', ['a', 'b'], EqualP, '');
  env.bindFunction('notequalp', ['a', 'b'], NotEqualP, '');
  env.bindFunction('notequal?', ['a', 'b'], NotEqualP, '');
  env.bindFunction('<>', ['a', 'b'], NotEqualP, '');
  env.bindFunction('beforep', ['a', 'b'], BeforeP, '');
  env.bindFunction('before?', ['a', 'b'], BeforeP, '');
  // TODO: .eq
  env.bindFunction('memberp', ['a', 'b'], MemberP, '');
  env.bindFunction('member?', ['a', 'b'], MemberP, '');
  env.bindFunction('substringp', ['a', 'b'], SubstringP, '');
  env.bindFunction('substring?', ['a', 'b'], SubstringP, '');
  env.bindFunction('numberp', ['a'], NumberP, '');
  env.bindFunction('number?', ['a'], NumberP, '');
  // TODO: vbarredp, vbarred?
  // TODO: backslashedp. backslashed? (library functions)

  // Queries
  env.bindFunction('count', ['a'], Count, '');
  env.bindFunction('ascii', ['a'], Ascii, '');
  // TODO: rawascii
  env.bindFunction('char', ['a'], Char, '');
  env.bindFunction('member', ['a', 'b'], Member, '');
  env.bindFunction('lowercase', ['a'], LowerCase, '');
  env.bindFunction('uppercase', ['a'], UpperCase, '');
  // TODO: standout, parse, runparse

  // Transmitters
  env.bindFunction('print', ['arg'], Print, '');
  env.bindFunction('pr', ['arg'], Print, '');
  env.bindFunction('type', ['arg'], Type, '');
  env.bindFunction('show', ['arg'], Show, '');

  // Receivers
  // TODO: readlist, rl
  // TODO: readword, rw
  // TODO: readrawline
  // TODO: readchar, rc
  // TODO: readchars, rcs
  // TODO: shell

  // File access
  // TODO: setprefix, prefix
  // TODO: openread, openwrite, openappend, openupdate, close
  // TODO: allopen, closeall
  // TODO: erasefile, erf
  // TODO: dribble, nodriblle
  // TODO: setread, setwrite
  // TODO: reader, writer
  // TODO: setreadpos, setwritepos, readpos, writepos
  // TODO: eofp, eof?, filep, file?

  // Terminal access
  // TODO: keyp, key?
  // TODO: cleartext, ct
  // TODO: setcursor, cursor
  // TODO: setmargins
  // TODO: settextcolor, settc
  // TODO: increasefont, decreasefont
  // TODO: settextsize, textsize
  // TODO: setfont, font

  // Arithmetic operations
  env.bindFunction('sum', ['a', 'b'], Sum, '');
  env.bindFunction('difference', ['a', 'b'], Difference, '');
  env.bindFunction('minus', ['a'], Minus, '');
  env.bindFunction('product', ['a', 'b'], Product, '');
  env.bindFunction('quotient', ['a', 'b'], Quotient, '');
  env.bindFunction('remainder', ['a', 'b'], Remainder, '');
  env.bindFunction('modulo', ['a', 'b'], Modulo, '');
  env.bindFunction('int', ['a'], Int, '');
  env.bindFunction('round', ['a'], Round, '');
  env.bindFunction('sqrt', ['a'], Sqrt, '');
  env.bindFunction('power', ['a', 'b'], Power, '');
  env.bindFunction('exp', ['a'], Exp, '');
  env.bindFunction('log10', ['a'], Log10, '');
  env.bindFunction('ln', ['a'], Ln, '');
  env.bindFunction('sin', ['a'], Sin, '');
  env.bindFunction('radsin', ['a'], Radsin, '');
  env.bindFunction('cos', ['a'], Cos, '');
  env.bindFunction('radcos', ['a'], Radcos, '');
  env.bindFunction('arctan', ['a'], Arctan, '');
  env.bindFunction('radarctan', ['a'], Radarctan, '');
  // TODO: rseq library function
  // TODO: iseq library function

  // Arithmetic predicates
  // TODO: lessp, less?
  // TODO: greaterp, greater?
  // TODO: lessequalp, lessequal?
  // TODO: greaterequalp, greaterequal?

  // Random numbers
  // TODO: random, rerandom

  // Print formatting
  // TODO: form

  // Bitwise operations
  // TODO: bitand, bitor, bitxor, bitnot
  // TODO: ashift, lshift

  // Logical operations
  // TODO: and, or, not

  // Variable definition
  env.bindFunction('make', ['name', 'value'], Make, '');
  env.bindFunction('name', ['value', 'name'], Make, '');
  env.bindFunction('local', ['name'], Local, '');
  env.bindFunction('localmake', ['name', 'value'], LocalMake, '');
  env.bindFunction('thing', ['name'], Thing, '');
  env.bindFunction('global', ['name'], Global, '');

  // Control structures
  env.bindFunction('run', ['r'], Run, '');
  env.bindFunction('runresult', ['r'], RunResult, '');
  env.bindFunction('repeat', ['n','r'], Repeat, '');
  env.bindFunction('forever', ['r'], Forever, '');
  env.bindFunction('if', ['cond','r'], If, '');
  env.bindFunction('ifelse', ['cond','r1','r2'], IfElse, '');
  env.bindFunction('output', ['a'], Output, '');
  env.bindFunction('op', ['a'], Output, '');
  env.bindFunction('stop', [], Stop, '');
  env.bindFunction('ignore', ['e'], Ignore, '');
  env.bindFunction('for', ['control', 'instlist'], For, '');
  env.bindFunction('while', ['cond', 'r'], While, '');
  env.bindFunction('do.while', ['r', 'cond'], DoWhile, '');
  env.bindFunction('until', ['cond', 'r'], Until, '');
  env.bindFunction('do.until', ['r', 'cond'], DoUntil, '');

  env.bindFunction('printout', ['name'], Printout, '');
  env.bindFunction('po', ['name'], Printout, '');

  env.bindFunction('erase', ['name'], Erase, '');



}

InstallBuiltins(globalEnv);
