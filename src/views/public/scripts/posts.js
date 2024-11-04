// /scripts/posts.js

import { createPost, fetchCategories } from "./ui.js";

let currentPage = 1;
const limit = 5; // Кількість постів на сторінку

const myPostsContainer = document.getElementById("myPostsContainer");
const postsContainer = document.getElementById("postsContainer");

// Функція для отримання та рендерингу постів
export async function fetchAndRenderPosts(page = 1) {
    currentPage = page;
    try {
        const response = await fetch(`/api/posts/paginated?page=${page}&limit=${limit}`, {
            method: "GET",
            // headers: {
            //     // Якщо доступ до постів дозволений для неавторизованих користувачів, можна не передавати токен
            //     "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            // },
        });

        if (response.ok) {
            const { posts, total } = await response.json();

            renderPosts(posts);
            renderPaginationControls(currentPage, Math.ceil(total / limit));
        } else {
            console.error("Не вдалося завантажити пости. Статус:", response.status);
            postsContainer.innerHTML = "<p>Помилка завантаження постів. Спробуйте пізніше.</p>";
        }
    } catch (error) {
        console.error("Помилка при завантаженні постів:", error);
        postsContainer.innerHTML = "<p>Помилка завантаження постів. Спробуйте пізніше.</p>";
    }
}

export async function fetchAndRenderUserPosts() {
    try {
        const response = await fetch(`/api/posts/my-posts`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            },
        });

        console.log(response);

        if (response.ok) {
            const posts = await response.json();
            renderUserPosts(posts);
        } else {
            console.error("Не вдалося завантажити пости користувача. Статус:", response.status);
            myPostsContainer.innerHTML = "<p>Помилка завантаження постів. Спробуйте пізніше.</p>";
        }
    } catch (error) {
        console.error("Помилка при завантаженні постів користувача:", error);
        myPostsContainer.innerHTML = "<p>Помилка завантаження постів. Спробуйте пізніше.</p>";
    }
}

// Функція для рендерингу постів
function renderPosts(posts) {
    console.log('Rendering posts: ', posts);
    postsContainer.innerHTML = "";

    if (posts.length > 0) {
        posts.forEach((post, index) => {
            console.log('Rendering post: ', post);
            const postElement = document.createElement("div");
            postElement.classList.add("post");

            // Додаємо обробник події для кліку на пост
            postElement.addEventListener("click", () => {
                window.location.href = `post?postId=${post.id}`;
            });

            // Формуємо HTML-розмітку для поста з форматованою датою
            const formattedDate = formatDate(post.createdAt);

            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <div class="post-meta">
                    <span class="author">Автор: ${post.author}</span> |
                    <span class="date">Дата: ${formattedDate}</span> |
                    <span class="categories">Категорії: ${post.categoryTitles.join(", ")}</span>
                </div>
                <p>${post.content}</p>
                <div class="post-stats">
                    <span class="like-count">👍 ${post.likesCount}</span>
                    <span class="dislike-count">👎 ${post.dislikesCount}</span>
                    <span class="comment-count">💬 ${post.commentsCount}</span>
                </div>
            `;

            // Додаємо пост в контейнер
            postsContainer.appendChild(postElement);

            // Додаємо клас .show з затримкою для створення ефекту
            setTimeout(() => {
                postElement.classList.add('show');
            }, index * 100); // Затримка між появою постів (100ms між кожним)
        });
    } else {
        postsContainer.innerHTML = "<p>Немає доступних постів.</p>";
    }
}

function renderUserPosts(posts) {
    myPostsContainer.innerHTML = "";

    if (posts.length > 0) {
        posts.forEach((post, index) => {
            const postElement = document.createElement("div");
            postElement.classList.add("post");

            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <div class="post-meta">
                    <span class="date">Дата: ${formatDate(post.createdAt)}</span> |
                    <span class="categories">Категорії: ${post.categoryTitles.join(", ")}</span>
                </div>
                
                <p>${post.content}</p>
                <div class="post-stats"> 
                    <span class="like-count likeButton" data-post-id="${post.id}">👍 ${post.likesCount}</span>
                    <span class="dislike-count">👎 ${post.dislikesCount}</span>
                    <span class="comment-count commentButton" data-post-id="${post.id}">💬 ${post.commentsCount}</span>
                </div>
                <div class="post-actions">
                    <button class="edit-post-button" data-post-id="${post.id}">Редагувати</button>
                    <button class="delete-post-button" data-post-id="${post.id}">Видалити</button>
                </div>
            `;
            myPostsContainer.appendChild(postElement);

            // Додаємо клас .show з затримкою для створення ефекту
            setTimeout(() => {
                postElement.classList.add('show');
            }, index * 100); // Затримка між появою постів (100ms між кожним)
        });

        // Додаємо обробники подій для кнопок редагування та видалення
        attachUserPostHandlers();
    } else {
        myPostsContainer.innerHTML = "<p>У вас немає постів.</p>";
    }
}

// Функція для додавання обробників подій
function attachUserPostHandlers() {
    const editButtons = document.querySelectorAll(".edit-post-button");
    const deleteButtons = document.querySelectorAll(".delete-post-button");

    editButtons.forEach(button => {
        button.addEventListener("click", handleEditPost);
    });

    deleteButtons.forEach(button => {
        button.addEventListener("click", handleDeletePost);
    });
}

