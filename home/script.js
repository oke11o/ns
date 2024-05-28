// Firebase configuration
var firebaseConfig = {
	apiKey: "AIzaSyAk68Jk6DvWUZAlGfu-tOKmC45fo1sX18w",
    authDomain: "voroshilovdo-39efc.firebaseapp.com",
    projectId: "voroshilovdo-39efc",
    storageBucket: "voroshilovdo-39efc.appspot.com",
    messagingSenderId: "859981515674",
    appId: "1:859981515674:web:c4a6120186614d24a78823"

};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

// Инициализация карты
var map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
map.locate({ setView: true, maxZoom: 16 });

map.on('locationfound', function(e) {
    L.marker(e.latlng).addTo(map).bindPopup("Вы здесь").openPopup();
});

map.on('click', function(e) {
    hideInfo();
    getBuildingInfo(e.latlng);
});

var buildings = {};
var markers = {};
var circles = {};

// Load buildings from Firestore
function loadBuildings() {
    db.collection("buildings").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            var building = doc.data();
            var buildingId = doc.id;
            buildings[buildingId] = building;
            addBuildingIcon(buildingId);
        });
    });
}

loadBuildings();

function saveBuilding(buildingId, buildingData) {
    db.collection("buildings").doc(buildingId).set(buildingData);
}

function getBuildingInfo(latlng) {
    var url = `https://overpass-api.de/api/interpreter?data=[out:json];way(around:50,${latlng.lat},${latlng.lng})["building"];out body;>;out skel qt;`;
    axios.get(url)
        .then(function (response) {
            var data = response.data;
            if (data.elements.length > 0) {
                var building = data.elements[0];
                var buildingId = building.id;
                var levels = building.tags["building:levels"] || "Неизвестно";
                if (!buildings[buildingId]) {
                    buildings[buildingId] = { levels: levels, type: "неизвестно", level: 1, latlng: latlng };
                }
                showBuildingOptions(latlng, buildingId);
                addBuildingIcon(buildingId);
            } else {
                L.popup().setLatLng(latlng).setContent("Нет информации о здании").openOn(map);
            }
        })
        .catch(console.log);
}

function showBuildingOptions(latlng, buildingId) {
    var building = buildings[buildingId];
    var content = `
        <div>
            <p>Этажность: ${building.levels}</p>
            <p>Текущий тип: ${building.type}</p>
            <p>Уровень: ${building.level}</p>
            <button onclick="rebuildBuilding('${buildingId}', '${latlng.lat}', '${latlng.lng}', 'жилое')">Перестроить в жилое</button>
            <button onclick="showCommercialOptions('${buildingId}', '${latlng.lat}', '${latlng.lng}')">Перестроить в коммерческое</button>
        </div>
    `;
    L.popup().setLatLng(latlng).setContent(content).openOn(map);
}

function showCommercialOptions(buildingId, lat, lng) {
    var content = `
        <div>
            <button onclick="rebuildBuilding('${buildingId}', '${lat}', '${lng}', 'магазин')">Магазин</button>
            <button onclick="rebuildBuilding('${buildingId}', '${lat}', '${lng}', 'офис')">Офис</button>
            <button onclick="rebuildBuilding('${buildingId}', '${lat}', '${lng}', 'ресторан')">Ресторан</button>
        </div>
    `;
    L.popup().setLatLng([lat, lng]).setContent(content).openOn(map);
}

function rebuildBuilding(buildingId, lat, lng, type) {
    buildings[buildingId].type = type;
    buildings[buildingId].level = 1;
    addBuildingIcon(buildingId);
    saveBuilding(buildingId, buildings[buildingId]);
    alert(`Здание по координатам (${lat}, ${lng}) будет перестроено в ${type} здание первого уровня.`);
    getBuildingInfo({ lat: parseFloat(lat), lng: parseFloat(lng) });
}

function addBuildingIcon(buildingId) {
    var building = buildings[buildingId];
    var iconUrl = building.type === 'жилое' ? 'home.jpg' : 'kiosk.jpg';
    if (building.type !== 'неизвестно') {
        var icon = L.icon({
            iconUrl: iconUrl,
            iconSize: getIconSize(),
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
        if (markers[buildingId]) {
            map.removeLayer(markers[buildingId]);
        }
        markers[buildingId] = L.marker(building.latlng, { icon: icon }).addTo(map)
            .on('click', function(e) {
                e.originalEvent.stopPropagation();
                hideInfo();
                showBuildingRadius(buildingId);
                showInfo(buildingId);
            });
    }
}

function getIconSize() {
    var zoom = map.getZoom();
    return [zoom * 2, zoom * 2];
}

map.on('zoomend', function() {
    for (var buildingId in markers) {
        addBuildingIcon(buildingId);
    }
});

function showBuildingRadius(buildingId) {
    var building = buildings[buildingId];
    if (building.type !== 'неизвестно') {
        var radius = building.type === 'жилое' ? 0 : 100;
        if (circles[buildingId]) {
            map.removeLayer(circles[buildingId]);
        }
        circles[buildingId] = L.circle(building.latlng, {
            color: 'blue',
            fillColor: '#30f',
            fillOpacity: 0.2,
            radius: radius
        }).addTo(map);
    }
}

function showInfo(buildingId) {
    var building = buildings[buildingId];
    var latlng = building.latlng;
    var url = `https://overpass-api.de/api/interpreter?data=[out:json];way(around:100,${latlng.lat},${latlng.lng})["building"];out body;>;out skel qt;`;
    axios.get(url)
        .then(function (response) {
            var data = response.data;
            var numberOfHouses = data.elements.length;
            var infoContent = `
                <h4>Информация об объекте</h4>
                <p>Этажность: ${building.levels}</p>
                <p>Тип: ${building.type}</p>
                <p>Уровень: ${building.level}</p>
                <p>Количество домов в радиусе: ${numberOfHouses}</p>
            `;
            var infoDiv = document.getElementById('info');
            infoDiv.innerHTML = infoContent;
            infoDiv.style.display = 'block';
        })
        .catch(console.log);
}

function hideInfo() {
    var infoDiv = document.getElementById('info');
    infoDiv.style.display = 'none';
    for (var circleId in circles) {
        map.removeLayer(circles[circleId]);
    }
}
