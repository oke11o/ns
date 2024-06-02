import { initializeMap } from './map-initialization.js';
import { register, login } from './user-authentication.js';

document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    window.register = register;
    window.login = login;
});
