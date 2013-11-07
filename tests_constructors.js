module ('constructors');

test( 'word', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('word "foo "bar', globalEnv),
            new Word('foobar'),
           'word "foo "bar -> foobar');

  deepEqual(terp.interpret('(word "foo)', globalEnv),
            new Word('foo'),
           '(word "foo) -> foo');

  deepEqual(terp.interpret('(word "foo "bar "baz)', globalEnv),
            new Word('foobarbaz'),
           '(word "foo "bar "baz) -> foobarbaz');
});

test( 'list', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('list 1 2', globalEnv),
            new List([new Word('1'), new Word('2')]),
           'list 1 2 -> [1 2]');

  deepEqual(terp.interpret('(list 1)', globalEnv),
            new List([new Word('1')]),
           '(list 1) -> [1]');

  deepEqual(terp.interpret('(list 1 2 3)', globalEnv),
            new List([new Word('1'), new Word('2'), new Word('3')]),
           '(list 1 2 3) -> [1 2 3]');
});

test( 'sentence', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('sentence 1 2', globalEnv),
            new List([new Word('1'), new Word('2')]),
           'sentence 1 2 -> [1 2]');

  deepEqual(terp.interpret('sentence [1 2] [3 4]', globalEnv),
            new List([new Word('1'), new Word('2'), new Word('3'), new Word('4')]),
           'sentence [1 2] [3 4] -> [1 2 3 4]');

  deepEqual(terp.interpret('(sentence 1)', globalEnv),
            new List([new Word('1')]),
           '(sentence 1) -> [1]');

  deepEqual(terp.interpret('(sentence 1 2 3)', globalEnv),
            new List([new Word('1'), new Word('2'), new Word('3')]),
           '(sentence 1 2 3) -> [1 2 3]');
});
