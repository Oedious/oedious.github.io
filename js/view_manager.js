var ViewManager = function(tocPath, filtersPath) {
	M.AutoInit();
	var elem = document.querySelector('.collapsible.expandable');
var instance = M.Collapsible.init(elem, {
  accordion: false
});
    this.touchStartX_ = 0;
    this.touchStartY_ = 0;
    this.touchEndX_ = 0;
    this.touchEndY_ = 0;
    this.scale_ = 1;
    this.translationX_ = 0;
    this.map_ = null;
    this.toc_ = new TableOfContents(tocPath, filtersPath);
    this.mapIndex_ = 0;

	if (tocPath){
		var mapId = this.getParameterByName_("m");
		var serialized = this.getParameterByName_("s");
		if (serialized) {
			mapId = this.deserialize(serialized);
		}
		this.loadTableOfContents_(mapId);
	}
}

ViewManager.prototype.loadAssetFrame = function(shortCode) {
	var frame = document.getElementById("assetFrame")
	frame.src = "/heroclix-roll20-assets/" + shortCode + "/images.html"
}

ViewManager.prototype.loadTableOfContents_ = function(mapId) {
    var mgr = this;
    mgr.toc_.load(function() {
        var index = mgr.toc_.getIndexByMapId(mapId);
        if (index < 0) {
            index = 0;
        }
        mgr.setMap(index);
    });
}

ViewManager.prototype.isLeftNavActive = function() {
    var left = document.getElementById("leftNav").style.left;
    return left == 0 || left == "0px";
}

ViewManager.prototype.toggleLeftNav = function() {
    var nav = document.getElementById("leftNav");
	var main = document.getElementById("main");
	var aLeft = document.getElementById("arrowLeft");
	var aIcon = document.getElementById("arrowIcon");
	var windowWidth = window.innerWidth
    if (nav.style.left == "-300px") {
        nav.style.left = "0px";
		aLeft.style.left = "294px";
		aIcon.style.transform = "rotate(0deg)";
		if(windowWidth >= 601){
			main.style.left = "300px";
		}
    } else {
        nav.style.left = "-300px";
		aLeft.style.left = "-6px";
		aIcon.style.transform = "rotate(180deg)";
		if(windowWidth >= 601) {
			main.style.left = "0px";
		}
    }
}

ViewManager.prototype.toggleRightNav = function() {
    var nav = document.getElementById("rightNav");
    if (nav.style.right == "calc(0% - 250px)") {
        nav.style.right = "0px";
    } else {
        nav.style.right = "calc(0% - 250px)";
    }
}

ViewManager.prototype.loadMap_ = function(mapFile) {
    var loader = new JsonLoader();
    var mgr = this;
    loader.load(mapFile, function(json) {
        mgr.map_ = new HCMap(json);
        document.getElementById("toc" + mgr.mapIndex_).focus();
        mgr.draw();
        mgr.updateUrl();
    });
}

ViewManager.prototype.draw = function() {
    var c = document.getElementById("mapCanvas");
    var left = document.getElementById("left");
    var ctx = c.getContext("2d");
    ctx.save()
    var windowWidth = window.innerWidth;
    if (this.isLeftNavActive()) {
		if(windowWidth >= 601){
			windowWidth -= 300;
		} else {
			windowWidth -= 70;
		}
    }
    const MAX_ZOOM = 2.0;
    const mapWidth = this.map_.width;
    const mapHeight = this.map_.height;
    const windowHeight = window.innerHeight - 88;
    const sx = (windowWidth - 10) / (mapWidth * TILE_SIZE);
    const sy = windowHeight / (mapHeight * TILE_SIZE);
    this.scale_ = Math.min(sx < sy ? sx : sy, MAX_ZOOM);
    c.width = (this.scale_ * mapWidth * TILE_SIZE) + 1
	c.height = (this.scale_ * mapHeight * TILE_SIZE) + 1
    ctx.scale(this.scale_, this.scale_);
    this.map_.draw(ctx);
    ctx.restore();
    document.getElementById("mapHeader").text = this.map_.name;
    const infoElem = document.getElementById("mapInfo");
    if (infoElem) {
        document.getElementById("mapName").innerHTML = this.map_.name;
        document.getElementById("mapSource").innerHTML = this.map_.source;
        document.getElementById("mapSize").innerHTML = "" + mapWidth + " x " + mapHeight;
        document.getElementById("mapDate").innerHTML = this.map_.date;
        var html = "";
        for (var i = 0; i < this.map_.special.length; ++i) {
            html += `<br><div>${this.map_.special[i].replace(/:/gi, ":<br>")}</div>`;
        }
        document.getElementById("mapSpecial").innerHTML = html;
        var mapType;
        if (this.map_.type == "indoor") {
            mapType = "Indoor";
        } else if (this.map_.type == "outdoor") {
            mapType = "Outdoor";
        } else if (this.map_.type == "indoorOutdoor") {
            mapType = "Indoor/Outdoor";
        }
        document.getElementById("mapType").innerHTML = mapType;
    }
}

ViewManager.prototype.serialize = function() {
    var obj = {};
    obj.m = this.getCurrentMapEntry_().id;
    obj.p = [];
    return btoa(JSON.stringify(obj));
}

ViewManager.prototype.deserialize = function(serialized) {
    var obj = JSON.parse(atob(serialized));
    return obj.m;
}

ViewManager.prototype.previousMap = function() {
    --this.mapIndex_;
    if (this.mapIndex_ < 0) {
        this.mapIndex_ = this.toc_.getFilteredSize() - 1;
    }
    document.getElementById("toc" + this.mapIndex_).focus();
    this.loadMap_(this.getCurrentMapEntry_().file);
}

ViewManager.prototype.nextMap = function() {
    ++this.mapIndex_;
    if (this.mapIndex_ >= this.toc_.getFilteredSize()) {
        this.mapIndex_ = 0;
    }
    document.getElementById("toc" + this.mapIndex_).focus();
    this.loadMap_(this.getCurrentMapEntry_().file);
}

ViewManager.prototype.getCurrentMapEntry_ = function() {
    return this.toc_.getFilteredEntry(this.mapIndex_);
}

ViewManager.prototype.setMap = function(index) {
    this.mapIndex_ = index;
    this.loadMap_(this.getCurrentMapEntry_().file);
}

ViewManager.prototype.getParameterByName_ = function(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    var results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

ViewManager.prototype.updateUrl = function() {
    var url = "?m=" + this.getCurrentMapEntry_().id;
    window.history.replaceState(null, null, url);

    // Update the Save As... link.
    var canvas = document.getElementById("mapCanvas");
    var dataUrl = canvas.toDataURL();
    var saveAsButton = document.getElementById("saveAsButton");
    if (saveAsButton) {
        saveAsButton.href = dataUrl;
        var parts = this.getCurrentMapEntry_().file.split("/");
        saveAsButton.download = parts[parts.length - 1].replace(".json", ".png");
    }
}


ViewManager.prototype.applyFilters = function() {
    this.toc_.applyFilters();
    this.toc_.draw();
}
