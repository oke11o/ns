<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GeoRulers</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Leaflet.awesome-markers/2.0.2/leaflet.awesome-markers.css" />
    <style>
        #map { height: 500px; }
        #user-details { position: absolute; top: 10px; right: 10px; background: white; padding: 10px; z-index: 1000; }
        #login-form { position: absolute; top: 10px; right: 10px; background: white; padding: 10px; z-index: 1000; }
        #balance { position: absolute; top: 50px; right: 10px; background: white; padding: 10px; z-index: 1000; display: none; }
    </style>
</head>
<body>
    <div id="map"></div>
    <div id="user-details"></div>
    <div id="login-form">
        <input type="text" id="username" placeholder="Username"><br>
        <input type="email" id="email" placeholder="Email"><br>
        <input type="password" id="password" placeholder="Password"><br>
        <button onclick="register()">Register</button>
        <button onclick="login()">Login</button>
    </div>
    <div id="balance"></div>
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Leaflet.awesome-markers/2.0.2/leaflet.awesome-markers.min.js"></script>
    <script>
        let myMap;
        let buildings = {};
        let markers = {};
        let radiusCircles = {};

        function initializeMap() {
            myMap = L.map('map').setView([45.25121430125367, 19.84216153621674], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(myMap);
            myMap.on('click', function(e) { handleMapClick(e); });
            loadExistingHouses();
            setInterval(loadExistingHouses, 5000); // Периодический запрос каждые 5 секунд
        }

        function handleMapClick(e) {
            var latlng = e.latlng;
            var radius = 50;
            var url = `https://overpass-api.de/api/interpreter?data=[out:json];way(around:${radius},${latlng.lat},${latlng.lng})["building"];out body;`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    var elements = data.elements;
                    if (elements.length > 0) {
                        var building = elements[0];
                        var buildingId = building.id;
                        var levels = building.tags['building:levels'] || 1;
                        var type = building.tags['building'];
                        var buildingData = { id: buildingId, latlng: latlng, levels: levels, type: type, level: 1 };
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

        function buildObject(buildingId, type) {
            var building = buildings[buildingId];
            building.type = type;
            building.owner = document.getElementById('user-details').innerText;
            saveBuilding(building);
            myMap.closePopup();
        }

        function saveBuilding(building) {
            fetch('submit.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(building)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Building saved:', data);
                buildings[building.id] = building; // Обновление локального хранилища
                updateMapWithBuilding(building); // Обновление карты
            })
            .catch(error => { console.error('Error saving building:', error); });
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
                    ${building.type === 'commercial' ? '<p id="market-reach">Market Reach: calculating...</p>' : ''}
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
            var popupContent = `
                <div>
                    <h4>${building.type}</h4>
                    <p>Levels: ${building.levels}</p>
                    <p>Owner: ${building.owner}</p>
                    <p>Market Reach: ${housesInRadius} houses</p>
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

        function loadExistingHouses() {
            fetch('fetch.php')
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

        document.addEventListener('DOMContentLoaded', function() {
            initializeMap();
        });

        function register() {
            var username = document.getElementById('username').value;
            var email = document.getElementById('email').value;
            var password = document.getElementById('password').value;
            console.log('Registering user:', { username, email, password });
            fetch('register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            })
            .then(response => {
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                return response.text().then(text => {
                    console.log('Response text:', text);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return JSON.parse(text);
                });
            })
            .then(data => {
                console.log('Response data:', data);
                if (data.success) {
                    document.getElementById('user-details').innerHTML = "User registered: " + email;
                    updateUIForLoggedInUser(username, 0);
                } else {
                    document.getElementById('user-details').innerHTML = "Error: " + data.message;
                }
            })
            .catch(error => {
                console.error('Registration error:', error);
                document.getElementById('user-details').innerHTML = "Error: " + error;
            });
        }

        function login() {
            var email = document.getElementById('email').value;
            var password = document.getElementById('password').value;
            console.log('Logging in user:', { email, password });
            fetch('login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            .then(response => {
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                return response.text().then(text => {
                    console.log('Response text:', text);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return JSON.parse(text);
                });
            })
            .then(data => {
                console.log('Response data:', data);
                if (data.success) {
                    var user = data.user;
                    document.getElementById('user-details').innerHTML = "User logged in: " + user.email;
                    updateUIForLoggedInUser(user.username, user.balance);
                } else {
                    document.getElementById('user-details').innerHTML = "Error: " + data.message;
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                document.getElementById('user-details').innerHTML = "Error: " + error;
            });
        }

        function logout() {
            document.getElementById('user-details').innerHTML = "User logged out";
            document.getElementById('login-form').style.display = 'block';
            document.getElementById('balance').style.display = 'none';
        }

        function updateUIForLoggedInUser(username, balance) {
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('user-details').innerHTML += ` | ${username} <button onclick="logout()">Logout</button>`;
            document.getElementById('balance').style.display = 'block';
            document.getElementById('balance').innerHTML = `Balance: ${balance}`;
        }
    </script>
</body>
</html>
