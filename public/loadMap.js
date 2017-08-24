var directionsDisplay;
var directionsService;
var geocoder;
var map;
var marker;
var latlng;
var saved;
var startRunButton = document.querySelector('#startRun');
var cancelButton = document.querySelector('#cancel');
var saveButton = document.querySelector('#saveRoute');
var loadSavedButton = document.querySelector('#loadSavedRoute');
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
        startRunButton.addEventListener('click', startRoute);
        cancelButton.addEventListener('click', cancelRoute);
        saveButton.addEventListener('click', function() {
            saved = directionsDisplay.getDirections();
        });
        loadSavedButton.addEventListener('click', function() {
            latlng = saved.routes[0].legs[0].start_location;
            setLocation();
            directionsDisplay.setMap(map);
            directionsDisplay.setDirections(saved);
            marker.setMap(null);            
        });
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

function startRoute() {
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

function cancelRoute() {
    directionsDisplay.setMap(null);
    marker.setMap(map);
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
    document.querySelector('#distance').textContent = total.toFixed(1) + ' mi';
}