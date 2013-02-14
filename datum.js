//------------------------------------------------------------------------------
function Word(value) {
  this.value = value.toString();

  if (this.value.charAt(0) == '|' && this.value.charAt(value.length-1) == '|') {
    this.value = this.value.substring(1, value.length-1);
  }

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
    return;
  }
  else if (this.value.toLowerCase() == 'false') {
    this.jvalue = false;
    this.type = 'boolean';
    return;
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
  // we need to bar a word with special characters in it
  if (!this.value || /[\s\[\]\(\)\+\-\*\/=<>]/.test(this.value)) {
    return '|' + this.value + '|';
  }
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
