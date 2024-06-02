<?php
// Включение отчетов об ошибках
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING); // Подавление предупреждений

// Подключение к базе данных
$servername = "localhost";
$username = "georulers_user";
$password = "Ro0tr0oT1!";
$dbname = "georulers_db";

// Создание соединения
$conn = @new mysqli($servername, $username, $password, $dbname); // Подавление предупреждений при подключении

// Проверка соединения
if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]);
    exit();
}

// Получение данных из POST запроса
$postData = file_get_contents('php://input');
error_log("Received POST data: " . $postData);

$data = json_decode($postData, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    error_log("Invalid JSON: " . json_last_error_msg());
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Invalid JSON: ' . json_last_error_msg()]);
    exit();
}

$username = $conn->real_escape_string($data['username']);
$email = $conn->real_escape_string($data['email']);
$password = $conn->real_escape_string($data['password']); // Пароль в открытом виде

// Проверка наличия пользователя
$checkSql = "SELECT id FROM users WHERE username = '$username' OR email = '$email'";
$result = $conn->query($checkSql);
if ($result->num_rows > 0) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Username or email already exists']);
    exit();
}

$sql = "INSERT INTO users (username, email, password) VALUES ('$username', '$email', '$password')";

$response = [];
if ($conn->query($sql) === TRUE) {
    $response['success'] = true;
    $response['message'] = "User registered successfully";
} else {
    error_log("Error: " . $sql . " - " . $conn->error);
    $response['success'] = false;
    $response['message'] = "Error: " . $sql . " - " . $conn->error;
}

// Убедитесь, что до этого места не было вывода данных
header('Content-Type: application/json');
echo json_encode($response);
error_log("Response: " . json_encode($response));

$conn->close();
?>
