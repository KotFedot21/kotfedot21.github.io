//DOM ЭЛЕМЕНТЫ

const createPostBtn = document.getElementById("createPostBtn");
const postDialog = document.getElementById("postDialog");
const statsDialog = document.getElementById("statsDialog");
const cancelFormBtn = document.getElementById("cancelFormBtn");
const closeStatsDialogBtn = document.getElementById("closeStatsDialogBtn");
const statsBtn = document.getElementById("statsBtn");
const articleForm = document.getElementById("articleForm");
const totalPostsCountSpan = document.getElementById("totalPostsCount");
const commentsCountSpan = document.getElementById("commentsCount");
const titleInput = document.getElementById("title");
const contentTextarea = document.getElementById("content");
const titleError = document.getElementById("titleError");
const contentError = document.getElementById("contentError");
const confirmDialog = document.getElementById("confirmDeleteDialog");
const confirmDialogTitle = document.getElementById("confirmDialogTitle");
const confirmDialogMessage = document.getElementById("confirmDialogMessage");
const confirmYesBtn = document.getElementById("confirmYesBtn");
const confirmNoBtn = document.getElementById("confirmNoBtn");
const emptyStateTemplate = document.getElementById("emptyStateTemplate");
const articleCardTemplate = document.getElementById("articleCardTemplate");
let currentDeleteTarget = null;

function showConfirmDialog(title, message) {
  return new Promise((resolve) => {
    confirmDialogTitle.textContent = title;
    confirmDialogMessage.textContent = message;

    const handleYes = () => {
      cleanup();
      resolve(true);
    };

    const handleNo = () => {
      cleanup();
      resolve(false);
    };

    const handleBackdrop = (e) => {
      if (e.target === confirmDialog) {
        cleanup();
        resolve(false);
      }
    };

    const handleCancel = (e) => {
      e.preventDefault();
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      confirmYesBtn.removeEventListener("click", handleYes);
      confirmNoBtn.removeEventListener("click", handleNo);
      confirmDialog.removeEventListener("click", handleBackdrop);
      confirmDialog.removeEventListener("cancel", handleCancel);
      confirmDialog.close();
    };

    confirmYesBtn.addEventListener("click", handleYes);
    confirmNoBtn.addEventListener("click", handleNo);
    confirmDialog.addEventListener("click", handleBackdrop);
    confirmDialog.addEventListener("cancel", handleCancel);

    confirmDialog.showModal();
  });
}

//УДАЛЕНИЕ СТАТЬИ
async function deletePost(articleElement) {
  const confirmed = await showConfirmDialog(
    "Удалить статью?",
    "Вы уверены, что хотите удалить эту статью? Это действие нельзя отменить.",
  );

  if (!confirmed) return;

  articleElement.classList.add("deleting");

  setTimeout(() => {
    articleElement.remove();
    updateStats();
    showNotification("Статья успешно удалена", "info");

    const remainingPosts = document.querySelectorAll(
      ".articles-grid .article-card",
    ).length;
    if (remainingPosts === 0) {
      showEmptyStateMessage();
    }
  }, 300);
}

function showEmptyStateMessage() {
  const blogContainer = document.querySelector(".articles-grid");
  if (!blogContainer) return;

  const existingEmpty = blogContainer.querySelector(".empty-state");
  if (existingEmpty) return;

  if (emptyStateTemplate) {
    const emptyState = emptyStateTemplate.content.cloneNode(true);
    blogContainer.appendChild(emptyState);
  }
}

function addDeleteButtonsToExistingPosts() {
  const existingPosts = document.querySelectorAll(
    ".articles-grid .article-card",
  );

  existingPosts.forEach((post) => {
    const deleteBtn = post.querySelector(".delete-post-btn");
    if (!deleteBtn) return;

    const newDeleteBtn = deleteBtn.cloneNode(true);
    deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);

    newDeleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deletePost(post);
    });
  });
}

//ОЧИСТКА ФОРМЫ
function resetForm() {
  if (articleForm) {
    articleForm.reset();
  }

  clearFieldError(titleInput, titleError);
  clearFieldError(contentTextarea, contentError);

  if (titleInput) titleInput.style.borderColor = "";
  if (contentTextarea) contentTextarea.style.borderColor = "";
}
function closeAndClearPostDialog() {
  resetForm();
  closePostDialog();
}

//ДИАЛОГИ

function openPostDialog() {
  postDialog?.showModal();
  document.body.style.overflow = "hidden";
  resetForm();
}

