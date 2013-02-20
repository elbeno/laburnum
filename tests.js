module ('tokenizer');

test( 'word', function() {
  var tokenizer = new Tokenizer();
  tokenizer.tokenize('foo');
  deepEqual( tokenizer.tokenqueue,
             [ {type:token_ns.Enum.WORD, lexeme:'foo'} ],
             '1 Word' );

  tokenizer.tokenize('foo bar');
  deepEqual( tokenizer.tokenqueue,
             [ {type:token_ns.Enum.WORD, lexeme:'foo'},
               {type:token_ns.Enum.WORD, lexeme:'bar'} ],
             '2 Words' );

  tokenizer.tokenize('foo| |bar');
  deepEqual( tokenizer.tokenqueue,
             [ {type:token_ns.Enum.WORD, lexeme:'foo bar'} ],
             'Barred word' );

  tokenizer.tokenize('foo\\ bar');
  deepEqual( tokenizer.tokenqueue,
             [ {type:token_ns.Enum.WORD, lexeme:'foo bar'} ],
             'Escaped character' );
});

test( 'special', function() {
  var tokenizer = new Tokenizer();

  tokenizer.tokenize('"');
  deepEqual( tokenizer.tokenqueue,
             [ {type:token_ns.Enum.QUOTE, lexeme:'"'},
               {type:token_ns.Enum.WORD, lexeme:''} ],
             'Quote' );

  tokenizer.tokenize(':');
  deepEqual( tokenizer.tokenqueue,
             [ {type:token_ns.Enum.COLON, lexeme:':'},
               {type:token_ns.Enum.WORD, lexeme:''} ],
             'Dots' );
});

test( 'operators', function() {
  var tokenizer = new Tokenizer();

  tokenizer.tokenize('+ -');
  deepEqual( tokenizer.tokenqueue,
             [ {type:token_ns.Enum.ADDOP, lexeme:'+'},
               {type:token_ns.Enum.ADDOP, lexeme:'-'} ],
             'AddOps' );

  tokenizer.tokenize('* / %');
  deepEqual( tokenizer.tokenqueue,
             [ {type:token_ns.Enum.MULOP, lexeme:'*'},
               {type:token_ns.Enum.MULOP, lexeme:'/'},
               {type:token_ns.Enum.MULOP, lexeme:'%'} ],
             'MulOps' );

  tokenizer.tokenize('= <> < > <= >=');
  deepEqual( tokenizer.tokenqueue,
             [ {type:token_ns.Enum.RELOP, lexeme:'='},
               {type:token_ns.Enum.RELOP, lexeme:'<>'},
               {type:token_ns.Enum.RELOP, lexeme:'<'},
               {type:token_ns.Enum.RELOP, lexeme:'>'},
               {type:token_ns.Enum.RELOP, lexeme:'<='},
               {type:token_ns.Enum.RELOP, lexeme:'>='} ],
             'RelOps' );

  tokenizer.tokenize('()');
  deepEqual( tokenizer.tokenqueue,
             [ {type:token_ns.Enum.LEFT_PAREN, lexeme:'('},
               {type:token_ns.Enum.RIGHT_PAREN, lexeme:')'} ],
             'Parens' );
});

test( 'list', function() {
  var tokenizer = new Tokenizer();

  tokenizer.tokenize('[3 + 4]');
  deepEqual( tokenizer.tokenqueue,
             [ {type:token_ns.Enum.LEFT_SQUARE_BRACKET, lexeme:'['},
               {type:token_ns.Enum.WORD, lexeme:'3'},
               {type:token_ns.Enum.WORD, lexeme:'+'},
               {type:token_ns.Enum.WORD, lexeme:'4'},
               {type:token_ns.Enum.RIGHT_SQUARE_BRACKET, lexeme:']'} ],
             'List' );
});

test( 'array', function() {
  var tokenizer = new Tokenizer();

  tokenizer.tokenize('{3 + 4}@2');
  deepEqual( tokenizer.tokenqueue,
             [ {type:token_ns.Enum.LEFT_CURLY_BRACKET, lexeme:'{'},
               {type:token_ns.Enum.WORD, lexeme:'3'},
               {type:token_ns.Enum.WORD, lexeme:'+'},
               {type:token_ns.Enum.WORD, lexeme:'4'},
               {type:token_ns.Enum.RIGHT_CURLY_BRACKET, lexeme:'}'},
               {type:token_ns.Enum.AT_SIGN, lexeme:'@'},
               {type:token_ns.Enum.WORD, lexeme:'2'} ],
             'Array' );
});

test( 'continuations', function() {
  var tokenizer = new Tokenizer();

  throws( function() { tokenizer.tokenize('|foo'); },
          function(e) { return e.continuationPrompt == '| '; },
          'Bar');

  throws( function() { tokenizer.tokenize('foo\\'); },
          function(e) { return e.continuationPrompt == '\\ '; },
          'Backslash');

  tokenizer.tokenize(tokenizer.preprocess('foo ~\n~ bar'));
  deepEqual( tokenizer.tokenqueue,
             [ {type:token_ns.Enum.WORD, lexeme:'foo'},
               {type:token_ns.Enum.WORD, lexeme:'bar'} ],
             '~ manual continuation');

  tokenizer.tokenize(tokenizer.preprocess('foo\n~ bar'));
  deepEqual( tokenizer.tokenqueue,
             [ {type:token_ns.Enum.WORD, lexeme:'foo'},
               {type:token_ns.Enum.WORD, lexeme:'bar'} ],
             '~ auto continuation');

  tokenizer.tokenize(tokenizer.preprocess('foo;bar'));
  deepEqual( tokenizer.tokenqueue,
             [ {type:token_ns.Enum.WORD, lexeme:'foo'} ],
             'Comment');

  tokenizer.tokenize(tokenizer.preprocess('foo;bar~\n~ baz'));
  deepEqual( tokenizer.tokenqueue,
             [ {type:token_ns.Enum.WORD, lexeme:'foobaz'} ],
             'Comment with continuation');

});

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
