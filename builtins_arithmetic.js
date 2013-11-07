//------------------------------------------------------------------------------
function Reducer(env, f, init) {
  var args = env.lookupVariable1('rest').values;
  if (args == undefined) {
    args = [];
  }

  return new Word(args.reduce(f, init));
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
var Atan = function(env, name) {

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: name + " doesn't like " + a.toString() + ' as input' };
  }

  var b = env.lookupVariable1('b');
  if (b != undefined) {
    if (!b.isNumeric()) {
      throw { message: name + " doesn't like " + b.toString() + ' as input' };
    }

    if (a.jvalue == 0) {
      if (b.jvalue > 0) {
        return new Word(Math.PI/2);
      }
      else if (b.jvalue < 0) {
        return new Word(-Math.PI/2);
      }
      return new Word('0');
    }
    return new Word(Math.atan(b.jvalue / a.jvalue));
  }
  else {
    return new Word(Math.atan(a.jvalue));
  }
};

//------------------------------------------------------------------------------
var Arctan = function(env) {
  var ret = Atan(env, 'arctan');
  return new Word(ret.jvalue / Math.PI * 180);
};

//------------------------------------------------------------------------------
var Radarctan = function(env) {
  return Atan(env, 'radarctan');
};

//------------------------------------------------------------------------------
function InstallBuiltins_Arithmetic(env) {

  env.bindFunction('sum',
                   { requiredArgs:[], optionalArgs:[], restArg:'rest',
                     defaultArgs:2, maxArgs:-1, minArgs:1 },
                   Sum, '');
  env.bindFunction('difference',
                   { requiredArgs:['a', 'b'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   Difference, '');
  env.bindFunction('minus',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Minus, '');
  env.bindFunction('product',
                   { requiredArgs:[], optionalArgs:[], restArg:'rest',
                     defaultArgs:2, maxArgs:-1, minArgs:1 },
                   Product, '');
  env.bindFunction('quotient',
                   { requiredArgs:['a'], optionalArgs:[{name:'b'}], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:1 },
                   Quotient, '');
  env.bindFunction('remainder',
                   { requiredArgs:['a', 'b'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   Remainder, '');
  env.bindFunction('modulo',
                   { requiredArgs:['a', 'b'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   Modulo, '');
  env.bindFunction('int',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Int, '');
  env.bindFunction('round',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Round, '');
  env.bindFunction('sqrt',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Sqrt, '');
  env.bindFunction('power',
                   { requiredArgs:['a', 'b'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   Power, '');
  env.bindFunction('exp',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Exp, '');
  env.bindFunction('log10',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Log10, '');
  env.bindFunction('ln',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Ln, '');
  env.bindFunction('sin',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Sin, '');
  env.bindFunction('radsin',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Radsin, '');
  env.bindFunction('cos',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Cos, '');
  env.bindFunction('radcos',
                   { requiredArgs:['a'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Radcos, '');
  env.bindFunction('arctan',
                   { requiredArgs:['a'], optionalArgs:[{name:'b'}], restArg:undefined,
                     defaultArgs:1, maxArgs:2, minArgs:1 },
                   Arctan, '');
  env.bindFunction('radarctan',
                   { requiredArgs:['a'], optionalArgs:[{name:'b'}], restArg:undefined,
                     defaultArgs:1, maxArgs:2, minArgs:1 },
                   Radarctan, '');
  // TODO: rseq library function
  // TODO: iseq library function

  // Arithmetic predicates
  // TODO: lessp, less?
  // TODO: greaterp, greater?
  // TODO: lessequalp, lessequal?
  // TODO: greaterequalp, greaterequal?
}

InstallBuiltins_Arithmetic(globalEnv);
