//------------------------------------------------------------------------------
function Reducer(env, f, init) {
  var args = env.lookupVariable1('rest').values;
  if (args == undefined) {
    args = [];
  }

  return new Word(args.reduce(f, init));
}

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
  var datums = [];
  var rest = env.lookupVariable1('rest');
  rest.values.map(function(x) { datums.push(x); });

  return new List(datums);
}

//------------------------------------------------------------------------------
function Sentence(env) {
  var rest = env.lookupVariable1('rest');
  var datums = [];

  rest.values.map(function(x) {
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

  var origin = env.lookupVariable1('origin');
  if (origin != undefined) {
    if (!origin.isNumeric()) {
      throw { message: "array doesn't like " + origin.toString() + ' as input' };
    }
    origin = origin.jvalue;
  }
  else {
    origin = 0;
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

  var origin = env.lookupVariable1('origin');
  if (origin != undefined) {
    if (!origin.isNumeric()) {
      throw { message: "listtoarray doesn't like " + origin.toString() + ' as input' };
    }
    origin = origin.jvalue;
  }
  else {
    origin = 0;
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
function InstallBuiltins_Constructors(env) {

  env.bindFunction('word',
                   { requiredArgs:[], optionalArgs:[], restArg:'rest',
                     defaultArgs:2, maxArgs:-1, minArgs:1 },
                   BuildWord, '');
  env.bindFunction('list',
                   { requiredArgs:[], optionalArgs:[], restArg:'rest',
                     defaultArgs:2, maxArgs:-1, minArgs:1 },
                   BuildList, '');
  env.bindFunction('sentence',
                   { requiredArgs:[], optionalArgs:[], restArg:'rest',
                     defaultArgs:2, maxArgs:-1, minArgs:1 },
                   Sentence, '');
  env.bindFunction('se',
                   { requiredArgs:[], optionalArgs:[], restArg:'rest',
                     defaultArgs:2, maxArgs:-1, minArgs:1 },
                   Sentence, '');
  env.bindFunction('fput',
                   { requiredArgs:['car', 'cdr'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   FPut, '');
  env.bindFunction('lput',
                   { requiredArgs:['car', 'cdr'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   LPut, '');
  env.bindFunction('array',
                   { requiredArgs:['size'], optionalArgs:[{name:'origin'}], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   MakeArray, '');

  // TODO: mdarray library function

  env.bindFunction('listtoarray',
                   { requiredArgs:['list'], optionalArgs:[{name:'origin'}], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   ListToArray, '');
  env.bindFunction('arraytolist',
                   { requiredArgs:['array'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   ArrayToList, '');

  // TODO: the next 3 should be library functions

  env.bindFunction('combine',
                   { requiredArgs:['a', 'b'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   Combine, '');
  env.bindFunction('reverse',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Reverse, '');
  env.bindFunction('gensym',
                   { requiredArgs:[], optionalArgs:[], restArg:undefined,
                     defaultArgs:0, maxArgs:0, minArgs:0 },
                   Gensym, '');
}

InstallBuiltins_Constructors(globalEnv);
