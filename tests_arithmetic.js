module('arithmetic');

test( 'sum', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('sum 1 2', globalEnv),
            new Word('3'),
           'sum 1 2 -> 3');

  deepEqual(terp.interpret('(sum 1 2 3)', globalEnv),
            new Word('6'),
           '(sum 1 2 3) -> 6');

  deepEqual(terp.interpret('(sum 1)', globalEnv),
            new Word('1'),
           '(sum 1) -> 1');
});

test( 'difference', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('difference 5 3', globalEnv),
            new Word('2'),
           'difference 5 3 -> 2');
});

test( 'minus', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('minus 5', globalEnv),
            new Word('-5'),
           'minus 5 -> -5');

  deepEqual(terp.interpret('minus 5 + 2', globalEnv),
            new Word('-7'),
           'minus 5 + 2 -> -7');
});

test( 'product', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('product 1 2', globalEnv),
            new Word('2'),
           'product 1 2 -> 2');

  deepEqual(terp.interpret('(product 1 2 3)', globalEnv),
            new Word('6'),
           '(product 1 2 3) -> 6');

  deepEqual(terp.interpret('(product 1)', globalEnv),
            new Word('1'),
           '(product 1) -> 1');
});

test( 'quotient', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('(quotient 2)', globalEnv),
            new Word('0.5'),
           'quotient 2 -> 0.5');

  deepEqual(terp.interpret('quotient 4 2', globalEnv),
            new Word('2'),
           'quotient 4 2 -> 2');

  deepEqual(terp.interpret('quotient 5 2', globalEnv),
            new Word('2.5'),
           'quotient 5 2 -> 2.5');
});

test( 'remainder', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('remainder 7 3', globalEnv),
            new Word('1'),
           'remainder 7 3 -> 1');

  deepEqual(terp.interpret('remainder -7 3', globalEnv),
            new Word('-1'),
           'remainder -7 3 -> -1');

  deepEqual(terp.interpret('remainder 7 -3', globalEnv),
            new Word('1'),
           'remainder 7 -3 -> 1');

  deepEqual(terp.interpret('remainder -7 -3', globalEnv),
            new Word('-1'),
           'remainder -7 -3 -> -1');
});

test( 'modulo', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('modulo 7 3', globalEnv),
            new Word('1'),
           'modulo 7 3 -> 1');

  deepEqual(terp.interpret('modulo -7 3', globalEnv),
            new Word('2'),
           'modulo -7 3 -> 2');

  deepEqual(terp.interpret('modulo 7 -3', globalEnv),
            new Word('-2'),
           'modulo 7 -3 -> -2');

  deepEqual(terp.interpret('modulo -7 -3', globalEnv),
            new Word('-1'),
           'modulo -7 -3 -> -1');
});

test( 'int', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('int 7.3', globalEnv),
            new Word('7'),
           'int 7.3 -> 7');

  deepEqual(terp.interpret('int -7.3', globalEnv),
            new Word('-7'),
           'int -7.3 -> -7');

  deepEqual(terp.interpret('int 7.8', globalEnv),
            new Word('7'),
           'int 7.8 -> 7');

  deepEqual(terp.interpret('int -7.8', globalEnv),
            new Word('-7'),
           'int -7.8 -> -7');
});

test( 'round', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('round 7.3', globalEnv),
            new Word('7'),
           'round 7.3 -> 7');

  deepEqual(terp.interpret('round -7.3', globalEnv),
            new Word('-7'),
           'round -7.3 -> -7');

  deepEqual(terp.interpret('round 7.8', globalEnv),
            new Word('8'),
           'round 7.8 -> 8');

  deepEqual(terp.interpret('round -7.8', globalEnv),
            new Word('-8'),
           'round -7.8 -> -8');
});

test( 'sqrt', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('sqrt 4', globalEnv),
            new Word('2'),
           'sqrt 4 -> 2');
});

test( 'power', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('power 2 2', globalEnv),
            new Word('4'),
           'power 2 2 -> 4');

  deepEqual(terp.interpret('power 2 -2', globalEnv),
            new Word('0.25'),
           'power 2 -2 -> 0.25');

  deepEqual(terp.interpret('power -2 2', globalEnv),
            new Word('4'),
           'power -2 2 -> 4');

  deepEqual(terp.interpret('power -2 0.5', globalEnv),
            new Word('NaN'),
           'power -2 0.5 -> NaN');
});

test( 'exp', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('exp 1', globalEnv),
            new Word(Math.E),
           'exp 1 -> ' + Math.E);
});

