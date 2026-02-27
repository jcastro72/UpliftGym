const buttons = document.querySelectorAll(".book-btn");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".class-card");
    const spotsSpan = card.querySelector(".spots");
    let spots = parseInt(spotsSpan.textContent, 10);

    if (spots > 0) {
      spots--;
      spotsSpan.textContent = spots;

      if (spots === 0) {
        button.textContent = "Full";
        button.disabled = true;
        button.style.opacity = "0.6";
        button.style.cursor = "not-allowed";
      }
    }
  });
});