document.addEventListener("DOMContentLoaded", initAdminPage);

const DEFAULT_PRICING = {
  singleClassPrice: 25,
  starterPrice: 59,
  plusPrice: 89,
  unlimitedPrice: 119
};

async function initAdminPage() {
  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  bindEvents();
  loadPricingForm();

  try {
    await loadDashboardData();
  } catch (error) {
    console.error("Admin initialization failed:", error);
    showMessage("Some admin data could not be loaded.", "error");
  }
}

function bindEvents() {
  const addClassForm = document.getElementById("addClassForm");
  const pricingForm = document.getElementById("pricingForm");
  const adminLogoutBtn = document.getElementById("adminLogoutBtn");
  const classesTableBody = document.getElementById("classesTableBody");

  if (addClassForm) {
    addClassForm.addEventListener("submit", handleAddClass);
  }

  if (pricingForm) {
    pricingForm.addEventListener("submit", handleSavePricing);
  }

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener("click", handleAdminLogout);
  }

  if (classesTableBody) {
    classesTableBody.addEventListener("click", handleClassTableClick);
  }
}

async function loadDashboardData() {
  const [users, classes, bookings] = await Promise.all([
    fetchUsers(),
    fetchClasses(),
    fetchBookings()
  ]);

  renderOverview(users, classes, bookings);
  renderUsers(users);
  renderClasses(classes);
}

