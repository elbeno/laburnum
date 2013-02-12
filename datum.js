//------------------------------------------------------------------------------
function Word(value) {
  this.value = value.toString();

  // try to make a number
  this.jvalue = parseFloat(this.value);
  if (!isNaN(this.jvalue) && isFinite(this.value)) {
    this.type = 'numeric';
    return;
  }

  // otherwise, try to make a boolean
  if (this.value.toLowerCase() == 'true') {
    this.jvalue = true;
    this.type = 'boolean';
  }
  else if (this.value.toLowerCase() == 'false') {
    this.jvalue = false;
    this.type = 'boolean';
  }

  this.type = 'word';
}

//------------------------------------------------------------------------------
Word.prototype.isNumeric = function() {
  return this.type == 'numeric';
};

//------------------------------------------------------------------------------
Word.prototype.isBoolean = function() {
  return this.type == 'boolean';
};

//------------------------------------------------------------------------------
Word.prototype.toString = function() {
  return this.value;
};

//------------------------------------------------------------------------------
function List(values) {
  this.type = 'list';
  this.values = values;
  this.value = this.toBareString();
}

List.prototype.toBareString = function() {
  return this.values.map(function(x) { return x.toString(); }).join(' ');
};

List.prototype.toString = function() {
  return '[' + this.toBareString() + ']';
};