test( 'log10', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('log10 1', globalEnv),
            new Word('0'),
           'log10 1 -> 0');

  deepEqual(terp.interpret('log10 10', globalEnv),
            new Word('1'),
           'log10 10 -> 1');
});

test( 'ln', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('ln 1', globalEnv),
            new Word('0'),
           'ln 1 -> 0');

  deepEqual(terp.interpret('ln ' + Math.E, globalEnv),
            new Word('1'),
           'ln ' + Math.E + ' -> 1');
});

test( 'sin', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('sin 0', globalEnv),
            new Word('0'),
           'sin 0 -> 0');

  deepEqual(terp.interpret('sin 90', globalEnv),
            new Word('1'),
           'sin 90 -> 1');

  deepEqual(terp.interpret('sin -90', globalEnv),
            new Word('-1'),
           'sin -90 -> -1');

  deepEqual(terp.interpret('sin 180', globalEnv),
            new Word(Math.sin(Math.PI)),
           'sin 180 -> ' + Math.sin(Math.PI));
});

test( 'cos', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('cos 0', globalEnv),
            new Word('1'),
           'cos 0 -> 1');

  deepEqual(terp.interpret('cos 90', globalEnv),
            new Word(Math.cos(Math.PI/2)),
           'cos 90 -> ' + Math.cos(Math.PI/2));

  deepEqual(terp.interpret('cos -90', globalEnv),
            new Word(Math.cos(-Math.PI/2)),
           'cos -90 -> ' + Math.cos(-Math.PI/2));

  deepEqual(terp.interpret('cos 180', globalEnv),
            new Word('-1'),
           'cos 180 -> -1');
});

test( 'radsin', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('radsin 0', globalEnv),
            new Word(0),
           'radsin 0 -> 0');

  deepEqual(terp.interpret('radsin ' + Math.PI/2, globalEnv),
            new Word('1'),
           'radsin ' + Math.PI/2 + ' -> 1');

  deepEqual(terp.interpret('radsin ' + Math.PI, globalEnv),
            new Word(Math.sin(Math.PI)),
           'radsin ' + Math.PI + ' -> ' + Math.sin(Math.PI));
});

test( 'radcos', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('radcos 0', globalEnv),
            new Word('1'),
           'radcos 0 -> 1');

  deepEqual(terp.interpret('radcos ' + Math.PI/2, globalEnv),
            new Word(Math.cos(Math.PI/2)),
           'radcos ' + Math.PI/2 + ' -> ' + Math.cos(Math.PI/2));

  deepEqual(terp.interpret('radcos ' + Math.PI, globalEnv),
            new Word('-1'),
           'radcos ' + Math.PI + ' -> -1');
});

test( 'arctan', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('arctan 0', globalEnv),
            new Word('0'),
           'arctan 0 -> 0');

  deepEqual(terp.interpret('arctan 1', globalEnv),
            new Word('45'),
           'arctan 1 -> 45');

  deepEqual(terp.interpret('arctan -1', globalEnv),
            new Word('-45'),
           'arctan 1 -> -45');

  deepEqual(terp.interpret('(arctan 2 2)', globalEnv),
            new Word('45'),
           '(arctan 2 2) -> 45');

  deepEqual(terp.interpret('(arctan 0 1)', globalEnv),
            new Word('90'),
           '(arctan 0 1) -> 90');

  deepEqual(terp.interpret('(arctan 0 -1)', globalEnv),
            new Word('-90'),
           '(arctan 0 -1) -> -90');
});

test( 'radarctan', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('radarctan 0', globalEnv),
            new Word('0'),
           'radarctan 0 -> 0');

  deepEqual(terp.interpret('radarctan 1', globalEnv),
            new Word(Math.PI/4),
           'radarctan 1 -> ' + Math.PI/4);

  deepEqual(terp.interpret('radarctan -1', globalEnv),
            new Word(-Math.PI/4),
           'radarctan 1 -> ' + -Math.PI/4);

  deepEqual(terp.interpret('(radarctan 2 2)', globalEnv),
            new Word(Math.PI/4),
           '(radarctan 2 2) -> ' + Math.PI/4);

  deepEqual(terp.interpret('(radarctan 0 1)', globalEnv),
            new Word(Math.PI/2),
           '(radarctan 0 1) -> ' + Math.PI/2);

  deepEqual(terp.interpret('(radarctan 0 -1)', globalEnv),
            new Word(-Math.PI/2),
           '(radarctan 0 -1) -> ' + -Math.PI/2);
});
