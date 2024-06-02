import { CONFIG } from './config.js';
import { userBalance, updateUserBalanceDisplay, currentUser } from './building-management.js';

export function register() {
    var username = document.getElementById('username').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    console.log('Registering user:', { username, email, password });
    fetch(CONFIG.registerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    })
    .then(response => response.text())
    .then(text => {
        console.log('Register Response:', text);
        try {
            const data = JSON.parse(text);
            if (data.success) {
                document.getElementById('user-details').innerHTML = "User registered: " + email;
                currentUser.value = username;
                updateUIForLoggedInUser(username, 0);
            } else {
                document.getElementById('user-details').innerHTML = "Error: " + data.message;
            }
        } catch (error) {
            document.getElementById('user-details').innerHTML = "Register JSON Parse Error: " + error;
        }
    })
    .catch(error => {
        console.error('Registration error:', error);
        document.getElementById('user-details').innerHTML = "Error: " + error;
    });
}

export function login() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    console.log('Logging in user:', { email, password });
    fetch(CONFIG.loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.text())
    .then(text => {
        console.log('Login Response:', text);
        try {
            const data = JSON.parse(text);
            if (data.success) {
                var user = data.user;
                document.getElementById('user-details').innerHTML = "User logged in: " + user.email;
                userBalance.onHand = parseFloat(user.balance);
                currentUser.value = user.username; // Устанавливаем текущего пользователя
                updateUIForLoggedInUser(user.username, userBalance.onHand);
            } else {
                document.getElementById('user-details').innerHTML = "Error: " + data.message;
            }
        } catch (error) {
            document.getElementById('user-details').innerHTML = "Login JSON Parse Error: " + error;
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        document.getElementById('user-details').innerHTML = "Error: " + error;
    });
}

export function logout() {
    document.getElementById('user-details').innerHTML = "User logged out";
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('balance').style.display = 'none';
    currentUser.value = ''; // Сбрасываем текущего пользователя
}

function updateUIForLoggedInUser(username, balance) {
    currentUser.value = username;
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('user-details').innerHTML += ` | ${username} <button onclick="logout()">Logout</button>`;
    document.getElementById('balance').style.display = 'block';
    updateUserBalanceDisplay();
}

export function updateBalance(username, balance) {
    fetch(CONFIG.updateBalanceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, balance })
    })
    .then(response => response.text())
    .then(text => {
        console.log('Update Balance Response:', text);
        try {
            const data = JSON.parse(text);
            if (data.success) {
                console.log('Balance updated successfully');
            } else {
                console.error('Error updating balance:', data.message);
            }
        } catch (error) {
            console.error('Update Balance JSON Parse Error:', error);
        }
    })
    .catch(error => {
        console.error('Error updating balance:', error);
    });
}

// Экспортируем функции, которые будут использоваться глобально
window.register = register;
window.login = login;
window.logout = logout;
window.updateBalance = updateBalance;
