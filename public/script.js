document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".book-btn");

  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      const card = button.closest(".class-card");
      const className = card.querySelector("h3").textContent.trim();

      localStorage.setItem("selectedClass", className);

      const encodedClass = encodeURIComponent(`Group Class - ${className}`);
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

      if (!isLoggedIn) {
        window.location.href = `login.html?redirect=booking.html%3Fclass%3D${encodedClass}`;
        return;
      }

      window.location.href = `booking.html?class=${encodedClass}`;
    });
  });
});