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
function BuildWord(env) {
  var a = env.lookupVariable('a');
  var b = env.lookupVariable('b');

  var args = [a, b];
  var rest = env.lookupVariable('[rest]');
  if (rest != undefined) {
    args = args.concat(rest.values);
  }

  var s = args.map(function(x) {
    if (x.type == 'list') {
      throw "word doesn't like " + x.toString() + ' as input';
    }
    return x.value; }).join('');

  return new Word(s);
}

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
  var car = env.lookupVariable('car');
  var cdr = env.lookupVariable('cdr');

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
function Make(env) {
  var n = env.lookupVariable('name');
  var v = env.lookupVariable('value');

  globalEnv.bindVariable(n.value, v);

  return undefined;
}

//------------------------------------------------------------------------------
function InstallBuiltins(env) {
  env.bindFunction('print', ['arg'], Print);
  env.bindFunction('make', ['name', 'value'], Make);
  env.bindFunction('word', ['a', 'b'], BuildWord);
  env.bindFunction('list', ['a', 'b'], BuildList);
  env.bindFunction('sentence', ['a', 'b'], Sentence);
  env.bindFunction('se', ['a', 'b'], Sentence);
  env.bindFunction('fput', ['car', 'cdr'], FPut);
}
