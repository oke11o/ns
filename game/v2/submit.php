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

$postData = file_get_contents('php://input');
error_log("Received POST data: " . $postData);

$data = json_decode($postData, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    error_log("Invalid JSON: " . json_last_error_msg());
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Invalid JSON: ' . json_last_error_msg()]);
    exit();
}

$buildingId = $conn->real_escape_string($data['id']);
$lat = $conn->real_escape_string($data['latlng']['lat']);
$lng = $conn->real_escape_string($data['latlng']['lng']);
$type = $conn->real_escape_string($data['type']);
$levels = $conn->real_escape_string($data['levels']);
$level = $conn->real_escape_string($data['level']);
$owner = $conn->real_escape_string($data['owner']);

$sql = "INSERT INTO buildings (id, lat, lng, type, levels, level, owner) VALUES ('$buildingId', '$lat', '$lng', '$type', '$levels', '$level', '$owner')
        ON DUPLICATE KEY UPDATE type='$type', levels='$levels', level='$level', owner='$owner'";

$response = [];
if ($conn->query($sql) === TRUE) {
    $response['success'] = true;
    $response['message'] = "Building saved successfully";
} else {
    error_log("Error: " . $sql . " - " . $conn->error);
    $response['success'] = false;
    $response['message'] = "Error: " . $sql . " - " . $conn->error;
}

header('Content-Type: application/json');
echo json_encode($response);
error_log("Response: " . json_encode($response));

$conn->close();
?>
