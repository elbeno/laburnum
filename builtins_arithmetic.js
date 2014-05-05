/*jslint browser:true, debug:true, devel:true, indent:2, plusplus:true, todo:true, vars:true */
/*global Word, globalEnv*/

//------------------------------------------------------------------------------
function reducer(env, f, init) {
  'use strict';
  var args = env.lookupVariable1('rest').values;
  if (args === undefined) {
    args = [];
  }

  return new Word(args.reduce(f, init));
}

//------------------------------------------------------------------------------
var sum = function (env) {
  'use strict';
  return reducer(env, function (a, b) {
    if (b === undefined) {
      return a;
    }
    if (b.type !== 'numeric') {
      throw { message: "sum doesn't like " + b.toString() + ' as input' };
    }
    return a + b.jvalue;
  }, 0);
};

//------------------------------------------------------------------------------
var difference = function (env) {
  'use strict';
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
var minus = function (env) {
  'use strict';
  var a  = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "minus doesn't like " + a.toString() + ' as input' };
  }
  return new Word(-a.jvalue);
};

//------------------------------------------------------------------------------
var product = function (env) {
  'use strict';
  return reducer(env, function (a, b) {
    if (b === undefined) {
      return a;
    }
    if (b.type !== 'numeric') {
      throw { message: "product doesn't like " + b.toString() + ' as input' };
    }
    return a * b.jvalue;
  }, 1);
};

//------------------------------------------------------------------------------
var quotient = function (env) {
  'use strict';

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "quotient doesn't like " + a.toString() + ' as input' };
  }

  var b = env.lookupVariable1('b');
  if (b !== undefined) {
    if (!b.isNumeric()) {
      throw { message: "quotient doesn't like " + b.toString() + ' as input' };
    }
    return new Word(a.jvalue / b.jvalue);
  }
  return new Word(1 / a.jvalue);
};

//------------------------------------------------------------------------------
var mod = function (env, name, signmatch) {
  'use strict';

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: name + " doesn't like " + a.toString() + ' as input' };
  }

  var b = env.lookupVariable1('b');
  if (!b.isNumeric()) {
    throw { message: name + " doesn't like " + b.toString() + ' as input' };
  }

  var c = a.jvalue % b.jvalue;

  if (signmatch === 'b' && a.jvalue * b.jvalue < 0) {
    return new Word(b.jvalue + c);
  }
  return new Word(c);
};

//------------------------------------------------------------------------------
var remainder = function (env) {
  'use strict';
  return mod(env, 'remainder', 'a');
};

//------------------------------------------------------------------------------
var modulo = function (env) {
  'use strict';
  return mod(env, 'modulo', 'b');
};

//------------------------------------------------------------------------------
var toInt = function (env) {
  'use strict';

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "int doesn't like " + a.toString() + ' as input' };
  }

  return new Word(a.jvalue | 0);
};

//------------------------------------------------------------------------------
var round = function (env) {
  'use strict';

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "round doesn't like " + a.toString() + ' as input' };
  }

  return new Word(Math.round(a.jvalue));
};

//------------------------------------------------------------------------------
var sqrt = function (env) {
  'use strict';

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "round doesn't like " + a.toString() + ' as input' };
  }

  return new Word(Math.sqrt(a.jvalue));
};

//------------------------------------------------------------------------------
var power = function (env) {
  'use strict';
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
var exp = function (env) {
  'use strict';

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "exp doesn't like " + a.toString() + ' as input' };
  }

  return new Word(Math.exp(a.jvalue));
};

//------------------------------------------------------------------------------
var log10 = function (env) {
  'use strict';

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "log10 doesn't like " + a.toString() + ' as input' };
  }

  return new Word(Math.log(a.jvalue) / Math.log(10));
};

//------------------------------------------------------------------------------
var ln = function (env) {
  'use strict';

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "ln doesn't like " + a.toString() + ' as input' };
  }

  return new Word(Math.log(a.jvalue));
};

//------------------------------------------------------------------------------
var sin = function (env) {
  'use strict';

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "sin doesn't like " + a.toString() + ' as input' };
  }

  return new Word(Math.sin(a.jvalue * Math.PI / 180));
};

//------------------------------------------------------------------------------
var radsin = function (env) {
  'use strict';

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "radsin doesn't like " + a.toString() + ' as input' };
  }

  return new Word(Math.sin(a.jvalue));
};

