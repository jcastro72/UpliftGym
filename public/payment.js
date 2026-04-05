document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("year").textContent = new Date().getFullYear();

  const plan = JSON.parse(localStorage.getItem("selectedPlan") || "null");
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");

  if (!plan) {
    window.location.href = "/pricing.html";
    return;
  }

  if (!loggedInUser || !loggedInUser.user_ID) {
    window.location.href = "/login.html?redirect=payment.html";
    return;
  }

  document.getElementById("planName").textContent = plan.name || "Selected Plan";
  document.getElementById("planPrice").textContent = plan.price || "";

  const useProfileAddress = document.getElementById("useProfileAddress");

  const streetInput = document.getElementById("street");
  const cityInput = document.getElementById("city");
  const stateInput = document.getElementById("state");
  const zipInput = document.getElementById("zip");

  function clearErrors() {
    const fields = ["card", "name", "expiry", "cvv", "street", "city", "state", "zip"];
    fields.forEach((id) => {
      document.getElementById(id).classList.remove("input-error");
    });
  }

  function validatePayment() {
    clearErrors();
    let valid = true;

    const fields = ["card", "name", "expiry", "cvv", "street", "city", "state", "zip"];

    fields.forEach((id) => {
      const input = document.getElementById(id);

      if (input.disabled) {
        return;
      }

      if (!input.value.trim()) {
        input.classList.add("input-error");
        valid = false;
      }
    });

    const card = document.getElementById("card").value.replace(/\s/g, "");
    const expiry = document.getElementById("expiry").value.trim();
    const cvv = document.getElementById("cvv").value.trim();
    const state = document.getElementById("state").value.trim();
    const zip = document.getElementById("zip").value.trim();

    if (card && card.length !== 16) {
      document.getElementById("card").classList.add("input-error");
      valid = false;
    }

    if (expiry && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      document.getElementById("expiry").classList.add("input-error");
      valid = false;
    }

    if (cvv && !/^\d{3,4}$/.test(cvv)) {
      document.getElementById("cvv").classList.add("input-error");
      valid = false;
    }

    if (state && state.length !== 2) {
      document.getElementById("state").classList.add("input-error");
      valid = false;
    }

    if (zip && !/^\d{5}$/.test(zip)) {
      document.getElementById("zip").classList.add("input-error");
      valid = false;
    }

    return valid;
  }

  useProfileAddress.addEventListener("change", function () {
    if (this.checked && loggedInUser) {
      streetInput.value = loggedInUser.street || "";
      cityInput.value = loggedInUser.city || "";
      stateInput.value = loggedInUser.state || "";
      zipInput.value = loggedInUser.zip || "";

      streetInput.disabled = true;
      cityInput.disabled = true;
      stateInput.disabled = true;
      zipInput.disabled = true;

      streetInput.classList.remove("input-error");
      cityInput.classList.remove("input-error");
      stateInput.classList.remove("input-error");
      zipInput.classList.remove("input-error");
    } else {
      streetInput.value = "";
      cityInput.value = "";
      stateInput.value = "";
      zipInput.value = "";

      streetInput.disabled = false;
      cityInput.disabled = false;
      stateInput.disabled = false;
      zipInput.disabled = false;
    }
  });

  document.getElementById("card").addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "").substring(0, 16);
    value = value.replace(/(.{4})/g, "$1 ").trim();
    e.target.value = value;
  });

  document.getElementById("expiry").addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "").substring(0, 4);

    if (value.length >= 3) {
      value = value.substring(0, 2) + "/" + value.substring(2);
    }

    e.target.value = value;
  });

  document.getElementById("cvv").addEventListener("input", function (e) {
    e.target.value = e.target.value.replace(/\D/g, "").substring(0, 4);
  });

  document.getElementById("state").addEventListener("input", function (e) {
    e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "").substring(0, 2).toUpperCase();
  });

  document.getElementById("zip").addEventListener("input", function (e) {
    e.target.value = e.target.value.replace(/\D/g, "").substring(0, 5);
  });

  document.getElementById("payBtn").addEventListener("click", async () => {
    if (!validatePayment()) {
      return;
    }

    try {
      const response = await fetch("/users/membership", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_ID: loggedInUser.user_ID,
          membershipActive: true,
          selectedPlan: plan.key
        })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        alert(data.message || "Failed to update membership.");
        return;
      }

      const updatedUser = {
        ...loggedInUser,
        membershipActive: true,
        selectedPlan: plan.key
      };

      localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
      localStorage.setItem("membershipActive", "true");
      localStorage.setItem("selectedPlan", JSON.stringify(plan));

      window.location.href = "confirm.html";
    } catch (err) {
      console.error("Payment update error:", err);
      alert("Something went wrong. Please try again later.");
    }
  });
});