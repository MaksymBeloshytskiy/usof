// /scripts/ui.js
import { fetchAndRenderPosts, fetchAndRenderUserPosts} from '/scripts/posts.js';

// Оголошення DOM елементів
const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");
const adminPanelButton = document.getElementById("adminPanel");
const createPostButton = document.getElementById("createPostButton");
const accountWrapper = document.getElementById("accountWrapper");
const userAvatar = document.getElementById("userAvatar");
const accountDropdown = document.getElementById("accountDropdown");
const accountSettings = document.getElementById("accountSettings");
const logout = document.getElementById("logout");
const postsContainer = document.getElementById("postsContainer");
const createPostForm = document.getElementById("createPostForm");
const postCategorySelect = document.getElementById("postCategory");
const submitPostButton = document.getElementById("submitPostButton");
const backToPostsButton = document.getElementById("backToPostsButton");
const myPostsButton = document.getElementById("myPostsButton");
const myPostsContainer = document.getElementById("myPostsContainer");

// Ініціалізація інтерфейсу
export function initUI() {
    // Обробники подій для кнопок
    setupEventListeners();
}

// Функція для налаштування обробників подій
function setupEventListeners() {
    if (loginButton) {
        loginButton.addEventListener("click", () => {
            window.location.href = "/login";
        });
    }

    if (registerButton) {
        registerButton.addEventListener("click", () => {
            window.location.href = "/register";
        });
    }

    if (adminPanelButton) {
        adminPanelButton.addEventListener("click", () => {
            window.location.href = "/admin-panel";
        });
    }

    if (createPostButton) {
        createPostButton.addEventListener("click", async () => {
            // Показуємо форму створення поста
            postsContainer.style.display = "none";
            createPostForm.style.display = "block";

            // Завантажуємо категорії
            await fetchCategories();
        });
    }

    if (myPostsButton) {
        myPostsButton.addEventListener("click", async () => {
          // Приховуємо інші елементи, якщо потрібно
          postsContainer.style.display = "none";
          createPostForm.style.display = "none";
          // Показуємо контейнер для "Моїх постів"
          myPostsContainer.style.display = "block";
          // Завантажуємо та відображаємо пости користувача
          await fetchAndRenderUserPosts();
        });
      }

    if (backToPostsButton) {
        backToPostsButton.addEventListener("click", () => {
            // Приховуємо форму створення поста
            createPostForm.style.display = "none";
            // Показуємо контейнер з постами
            postsContainer.style.display = "block";
            // Показуємо кнопки пагінації, якщо вони є
            const paginationContainer = document.getElementById("paginationContainer");
            if (paginationContainer) {
                paginationContainer.style.display = "block";
            }
        });
    }

    if (submitPostButton) {
        submitPostButton.addEventListener("click", createPost);
    }

    // Обробка меню акаунту
    if (userAvatar) {
        userAvatar.addEventListener("click", (event) => {
            event.stopPropagation();
            toggleDropdownMenu();
        });
    }

    if (window) {
        window.addEventListener("click", (event) => {
            if (!accountWrapper.contains(event.target)) {
                accountDropdown.classList.remove("show");
            }
        });
    }

    if (accountSettings) {
        accountSettings.addEventListener("click", () => {
            window.location.href = "/account-settings";
        });
    }

    if (logout) {
        logout.addEventListener("click", () => {
            localStorage.removeItem("authToken");
            localStorage.removeItem("userData");
            displayGuestUI();
            // Оновлюємо сторінку
            window.location.reload();
        });
    }
}

// Функції для відображення відповідного інтерфейсу
export function displayAuthorizedUI(userData) {
    if (loginButton) loginButton.style.display = "none";
    if (registerButton) registerButton.style.display = "none";
    if (adminPanelButton) adminPanelButton.style.display = userData.role === "admin" ? "block" : "none";
    if (createPostButton) createPostButton.style.display = "block";
    if (accountWrapper) accountWrapper.style.display = "flex";
    if (userAvatar && userData.avatarUrl) {
        userAvatar.src = userData.avatarUrl;
    }
    if (myPostsButton) myPostsButton.style.display = "block";

    // Активуємо кнопки лайків та коментарів
    enablePostInteraction();
}

