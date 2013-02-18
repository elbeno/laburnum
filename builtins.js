//------------------------------------------------------------------------------
function Reducer(env, f, init) {
  var a = env.lookupVariable('a');
  var b = env.lookupVariable('b');

  var args = [a, b];
  var rest = env.lookupVariable('[rest]');
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
  var a = env.lookupVariable('a');
  var b = env.lookupVariable('b');

  var datums = [a, b];
  var rest = env.lookupVariable('[rest]');
  if (rest != undefined) {
    rest.values.map(function(x) { datums.push(x); });
  }

  return new List(datums);
}

//------------------------------------------------------------------------------
function Sentence(env) {
  var a = env.lookupVariable('a');
  var b = env.lookupVariable('b');

  var args = [a, b];
  var rest = env.lookupVariable('[rest]');
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
  var car = env.lookupVariable('car');
  var cdr = env.lookupVariable('cdr');

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
  var car = env.lookupVariable('car');
  var cdr = env.lookupVariable('cdr');

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
  var size = env.lookupVariable('size');
  if (!size.isNumeric()) {
    throw { message: "array doesn't like " + size.toString() + 'as input' };
  }

  var origin = 0;
  var rest = env.lookupVariable('[rest]');
  if (rest != undefined) {
    if (!rest.values[0].isNumeric()) {
      throw { message: "array doesn't like " + rest.values[0].toString() + 'as input' };
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
  var list = env.lookupVariable('list');
  if (!list.isList()) {
    throw { message: "listtoarray doesn't like " + list.toString() + 'as input' };
  }

  var origin = 0;
  var rest = env.lookupVariable('[rest]');
  if (rest != undefined) {
    if (!rest.values[0].isNumeric()) {
      throw { message: "listtoarray doesn't like " + rest.values[0].toString() + 'as input' };
    }
    origin = rest.values[0].jvalue;
  }

  return new LArray(list.values, origin);
}

//------------------------------------------------------------------------------
function ArrayToList(env) {
  var array = env.lookupVariable('array');
  if (!array.isArray()) {
    throw { message: "arraytolist doesn't like " + array.toString() + 'as input' };
  }

  return new List(array.values);
}

//------------------------------------------------------------------------------
function Combine(env) {
  var b = env.lookupVariable('b');

  if (b.isList()) {
    return FPut(env);
  }
  return BuildWord(env);
}

//------------------------------------------------------------------------------
function Reverse(env) {
  var a = env.lookupVariable('a');

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
  var a = env.lookupVariable('a');
  return FirstInternal(a, 'first');
}

//------------------------------------------------------------------------------
function Firsts(env) {
  var a = env.lookupVariable('a');
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
  var a = env.lookupVariable('a');
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
  var a = env.lookupVariable('a');
  return ButFirstInternal(a, name);
}

//------------------------------------------------------------------------------
function ButFirsts(env, name) {
  var a = env.lookupVariable('a');
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
  var a = env.lookupVariable('a');
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
  var i = env.lookupVariable('i');
  if (!i.isNumeric()) {
    throw { message: "item doesn't like " + i.toString() + ' as input' };
  }

  var a = env.lookupVariable('a');

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
function SetItem(env) {
  var i = env.lookupVariable('i');
  if (!i.isNumeric()) {
    throw { message: "setitem doesn't like " + i.toString() + ' as input' };
  }

  var a = env.lookupVariable('a');
  if (!a.isArray()) {
    throw { message: "setitem doesn't like " + a.toString() + ' as input' };
  }

  var v = env.lookupVariable('v');

  // TODO: check for circular refs

  a.values[a.computeIndex(i.jvalue,
                          { message: "setitem doesn't like " + i.toString() + ' as input' })] = v;
  a.value = a.toString();
}

//------------------------------------------------------------------------------
function Print(env) {
  var a = env.lookupVariable('arg');

  var args = [a];
  var rest = env.lookupVariable('[rest]');
  if (rest != undefined) {
    args = args.concat(rest.values);
  }

  var s = args.map(function(x) { return x.value; }).join(' ');

  var repl = $('#repl');
  repl.val(repl.val() + s + '\n');
}

//------------------------------------------------------------------------------
function Make(env) {
  var n = env.lookupVariable('name');
  var v = env.lookupVariable('value');

  globalEnv.bindVariable(n.value, v);
}

//------------------------------------------------------------------------------
function Printout(env, name) {
  var n = env.lookupVariable('name');
  if (n.type == 'array') {
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
  var n = env.lookupVariable('name');
  if (n.type == 'array') {
    throw { message: "erase doesn't like " + n.toString() + ' as input' };
  }

  globalEnv.eraseFunction(n.toString());
}

//------------------------------------------------------------------------------
var Sum = function(env) {
  return Reducer(env, function(a, b) {
    if (b.type != 'numeric') {
      throw { message: "sum doesn't like " + b.toString() + ' as input' };
    }
    return a + b.jvalue;
  }, 0);
};

//------------------------------------------------------------------------------
var Product = function(env) {
  return Reducer(env, function(a, b) {
    if (b.type != 'numeric') {
      throw { message: "product doesn't like " + b.toString() + ' as input' };
    }
    return a * b.jvalue;
  }, 1);
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

  env.bindFunction('print', ['arg'], Print, '');
  env.bindFunction('make', ['name', 'value'], Make, '');
  env.bindFunction('printout', ['name'], Printout, '');
  env.bindFunction('po', ['name'], Printout, '');
  env.bindFunction('erase', ['name'], Erase, '');
  env.bindFunction('sum', ['a', 'b'], Sum, '');
  env.bindFunction('product', ['a', 'b'], Product, '');
}
