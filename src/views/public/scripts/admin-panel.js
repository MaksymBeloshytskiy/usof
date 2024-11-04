document.addEventListener("DOMContentLoaded", () => {
    const usersTab = document.getElementById("usersTab");
    const postsTab = document.getElementById("postsTab");
    const reportsTab = document.getElementById("reportsTab");
    const categoeisTab = document.getElementById("categoriesTab");
    const contentArea = document.getElementById("contentArea");
    const logoutButton = document.getElementById("logoutButton");

    // Кнопка Manage Users
    usersTab.addEventListener("click", async () => {
        contentArea.innerHTML = `
            <h2>Manage Users</h2>
            <input type="text" id="searchInput" placeholder="Search users..." />
            <p>Loading users...</p>
        `;
        try {
            const response = await fetch("/api/users/", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            });
            if (response.ok) {
                const users = await response.json();
                const currentUser = await getCurrentUser();

                // Фільтруємо користувачів, щоб виключити поточного користувача
                const filteredUsers = users.filter(user => user.id !== currentUser.id);

                if (filteredUsers.length > 0) {
                    renderUsersTable(filteredUsers);
                } else {
                    contentArea.innerHTML = "<p>No users has been found.</p>";
                }
            } else {
                contentArea.innerHTML = "<p>Error loading users. Please try again later.</p>";
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            contentArea.innerHTML = "<p>Error loading users. Please try again later.</p>";
        }
    });

    // Кнопка Manage Posts (заглушка)
    postsTab.addEventListener("click", () => {
        contentArea.innerHTML = "<h2>Manage Posts</h2><p>Feature coming soon...</p>";
    });

    // Кнопка View Reports (заглушка)
    reportsTab.addEventListener("click", () => {
        contentArea.innerHTML = "<h2>View Reports</h2><p>Feature coming soon...</p>";
    });

    // Кнопка Logout
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("authToken");
        window.location.href = "/login";
    });

    // Функція для рендерингу таблиці користувачів
    function renderUsersTable(users) {
        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="usersTableBody">
        `;

        users.forEach(user => {
            tableHTML += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.fullName}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>
                        <button onclick="editUser('${user.id}')">Edit</button>
                        <button onclick="deleteUser('${user.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;

        contentArea.innerHTML = `
            <h2>Manage Users</h2>
            <input type="text" id="searchInput" placeholder="Search users..." />
            ${tableHTML}
        `;

        const searchInput = document.getElementById("searchInput");
        searchInput.addEventListener("input", () => searchUsers(users));
    }

    // Функція для пошуку користувачів по таблиці
    function searchUsers(users) {
        const searchInput = document.getElementById("searchInput").value.toLowerCase();
        const tableBody = document.getElementById("usersTableBody");
        
        // Фільтруємо користувачів на основі пошукового запиту
        const filteredUsers = users.filter(user =>
            user.username.toLowerCase().includes(searchInput) ||
            user.fullName.toLowerCase().includes(searchInput) ||
            user.email.toLowerCase().includes(searchInput) ||
            user.role.toLowerCase().includes(searchInput)
        );

        // Оновлюємо таблицю користувачів
        let tableHTML = "";
        filteredUsers.forEach(user => {
            tableHTML += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.fullName}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>
                        <button onclick="editUser('${user.id}')">Edit</button>
                        <button onclick="deleteUser('${user.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = tableHTML;

        // Якщо жодного користувача не знайдено, показуємо повідомлення
        if (filteredUsers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center;">No users found.</td>
                </tr>
            `;
        }
    }

    // Функція для отримання поточного користувача
    async function getCurrentUser() {
        try {
            const response = await fetch("/api/verify-token", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            });

            if (response.ok) {
                return await response.json();
            } else {
                console.error("Failed to get current user");
                return null;
            }
        } catch (error) {
            console.error("Error getting current user:", error);
            return null;
        }
    }

    // Функція для редагування користувача (заглушка)
    window.editUser = function(userId) {
        alert(`Edit user with ID: ${userId}`);
        // Тут може бути реалізована логіка редагування користувача
    };

    // Функція для видалення користувача (заглушка)
    window.deleteUser = function(userId) {
        try{

            // Виведення підтвердження видалення користувача
            if (confirm(`Are you sure you want to delete user with ID: ${userId}?`)) {


            fetch(`/api/users/${userId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
            });

        }

            if (response.ok) {
                alert(`User with ID: ${userId} has been deleted successfully!`);
                renderManageUsers(); // Повернення до списку користувачів
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    categoriesTab.addEventListener("click", async () => {
        renderManageCategories();
    });

    function renderManageCategories() {
        contentArea.innerHTML = `
            <h2>Manage Categories</h2>
            <button id="addCategoryButton">Add New Category</button>
            <p>Loading categories...</p>
        `;
        
        fetchCategories();
    }

    async function fetchCategories() {
        try {
            const response = await fetch("/api/categories", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            });

            if (response.ok) {
                const categories = await response.json();
                renderCategoriesTable(categories);
            } else {
                contentArea.innerHTML += "<p>Error loading categories. Please try again later.</p>";
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            contentArea.innerHTML += "<p>Error loading categories. Please try again later.</p>";
        }
    }

    // Кнопка для створення нової категорії
    document.addEventListener("click", (e) => {
        if (e.target && e.target.id === "addCategoryButton") {
            renderCategoryForm();
        }
    });

    // Функція для рендерингу форми створення/редагування категорії
    function renderCategoryForm(existingCategory = null) {
        contentArea.innerHTML = `
            <h2>${existingCategory ? 'Edit Category' : 'Add New Category'}</h2>
            <form id="categoryForm">
                <input type="text" id="categoryTitle" value="${existingCategory ? existingCategory.title : ''}" placeholder="Category Title" required />
                <button type="submit">${existingCategory ? 'Update' : 'Create'} Category</button>
            </form>
            <button id="backToCategories">Back to Categories</button>
        `;

        const categoryForm = document.getElementById("categoryForm");
        categoryForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const title = document.getElementById("categoryTitle").value;

            try {
                let response;
                if (existingCategory) {
                    response = await fetch(`/api/categories/${existingCategory.id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                        },
                        body: JSON.stringify({ title })
                    });
                } else {
                    response = await fetch("/api/categories", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                        },
                        body: JSON.stringify({ title })
                    });
                }

                if (response.ok) {
                    alert(`Category ${existingCategory ? 'updated' : 'created'} successfully!`);
                    renderManageCategories(); // Повернення до списку категорій
                } else {
                    alert("Error occurred. Please try again.");
                }
            } catch (error) {
                console.error("Error managing category:", error);
                alert("Error occurred. Please try again.");
            }
        });

        document.getElementById("backToCategories").addEventListener("click", () => {
            renderManageCategories(); // Повернення до списку категорій
        });
    }

    // Функція для рендерингу таблиці категорій
    function renderCategoriesTable(categories) {
        let tableHTML = "";

        if (categories.length > 0) {
            tableHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="categoriesTableBody">
            `;

            categories.forEach(category => {
                tableHTML += `
                    <tr>
                        <td>${category.id}</td>
                        <td>${category.title}</td>
                        <td>
                            <button onclick="editCategory('${category.id}', '${category.title}')">Edit</button>
                            <button onclick="deleteCategory('${category.id}')">Delete</button>
                        </td>
                    </tr>
                `;
            });

            tableHTML += `
                    </tbody>
                </table>
            `;
        } else {
            tableHTML = `
                <p>No categories have been created yet.</p>
            `;
        }

        contentArea.innerHTML = `
            <h2>Manage Categories</h2>
            <button id="addCategoryButton">Add New Category</button>
            ${tableHTML}
        `;
    }

    // Функція для редагування категорії (відкриває форму)
    window.editCategory = function (categoryId, categoryTitle) {
        renderCategoryForm({ id: categoryId, title: categoryTitle });
    };

    // Функція для видалення категорії
    window.deleteCategory = async function (categoryId) {
        if (confirm("Are you sure you want to delete this category?")) {
            try {
                const response = await fetch(`/api/categories/${categoryId}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                    }
                });

                if (response.ok) {
                    alert("Category deleted successfully!");
                    renderManageCategories(); // Повернення до списку категорій
                } else {
                    alert("Failed to delete category. Please try again.");
                }
            } catch (error) {
                console.error("Error deleting category:", error);
                alert("Failed to delete category. Please try again.");
            }
        }
    };
});