export function displayGuestUI() {
    if (loginButton) loginButton.style.display = "block";
    if (registerButton) registerButton.style.display = "block";
    if (adminPanelButton) adminPanelButton.style.display = "none";
    if (createPostButton) createPostButton.style.display = "none";
    if (accountWrapper) accountWrapper.style.display = "none";
    if (myPostsButton) myPostsButton.style.display = "none";

    // Деактивуємо кнопки лайків та коментарів
    disablePostInteraction();
}

// Функції для роботи з меню акаунту
function toggleDropdownMenu() {
    accountDropdown.classList.toggle("show");
}

// Функція для створення поста
export async function createPost() {
    const title = document.getElementById("postTitle").value;
    const content = document.getElementById("postContent").value;

    // Отримуємо вибрані категорії
    const selectedCategories = Array.from(document.querySelectorAll(".category-card.selected"))
        .map(card => card.dataset.categoryId);

    const userData = JSON.parse(localStorage.getItem("userData"));

    if (!userData) {
        alert("Інформація про користувача відсутня. Будь ласка, увійдіть знову.");
        return;
    }

    if (selectedCategories.length === 0) {
        alert("Будь ласка, виберіть хоча б одну категорію.");
        return;
    }

    try {
        const response = await fetch("/api/posts/create", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title,
                content,
                categoryIds: selectedCategories,
                authorId: userData.id,
            }),
        });

        if (response.ok) {
            alert("Пост успішно створено!");
        
            // Очищаємо форму
            document.getElementById("postTitle").value = "";
            document.getElementById("postContent").value = "";
            const categoryCards = document.querySelectorAll(".category-card.selected");
            categoryCards.forEach(card => card.classList.remove("selected"));
        
            // Приховуємо форму та показуємо список постів
            createPostForm.style.display = "none";
            postsContainer.style.display = "block";
            const paginationContainer = document.getElementById("paginationContainer");
            if (paginationContainer) {
                paginationContainer.style.display = "block";
            }
        
            // Оновлюємо список постів, якщо потрібно
            await fetchAndRenderPosts();
        } else {
            console.error("Не вдалося створити пост. Статус:", response.status);
            alert("Не вдалося створити пост.");
        }
    } catch (error) {
        console.error("Помилка при створенні поста:", error);
        alert("Помилка при створенні поста.");
    }
}

// Функція для завантаження категорій
export async function fetchCategories(selectedCategoryIds = []) {
    try {
        const response = await fetch("/api/categories", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            },
        });

        if (response.ok) {
            const categories = await response.json();
            const categoryCardsContainer = document.getElementById("categoryCardsContainer");
            categoryCardsContainer.innerHTML = "";

            categories.forEach(category => {
                const card = document.createElement("div");
                card.classList.add("category-card");
                card.textContent = category.title;
                card.dataset.categoryId = category.id;

                // Якщо категорія в списку вибраних, додаємо клас "selected"
                if (selectedCategoryIds.includes(category.id)) {
                    card.classList.add("selected");
                }

                // Додаємо обробник події для вибору категорії
                card.addEventListener("click", () => {
                    card.classList.toggle("selected");
                });

                categoryCardsContainer.appendChild(card);
            });
        } else {
            console.error("Не вдалося завантажити категорії. Статус:", response.status);
        }
    } catch (error) {
        console.error("Помилка при завантаженні категорій:", error);
    }
}

// Функції для активації та деактивації кнопок взаємодії з постами
function enablePostInteraction() {
    const likeButtons = document.querySelectorAll(".likeButton");
    const commentButtons = document.querySelectorAll(".commentButton");

    likeButtons.forEach(button => {
        button.disabled = false;
        button.addEventListener("click", handleLikeButtonClick);
    });

    commentButtons.forEach(button => {
        button.disabled = false;
        button.addEventListener("click", handleCommentButtonClick);
    });
}

function disablePostInteraction() {
    const likeButtons = document.querySelectorAll(".likeButton");
    const commentButtons = document.querySelectorAll(".commentButton");

    likeButtons.forEach(button => {
        button.disabled = true;
        button.removeEventListener("click", handleLikeButtonClick);
    });

    commentButtons.forEach(button => {
        button.disabled = true;
        button.removeEventListener("click", handleCommentButtonClick);
    });
}
