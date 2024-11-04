document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const errorElement = document.getElementById("error");

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Запобігає перезавантаженню сторінки при відправленні форми

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const response = await fetch("http://localhost:3000/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("authToken", data.token); // Збереження токену в LocalStorage
                // Додатковий чек, щоб впевнитись, що токен збережено перед редиректом
                if (localStorage.getItem("authToken")) {
                    window.location.href = "/"; // Перехід на головну сторінку
                }
            } else {
                const errorData = await response.json();
                errorElement.textContent = errorData.error || "Login failed. Please try again.";
                errorElement.style.opacity = 1; // Додаємо анімацію появи помилки
            }
        } catch (error) {
            console.error("Login Error:", error);
            errorElement.textContent = "Something went wrong. Please try again later.";
            errorElement.style.opacity = 1; // Додаємо анімацію появи помилки
        }
    });
});
