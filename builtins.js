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
    if (b.type == 'list') {
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
    if (x.type == 'list') {
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
  var car = env.lookupVariable('a');
  var cdr = env.lookupVariable('b');

  // if the second arg is a word, the first arg must be a word of one letter
  if (cdr.type == 'word') {
    if (car.type == 'list' || car.value.length > 1) {
      throw "fput doesn't like " + cdr.value + ' as input';
    }

    return new Word(car.value + cdr.value);
  }

  return new List([car].concat(cdr.values));
}

//------------------------------------------------------------------------------
function LPut(env) {
  var car = env.lookupVariable('a');
  var cdr = env.lookupVariable('b');

  // if the second arg is a word, the first arg must be a word of one letter
  if (cdr.type == 'word') {
    if (car.type == 'list' || car.value.length > 1) {
      throw "fput doesn't like " + cdr.value + ' as input';
    }

    return new Word(cdr.value + car.value);
  }

  return new List(cdr.values.concat([car]));
}

//------------------------------------------------------------------------------
function Combine(env) {
  var b = env.lookupVariable('b');

  if (b.type == 'list') {
    return FPut(env);
  }
  return BuildWord(env);
}

//------------------------------------------------------------------------------
function Reverse(env) {
  var a = env.lookupVariable('a');

  if (a.type == 'list') {
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
  env.bindFunction('combine', ['a', 'b'], Combine, 'combine is a primitive');
  env.bindFunction('reverse', ['a'], Reverse, 'reverse is a primitive');
  env.bindFunction('gensym', [], Gensym, 'gensym is a primitive');


  env.bindFunction('print', ['arg'], Print, 'print is a primitive');
  env.bindFunction('make', ['name', 'value'], Make, 'make is a primitive');
  env.bindFunction('printout', ['name'], Printout, 'printout is a primitive');
  env.bindFunction('po', ['name'], Printout, 'po is a primitive');
  env.bindFunction('erase', ['name'], Erase, 'erase is a primitive');
  env.bindFunction('sum', ['a', 'b'], Sum, 'sum is a primitive');
  env.bindFunction('product', ['a', 'b'], Product, 'product is a primitive');
}
