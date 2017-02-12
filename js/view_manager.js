var ViewManager = function() {
    this.scale_ = 1;
    this.translationX_ = 0;
    this.map_ = null;
    this.toc_ = new TableOfContents();
    this.mapIndex_ = 0;
    this.players_ = [
        new Player("Player 1"),
        new Player("Player 2")
    ];
    this.currentPlayer_ = 0;
    this.openPanel(null, 'mapsTab', 'mapsPanel');

    var serialized = this.getParameterByName_("s");
    var mapFile = null;
    if (serialized) {
        mapFile = this.deserialize(serialized);
    }
    this.loadTableOfContents_(mapFile);
}

ViewManager.prototype.loadTableOfContents_ = function(mapFile) {
    var mgr = this;
    mgr.toc_.load(function() {
        mgr.toc_.applyFilters(mapFile);
        mgr.toc_.draw();
        mgr.setMap(0);
    });
}

ViewManager.prototype.toggleNav = function() {
    var nav = document.getElementById("sideNav");
    if (nav.style.left != "0px") {
        nav.style.left = "0px";
    } else {
        nav.style.left = "-210px";
    }
}

ViewManager.prototype.openPanel = function(event, tabName, panelName) {
    var panels = document.getElementsByClassName("panel");
    for (var i = 0; i < panels.length; ++i) {
        panels[i].style.display = "none";
    }
    document.getElementById(panelName).style.display = "block";

    var tabs = document.getElementsByClassName("tab");
    for (var i = 0; i < tabs.length; ++i) {
        tabs[i].style.backgroundColor = "";
    }
    document.getElementById(tabName).style.backgroundColor = "#ccc";
}

ViewManager.prototype.onMouseDown = function(event) {
    var canvas = document.getElementById("mapCanvas");
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    x /= this.scale_;
    y /= this.scale_;
    x -= this.translationX_;
    x = Math.floor(x / TILE_SIZE);
    y = Math.floor(y / TILE_SIZE);
    if (this.toggleCharacter_(x, y)) {
        this.draw();
    }
}

ViewManager.prototype.loadMap_ = function(mapFile) {
    var loader = new JsonLoader();
    var mgr = this;
    loader.load(mapFile, function(json) {
        mgr.map_ = new Map(json);
        document.getElementById("toc" + mgr.mapIndex_).focus();
        mgr.draw();
    });
}

ViewManager.prototype.draw = function() {
    var c = document.getElementById("mapCanvas");
    var left = document.getElementById("left");
    var ctx = c.getContext("2d");
    ctx.save()
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight - 70;
    var mapScale = document.getElementById("selectZoom").value;
    if (mapScale <= 0) {
        c.width = windowWidth;
        c.height = windowHeight;
        var sx = c.width / (this.map_.width * TILE_SIZE);
        var sy = c.height / (this.map_.height * TILE_SIZE);
        this.scale_ = sx < sy ? sx : sy;
        this.translationX_ = (c.width / this.scale_ - this.map_.width * TILE_SIZE) / 2;
        ctx.scale(this.scale_, this.scale_);
        ctx.translate(this.translationX_, 0);
    } else if (mapScale >= 1) {
        c.width = this.map_.width * TILE_SIZE;
        c.height = this.map_.height * TILE_SIZE;
        this.scale_ = 1;
        this.translationX_ = 0;
    } else {
        c.width = Math.max(windowWidth, this.map_.width * TILE_SIZE * mapScale);
        c.height = this.map_.height * TILE_SIZE * mapScale;
        this.scale_ = mapScale;
        this.translationX_ = (c.width / this.scale_ - this.map_.width * TILE_SIZE) / 2;
        ctx.scale(this.scale_, this.scale_);
        ctx.translate(this.translationX_, 0);
    }
    this.map_.draw(ctx);
    ctx.restore();
    for (var i = 0; i < this.players_.length; ++i) {
        this.players_[i].draw(ctx);
    }
    document.getElementById("mapHeader").innerHTML = this.map_.name;
    document.getElementById("mapName").innerHTML = this.map_.name;
    document.getElementById("mapSet").innerHTML = this.map_.set;
    document.getElementById("mapSize").innerHTML = "" + this.map_.width + " x " + this.map_.height;
    document.getElementById("mapSpecial").innerHTML = this.map_.special.replace(/:/gi, ":<br>");
    document.getElementById("mapSpecial2").innerHTML = this.map_.special2.replace(/:/gi, ":<br>");
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

ViewManager.prototype.serialize = function() {
    var obj = {};
    obj.m = this.getCurrentMapEntry_().file;
    obj.p = [];
    for (var i = 0; i < this.players_.length; ++i) {
        obj.p.push(this.players_[i].serialize());
    }
    return btoa(JSON.stringify(obj));
}

ViewManager.prototype.deserialize = function(serialized) {
    var obj = JSON.parse(atob(serialized));
    this.players_ = [];
    for (var i = 0; i < obj.p.length; ++i) {
        this.players_.push(Player.deserialize(obj.p[i]));
    }
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

ViewManager.prototype.generateLink = function() {
    var url = window.location.href;
    var pageName = "index.html"
    var baseUrl = url.substring(0, url.indexOf(pageName) + pageName.length);
    var serialized = this.serialize();
    var link = baseUrl + "?s=" + serialized;
    document.getElementById("link").value = link;
}

ViewManager.prototype.applyFilters = function() {
    this.toc_.applyFilters();
    this.toc_.draw();
}

ViewManager.prototype.toggleCharacter_ = function(x, y) {
    if (x >= 0 && y >= 0 && x < this.map_.width && y < this.map_.height) {
        for (var i = 0; i < this.players_.length; ++i) {
            var player = this.players_[i];
            var character = player.findCharacter(x, y);
            if (character) {
                player.removeCharacter(character);
                return true;
            }
        }
        this.getCurrentPlayer_().addCharacter(
            new Character(x, y, 0, SizeType.ONE_BY_ONE));
        return true;
    }
    return false;
}

ViewManager.prototype.getCurrentPlayer_ = function() {
    return this.players_[this.currentPlayer_];
}
