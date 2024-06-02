import { CONFIG } from './config.js';

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
    .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        return response.text().then(text => {
            console.log('Response text:', text);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return JSON.parse(text);
        });
    })
    .then(data => {
        console.log('Response data:', data);
        if (data.success) {
            document.getElementById('user-details').innerHTML = "User registered: " + email;
            updateUIForLoggedInUser(username, 0);
        } else {
            document.getElementById('user-details').innerHTML = "Error: " + data.message;
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
    .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        return response.text().then(text => {
            console.log('Response text:', text);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return JSON.parse(text);
        });
    })
    .then(data => {
        console.log('Response data:', data);
        if (data.success) {
            var user = data.user;
            document.getElementById('user-details').innerHTML = "User logged in: " + user.email;
            updateUIForLoggedInUser(user.username, user.balance);
        } else {
            document.getElementById('user-details').innerHTML = "Error: " + data.message;
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
}

function updateUIForLoggedInUser(username, balance) {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('user-details').innerHTML += ` | ${username} <button onclick="logout()">Logout</button>`;
    document.getElementById('balance').style.display = 'block';
    document.getElementById('balance').innerHTML = `Balance: ${balance}`;
}
