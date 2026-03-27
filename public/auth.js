function isLoggedIn() {
  return localStorage.getItem("isLoggedIn") === "true";
}

function requireAuth() {
  if (!isLoggedIn()) {
    const currentPage = window.location.pathname.split("/").pop();
    window.location.href = `/public/login.html?redirect=${encodeURIComponent(currentPage)}`;
  }
}

function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("selectedPlan");
  localStorage.removeItem("selectedClass");
  localStorage.removeItem("membershipActive");
  window.location.href = "/public/index.html";
}

function renderAuthMenu() {
  const loginLink = document.getElementById("loginNavLink");
  const userStatus = document.getElementById("userStatus");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!loginLink || !userStatus || !logoutBtn) {
    return;
  }

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");

  if (user && isLoggedIn()) {
    loginLink.style.display = "none";
    userStatus.textContent = `Hi, ${user.firstName}`;
    userStatus.style.display = "inline-block";
    logoutBtn.style.display = "inline-block";
  } else {
    loginLink.style.display = "inline-block";
    userStatus.textContent = "";
    userStatus.style.display = "none";
    logoutBtn.style.display = "none";
  }
}