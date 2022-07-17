var TableOfContents = function() {
    this.toc_ = [];
    this.tocFiltered_ = [];
	this.filters = [];
}

TableOfContents.prototype.load = function(callback) {
    var loader = new JsonLoader();
    var self = this;
	loader.load("filters.json", function(json) {
		self.filters = json;
	});
    loader.load("maps/table_of_contents.json", function(json) {
        self.toc_ = json.maps;
        self.applyFilters();
        self.draw();
        callback();
    });
}

TableOfContents.prototype.applyFilters = function() {
    var filterByAge = document.getElementById("selectAge").value;
    var filterByType = document.getElementById("selectType").value;
    var filterBySize = document.getElementById("selectSize").value;
	var filterByName = document.getElementById("name_search").value.toLowerCase();
	var hasLocationBonus = document.getElementById("hasLocationBonus").checked;
	var filterBlocking = document.getElementById("blocking").checked;
	var filterBlockingHas = document.getElementById("hasBlocking").checked;
	document.getElementById("hasBlocking").disabled=!filterBlocking;
	document.getElementById("notHasBlocking").disabled=!filterBlocking;
	var filterHindering = document.getElementById("hindering").checked;
	var filterHinderingHas = document.getElementById("hasHindering").checked;
	document.getElementById("hasHindering").disabled=!filterHindering;
	document.getElementById("notHasHindering").disabled=!filterHindering;
	var filterWater = document.getElementById("water").checked;
	var filterWaterHas = document.getElementById("hasWater").checked;
	document.getElementById("hasWater").disabled=!filterWater
	document.getElementById("notHasWater").disabled=!filterWater
	var filterElevated = document.getElementById("elevated").checked;
	var filterElevatedHas = document.getElementById("hasElevated").checked;
	document.getElementById("hasElevated").disabled=!filterElevated
	document.getElementById("notHasElevated").disabled=!filterElevated
	var filterWalls = document.getElementById("walls").checked;
	var filterWallsHas = document.getElementById("hasWalls").checked;
	document.getElementById("hasWalls").disabled=!filterWalls
	document.getElementById("notHasWalls").disabled=!filterWalls
    this.tocFiltered_ = [];
    for (var i = 0; i < this.toc_.length; ++i) {
        var map = this.toc_[i];
        if (filterByAge != "all" && !(map.age && map.age[filterByAge])) {
            continue;
        }
        if (filterByType != "all" && !this.filters.types[filterByType].includes(map.id)) {
            continue
        }
        if (filterBySize != "all" && !this.filters.sizes[filterBySize].includes(map.id)) {
            continue;
        }
		if (filterByName != "" && !(map.name.toLowerCase().includes(filterByName))) {
			continue;
		}
		if (hasLocationBonus && !this.filters['locationBonus'].includes(map.id)) {
			continue;
		}
		if (filterBlocking && this.filters.terrain['blocking'].includes(map.id) != filterBlockingHas) {
			continue;
		}
		if (filterHindering && this.filters.terrain['hindering'].includes(map.id) != filterHinderingHas) {
			continue;
		}
		if (filterWater && this.filters.terrain['water'].includes(map.id) != filterWaterHas) {
			continue;
		}
		if (filterElevated && this.filters.terrain['elevation'].includes(map.id) != filterElevatedHas) {
			continue;
		}
		if (filterWalls && this.filters.terrain['walls'].includes(map.id) != filterWallsHas) {
			continue;
		}
        this.tocFiltered_.push(map);
    }
}

TableOfContents.prototype.draw = function() {
    var html = "";
    var currentSet = "";
    for (var i = 0; i < this.tocFiltered_.length; ++i) {
        var map = this.tocFiltered_[i];
        if (currentSet != map.set) {
			if(currentSet != ""){
				html += "</ul>"
			}
            html += "<ul><li><h6>" + map.set + "</h6></li>";
            currentSet = map.set;
        }
		html += "<li class=\"mapLink\" " + "id='toc" + i + "'>"
        html += "<a href='' " +
            "onclick='mgr.setMap(" + i +
            "); return false;'>" +
            map.name + "</a></li>";
    }
	html += "</ul"
    document.getElementById("tableOfContents").innerHTML = html;
}

TableOfContents.prototype.getFilteredEntry = function(index) {
    return this.tocFiltered_[index];
}

TableOfContents.prototype.getFilteredSize = function() {
    return this.tocFiltered_.length;
}

TableOfContents.prototype.getIndexByMapId = function(mapId) {
    if (mapId) {
        for (var i = 0; i < this.tocFiltered_.length; ++i) {
            if (mapId == this.tocFiltered_[i].id) {
                return i;
            }
        }
    }
    return -1;
}
