<?php
// update_balance.php
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
$username = $conn->real_escape_string($data['username']);
$balance = $conn->real_escape_string($data['balance']);

// Обновление баланса пользователя
$sql = "UPDATE users SET balance='$balance' WHERE username='$username'";
$response = array();

if ($conn->query($sql) === TRUE) {
    $response['success'] = true;
} else {
    $response['success'] = false;
    $response['message'] = "Error: " . $sql . "<br>" . $conn->error;
}

// Логирование ответа
error_log(json_encode($response));

echo json_encode($response);

$conn->close();
?>


$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Получение данных из POST-запроса
$data = json_decode(file_get_contents('php://input'), true);
$username = $conn->real_escape_string($data['username']);
$balance = $conn->real_escape_string($data['balance']);

// Обновление баланса пользователя
$sql = "UPDATE users SET balance='$balance' WHERE username='$username'";
$response = array();

if ($conn->query($sql) === TRUE) {
    $response['success'] = true;
} else {
    $response['success'] = false;
    $response['message'] = "Error: " . $sql . "<br>" . $conn->error;
}

// Логирование ответа
error_log(json_encode($response));

echo json_encode($response);

$conn->close();
?>
