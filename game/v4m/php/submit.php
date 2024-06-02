<?php
// submit.php
// Файл для сохранения зданий в базу данных

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

// Получение данных из POST-запроса
$data = json_decode(file_get_contents('php://input'), true);

// Отладочная информация
error_log(print_r($data, true));

$id = $data['id'];
$lat = $data['latlng']['lat'];
$lng = $data['latlng']['lng'];
$levels = $data['levels'];
$type = $data['type'];
$owner = $data['owner'];

// Добавление или обновление здания в базе данных
$sql = "INSERT INTO buildings (id, lat, lng, levels, type, owner) VALUES ('$id', '$lat', '$lng', '$levels', '$type', '$owner')
        ON DUPLICATE KEY UPDATE lat='$lat', lng='$lng', levels='$levels', type='$type', owner='$owner'";

$response = array();

if ($conn->query($sql) === TRUE) {
    $response['success'] = true;
} else {
    $response['success'] = false;
    $response['message'] = "Error: " . $sql . "<br>" . $conn->error;
}

echo json_encode($response);

$conn->close();
?>
