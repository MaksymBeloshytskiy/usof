document.addEventListener("DOMContentLoaded", () => {
    const restorePasswordForm = document.getElementById("restorePasswordForm");
    const emailInput = document.getElementById("email");
    const sendButton = document.getElementById("sendButton");
    const emailCheckStatus = document.getElementById("email-check-status");

    const FIVE_MINUTES = 5 * 60 * 1000;

    // Функція для ініціалізації таймера, якщо він існує
    function initializeTimer() {
        const lockTime = localStorage.getItem("passwordResetLockTime");
        if (lockTime) {
            const timeLeft = new Date(lockTime) - new Date();
            if (timeLeft > 0) {
                startTimer(timeLeft);
            } else {
                localStorage.removeItem("passwordResetLockTime");
                enableSendButton();
            }
        }
    }

    // Функція для запуску таймера
    function startTimer(duration) {
        const endTime = new Date().getTime() + duration;
        localStorage.setItem("passwordResetLockTime", new Date(endTime).toISOString());
        disableSendButton();

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const timeLeft = endTime - now;

            if (timeLeft <= 0) {
                clearInterval(interval);
                localStorage.removeItem("passwordResetLockTime");
                emailCheckStatus.innerText = "";
                enableSendButton();
            } else {
                const minutes = Math.floor(timeLeft / 60000);
                const seconds = Math.floor((timeLeft % 60000) / 1000);
                emailCheckStatus.innerText = `Please wait ${minutes}:${seconds < 10 ? '0' : ''}${seconds} before requesting again.`;
                emailCheckStatus.style.color = "orange";
            }
        }, 1000);
    }

    // Функція для відключення кнопки "Send"
    function disableSendButton() {
        sendButton.disabled = true;
        sendButton.classList.add("disabled");
        sendButton.innerText = "Please wait...";
    }

    // Функція для ввімкнення кнопки "Send"
    function enableSendButton() {
        sendButton.disabled = false;
        sendButton.classList.remove("disabled");
        sendButton.innerText = "Send Reset Link";
    }

    // Ініціалізувати таймер при завантаженні сторінки
    initializeTimer();

    // Обробник події форми для відновлення паролю
    restorePasswordForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();

        try {
            const response = await fetch("/api/users/password-reset-request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                emailCheckStatus.innerText = "Recovery link has been sent to your email.";
                emailCheckStatus.style.color = "green";

                // Запустити таймер на 5 хвилин
                startTimer(FIVE_MINUTES);
            } else {
                const errorData = await response.json();
                if (response.status === 404) {
                    emailCheckStatus.innerText = "User not found.";
                    emailCheckStatus.style.color = "red";
                } else {
                    emailCheckStatus.innerText = `Error: ${errorData.error || "Failed to send recovery link. Please try again."}`;
                    emailCheckStatus.style.color = "orange";
                }
            }
        } catch (error) {
            console.error("Error sending recovery request:", error);
            emailCheckStatus.innerText = "An error occurred. Please try again later.";
            emailCheckStatus.style.color = "orange";
        }

        // Додаємо анімацію для повідомлення
        emailCheckStatus.style.opacity = 0;
        emailCheckStatus.style.transition = "opacity 0.5s ease";
        setTimeout(() => {
            emailCheckStatus.style.opacity = 1;
        }, 0);
    });
});
