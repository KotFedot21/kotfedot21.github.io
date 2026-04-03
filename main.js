// DOM элементы
const createPostBtn = document.getElementById("createPostBtn");
const postDialog = document.getElementById("postDialog");
const statsDialog = document.getElementById("statsDialog");
const cancelFormBtn = document.getElementById("cancelFormBtn");
const closeStatsDialogBtn = document.getElementById("closeStatsDialogBtn");
const articleForm = document.getElementById("articleForm");
const totalPostsCountSpan = document.getElementById("totalPostsCount");
const commentsCountSpan = document.getElementById("commentsCount");
const statsBtn = document.getElementById("statsBtn");

// Получаем элементы формы для валидации
const titleInput = document.getElementById("title");
const contentTextarea = document.getElementById("content");
const titleError = document.getElementById("titleError");
const contentError = document.getElementById("contentError");

// Функции для диалогов
function openPostDialog() {
  postDialog?.showModal();
  document.body.style.overflow = "hidden";
  // Очищаем ошибки при открытии диалога
  clearFieldError(titleInput, titleError);
  clearFieldError(contentTextarea, contentError);
  // Очищаем значения полей
  if (titleInput) titleInput.value = "";
  if (contentTextarea) contentTextarea.value = "";
}

function closePostDialog() {
  postDialog?.close();
  document.body.style.overflow = "";
  articleForm?.reset();

  // Очищаем ошибки после закрытия
  clearFieldError(titleInput, titleError);
  clearFieldError(contentTextarea, contentError);
}

function openStatsDialog() {
  if (statsDialog) {
    updateStats();
    statsDialog.showModal();
    document.body.style.overflow = "hidden";
  }
}

function closeStatsDialog() {
  statsDialog?.close();
  document.body.style.overflow = "";
}

// Функция добавления поста
function addPostToPage(title, content, date) {
  const blogContainer = document.querySelector(".articles-grid");

  if (!blogContainer) {
    console.error("Контейнер .articles-grid не найден");
    showNotification("Ошибка: контейнер для статей не найден", "error");
    return;
  }

  const newPost = document.createElement("article");
  newPost.className = "article-card";

  const img = document.createElement("img");
  img.src = "../images/ea2d1b6afe5408fad4c7e9efc468ec520d055669.png";
  img.alt = title;

  const contentDiv = document.createElement("div");
  contentDiv.className = "article-card-content";

  const h3 = document.createElement("h3");
  h3.textContent = title;

  const descP = document.createElement("p");
  descP.className = "article-description";
  descP.textContent = content;

  const dateP = document.createElement("p");
  dateP.className = "article-date";
  dateP.textContent = date;

  contentDiv.appendChild(h3);
  contentDiv.appendChild(descP);
  contentDiv.appendChild(dateP);

  newPost.appendChild(img);
  newPost.appendChild(contentDiv);

  blogContainer.prepend(newPost);

  updateStats();
  showNotification(`Статья "${title}" успешно добавлена!`, "success");
}

// Функция статистики
function getPostsCount() {
  return document.querySelectorAll(".articles-grid .article-card").length;
}

function getCommentsCount() {
  const postsCount = getPostsCount();
  let totalComments = 0;
  for (let i = 0; i < postsCount; i++) {
    totalComments += Math.floor(Math.random() * 13);
  }
  return totalComments;
}

function updateStats() {
  if (totalPostsCountSpan) totalPostsCountSpan.textContent = getPostsCount();
  if (commentsCountSpan) commentsCountSpan.textContent = getCommentsCount();
}

// Добавление тестовых постов
function addMockPost() {
  const mockData = [
    {
      title: "Основы веб-разработки",
      date: "Опубликовано: 1 марта 2025",
      content:
        "Введение в веб-разработку. Изучаем HTML, CSS и основы создания сайтов.",
    },
    {
      title: "Продвинутый CSS",
      date: "Опубликовано: 10 марта 2025",
      content:
        "Глубокое погружение в CSS. Flexbox, Grid, анимации и адаптивный дизайн.",
    },
    {
      title: "JavaScript для начинающих",
      date: "Опубликовано: 20 марта 2025",
      content:
        "Основы JavaScript: переменные, функции, события и работа с DOM.",
    },
  ];
  mockData.forEach((post) =>
    addPostToPage(post.title, post.content, post.date),
  );
}

// Функция уведомлений
function showNotification(message, type = "success", duration = 2000) {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("hide");
    setTimeout(() => notification?.remove(), 300);
  }, duration);
}

// Вспомогательная функция для названия месяца
function getMonthName(monthIndex) {
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
  return months[monthIndex];
}

