// post.js
import { initAuth } from '/scripts/auth.js';

// Елементи DOM
const postTitleElement = document.getElementById('post-title');
const postAuthorElement = document.getElementById('post-author');
const postContentElement = document.getElementById('post-content');
const postLikesCountElement = document.getElementById('post-likes-count');
const postDislikesCountElement = document.getElementById('post-dislikes-count');
const postCommentsCountElement = document.getElementById('post-comments-count');
const postLikeButton = document.getElementById('post-like-button');
const postDislikeButton = document.getElementById('post-dislike-button');
const commentsListElement = document.getElementById('comments-list');
const addCommentForm = document.getElementById('add-comment-form');
const commentContentInput = document.getElementById('comment-content');
const addCommentSection = document.getElementById('add-comment-section');

// Отримуємо `postId` з URL
function getPostIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('postId');
}

// Змінні для використання в коді
const postId = getPostIdFromURL();

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', async () => {
  await initAuth(); // Чекаємо на перевірку автентифікації

  if (!postId) {
    alert('Пост не знайдено. Неправильний ідентифікатор.');
    return;
  }

  // Перевірка автентифікації та модифікація UI
  checkAuthenticationAndModifyUI();

  // Отримуємо та відображаємо дані посту
  fetchPostData();

  // Отримуємо та відображаємо коментарі до посту
  fetchComments();

  // Додаємо обробники подій для кнопок лайку/дизлайку посту
  postLikeButton.addEventListener('click', () => handlePostLikeDislike('like'));
  postDislikeButton.addEventListener('click', () => handlePostLikeDislike('dislike'));

  // Обробляємо відправку форми додавання коментаря
  if (localStorage.getItem('authToken')) {
    addCommentForm.addEventListener('submit', handleAddComment);
  }
});

// Функція для перевірки автентифікації та зміни UI
function checkAuthenticationAndModifyUI() {
  const isAuth = localStorage.getItem('authToken') !== null;

  if (!isAuth) {
    // Приховуємо форму додавання коментаря
    addCommentSection.innerHTML = '<p>Будь ласка, <a href="/login">увійдіть</a>, щоб залишити коментар.</p>';
  } else {
    // Показуємо форму додавання коментаря
    addCommentSection.style.display = 'block';
  }
}

// Функція для отримання даних посту
function fetchPostData() {
  fetch(`/api/posts/${postId}`)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Не вдалося отримати дані посту.');
      }
    })
    .then(post => {
      displayPost(post);
    })
    .catch(error => {
      console.error('Помилка при отриманні посту:', error);
      alert('Помилка при отриманні посту.');
    });
}

// Функція для відображення даних посту
function displayPost(post) {
  postTitleElement.textContent = post.title;
  postAuthorElement.textContent = `Автор: ${post.author}`;
  postContentElement.innerHTML = post.content;
  postLikesCountElement.textContent = post.likesCount;
  postDislikesCountElement.textContent = post.dislikesCount;
  postCommentsCountElement.textContent = `${post.commentsCount} коментарів`;
}

// Функція для обробки лайку/дизлайку посту
function handlePostLikeDislike(type) {
  if (!localStorage.getItem('authToken')) {
    alert('Для цієї дії потрібно увійти в систему.');
    return;
  }

  const token = localStorage.getItem('authToken');

  fetch(`/api/likes/post/${postId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ type })
  })
  .then(response => {
    if (response.ok) {
      fetchPostData();
    } else {
      throw new Error('Не вдалося виконати дію.');
    }
  })
  .catch(error => {
    console.error('Помилка при лайку/дизлайку посту:', error);
  });
}

// Функція для отримання коментарів верхнього рівня
function fetchComments() {
  fetch(`/api/comments/post/${postId}`)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Не вдалося отримати коментарі.');
      }
    })
    .then(comments => {
      displayComments(comments);
    })
    .catch(error => {
      console.error('Помилка при отриманні коментарів:', error);
    });
}

// Функція для відображення коментарів верхнього рівня
function displayComments(comments) {
  commentsListElement.innerHTML = '';

  if (!comments || comments.length === 0) {
    commentsListElement.innerHTML = '<p>Немає коментарів.</p>';
    return;
  }

  comments.forEach(comment => {
    const commentElement = createCommentElement(comment);
    commentsListElement.appendChild(commentElement);
  });
}

// Функція для створення елемента коментаря
function createCommentElement(comment) {
  const commentDiv = document.createElement('div');
  commentDiv.classList.add('comment');

  const contentP = document.createElement('p');
  contentP.textContent = comment.content;

  const authorP = document.createElement('p');
  authorP.textContent = `Автор: ${comment.author}`;

  const metaDiv = document.createElement('div');
  metaDiv.classList.add('comment-meta');

  const likeButton = document.createElement('button');
  likeButton.textContent = `👍 (${comment.likeCount})`;
  likeButton.addEventListener('click', () => handleCommentLikeDislike(comment.id, 'like'));

  const dislikeButton = document.createElement('button');
  dislikeButton.textContent = `👎 (${comment.dislikeCount})`;
  dislikeButton.addEventListener('click', () => handleCommentLikeDislike(comment.id, 'dislike'));

  // Кнопка для показу/приховування відповідей
  const replyCountButton = document.createElement('button');
  replyCountButton.textContent = `${comment.replyCount} відповідей`;
  replyCountButton.addEventListener('click', () => toggleReplies(comment.id, commentDiv, replyCountButton));

  metaDiv.appendChild(likeButton);
  metaDiv.appendChild(dislikeButton);
  metaDiv.appendChild(replyCountButton);

  commentDiv.appendChild(contentP);
  commentDiv.appendChild(authorP);
  commentDiv.appendChild(metaDiv);

  return commentDiv;
}

// Функція для обробки лайку/дизлайку коментаря
function handleCommentLikeDislike(commentId, type) {
  if (!localStorage.getItem('authToken')) {
    alert('Для цієї дії потрібно увійти в систему.');
    return;
  }

  const token = localStorage.getItem('authToken');

  fetch(`/api/likes/comment/${commentId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ type })
  })
  .then(response => {
    if (response.ok) {
      fetchComments();
    } else {
      throw new Error('Не вдалося виконати дію.');
    }
  })
  .catch(error => {
    console.error('Помилка при лайку/дизлайку коментаря:', error);
  });
}

