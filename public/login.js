document.getElementById("year").textContent = new Date().getFullYear();

// If already logged in, redirect to homepage
if (localStorage.getItem("isLoggedIn") === "true") {
  window.location.href = "/index.html";
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
    window.location.href = "/classes.html";
    return;
  }

  if (redirect.includes("payment.html")) {
    window.location.href = "/pricing.html";
    return;
  }

  window.location.href = "/index.html";
}

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");
  const signupLink = document.getElementById("signupLink");

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");

  if (redirect) {
    signupLink.href = `/signup.html?redirect=${encodeURIComponent(redirect)}`;
  } else {
    signupLink.href = "/signup.html";
  }

  loginForm.addEventListener("submit", async function (e) {
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

    try {
      // Send login request to backend
      const response = await fetch("/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        // Backend returned an error (user not found or wrong password)
        emailInput.classList.add("input-error");
        passwordInput.classList.add("input-error");
        loginMessage.textContent = data.error || "Login failed.";
        loginMessage.style.color = "red";
        return;
      }

      const user = data.user;

      // Store user info in localStorage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("loggedInUser", JSON.stringify(user));

      if (user.selectedPlan) {
        localStorage.setItem("selectedPlan", JSON.stringify(user.selectedPlan));
      }

      if (user.membershipActive) {
        localStorage.setItem("membershipActive", "true");
      }

      loginMessage.textContent = "Login successful!";
      loginMessage.style.color = "green";

      setTimeout(() => {
        if (redirect) {
          window.location.href = `/${redirect.replace(/^\/+/, "")}`;
        } else {
          window.location.href = "/confirm.html";
        }
      }, 700);

    } catch (error) {
      console.error("Login error:", error);
      loginMessage.textContent = "Server error. Please try again later.";
      loginMessage.style.color = "red";
    }
  });
});