// -----------------------------
// TAB SWITCHING (Main Feature)
// -----------------------------

// When a nav link is clicked, switch the visible section
document.querySelectorAll('.user-nav a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();

    // Remove active class from all nav links
    document.querySelectorAll('.user-nav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');

    // Hide all sections
    document.querySelectorAll('.user-block').forEach(block => block.classList.remove('active'));

    // Show the selected section
    const target = link.getAttribute('href'); // e.g. "#membership"
    document.querySelector(target).classList.add('active');
  });
});


// --------------------------------------
// OPTIONAL: Highlight based on URL hash
// (Allows linking directly to #classes)
// --------------------------------------

function highlightFromHash() {
  const hash = window.location.hash || "#security";

  // Update nav highlight
  document.querySelectorAll('.user-nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === hash);
  });

  // Update visible section
  document.querySelectorAll('.user-block').forEach(block => block.classList.remove('active'));
  document.querySelector(hash).classList.add('active');
}

window.addEventListener("load", highlightFromHash);
window.addEventListener("hashchange", highlightFromHash);


// -----------------------------
// LOGOUT BUTTON (JS Developer)
// -----------------------------

document.getElementById("userLogoutBtn").addEventListener("click", () => {
  // JS dev will replace this with real logout logic
  window.location.href = "login.html";
});
