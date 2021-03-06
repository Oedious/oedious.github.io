var ViewManager = function() {
    this.touchStartX_ = 0;
    this.touchStartY_ = 0;
    this.touchEndX_ = 0;
    this.touchEndY_ = 0;
    this.zoom_ = 100;
    this.scale_ = 1;
    this.translationX_ = 0;
    this.map_ = null;
    this.toc_ = new TableOfContents();
    this.mapIndex_ = 0;
    this.players_ = [
        new Player("Player 1", ColorType.RED),
        new Player("Player 2", ColorType.BLUE)
    ];
    this.currentPlayer_ = 0;
    this.openPanel("leftNav", "mapsTab", "mapsPanel");
    this.openPanel("rightNav", "player0Tab", "player0Panel", 0);

    var mapId = this.getParameterByName_("m");
    var serialized = this.getParameterByName_("s");
    if (serialized) {
        mapId = this.deserialize(serialized);
    }
    this.loadTableOfContents_(mapId);

    for (var i = 0; i < this.players_.length; ++i) {
        var player = this.players_[i];
        document.getElementById("player" + i + "Name").value = player.getName();
        document.getElementById("player" + i + "Color").selectedIndex = player.getColorType();
        player.drawCharacterList(i);
    }
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
    if (nav.style.left == "-250px") {
        nav.style.left = "0px";
    } else {
        nav.style.left = "-250px";
    }
    this.draw();
}

ViewManager.prototype.toggleRightNav = function() {
    var nav = document.getElementById("rightNav");
    if (nav.style.right == "calc(0% - 250px)") {
        nav.style.right = "0px";
    } else {
        nav.style.right = "calc(0% - 250px)";
    }
}

ViewManager.prototype.openPanel = function(navName, tabName, panelName, playerNumber) {
    var nav = document.getElementById(navName);
    var panels = nav.getElementsByClassName("panel");
    for (var i = 0; i < panels.length; ++i) {
        panels[i].style.display = "none";
    }
    document.getElementById(panelName).style.display = "block";

    var tabs = nav.getElementsByClassName("tab");
    for (var i = 0; i < tabs.length; ++i) {
        tabs[i].style.backgroundColor = "";
    }
    document.getElementById(tabName).style.backgroundColor = "#ccc";

    if (navName == "rightNav") {
        this.currentPlayer_ = playerNumber;
    }
}

ViewManager.prototype.onMouseDown = function(event) {
    /*
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
        this.drawCharacterList();
        this.draw();
    }
    */
}

ViewManager.prototype.onFocusOut = function(elementId) {
    var element = document.getElementById(elementId);
    if (element.id == "player0Name") {
        this.players_[0].setName(element.value);
    } else if (element.id == "player1Name") {
        this.players_[1].setName(element.value);
    } else if (element.id == "player0Color") {
        this.players_[0].setColor(element.value);
        this.draw();
    } else if (element.id == "player1Color") {
        this.players_[1].setColor(element.value);
        this.draw();
    }
}

ViewManager.prototype.onTouchStart = function(event) {
    this.touchStartX_ = event.changedTouches[0].screenX;
    this.touchStartY_ = event.changedTouches[0].screenY;
}

ViewManager.prototype.onTouchEnd = function(event) {
    const limit = Math.tan(45 * 1.5 / 180 * Math.PI);
    const threshold = 20;
    var x = event.changedTouches[0].screenX - this.touchStartX_;
    var y = event.changedTouches[0].screenY - this.touchStartY_;
    this.touchStartX_ = this.touchStartY_ = 0;
    var xy = Math.abs(x / y);
    var yx = Math.abs(y / x);
    if (Math.abs(x) > threshold || Math.abs(y) > threshold) {
        if (yx <= limit) {
            if (x < 0) {
                this.nextMap();
            } else {
                this.previousMap();
            }
        }
    }
}

ViewManager.prototype.loadMap_ = function(mapFile) {
    var loader = new JsonLoader();
    var mgr = this;
    loader.load(mapFile, function(json) {
        mgr.map_ = new Map(json);
        document.getElementById("toc" + mgr.mapIndex_).focus();
        mgr.draw();
        mgr.updateUrl();
    });
}

