var directionsDisplay;
var directionsService;
var map;
var latlng;
var course = [];
var courseElements = document.querySelectorAll('.course');
var activeCourseIndex;
var start = document.querySelector('#startTime');
var duration = document.querySelector('#duration');
var logButton = document.querySelector('#log');

Number.prototype.prependZero = function() {
    if (this < 10 && this >= 0)
        return "0" + String(this);
    return String(this);
}

courseElements.forEach(function(item, index) {
    course.push({
        name: item.querySelector('.name').textContent,
        distance: Number(item.querySelector('.distance').textContent),
        route: JSON.parse(item.querySelector('.route').textContent)
    });
    item.addEventListener('click', function() {
        loadCourse(index);
    });
});

loadDateTime(new Date());

function initMap() {
    navigator.geolocation.getCurrentPosition(function(position) {
        latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map = new google.maps.Map(document.querySelector('#map'), {
            'center': latlng,
            'zoom': 15,
            'disableDefaultUI': true
        });
        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer({
            'draggable': false,
            'preserveViewport': false,
            'map': map
        });
        if (courseElements.length) {
            loadCourse(0);
            logButton.addEventListener('click', verifyAndLogRun);
        }
        else {
            alert("You haven't added any courses yet.");
            logButton.addEventListener('click', function() {
                alert("You must add a course first.");
            });
        }
    });
}

function loadDateTime(date) {
    var d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    var s = d.toISOString();
    startTime.value = s.slice(0, s.length - 8);
}

function loadCourse(index) {
    if (activeCourseIndex != undefined)
        courseElements[activeCourseIndex].classList.remove('active');
    activeCourseIndex = index;
    courseElements[activeCourseIndex].classList.add('active');

    var c = course[index].route;
    var waypoints = [];
    c.waypoints.forEach(function(wp) {
        waypoints.push({
            'location': new google.maps.LatLng(wp.lat, wp.lng),
            'stopover': false
        });
    });

    var request = {
        'origin': new google.maps.LatLng(c.start.lat, c.start.lng),
        'destination': new google.maps.LatLng(c.end.lat, c.end.lng),
        'waypoints': waypoints,
        'travelMode': 'WALKING'
    };

    directionsService.route(request, function(result, status) {
        if (status == 'OK')
            directionsDisplay.setDirections(result);
        else alert('Directions request unsuccessful: ' + status);
    });
}

function verifyAndLogRun() {
    var dateVal = Date.parse(startTime.value);
    if (!isNaN(dateVal)) {
        if (duration.value) {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/logrun", true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            var queryText = "date=" + dateVal + "&distance=" + course[activeCourseIndex].distance + "&duration=" + duration.value;
            xhr.send(queryText);

            xhr.addEventListener('load', function() {
                alert(xhr.response);
                if (xhr.response == "Run logged successfully.")
                    duration.value = null;
            }, { once: true });
        }
        else alert("Please specify the run duration.");
    }
    else alert("Invalid date and time entered.");
}