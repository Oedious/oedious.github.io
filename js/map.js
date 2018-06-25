var MapType = {
	INDOOR: "indoor",
	OUTDOOR: "outdoor",
	INDOOR_OUTDOOR: "indoorOutdoor",
}

var Map = function(json) {
	this.name = json.name;
	this.set = json.set;
	this.source = json.source ? json.source : json.set;
	this.width = json.width;
	this.height = json.height;
	this.type = json.type;
	this.date = json.date ? json.date : "";
	this.tiles = [];
	this.special = json.special ? json.special : [];
	// Add Tiles.
	for (var y = 0; y < this.height; ++y) {
		for (var x = 0; x < this.width; ++x) {
			var jsonTile = json.rows[y].tiles[x];
			if (!jsonTile.terrain && json.defaultTerrain) {
				jsonTile.terrain = json.defaultTerrain;
			}
			if (!jsonTile.elevation && json.defaultElevation) {
				jsonTile.elevation = json.defaultElevation;
			}
			if (!jsonTile.type) {
				jsonTile.type = json.defaultType ? json.defaultType : this.type;
			}
			this.tiles.push(new Tile(x, y, jsonTile));
		}
	}
	// Add Edges to Tiles.
	for (var y = 0; y < this.height; ++y) {
		for (var x = 0; x < this.width; ++x) {
			var tile = this.getTile(x, y);
			// Add Left edge.
			this.tryAddEdge(tile, this.getTile(x - 1, y), EdgeType.LEFT);
			// Add Right edge.
			this.tryAddEdge(tile, this.getTile(x + 1, y), EdgeType.RIGHT);
			// Add Top edge.
			this.tryAddEdge(tile, this.getTile(x, y - 1), EdgeType.TOP);
			// Add Bottom edge.
			this.tryAddEdge(tile, this.getTile(x, y + 1), EdgeType.BOTTOM);
		}
	}
	// Add Ramps.
	var ramps = json.ramps ? json.ramps : [];
	for (var i = 0; i < ramps.length; ++i) {
		var ramp = ramps[i];
		var x0 = ramp.x0;
		var y0 = ramp.y0;
		var x1 = ramp.x1;
		var y1 = ramp.y1;
		// Swap variables if needed to ensure (x0, y0) always have the smaller
		// of the two values.
		if (x0 > x1 || y0 > y1) {
			x1 = [x0, x0 = x1][0];
			y1 = [y0, y0 = y1][0];
		}
		if (x0 < x1) {
			if (x0 >= 0 && x0 < this.width) {
				this.tiles[y0 * this.width + x0].addRamp(EdgeType.RIGHT);
			}
			if (x1 >= 0 && x1 < this.width) {
				this.tiles[y1 * this.width + x1].addRamp(EdgeType.LEFT);
			}
		} else {
			if (y0 >= 0 && y0 < this.height) {
				this.tiles[y0 * this.width + x0].addRamp(EdgeType.BOTTOM);
			}
			if (y1 >= 0 && y1 < this.height) {
				this.tiles[y1 * this.width + x1].addRamp(EdgeType.TOP);
			}
		}
	}
	// Add Walls.
	this.walls = json.walls ? json.walls : [];
	for (var i = 0; i < this.walls.length; ++i) {
		var wall = this.walls[i];
		if (!wall.type) {
			wall.type =
				json.defaultWallType ? json.defaultWallType : WallType.NORMAL;
		}
	}
	// Add Ziplines.
	this.ziplines = json.ziplines ? json.ziplines : [];
}

Map.prototype.tryAddEdge = function(tile0, tile1, edgeType) {
	if (this.type == MapType.INDOOR_OUTDOOR &&
		tile0.type == MapType.INDOOR &&
		(tile1 == null || tile1.type == MapType.OUTDOOR)) {
		tile0.addEdge(edgeType, INDOOR_EDGE_COLOR, false);
	}
	if (tile0.elevation > 1 && (tile1 == null || tile0.elevation != tile1.elevation)) {
		tile0.addEdge(edgeType, ELEVATION_EDGE_COLOR, false);
	}
	if (tile0.isStartingZone && (tile1 == null || !tile1.isStartingZone)) {
		tile0.addEdge(edgeType, STARTING_ZONE_EDGE_COLOR, false);
	}
	if (tile0.isStartingZone4p && (tile1 == null || !tile1.isStartingZone4p)) {
		tile0.addEdge(edgeType, STARTING_ZONE_EDGE_COLOR, true);
	}
	if (tile0.terrain != TerrainType.CLEAR &&
		(tile1 == null ||
			tile0.terrain != tile1.terrain ||
			tile0.type != tile1.type ||
			tile0.elevation != tile1.elevation ||
			tile0.isStartingZone != tile1.isStartingZone ||
			tile0.isStartingZone4p != tile1.isStartingZone4p)) {
		var dashedLine = false;
		if (tile0.terrain == TerrainType.SPECIAL2) {
			dashedLine = true;
		}
		tile0.addEdge(edgeType,
			TERRAIN_EDGE_COLORS[this.getTerrainIndex(tile0.terrain)],
			dashedLine);
	}
}

