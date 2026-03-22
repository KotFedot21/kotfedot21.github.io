// DOM элементы
const createPostBtn = document.getElementById("createPostBtn");
const formModal = document.getElementById("formModal");
const overlay = document.getElementById("overlay");
const cancelBtn = document.getElementById("cancelBtn");
const articleForm = document.getElementById("articleForm");
const postsGrid = document.getElementById("postsGrid");
const postTemplate = document.getElementById("postTemplate");
const statsBtn = document.querySelector(
  '.sidebar-btn[title="Показать статистику"]',
);
const statsDialog = document.getElementById("statsDialog");
const closeDialogBtn = document.getElementById("closeDialogBtn");
const totalPostsCountSpan = document.getElementById("totalPostsCount");
const commentsCountSpan = document.getElementById("commentsCount");

// Функции формы
function openForm() {
  if (formModal && overlay) {
    formModal.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeForm() {
  if (formModal && overlay) {
    formModal.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }
  resetForm();
}

// Очистка формы
function resetForm() {
  if (articleForm) articleForm.reset();
  document
    .querySelectorAll(".error-message")
    .forEach((msg) => (msg.style.display = "none"));
  document
    .querySelectorAll(".form-input, .form-textarea")
    .forEach((input) => input.classList.remove("error"));
}

//Форматирование даты
function getFormattedDate() {
  const today = new Date();
  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];
  return `Опубликовано: ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
}

// Добавление поста
// Функция удаления статьи
function deletePost(articleElement, postId) {
  if (!articleElement) return;

  // Добавляем класс для анимации удаления
  articleElement.classList.add("removing");

  // Ждем окончания анимации, затем удаляем элемент
  setTimeout(() => {
    articleElement.remove();
    updateStats(); // Обновляем статистику
    showNotification("Статья удалена", "info");

    // Если был передан postId, можно также удалить из массива
    if (postId !== undefined) {
      // Здесь можно добавить логику удаления из массива данных
      console.log(`Статья с ID ${postId} удалена`);
    }
  }, 300);
}

// Добавление поста с кнопкой удаления
function addPostToPage(title, content, date) {
  if (!postsGrid) {
    console.error("postsGrid не найден");
    return;
  }

  let postElement;
  let article;

  if (postTemplate) {
    postElement = postTemplate.content.cloneNode(true);
    article = postElement.querySelector(".my_blog_article");

    // Удаляем текст, если есть
    const postContent = postElement.querySelector(".post-content");
    if (postContent) {
      postContent.remove();
    }
  } else {
    // Создаем элемент вручную
    article = document.createElement("article");
    article.className = "my_blog_article post-item";

    // Создаем изображение
    const img = document.createElement("img");
    img.className = "post-img";
    img.src = "images/ea2d1b6afe5408fad4c7e9efc468ec520d055669.png";
    img.alt = title;
    article.appendChild(img);

    // Создаем заголовок
    const h3 = document.createElement("h3");
    h3.className = "post-title";
    h3.textContent = title;
    article.appendChild(h3);

    // Создаем дату
    const dateP = document.createElement("p");
    dateP.className = "post-date";
    dateP.textContent = date;
    article.appendChild(dateP);

    postElement = article;
  }

  // Если article еще не определен, получаем его
  if (!article) {
    article = postElement.querySelector(".my_blog_article") || postElement;
  }

  // Заполняем данные
  const postTitle = article.querySelector(".post-title");
  const postDate = article.querySelector(".post-date");
  const postImg = article.querySelector(".post-img");

  if (postTitle) postTitle.textContent = title;
  if (postDate) postDate.textContent = date;
  if (postImg && !postImg.src) {
    postImg.src = "images/ea2d1b6afe5408fad4c7e9efc468ec520d055669.png";
  }

  // СОЗДАЕМ КНОПКУ УДАЛЕНИЯ
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-post-btn";
  deleteBtn.setAttribute("aria-label", "Удалить статью");
  deleteBtn.innerHTML = `
        <svg class="delete-icon" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
    `;

  // Добавляем обработчик удаления
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Останавливаем всплытие события
    deletePost(article);
  });

  // Добавляем кнопку в статью
  article.appendChild(deleteBtn);

  // Генерируем уникальный ID для статьи
  const postId = Date.now();
  article.setAttribute("data-post-id", postId);

  // Добавляем пост в начало сетки
  if (postElement === article) {
    postsGrid.prepend(article);
  } else {
    postsGrid.prepend(postElement);
  }

  // Обновляем статистику
  updateStats();

  // Показываем уведомление
  showNotification("Статья успешно добавлена!");
}

// Функция статистики
function getPostsCount() {
  // Считаем посты в my_blog_next_article
  let totalPosts = document.querySelectorAll(
    ".my_blog_next_article .my_blog_article",
  ).length;

  // Считаем посты в postsGrid
  if (postsGrid) {
    totalPosts += postsGrid.querySelectorAll(
      ".my_blog_article.post-item:not(.removing)",
    ).length;
  }

  return totalPosts;
}
function getCommentsCount() {
  const postsCount = getPostsCount();
  let totalComments = 0;
  for (let i = 0; i < postsCount; i++)
    totalComments += Math.floor(Math.random() * 13);
  return totalComments;
}

function updateStats() {
  if (totalPostsCountSpan) totalPostsCountSpan.textContent = getPostsCount();
  if (commentsCountSpan) commentsCountSpan.textContent = getCommentsCount();
}

function openStatsDialog() {
  if (statsDialog) {
    updateStats();
    statsDialog.showModal();
    document.body.style.overflow = "hidden";
  }
}

function closeStatsDialog() {
  if (statsDialog) {
    statsDialog.close();
    document.body.style.overflow = "";
  }
}

// Добавление постов
function addMockPost() {
  const mockData = [
    {
      title: "Основы веб-разработки",
      date: "Опубликовано: 1 марта 2025",
    },
    {
      title: "Продвинутый CSS",
      date: "Опубликовано: 10 марта 2025",
    },
    {
      title: "JavaScript для начинающих",
      date: "Опубликовано: 20 марта 2025",
    },
  ];
  mockData.forEach((post) => addPostToPage(post.title, "", post.date));
}

//ОБРАБОТЧИК ФОРМЫ
if (articleForm) {
  articleForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const titleInput = document.getElementById("title");
    const contentTextarea = document.getElementById("content");

    const title = titleInput ? titleInput.value.trim() : "";
    const content = contentTextarea ? contentTextarea.value.trim() : "";

    if (!title) {
      showNotification("Пожалуйста, введите заголовок", "error");
      return;
    }

    if (!content) {
      showNotification("Пожалуйста, введите текст статьи", "error");
      return;
    }

    const formattedDate = getFormattedDate();

    addPostToPage(title, content, formattedDate);

    resetForm();

    closeForm();
  });
}

// ИСПРАВЛЕННЫЙ ОБРАБОТЧИК ОТМЕНЫ
if (cancelBtn) {
  cancelBtn.addEventListener("click", () => {
    resetForm();
    closeForm();
  });
}

// Обработчик для кнопки создания статьи
if (createPostBtn) createPostBtn.addEventListener("click", openForm);
if (overlay) overlay.addEventListener("click", closeForm);
if (statsBtn) statsBtn.addEventListener("click", openStatsDialog);
if (closeDialogBtn) closeDialogBtn.addEventListener("click", closeStatsDialog);

if (statsDialog) {
  statsDialog.addEventListener("click", (e) => {
    if (e.target === statsDialog) closeStatsDialog();
  });
  statsDialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeStatsDialog();
  });
}

// Очистка ошибок
const titleInput = document.getElementById("title");
const contentTextarea = document.getElementById("content");
const titleError = document.getElementById("titleError");
const contentError = document.getElementById("contentError");

if (titleInput && titleError) {
  titleInput.addEventListener("input", function () {
    if (this.value.trim()) {
      this.classList.remove("error");
      titleError.style.display = "none";
    }
  });
}
if (contentTextarea && contentError) {
  contentTextarea.addEventListener("input", function () {
    if (this.value.trim()) {
      this.classList.remove("error");
      contentError.style.display = "none";
    }
  });
}

// Функция уведомлений
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.textContent = message;

  let bgColor;
  switch (type) {
    case "error":
      bgColor = "#dc3545";
      break;
    case "info":
      bgColor = "#28a745";
      break;
    case "warning":
      bgColor = "#ffc107";
      break;
    default:
      bgColor = "#28a745";
  }

  notification.style.cssText = `
        position: fixed; 
        bottom: 30px; 
        left: 50%; 
        transform: translateX(-50%); 
        background: ${bgColor}; 
        color: white; 
        padding: 12px 24px; 
        border-radius: 50px; 
        font-size: 14px; 
        z-index: 2000; 
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transform = "translateX(-50%) translateY(20px)";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Запуск
document.addEventListener("DOMContentLoaded", () => {
  updateStats();
  addMockPost();
});
