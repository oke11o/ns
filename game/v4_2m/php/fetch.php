<?php
// fetch.php
// Файл для получения существующих зданий из базы данных и отправки их в формате JSON

header('Content-Type: application/json');

// Подключение к базе данных
$servername = "localhost";
$username = "georulers_user";
$password = "Ro0tr0oT1!";
$dbname = "georulers_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT id, lat, lng, levels, type, owner FROM buildings";
$result = $conn->query($sql);

$buildings = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $buildings[] = $row;
    }
}

echo json_encode($buildings);

$conn->close();
?>
