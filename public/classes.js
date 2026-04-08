// classes.js

document.addEventListener("DOMContentLoaded", async () => {
  const classGrid = document.querySelector(".class-grid");
  classGrid.innerHTML = "<p>Loading classes...</p>";

  try {
    // 1️⃣ Fetch all classes from backend
    const res = await fetch("/class"); // make sure your backend has this route
    if (!res.ok) throw new Error("Failed to fetch classes");

    const data = await res.json();
    const classes = data.classes; // expect { classes: [ {...}, {...} ] }

    if (!classes || classes.length === 0) {
      classGrid.innerHTML = "<p>No classes available right now.</p>";
      return;
    }

    // 2️⃣ Clear loading text
    classGrid.innerHTML = "";

    // 3️⃣ Map backend data to cards
    for (const cls of classes) {
      // fetch booked spots
      const spotsRes = await fetch(`/bookings/spots/${cls.class_ID}`);
      const spotsData = await spotsRes.json();
      const booked = spotsData.ok ? spotsData.booked : 0;
      const remainingSpots = Math.max(cls.max_capacity - booked, 0);

      // determine image based on class_name (you can expand this mapping)
      const images = {
        "Yoga": "images/yoga.png",
        "HIIT": "images/hiit.png",
        "Pilates": "images/pilates.png",
        "Spin": "images/spin.png",
        "Strength Training": "images/strength.png",
        "Zumba": "images/zumba.png",
        "Functional Training": "images/functional.png",
        "Boxing Fitness": "images/boxing.png",
        "Mobility & Stretch": "images/mobility.png",
        "Meditation": "images/meditation.png"
      };

      const imgSrc = images[cls.class_name] || "images/default.png";

      const card = document.createElement("article");
      card.classList.add("class-card");

      card.innerHTML = `
        <img class="class-img" src="${imgSrc}" alt="${cls.class_name}">
        <div class="class-body">
          <h3>${cls.class_name}</h3>
          <p>Instructor: ${cls.instructor_name}</p>
          <p>Date: ${cls.class_date}</p>
          <p>Time: ${cls.start_time} - ${cls.end_time}</p>
          <p class="spots-text">Spots left: <span class="spots">${remainingSpots}</span></p>
          <button class="btn btn-dark book-btn" onclick="goToBooking(${cls.class_ID}, '${cls.class_name}')"
            ${remainingSpots === 0 ? "disabled" : ""}>
            ${remainingSpots === 0 ? "Full" : "Book"}
          </button>
        </div>
      `;

      classGrid.appendChild(card);
    }
  } catch (err) {
    console.error(err);
    classGrid.innerHTML = "<p>Error loading classes. Please try again later.</p>";
  }
});

// redirect to booking page with class_ID
function goToBooking(class_ID, className) {
  localStorage.setItem("selectedClassID", class_ID);
  localStorage.setItem("selectedClassName", className);

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  
  if (!isLoggedIn) {
    window.location.href = "login.html?redirect=booking.html";
    return;
  }

  window.location.href = "booking.html";
}