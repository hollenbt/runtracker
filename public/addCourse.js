var directionsDisplay;
var directionsService;
var geocoder;
var map;
var marker;
var latlng;
var searchButton = document.querySelector('#searchButton');
var startRunButton = document.querySelector('#startRun');
var cancelButton = document.querySelector('#cancel');
var saveButton = document.querySelector('#saveCourse');
var resetBtn = document.querySelector('#resetBtn');

function initMap() {
    navigator.geolocation.getCurrentPosition(function(position) {
        latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map = new google.maps.Map(document.querySelector('#map'), {
            'center': latlng,
            'zoom': 15,
            'disableDefaultUI': true
        });
        createMarker();
        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer({
            'draggable': true,
            'preserveViewport': true,
            'map': map
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
        'origin': latlng,
        'destination': latlng,
        'travelMode': 'WALKING'
    };
    directionsService.route(request, function(result, status) {
        if (status == 'OK') {
            directionsDisplay.setMap(map);
            directionsDisplay.setDirections(result);
            marker.setMap(null);
            startRunButton.setAttribute('disabled', "");
            cancelButton.removeAttribute('disabled');
        }
        else alert('Directions request unsuccessful: ' + status);
    });
}

function cancelCourse() {
    directionsDisplay.setMap(null);
    document.querySelector('input[name="distance"]').value = 0;
    marker.setMap(map);
    cancelButton.setAttribute('disabled', "");
    startRunButton.removeAttribute('disabled');
}

function verifyAndSubmitCourse() {
    var name = document.querySelector('input[name="name"]').value;
    var distance = document.querySelector('input[name="distance"]').value;
    if (directionsDisplay.getDirections()) {
        if (name) {
            var directionData = extractDirectionData(directionsDisplay.getDirections());

            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/savecourse", true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            var queryText = "name=" + name + "&distance=" + distance + "&route=" + JSON.stringify(directionData);
            xhr.send(queryText);

            xhr.addEventListener('load', function() {
                alert(xhr.response);
                if (xhr.response == "Course saved successfully.") {
                    cancelCourse();
                    resetBtn.click();
                }
            }, { once: true });
        }
        else alert("You must give the course a name.");
    }
    else alert("You must first map a course to save.");
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

function extractDirectionData(directions) {
    var data = {};
    var leg = directions.routes[0].legs[0];
    var wp = leg.via_waypoints;
    data.start = {
        'lat': leg.start_location.lat(),
        'lng': leg.start_location.lng()
    };
    data.end = {
        'lat': leg.end_location.lat(),
        'lng': leg.end_location.lng()
    };
    data.waypoints = [];
    wp.forEach(function(item, index) {
        data.waypoints.push({
            'lat': item.lat(),
            'lng': item.lng()
        });
    });
    return data;
}