// Іменована функція для оновлення поста
function handleUpdatePost(postId) {
    return async () => {
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
            const response = await fetch(`/api/posts/update/${postId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    content,
                    categoryIds: selectedCategories,
                }),
            });

            if (response.ok) {
                alert("Пост успішно оновлено!");
                // Повертаємося до списку постів користувача
                createPostForm.style.display = "none";
                myPostsContainer.style.display = "block";
                postsContainer.style.display = "none"; // Приховуємо загальний контейнер постів, якщо він не потрібен

                // Оновлюємо текст кнопки назад до "Створити"
                submitPostButton.textContent = "Створити";

                // Видаляємо обробник для оновлення поста
                submitPostButton.removeEventListener("click", handleUpdatePost(postId));

                // Додаємо обробник для створення поста знову
                submitPostButton.addEventListener("click", createPost);

                // Оновлюємо список постів користувача
                await fetchAndRenderUserPosts();
            } else {
                console.error("Не вдалося оновити пост. Статус:", response.status);
                alert("Не вдалося оновити пост.");
            }
        } catch (error) {
            console.error("Помилка при оновленні поста:", error);
            alert("Помилка при оновленні поста.");
        }
    };
}

// Обробник для редагування поста
async function handleEditPost(event) {
    event.stopPropagation(); // Запобігаємо переходу на сторінку поста при кліку на кнопку

    const postId = event.target.getAttribute("data-post-id");

    try {
        // Отримуємо дані поста
        const response = await fetch(`/api/posts/${postId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            },
        });

        if (response.ok) {
            const post = await response.json();

            // Заповнюємо форму редагування даними поста
            document.getElementById("postTitle").value = post.title;
            document.getElementById("postContent").value = post.content;

            // Показуємо форму редагування
            createPostForm.style.display = "block";
            myPostsContainer.style.display = "none";
            postsContainer.style.display = "none"; // Приховуємо загальний контейнер постів

            // Завантажуємо категорії з попереднім вибором
            await fetchCategories(post.categoryIds); // Передаємо список категорій

            // Змінюємо функціональність кнопки "Створити" на "Оновити"
            submitPostButton.textContent = "Оновити";

            // Видаляємо існуючі обробники, щоб уникнути дублювання
            submitPostButton.removeEventListener("click", createPost);
            submitPostButton.removeEventListener("click", handleUpdatePost(postId));

            // Додаємо обробник для оновлення поста
            const updateHandler = handleUpdatePost(postId);
            submitPostButton.addEventListener("click", updateHandler);
        } else {
            console.error("Не вдалося отримати пост для редагування. Статус:", response.status);
            alert("Не вдалося отримати пост для редагування.");
        }
    } catch (error) {
        console.error("Помилка при отриманні поста для редагування:", error);
        alert("Помилка при отриманні поста для редагування.");
    }
}

// Обробник для видалення поста
async function handleDeletePost(event) {
    event.stopPropagation(); // Запобігаємо переходу на сторінку поста при кліку на кнопку

    const postId = event.target.getAttribute("data-post-id");

    if (confirm("Ви впевнені, що хочете видалити цей пост?")) {
        try {
            const response = await fetch(`/api/posts/delete/${postId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                },
            });

            if (response.ok) {
                alert("Пост успішно видалено.");
                // Оновлюємо список постів
                await fetchAndRenderUserPosts();
            } else {
                console.error("Не вдалося видалити пост. Статус:", response.status);
                alert("Не вдалося видалити пост.");
            }
        } catch (error) {
            console.error("Помилка при видаленні поста:", error);
            alert("Помилка при видаленні поста.");
        }
    }
}

// Функція для рендерингу пагінації
export function renderPaginationControls(currentPage, totalPages) {
    let paginationContainer = document.getElementById("paginationContainer");

    if (!paginationContainer) {
        paginationContainer = document.createElement("div");
        paginationContainer.id = "paginationContainer";
        postsContainer.parentNode.appendChild(paginationContainer);
    }

    paginationContainer.innerHTML = "";

    if (currentPage > 1) {
        const prevButton = document.createElement("button");
        prevButton.textContent = "Попередня";
        prevButton.classList.add("button", "button-back");
        prevButton.addEventListener("click", () => {
            fetchAndRenderPosts(currentPage - 1);
        });
        paginationContainer.appendChild(prevButton);
    }

    if (currentPage < totalPages) {
        const nextButton = document.createElement("button");
        nextButton.textContent = "Наступна";
        nextButton.classList.add("button");
        nextButton.addEventListener("click", () => {
            fetchAndRenderPosts(currentPage + 1);
        });
        paginationContainer.appendChild(nextButton);
    }
}

// Функції для обробки лайків та коментарів
export function attachLikeAndCommentHandlers() {
    const likeButtons = document.querySelectorAll(".likeButton");
    const commentButtons = document.querySelectorAll(".commentButton");

    likeButtons.forEach(button => {
        button.addEventListener("click", handleLikeButtonClick);
    });

    commentButtons.forEach(button => {
        button.addEventListener("click", handleCommentButtonClick);
    });
}

function handleLikeButtonClick(event) {
    const postId = event.target.getAttribute("data-post-id");
    console.log("Натиснуто кнопку Like для поста:", postId);
    // Логіка для лайку поста
}

function handleCommentButtonClick(event) {
    const postId = event.target.getAttribute("data-post-id");
    console.log("Натиснуто кнопку Comment для поста:", postId);
    // Логіка для коментування поста
}

function formatDate(isoString) {
    const date = new Date(isoString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // 24-годинний формат
    };
    return date.toLocaleString('uk-UA', options); // Використовуємо українську локаль
}
