document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const username = document.getElementById("username").value;
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorElement = document.getElementById("error");

    try {
        const response = await fetch("http://localhost:3000/api/users/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, fullName, email, password })
        });

        if (response.ok) {
            window.location.href = "/login"; // Після успішної реєстрації перенаправити на сторінку логіну
        } else {
            const errorData = await response.json();
            errorElement.textContent = errorData.error || "Registration failed. Please try again.";
        }
    } catch (error) {
        errorElement.textContent = "Something went wrong. Please try again later.";
    }
});
