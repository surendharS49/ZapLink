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

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            if (!input) return;

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

    // Registration form submit
    registerForm?.addEventListener('submit', async function(e) {
        e.preventDefault();

        const firstName = document.getElementById('registerFirstName')?.value.trim();
        const lastName = document.getElementById('registerLastName')?.value.trim();
        const username = document.getElementById('registerUsername')?.value.trim();
        const email = document.getElementById('registerEmail')?.value.trim();
        const phone = document.getElementById('registerPhone')?.value.trim();
        const bio = document.getElementById('registerBio')?.value.trim();
        const password = document.getElementById('registerPassword')?.value;
        const confirmPassword = document.getElementById('registerConfirmPassword')?.value;

        // Validations
        if (!firstName || !lastName || !username || !email || !phone || !password || !confirmPassword) {
            showMessage("error", "Please fill in all required fields!");
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            showMessage("error", "Invalid email format");
            return;
        }

        if (!/^\d{8,15}$/.test(phone)) {
            showMessage("error", "Phone number must be 8-15 digits");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("error", "Passwords do not match!");
            return;
        }

        if (password.length < 6 || password.length > 20) {
            showMessage("error", "Password must be 6-20 characters long");
            return;
        }

        // Build request body
        const body = { firstName, lastName, username, email, phone, password };
        if (bio) body.bio = bio;

        try {
            const response = await fetch(`${window.ENV.BASE_URL}/api/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
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
                    bio: data.user.bio || bio || ""
                };
                localStorage.setItem('user', JSON.stringify(userInfo));
                window.location.href = 'dashboard.html';
            } else {
                showMessage("error", data.error || "Registration failed. Please try again.");
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage("error", "An error occurred during registration. Please try again.");
        }
    });
});
