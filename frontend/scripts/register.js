const {ENV} = require("./config");
const baseUrl = ENV.BASE_URL;
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');

    const messageModal = document.getElementById("messageModal");
    const messageModalTitle = document.getElementById("messageModalTitle");
    const messageModalContent = document.getElementById("messageModalContent");
    const closeMessageModalBtn = document.getElementById("closeMessageModal");

    function showMessage(type, message) {
        if (!messageModal || !messageModalTitle || !messageModalContent) return;
        messageModalTitle.innerText = type === "error" ? "Error" : "Info";
        messageModalContent.innerText = message;
        messageModal.classList.remove("hidden");
    }

    closeMessageModalBtn?.addEventListener("click", () => {
        messageModal?.classList.add("hidden");
    });

    document.querySelectorAll('.toggle-password').forEach(function(icon) {
        icon.addEventListener('click', function() {
          const input = this.previousElementSibling;
          if (input.type === "password") {
            input.type = "text";
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
          } else {
            input.type = "password";
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
          }
        });
      });

    registerForm?.addEventListener('submit', async function(e) {
        e.preventDefault();

        const firstName = document.getElementById('registerFirstName')?.value.trim();
        const lastName = document.getElementById('registerLastName')?.value.trim();
        const phone = document.getElementById('registerPhone')?.value.trim();
        const bio = document.getElementById('registerBio')?.value.trim();
        const username = document.getElementById('registerUsername')?.value.trim();
        const email = document.getElementById('registerEmail')?.value.trim();
        const password = document.getElementById('registerPassword')?.value;
        const confirmPassword = document.getElementById('registerConfirmPassword')?.value;

        if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
            showMessage("error", "Please fill in all required fields!");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("error", "Passwords do not match!");
            return;
        }

        if (password.length < 6) {
            showMessage("error", "Password must be at least 6 characters long");
            return;
        }

        try {
            const response = await fetch(`${baseUrl}/api/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    username,
                    email,
                    phone,
                    bio,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.user.userId);
                const userInfo = { 
                    email: data.user.email || email,
                    firstName: data.user.firstName || firstName,
                    lastName: data.user.lastName || lastName,
                    phone: data.user.phone || phone,
                    bio: data.user.bio || bio
                };
                localStorage.setItem('user', JSON.stringify(userInfo));
                window.location.href = 'dashboard.html';
            } else {
                showMessage("error", data.message || "Registration failed. Please try again.");
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage("error", "An error occurred during registration. Please try again.");
        }
    });
});
