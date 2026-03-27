document.getElementById("year").textContent = new Date().getFullYear();

if (localStorage.getItem("isLoggedIn") === "true") {
  window.location.href = "/public/index.html";
}

function getUsers() {
  return JSON.parse(localStorage.getItem("upliftgym_users") || "[]");
}

function clearLoginErrors() {
  document.getElementById("email").classList.remove("input-error");
  document.getElementById("password").classList.remove("input-error");
}

function goBackPage() {
  if (document.referrer) {
    window.history.back();
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect") || "";

  if (redirect.includes("booking.html")) {
    window.location.href = "/public/classes.html";
    return;
  }

  if (redirect.includes("payment.html")) {
    window.location.href = "/public/pricing.html";
    return;
  }

  window.location.href = "/public/index.html";
}

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");
  const signupLink = document.getElementById("signupLink");

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");

  if (redirect) {
    signupLink.href = `/public/signup.html?redirect=${encodeURIComponent(redirect)}`;
  } else {
    signupLink.href = "/public/signup.html";
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    clearLoginErrors();

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();

    let valid = true;

    if (!email) {
      emailInput.classList.add("input-error");
      valid = false;
    }

    if (!password) {
      passwordInput.classList.add("input-error");
      valid = false;
    }

    if (!valid) {
      loginMessage.textContent = "Please fill in the required fields.";
      loginMessage.style.color = "red";
      return;
    }

    const users = getUsers();
    const user = users.find((item) => item.email === email && item.password === password);

    if (!user) {
      emailInput.classList.add("input-error");
      passwordInput.classList.add("input-error");
      loginMessage.textContent = "Account not found or password is incorrect.";
      loginMessage.style.color = "red";
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", user.email);
    localStorage.setItem("loggedInUser", JSON.stringify(user));

    loginMessage.textContent = "Login successful!";
    loginMessage.style.color = "green";

    setTimeout(() => {
      if (redirect) {
        window.location.href = `/public/${redirect.replace(/^\/+/, "")}`;
      } else {
        window.location.href = "/public/confirm.html";
      }
    }, 700);
  });
});