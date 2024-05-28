// Инициализация карты
var map = L.map('map').setView([51.505, -0.09], 13);

// Установка слоя OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

// Определение текущей локации пользователя
map.locate({setView: true, maxZoom: 16});

map.on('locationfound', function(e) {
    var radius = e.accuracy / 2;
    L.marker(e.latlng).addTo(map)
        .bindPopup("Вы находитесь в радиусе " + radius + " метров от этой точки").openPopup();
    getBuildingInfo(e.latlng);
});

// Обработка клика по карте
map.on('click', function(e) {
    var latlng = e.latlng;
    getBuildingInfo(latlng);
});

// Объект для хранения данных о зданиях
var buildings = {};
var markers = {};

// Функция для получения информации о здании
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
                    buildings[buildingId] = {
                        levels: levels,
                        type: "неизвестно",
                        level: 1,
                        latlng: latlng
                    };
                }

                showBuildingOptions(latlng, buildingId);
                addBuildingIcon(buildingId);
            } else {
                L.popup()
                    .setLatLng(latlng)
                    .setContent("Нет информации о здании")
                    .openOn(map);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

// Функция для отображения вариантов действий с объектом
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
    L.popup()
        .setLatLng(latlng)
        .setContent(content)
        .openOn(map);
}

// Функция для отображения вариантов коммерческих объектов
function showCommercialOptions(buildingId, lat, lng) {
    var content = `
        <div>
            <button onclick="rebuildBuilding('${buildingId}', '${lat}', '${lng}', 'магазин')">Магазин</button>
            <button onclick="rebuildBuilding('${buildingId}', '${lat}', '${lng}', 'офис')">Офис</button>
            <button onclick="rebuildBuilding('${buildingId}', '${lat}', '${lng}', 'ресторан')">Ресторан</button>
        </div>
    `;
    L.popup()
        .setLatLng([lat, lng])
        .setContent(content)
        .openOn(map);
}

// Функция для обработки перестройки здания
function rebuildBuilding(buildingId, lat, lng, type) {
    buildings[buildingId].type = type;
    buildings[buildingId].level = 1;
    addBuildingIcon(buildingId);
    alert(`Здание по координатам (${lat}, ${lng}) будет перестроено в ${type} здание первого уровня.`);
    getBuildingInfo({lat: parseFloat(lat), lng: parseFloat(lng)});
}

// Функция для добавления иконок зданий на карту
function addBuildingIcon(buildingId) {
    var building = buildings[buildingId];
    var iconUrl = building.type === 'жилое' ? 'home.jpg' : 'kiosk.jpg';
    
    if (building.type !== 'неизвестно') {
        var icon = L.icon({
            iconUrl: iconUrl,
            iconSize: getIconSize(), // задаем размер иконки в зависимости от масштаба
            iconAnchor: [16, 32], // точка привязки, соответствующая нижней точке иконки
            popupAnchor: [0, -32] // точка, откуда всплывающее окно должно исходить относительно иконки
        });

        if (markers[buildingId]) {
            map.removeLayer(markers[buildingId]);
        }

        markers[buildingId] = L.marker(building.latlng, { icon: icon }).addTo(map);
    }
}

// Функция для получения размера иконки в зависимости от масштаба
function getIconSize() {
    var zoom = map.getZoom();
    var size = zoom * 2; // меняем коэффициент в зависимости от желаемого масштаба иконки
    return [size, size];
}

// Обновление иконок при изменении масштаба карты
map.on('zoomend', function() {
    for (var buildingId in markers) {
        addBuildingIcon(buildingId);
    }
});
