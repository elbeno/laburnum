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

test( 'continuation', function() {
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
             'comment');

  tokenizer.tokenize(tokenizer.preprocess('foo;bar~\n~ baz'));
  deepEqual( tokenizer.tokenqueue,
             [ {type:token_ns.Enum.WORD, lexeme:'foobaz'} ],
             'comment with continuation');

});
