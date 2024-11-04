document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    const verificationMessage = document.getElementById("verificationMessage");

    if (!token) {
        verificationMessage.textContent = "Verification token is missing or invalid.";
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/users/verify-email?token=${token}`, {
            method: "GET"
        });

        if (response.ok) {
            const data = await response.json();
            verificationMessage.textContent = data.message || "Email successfully verified!";
        } else {
            const errorData = await response.json();
            verificationMessage.textContent = errorData.error || "Failed to verify email. Please try again.";
        }
    } catch (error) {
        verificationMessage.textContent = "An error occurred while verifying your email. Please try again later.";
    }
});
