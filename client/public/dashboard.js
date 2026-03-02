let tasks = [];
let currentFilter = "all";
let editingTaskId = null;

function getAuthData() {
  const raw = localStorage.getItem("data");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getAuthToken() {
  const data = getAuthData();
  return data && data.token ? data.token : null;
}

function ensureAuthenticated() {
  const data = getAuthData();
  if (!data || !data.token) {
    window.location.href = "/auth";
    return null;
  }
  return data;
}

function setUserName() {
  const data = getAuthData();
  const nameEl = document.getElementById("userName");
  if (!nameEl) return;
  if (data && data.user && data.user.username) {
    nameEl.textContent = data.user.username;
  } else {
    nameEl.textContent = "User";
  }
}

async function loadTasks() {
  const token = getAuthToken();
  if (!token) {
    window.location.href = "/auth";
    return;
  }

  try {
    const response = await fetch("/todo/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("data");
      window.location.href = "/auth";
      return;
    }

    const data = await response.json();
    if (!response.ok || !data.success) {
      console.error("Failed to load tasks:", data);
      return;
    }

    tasks = (data.data || []).map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description || "",
      completed: t.isCompleted === 1 || t.isCompleted === true,
      createdAt: t.createdAt || "",
    }));

    renderTasks();
    updateStats();
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
}

document.getElementById("addTaskForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const titleInput = document.getElementById("task-title");
  const descInput = document.getElementById("task-description");
  const title = titleInput.value.trim();
  const description = descInput.value.trim();

  if (!title) {
    alert("Please enter a task title");
    return;
  }

  const token = getAuthToken();
  if (!token) {
    window.location.href = "/auth";
    return;
  }

  try {
    const response = await fetch("/todo/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      alert(data.message || "Failed to add task");
      return;
    }

    titleInput.value = "";
    descInput.value = "";
    await loadTasks();
  } catch (error) {
    console.error("Error adding task:", error);
    alert("An error occurred while adding the task");
  }
});

function renderTasks() {
  const tasksList = document.getElementById("tasksList");
  if (!tasksList) return;

  let filtered = tasks;
  if (currentFilter === "pending") {
    filtered = tasks.filter((t) => !t.completed);
  } else if (currentFilter === "completed") {
    filtered = tasks.filter((t) => t.completed);
  }

  if (filtered.length === 0) {
    const message =
      currentFilter === "completed"
        ? "No completed tasks yet"
        : currentFilter === "pending"
        ? "All caught up!"
        : "No tasks yet";
    const hint =
      currentFilter === "completed"
        ? "Complete a task to see it here"
        : "Create a new task to get started";

    tasksList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <p>${message}</p>
        <p class="empty-state-hint">${hint}</p>
      </div>
    `;
    return;
  }

  tasksList.innerHTML = filtered
    .map(
      (task) => `
      <div class="task-card ${task.completed ? "completed" : ""}">
        <div class="task-content">
          <div class="task-title">${escapeHtml(task.title)}</div>
          ${
            task.description
              ? `<div class="task-description">${escapeHtml(
                  task.description
                )}</div>`
              : ""
          }
          ${
            task.createdAt
              ? `<div class="task-date">Created on ${task.createdAt}</div>`
              : ""
          }
        </div>
        <div class="task-actions">
          <button
            class="action-btn complete-btn"
            onclick="toggleComplete(${task.id})"
            title="Mark as complete"
            ${task.completed ? "disabled" : ""}
          >
            ${task.completed ? "✓ Done" : "○ Complete"}
          </button>
          <button
            class="action-btn edit-btn"
            onclick="openEditModal(${task.id})"
            title="Edit task"
          >
            ✎ Edit
          </button>
          <button
            class="action-btn delete-btn"
            onclick="deleteTask(${task.id})"
            title="Delete task"
          >
            × Delete
          </button>
        </div>
      </div>
    `
    )
    .join("");
}

async function toggleComplete(id) {
  const token = getAuthToken();
  if (!token) {
    window.location.href = "/auth";
    return;
  }

  try {
    const response = await fetch(`/todo/update-status/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      alert(data.message || "Failed to mark task as completed");
      return;
    }

    await loadTasks();
  } catch (error) {
    console.error("Error updating task status:", error);
    alert("An error occurred while updating the task status");
  }
}

async function deleteTask(id) {
  if (!confirm("Are you sure you want to delete this task?")) {
    return;
  }

  const token = getAuthToken();
  if (!token) {
    window.location.href = "/auth";
    return;
  }

  try {
    const response = await fetch(`/todo/delete/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      alert(data.message || "Failed to delete task");
      return;
    }

    await loadTasks();
  } catch (error) {
    console.error("Error deleting task:", error);
    alert("An error occurred while deleting the task");
  }
}

function openEditModal(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  editingTaskId = id;
  const titleInput = document.getElementById("edit-title");
  const descInput = document.getElementById("edit-description");
  const modal = document.getElementById("editModal");

  if (!titleInput || !descInput || !modal) return;

  titleInput.value = task.title;
  descInput.value = task.description;
  modal.style.display = "block";
}

function closeModal() {
  const modal = document.getElementById("editModal");
  if (modal) modal.style.display = "none";
  editingTaskId = null;
}

document.getElementById("editTaskForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!editingTaskId) return;

  const title = document.getElementById("edit-title").value.trim();
  const description = document.getElementById("edit-description").value.trim();

  if (!title) {
    alert("Please enter a task title");
    return;
  }

  const token = getAuthToken();
  if (!token) {
    window.location.href = "/auth";
    return;
  }

  try {
    const response = await fetch(`/todo/update/${editingTaskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      alert(data.message || "Failed to update task");
      return;
    }

    closeModal();
    await loadTasks();
  } catch (error) {
    console.error("Error updating task:", error);
    alert("An error occurred while updating the task");
  }
});

function filterTasks(filter) {
  currentFilter = filter;

  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => btn.classList.remove("active"));

  buttons.forEach((btn) => {
    if (
      (filter === "all" && btn.textContent.includes("All")) ||
      (filter === "pending" && btn.textContent.includes("Pending")) ||
      (filter === "completed" && btn.textContent.includes("Completed"))
    ) {
      btn.classList.add("active");
    }
  });

  renderTasks();
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const remaining = total - completed;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  const totalEl = document.getElementById("totalTasks");
  const completedEl = document.getElementById("completedTasks");
  const remainingEl = document.getElementById("remainingTasks");
  const percentEl = document.getElementById("progressPercent");
  const fillEl = document.getElementById("progressFill");

  if (totalEl) totalEl.textContent = total;
  if (completedEl) completedEl.textContent = completed;
  if (remainingEl) remainingEl.textContent = remaining;
  if (percentEl) percentEl.textContent = `${percentage}%`;
  if (fillEl) fillEl.style.width = `${percentage}%`;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function logout() {
  if (!confirm("Are you sure you want to logout?")) return;
  localStorage.removeItem("data");
  window.location.href = "/authorization";
}

window.addEventListener("click", (e) => {
  const modal = document.getElementById("editModal");
  if (e.target === modal) {
    closeModal();
  }
});

window.addEventListener("load", () => {
  if (!ensureAuthenticated()) return;
  setUserName();
  loadTasks();
});