async function fetchUsers() {
  try {
    const response = await fetch("/users");

    if (!response.ok) {
      throw new Error("Failed to fetch users.");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("fetchUsers error:", error);
    return [];
  }
}

async function fetchClasses() {
  try {
    const response = await fetch("/class");

    if (!response.ok) {
      throw new Error("Failed to fetch classes.");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("fetchClasses error:", error);
    return [];
  }
}

async function fetchBookings() {
  try {
    const response = await fetch("/bookings");

    if (!response.ok) {
      throw new Error("Failed to fetch bookings.");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("fetchBookings error:", error);
    return [];
  }
}

function renderOverview(users, classes, bookings) {
  const totalUsers = users.length;
  const totalClasses = classes.length;
  const totalBookings = bookings.length;

  setText("totalUsers", totalUsers);
  setText("totalClasses", totalClasses);
  setText("totalBookings", totalBookings);

  setText("overviewUsers", totalUsers);
  setText("overviewClasses", totalClasses);
  setText("overviewBookings", totalBookings);
}

function renderClasses(classes) {
  const tbody = document.getElementById("classesTableBody");
  if (!tbody) return;

  if (!classes.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="admin-loading-cell">No classes found.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = classes.map(createClassRow).join("");
}

function renderUsers(users) {
  const tbody = document.getElementById("usersTableBody");
  if (!tbody) return;

  if (!users.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="admin-loading-cell">No users found.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = users.map(createUserRow).join("");
}

async function handleAddClass(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const submitBtn = document.getElementById("addClassSubmitBtn");

  const payload = {
    name: document.getElementById("className").value.trim(),
    instructor: document.getElementById("classInstructor").value.trim(),
    date: document.getElementById("classDate").value,
    time: document.getElementById("classTime").value,
    max_capacity: Number(document.getElementById("classCapacity").value),
    price: Number(document.getElementById("classPrice").value)
  };

  if (!payload.name || !payload.instructor || !payload.date || !payload.time) {
    showMessage("Please complete all class fields.", "error");
    return;
  }

  if (payload.max_capacity < 1 || Number.isNaN(payload.max_capacity)) {
    showMessage("Capacity must be at least 1.", "error");
    return;
  }

  if (payload.price < 0 || Number.isNaN(payload.price)) {
    showMessage("Price must be a valid number.", "error");
    return;
  }

  try {
    setButtonLoading(submitBtn, true, "Saving...");

    let response = await fetch("/class", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      response = await fetch("/admin/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    }

    let result = {};
    try {
      result = await response.json();
    } catch (error) {}

    if (!response.ok) {
      throw new Error(result.message || "Failed to add class.");
    }

    form.reset();
    showMessage("Class added successfully.", "success");
    await refreshClassesAndOverview();
  } catch (error) {
    console.error("handleAddClass error:", error);
    showMessage(error.message || "Could not add class.", "error");
  } finally {
    setButtonLoading(submitBtn, false, "Add Class");
  }
}

async function handleClassTableClick(event) {
  const button = event.target.closest("button");
  if (!button) return;

  const row = button.closest("tr");
  const classId = row?.dataset?.id;

  if (!classId) return;

  if (button.classList.contains("delete")) {
    const confirmed = window.confirm("Are you sure you want to delete this class?");
    if (!confirmed) return;

    try {
      let response = await fetch(`/class/${classId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        response = await fetch(`/admin/classes/${classId}`, {
          method: "DELETE"
        });
      }

      let result = {};
      try {
        result = await response.json();
      } catch (error) {}

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete class.");
      }

      showMessage("Class deleted successfully.", "success");
      await refreshClassesAndOverview();
    } catch (error) {
      console.error("Delete class error:", error);
      showMessage(error.message || "Could not delete class.", "error");
    }
  }

  if (button.classList.contains("view")) {
    showMessage("View action is ready for the next step.", "success");
  }

  if (button.classList.contains("edit")) {
    showMessage("Edit action is ready for the next step.", "success");
  }
}

function handleSavePricing(event) {
  event.preventDefault();

  const pricing = {
    singleClassPrice: Number(document.getElementById("singleClassPrice").value),
    starterPrice: Number(document.getElementById("starterPrice").value),
    plusPrice: Number(document.getElementById("plusPrice").value),
    unlimitedPrice: Number(document.getElementById("unlimitedPrice").value)
  };

  localStorage.setItem("adminPricing", JSON.stringify(pricing));
  showMessage("Pricing saved locally. Connect this to a backend endpoint next.", "success");
}

function loadPricingForm() {
  let pricing = DEFAULT_PRICING;

  try {
    const saved = JSON.parse(localStorage.getItem("adminPricing"));
    if (saved) {
      pricing = { ...DEFAULT_PRICING, ...saved };
    }
  } catch (error) {
    console.error("Could not load pricing from localStorage:", error);
  }

  const singleClassPrice = document.getElementById("singleClassPrice");
  const starterPrice = document.getElementById("starterPrice");
  const plusPrice = document.getElementById("plusPrice");
  const unlimitedPrice = document.getElementById("unlimitedPrice");

  if (singleClassPrice) singleClassPrice.value = pricing.singleClassPrice;
  if (starterPrice) starterPrice.value = pricing.starterPrice;
  if (plusPrice) plusPrice.value = pricing.plusPrice;
  if (unlimitedPrice) unlimitedPrice.value = pricing.unlimitedPrice;
}

function handleAdminLogout() {
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userEmail");
  window.location.href = "login.html";
}

async function refreshClassesAndOverview() {
  const [classes, users, bookings] = await Promise.all([
    fetchClasses(),
    fetchUsers(),
    fetchBookings()
  ]);

  renderClasses(classes);
  renderOverview(users, classes, bookings);
}

function createClassRow(classItem) {
  const classId = classItem.class_ID || classItem.id || "";
  const name = escapeHTML(classItem.name || "Unnamed");
  const instructor = escapeHTML(classItem.instructor || "—");
  const date = formatDate(classItem.date);
  const time = formatTime(classItem.time);
  const capacity = escapeHTML(classItem.max_capacity ?? classItem.capacity ?? "—");
  const price = formatCurrency(classItem.price);

  return `
    <tr data-id="${escapeHTML(classId)}">
      <td>${name}</td>
      <td>${instructor}</td>
      <td>${date}</td>
      <td>${time}</td>
      <td>${capacity}</td>
      <td>${price}</td>
      <td>
        <div class="admin-action-group">
          <button type="button" class="admin-mini-btn view">View</button>
          <button type="button" class="admin-mini-btn edit">Edit</button>
          <button type="button" class="admin-mini-btn delete">Delete</button>
        </div>
      </td>
    </tr>
  `;
}

function createUserRow(user) {
  const fullName = getUserDisplayName(user);
  const email = escapeHTML(user.email || "—");
  const membership = escapeHTML(user.selectedPlan || user.membership || "No plan");
  const isActive =
    Boolean(user.membershipActive) ||
    String(user.status || "").toLowerCase() === "active";

  const statusText = isActive ? "Active" : "Inactive";
  const statusClass = isActive ? "active" : "inactive";

  return `
    <tr>
      <td>${escapeHTML(fullName)}</td>
      <td>${email}</td>
      <td>${membership}</td>
      <td>
        <span class="admin-status-badge ${statusClass}">
          ${statusText}
        </span>
      </td>
    </tr>
  `;
}

function getUserDisplayName(user) {
  const first = user.first_name || user.firstName || "";
  const last = user.last_name || user.lastName || "";
  const fullName = `${first} ${last}`.trim();

  return fullName || user.name || "Unnamed User";
}

function showMessage(message, type = "success") {
  const box = document.getElementById("adminMessage");
  if (!box) return;

  box.textContent = message;
  box.className = `admin-message ${type}`;
  box.hidden = false;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function setButtonLoading(button, isLoading, text) {
  if (!button) return;
  button.disabled = isLoading;
  button.textContent = text;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHTML(value);

  return date.toLocaleDateString();
}

function formatTime(value) {
  if (!value) return "—";

  const normalized = String(value).slice(0, 5);
  const [hours, minutes] = normalized.split(":");

  if (!hours || !minutes) return escapeHTML(value);

  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatCurrency(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "—";

  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}