// Функція для додавання нового коментаря
function handleAddComment(event) {
  event.preventDefault();

  const content = commentContentInput.value.trim();

  if (!content) {
    alert('Коментар не може бути порожнім.');
    return;
  }

  const token = localStorage.getItem('authToken');

  fetch('/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ content, postId })
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Не вдалося додати коментар.');
    }
  })
  .then(newComment => {
    // Очищаємо поле вводу
    commentContentInput.value = '';
    // Додаємо новий коментар до списку
    const commentElement = createCommentElement(newComment);
    commentsListElement.prepend(commentElement);
    // Оновлюємо кількість коментарів
    updateCommentsCount(1);
  })
  .catch(error => {
    console.error('Помилка при додаванні коментаря:', error);
  });
}

// Функція для оновлення кількості коментарів
function updateCommentsCount(delta) {
  const currentCount = parseInt(postCommentsCountElement.textContent) || 0;
  postCommentsCountElement.textContent = `${currentCount + delta} коментарів`;
}

// Функція для показу/приховування відповідей на коментар
function toggleReplies(commentId, commentDiv, replyCountButton) {
  let repliesContainer = commentDiv.querySelector('.replies-container');

  if (repliesContainer) {
    // Якщо відповіді вже завантажені, приховуємо або показуємо їх
    repliesContainer.classList.toggle('hidden');
    // Змінюємо текст кнопки
    if (repliesContainer.classList.contains('hidden')) {
      replyCountButton.textContent = replyCountButton.textContent.replace('Приховати', `${repliesContainer.dataset.replyCount} відповідей`);
    } else {
      replyCountButton.textContent = 'Приховати відповіді';
    }
  } else {
    // Якщо відповіді ще не завантажені, отримуємо їх з сервера
    fetch(`/api/comments/${commentId}/replies`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Не вдалося отримати відповіді на коментар.');
        }
      })
      .then(replies => {
        repliesContainer = document.createElement('div');
        repliesContainer.classList.add('replies-container');
        repliesContainer.dataset.replyCount = replies.length;

        // Відображаємо відповіді
        replies.forEach(reply => {
          const replyElement = createCommentElement(reply);
          repliesContainer.appendChild(replyElement);
        });

        // Додаємо форму для додавання відповіді
        if (localStorage.getItem('authToken')) {
          const replyFormDiv = createReplyForm(commentId, repliesContainer);
          repliesContainer.appendChild(replyFormDiv);
        }

        commentDiv.appendChild(repliesContainer);
        // Змінюємо текст кнопки
        replyCountButton.textContent = 'Приховати відповіді';
      })
      .catch(error => {
        console.error('Помилка при отриманні відповідей:', error);
      });
  }
}

// Функція для створення форми відповіді
function createReplyForm(parentCommentId, repliesContainer) {
  const replyFormDiv = document.createElement('div');
  replyFormDiv.classList.add('reply-form');

  const replyForm = document.createElement('form');
  const replyTextarea = document.createElement('textarea');
  replyTextarea.required = true;

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Надіслати';

  replyForm.appendChild(replyTextarea);
  replyForm.appendChild(submitButton);
  replyFormDiv.appendChild(replyForm);

  // Обробник події для відправки відповіді
  replyForm.addEventListener('submit', (event) => {
    event.preventDefault();
    handleAddReply(replyTextarea.value, parentCommentId, repliesContainer);
    replyTextarea.value = ''; // Очищаємо поле вводу
  });

  return replyFormDiv;
}

// Функція для додавання відповіді на коментар
function handleAddReply(content, parentCommentId, repliesContainer) {
  if (!localStorage.getItem('authToken')) {
    alert('Для цієї дії потрібно увійти в систему.');
    return;
  }

  if (!content.trim()) {
    alert('Відповідь не може бути порожньою.');
    return;
  }

  const token = localStorage.getItem('authToken');

  fetch('/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ content, postId, parentCommentId })
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Не вдалося додати відповідь.');
    }
  })
  .then(newReply => {
    // Додати нову відповідь до контейнера
    const replyElement = createCommentElement(newReply);
    repliesContainer.insertBefore(replyElement, repliesContainer.lastElementChild); // Перед формою відповіді

    // Оновлюємо кількість відповідей
    const replyCount = parseInt(repliesContainer.dataset.replyCount) || 0;
    repliesContainer.dataset.replyCount = replyCount + 1;

    // Оновлюємо текст кнопки кількості відповідей у батьківському коментарі
    const replyCountButton = repliesContainer.parentElement.querySelector('.comment-meta button:nth-child(3)');
    replyCountButton.textContent = `${replyCount + 1} відповідей`;
  })
  .catch(error => {
    console.error('Помилка при додаванні відповіді:', error);
  });
}
