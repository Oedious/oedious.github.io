var Player = function(name, color) {
	this.name_ = name;
	this.color_ = color;
	this.characters_ = [];
}

Player.prototype.draw = function(ctx) {
	for (var i = 0; i < this.characters_.length; ++i) {
		ctx.save();
		this.characters_[i].draw(ctx, this.color_);
		ctx.restore();
	}
}

Player.prototype.serialize = function() {
	var obj = {
		n: this.name_,
		t: this.color_
	};
	obj.c = [];
	for (var i = 0; i < this.characters_.length; ++i) {
		obj.c.push(this.characters_[i].serialize());
	}
	return obj;
}

Player.deserialize = function(obj) {
	var player = new Player(obj.n, obj.t);
	for (var i = 0; i < obj.c.length; ++i) {
		player.characters_.push(Character.deserialize(obj.c[i]));
	}
	return player;
}

Player.prototype.findCharacter = function(x, y) {
	for (var i = 0; i < this.characters_.length; ++i) {
		var character = this.characters_[i];
		if (character.isInTile(x, y)) {
			return character;
		}
	}
	return null;
}

Player.prototype.addCharacter = function(character) {
	this.characters_.push(character);
}

Player.prototype.removeCharacter = function(character) {
	for (var i = 0; i < this.characters_.length; ++i) {
		if (this.characters_[i] == character) {
			this.characters_.splice(i, 1);
			return;
		}
	}
}

Player.prototype.getName = function() {
	return this.name_;
}

Player.prototype.setName = function(name) {
	this.name_ = name;
}

Player.prototype.getColor = function() {
	return this.color_;
}

Player.prototype.setColor = function(color) {
	this.color_ = color;
}
