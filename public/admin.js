document.addEventListener("DOMContentLoaded", initAdminPage);

let editingClassId = null;
let latestBookings = [];

async function initAdminPage() {
  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  bindEvents();
  await loadPricingForm();

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
    addClassForm.addEventListener("submit", handleAddOrUpdateClass);
    addClassForm.addEventListener("reset", resetClassFormState);
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

  latestBookings = bookings;
  renderOverview(users, classes, bookings);
  renderUsers(users);
  renderClasses(classes, bookings);
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
    return data.classes || [];
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

function renderClasses(classes, bookings = []) {
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

  tbody.innerHTML = classes.map((classItem) => createClassRow(classItem, bookings)).join("");
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

async function handleAddOrUpdateClass(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const submitBtn = document.getElementById("addClassSubmitBtn");

  const payload = {
    name: document.getElementById("className").value.trim(),
    instructor: document.getElementById("classInstructor").value.trim(),
    date: document.getElementById("classDate").value,
    time: document.getElementById("classTime").value,
    max_capacity: Number(document.getElementById("classCapacity").value)
  };

  if (!payload.name || !payload.instructor || !payload.date || !payload.time) {
    showMessage("Please complete all class fields.", "error");
    return;
  }

  if (payload.max_capacity < 1 || Number.isNaN(payload.max_capacity)) {
    showMessage("Capacity must be at least 1.", "error");
    return;
  }

  try {
    const isEditing = Boolean(editingClassId);
    setButtonLoading(submitBtn, true, isEditing ? "Updating..." : "Saving...");

    const url = isEditing ? `/class/${editingClassId}` : "/class";
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    let result = {};
    try {
      result = await response.json();
    } catch (error) {}

    if (!response.ok) {
      throw new Error(result.message || `Failed to ${isEditing ? "update" : "add"} class.`);
    }

    form.reset();
    resetClassFormState();
    showMessage(
      isEditing ? "Class updated successfully." : "Class added successfully.",
      "success"
    );
    await refreshClassesAndOverview();
  } catch (error) {
    console.error("handleAddOrUpdateClass error:", error);
    showMessage(error.message || "Could not save class.", "error");
  } finally {
    setButtonLoading(submitBtn, false, editingClassId ? "Update Class" : "Add Class");
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
      const response = await fetch(`/class/${classId}`, {
        method: "DELETE"
      });

      let result = {};
      try {
        result = await response.json();
      } catch (error) {}

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete class.");
      }

      if (editingClassId === classId) {
        resetClassFormState();
        document.getElementById("addClassForm")?.reset();
      }

      showMessage("Class deleted successfully.", "success");
      await refreshClassesAndOverview();
    } catch (error) {
      console.error("Delete class error:", error);
      showMessage(error.message || "Could not delete class.", "error");
    }
  }

  if (button.classList.contains("edit")) {
    populateClassFormFromRow(row);
    showMessage("Class loaded into form. Make your changes and save.", "success");
  }

  if (button.classList.contains("view")) {
    const className = row.dataset.className || "Class";
    const instructor = row.dataset.instructorName || "—";
    const date = row.dataset.classDate || "—";
    const startTime = row.dataset.startTime || "—";
    const endTime = row.dataset.endTime || "—";
    const capacity = Number(row.dataset.maxCapacity || 0);
    const classBookings = latestBookings.filter(
      (booking) => String(booking.class_ID) === String(classId)
    );
    const spotsLeft = Math.max(capacity - classBookings.length, 0);

    const bookedNames = classBookings.length
      ? classBookings
          .map((booking) => `${booking.first_name || ""} ${booking.last_name || ""}`.trim())
          .filter(Boolean)
          .join(", ")
      : "No one booked yet";

    alert(
      `Class: ${className}\n` +
      `Instructor: ${instructor}\n` +
      `Date: ${formatDate(date)}\n` +
      `Time: ${formatTime(startTime)} - ${formatTime(endTime)}\n` +
      `Capacity: ${capacity}\n` +
      `Spots Left: ${spotsLeft}\n` +
      `Booked Members: ${bookedNames}`
    );
  }
}

