var directionsDisplay;
var directionsService;
var geocoder;
var map;
var marker;
var latlng;
var startRunButton = document.querySelector('#startRun');
var cancelButton = document.querySelector('#cancel');
var saveButton = document.querySelector('#saveCourse');
var searchButton = document.querySelector('#searchButton');

function initMap() {
    navigator.geolocation.getCurrentPosition(function(position) {
        latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map = new google.maps.Map(document.querySelector('#map'), {
            center: latlng,
            zoom: 16,
            //gestureHandling: 'cooperative',
            disableDefaultUI: true
        });
        createMarker();
        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer({
            draggable: true,
            preserveViewport: true,
            map: map
        });
        geocoder = new google.maps.Geocoder();
        directionsDisplay.addListener('directions_changed', function() {
            totalDistance(directionsDisplay.getDirections());
        });
        searchButton.addEventListener('click', codeAddress);
        startRunButton.addEventListener('click', startCourse);
        cancelButton.addEventListener('click', cancelCourse);
        saveButton.addEventListener('click', verifyAndSubmitCourse);
    });
}

function codeAddress() {
    var address = document.querySelector('#searchField').value;
    geocoder.geocode({ address: address }, function(results, status) {
        if (status == 'OK') {
            latlng = results[0].geometry.location;
            setLocation();
            marker.setMap(map);
        }
        else alert('Geocode unsuccessful: ' + status);
    });
}

function startCourse() {
    var request = {
        origin: latlng,
        destination: latlng,
        travelMode: 'WALKING'
    };
    directionsService.route(request, function(result, status) {
        if (status == 'OK') {
            directionsDisplay.setMap(map);
            directionsDisplay.setDirections(result);
            marker.setMap(null);
        }
        else alert('Directions request unsuccessful: ' + status);
    });
}

function cancelCourse() {
    directionsDisplay.setMap(null);
    marker.setMap(map);
}

function verifyAndSubmitCourse() {
    var name = document.querySelector('input[name="name"]').value;
    var distance = document.querySelector('input[name="distance"]').value;
    if (name != "") {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/savecourse", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        var queryText = "name=" + name + "&distance=" + distance + "&route=" + JSON.stringify(directionsDisplay.getDirections());
        xhr.send(queryText);

        xhr.addEventListener('load', function() {
            alert(xhr.response);
        }, { once: true });
    }
    else alert("You must give the course a name.");
}

function createMarker() {
    marker = new google.maps.Marker({
        position: latlng,
        draggable: true,
        map: map
    });
    marker.addListener('dragend', function() {
        latlng = marker.getPosition();
        map.setCenter(latlng);
    })
}

function setLocation() {
    map.setCenter(latlng);
    marker.setPosition(latlng);
}

function totalDistance(result) {
    var total = 0;
    var route = result.routes[0];
    for (var i = 0; i < route.legs.length; ++i)
        total += route.legs[i].distance.value;
    total /= 1609.34; // convert meters to miles
    document.querySelector('input[name="distance"]').value = total.toFixed(1);
}