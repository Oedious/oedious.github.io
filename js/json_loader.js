var JsonLoader = function() {}

JsonLoader.prototype.load = function(location, callback) {
  var request = new XMLHttpRequest();
  request.overrideMimeType("application/json");
  request.open('GET', location, true);
  request.onreadystatechange = function() {
    if (request.readyState == 4 && request.status == "200") {
      var json;
      try {
        json = JSON.parse(request.responseText);
      } catch (e) {
        alert(e);
      }
      callback(json);
    }
  };
  request.send(null);
}
