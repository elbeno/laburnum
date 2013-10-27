module('selectors');

test( 'first', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('first "foo', globalEnv),
            new Word('f'),
           'first foo -> f');

  deepEqual(terp.interpret('first [1 2]', globalEnv),
            new Word('1'),
           'first [1 2] -> 1');
});

test( 'firsts', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('firsts []', globalEnv),
            new List([]),
           'firsts [] -> []');

  deepEqual(terp.interpret('firsts [foo bar]', globalEnv),
            new List([new Word('f'), new Word('b')]),
           'firsts [foo bar] -> [f b]');
});

test( 'last', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('last "foo', globalEnv),
            new Word('o'),
           'last foo -> o');

  deepEqual(terp.interpret('last [1 2]', globalEnv),
            new Word('2'),
           'last [1 2] -> 2');
});

test( 'butfirst', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('butfirst "foo', globalEnv),
            new Word('oo'),
           'last foo -> oo');

  deepEqual(terp.interpret('butfirst [1 2]', globalEnv),
            new List([new Word('2')]),
           'butfirst [1 2] -> [2]');
});

test( 'butfirsts', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('butfirsts [foo bar]', globalEnv),
            new List([new Word('oo'), new Word('ar')]),
           'butfirsts [foo bar] -> [oo ar]');

  deepEqual(terp.interpret('butfirsts [[f b] [o a] [o r]]', globalEnv),
            new List([
              new List([new Word('b')]),
              new List([new Word('a')]),
              new List([new Word('r')])]),
           'butfirsts [[f b] [o a] [o r] -> [[b] [a] [r]]');

  deepEqual(terp.interpret('butfirsts [[f b] oa]', globalEnv),
            new List([
              new List([new Word('b')]),
              new Word('a')]),
           'butfirsts [[f b] oa] -> [[b] a]');
});

test( 'butlast', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('butlast "foo', globalEnv),
            new Word('fo'),
           'butlast foo -> fo');

  deepEqual(terp.interpret('butlast [foo bar]', globalEnv),
            new List([new Word('foo')]),
           'butlast [foo bar] -> [foo]');
});

test( 'item', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('item 1 "foo', globalEnv),
            new Word('f'),
           'item 1 foo -> f');

  deepEqual(terp.interpret('item 1 [foo bar]', globalEnv),
            new Word('foo'),
           'item 1 [foo bar] -> foo');

  deepEqual(terp.interpret('item 0 {foo bar}@0', globalEnv),
            new Word('foo'),
           'item 0 {foo bar}@0 -> foo');
});
