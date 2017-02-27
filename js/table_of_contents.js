var TableOfContents = function() {
    this.toc_ = [];
    this.tocFiltered_ = [];
}

TableOfContents.prototype.load = function(callback) {
    var loader = new JsonLoader();
    var self = this;
    loader.load("maps/table_of_contents.json", function(json) {
        self.toc_ = json.maps;
        callback();
    });
}

TableOfContents.prototype.applyFilters = function(mapId) {
    var filterByAge = document.getElementById("selectAge").value;
    var filterByType = document.getElementById("selectType").value;
    var filterBySize = document.getElementById("selectSize").value;
    var filterWidth = 0;
    var filterHeight = 0;
    if (filterBySize == "8x8") {
        filterWidth = 16;
        filterHeight = 24;
    } else if (filterBySize == "16x24") {
        filterWidth = 16;
        filterHeight = 24;
    } else if (filterBySize == "24x24") {
        filterWidth = 24;
        filterHeight = 24;
    }
    this.tocFiltered_ = [];
    for (var i = 0; i < this.toc_.length; ++i) {
        var map = this.toc_[i];
        if (mapId && mapId != map.id) {
            continue;
        }
        if (filterByAge != "all" && !(map.age && map.age[filterByAge])) {
            continue;
        }
        if (filterByType != "all" && filterByType != map.type) {
            continue
        }
        if (filterBySize != "all" && !(map.width == filterWidth && map.height == filterHeight)) {
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
            if (currentSet != "") {
                html += "<br>"
            }
            html += "<div style=\"font-weight:bold;\">" + map.set + "</div>";
            currentSet = map.set;
        }
        html += "<a href='' id='toc" + i +
            "' onclick='mgr.setMap(" + i +
            "); return false;'>" +
            map.name + "</a>";
    }
    document.getElementById("tableOfContents").innerHTML = html;
}

TableOfContents.prototype.getFilteredEntry = function(index) {
    return this.tocFiltered_[index];
}

TableOfContents.prototype.getFilteredSize = function() {
    return this.tocFiltered_.length;
}
