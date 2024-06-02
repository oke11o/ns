import { CONFIG } from './config.js';
import { handleMapClick, loadExistingHouses } from './building-management.js';

export let myMap;

export function initializeMap() {
    myMap = L.map('map').setView(CONFIG.mapCenter, CONFIG.mapZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(myMap);
    myMap.on('click', function(e) { handleMapClick(e); });
    loadExistingHouses();
    setInterval(loadExistingHouses, 5000); // Периодический запрос каждые 5 секунд
}
