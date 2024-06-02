<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GeoRulers</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Leaflet.awesome-markers/2.0.2/leaflet.awesome-markers.css" />
    <link rel="stylesheet" href="style.css" />
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
    <script src="initializeMap.js"></script>
    <script src="mapHandlers.js"></script>
    <script src="userAuth.js"></script>
    <script src="utils.js"></script>
    <script>
        initializeMap();
    </script>
</body>
</html>
