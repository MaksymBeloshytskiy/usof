// /scripts/auth.js
import { displayAuthorizedUI, displayGuestUI } from '/scripts/ui.js';

// Перевірка авторизації та ініціалізація відповідного вигляду
export async function initAuth() {
    const token = localStorage.getItem("authToken");

    if (token) {
        try {
            const response = await fetch("/api/verify-token", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();

                // Збережемо дані користувача для подальшого використання
                localStorage.setItem("userData", JSON.stringify(userData));

                // Показуємо авторизований вигляд
                showAuthorizedView(userData);
            } else {
                // Якщо токен недійсний, видалити його та показати гостьовий вигляд
                localStorage.removeItem("authToken");
                showGuestView();
            }
        } catch (error) {
            console.error("Failed to verify token:", error);
            showGuestView();
        }
    } else {
        // Якщо токену немає, показати гостьовий вигляд
        showGuestView();
    }
}

// Функції для показу відповідного вигляду
function showAuthorizedView(userData) {
    // Відображення елементів для авторизованого користувача
    // Реалізовано в ui.js
    displayAuthorizedUI(userData);
}

function showGuestView() {
    // Відображення елементів для гостьового користувача
    // Реалізовано в ui.js
    displayGuestUI();
}
