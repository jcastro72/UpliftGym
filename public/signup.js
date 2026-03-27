document.getElementById("year").textContent = new Date().getFullYear();

function getUsers() {
  return JSON.parse(localStorage.getItem("upliftgym_users") || "[]");
}

function saveUsers(users) {
  localStorage.setItem("upliftgym_users", JSON.stringify(users));
}

function clearSignupErrors() {
  const fields = ["firstName", "lastName", "dob", "street", "city", "state", "zip", "email", "password"];
  fields.forEach((id) => {
    document.getElementById(id).classList.remove("input-error");
  });
}

function validateSignup() {
  clearSignupErrors();
  let valid = true;

  const fields = ["firstName", "lastName", "dob", "street", "city", "state", "zip", "email", "password"];

  fields.forEach((id) => {
    const input = document.getElementById(id);
    if (!input.value.trim()) {
      input.classList.add("input-error");
      valid = false;
    }
  });

  const state = document.getElementById("state").value.trim();
  const zip = document.getElementById("zip").value.trim();
  const email = document.getElementById("email").value.trim();

  if (state && state.length !== 2) {
    document.getElementById("state").classList.add("input-error");
    valid = false;
  }

  if (zip && !/^\d{5}$/.test(zip)) {
    document.getElementById("zip").classList.add("input-error");
    valid = false;
  }

  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    document.getElementById("email").classList.add("input-error");
    valid = false;
  }

  return valid;
}

document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signupForm");
  const signupMessage = document.getElementById("signupMessage");
  const loginLink = document.getElementById("loginLink");

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");

  if (redirect) {
    loginLink.href = `/public/login.html?redirect=${encodeURIComponent(redirect)}`;
  } else {
    loginLink.href = "/public/login.html";
  }

  document.getElementById("state").addEventListener("input", function (e) {
    e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "").substring(0, 2).toUpperCase();
  });

  document.getElementById("zip").addEventListener("input", function (e) {
    e.target.value = e.target.value.replace(/\D/g, "").substring(0, 5);
  });

  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validateSignup()) {
      signupMessage.textContent = "Please correct the highlighted fields.";
      signupMessage.style.color = "red";
      return;
    }

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const dob = document.getElementById("dob").value;
    const street = document.getElementById("street").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();
    const zip = document.getElementById("zip").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();

    const users = getUsers();
    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
      signupMessage.textContent = "An account with this email already exists.";
      signupMessage.style.color = "red";
      document.getElementById("email").classList.add("input-error");
      return;
    }

    const newUser = {
      firstName,
      lastName,
      dob,
      street,
      city,
      state,
      zip,
      email,
      password
    };

    users.push(newUser);
    saveUsers(users);

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", newUser.email);
    localStorage.setItem("loggedInUser", JSON.stringify(newUser));

    signupMessage.textContent = "Account created successfully!";
    signupMessage.style.color = "green";

    setTimeout(() => {
      if (redirect) {
        window.location.href = `/public/${redirect.replace(/^\/+/, "")}`;
      } else {
        window.location.href = "/public/confirm.html";
      }
    }, 700);
  });
});