document.getElementById("year").textContent = new Date().getFullYear();

async function alreadyLoggedIn() {
  const user = getStoredUser();

  if (!user || !user.user_ID) {
    return false;
  }

  try {
    const res = await fetch(`/users/me?user_ID=${user.user_ID}`);
    const data = await res.json();
    return data.ok && data.user;
  } catch (err) {
    console.error("Already logged in check failed:", err);
    return false;
  }
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

document.addEventListener("DOMContentLoaded", async function () {
  const isAlreadyLoggedIn = await alreadyLoggedIn();

  if (isAlreadyLoggedIn) {
    window.location.href = "/classes.html";
    return;
  }

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
      const response = await fetch("/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        emailInput.classList.add("input-error");
        passwordInput.classList.add("input-error");
        loginMessage.textContent = data.error || data.message || "Login failed.";
        loginMessage.style.color = "red";
        return;
      }

      const user = data.user;

      localStorage.setItem("loggedInUser", JSON.stringify(user));
      localStorage.setItem("userEmail", user.email);

      if (user.selectedPlan) {
        localStorage.setItem("selectedPlan", JSON.stringify(user.selectedPlan));
      } else {
        localStorage.removeItem("selectedPlan");
      }

      if (user.membershipActive) {
        localStorage.setItem("membershipActive", "true");
      } else {
        localStorage.removeItem("membershipActive");
      }

      loginMessage.textContent = "Login successful!";
      loginMessage.style.color = "green";

      setTimeout(() => {
        if (redirect) {
          window.location.href = `/${redirect.replace(/^\/+/, "")}`;
        } else {
          window.location.href = "/classes.html";
        }
      }, 700);

    } catch (error) {
      console.error("Login error:", error);
      loginMessage.textContent = "Server error. Please try again later.";
      loginMessage.style.color = "red";
    }
  });
});