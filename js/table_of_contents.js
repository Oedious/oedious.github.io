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

TableOfContents.prototype.applyFilters = function(mapFile) {
    var filterByAge = document.getElementById("selectAge").value;
    var filterByType = document.getElementById("selectType").value;
    var filter16x24 = (document.getElementById("selectSize").value == "16x24");
    this.tocFiltered_ = [];
    for (var i = 0; i < this.toc_.length; ++i) {
        var map = this.toc_[i];
        if (mapFile && mapFile != map.file) {
            continue;
        }
        if (filterByAge != "all" && !(map.age && map.age[filterByAge])) {
            continue;
        }
        if (filterByType != "all" && filterByType != map.type) {
            continue
        }
        if (filter16x24 && !(map.width == 16 && map.height == 24)) {
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
