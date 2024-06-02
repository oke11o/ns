<?php
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);

$servername = "localhost";
$username = "georulers_user";
$password = "Ro0tr0oT1!";
$dbname = "georulers_db";

$conn = @new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]);
    exit();
}

$sql = "SELECT * FROM buildings";
$result = $conn->query($sql);

$buildings = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $buildings[] = [
            'id' => $row['id'],
            'lat' => $row['lat'],
            'lng' => $row['lng'],
            'type' => $row['type'],
            'levels' => $row['levels'],
            'level' => $row['level'],
            'owner' => $row['owner']
        ];
    }
}

header('Content-Type: application/json');
echo json_encode($buildings);

$conn->close();
?>
