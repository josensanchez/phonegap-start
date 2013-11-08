Number.prototype.toRad = function () { return this * Math.PI / 180; }

var geo = {
    watchID : null,
    ultimaPos : null,
    anteriorPos : null,
    positions: [],
    allPoints: [],
    distance : 0,
    speed : 0,
    avgSpeed : 0,
    timeslice: 0,
    heading:0,
    gralHeading:0,
    WatchPosition: function() {
        if (geo.watchID) {
            console.log("Stopped watching position");
            clearWatch();  // sets watchID = null;
        }
        console.log("Watching geolocation . . .");
        var options = { frequency: 3000, maximumAge: 5000, timeout: 3000, enableHighAccuracy: true };
        geo.watchID = navigator.geolocation.watchPosition(geo.wsuccess, geo.wfail, options);
    },
    precision : 10,
    items:0,
    accuratedItems:0,
    position: {lat: -34.58015376211612, lng: -58.41490745544433},
    wsuccess: function (pos){
        alert(pos.coords.latitude);
        geo.position = {lat: pos.coords.latitude, lng: pos.coords.longitude};
    },
    wfail: function (error){
        console.log("Error getting geolocation: code=" + error.code + " message=" + error.message);
    },
    getDistance: function(po1,po2){
        if(po2!=null){
            var R = 6371; // km
            var dLat = (po2.lat - po1.lat).toRad();
            var dLon = (po2.lng - po1.lng).toRad();
            var lat1 = po1.lat.toRad();
            var lat2 = po2.lat.toRad();
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            var d = R * c;
            if(isNaN(d))
                return 0;
            return d;

        }
        return 0;
    }
};

