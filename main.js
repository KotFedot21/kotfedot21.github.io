//  DOM ЭЛЕМЕНТЫ

const createPostBtn = document.getElementById("createPostBtn");
const postDialog = document.getElementById("postDialog");
const statsDialog = document.getElementById("statsDialog");
const cancelFormBtn = document.getElementById("cancelFormBtn");
const closeStatsDialogBtn = document.getElementById("closeStatsDialogBtn");
const statsBtn = document.getElementById("statsBtn");
const loadMoreBtn = document.getElementById("loadMoreBtn");

const articleForm = document.getElementById("articleForm");
const totalPostsCountSpan = document.getElementById("totalPostsCount");
const commentsCountSpan = document.getElementById("commentsCount");
const titleInput = document.getElementById("title");
const contentTextarea = document.getElementById("content");
const titleError = document.getElementById("titleError");
const contentError = document.getElementById("contentError");
const saveBtn = document.querySelector(".btn-save");
const cancelBtn = document.querySelector(".btn-cancel");

const confirmDialog = document.getElementById("confirmDeleteDialog");
const confirmDialogTitle = document.getElementById("confirmDialogTitle");
const confirmDialogMessage = document.getElementById("confirmDialogMessage");
const confirmYesBtn = document.getElementById("confirmYesBtn");
const confirmNoBtn = document.getElementById("confirmNoBtn");

const emptyStateTemplate = document.getElementById("emptyStateTemplate");
const articleCardTemplate = document.getElementById("articleCardTemplate");
const STORAGE_KEY = "blog_articles";

//  ПЕРЕМЕННЫЕ СОСТОЯНИЯ для демонстрации кнопки далее

let allPosts = [];
let currentDisplayCount = 7;
const POSTS_PER_LOAD = 3;
const INITIAL_POSTS = 7;

// Флаги блокировки
let isFormSubmitting = false;
let isPageLoading = false;
let isDeleting = false;

//  ФУНКЦИИ БЛОКИРОВКИ

function disableButtons(disabled = true) {
  const buttons = [createPostBtn, statsBtn, loadMoreBtn, saveBtn, cancelBtn];

  buttons.forEach((btn) => {
    if (btn) {
      btn.disabled = disabled;
    }
  });

  if (confirmYesBtn) {
    confirmYesBtn.disabled = disabled;
  }
  if (confirmNoBtn) {
    confirmNoBtn.disabled = disabled;
  }
}

function disableFormFields(disabled = true) {
  if (titleInput) {
    titleInput.disabled = disabled;
  }
  if (contentTextarea) {
    contentTextarea.disabled = disabled;
  }
}

function showButtonLoader(button, show = true) {
  if (!button) {
    return;
  }

  if (show) {
    button.disabled = true;
    const originalText = button.textContent;
    button.setAttribute("data-original-text", originalText);
    button.innerHTML = '<span class="btn-loader"></span> Загрузка...';
  } else {
    button.disabled = false;
    const originalText = button.getAttribute("data-original-text");
    if (originalText) {
      button.textContent = originalText;
    }
  }
}

function showFormOverlay() {
  const existingOverlay = document.querySelector(".form-overlay");
  if (existingOverlay) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "form-overlay";
  overlay.innerHTML = '<div class="loader"></div>';
  document.body.appendChild(overlay);
}

function hideFormOverlay() {
  const overlay = document.querySelector(".form-overlay");
  if (overlay) {
    overlay.remove();
  }
}

//ЛОАДЕРА ДЛЯ СТАТЕЙ

function showLoader() {
  const blogContainer = document.querySelector(".articles-grid");
  if (!blogContainer) {
    return;
  }

  blogContainer.classList.add("loading");

  if (!blogContainer.querySelector(".loader")) {
    const loader = document.createElement("div");
    loader.className = "loader";
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("div");
      dot.className = "loader-dot";
      loader.appendChild(dot);
    }
    blogContainer.appendChild(loader);
  }
}

function hideLoader() {
  const blogContainer = document.querySelector(".articles-grid");
  if (!blogContainer) {
    return;
  }

  blogContainer.classList.remove("loading");
  const loader = blogContainer.querySelector(".loader");
  if (loader) {
    loader.remove();
  }
}

//LOCALSTORAGE

