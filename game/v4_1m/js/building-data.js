
export let buildings = {};
export let markers = {};
export let radiusCircles = {};
export let userBalance = {
    onHand: 0,
    uncollected: 0
};
export let currentUser = { value: '' }; // Объект для хранения имени текущего пользователя

export function addBuilding(buildingData) {
    let buildingId = buildingData.id;
    buildings[buildingId] = buildingData;

    let marker = L.marker([buildingData.latlng.lat, buildingData.latlng.lng]).addTo(myMap);
    markers[buildingId] = marker;

    let radiusCircle = L.circle([buildingData.latlng.lat, buildingData.latlng.lng], {
        color: 'red',
        radius: 50
    }).addTo(myMap);
    radiusCircles[buildingId] = radiusCircle;
}

export function updateBuilding(buildingId, buildingData) {
    buildings[buildingId] = buildingData;

    let marker = markers[buildingId];
    if (marker) {
        marker.setLatLng([buildingData.latlng.lat, buildingData.latlng.lng]);
    }

    let radiusCircle = radiusCircles[buildingId];
    if (radiusCircle) {
        radiusCircle.setLatLng([buildingData.latlng.lat, buildingData.latlng.lng]);
    }
}

export function removeBuilding(buildingId) {
    delete buildings[buildingId];

    let marker = markers[buildingId];
    if (marker) {
        myMap.removeLayer(marker);
        delete markers[buildingId];
    }

    let radiusCircle = radiusCircles[buildingId];
    if (radiusCircle) {
        myMap.removeLayer(radiusCircle);
        delete radiusCircles[buildingId];
    }
}
