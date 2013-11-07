//------------------------------------------------------------------------------
function Datum() {
}

//------------------------------------------------------------------------------
Datum.prototype.isNumeric = function() {
  return this.type == 'numeric';
};

//------------------------------------------------------------------------------
Datum.prototype.isBoolean = function() {
  return this.type == 'boolean';
};

//------------------------------------------------------------------------------
Datum.prototype.isWord = function() {
  return this.type != 'list' && this.type != 'array';
};

//------------------------------------------------------------------------------
Datum.prototype.isList = function() {
  return this.type == 'list';
};

//------------------------------------------------------------------------------
Datum.prototype.isArray = function() {
  return this.type == 'array';
};

//------------------------------------------------------------------------------
function Word(value) {
  this.value = value.toString();

  if (this.value[0] == '|' && this.value[value.length-1] == '|') {
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

Word.prototype = new Datum();

//------------------------------------------------------------------------------
Word.prototype.toString = function(delimiters) {
  if (delimiters === undefined) {
    delimiters = /[\s\[\]\(\)\{\}\+\-\*\/=<>]/;
  }
  // we need to bar a word with special characters in it
  if (!this.value || delimiters.test(this.value)) {
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

List.prototype = new Datum();

//------------------------------------------------------------------------------
List.prototype.toBareString = function() {
  return this.values.map(function(x) { return x.toString(/[\s\[\]]/); }).join(' ');
};

//------------------------------------------------------------------------------
List.prototype.toString = function() {
  return '[' + this.toBareString() + ']';
};

//------------------------------------------------------------------------------
function LArray(values, base) {
  this.type = 'array';
  this.values = values;
  this.origin = base;
  this.value = this.toString();
}

LArray.prototype = new Datum();

//------------------------------------------------------------------------------
LArray.prototype.toString = function() {
  return '{' + this.values.map(function(x) { return x.toString(/[\s\[\]\{\}]/); }).join(' ') + '}';
};

//------------------------------------------------------------------------------
LArray.prototype.computeIndex = function(index, err) {
  if (index < this.origin || (index  - this.origin) >= this.values.length) {
    throw err;
  }
  return index - this.origin;
};

//------------------------------------------------------------------------------
LArray.prototype.atIndex = function(index, err) {
  return this.values[this.computeIndex(index, err)];
};