function savePostsToLocalStorage() {
  try {
    const postsToSave = allPosts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      date: post.date,
      createdAt: post.createdAt,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(postsToSave));
  } catch (error) {
    console.error("Ошибка при сохранении в localStorage:", error);
    showNotification("Ошибка при сохранении статей", "error");
  }
}

function loadPostsFromLocalStorage() {
  try {
    const savedPosts = localStorage.getItem(STORAGE_KEY);
    if (savedPosts) {
      const parsedPosts = JSON.parse(savedPosts);
      allPosts = parsedPosts.map((post) => ({
        ...post,
        element: null,
      }));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Ошибка при загрузке из localStorage:", error);
    return false;
  }
}

//УДАЛЕНИЯ СТАТЕЙ

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

async function deletePost(articleElement, postId) {
  if (isDeleting) {
    return;
  }
  isDeleting = true;

  const confirmed = await showConfirmDialog(
    "Удалить статью?",
    "Вы уверены, что хотите удалить эту статью? Это действие нельзя отменить.",
  );

  if (!confirmed) {
    isDeleting = false;
    return;
  }

  articleElement.classList.add("deleting");

  setTimeout(() => {
    const index = allPosts.findIndex((post) => post.id === postId);
    if (index !== -1) {
      allPosts.splice(index, 1);
    }

    if (currentDisplayCount > allPosts.length) {
      currentDisplayCount = allPosts.length;
    }

    articleElement.remove();
    savePostsToLocalStorage();
    updateStats();

    if (allPosts.length === 0) {
      showEmptyStateMessage();
      hideLoadMoreButton();
    } else {
      renderCurrentPosts();
      updateLoadMoreButton();
    }

    showNotification("Статья успешно удалена", "info");
    isDeleting = false;
  }, 300);
}

function showEmptyStateMessage() {
  const blogContainer = document.querySelector(".articles-grid");
  if (!blogContainer) {
    return;
  }

  const existingEmpty = blogContainer.querySelector(".empty-state-message");
  if (existingEmpty) {
    existingEmpty.remove();
  }

  const emptyMessage = document.createElement("div");
  emptyMessage.className = "empty-state-message";
  emptyMessage.textContent = "Нет статей";
  blogContainer.appendChild(emptyMessage);
}

function hideLoadMoreButton() {
  if (loadMoreBtn) {
    loadMoreBtn.classList.add("hidden");
    loadMoreBtn.disabled = false;
  }
}

function showLoadMoreButton() {
  if (loadMoreBtn) {
    loadMoreBtn.classList.remove("hidden");
    loadMoreBtn.disabled = false;
  }
}

function updateLoadMoreButton() {
  if (!loadMoreBtn) {
    return;
  }

  if (allPosts.length === 0 || currentDisplayCount >= allPosts.length) {
    hideLoadMoreButton();
  } else {
    showLoadMoreButton();
  }
}

function renderCurrentPosts() {
  const blogContainer = document.querySelector(".articles-grid");
  if (!blogContainer) {
    return;
  }

  blogContainer.innerHTML = "";

  const emptyMessage = blogContainer.querySelector(".empty-state-message");
  if (emptyMessage) {
    emptyMessage.remove();
  }

  if (allPosts.length === 0) {
    showEmptyStateMessage();
    updateLoadMoreButton();
    return;
  }

  const postsToShow = Math.min(currentDisplayCount, allPosts.length);
  for (let i = 0; i < postsToShow; i++) {
    const post = allPosts[i];
    createAndAppendPostElement(post, blogContainer);
  }

  updateLoadMoreButton();
  updateStats();
}

function createAndAppendPostElement(post, container) {
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

  if (img) {
    img.alt = post.title;
  }
  if (titleEl) {
    titleEl.textContent = post.title;
  }
  if (descEl) {
    descEl.textContent = post.content;
  }
  if (dateEl) {
    dateEl.textContent = post.date;
  }

  if (deleteBtn) {
    const newDeleteBtn = deleteBtn.cloneNode(true);
    deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
    newDeleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deletePost(article, post.id);
    });
  }

  container.appendChild(article);
  post.element = article;
}

