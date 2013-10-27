module ('predicates');

test( 'wordp', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('wordp "foo', globalEnv),
            new Word('true'),
           'non-empty wordp');

  deepEqual(terp.interpret('wordp "', globalEnv),
            new Word('true'),
           'empty wordp');

  deepEqual(terp.interpret('word? "foo', globalEnv),
            new Word('true'),
           'non-empty word?');

  deepEqual(terp.interpret('word? "', globalEnv),
            new Word('true'),
           'empty word?');

  deepEqual(terp.interpret('wordp []', globalEnv),
            new Word('false'),
           'list');

  deepEqual(terp.interpret('wordp {}', globalEnv),
            new Word('false'),
           'array');
});

test( 'listp', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('listp [3]', globalEnv),
            new Word('true'),
           'non-empty listp');

  deepEqual(terp.interpret('listp []', globalEnv),
            new Word('true'),
           'empty listp');

  deepEqual(terp.interpret('list? [3]', globalEnv),
            new Word('true'),
           'non-empty list?');

  deepEqual(terp.interpret('list? []', globalEnv),
            new Word('true'),
           'empty list?');

  deepEqual(terp.interpret('listp "', globalEnv),
            new Word('false'),
           'word');

  deepEqual(terp.interpret('listp {}', globalEnv),
            new Word('false'),
           'array');
});

test( 'arrayp', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('arrayp {3}', globalEnv),
            new Word('true'),
           'non-empty arrayp');

  deepEqual(terp.interpret('arrayp {}', globalEnv),
            new Word('true'),
           'empty arrayp');

  deepEqual(terp.interpret('array? {3}', globalEnv),
            new Word('true'),
           'non-empty array?');

  deepEqual(terp.interpret('array? {}', globalEnv),
            new Word('true'),
           'empty array?');

  deepEqual(terp.interpret('arrayp "', globalEnv),
            new Word('false'),
           'word');

  deepEqual(terp.interpret('arrayp []', globalEnv),
            new Word('false'),
           'list');
});

test( 'emptyp', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('emptyp "foo', globalEnv),
            new Word('false'),
           'non-empty word');

  deepEqual(terp.interpret('emptyp "', globalEnv),
            new Word('true'),
           'empty word');

  deepEqual(terp.interpret('emptyp [3]', globalEnv),
            new Word('false'),
           'non-empty list');

  deepEqual(terp.interpret('emptyp []', globalEnv),
            new Word('true'),
           'empty list');

  deepEqual(terp.interpret('emptyp {3}', globalEnv),
            new Word('false'),
           'non-empty array');

  deepEqual(terp.interpret('emptyp {}', globalEnv),
            new Word('true'),
           'empty array');

});

test( 'equalp', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('equalp "foo "foo', globalEnv),
            new Word('true'),
           'word =');

  deepEqual(terp.interpret('equalp "foo "bar', globalEnv),
            new Word('false'),
           'word <>');

  deepEqual(terp.interpret('equalp [3 4] [3 4]', globalEnv),
            new Word('true'),
           'list =');

  deepEqual(terp.interpret('equalp [3 4] [3]', globalEnv),
            new Word('false'),
           'list <>');

  deepEqual(terp.interpret('equalp [3 4] "foo', globalEnv),
            new Word('false'),
           'different types');
});

test( 'beforep', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('beforep "bar "foo', globalEnv),
            new Word('true'),
           'foo before bar');

  deepEqual(terp.interpret('beforep "foo "bar', globalEnv),
            new Word('false'),
           'bar after foo');

  deepEqual(terp.interpret('beforep 12 3', globalEnv),
            new Word('true'),
           '12 before 3');

  deepEqual(terp.interpret('beforep 3 12', globalEnv),
            new Word('false'),
           '3 after 12');
});

test( 'memberp', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('memberp "o "foo', globalEnv),
            new Word('true'),
           'o in foo');

  deepEqual(terp.interpret('memberp "b "foo', globalEnv),
            new Word('false'),
           'b not in foo');

  deepEqual(terp.interpret('memberp "b [a b c]', globalEnv),
            new Word('true'),
           'b in [a b c]');

  deepEqual(terp.interpret('memberp "b [d e f]', globalEnv),
            new Word('false'),
           'b not in [d e f]');
});

test( 'substringp', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('substringp "foo "foobar', globalEnv),
            new Word('true'),
           'foo is a substring of foobar');

  deepEqual(terp.interpret('substringp 3 53', globalEnv),
            new Word('true'),
           '3 is a substring of 53');

  deepEqual(terp.interpret('substringp [1] [1 2 3]', globalEnv),
            new Word('false'),
           'substringp on list');

  deepEqual(terp.interpret('substringp {1} {1 2 3}', globalEnv),
            new Word('false'),
           'substringp on array');
});

test( 'numberp', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('numberp "foo', globalEnv),
            new Word('false'),
           'foo is not a number');

  deepEqual(terp.interpret('numberp 3', globalEnv),
            new Word('true'),
           '3 is a number');

  deepEqual(terp.interpret('numberp [1 2 3]', globalEnv),
            new Word('false'),
           '[1 2 3] is not a number');

  deepEqual(terp.interpret('numberp {2 3}', globalEnv),
            new Word('false'),
           '{2 3} is not a number');
});
