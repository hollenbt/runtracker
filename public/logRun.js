var directionsDisplay;
var map;
var latlng;
var course = [];

document.querySelectorAll('.course').forEach(function(item, index) {
    course.push({
        name: item.querySelector('.name').textContent,
        distance: parseInt(item.querySelector('.distance').textContent),
        route: JSON.parse(item.querySelector('.route').textContent)
    });
    item.addEventListener('click', function() {
        loadCourse(index);
    });
});

function initMap() {
    navigator.geolocation.getCurrentPosition(function(position) {
        latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map = new google.maps.Map(document.querySelector('#map'), {
            center: latlng,
            zoom: 16,
            disableDefaultUI: true
        });
        directionsDisplay = new google.maps.DirectionsRenderer({
            draggable: false,
            preserveViewport: false,
            map: map
        });
        if (document.querySelector('.course')) {
            loadCourse(0);
        }
        else alert("You must add a course first.");
    });
}

function loadCourse(index) {
    map.fitBounds(course[index].route.routes[0].bounds);
    directionsDisplay.setDirections(course[index].route);
}