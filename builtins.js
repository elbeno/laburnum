//------------------------------------------------------------------------------
// Transmitters
//------------------------------------------------------------------------------
function Print(env, name) {
  var stdout = env.lookupVariable('stdout');
  Type(env, name, stdout);
  stdout.write('\n');
}

//------------------------------------------------------------------------------
function TransmitInternal(env, stdout, fn) {
  var a = env.lookupVariable1('arg');

  var args = [a];
  var rest = env.lookupVariable1('rest');
  if (rest != undefined) {
    args = args.concat(rest.values);
  }

  var s = args.map(fn).join(' ');

  if (stdout === undefined) {
    stdout = env.lookupVariable('stdout');
  }
  stdout.write(s);
}

//------------------------------------------------------------------------------
function Type(env, name, stdout) {
  TransmitInternal(env, stdout, function(x) { return x.value; });
}

//------------------------------------------------------------------------------
function Show(env, name, stdout) {
  TransmitInternal(env, stdout, function(x) { return x.toString(); });
}

//------------------------------------------------------------------------------
// Inspection
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
    repl.val(repl.val() + n.toString() + ' is a primitive\n');
  }
}

//------------------------------------------------------------------------------
// Workspace control
//------------------------------------------------------------------------------
function Erase(env) {
  var n = env.lookupVariable1('name');
  if (n.isArray()) {
    throw { message: "erase doesn't like " + n.toString() + ' as input' };
  }

  globalEnv.eraseFunction(n.toString());
}

//------------------------------------------------------------------------------
function InstallBuiltins(env) {

  // Transmitters
  env.bindFunction('print',
                   { requiredArgs:['arg'], optionalArgs:[], restArg:'rest',
                     defaultArgs:1, maxArgs:-1, minArgs:1 },
                   Print, '');
  env.bindFunction('pr',
                   { requiredArgs:['arg'], optionalArgs:[], restArg:'rest',
                     defaultArgs:1, maxArgs:-1, minArgs:1 },
                   Print, '');
  env.bindFunction('type',
                   { requiredArgs:['arg'], optionalArgs:[], restArg:'rest',
                     defaultArgs:1, maxArgs:-1, minArgs:1 },
                   Type, '');
  env.bindFunction('show',
                   { requiredArgs:['arg'], optionalArgs:[], restArg:'rest',
                     defaultArgs:1, maxArgs:-1, minArgs:1 },
                   Show, '');

  // Inspection
  env.bindFunction('printout',
                   { requiredArgs:['name'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Printout, '');
  env.bindFunction('po',
                   { requiredArgs:['name'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Printout, '');

  // Workspace control
  env.bindFunction('erase',
                   { requiredArgs:['name'], optionalArgs:[], restArg:undefined,
                     defaultArgs:1, maxArgs:1, minArgs:1 },
                   Erase, '');
}

InstallBuiltins(globalEnv);
