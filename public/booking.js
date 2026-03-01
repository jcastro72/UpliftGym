
// -----------------------------------------------------
// Auto-select class from URL
// -----------------------------------------------------
const params = new URLSearchParams(window.location.search);
const preselectedClass = params.get("class");

if (preselectedClass) {
  const sessionSelect = document.getElementById("sessionType");
  sessionSelect.value = preselectedClass;
  state.sessionType = preselectedClass;
}



// -----------------------------------------------------
// Booking Manager (capacity + storage)
// -----------------------------------------------------
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

  static isGroupSession(type) {
    return type.startsWith("Group Class");
  }

  static getGroupTimes() {
    return ["08:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM"];
  }

  static getAvailableSpots(date, time, type) {
    if (!this.isGroupSession(type)) return this.GROUP_CAPACITY;

    const bookings = this.getBookings();
    const count = bookings.filter(
      b => b.date === date && b.time === time && this.isGroupSession(b.sessionType)
    ).length;

    return Math.max(0, this.GROUP_CAPACITY - count);
  }
}

// -----------------------------------------------------
// App State
// -----------------------------------------------------
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

// -----------------------------------------------------
// Auto-select class from URL
// -----------------------------------------------------
const params = new URLSearchParams(window.location.search);
const preselectedClass = params.get("class");

if (preselectedClass) {
  const sessionSelect = document.getElementById("sessionType");
  sessionSelect.value = preselectedClass;
  state.sessionType = preselectedClass;
  renderTimeSlots();
  validateForm();
}

// -----------------------------------------------------
// Step Elements
// -----------------------------------------------------
const stepForm = document.getElementById("step-form");
const stepReview = document.getElementById("step-review");
const stepPayment = document.getElementById("step-payment");
const stepConfirmation = document.getElementById("step-confirmation");

function showStep(step) {
  const steps = {
    form: stepForm,
    review: stepReview,
    payment: stepPayment,
    confirmation: stepConfirmation
  };

  Object.values(steps).forEach(s => {
    s.style.display = "none";
    s.classList.remove("active");
  });

  const activeStep = steps[step];
  activeStep.style.display = "block";

  requestAnimationFrame(() => {
    activeStep.classList.add("active");
  });
}


// -----------------------------------------------------
// Validation Logic
// -----------------------------------------------------
function validateForm() {
  const isValid =
    state.sessionType &&
    state.date &&
    state.time &&
    document.getElementById("name").value.trim() &&
    document.getElementById("email").value.trim() &&
    document.getElementById("phone").value.trim();

  document.getElementById("goReview").disabled = !isValid;
}


// -----------------------------------------------------
// Event Listeners
// -----------------------------------------------------
document.getElementById("sessionType").addEventListener("change", e => {
  state.sessionType = e.target.value;
  renderTimeSlots();
  validateForm();
});

document.getElementById("date").addEventListener("change", e => {
  state.date = e.target.value;
  renderTimeSlots();
  validateForm();
});

document.getElementById("name").addEventListener("input", validateForm);
document.getElementById("email").addEventListener("input", validateForm);
document.getElementById("phone").addEventListener("input", validateForm);


// -----------------------------------------------------
// Time Slot Rendering
// -----------------------------------------------------
function renderTimeSlots() {
  const container = document.getElementById("timeSlots");
  container.innerHTML = "";

  if (!state.sessionType || !state.date) return;

  const slots = BookingManager.getGroupTimes();

  slots.forEach(slot => {
    const spots = BookingManager.getAvailableSpots(state.date, slot, state.sessionType);
    const disabled = spots === 0;

    const btn = document.createElement("button");
    btn.className = "time-slot-btn";
    btn.textContent = `${slot} (${spots} spots left)`;
    btn.disabled = disabled;

    btn.onclick = () => {
      state.time = slot;
      renderTimeSlots();
      validateForm();
    };

    if (state.time === slot) btn.classList.add("selected");

    container.appendChild(btn);
  });
}

// -----------------------------------------------------
// Pricing
// -----------------------------------------------------
function calculatePricing() {
  const base = 25.00;
  const tax = base * 0.08;
  const total = base + tax;

  state.price = base;
  state.tax = tax;
  state.total = total;
}



// -----------------------------------------------------
// Review Step
// -----------------------------------------------------
document.getElementById("goReview").onclick = () => {
  calculatePricing();

  state.name = document.getElementById("name").value;
  state.email = document.getElementById("email").value;
  state.phone = document.getElementById("phone").value;

  const review = `
    <p><strong>Session:</strong> ${state.sessionType}</p>
    <p><strong>Date:</strong> ${state.date}</p>
    <p><strong>Time:</strong> ${state.time}</p>
    <p><strong>Name:</strong> ${state.name}</p>
    <p><strong>Total:</strong> $${state.total.toFixed(2)}</p>
  `;

  document.getElementById("reviewDetails").innerHTML = review;
  showStep("review");
};



// -----------------------------------------------------
// Payment Step
// -----------------------------------------------------
document.getElementById("goPayment").onclick = () => showStep("payment");

document.getElementById("completePayment").onclick = () => {
  BookingManager.addBooking({
    date: state.date,
    time: state.time,
    sessionType: state.sessionType
  });

  document.getElementById("confirmDetails").innerHTML =
    `Your session is booked for ${state.date} at ${state.time}.`;

  showStep("confirmation");
};

document.getElementById("bookAnother").onclick = () => {
  location.reload();
};

