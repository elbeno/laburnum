//------------------------------------------------------------------------------
var Apply = function(env) {
  var template  = env.lookupVariable1('template');
  if (!template.isList()) {
    throw { message: "apply doesn't like " + template.toString() + ' as input' };
  }
  var input  = env.lookupVariable1('input');
  if (!input.isList()) {
    throw { message: "apply doesn't like " + input.toString() + ' as input' };
  }

  // replace each ? element of the template with the appropriate value from the
  // input list
  for (var i = 0; i < template.values.length; ++i) {
    var lexeme = template.values[i].toString();
    if (lexeme[0] == '?') {
      var index = 0;
      if (lexeme.length > 1) {
        index = parseInt(lexeme.substr(1)) - 1;
        if (isNaN(index)) {
          throw { message: "apply doesn't like " + lexeme + ' in template' };
        }
      }
      if (index < 0 || index >= input.values.length) {
        throw { message: "apply: " + lexeme + ' is out of range for the input list' };
      }
      template.values[i] = input.values[index];
    }
  }

  // now evaluate the template
  var terp = new Interpreter();
  terp.env = env;
  terp.tokenizer = new Tokenizer();
  terp.tokenizer.tokenize(template.toBareString());
  return terp.toplevel();
};

//------------------------------------------------------------------------------
function InstallBuiltins_Templates(env) {

  env.bindFunction('apply',
                   { requiredArgs:['template', 'input'], optionalArgs:[], restArg:undefined,
                     defaultArgs:2, maxArgs:2, minArgs:2 },
                   Apply, '');
  // TODO: invoke, foreach, map, map.se,
  // filter, find, reduce, crossmap, cascade
  // cascade.2, transfer
}

InstallBuiltins_Templates(globalEnv);
