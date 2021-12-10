var TILE_SIZE = 64;
var EDGE_SIZE = TILE_SIZE / 16;

var TerrainType = {
	CLEAR: "clear",
	HINDERING: "hindering",
	BLOCKING: "blocking",
	WATER: "water",
	OBSCURING: "obscuring",
	WINDOW: "window",
	SPECIAL: "special",
	SPECIAL2: "special2",
};

// Tile colors.
var HINDERING_TILE_COLOR = "#B4ECB4";
var BLOCKING_TILE_COLOR = "#c9b8aa";
var WATER_TILE_COLOR = "#dee8eb";
var OBSCURING_TILE_COLOR = "#E8E8E8"
var WINDOW_TILE_COLOR = "#dee8eb";
var SPECIAL_TILE_COLOR = "#FFD394";
var STARTING_ZONE_TILE_COLOR = "#fff8fa";
var ELEVATION_TILE_COLORS = [
	"#FFFFFF",
	"#FB7A7F",
	"#D0424C",
	"#B02020",
	"#902020",
	"#702020"
];

var Tile = function(x, y, jsonTile) {
	this.x = x;
	this.y = y;
	this.terrain = jsonTile.terrain == null ? TerrainType.CLEAR : jsonTile.terrain;
	this.type = jsonTile.type;
	this.elevation = jsonTile.elevation == null ? 1 : jsonTile.elevation;
	this.isStartingZone = jsonTile.isStartingZone;
	this.isStartingZone4p = jsonTile.isStartingZone4p;
	this.label = jsonTile.label;
	this.edges = [];
	for (var i = 0; i < 4 * MAX_EDGES; ++i) {
		this.edges.push(null);
	}
	this.ramps = [false, false, false, false];
	this.fillStyle = "#FFFFFF";
	if (this.terrain == TerrainType.HINDERING) {
		this.fillStyle = HINDERING_TILE_COLOR;
	}
	else if (this.terrain == TerrainType.BLOCKING) {
		this.fillStyle = BLOCKING_TILE_COLOR;
	}
	else if (this.terrain == TerrainType.WATER) {
		this.fillStyle = WATER_TILE_COLOR;
	}
	else if (this.terrain == TerrainType.OBSCURING) {
		this.fillStyle = OBSCURING_TILE_COLOR;
	}
	else if (this.terrain == TerrainType.WINDOW) {
		this.fillStyle = WINDOW_TILE_COLOR;
	}
	else if (this.terrain == TerrainType.SPECIAL ||
		this.terrain == TerrainType.SPECIAL2) {
		this.fillStyle = SPECIAL_TILE_COLOR;
	}
	else if (this.isStartingZone || this.isStartingZone4p) {
		this.fillStyle = STARTING_ZONE_TILE_COLOR;
	}
	else {
		this.fillStyle = ELEVATION_TILE_COLORS[this.elevation - 1];
	}
}

Tile.prototype.addEdge = function(edgeType, strokeStyle, dashedLine) {
	while (this.edges[edgeType]) {
		edgeType += 4;
	}
	this.edges[edgeType] = new Edge(strokeStyle, dashedLine);
}

Tile.prototype.hasEdge = function(edgeType) {
	while (edgeType >= 0) {
		if (this.edges[edgeType]) {
			return true;
		}
		edgeType -= 4;
	}
	return false;
}

Tile.prototype.addRamp = function(edgeType) {
	this.ramps[edgeType] = true;
}

