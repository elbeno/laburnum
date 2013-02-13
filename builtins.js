//------------------------------------------------------------------------------
function Print(env) {
  var a = env.lookupVariable('arg');
  var s = a.value;

  var rest = env.lookupVariable('[rest]');
  if (rest != undefined) {
    s = s + ' ' + rest.values.map(function(x) { return x.value; }).join(' ');
  }

  var repl = $('#repl');
  repl.val(repl.val() + s + '\n');

  return undefined;
}

//------------------------------------------------------------------------------
function BuildWord(env) {
  var a = env.lookupVariable('a');
  var b = env.lookupVariable('b');

  var s = a.value + b.value;

  var rest = env.lookupVariable('[rest]');
  if (rest != undefined) {
    s = s + rest.values.map(function(x) {
      if (x.type == 'list') {
        throw "word doesn't like " + x.toString() + ' as input';
      }
      return x.value; }).join();
  }

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

  var datums = [];
  if (a.type == 'list') {
    a.values.map(function(x) { datums.push(x); });
  }
  else {
    datums.push(a);
  }

  if (b.type == 'list') {
    b.values.map(function(x) { datums.push(x); });
  }
  else {
    datums.push(b);
  }

  var rest = env.lookupVariable('[rest]');
  if (rest != undefined) {
    rest.values.map(function(x) {
      if (x.type == 'list') {
        x.values.map(function(x) { datums.push(x); });
      }
      else {
        datums.push(x);
      }
    });
  }

  return new List(datums);
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
}
