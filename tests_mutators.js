module ('mutators');

test( 'setitem', function() {
  var terp = new Interpreter();

  terp.interpret('make "setitemtest {1 2}@0', globalEnv);
  terp.interpret('setitem 0 :setitemtest 4', globalEnv);
  deepEqual(terp.interpret(':setitemtest', globalEnv),
            new LArray([new Word('4'), new Word('2')], 0),
            'setitem 0 {1 2}@0 4 -> {4 2}');
});
