var CharacterSize = {
	ONE_BY_ONE: { width: 1, height: 1 },
	TWO_BY_ONE: { width: 2, height: 1 },
	TWO_BY_TWO: { width: 2, height: 2 },
	FOUR_BY_TWO: { width: 4, height: 2 },
	SIX_BY_THREE: { width: 6, height: 3 },
}

var Character = function(x, y, rotation, size) {
    this.x = x;
    this.y = y;
    this.rotation = rotation;
	this.size = size;
}

Character.prototype.draw = function(ctx) {
    var radius = (TILE_SIZE * this.size.height) / 2 - 5;
	ctx.translate(this.x * TILE_SIZE + (TILE_SIZE * this.size.width) / 2,
	    this.y * TILE_SIZE + (TILE_SIZE * this.size.height) / 2);
	ctx.rotate(this.angle);
    ctx.fillStyle = "#000000";
    if (this.size.width == this.size.height) {
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI, false);
        ctx.fill();
    } else {
        ctx.beginPath();
        var offsetX = (TILE_SIZE * this.size.width / 2) / 2;
        ctx.arc(-offsetX, 0, radius, 0, 2 * Math.PI, false);
        ctx.arc(offsetX, 0, radius, 0, 2 * Math.PI, false);
        if (this.size == CharacterSize.TWO_BY_ONE) {
            var height = TILE_SIZE - 20;
        } else {
            var height = radius * 2;
        }
        ctx.rect(-offsetX, -height / 2, TILE_SIZE * (this.baseType.x / 2), height);
        ctx.fill();
    }
}