function loadMorePosts() {
  if (loadMoreBtn.disabled) {
    return;
  }

  if (currentDisplayCount < allPosts.length) {
    loadMoreBtn.disabled = true;

    currentDisplayCount = Math.min(
      currentDisplayCount + POSTS_PER_LOAD,
      allPosts.length,
    );
    renderCurrentPosts();

    setTimeout(() => {
      loadMoreBtn.disabled = false;
    }, 500);

    if (currentDisplayCount >= allPosts.length) {
      hideLoadMoreButton();
    }
  }
}

//ОЧИСТКА ФОРМЫ

function resetForm() {
  if (articleForm) {
    articleForm.reset();
  }

  clearFieldError(titleInput, titleError);
  clearFieldError(contentTextarea, contentError);

  if (titleInput) {
    titleInput.style.borderColor = "";
    titleInput.disabled = false;
  }
  if (contentTextarea) {
    contentTextarea.style.borderColor = "";
    contentTextarea.disabled = false;
  }
}

function closeAndClearPostDialog() {
  resetForm();
  closePostDialog();
  isFormSubmitting = false;
}

//ДИАЛОГОИ

function openPostDialog() {
  if (isFormSubmitting) {
    return;
  }
  postDialog?.showModal();
  document.body.style.overflow = "hidden";
  resetForm();
  if (saveBtn) {
    saveBtn.disabled = false;
  }
  if (cancelBtn) {
    cancelBtn.disabled = false;
  }
}

function closePostDialog() {
  postDialog?.close();
  document.body.style.overflow = "";
  isFormSubmitting = false;
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

//ФУНКЦИЯ ДОБАВЛЕНИЯ ПОСТА

function addPostToPage(title, content, date) {
  showLoader();
  showFormOverlay();
  disableButtons(true);
  disableFormFields(true);

  if (saveBtn) {
    showButtonLoader(saveBtn, true);
  }

  setTimeout(() => {
    const newPost = {
      id: Date.now(),
      title: title,
      content: content,
      date: date,
      createdAt: new Date().toISOString(),
      element: null,
    };

    allPosts.unshift(newPost);
    savePostsToLocalStorage();
    currentDisplayCount = Math.min(INITIAL_POSTS, allPosts.length);
    renderCurrentPosts();
    updateStats();

    hideLoader();
    hideFormOverlay();
    disableButtons(false);
    disableFormFields(false);

    if (saveBtn) {
      showButtonLoader(saveBtn, false);
    }

    showNotification(`Статья "${title}" успешно добавлена!`, "success");
    isFormSubmitting = false;
  }, 500);
}

//СТАТИСТИКА

function getPostsCount() {
  return allPosts.length;
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
  if (totalPostsCountSpan) {
    totalPostsCountSpan.textContent = getPostsCount();
  }
  if (commentsCountSpan) {
    commentsCountSpan.textContent = getCommentsCount();
  }
}

//  ДОБАВЛЕНИЕ ТЕСТОВЫХ ПОСТОВ

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
    {
      title: "React для начинающих",
      date: "Опубликовано: 5 апреля 2025",
      content: "Введение в React: компоненты, состояние и пропсы.",
    },
  ];

  mockData.forEach((post) => {
    const newPost = {
      id: Date.now() + Math.random(),
      title: post.title,
      content: post.content,
      date: post.date,
      createdAt: new Date().toISOString(),
      element: null,
    };
    allPosts.push(newPost);
  });

  savePostsToLocalStorage();
  currentDisplayCount = Math.min(INITIAL_POSTS, allPosts.length);
  renderCurrentPosts();
  updateStats();
}

//УВЕДОМЛЕНИЯ