Map.prototype.draw = function(ctx) {
	// Draw Tiles.
	ctx.save();
	for (var i = 0; i < this.tiles.length; ++i) {
		this.tiles[i].draw(ctx);
	}
	ctx.restore();
	// Draw Edges and Ramps. Done in a second pass so that when can overdraw
	// Edges when appropriate.
	ctx.save();
	for (var i = 0; i < this.tiles.length; ++i) {
		this.tiles[i].drawEdges(ctx);
	}
	ctx.restore();
	// Draw the overlay grid.
	ctx.save();
	ctx.strokeStyle = "#222222";
	ctx.lineWidth = 1;
	for (var y = 0; y < this.height; ++y) {
		for (var x = 0; x < this.width; ++x) {
			ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
		}
	}
	ctx.restore();
	// Draw Walls.
	for (var i = 0; i < this.walls.length; ++i) {
		ctx.save();
		this.drawWall(ctx, this.walls[i]);
		ctx.restore();
	}
	// Draw Ziplines.
	for (var i = 0; i < this.ziplines.length; ++i) {
		ctx.save();
		this.drawZipline(ctx, this.ziplines[i]);
		ctx.restore();
	}
}

Map.prototype.drawWall = function(ctx, wall) {
	ctx.lineWidth = WALL_SIZE;
	if (wall.type == WallType.NORMAL) {
		ctx.strokeStyle = NORMAL_WALL_COLOR;
		ctx.lineCap = "round";
	} else if (wall.type == WallType.GLASS) {
		ctx.strokeStyle = GLASS_WALL_COLOR;
		ctx.setLineDash([WALL_SIZE, WALL_SIZE]);
		ctx.lineDashOffset = WALL_SIZE / 2;
	} else if (wall.type == WallType.DOOR) {
		ctx.strokeStyle = DOOR_COLOR;
		ctx.setLineDash([WALL_SIZE, WALL_SIZE]);
		ctx.lineDashOffset = WALL_SIZE / 2;
	} else if (wall.type == WallType.FORCE_FIELD) {
		ctx.strokeStyle = FORCE_FIELD_COLOR;
		ctx.lineCap = "round";
	} else if (wall.type == WallType.CHAIN_LINK_FENCE) {
		ctx.strokeStyle = CHAIN_LINK_FENCE_COLOR;
		ctx.lineCap = "round";
	} else if (wall.type == WallType.LEVEL_SEPARATOR) {
		/** Draw a solid line behind the dashed line. */
		ctx.strokeStyle = NORMAL_WALL_COLOR;
		ctx.lineWidth = WALL_SIZE * 2;
		ctx.beginPath();
		ctx.moveTo(wall.x0 * TILE_SIZE, wall.y0 * TILE_SIZE);
		ctx.lineTo(wall.x1 * TILE_SIZE, wall.y1 * TILE_SIZE);
		ctx.stroke();

		ctx.lineWidth = WALL_SIZE;
		ctx.strokeStyle = LEVEL_SEPARATOR_COLOR;
		ctx.setLineDash([WALL_SIZE, WALL_SIZE]);
		ctx.lineDashOffset = WALL_SIZE / 2;
	}
	ctx.beginPath();
	ctx.moveTo(wall.x0 * TILE_SIZE, wall.y0 * TILE_SIZE);
	ctx.lineTo(wall.x1 * TILE_SIZE, wall.y1 * TILE_SIZE);
	ctx.stroke();
}

Map.prototype.drawZipline = function(ctx, zipline) {
	ctx.strokeStyle = NORMAL_WALL_COLOR;
	ctx.lineCap = "round";
	ctx.lineWidth = 4;
	ctx.beginPath();
	ctx.moveTo(zipline.x0 * TILE_SIZE + TILE_SIZE / 2, zipline.y0 * TILE_SIZE + TILE_SIZE / 2);
	ctx.lineTo(zipline.x1 * TILE_SIZE + TILE_SIZE / 2, zipline.y1 * TILE_SIZE + TILE_SIZE / 2);
	ctx.stroke();
}

Map.prototype.serialize = function() {
	return {};
}

Map.prototype.deserialize = function(obj) {

}

Map.prototype.getTile = function(x, y) {
	if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
		return null;
	}
	return this.tiles[y * this.width + x];
}

Map.prototype.getTerrainIndex = function(terrain) {
	if (terrain == TerrainType.CLEAR) {
		return 0;
	} else if (terrain == TerrainType.HINDERING) {
		return 1;
	} else if (terrain == TerrainType.BLOCKING) {
		return 2;
	} else if (terrain == TerrainType.WATER) {
		return 3;
	} else if (terrain == TerrainType.OBSCURING) {
		return 4;
	} else if (terrain == TerrainType.SPECIAL) {
		return 5;
	} else if (terrain == TerrainType.SPECIAL2) {
		return 6;
	}
}