Tile.prototype.draw = function(ctx) {
	// Draw the basic tile.
	ctx.fillStyle = this.fillStyle;
	ctx.fillRect(this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

Tile.prototype.drawEdges = function(ctx) {
	var edgeLevels = [-1, -1, -1, -1];
	for (var i = 0; i < MAX_EDGES; ++i) {
		for (var j = 0; j < 4; ++j)
			if (this.edges[4 * i + j]) {
				edgeLevels[j] = i;
			}
	}
	for (var i = 0; i < 4; ++i) {
		// Draw left edge.
		this.drawEdge(ctx, EdgeType.LEFT, edgeLevels[EdgeType.LEFT]--);
		// Draw right edge.
		this.drawEdge(ctx, EdgeType.RIGHT, edgeLevels[EdgeType.RIGHT]--);
		// Draw top edge.
		this.drawEdge(ctx, EdgeType.TOP, edgeLevels[EdgeType.TOP]--);
		// Draw bottom edge.
		this.drawEdge(ctx, EdgeType.BOTTOM, edgeLevels[EdgeType.BOTTOM]--);
	}
	this.drawRamps(ctx);
	this.drawLabel(ctx);
}

Tile.prototype.drawEdge = function(ctx, edgeType, level) {
	if (edgeType >= 0 && level >= 0 && this.edges[edgeType + level * 4]) {
		var x0 = 0;
		var y0 = 0;
		var x1 = 0;
		var y1 = 0;
		var lineDashOffset = 0;
		var overhangSize = EDGE_SIZE * (level + 1);
		var overhangLeft =
			this.hasEdge(EdgeType.LEFT + level * 4) ? 0 : overhangSize;
		var overhangRight =
			this.hasEdge(EdgeType.RIGHT + level * 4) ? 0 : overhangSize;
		var overhangTop =
			this.hasEdge(EdgeType.TOP + level * 4) ? 0 : overhangSize;
		var overhangBottom =
			this.hasEdge(EdgeType.BOTTOM + level * 4) ? 0 : overhangSize;
		switch (edgeType) {
			case EdgeType.LEFT:
				x0 = this.x * TILE_SIZE + EDGE_SIZE / 2 + EDGE_SIZE * level;
				y0 = this.y * TILE_SIZE - overhangTop;
				x1 = this.x * TILE_SIZE + EDGE_SIZE / 2 + EDGE_SIZE * level;
				y1 = (this.y + 1) * TILE_SIZE + overhangBottom;
				lineDashOffset = overhangTop;
				break;
			case EdgeType.RIGHT:
				x0 = (this.x + 1) * TILE_SIZE - EDGE_SIZE / 2 - EDGE_SIZE * level;
				y0 = this.y * TILE_SIZE - overhangTop;
				x1 = (this.x + 1) * TILE_SIZE - EDGE_SIZE / 2 - EDGE_SIZE * level;
				y1 = (this.y + 1) * TILE_SIZE + overhangBottom;
				lineDashOffset = overhangTop;
				break;
			case EdgeType.TOP:
				x0 = this.x * TILE_SIZE - overhangLeft;
				y0 = this.y * TILE_SIZE + EDGE_SIZE / 2 + EDGE_SIZE * level;
				x1 = (this.x + 1) * TILE_SIZE + overhangRight;
				y1 = this.y * TILE_SIZE + EDGE_SIZE / 2 + EDGE_SIZE * level;
				lineDashOffset = overhangLeft;
				break;
			case EdgeType.BOTTOM:
				x0 = this.x * TILE_SIZE - overhangLeft;
				y0 = (this.y + 1) * TILE_SIZE - EDGE_SIZE / 2 - EDGE_SIZE * level;
				x1 = (this.x + 1) * TILE_SIZE + overhangRight;
				y1 = (this.y + 1) * TILE_SIZE - EDGE_SIZE / 2 - EDGE_SIZE * level;
				lineDashOffset = overhangLeft;
				break;
		}
		var edge = this.edges[edgeType + level * 4];
		ctx.strokeStyle = edge.strokeStyle;
		ctx.lineWidth = EDGE_SIZE;
		if (edge.dashedLine) {
			ctx.setLineDash([EDGE_SIZE, EDGE_SIZE]);
			ctx.lineDashOffset = lineDashOffset;
		}
		ctx.beginPath();
		ctx.moveTo(x0, y0);
		ctx.lineTo(x1, y1);
		ctx.stroke();
		ctx.setLineDash([]);
	}
}

Tile.prototype.drawRamps = function(ctx) {
	if (this.ramps[EdgeType.RIGHT]) {
		this.drawRamp(ctx, Math.PI * 3 / 2);
	}
	if (this.ramps[EdgeType.LEFT]) {
		this.drawRamp(ctx, Math.PI / 2);
	}
	if (this.ramps[EdgeType.TOP]) {
		this.drawRamp(ctx, Math.PI);
	}
	if (this.ramps[EdgeType.BOTTOM]) {
		this.drawRamp(ctx, 0);
	}
}

Tile.prototype.drawRamp = function(ctx, angle) {
	// Draw the triangle.
	ctx.save();
	ctx.translate(this.x * TILE_SIZE + TILE_SIZE / 2,
		this.y * TILE_SIZE + TILE_SIZE / 2);
	ctx.rotate(angle);
	ctx.beginPath();
	ctx.moveTo(0, EDGE_SIZE);
	ctx.lineTo(-(TILE_SIZE / 2 - EDGE_SIZE * 2), TILE_SIZE / 2 - EDGE_SIZE);
	ctx.lineTo(TILE_SIZE / 2 - EDGE_SIZE * 2, TILE_SIZE / 2 - EDGE_SIZE);
	ctx.closePath();
	ctx.lineWidth = EDGE_SIZE * 2;
	ctx.strokeStyle = ELEVATION_EDGE_COLOR;
	ctx.stroke();
	ctx.fillStyle = ELEVATION_TILE_COLORS[1];
	ctx.fill();
	// Draw the text containing the elevation.
	ctx.font = "20px Arial";
	ctx.fillStyle = "#000000";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(this.elevation, 0, TILE_SIZE / 4 + 4);
	ctx.restore();
}

Tile.prototype.drawLabel = function(ctx) {
	// Draw the column letter and/or row number.
	if (this.x == 0 || this.y == 0 || this.label) {
		var text = "";
		ctx.save();
		ctx.translate(
			this.x * TILE_SIZE + TILE_SIZE / 2,
			this.y * TILE_SIZE + TILE_SIZE / 2);
		if (this.label) {
			text = this.label.text;
			ctx.fillStyle = ELEVATION_EDGE_COLOR;
			var rotation = this.label.rotate ? this.label.rotate : 0;
			ctx.rotate(rotation * Math.PI / 180);
		}
		else {
			if (this.y == 0) {
				text = String.fromCharCode("A".charCodeAt(0) + this.x);
			}
			if (this.x == 0) {
				text += this.y + 1;
			}
			ctx.fillStyle = "#000000";
		}
		ctx.font = "30px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(text,
			0,
			0);
		ctx.restore();
	}
}