function populateClassFormFromRow(row) {
  editingClassId = row.dataset.id;

  document.getElementById("className").value = row.dataset.className || "";
  document.getElementById("classInstructor").value = row.dataset.instructorName || "";
  document.getElementById("classDate").value = (row.dataset.classDate || "").slice(0, 10);
  document.getElementById("classTime").value = (row.dataset.startTime || "").slice(0, 5);
  document.getElementById("classCapacity").value = row.dataset.maxCapacity || "";

  const submitBtn = document.getElementById("addClassSubmitBtn");
  if (submitBtn) {
    submitBtn.textContent = "Update Class";
  }

  const classesSection = document.getElementById("classes");
  if (classesSection) {
    classesSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function resetClassFormState() {
  editingClassId = null;

  const submitBtn = document.getElementById("addClassSubmitBtn");
  if (submitBtn) {
    submitBtn.textContent = "Add Class";
    submitBtn.disabled = false;
  }
}

async function handleSavePricing(event) {
  event.preventDefault();

  const pricing = [
    {
      pricing_key: "single-class",
      price: Number(document.getElementById("singleClassPrice").value)
    },
    {
      pricing_key: "starter",
      price: Number(document.getElementById("starterPrice").value)
    },
    {
      pricing_key: "plus",
      price: Number(document.getElementById("plusPrice").value)
    },
    {
      pricing_key: "unlimited",
      price: Number(document.getElementById("unlimitedPrice").value)
    }
  ];

  try {
    const res = await fetch("/pricing", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(pricing)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to update pricing");
    }

    showMessage("Pricing updated successfully!", "success");
  } catch (err) {
    console.error(err);
    showMessage("Error updating pricing", "error");
  }
}

async function loadPricingForm() {
  try {
    const res = await fetch("/pricing");
    const data = await res.json();

    if (!data.ok) return;

    data.pricing.forEach((p) => {
      if (p.pricing_key === "single-class") {
        document.getElementById("singleClassPrice").value = p.price;
      }
      if (p.pricing_key === "starter") {
        document.getElementById("starterPrice").value = p.price;
      }
      if (p.pricing_key === "plus") {
        document.getElementById("plusPrice").value = p.price;
      }
      if (p.pricing_key === "unlimited") {
        document.getElementById("unlimitedPrice").value = p.price;
      }
    });
  } catch (err) {
    console.error("Failed to load pricing", err);
  }
}

function handleAdminLogout() {
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("selectedPlan");
  localStorage.removeItem("membershipActive");
  window.location.href = "login.html";
}

async function refreshClassesAndOverview() {
  const [classes, users, bookings] = await Promise.all([
    fetchClasses(),
    fetchUsers(),
    fetchBookings()
  ]);

  latestBookings = bookings;
  renderClasses(classes, bookings);
  renderOverview(users, classes, bookings);
}

function createClassRow(classItem, bookings = []) {
  const classId = classItem.class_ID || "";
  const name = escapeHTML(classItem.class_name || "Unnamed");
  const instructor = escapeHTML(classItem.instructor_name || "—");
  const date = formatDate(classItem.class_date);
  const time = `${formatTime(classItem.start_time)} - ${formatTime(classItem.end_time)}`;
  const capacity = Number(classItem.max_capacity ?? 0);

  const classBookings = bookings.filter(
    (booking) => String(booking.class_ID) === String(classId)
  );
  const spotsLeft = Math.max(capacity - classBookings.length, 0);

  return `
    <tr
      data-id="${escapeHTML(classId)}"
      data-class-name="${escapeHTML(classItem.class_name || "")}"
      data-instructor-name="${escapeHTML(classItem.instructor_name || "")}"
      data-class-date="${escapeHTML((classItem.class_date || "").toString().slice(0, 10))}"
      data-start-time="${escapeHTML((classItem.start_time || "").toString().slice(0, 5))}"
      data-end-time="${escapeHTML((classItem.end_time || "").toString().slice(0, 5))}"
      data-max-capacity="${escapeHTML(classItem.max_capacity ?? "")}"
    >
      <td>${name}</td>
      <td>${instructor}</td>
      <td>${date}</td>
      <td>${time}</td>
      <td>${capacity}</td>
      <td>${spotsLeft}</td>
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

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}