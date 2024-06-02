import { CONFIG } from './config.js';
import { myMap } from './map-initialization.js';

let buildings = {};
let markers = {};
let radiusCircles = {};
let userBalance = {
    onHand: 0,
    uncollected: 0
};

export function handleMapClick(e) {
    var latlng = e.latlng;
    var radius = 50;
    var url = `${CONFIG.overpassApiUrl}way(around:${radius},${latlng.lat},${latlng.lng})["building"];out body;`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            var elements = data.elements;
            if (elements.length > 0) {
                var building = elements[0];
                var buildingId = building.id;
                var levels = building.tags['building:levels'] || 1;
                var type = building.tags['building'];
                var buildingData = { id: buildingId, latlng: latlng, levels: levels, type: type, level: 1, profit: 0 };
                buildings[buildingId] = buildingData;
                showConstructionMenu(latlng, buildingData);
            } else {
                console.log("No buildings found in radius.");
            }
        })
        .catch(error => { console.error('Error fetching building data:', error); });
}

function showConstructionMenu(latlng, buildingData) {
    var popupContent = `
        <div>
            <h4>Build on this location</h4>
            <button onclick="buildObject(${buildingData.id}, 'residential')">Residential</button>
            <button onclick="buildObject(${buildingData.id}, 'commercial')">Commercial</button>
        </div>
    `;
    L.popup().setLatLng(latlng).setContent(popupContent).openOn(myMap);
}

export function buildObject(buildingId, type) {
    var building = buildings[buildingId];
    building.type = type;
    building.owner = document.getElementById('user-details').innerText;
    saveBuilding(building);
    myMap.closePopup();
}

function saveBuilding(building) {
    fetch(CONFIG.submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(building)
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.text().then(text => {
            console.log('Response text:', text);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return JSON.parse(text);
        });
    })
    .then(data => {
        console.log('Building saved:', data);
        buildings[building.id] = building; // Обновление локального хранилища
        updateMapWithBuilding(building); // Обновление карты
    })
    .catch(error => {
        console.error('Error saving building:', error);
    });
}

function getMarkerIcon(type, level) {
    var color = type === 'commercial' ? 'blue' : 'green';
    var icon = L.AwesomeMarkers.icon({
        icon: 'building',
        markerColor: color,
        prefix: 'fa'
    });
    return icon;
}

function updateMapWithBuilding(building) {
    if (markers[building.id]) {
        myMap.removeLayer(markers[building.id]);
        if (radiusCircles[building.id]) {
            myMap.removeLayer(radiusCircles[building.id]);
        }
    }
    var latlng = building.latlng || [building.lat, building.lng]; // Используем latlng, если доступно, иначе lat и lng
    var markerIcon = getMarkerIcon(building.type, building.level);
    var marker = L.marker(latlng, { icon: markerIcon }).addTo(myMap);
    marker.bindPopup(`
        <div>
            <h4>${building.type}</h4>
            <p>Levels: ${building.levels}</p>
            <p>Owner: ${building.owner}</p>
            <p>Profit: $${building.profit}</p>
            ${building.type === 'commercial' ? '<p id="market-reach">Market Reach: calculating...</p>' : ''}
            ${building.type === 'commercial' ? '<button onclick="collectProfit(${building.id})">Collect Profit</button>' : ''}
        </div>
    `);
    markers[building.id] = marker; // Сохранение маркера

    if (building.type === 'commercial') {
        marker.on('click', function() {
            showCommercialRadius(building.id);
        });
    }

    marker.on('popupopen', function() {
        if (building.type === 'commercial') {
            showCommercialRadius(building.id);
        }
    });

    marker.on('popupclose', function() {
        if (radiusCircles[building.id]) {
            myMap.removeLayer(radiusCircles[building.id]);
        }
    });
}

function showCommercialRadius(buildingId) {
    if (radiusCircles[buildingId]) {
        myMap.removeLayer(radiusCircles[buildingId]);
    }
    var building = buildings[buildingId];
    var radius = 100; // Радиус действия коммерческой недвижимости
    var latlng = building.latlng || [building.lat, building.lng];
    var circle = L.circle(latlng, {
        color: 'blue',
        fillColor: '#30f',
        fillOpacity: 0.2,
        radius: radius
    }).addTo(myMap);
    radiusCircles[buildingId] = circle;
    var housesInRadius = countHousesInRadius(latlng, radius);
    building.profit = housesInRadius;
    var popupContent = `
        <div>
            <h4>${building.type}</h4>
            <p>Levels: ${building.levels}</p>
            <p>Owner: ${building.owner}</p>
            <p>Market Reach: ${housesInRadius} houses</p>
            <p>Profit: $${building.profit}</p>
            <button onclick="collectProfit(${building.id})">Collect Profit</button>
        </div>
    `;
    markers[building.id].setPopupContent(popupContent);
}

function countHousesInRadius(center, radius) {
    var count = 0;
    for (var id in buildings) {
        if (buildings[id].type === 'residential') {
            var distance = myMap.distance(center, buildings[id].latlng || [buildings[id].lat, buildings[id].lng]);
            if (distance <= radius) {
                count++;
            }
        }
    }
    return count;
}

export function loadExistingHouses() {
    fetch(CONFIG.fetchUrl)
    .then(response => response.json())
    .then(data => {
        console.log('Fetched buildings:', data);
        data.forEach(building => {
            if (!building.lat || !building.lng) {
                console.error('Invalid building data:', building);
                return;
            }
            if (!buildings[building.id]) {
                buildings[building.id] = building;
                updateMapWithBuilding(building); // Обновление карты новыми зданиями
            }
        });
    })
    .catch(error => { console.error('Error fetching buildings:', error); });
}

function collectProfit(buildingId) {
    var building = buildings[buildingId];
    userBalance.uncollected += building.profit;
    building.profit = 0;
    updateMapWithBuilding(building);
    updateUserBalanceDisplay();
}

function updateUserBalanceDisplay() {
    document.getElementById('balance').innerHTML = `On Hand: $${userBalance.onHand} | Uncollected: $${userBalance.uncollected}`;
}

// Функция для периодического начисления прибыли
function accumulateProfit() {
    setInterval(() => {
        for (let id in buildings) {
            let building = buildings[id];
            if (building.type === 'commercial') {
                building.profit += countHousesInRadius(building.latlng, 100) * building.level;
                updateMapWithBuilding(building);
            }
        }
        updateUserBalanceDisplay();
    }, 60000); // Каждую минуту
}

// Начинаем накопление прибыли при загрузке страницы
accumulateProfit();

// Экспортируем функции, которые будут использоваться глобально
window.buildObject = buildObject;
window.handleMapClick = handleMapClick;
window.showConstructionMenu = showConstructionMenu;
window.collectProfit = collectProfit;