//------------------------------------------------------------------------------
var cos = function (env) {
  'use strict';

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "cos doesn't like " + a.toString() + ' as input' };
  }

  return new Word(Math.cos(a.jvalue * Math.PI / 180));
};

//------------------------------------------------------------------------------
var radcos = function (env) {
  'use strict';

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: "radcos doesn't like " + a.toString() + ' as input' };
  }

  return new Word(Math.cos(a.jvalue));
};

//------------------------------------------------------------------------------
var atan = function (env, name) {
  'use strict';

  var a = env.lookupVariable1('a');
  if (!a.isNumeric()) {
    throw { message: name + " doesn't like " + a.toString() + ' as input' };
  }

  var b = env.lookupVariable1('b');
  if (b !== undefined) {
    if (!b.isNumeric()) {
      throw { message: name + " doesn't like " + b.toString() + ' as input' };
    }

    if (a.jvalue === 0) {
      if (b.jvalue > 0) {
        return new Word(Math.PI / 2);
      }
      if (b.jvalue < 0) {
        return new Word(-Math.PI / 2);
      }
      return new Word('0');
    }
    return new Word(Math.atan(b.jvalue / a.jvalue));
  }
  return new Word(Math.atan(a.jvalue));
};

//------------------------------------------------------------------------------
var arctan = function (env) {
  'use strict';
  var ret = atan(env, 'arctan');
  return new Word(ret.jvalue / Math.PI * 180);
};

//------------------------------------------------------------------------------
var radarctan = function (env) {
  'use strict';
  return atan(env, 'radarctan');
};

//------------------------------------------------------------------------------
function installBuiltins_Arithmetic(env) {
  'use strict';

  env.bindFunction('sum',
                   { requiredArgs: [], optionalArgs: [], restArg: 'rest',
                     defaultArgs: 2, maxArgs: -1, minArgs: 1 },
                   sum, '');
  env.bindFunction('difference',
                   { requiredArgs: ['a', 'b'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 2, maxArgs: 2, minArgs: 2 },
                   difference, '');
  env.bindFunction('minus',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   minus, '');
  env.bindFunction('product',
                   { requiredArgs: [], optionalArgs: [], restArg: 'rest',
                     defaultArgs: 2, maxArgs: -1, minArgs: 1 },
                   product, '');
  env.bindFunction('quotient',
                   { requiredArgs: ['a'], optionalArgs: [{name: 'b'}], restArg: undefined,
                     defaultArgs: 2, maxArgs: 2, minArgs: 1 },
                   quotient, '');
  env.bindFunction('remainder',
                   { requiredArgs: ['a', 'b'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 2, maxArgs: 2, minArgs: 2 },
                   remainder, '');
  env.bindFunction('modulo',
                   { requiredArgs: ['a', 'b'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 2, maxArgs: 2, minArgs: 2 },
                   modulo, '');
  env.bindFunction('int',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   toInt, '');
  env.bindFunction('round',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   round, '');
  env.bindFunction('sqrt',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   sqrt, '');
  env.bindFunction('power',
                   { requiredArgs: ['a', 'b'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 2, maxArgs: 2, minArgs: 2 },
                   power, '');
  env.bindFunction('exp',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   exp, '');
  env.bindFunction('log10',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   log10, '');
  env.bindFunction('ln',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   ln, '');
  env.bindFunction('sin',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   sin, '');
  env.bindFunction('radsin',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   radsin, '');
  env.bindFunction('cos',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   cos, '');
  env.bindFunction('radcos',
                   { requiredArgs: ['a'], optionalArgs: [], restArg: undefined,
                     defaultArgs: 1, maxArgs: 1, minArgs: 1 },
                   radcos, '');
  env.bindFunction('arctan',
                   { requiredArgs: ['a'], optionalArgs: [{name: 'b'}], restArg: undefined,
                     defaultArgs: 1, maxArgs: 2, minArgs: 1 },
                   arctan, '');
  env.bindFunction('radarctan',
                   { requiredArgs: ['a'], optionalArgs: [{name: 'b'}], restArg: undefined,
                     defaultArgs: 1, maxArgs: 2, minArgs: 1 },
                   radarctan, '');
  // TODO: rseq library function
  // TODO: iseq library function

  // Arithmetic predicates
  // TODO: lessp, less?
  // TODO: greaterp, greater?
  // TODO: lessequalp, lessequal?
  // TODO: greaterequalp, greaterequal?
}

installBuiltins_Arithmetic(globalEnv);
