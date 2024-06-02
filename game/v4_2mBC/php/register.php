<?php
// register.php
// Файл для обработки регистрации пользователя

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
$username = $data['username'];
$email = $data['email'];
$password = $data['password'];

// Добавление пользователя в базу данных
$sql = "INSERT INTO users (username, email, password, balance) VALUES ('$username', '$email', '$password', 0)";
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
