var Sizes = [{
    name: "Single",
    width: 1,
    height: 1
}, {
    name: "Peanut",
    width: 2,
    height: 1
}, {
    name: "2x2",
    width: 2,
    height: 2
}, {
    name: "4x2",
    width: 4,
    height: 2
}, {
    name: "6x3",
    width: 6,
    height: 3
}]

var SizeType = {
    ONE_BY_ONE: 0,
    TWO_BY_ONE: 1,
    TWO_BY_TWO: 2,
    FOUR_BY_TWO: 3,
    SIX_BY_THREE: 4,
}

var Character = function(x, y, rotation, sizeType) {
    this.name_ = "";
    this.x_ = x;
    this.y_ = y;
    this.rotation_ = rotation;
    this.sizeType_ = sizeType;
}

Character.prototype.draw = function(ctx, color) {
    if (this.x_ < 0 || this.y_ < 0) {
        return;
    }
    var size = this.getSize();
    var radius = (TILE_SIZE * size.height) / 2 - 5;
    ctx.translate(this.x_ * TILE_SIZE + (TILE_SIZE * size.width) / 2,
        this.y_ * TILE_SIZE + (TILE_SIZE * size.height) / 2);
    ctx.rotate(this.angle_);
    ctx.fillStyle = "#000000";
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    if (size.width == size.height) {
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.stroke();
    } else {
        ctx.beginPath();
        var offsetX = (TILE_SIZE * size.width / 2) / 2;
        ctx.arc(-offsetX, 0, radius, 0, 2 * Math.PI, false);
        ctx.arc(offsetX, 0, radius, 0, 2 * Math.PI, false);
        ctx.stroke();
        if (size == Sizes[SizeType.TWO_BY_ONE]) {
            var height = TILE_SIZE - 20;
        } else {
            var height = radius * 2;
        }
        ctx.rect(-offsetX, -height / 2, TILE_SIZE * (size.width / 2), height);
        ctx.fill();
    }
}

Character.prototype.serialize = function() {
    return {
        x: this.x_,
        y: this.y_,
        r: this.rotation_,
        s: this.sizeType_
    }
}

Character.deserialize = function(obj) {
    return new Character(obj.x, obj.y, obj.r, obj.s);
}

Character.prototype.isInTile = function(x, y) {
    var size = this.getSize();
    if (x >= this.x_ &&
        x < this.x_ + size.width &&
        y >= this.y_ &&
        y < this.y_ + size.height) {
        return true;
    }
    return false;
}

Character.prototype.setSizeType = function(sizeType) {
    this.sizeType_ = sizeType;
}

Character.prototype.getSize = function() {
    return Sizes[this.sizeType_];
}

Character.prototype.setName = function(name) {
    this.name_ = name;
}

Character.prototype.getName = function() {
    return this.name_;
}
