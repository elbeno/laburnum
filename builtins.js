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
function First(env) {
  var a = env.lookupVariable('a');
  if (a.isWord()) {
    return new Word(a.value[0]);
  }
  else if (a.isList()) {
    if (a.values.length == 0) {
      throw { message: "first doesn't like " + a.toString() + ' as input' };
    }
    return a.values[0];
  }
  else {
    return new Word(a.origin);
  }
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

  return undefined;
}

//------------------------------------------------------------------------------
function Make(env) {
  var n = env.lookupVariable('name');
  var v = env.lookupVariable('value');

  globalEnv.bindVariable(n.value, v);

  return undefined;
}

//------------------------------------------------------------------------------
function Printout(env) {
  var n = env.lookupVariable('name');
  if (n.type == 'array') {
    throw { message: "printout doesn't like " + n.toString() + ' as input' };
  }

  var f = env.lookupFunction(n.toString());
  var repl = $('#repl');
  if (f.src === undefined) {
    throw { message: "I don't know how to " + n.toString() };
  }
  else {
    repl.val(repl.val() + f.src + '\n');
  }
  return undefined;
}

//------------------------------------------------------------------------------
function Erase(env) {
  var n = env.lookupVariable('name');
  if (n.type == 'array') {
    throw { message: "erase doesn't like " + n.toString() + ' as input' };
  }

  globalEnv.eraseFunction(n.toString());
  return undefined;
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
  env.bindFunction('word', ['a', 'b'], BuildWord, 'word is a primitive');
  env.bindFunction('list', ['a', 'b'], BuildList, 'list is a primitive');
  env.bindFunction('sentence', ['a', 'b'], Sentence, 'sentence is a primitive');
  env.bindFunction('se', ['a', 'b'], Sentence, 'se is a primitive');
  env.bindFunction('fput', ['car', 'cdr'], FPut, 'fput is a primitive');
  env.bindFunction('lput', ['car', 'cdr'], LPut, 'lput is a primitive');
  env.bindFunction('array', ['size'], MakeArray, 'array is a primitive');
  //env.bindFunction('mdarray', ['sizelist'], MDArray, 'mdarray is a primitive');
  env.bindFunction('listtoarray', ['list'], ListToArray, 'listtoarray is a primitive');
  env.bindFunction('arraytolist', ['array'], ArrayToList, 'arraytolist is a primitive');
  env.bindFunction('combine', ['a', 'b'], Combine, 'combine is a primitive');
  env.bindFunction('reverse', ['a'], Reverse, 'reverse is a primitive');
  env.bindFunction('gensym', [], Gensym, 'gensym is a primitive');

  // Selectors
  env.bindFunction('first', ['a'], First, 'first is a primitive');

  env.bindFunction('print', ['arg'], Print, 'print is a primitive');
  env.bindFunction('make', ['name', 'value'], Make, 'make is a primitive');
  env.bindFunction('printout', ['name'], Printout, 'printout is a primitive');
  env.bindFunction('po', ['name'], Printout, 'po is a primitive');
  env.bindFunction('erase', ['name'], Erase, 'erase is a primitive');
  env.bindFunction('sum', ['a', 'b'], Sum, 'sum is a primitive');
  env.bindFunction('product', ['a', 'b'], Product, 'product is a primitive');
}
