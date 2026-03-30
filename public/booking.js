document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("year").textContent = new Date().getFullYear();

  const plan = JSON.parse(localStorage.getItem("selectedPlan"));
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");

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

  const state = {
    sessionType: "",
    date: "",
    time: "",
    name: "",
    email: "",
    phone: "",
    price: 0,
    tax: 0,
    total: 0
  };

  class BookingManager {
    static STORAGE_KEY = "upliftgym_bookings";
    static GROUP_CAPACITY = 20;

    static getBookings() {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || "[]");
    }

    static addBooking(booking) {
      const bookings = this.getBookings();
      bookings.push(booking);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings));
    }

    static getGroupTimes(sessionType) {
    const classSchedules = {
      "Group Class - Yoga": ["08:00 AM", "06:00 PM"],
      "Group Class - HIIT": ["10:00 AM", "05:00 PM"],
      "Group Class - Pilates": ["09:00 AM", "07:00 PM"],
      "Group Class - Spin": ["06:30 AM", "06:30 PM"],
      "Group Class - Strength Training": ["12:00 PM", "07:30 PM"],
      "Group Class - Zumba": ["05:30 PM"],
      "Group Class - Functional Training": ["07:00 AM", "05:00 PM"],
      "Group Class - Boxing Fitness": ["06:00 PM"],
      "Group Class - Mobility & Stretch": ["08:30 AM"],
      "Group Class - Meditation": ["07:30 PM"]
    };

    return classSchedules[sessionType] || [];
    }

    static getAvailableSpots(date, time, type) {
      const bookings = this.getBookings();

      const count = bookings.filter((b) =>
        b.date === date &&
        b.time === time &&
        b.sessionType === type
      ).length;

      return Math.max(0, this.GROUP_CAPACITY - count);
    }

    static getUserBookings() {
      const bookings = this.getBookings();
      const userEmail = localStorage.getItem("userEmail");

      return bookings.filter((b) => b.email === userEmail);
    }

   static getWeekKey(dateString) {
      const date = new Date(dateString + "T00:00:00");
      const day = date.getDay();
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - day);

      const year = weekStart.getFullYear();
      const month = String(weekStart.getMonth() + 1).padStart(2, "0");
      const dayNum = String(weekStart.getDate()).padStart(2, "0");

      return `${year}-${month}-${dayNum}`;
    }

    static getUserWeeklyBookings(date) {
      const userBookings = this.getUserBookings();
      const selectedWeekKey = this.getWeekKey(date);

      return userBookings.filter((booking) => {
        return this.getWeekKey(booking.date) === selectedWeekKey;
      }).length;
    }
  }

  function canBookMore(date) {
    const userBookings = BookingManager.getUserBookings();

    if (plan.key === "single-class") {
      return userBookings.length < 1;
    }

    const weekly = BookingManager.getUserWeeklyBookings(date);

    if (plan.key === "starter") return weekly < 2;
    if (plan.key === "plus") return weekly < 4;
    if (plan.key === "unlimited") return true;

    return false;
  }

  function getRemainingBookings(date) {
    const userBookings = BookingManager.getUserBookings();

    if (plan.key === "single-class") {
      return 1 - userBookings.length;
    }

    const used = BookingManager.getUserWeeklyBookings(date);

    if (plan.key === "starter") return 2 - used;
    if (plan.key === "plus") return 4 - used;
    if (plan.key === "unlimited") return "Unlimited";

    return 0;
  }

  const stepForm = document.getElementById("step-form");
  const stepReview = document.getElementById("step-review");
  const stepPayment = document.getElementById("step-payment");
  const stepConfirmation = document.getElementById("step-confirmation");

  const sessionType = document.getElementById("sessionType");
  const dateInput = document.getElementById("date");
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
    const remaining = state.date ? getRemainingBookings(state.date) : null;

    const valid =
      state.sessionType &&
      state.date &&
      state.time &&
      nameInput.value.trim() &&
      emailInput.value.trim() &&
      phoneInput.value.trim();

    if (remaining !== null && remaining !== "Unlimited" && remaining <= 0) {
      goReviewBtn.disabled = true;
      return;
    }

    goReviewBtn.disabled = !valid;
  }

  function updateRemainingText() {
    const el = document.getElementById("remainingText");

    if (!state.date) {
      el.textContent = "";
      return;
    }

    const remaining = getRemainingBookings(state.date);

    if (remaining === "Unlimited") {
      el.textContent = "You have unlimited bookings.";
      return;
    }

    if (remaining <= 0) {
      el.textContent = "No bookings left for this plan.";
      return;
    }

    el.textContent = `You have ${remaining} class(es) left.`;
  }

  function renderTimeSlots() {
    const container = document.getElementById("timeSlots");
    container.innerHTML = "";

    if (!state.sessionType || !state.date) {
      return;
    }

    const slots = BookingManager.getGroupTimes(state.sessionType);

    slots.forEach((slot) => {
      const spots = BookingManager.getAvailableSpots(state.date, slot, state.sessionType);
      const button = document.createElement("button");

      button.type = "button";
      button.className = "time-slot-btn";
      button.textContent = `${slot} (${spots} spots left)`;

      if (spots === 0) {
        button.disabled = true;
      }

      if (state.time === slot) {
        button.classList.add("selected");
      }

      button.addEventListener("click", function () {
        state.time = slot;
        renderTimeSlots();
        validateForm();
      });

      container.appendChild(button);
    });
  }

  function fillReviewStep() {
    document.getElementById("revSession").textContent = state.sessionType;
    document.getElementById("revDate").textContent = state.date;
    document.getElementById("revTime").textContent = state.time;
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
    document.getElementById("paySession").textContent = state.sessionType;

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
  document.getElementById("confSession").textContent = state.sessionType;
  document.getElementById("confDate").textContent = state.date;
  document.getElementById("confTime").textContent = state.time;
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

  function finalizeBooking() {
    if (!canBookMore(state.date)) {
      alert("You reached your booking limit.");
      return;
    }

    BookingManager.addBooking({
      sessionType: state.sessionType,
      date: state.date,
      time: state.time,
      name: state.name,
      email: localStorage.getItem("userEmail"),
      phone: state.phone
    });

    fillConfirmationStep();
    showStep("confirmation");
    updateRemainingText();
  }

  function loadInitialData() {
    const params = new URLSearchParams(window.location.search);
    const preselectedClass = params.get("class");
    const savedClass = localStorage.getItem("selectedClass");

    if (preselectedClass) {
      sessionType.value = preselectedClass;
      state.sessionType = preselectedClass;
    } else if (savedClass) {
      const fullClassName = `Group Class - ${savedClass}`;
      sessionType.value = fullClassName;
      state.sessionType = fullClassName;
    }

    if (loggedInUser) {
      nameInput.value = `${loggedInUser.firstName} ${loggedInUser.lastName}`;
      emailInput.value = loggedInUser.email;
      state.name = nameInput.value.trim();
      state.email = emailInput.value.trim();
    }

    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
  }

  sessionType.addEventListener("change", function (event) {
    state.sessionType = event.target.value;
    state.time = "";
    renderTimeSlots();
    validateForm();
  });

  dateInput.addEventListener("change", function (event) {
    state.date = event.target.value;
    state.time = "";
    renderTimeSlots();
    updateRemainingText();
    validateForm();
  });

  nameInput.addEventListener("input", validateForm);
  emailInput.addEventListener("input", validateForm);
  phoneInput.addEventListener("input", validateForm);

  goReviewBtn.addEventListener("click", function () {
    state.name = nameInput.value.trim();
    state.email = emailInput.value.trim();
    state.phone = phoneInput.value.trim();

    calculatePricing();
    fillReviewStep();

    if (plan.key === "single-class") {
      showStep("review");
    } else {
      showStep("review");
    }
  });

  editBookingReviewBtn.addEventListener("click", function () {
    showStep("form");
  });

  goPaymentBtn.addEventListener("click", function () {
    if (plan.key === "single-class") {
      fillPaymentStep();
      showStep("payment");
    } else {
      finalizeBooking();
    }
  });

  backToReviewBtn.addEventListener("click", function () {
    showStep("review");
  });

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

  bookAnotherBtn.addEventListener("click", function () {
    window.location.href = "/classes.html";
  });

  loadInitialData();
  renderTimeSlots();
  updateRemainingText();
  validateForm();
  showStep("form");
});