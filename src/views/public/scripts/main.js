// /scripts/main.js

import { initAuth } from '/scripts/auth.js';
import { initUI } from '/scripts/ui.js';
import { fetchAndRenderPosts } from '/scripts/posts.js';

document.addEventListener("DOMContentLoaded", async () => {
    // Ініціалізація додатку
    await initApp();
});

// Функція ініціалізації додатку
async function initApp() {
    // Ініціалізація авторизації
    await initAuth();

    // Ініціалізація інтерфейсу
    initUI();

    // Початкове завантаження постів
    await fetchAndRenderPosts();
}
