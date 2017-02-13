var Colors = [
	"red",
	"orange",
	"yellow",
	"green",
	"blue",
	"purple"
];

var ColorType = {
	RED: 0,
	ORANGE: 1,
	YELLOW: 2,
	GREEN: 3,
	BLUE: 4,
	PURPLE: 5
};

var Player = function(name, colorType) {
	this.name_ = name;
	this.colorType_ = colorType;
	this.characters_ = [];
}

Player.prototype.draw = function(ctx) {
	for (var i = 0; i < this.characters_.length; ++i) {
		ctx.save();
		this.characters_[i].draw(ctx, this.getColor());
		ctx.restore();
	}
}

Player.prototype.drawCharacterList = function(playerIndex) {
	var html = "";
	for (var i = 0; i < this.characters_.length; ++i) {
		var character = this.characters_[i];
		html += "<div class='characterListEntry'>" +
			"<div>Name:<input class='panelInput'></input></div>" +
			"<div>Base Type:<select id='player" + playerIndex + "Character" + i + "SizeType' onchange='mgr.applySizeType(" + i + ")'>";
		for (var j = 0; j < CharacterSizes.length; ++j) {
			html += "<option value='" + j + "'";
			if (character.getSizeType() == j) {
				html += " selected='selected'"
			}
			html += ">" + CharacterSizes[j].name + "</option>";
		}
		html += "</select></div></div>"
	}
	var listId = "player" + playerIndex + "CharacterList";
	document.getElementById(listId).innerHTML = html;
}

Player.prototype.serialize = function() {
	var obj = {
		n: this.name_,
		t: this.colorType_
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

Player.prototype.getCharacter = function(index) {
	return this.characters_[index];
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
	return Colors[this.colorType_];
}

Player.prototype.getColorType = function() {
	return this.colorType_;
}

Player.prototype.setColorType = function(colorType) {
	this.colorType_ = colorType;
}
