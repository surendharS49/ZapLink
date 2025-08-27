const { ENV } = require("./config");
const baseUrl = ENV.BASE_URL;
document.addEventListener("DOMContentLoaded", function () {
    // Optional: Message modal for login errors
    const messageModal = document.getElementById("messageModal");
    const messageModalTitle = document.getElementById("messageModalTitle");
    const messageModalContent = document.getElementById("messageModalContent");
    const closeMessageModalBtn = document.getElementById("closeMessageModal");

    function showMessage(type, message) {
        messageModalTitle.innerText = type === "error" ? "Error" : "Info";
        messageModalContent.innerText = message;
        messageModal.classList.remove("hidden");
    }

    closeMessageModalBtn?.addEventListener("click", () => {
        messageModal.classList.add("hidden");
    });

    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        try {
            const response = await fetch(`${baseUrl}/api/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userId", data.userId);

                // Store user info for dashboard display
                const userInfo = { name: data.name || "User", email: data.email || email };
                localStorage.setItem("user", JSON.stringify(userInfo));

                window.location.href = "dashboard.html";
            } else {
                showMessage("error", data.message || "Login failed"); // now safe
            }
        } catch (error) {
            console.error(error);
            showMessage("error", "An error occurred while logging in."); // now safe
        }
    });
});
