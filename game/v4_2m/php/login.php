<?php
// login.php
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
$email = $conn->real_escape_string($data['email']);
$password = $conn->real_escape_string($data['password']);

// Проверка пользователя в базе данных
$sql = "SELECT username, balance FROM users WHERE email='$email' AND password='$password'";
$result = $conn->query($sql);

$response = array();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    $response['success'] = true;
    $response['user'] = $user;
} else {
    $response['success'] = false;
    $response['message'] = "Invalid email or password";
}

echo json_encode($response);

$conn->close();
?>