// Функции для отображения ошибок
function showFieldError(field, errorElement, message) {
  if (!field || !errorElement) return;

  field.classList.add("error");
  errorElement.textContent = message || "Пожалуйста, заполните это поле";
  errorElement.style.display = "block";
  errorElement.classList.add("visible");

  // Добавляем красную обводку полю
  field.style.borderColor = "#dc3545";
}

function clearFieldError(field, errorElement) {
  if (!field || !errorElement) return;

  field.classList.remove("error");
  errorElement.style.display = "none";
  errorElement.classList.remove("visible");

  // Восстанавливаем стандартную обводку
  field.style.borderColor = "";
}

// Обработчик валидации заголовка
function validateTitle() {
  const titleValue = titleInput?.value.trim() || "";
  const isValid = titleValue !== "";

  if (isValid) {
    clearFieldError(titleInput, titleError);
  } else {
    showFieldError(titleInput, titleError, "Пожалуйста, заполните заголовок");
  }

  return isValid;
}

// Обработчик валидации текста
function validateContent() {
  const contentValue = contentTextarea?.value.trim() || "";
  const isValid = contentValue !== "";

  if (isValid) {
    clearFieldError(contentTextarea, contentError);
  } else {
    showFieldError(
      contentTextarea,
      contentError,
      "Пожалуйста, заполните текст статьи",
    );
  }

  return isValid;
}

// Валидация всей формы
function validateForm() {
  const isTitleValid = validateTitle();
  const isContentValid = validateContent();

  return isTitleValid && isContentValid;
}

// Обработчик отправки формы
function handleFormSubmit(event) {
  event.preventDefault();

  if (!validateForm()) {
    showNotification("Пожалуйста, заполните все обязательные поля", "error");
    return;
  }

  const title = titleInput.value.trim();
  const content = contentTextarea.value.trim();
  const now = new Date();
  const dateStr = `Опубликовано: ${now.getDate()} ${getMonthName(now.getMonth())} ${now.getFullYear()}`;

  addPostToPage(title, content, dateStr);
  closePostDialog();
  showNotification("Статья успешно создана!", "success");
}

// Обработчик ввода в поле заголовка
function handleTitleInput(event) {
  const input = event.target;
  const value = input.value.trim() || "";

  if (value) {
    clearFieldError(titleInput, titleError);
  } else {
    showFieldError(titleInput, titleError, "Пожалуйста, заполните заголовок");
  }
}

// Обработчик потери фокуса заголовком
function handleTitleBlur(event) {
  const input = event.target;
  const value = input.value.trim() || "";

  if (!value) {
    showFieldError(titleInput, titleError, "Пожалуйста, заполните заголовок");
  }
}

// Обработчик ввода в поле текста
function handleContentInput(event) {
  const textarea = event.target;
  const value = textarea.value.trim() || "";

  if (value) {
    clearFieldError(contentTextarea, contentError);
  } else {
    showFieldError(
      contentTextarea,
      contentError,
      "Пожалуйста, заполните текст статьи",
    );
  }
}

// Обработчик потери фокуса текстом
function handleContentBlur(event) {
  const textarea = event.target;
  const value = textarea.value.trim() || "";

  if (!value) {
    showFieldError(
      contentTextarea,
      contentError,
      "Пожалуйста, заполните текст статьи",
    );
  }
}

// Инициализация обработчиков
createPostBtn?.addEventListener("click", openPostDialog);
cancelFormBtn?.addEventListener("click", closePostDialog);
statsBtn?.addEventListener("click", openStatsDialog);
closeStatsDialogBtn?.addEventListener("click", closeStatsDialog);

// Обработчики формы
articleForm?.addEventListener("submit", handleFormSubmit);

// Обработчики валидации
titleInput?.addEventListener("input", handleTitleInput);
titleInput?.addEventListener("blur", handleTitleBlur);
contentTextarea?.addEventListener("input", handleContentInput);
contentTextarea?.addEventListener("blur", handleContentBlur);

// Обработчики для диалога создания поста
const postDialogCloseBtn = postDialog?.querySelector(".dialog-close");
postDialogCloseBtn?.addEventListener("click", closePostDialog);

postDialog?.addEventListener("click", (event) => {
  if (event.target === postDialog) closePostDialog();
});

postDialog?.addEventListener("cancel", (event) => {
  event.preventDefault();
  closePostDialog();
});

// Обработчики для диалога статистики
statsDialog?.addEventListener("click", (event) => {
  if (event.target === statsDialog) closeStatsDialog();
});

statsDialog?.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeStatsDialog();
});

// Инициализация
updateStats();
addMockPost();
showNotification("Добро пожаловать в блог!", "info", 3000);