function closePostDialog() {
  postDialog?.close();
  document.body.style.overflow = "";
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

//ДОБАВЛЕНИЕ ПОСТА

function addPostToPage(title, content, date) {
  const blogContainer = document.querySelector(".articles-grid");

  if (!blogContainer) {
    console.error("Контейнер .articles-grid не найден");
    showNotification("Ошибка: контейнер для статей не найден", "error");
    return;
  }
  const emptyState = blogContainer.querySelector(".empty-state");
  if (emptyState) emptyState.remove();
  if (!articleCardTemplate) {
    console.error("Шаблон articleCardTemplate не найден");
    return;
  }

  const newPostFragment = articleCardTemplate.content.cloneNode(true);
  const article = newPostFragment.querySelector(".article-card");

  const img = newPostFragment.querySelector(".article-img");
  const titleEl = newPostFragment.querySelector(".article-title");
  const descEl = newPostFragment.querySelector(".article-description");
  const dateEl = newPostFragment.querySelector(".article-date");
  const deleteBtn = newPostFragment.querySelector(".delete-post-btn");

  if (img) img.alt = title;
  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = content;
  if (dateEl) dateEl.textContent = date;
  if (deleteBtn) {
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deletePost(article);
    });
  }

  blogContainer.prepend(article);
  updateStats();
  showNotification(`Статья "${title}" успешно добавлена!`, "success");
}

//СТАТИСТИКА

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

//ДОБАВЛЕНИЕ ПОСТОВ

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

//УВЕДОМЛЕНИЙ

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

//ОТОБРАЖЕНИЕ ОШИБОК

function showFieldError(field, errorElement, message) {
  if (!field || !errorElement) return;

  field.classList.add("error");
  errorElement.textContent = message || "Пожалуйста, заполните это поле";
  errorElement.style.display = "block";
  errorElement.classList.add("visible");
  field.style.borderColor = "#dc3545";
}

function clearFieldError(field, errorElement) {
  if (!field || !errorElement) return;

  field.classList.remove("error");
  errorElement.style.display = "none";
  errorElement.classList.remove("visible");
  field.style.borderColor = "";
}

//ВАЛИДАЦИЯ

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

function validateForm() {
  const isTitleValid = validateTitle();
  const isContentValid = validateContent();

  return isTitleValid && isContentValid;
}

//ОБРАБОТЧИКИ ФОРМЫ

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
  closeAndClearPostDialog();
  showNotification("Статья успешно создана!", "success");
}

function handleCancelForm() {
  closeAndClearPostDialog();
  showNotification("Создание статьи отменено", "info", 1500);
}

//ОБРАБОТЧИКИ ВАЛИДАЦИИ

function handleTitleInput(event) {
  const input = event.target;
  const value = input.value.trim() || "";

  if (value) {
    clearFieldError(titleInput, titleError);
  } else {
    showFieldError(titleInput, titleError, "Пожалуйста, заполните заголовок");
  }
}

function handleTitleBlur(event) {
  const input = event.target;
  const value = input.value.trim() || "";

  if (!value) {
    showFieldError(titleInput, titleError, "Пожалуйста, заполните заголовок");
  }
}

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

//ИНИЦИАЛИЗАЦИЯ ОБРАБОТЧИКОВ

createPostBtn?.addEventListener("click", openPostDialog);
cancelFormBtn?.addEventListener("click", handleCancelForm);
statsBtn?.addEventListener("click", openStatsDialog);
closeStatsDialogBtn?.addEventListener("click", closeStatsDialog);
articleForm?.addEventListener("submit", handleFormSubmit);

titleInput?.addEventListener("input", handleTitleInput);
titleInput?.addEventListener("blur", handleTitleBlur);
contentTextarea?.addEventListener("input", handleContentInput);
contentTextarea?.addEventListener("blur", handleContentBlur);

const postDialogCloseBtn = postDialog?.querySelector(".dialog-close");
postDialogCloseBtn?.addEventListener("click", closeAndClearPostDialog);

postDialog?.addEventListener("click", (event) => {
  if (event.target === postDialog) {
    closeAndClearPostDialog();
  }
});

postDialog?.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeAndClearPostDialog();
});

statsDialog?.addEventListener("click", (event) => {
  if (event.target === statsDialog) closeStatsDialog();
});

statsDialog?.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeStatsDialog();
});

//ЗАПУСК
document.addEventListener("DOMContentLoaded", () => {
  updateStats();
  addMockPost();
  addDeleteButtonsToExistingPosts();
  showNotification("Добро пожаловать в блог!", "info", 3000);
});
