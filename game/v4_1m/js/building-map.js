
import { CONFIG } from './config.js';
import { myMap } from './map-initialization.js';
import { buildings } from './building-init.js';

// Проверка наличия существующего здания с учетом погрешности координат
function getNearestBuilding(latlng) {
    const tolerance = 0.0001; // Допустимая погрешность
    for (const buildingId in buildings) {
        const building = buildings[buildingId];
        if (Math.abs(building.lat - latlng.lat) < tolerance && Math.abs(building.lng - latlng.lng) < tolerance) {
            return building;
        }
    }
    return null;
}

export function handleMapClick(e) {
    var latlng = e.latlng;
    var nearestBuilding = getNearestBuilding(latlng);

    if (!nearestBuilding) {
        alert("There is no building at this location. Please click on an existing building.");
        return;
    }

    // Изменить координаты нового здания на координаты существующего
    var buildingData = {
        id: new Date().getTime(), // уникальный ID для нового здания
        lat: nearestBuilding.lat,
        lng: nearestBuilding.lng,
        // дополнительные данные о здании
    };

    addBuildingMarker({ lat: nearestBuilding.lat, lng: nearestBuilding.lng }, buildingData);
    buildings[buildingData.id] = buildingData;
    // другие действия по добавлению здания
}

export function addBuildingMarker(latlng, buildingData) {
    var marker = L.marker(latlng).addTo(myMap);
    markers[buildingData.id] = marker;
    // additional logic for adding building marker
}

export function loadExistingHouses() {
    // Логика загрузки существующих домов
}
