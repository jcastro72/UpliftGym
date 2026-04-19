function getStoredUser() {
  const rawUser = localStorage.getItem("loggedInUser");

  if (!rawUser || rawUser === "undefined" || rawUser === "null") {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (err) {
    console.error("Invalid loggedInUser in localStorage:", rawUser);
    localStorage.removeItem("loggedInUser");
    return null;
  }
}

async function isLoggedIn() {
  const user = getStoredUser();

  if (!user || !user.user_ID) {
    return false;
  }

  try {
    const res = await fetch(`/users/me?user_ID=${user.user_ID}`);
    const data = await res.json();

    return data.ok && data.user;
  } catch (err) {
    console.error("Auth check failed:", err);
    return false;
  }
}

async function requireAuth() {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    window.location.href = `/login.html?redirect=${encodeURIComponent(currentPage)}`;
  }
}

async function requireAdmin() {
  const user = getStoredUser();

  if (!user || !user.user_ID) {
    window.location.href = "/login.html?redirect=admin.html";
    return;
  }

  try {
    const res = await fetch(`/users/me?user_ID=${user.user_ID}`);
    const data = await res.json();

    if (!data.ok || !data.user || !data.user.isAdmin) {
      alert("You do not have access to the admin page.");
      window.location.href = "/index.html";
      return;
    }
  } catch (err) {
    console.error("Admin auth check failed:", err);
    window.location.href = "/index.html";
  }
}

function logout() {
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("selectedPlan");
  localStorage.removeItem("membershipActive");
  localStorage.removeItem("selectedClass");
  localStorage.removeItem("selectedClassID");
  localStorage.removeItem("selectedClassName");

  window.location.href = "/index.html";
}

async function renderAuthMenu() {
  const loginLink = document.getElementById("loginNavLink");
  const userStatus = document.getElementById("userStatus");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!loginLink || !userStatus || !logoutBtn) {
    return;
  }

  const user = getStoredUser();

  // Remove any previously injected admin/profile links first
  const oldAdminLink = document.getElementById("adminNavLink");
  if (oldAdminLink) {
    oldAdminLink.remove();
  }

  const oldProfileLinkTop = document.getElementById("profileNavLink");
  if (oldProfileLinkTop) {
    oldProfileLinkTop.remove();
  }

  if (!user || !user.user_ID) {
    loginLink.style.display = "inline-flex";
    userStatus.textContent = "";
    userStatus.style.display = "none";
    logoutBtn.style.display = "none";
    return;
  }

  try {
    const res = await fetch(`/users/me?user_ID=${user.user_ID}`);
    const data = await res.json();

    if (data.ok && data.user) {
      loginLink.style.display = "none";

      // Add profile link
      const profileLink = document.createElement("a");
      profileLink.id = "profileNavLink";
      profileLink.href = "/profile.html";
      profileLink.textContent = "My Profile";
      profileLink.style.display = "inline-flex";
      logoutBtn.parentNode.insertBefore(profileLink, logoutBtn);

      if (data.user.isAdmin) {
        userStatus.textContent = `Hi, ${data.user.firstName} (Admin)`;

        const adminLink = document.createElement("a");
        adminLink.id = "adminNavLink";
        adminLink.href = "/admin.html";
        adminLink.textContent = "Admin Panel";
        adminLink.style.display = "inline-flex";
        adminLink.style.fontWeight = "700";

        logoutBtn.parentNode.insertBefore(adminLink, logoutBtn);
      } else {
        userStatus.textContent = `Hi, ${data.user.firstName}`;
      }

      userStatus.style.display = "inline-flex";
      logoutBtn.style.display = "inline-flex";
    } else {
      loginLink.style.display = "inline-flex";
      userStatus.textContent = "";
      userStatus.style.display = "none";
      logoutBtn.style.display = "none";
    }
  } catch (err) {
    console.error("Render auth menu failed:", err);
    loginLink.style.display = "inline-flex";
    userStatus.textContent = "";
    userStatus.style.display = "none";
    logoutBtn.style.display = "none";
  }
}