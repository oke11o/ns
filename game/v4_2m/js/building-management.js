import { CONFIG } from './config.js';
import { myMap } from './map-initialization.js';
import { updateBalance } from './user-authentication.js';

let buildings = {};
let markers = {};
let radiusCircles = {};
export let userBalance = {
    onHand: 0,
    uncollected: 0
};
export let currentUser = { value: '' }; // Объект для хранения имени текущего пользователя

function getBuildingCenter(building) {
    if (building.nodes && building.nodes.length > 0) {
        var nodeIds = building.nodes;
        var nodePromises = nodeIds.map(nodeId => fetchNode(nodeId));

        return Promise.all(nodePromises)
            .then(nodes => {
                var lat = nodes.reduce((sum, node) => sum + node.lat, 0) / nodes.length;
                var lon = nodes.reduce((sum, node) => sum + node.lon, 0) / nodes.length;
                if (isNaN(lat) || isNaN(lon)) {
                    throw new Error('Invalid LatLng object: (' + lat + ', ' + lon + ')');
                }
                return { lat, lng: lon };
            })
            .catch(error => {
                console.error('Error fetching nodes:', error);
                throw error;
            });
    } else {
        throw new Error('No nodes found for building');
    }
}

function fetchNode(nodeId) {
    var url = `${CONFIG.overpassApiUrl}node(${nodeId});out body;`;
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            var node = data.elements[0];
            if (node) {
                return { lat: node.lat, lon: node.lon };
            } else {
                throw new Error('Node not found');
            }
        });
}







export function handleMapClick(e) {
    var latlng = e.latlng;
    var radius = 50; // Увеличен радиус поиска зданий
    var url = `${CONFIG.overpassApiUrl}way(around:${radius},${latlng.lat},${latlng.lng})["building"];out body;`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            var elements = data.elements;
            if (elements.length > 0) {
                var nearestBuilding = elements[0];
                console.log('Nearest building data:', nearestBuilding);
                return getBuildingCenter(nearestBuilding)
                    .then(nearestBuildingLatLng => {
                        var nearestBuildingId = nearestBuilding.id;
                        var levels = nearestBuilding.tags['building:levels'] || 1;
                        var type = nearestBuilding.tags['building'];
                        var buildingData = { id: nearestBuildingId, latlng: nearestBuildingLatLng, levels: levels, type: type, level: 1, profit: 0, owner: currentUser.value };
                        buildings[nearestBuildingId] = buildingData;
                        showConstructionMenu(nearestBuildingLatLng, buildingData);
                    })
                    .catch(error => {
                        console.error('Error processing building data:', error);
                    });
            } else {
                console.log("No buildings found within 50 meters.");
            }
        })
        .catch(error => { console.error('Error fetching building data:', error); });
}






function showConstructionMenu(latlng, buildingData) {
    var popupContent = `
        <div>
            <h4>Построить на этом месте</h4>
            <button onclick="buildObject(${buildingData.id}, 'residential')">Жилое здание</button>
            <button onclick="buildObject(${buildingData.id}, 'commercial')">Коммерческое здание</button>
        </div>
    `;
    L.popup().setLatLng(latlng).setContent(popupContent).openOn(myMap);
}






export function buildObject(buildingId, type) {
    var building = buildings[buildingId];
    building.type = type;
    building.owner = currentUser.value;
    saveBuilding(building);
    myMap.closePopup();
}

function saveBuilding(building) {
    fetch(CONFIG.submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(building)
    })
    .then(response => response.text())
    .then(text => {
        console.log('Save Building Response:', text);
        try {
            const data = JSON.parse(text);
            if (data.success) {
                console.log('Building saved:', data);
                buildings[building.id] = building; // Обновление локального хранилища
                updateMapWithBuilding(building); // Обновление карты
            } else {
                console.error('Error saving building:', data.message);
            }
        } catch (error) {
            console.error('Save Building JSON Parse Error:', error);
        }
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
            ${building.type === 'commercial' ? `<button onclick="collectProfit(${building.id})">Collect Profit</button>` : ''}
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
            var latlng = buildings[id].latlng || [buildings[id].lat, buildings[id].lng];
            var distance = myMap.distance(center, latlng);
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

export function collectProfit(buildingId) {
    var building = buildings[buildingId];
    if (building.owner === currentUser.value) {
        userBalance.onHand += building.profit;
        building.profit = 0;
        updateMapWithBuilding(building);
        updateUserBalanceDisplay();
        updateBalance(currentUser.value, userBalance.onHand);
    } else {
        alert("You can only collect profit from your own buildings.");
    }
}

export function updateUserBalanceDisplay() {
    userBalance.uncollected = 0;
    for (let id in buildings) {
        let building = buildings[id];
        if (building.owner === currentUser.value && building.type === 'commercial') {
            userBalance.uncollected += building.profit;
        }
    }
    document.getElementById('balance').innerHTML = `On Hand: $${userBalance.onHand.toFixed(2)} | Uncollected: $${userBalance.uncollected.toFixed(2)}`;
}

// Функция для периодического начисления прибыли
function accumulateProfit() {
    setInterval(() => {
        for (let id in buildings) {
            let building = buildings[id];
            if (building.type === 'commercial') {
                var latlng = building.latlng || [building.lat, building.lng];
                building.profit += countHousesInRadius(latlng, 100) * building.level;
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
window.updateUserBalanceDisplay = updateUserBalanceDisplay;
