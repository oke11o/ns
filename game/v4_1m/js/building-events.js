
import { CONFIG } from './config.js';
import { buildings, markers, radiusCircles, addBuilding, updateBuilding, removeBuilding } from './building-data.js';

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
                var buildingData = { id: buildingId, latlng: latlng, levels: levels, type: type };
                addBuilding(buildingData);
            }
        });
}

export function handleBuildingClick(buildingId) {
    var buildingData = buildings[buildingId];
    if (buildingData) {
        updateBuilding(buildingId, { ...buildingData, levels: buildingData.levels + 1 });
    }
}
