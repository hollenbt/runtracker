function initMap() {
    navigator.geolocation.getCurrentPosition(function(position) {
        var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var map = new google.maps.Map(document.querySelector('#map'), {
            center: latlng,
            zoom: 16,
            disableDefaultUI: true
        });
        var marker = new google.maps.Marker({
            position: latlng,
            map: map
        });
    });
}