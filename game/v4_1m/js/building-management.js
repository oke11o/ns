
import { CONFIG } from './config.js';
import { myMap } from './map-initialization.js';
import { updateBalance } from './user-authentication.js';
import { handleMapClick, handleBuildingClick } from './building-events.js';
import { buildings, markers, radiusCircles, userBalance, currentUser, addBuilding, updateBuilding, removeBuilding } from './building-data.js';

myMap.on('click', handleMapClick);
