document.addEventListener("DOMContentLoaded", async () => {
    // renderAuthMenu is defined in auth.js
    await renderAuthMenu();

    const user = getStoredUser();
    if (!user || !user.user_ID) return;

    await loadProfile(user.user_ID);
    await loadBookings(user.user_ID);

    document.getElementById("profileForm").addEventListener("submit", handleProfileSave);
});

async function loadProfile(userID) {
    try {
        const res = await fetch(`/users/me?user_ID=${userID}`);
        const data = await res.json();

        if (!data.ok || !data.user) return;

        const u = data.user;

        document.getElementById("firstName").value = u.firstName || "";
        document.getElementById("lastName").value = u.lastName || "";
        document.getElementById("email").value = u.email || "";
        document.getElementById("phone").value = u.phone || "";
        document.getElementById("street").value = u.street || "";
        document.getElementById("city").value = u.city || "";
        document.getElementById("state").value = u.state || "";
        document.getElementById("zip").value = u.zip || "";

        if (u.dob) {
            // dob may come as "YYYY-MM-DDT..." from MySQL; trim to date part
            document.getElementById("dob").value = u.dob.split("T")[0];
        }

        // Membership badge
        const badge = document.getElementById("membershipBadge");
        const planLabel = document.getElementById("membershipPlan");

        if (u.membershipActive) {
            badge.textContent = "Active";
            badge.className = "membership-badge active";
            planLabel.textContent = u.selectedPlan ? `· ${formatPlan(u.selectedPlan)}` : "";
        } else {
            badge.textContent = "Inactive";
            badge.className = "membership-badge inactive";
            planLabel.textContent = "";
        }
    } catch (err) {
        console.error("Failed to load profile:", err);
    }
}

async function loadBookings(userID) {
    const container = document.getElementById("bookingsList");

    try {
        const res = await fetch(`/bookings/user/${userID}`);
        const data = await res.json();

        if (!data.ok || !data.bookings || data.bookings.length === 0) {
            container.innerHTML = '<p style="color: var(--muted); font-size: 14px;">No bookings yet. <a href="classes.html">Browse classes</a>.</p>';
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = data.bookings.filter(b => new Date(b.class_date) >= today);
        const past = data.bookings.filter(b => new Date(b.class_date) < today);

        let html = "";

        if (upcoming.length > 0) {
            html += '<p style="font-size: 13px; font-weight: 700; color: var(--muted); margin-bottom: 8px;">UPCOMING</p>';
            html += upcoming.map(renderBookingItem).join("");
        }

        if (past.length > 0) {
            html += `<p style="font-size: 13px; font-weight: 700; color: var(--muted); margin-top: 18px; margin-bottom: 8px;">PAST</p>`;
            html += past.map(b => renderBookingItem(b, true)).join("");
        }

        container.innerHTML = html;
    } catch (err) {
        console.error("Failed to load bookings:", err);
        container.innerHTML = '<p style="color: var(--muted); font-size: 14px;">Could not load bookings.</p>';
    }
}

function renderBookingItem(booking, isPast = false) {
    const dateStr = formatDate(booking.class_date);
    const timeStr = formatTime(booking.start_time);
    const opacity = isPast ? "opacity: 0.55;" : "";

    return `
    <div class="booking-item" style="${opacity}">
      <div class="booking-info">
        <strong>${booking.class_name}</strong>
        <span>${booking.instructor_name ? "with " + booking.instructor_name : ""}</span>
      </div>
      <div class="booking-date">${dateStr} · ${timeStr}</div>
    </div>
  `;
}

async function handleProfileSave(e) {
    e.preventDefault();

    const user = getStoredUser();
    if (!user || !user.user_ID) return;

    const msgEl = document.getElementById("profileMsg");
    msgEl.style.display = "none";

    const payload = {
        user_ID: user.user_ID,
        first_name: document.getElementById("firstName").value.trim(),
        last_name: document.getElementById("lastName").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        dob: document.getElementById("dob").value || null,
        street: document.getElementById("street").value.trim(),
        city: document.getElementById("city").value.trim(),
        state: document.getElementById("state").value.trim(),
        zip: document.getElementById("zip").value.trim()
    };

    try {
        const res = await fetch("/users/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.ok) {
            // Update localStorage with new name
            const stored = getStoredUser();
            stored.firstName = payload.first_name;
            stored.lastName = payload.last_name;
            localStorage.setItem("loggedInUser", JSON.stringify(stored));

            showMsg(msgEl, "Profile updated successfully.", "success");
            await renderAuthMenu();
        } else {
            showMsg(msgEl, data.message || "Update failed.", "error");
        }
    } catch (err) {
        console.error("Profile save failed:", err);
        showMsg(msgEl, "Something went wrong. Please try again.", "error");
    }
}

// ── Helpers ──────────────────────────────────────────────

function showMsg(el, text, type) {
    el.textContent = text;
    el.className = `profile-msg ${type}`;
    el.style.display = "block";
}

function formatPlan(plan) {
    const map = {
        "single-class": "Single Class",
        "monthly": "Monthly",
        "annual": "Annual"
    };
    return map[plan] || plan;
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function formatTime(timeStr) {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}