ViewManager.prototype.zoomIn = function() {
    if (this.zoom_ < 200) {
        this.zoom_ += 25;
        this.draw();
    }
}

ViewManager.prototype.zoomOut = function() {
    if (this.zoom_ > 25) {
        this.zoom_ += -25;
        this.draw();
    }
}

ViewManager.prototype.draw = function() {
    var c = document.getElementById("mapCanvas");
    var left = document.getElementById("left");
    var ctx = c.getContext("2d");
    ctx.save()
    var windowWidth = window.innerWidth;
    if (this.isLeftNavActive()) {
        windowWidth -= 250;
    }
    var windowHeight = window.innerHeight - 88;
    c.width = windowWidth;
    c.height = windowHeight;
    var sx = (c.width - 10) / (this.map_.width * TILE_SIZE);
    var sy = c.height / (this.map_.height * TILE_SIZE);
    this.scale_ = (sx < sy ? sx : sy) * (this.zoom_ / 100.0);
    this.translationX_ = (c.width / this.scale_ - this.map_.width * TILE_SIZE) / 2;
    ctx.scale(this.scale_, this.scale_);
    ctx.translate(this.translationX_, 0);
    this.map_.draw(ctx);
    ctx.restore();
    for (var i = 0; i < this.players_.length; ++i) {
        this.players_[i].draw(ctx);
    }
    document.getElementById("mapHeader").innerHTML = this.map_.name;
    document.getElementById("mapName").innerHTML = this.map_.name;
    document.getElementById("mapSource").innerHTML = this.map_.source;
    document.getElementById("mapSize").innerHTML = "" + this.map_.width + " x " + this.map_.height;
    document.getElementById("mapDate").innerHTML = this.map_.date;
    var html = "";
    for (var i = 0; i < this.map_.special.length; ++i) {
        html += "<br><div>" + this.map_.special[i].replace(/:/gi, ":<br>") + "</div>";
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
    document.getElementById("mapHeaderType").innerHTML = mapType;
}

ViewManager.prototype.drawCharacterList = function() {
    this.getCurrentPlayer_().drawCharacterList(this.currentPlayer_);
}

ViewManager.prototype.serialize = function() {
    var obj = {};
    obj.m = this.getCurrentMapEntry_().id;
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

ViewManager.prototype.updateUrl = function() {
    var url = "?m=" + this.getCurrentMapEntry_().id;
    window.history.replaceState(null, null, url);

    // Update the Save As... link.
    var canvas = document.getElementById("mapCanvas");
    var dataUrl = canvas.toDataURL();
    var saveAsButton = document.getElementById("saveAsButton");
    saveAsButton.href = dataUrl;
    var parts = this.getCurrentMapEntry_().file.split("/");
    saveAsButton.download = parts[parts.length - 1].replace(".json", ".png");
}


ViewManager.prototype.applyFilters = function() {
    this.toc_.applyFilters();
    this.toc_.draw();
}

ViewManager.prototype.applyColor = function() {
    this.getCurrentPlayer_().setColorType(
        document.getElementById("player" + this.currentPlayer_ + "Color").value);
}

ViewManager.prototype.applySizeType = function(characterIndex) {
    var sizeType = document.getElementById("player" + this.currentPlayer_ + "Character" + characterIndex + "SizeType").value;
    this.getCurrentPlayer_().getCharacter(characterIndex).setSizeType(sizeType);
    this.draw();
}

ViewManager.prototype.addCharacter = function() {
    this.getCurrentPlayer_().addCharacter(new Character());
    this.drawCharacterList();
}

ViewManager.prototype.removeCharacter = function(characterIndex) {
    this.getCurrentPlayer_().removeCharacter(characterIndex);
    this.drawCharacterList();
    this.draw();
}

ViewManager.prototype.startCharacterDrag = function(playerIndex, characterIndex) {}

ViewManager.prototype.toggleCharacter_ = function(x, y) {
    /*
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
            new Character(x, y, 0, CharacterSizeType.ONE_BY_ONE));
        return true;
    }
    return false;
    */
}

ViewManager.prototype.getCurrentPlayer_ = function() {
    return this.players_[this.currentPlayer_];
}
