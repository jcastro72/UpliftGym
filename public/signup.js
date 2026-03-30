document.getElementById("year").textContent = new Date().getFullYear();

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

  loginLink.href = redirect
    ? `/public/login.html?redirect=${encodeURIComponent(redirect)}`
    : "/public/login.html";

  document.getElementById("state").addEventListener("input", function (e) {
    e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "").substring(0, 2).toUpperCase();
  });

  document.getElementById("zip").addEventListener("input", function (e) {
    e.target.value = e.target.value.replace(/\D/g, "").substring(0, 5);
  });

  signupForm.addEventListener("submit", async function (e) {
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

    try {
      // POST to backend /users
      const response = await fetch("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          dob,
          street,
          city,
          state,
          zip,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        signupMessage.textContent = data.error || "Signup failed";
        signupMessage.style.color = "red";
        if (data.error && data.error.toLowerCase().includes("email")) {
          document.getElementById("email").classList.add("input-error");
        }
        return;
      }

      // Successful signup
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("loggedInUser", JSON.stringify(data));

      signupMessage.textContent = "Account created successfully!";
      signupMessage.style.color = "green";

      // Keep the original setTimeout redirect logic
      setTimeout(() => {
        if (redirect) {
          window.location.href = `/${redirect.replace(/^\/+/, "")}`;
        } else {
          window.location.href = "/index.html";
        }
      }, 700);

    } catch (err) {
      console.error("Error signing up:", err);
      signupMessage.textContent = "Something went wrong. Please try again later.";
      signupMessage.style.color = "red";
    }
  });
});