module('templates');

test( 'apply', function() {
  var terp = new Interpreter();

  deepEqual(terp.interpret('apply [? * ?] [3]', globalEnv),
            new Word('9'),
           'apply [? * ?] [3] -> [9]');
});
