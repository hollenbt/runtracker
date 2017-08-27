var directionsDisplay;
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
            center: latlng,
            zoom: 16,
            disableDefaultUI: true
        });
        directionsDisplay = new google.maps.DirectionsRenderer({
            draggable: false,
            preserveViewport: false,
            map: map
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

function loadDateTime(d) {
    var dateString = [
        d.getFullYear(),
        (d.getMonth() + 1).prependZero(),
        d.getDate().prependZero()
    ].join('-');
    var timeString = [
        d.getHours().prependZero(),
        d.getMinutes().prependZero()
    ].join(':');
    startTime.value = dateString + 'T' + timeString;
}

function loadCourse(index) {
    if (activeCourseIndex != undefined)
        courseElements[activeCourseIndex].classList.remove('active');
    activeCourseIndex = index;
    courseElements[activeCourseIndex].classList.add('active');

    map.fitBounds(course[index].route.routes[0].bounds);
    directionsDisplay.setDirections(course[index].route);
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