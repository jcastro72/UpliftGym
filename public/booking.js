document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("year").textContent = new Date().getFullYear();

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");
  const plan = JSON.parse(localStorage.getItem("selectedPlan"));
  const selectedClassName = localStorage.getItem("selectedClassName");

  if (!plan) {
    alert("You must select a plan first.");
    window.location.href = "/pricing.html";
    return;
  }

  if (plan.key !== "single-class" && localStorage.getItem("membershipActive") !== "true") {
    alert("You need an active membership.");
    window.location.href = "/pricing.html";
    return;
  }

  if (!selectedClassName) {
    alert("No class selected.");
    window.location.href = "/classes.html";
    return;
  }

  const state = {
    selectedSession: null,
    name: "",
    email: "",
    phone: "",
    price: 0,
    tax: 0,
    total: 0
  };

  const stepForm = document.getElementById("step-form");
  const stepReview = document.getElementById("step-review");
  const stepPayment = document.getElementById("step-payment");
  const stepConfirmation = document.getElementById("step-confirmation");

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");

  const goReviewBtn = document.getElementById("goReview");
  const goPaymentBtn = document.getElementById("goPayment");
  const editBookingReviewBtn = document.getElementById("editBookingReview");
  const backToReviewBtn = document.getElementById("backToReview");
  const completePaymentBtn = document.getElementById("completePayment");
  const bookAnotherBtn = document.getElementById("bookAnother");

  function showStep(step) {
    stepForm.style.display = "none";
    stepReview.style.display = "none";
    stepPayment.style.display = "none";
    stepConfirmation.style.display = "none";

    if (step === "form") stepForm.style.display = "block";
    if (step === "review") stepReview.style.display = "block";
    if (step === "payment") stepPayment.style.display = "block";
    if (step === "confirmation") stepConfirmation.style.display = "block";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function formatDate(dateString) {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString();
  }

  function formatTime(timeString) {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  function calculatePricing() {
    if (plan.key === "single-class") {
      const base = 25;
      const tax = base * 0.08;
      const total = base + tax;

      state.price = base;
      state.tax = tax;
      state.total = total;
    } else {
      state.price = 0;
      state.tax = 0;
      state.total = 0;
    }
  }

  function validateForm() {
    const valid =
      state.selectedSession &&
      nameInput.value.trim() &&
      emailInput.value.trim() &&
      phoneInput.value.trim();

    goReviewBtn.disabled = !valid;
  }

  function fillReviewStep() {
    document.getElementById("revSession").textContent = state.selectedSession.class_name;
    document.getElementById("revDate").textContent = formatDate(state.selectedSession.class_date);
    document.getElementById("revTime").textContent =
      `${formatTime(state.selectedSession.start_time)} - ${formatTime(state.selectedSession.end_time)}`;
    document.getElementById("revInstructor").textContent = state.selectedSession.instructor_name || "TBD";

    document.getElementById("revName").textContent = state.name;
    document.getElementById("revEmail").textContent = state.email;
    document.getElementById("revPhone").textContent = state.phone;

    if (plan.key === "single-class") {
      document.getElementById("revPrice").textContent = `$${state.price.toFixed(2)}`;
      document.getElementById("revTax").textContent = `$${state.tax.toFixed(2)}`;
      document.getElementById("revTotal").textContent = `$${state.total.toFixed(2)}`;
    } else {
      document.getElementById("revPrice").textContent = "Included in your membership";
      document.getElementById("revTax").textContent = "Included";
      document.getElementById("revTotal").textContent = "No additional charge";
    }
  }

  function fillPaymentStep() {
    document.getElementById("paySession").textContent = state.selectedSession.class_name;

    if (plan.key === "single-class") {
      document.getElementById("payPrice").textContent = `$${state.price.toFixed(2)}`;
      document.getElementById("payTax").textContent = `$${state.tax.toFixed(2)}`;
      document.getElementById("payTotal").textContent = `$${state.total.toFixed(2)}`;
      document.getElementById("payBtnTotal").textContent = state.total.toFixed(2);
    } else {
      document.getElementById("payPrice").textContent = "Included in your membership";
      document.getElementById("payTax").textContent = "Included";
      document.getElementById("payTotal").textContent = "No additional charge";
      document.getElementById("payBtnTotal").textContent = "0.00";
    }
  }

  function fillConfirmationStep() {
    document.getElementById("confSession").textContent = state.selectedSession.class_name;
    document.getElementById("confDate").textContent = formatDate(state.selectedSession.class_date);
    document.getElementById("confTime").textContent =
      `${formatTime(state.selectedSession.start_time)} - ${formatTime(state.selectedSession.end_time)}`;
    document.getElementById("confInstructor").textContent = state.selectedSession.instructor_name || "TBD";

    document.getElementById("confName").textContent = state.name;
    document.getElementById("confEmail").textContent = state.email;
    document.getElementById("confPhone").textContent = state.phone;

    if (plan.key === "single-class") {
      document.getElementById("confPrice").textContent = `$${state.price.toFixed(2)}`;
      document.getElementById("confTax").textContent = `$${state.tax.toFixed(2)}`;
      document.getElementById("confTotal").textContent = `$${state.total.toFixed(2)}`;
    } else {
      document.getElementById("confPrice").textContent = "Included in your membership";
      document.getElementById("confTax").textContent = "Included";
      document.getElementById("confTotal").textContent = "No additional charge";
    }
  }

  async function loadSessions() {
    const selectedClassDisplay = document.getElementById("selectedClassDisplay");
    const sessionsList = document.getElementById("sessionsList");
    const remainingText = document.getElementById("remainingText");

    selectedClassDisplay.textContent = selectedClassName;
    document.getElementById("bookingTitle").textContent = `Book ${selectedClassName}`;

    try {
      const response = await fetch(`/class/by-name/${encodeURIComponent(selectedClassName)}`);
      const data = await response.json();

      if (!data.ok || !data.classes || data.classes.length === 0) {
        sessionsList.innerHTML = "<p>No sessions available for this class right now.</p>";
        remainingText.textContent = "";
        return;
      }

      sessionsList.innerHTML = "";

      for (const cls of data.classes) {
        const spotsRes = await fetch(`/bookings/spots/${cls.class_ID}`);
        const spotsData = await spotsRes.json();
        const booked = spotsData.ok ? spotsData.booked : 0;
        const remainingSpots = Math.max(cls.max_capacity - booked, 0);

        const sessionCard = document.createElement("button");
        sessionCard.type = "button";
        sessionCard.className = "time-slot-btn";
        sessionCard.style.textAlign = "left";
        sessionCard.style.padding = "14px";
        sessionCard.style.display = "block";
        sessionCard.style.width = "100%";
        sessionCard.disabled = remainingSpots === 0;

        sessionCard.innerHTML = `
          <strong>${formatDate(cls.class_date)}</strong><br>
          ${formatTime(cls.start_time)} - ${formatTime(cls.end_time)}<br>
          Instructor: ${cls.instructor_name || "TBD"}<br>
          Spots left: ${remainingSpots}
        `;

        sessionCard.addEventListener("click", () => {
          state.selectedSession = cls;

          document.querySelectorAll("#sessionsList .time-slot-btn").forEach((btn) => {
            btn.classList.remove("selected");
          });

          sessionCard.classList.add("selected");
          remainingText.textContent = `Spots left for selected session: ${remainingSpots}`;
          validateForm();
        });

        sessionsList.appendChild(sessionCard);
      }
    } catch (err) {
      console.error(err);
      sessionsList.innerHTML = "<p>Failed to load sessions. Please try again later.</p>";
      remainingText.textContent = "";
    }
  }

  async function finalizeBooking() {
    const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");

    if (!state.selectedSession || !state.selectedSession.class_ID) {
      alert("Please select a session.");
      return;
    }

    if (!user || !user.user_ID) {
      alert("You must be logged in to book a class.");
      window.location.href = "/login.html?redirect=booking.html";
      return;
    }

    try {
      const response = await fetch("/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_ID: user.user_ID,
          class_ID: state.selectedSession.class_ID
        })
      });

      const data = await response.json();

      if (!data.ok) {
        alert(data.message || "Failed to book session.");
        return;
      }
      if (data.membershipConsumed) {
        localStorage.removeItem("membershipActive");

        const currentUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");
        if (currentUser) {
          currentUser.membershipActive = false;
          currentUser.selectedPlan = null;
          localStorage.setItem("loggedInUser", JSON.stringify(currentUser));
        }

        localStorage.removeItem("selectedPlan");
      }

      fillConfirmationStep();
      showStep("confirmation");
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again later.");
    }
  }

  function loadInitialData() {
    if (loggedInUser) {
      nameInput.value = `${loggedInUser.firstName} ${loggedInUser.lastName}`;
      emailInput.value = loggedInUser.email;
      state.name = nameInput.value.trim();
      state.email = emailInput.value.trim();
    }
  }

  nameInput.addEventListener("input", validateForm);
  emailInput.addEventListener("input", validateForm);
  phoneInput.addEventListener("input", validateForm);

  goReviewBtn.addEventListener("click", () => {
    state.name = nameInput.value.trim();
    state.email = emailInput.value.trim();
    state.phone = phoneInput.value.trim();

    calculatePricing();
    fillReviewStep();
    showStep("review");
  });

  editBookingReviewBtn.addEventListener("click", () => showStep("form"));

  goPaymentBtn.addEventListener("click", () => {
    if (plan.key === "single-class") {
      fillPaymentStep();
      showStep("payment");
    } else {
      finalizeBooking();
    }
  });

  backToReviewBtn.addEventListener("click", () => showStep("review"));

  document.getElementById("cardNumber").addEventListener("input", function (e) {
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
    e.target.value = e.target.value.replace(/\D/g, "").substring(0, 3);
  });

  document.getElementById("billingZip").addEventListener("input", function (e) {
    e.target.value = e.target.value.replace(/\D/g, "").substring(0, 5);
  });

  completePaymentBtn.addEventListener("click", function () {
    const cardNumber = document.getElementById("cardNumber").value.trim().replace(/\s/g, "");
    const cardName = document.getElementById("cardName").value.trim();
    const expiry = document.getElementById("expiry").value.trim();
    const cvv = document.getElementById("cvv").value.trim();
    const billingZip = document.getElementById("billingZip").value.trim();

    if (!cardNumber || !cardName || !expiry || !cvv || !billingZip) {
      alert("Please fill in all payment fields.");
      return;
    }

    if (cardNumber.length !== 16) {
      alert("Please enter a valid card number.");
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      alert("Please enter a valid expiry date in MM/YY format.");
      return;
    }

    if (!/^\d{3}$/.test(cvv)) {
      alert("Please enter a valid CVV.");
      return;
    }

    if (!/^\d{5}$/.test(billingZip)) {
      alert("Please enter a valid ZIP code.");
      return;
    }

    finalizeBooking();
  });

  bookAnotherBtn.addEventListener("click", () => {
    window.location.href = "/classes.html";
  });

  loadInitialData();
  loadSessions();
  validateForm();
  showStep("form");
});