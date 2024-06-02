import { initializeMap } from './map-initialization.js';
import { register, login, logout } from './user-authentication.js';

document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    window.register = register;
    window.login = login;
    window.logout = logout;
});
