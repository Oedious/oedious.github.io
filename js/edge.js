var EdgeType = {
	LEFT: 0,
	RIGHT: 1,
	TOP: 2,
	BOTTOM: 3
}

// Edge colors.
var CLEAR_EDGE_COLOR = "#FFFFFF";
var HINDERING_EDGE_COLOR = "#3ACE3A";
var BLOCKING_EDGE_COLOR = "#76491E";
var WATER_EDGE_COLOR = "#1FA9E1";
var OBSCURING_EDGE_COLOR = "#BBBBBB";
var WINDOW_EDGE_COLOR = "#1FA9E1";
var SPECIAL_EDGE_COLOR = "#FF7600";
var TERRAIN_EDGE_COLORS = {
	"clear": CLEAR_EDGE_COLOR,
	"hindering": HINDERING_EDGE_COLOR,
	"blocking": BLOCKING_EDGE_COLOR,
	"water": WATER_EDGE_COLOR,
	"obscuring": OBSCURING_EDGE_COLOR,
	"window": WINDOW_EDGE_COLOR,
	"special": SPECIAL_EDGE_COLOR,
	"special2": SPECIAL_EDGE_COLOR,
};
var STARTING_ZONE_EDGE_COLOR = "#D560A9";
var ELEVATION_EDGE_COLOR = "#FF0000";
var INDOOR_EDGE_COLOR = "#FFFF00";

var MAX_EDGES = 4;

var Edge = function(strokeStyle, dashedLine) {
	this.strokeStyle = strokeStyle;
	this.dashedLine = dashedLine;
}
