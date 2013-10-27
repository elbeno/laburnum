module ('interpreter');

test( 'literals', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('2'),
            new Word('2'),
           'Numeric word');

  deepEqual(terp.interpret('true'),
            new Word('true'),
           'Bool word: true');
  deepEqual(terp.interpret('false'),
            new Word('false'),
           'Bool word: false');

  deepEqual(terp.interpret('"foo'),
            new Word('foo'),
           'Quoted word');

  deepEqual(terp.interpret('[2]'),
            new List([new Word('2')]),
           'List');

  deepEqual(terp.interpret('{2}'),
            new LArray([new Word('2')], 1),
           'Array');

  deepEqual(terp.interpret('{2}@2'),
            new LArray([new Word('2')], 2),
           'Array with origin');
});

test( 'arithmetic', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('+ 3'),
            new Word('3'),
           'Unary plus');
  deepEqual(terp.interpret('- 3'),
            new Word('-3'),
           'Unary minus');

  deepEqual(terp.interpret('2 + 3'),
            new Word('5'),
           'Addition');
  deepEqual(terp.interpret('3 - 2'),
            new Word('1'),
           'Subtraction');

  deepEqual(terp.interpret('3 * 2'),
            new Word('6'),
           'Multiplication');
  deepEqual(terp.interpret('6 / 2'),
            new Word('3'),
           'Division');
  deepEqual(terp.interpret('5 % 2'),
            new Word('1'),
           'Mod');
});

test( 'relational operations', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('3 > 2'),
            new Word('true'),
           'Greater than');
  deepEqual(terp.interpret('3 >= 2'),
            new Word('true'),
           'Greater than or equal to');

  deepEqual(terp.interpret('3 < 2'),
            new Word('false'),
           'Less than');
  deepEqual(terp.interpret('3 <= 2'),
            new Word('false'),
           'Less than or equal to');

  deepEqual(terp.interpret('3 = 2', globalEnv),
            new Word('false'),
           'Equal to');
  deepEqual(terp.interpret('3 <> 2', globalEnv),
            new Word('true'),
           'Not equal to');
});

test( 'operator precedence', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('3 + 3 = 6', globalEnv),
            new Word('true'),
           'add beats rel');

  deepEqual(terp.interpret('2 + 3 * 5'),
            new Word('17'),
           'mul beats add');

  deepEqual(terp.interpret('-2 + 3'),
            new Word('1'),
           'unary beats add');

  deepEqual(terp.interpret('-(2 + 3)'),
            new Word('-5'),
           'parens beats unary');

  deepEqual(terp.interpret('make "foo 2 + 3 :foo', globalEnv),
            new Word('5'),
           'function arg');
});

test( 'function arguments', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('sum 1 2', globalEnv),
            new Word('3'),
           'call with required arguments');

  deepEqual(terp.interpret('(sum 1 2 3)', globalEnv),
            new Word('6'),
           'call with extra arguments');
});

test( 'continuations', function() {
  var terp = new Interpreter();

  throws( function() { terp.interpret('(2 + 3'); },
          function(e) { return e.continuationPrompt == '~ '; },
          'expect right paren');

  throws( function() { terp.interpret('[2 + 3'); },
          function(e) { return e.continuationPrompt == '~ '; },
          'expect right square bracket');

  throws( function() { terp.interpret('{2 3'); },
          function(e) { return e.continuationPrompt == '~ '; },
          'expect right curly bracket');

  throws( function() { terp.interpret('2 >'); },
          function(e) { return e.continuationPrompt == '~ '; },
          'expect second argument to relop');

  throws( function() { terp.interpret('2 +'); },
          function(e) { return e.continuationPrompt == '~ '; },
          'expect second argument to addop');

  throws( function() { terp.interpret('2 *'); },
          function(e) { return e.continuationPrompt == '~ '; },
          'expect second argument to mulop');

  throws( function() { terp.interpret('-'); },
          function(e) { return e.continuationPrompt == '~ '; },
          'expect argument to unaryop');
});
