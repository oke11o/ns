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

$email = $conn->real_escape_string($data['email']);
$password = $conn->real_escape_string($data['password']); // Пароль в открытом виде

// Проверка учетных данных пользователя
$sql = "SELECT id, username, password FROM users WHERE email = '$email'";
$result = $conn->query($sql);

$response = [];
if ($result->num_rows == 1) {
    $row = $result->fetch_assoc();
    if ($row['password'] === $password) { // Простая проверка пароля в открытом виде
        $response['success'] = true;
        $response['user'] = [
            'id' => $row['id'],
            'username' => $row['username'],
            'email' => $email,
            'balance' => 0 // Пример баланса, можно обновить, если есть в БД
        ];
    } else {
        $response['success'] = false;
        $response['message'] = "Incorrect password";
    }
} else {
    $response['success'] = false;
    $response['message'] = "User not found";
}

// Убедитесь, что до этого места не было вывода данных
header('Content-Type: application/json');
echo json_encode($response);
error_log("Response: " . json_encode($response));

$conn->close();
?>
