const { ENV } = require("./config");
const baseUrl = ENV.BASE_URL;
document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }
    const userNameDisplay = document.getElementById("userNameDisplay");
    const userEmailDisplay = document.getElementById("userEmailDisplay");
    const userInfo = JSON.parse(localStorage.getItem("user")); // user info stored on login
    if (userInfo) {
        userNameDisplay.innerText = userInfo.name || "User";
        if (userEmailDisplay) userEmailDisplay.innerText = userInfo.email || "";
    } else {
        userNameDisplay.innerText = "User";
    }

    const linksTableBody = document.getElementById("linksTableBody");
    const successModal = document.getElementById("successModal");
    const generatedLink = document.getElementById("generatedLink");

    const totallinks = document.getElementById("totallinks");
    const totalClicks = document.getElementById("totalClicks");
    const activeCount = document.getElementById("activeCount");

    const editModal = document.getElementById("editModal");
    const editForm = document.getElementById("editForm");
    const editTitleInput = document.getElementById("editTitle");
    const editUrlInput = document.getElementById("editUrl");

    const deleteModal = document.getElementById("deleteModal");
    const cancelDeleteBtn = document.getElementById("cancelDelete");
    const confirmDeleteBtn = document.getElementById("confirmDelete");

    const messageModal = document.getElementById("messageModal");
    const messageModalTitle = document.getElementById("messageModalTitle");
    const messageModalContent = document.getElementById("messageModalContent");
    const closeMessageModalBtn = document.getElementById("closeMessageModal");
    const logoutBtn = document.getElementById("logoutBtn");
    const logoutDropdownBtn = document.getElementById("logoutDropdownBtn");

    let link_data = [];
    let currentEditId = null;
    let currentDeleteId = null;

    // -------------------
    // Message Modal Functions
    // -------------------
    function showMessage(type, message) {
        messageModalTitle.innerText = type === "error" ? "Error" : "Info";
        messageModalContent.innerText = message;
        messageModal.classList.remove("hidden");
    }

    closeMessageModalBtn.addEventListener("click", () => {
        messageModal.classList.add("hidden");
        location.reload();
    });

    // -------------------
    // Fetch Links
    // -------------------
    async function fetchLinks() {
        try {
            const res = await fetch(`${baseUrl}/api/url/all`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch links");
            const data = await res.json();
            link_data = data.links || [];
            renderLinks(link_data);
            updateStats(link_data);
        } catch (err) {
            console.error(err);
            linksTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-gray-500">Failed to load links</td></tr>`;
            showMessage("error", "Failed to load links");
        }
    }


    // -------------------
    // Logout
    // -------------------
    logoutBtn?.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });

    logoutDropdownBtn?.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });
    // Function to toggle user dropdown
    function toggleUserDropdown() {
        const userDropdown = document.getElementById("userDropdown");
        if (!userDropdown) return;
        userDropdown.classList.toggle("hidden");
    }

    // Event listener for the user menu button
    const userMenuButton = document.getElementById("userMenuButton");
    userMenuButton?.addEventListener("click", toggleUserDropdown);

    // Optional: Close the dropdown if clicked outside
    document.addEventListener("click", function(event) {
        const userDropdown = document.getElementById("userDropdown");
        const userMenuButton = document.getElementById("userMenuButton");
        if (!userDropdown || !userMenuButton) return;

        if (!userDropdown.contains(event.target) && !userMenuButton.contains(event.target)) {
            userDropdown.classList.add("hidden");
        }
    });
        // -------------------
    // Update Stats
    // -------------------
    function updateStats(links) {
        const total_links = links.length;
        const total_clicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
        const active_links = links.filter(l => l.status === "active").length;

        totallinks.innerText = total_links;
        totalClicks.innerText = total_clicks;
        activeCount.innerText = active_links;
    }

    // -------------------
    // Render Links
    // -------------------
    function renderLinks(links) {
        if (!links.length) {
            linksTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-gray-500">No links found</td></tr>`;
            return;
        }

        linksTableBody.innerHTML = links.slice().reverse().map(link => `
            <tr>
                <td class="px-4 py-2 break-all">
                    <div class="text-sm font-medium text-gray-900">${link.title || "Untitled"}</div>
                    <div class="text-sm text-gray-500">${link.originalUrl}</div>
                </td>
                <td class="px-4 py-2">
                    <div class="flex items-center gap-2">
                        <a href="${link.shortUrl}" target="_blank" class="text-blue-600 hover:underline">${link.shortUrl}</a>
                        <button onclick="copyToClipboard('${link.shortUrl}', this)" class="text-gray-500 hover:text-green-600">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </td>
                <td class="px-4 py-2">${link.clicks || 0}</td>
                <td class="px-4 py-2">${link.createdAt ? new Date(link.createdAt).toLocaleDateString() : "-"}</td>
                <td class="px-4 py-2">
                    <button onclick="editLink('${link.uniqueId}')" class="text-blue-500 hover:text-blue-600 ml-2">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteLink('${link.uniqueId}')" class="text-red-500 hover:text-red-600 ml-2">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join("");
    }

    // -------------------
    // Copy URL
    // -------------------
    window.copyToClipboard = function(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            const icon = button.querySelector("i");
            const originalClass = icon.className;
            icon.className = "fas fa-check text-green-500";
            setTimeout(() => { icon.className = originalClass; }, 2000);
        });
    };

    // -------------------
    // Create New Link
    // -------------------
    async function createShortLink(e) {
        e.preventDefault();

        const title = document.getElementById("title").value;
        const longUrl = document.getElementById("longUrl").value;
        const customSlug = document.getElementById("customSlug").value || "";

        if (!longUrl) return showMessage("error", "Please enter a URL");

        try {
            const res = await fetch(`${baseUrl}/api/url/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ title, url: longUrl, customSlug })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.message || "Failed to create link");

            const shortUrl = data.link ? data.link.shortUrl : `${baseUrl}/${data.slug || customSlug}`;
            document.querySelector("#successModal h2").innerText = data.message || "Link Created!";
            generatedLink.value = shortUrl;
            successModal.classList.remove("hidden");

            document.getElementById("shortenForm").reset();
            await fetchLinks();
        } catch (err) {
            console.error(err);
            showMessage("error", err.message);
        }
    }

    document.getElementById("shortenForm").addEventListener("submit", createShortLink);
    document.getElementById("closeModal").addEventListener("click", () => successModal.classList.add("hidden"));

    // -------------------
    // Edit Link
    // -------------------
    window.editLink = function(uniqueId) {
        currentEditId = uniqueId;
        const link = link_data.find(l => l.uniqueId === uniqueId);
        if (!link) return showMessage("error", "Link not found");
        editTitleInput.value = link.title || "";
        editUrlInput.value = link.originalUrl || "";
        editModal.classList.remove("hidden");
    }

    window.closeEditModal = function() {
        editModal.classList.add("hidden");
        currentEditId = null;
    }

    editForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        if (!currentEditId) return;

        const updatedTitle = editTitleInput.value;
        const updatedUrl = editUrlInput.value;

        try {
            const res = await fetch(`${baseUrl}/api/url/${currentEditId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ title: updatedTitle, url: updatedUrl })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.message || "Failed to update link");

            const index = link_data.findIndex(l => l.uniqueId === currentEditId);
            if (index > -1) {
                link_data[index].title = updatedTitle;
                link_data[index].originalUrl = updatedUrl;
            }

            renderLinks(link_data);
            closeEditModal();
            showMessage("info", data.message || "Link updated successfully");
        } catch (err) {
            console.error(err);
            showMessage("error", err.message);
        }
    });

    // -------------------
    // Delete Link
    // -------------------
    window.deleteLink = function(uniqueId) {
        currentDeleteId = uniqueId;
        deleteModal.classList.remove("hidden");
    }

    cancelDeleteBtn.addEventListener("click", function() {
        deleteModal.classList.add("hidden");
        currentDeleteId = null;
    });

    confirmDeleteBtn.addEventListener("click", async function() {
        if (!currentDeleteId) return;

        try {
            const res = await fetch(`${baseUrl}/api/url/${currentDeleteId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.message || "Failed to delete link");

            link_data = link_data.filter(l => l.uniqueId !== currentDeleteId);
            renderLinks(link_data);
            updateStats(link_data);

            deleteModal.classList.add("hidden");
            currentDeleteId = null;
            showMessage("info", data.message || "Link deleted successfully");
        } catch (err) {
            console.error(err);
            showMessage("error", err.message);
        }
    });

    // -------------------
    // Search Filter
    // -------------------
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const filter = searchInput.value.toLowerCase();
            const rows = linksTableBody.querySelectorAll("tr");
            rows.forEach(row => {
                row.style.display = row.innerText.toLowerCase().includes(filter) ? "" : "none";
            });
        });
    }

    // -------------------
    // Initial Load
    // -------------------
    fetchLinks();
});
