
let myMap;

function initializeMap() {
    myMap = L.map('map').setView([45.25121430125367, 19.84216153621674], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(myMap);
    myMap.on('click', function(e) { handleMapClick(e); });
}
