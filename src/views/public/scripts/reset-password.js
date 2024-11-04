document.addEventListener("DOMContentLoaded", async () => {
    const resetPasswordForm = document.getElementById("resetPasswordForm");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const resetButton = document.getElementById("resetButton");
    const errorElement = document.getElementById("error");
    const successElement = document.getElementById("success");

    // Отримуємо токен із URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
        errorElement.textContent = "Invalid or missing token. Please check your email link.";
        resetButton.disabled = true;
        return;
    }

    // Обробка форми для зміни паролю
    resetPasswordForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        errorElement.textContent = "";
        successElement.textContent = "";

        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        // Перевірка, чи збігаються паролі
        if (newPassword !== confirmPassword) {
            errorElement.textContent = "Passwords do not match. Please try again.";
            return;
        }

        try {
            const response = await fetch("/api/users/password-reset", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ token, password: newPassword })
            });

            if (response.ok) {
                successElement.textContent = "Password has been successfully reset. You can now log in with your new password.";
                newPasswordInput.disabled = true;
                confirmPasswordInput.disabled = true;
                resetButton.disabled = true;
            } else {
                const errorData = await response.json();
                errorElement.textContent = errorData.error || "Failed to reset password. Please try again.";
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            errorElement.textContent = "Something went wrong. Please try again later.";
        }
    });
});