function showNotification(message, type = "success", duration = 2000) {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("hide");
    setTimeout(() => {
      if (notification) {
        notification.remove();
      }
    }, 300);
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

//ОШИБОКИ

function showFieldError(field, errorElement, message) {
  if (!field || !errorElement) {
    return;
  }

  field.classList.add("error");
  errorElement.textContent = message || "Пожалуйста, заполните это поле";
  errorElement.style.display = "block";
  errorElement.classList.add("visible");
  field.style.borderColor = "#dc3545";
}

function clearFieldError(field, errorElement) {
  if (!field || !errorElement) {
    return;
  }

  field.classList.remove("error");
  errorElement.style.display = "none";
  errorElement.classList.remove("visible");
  field.style.borderColor = "";
}

//  ВАЛИДАЦИЯ

function validateTitle() {
  if (titleInput.disabled) {
    return true;
  }

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
  if (contentTextarea.disabled) {
    return true;
  }

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
  if (isFormSubmitting) {
    return false;
  }

  const isTitleValid = validateTitle();
  const isContentValid = validateContent();

  return isTitleValid && isContentValid;
}

//  ОБРАБОТЧИКИ ФОРМЫ

function handleFormSubmit(event) {
  event.preventDefault();

  if (isFormSubmitting) {
    showNotification("Подождите, форма уже отправляется...", "info");
    return;
  }

  if (!validateForm()) {
    showNotification("Пожалуйста, заполните все обязательные поля", "error");
    return;
  }

  isFormSubmitting = true;

  disableButtons(true);
  disableFormFields(true);

  if (saveBtn) {
    saveBtn.disabled = true;
  }
  if (cancelBtn) {
    cancelBtn.disabled = true;
  }

  const title = titleInput.value.trim();
  const content = contentTextarea.value.trim();
  const now = new Date();
  const dateStr = `Опубликовано: ${now.getDate()} ${getMonthName(now.getMonth())} ${now.getFullYear()}`;

  addPostToPage(title, content, dateStr);
  closeAndClearPostDialog();

  setTimeout(() => {
    disableButtons(false);
    disableFormFields(false);
    if (saveBtn) {
      saveBtn.disabled = false;
    }
    if (cancelBtn) {
      cancelBtn.disabled = false;
    }
  }, 1000);
}

function handleCancelForm() {
  if (isFormSubmitting) {
    showNotification("Дождитесь окончания сохранения...", "info");
    return;
  }
  closeAndClearPostDialog();
  showNotification("Создание статьи отменено", "info", 1500);
}

//  ОБРАБОТЧИКИ ВАЛИДАЦИИ

function handleTitleInput(event) {
  if (titleInput.disabled) {
    return;
  }

  const input = event.target;
  const value = input.value.trim() || "";

  if (value) {
    clearFieldError(titleInput, titleError);
  } else {
    showFieldError(titleInput, titleError, "Пожалуйста, заполните заголовок");
  }
}

function handleTitleBlur(event) {
  if (titleInput.disabled) {
    return;
  }

  const input = event.target;
  const value = input.value.trim() || "";

  if (!value) {
    showFieldError(titleInput, titleError, "Пожалуйста, заполните заголовок");
  }
}

function handleContentInput(event) {
  if (contentTextarea.disabled) {
    return;
  }

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
  if (contentTextarea.disabled) {
    return;
  }

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

//  ИНИЦИАЛИЗАЦИЯ ОБРАБОТЧИКОВ

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
if (postDialogCloseBtn) {
  postDialogCloseBtn.addEventListener("click", closeAndClearPostDialog);
}

if (postDialog) {
  postDialog.addEventListener("click", (event) => {
    if (event.target === postDialog && !isFormSubmitting) {
      closeAndClearPostDialog();
    }
  });
}

if (postDialog) {
  postDialog.addEventListener("cancel", (event) => {
    if (!isFormSubmitting) {
      event.preventDefault();
      closeAndClearPostDialog();
    } else {
      event.preventDefault();
      showNotification("Дождитесь окончания сохранения...", "info");
    }
  });
}

if (statsDialog) {
  statsDialog.addEventListener("click", (event) => {
    if (event.target === statsDialog) {
      closeStatsDialog();
    }
  });
}

if (statsDialog) {
  statsDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeStatsDialog();
  });
}

if (loadMoreBtn) {
  loadMoreBtn.addEventListener("click", loadMorePosts);
}

//  ЗАПУСК

document.addEventListener("DOMContentLoaded", () => {
  showLoader();
  disableButtons(true);

  setTimeout(() => {
    const hasSavedPosts = loadPostsFromLocalStorage();

    if (!hasSavedPosts || allPosts.length === 0) {
      addMockPost();
    } else {
      currentDisplayCount = Math.min(INITIAL_POSTS, allPosts.length);
      renderCurrentPosts();
      updateStats();
    }

    hideLoader();
    disableButtons(false);
    showNotification("Добро пожаловать в блог!", "info", 3000);
  }, 500);
});
window.debugBlog = {
  clearStorage: () => {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  },
  showStorage: () => {
    console.log("Статьи в localStorage:", localStorage.getItem(STORAGE_KEY));
  },
};
