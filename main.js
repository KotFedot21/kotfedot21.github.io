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
  if (articleForm) articleForm.reset();
  document
    .querySelectorAll(".error-message")
    .forEach((msg) => (msg.style.display = "none"));
  document
    .querySelectorAll(".form-input, .form-textarea")
    .forEach((input) => input.classList.remove("error"));
}

// Функция добавления поста
function addPostToPage(title, content, date) {
  if (!postsGrid || !postTemplate) return;
  const postElement = postTemplate.content.cloneNode(true);
  const postTitle = postElement.querySelector(".post-title");
  const postDate = postElement.querySelector(".post-date");
  const postImg = postElement.querySelector(".post-img");
  if (postTitle) postTitle.textContent = title;
  if (postDate) postDate.textContent = date;
  if (postImg)
    postImg.src = "images/ea2d1b6afe5408fad4c7e9efc468ec520d055669.png";
  postsGrid.prepend(postElement);
  updateStats();
}

// Функция статистики
function getPostsCount() {
  let totalPosts = document.querySelectorAll(
    ".my_blog_next_article .my_blog_article",
  ).length;
  if (postsGrid)
    totalPosts += postsGrid.querySelectorAll(
      ".my_blog_article.post-item",
    ).length;
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

// Добавление тестовых постов
function addMockPost() {
  const mockData = [
    { title: "Основы веб-разработки", date: "Опубликовано: 1 марта 2025" },
    { title: "Продвинутый CSS", date: "Опубликовано: 10 марта 2025" },
    { title: "JavaScript для начинающих", date: "Опубликовано: 20 марта 2025" },
  ];
  mockData.forEach((post) => addPostToPage(post.title, "", post.date));
}

// Инициализация обработчиков
if (createPostBtn) createPostBtn.addEventListener("click", openForm);
if (cancelBtn) cancelBtn.addEventListener("click", closeForm);
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

if (articleForm) {
  articleForm.addEventListener("submit", (e) => {
    e.preventDefault();
    closeForm();
    showNotification("Форма закрыта");
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

function showNotification(message) {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.cssText = `position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:#28a745; color:white; padding:12px 24px; border-radius:50px; font-size:14px; z-index:2000; box-shadow:0 5px 15px rgba(0,0,0,0.2);`;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transform = "translateX(-50%) translateY(20px)";
    notification.style.transition = "all 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Запуск
document.addEventListener("DOMContentLoaded", () => {
  updateStats();
  addMockPost();
});
