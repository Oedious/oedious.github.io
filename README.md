This is the HCMaps project. The goal of the project is to standardize a data
format for describing Heroclix maps and to create tools to render them.

Maps are stored in JSON format, with the following fields

"name": The name of the map.
"set": The set with which the map is associated.
"type": One of the following: "indoor", "outdoor" or "indoorOutdoor".
"width": The number of map tiles in the horizontal direction.
"height": The number of map tiles in the vertical direction.
"rows": A two-dimensional array of Tile objects.

Additionally, there are a number of optional fields:
"special": The special rules used by the map.
"defaultType": The default "type" value for a tile. Either "indoor" or
    "outdoor". If not specified, will default to the global "type" value.
"defaultTerrain": The default "terrain" value for a tile. If not specified,
    will default to "clear".
"defaultElevation": The default "elevation" value for a tile. If not specified,
    will default to the value "1".
"ramps": An array of Ramp objects, which are specified by a pair of Tile
    coordinates, with a 0-offset.
"walls": An array of Wall objects, which are specified by a pair of
    coordinates, with a 0-offset. Wall objects may also contain a "type" field
    consisting of one of the following values: "normal", glass" or "door".
    Defaults to "normal".

Each Tile object contains the following fields:
"terrain": The type of terrain for the tile. One of the following values:
    "clear", "hindering", "blocking", "water", "special" or "special2".
    Defaults to "clear", but may be overridden by the global "defaultTerrain"
    value.
"type": The type of the tile. One of the following values: "indoor" or
    "outdoor". Defaults to the global map "type" and "defaultType" values.
"elevation": The elevation of the tile. Must be in the range 1-6. Defaults to
    1, but may be overriden by the global map "defaultElevation" value.
"isStartingZone": Whether or not the tile contains one of the 2-player starting
    zones. May be either true or false. Defaults to false.
    "isStartingZone4p": Whether or not the tile contains one of the 4-player starting
    zones. May be either true or false. Defaults to false.
"label": A structure containing "style" and "text" fields which allow a label
    to be drawn on top of the tile.