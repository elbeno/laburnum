module('queries');

test( 'count', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('count "foo', globalEnv),
            new Word('3'),
           'count foo -> 3');

  deepEqual(terp.interpret('count "|foo bar|', globalEnv),
            new Word('7'),
           'count |foo bar| -> 7');

  deepEqual(terp.interpret('count "foo\\ bar', globalEnv),
            new Word('7'),
           'count foo\\ bar -> 7');

  deepEqual(terp.interpret('count "', globalEnv),
            new Word('0'),
           'count " -> 0');

  deepEqual(terp.interpret('count [1 2 3]', globalEnv),
            new Word('3'),
           'count list');

  deepEqual(terp.interpret('count {1 2 3}', globalEnv),
            new Word('3'),
           'count array');
});

test( 'ascii/char', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('ascii "A', globalEnv),
            new Word('65'),
           'ascii A -> 65');

  deepEqual(terp.interpret('char 65', globalEnv),
            new Word('A'),
           'char 65 -> A');
});

test( 'member', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('member "n "banana', globalEnv),
            new Word('nana'),
           'member n banana -> nana');

  deepEqual(terp.interpret('member "b [a b c]', globalEnv),
            new List([new Word('b'), new Word('c')]),
           'member "b [a b c] -> [b c]');
});

test( 'lowercase/uppercase', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('lowercase "FOO', globalEnv),
            new Word('foo'),
           'lowercase FOO -> foo');

  deepEqual(terp.interpret('uppercase "foo', globalEnv),
            new Word('FOO'),
           'lowercase foo -> FOO');
});
