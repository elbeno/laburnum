//------------------------------------------------------------------------------
function Stdout(id) {
  this.id = id;
  this.type = 'ostream';
}

//------------------------------------------------------------------------------
Stdout.prototype.write = function(str) {
  var output = $(this.id);
  output.val(output.val() + str);
};
