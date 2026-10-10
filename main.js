
/* =========================================
   TOP WAR SERVER 4536 - ALLIANCE HUB
   Datei: script.js
   ========================================= */

// DEMO-ZUGANGSDATEN - NICHT FÜR PRODUKTIVE AUTHENTIFIZIERUNG
const MEMBER_USERNAME = "Server";
const MEMBER_PASSWORD = "TWC";
const MANAGEMENT_PASSWORD = "R4TWC";

// Demo-Modus
const DEMO_MODE = false;

// =========================================
// APP-STATUS
// =========================================

const state = {
  loggedIn: false, 
  managementUnlocked: false,
  currentPage: "overview",

  announcements: [
    {
      title: "Welcome to Server 4536",
      text: "Welcome to the official alliance hub. Check announcements and events regularly.",
      date: new Date().toLocaleDateString()
    }
  ],

  events: [],

  teams: {
    alpha: [],
    bravo: []
  }
};

// =========================================
// HILFSFUNKTIONEN
// =========================================

function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return document.querySelectorAll(selector);
}

function showMessage(message) {
  alert(message);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

// =========================================
// LOGIN
// =========================================

function login(username, password) {

  if (
    username.trim() === MEMBER_USERNAME &&
    password === MEMBER_PASSWORD
  ) {
    state.loggedIn = true;

    showDashboard();
    showMessage("Login successful. Welcome to the Alliance Hub!");

    return true;
  }

  showMessage("Incorrect username or password.");
  return false;
}

function logout() {
  state.loggedIn = false;
  state.managementUnlocked = false;
  state.currentPage = "overview";

  showLandingPage();
}

// =========================================
// MANAGEMENT-ZUGANG
// =========================================

function unlockManagement(password) {
  if (!state.loggedIn) {
    showMessage("Please log in first.");
    return false;
  }

  if (password === MANAGEMENT_PASSWORD) {
    state.managementUnlocked = true;

    showMessage("Management access granted.");
    renderCurrentPage();

    return true;
  }

  showMessage("Incorrect management password.");
  return false;
}

function lockManagement() {
  state.managementUnlocked = false;
  navigateTo("overview");
}

// =========================================
// SEITENNAVIGATION
// =========================================

function navigateTo(page) {
  if (!state.loggedIn) {
    showMessage("Please log in first.");
    return;
  }

  if (page === "management" && !state.managementUnlocked) {
    const password = prompt("Enter the management password:");

    if (password === null) return;

    if (!unlockManagement(password)) return;
  }

  const allowedPages = [
    "overview",
    "announcements",
    "events",
    "teams",
    "management"
  ];

  if (!allowedPages.includes(page)) {
    showMessage("Page not found.");
    return;
  }

  state.currentPage = page;
  renderCurrentPage();
}

function renderCurrentPage() {
  const pages = $all("[data-page]");

  pages.forEach(pageElement => {
    pageElement.classList.toggle(
      "hidden",
      pageElement.dataset.page !== state.currentPage
    );
  });

  $all("[data-nav]").forEach(link => {
    link.classList.toggle(
      "active",
      link.dataset.nav === state.currentPage
    );
  });

  if (state.currentPage === "announcements") {
    renderAnnouncements();
  }

  if (state.currentPage === "events") {
    renderEvents();
  }

  if (state.currentPage === "teams") {
    renderTeams();
  }

  if (state.currentPage === "management") {
    renderManagement();
  }
}

// =========================================
// LANDING PAGE UND DASHBOARD
// =========================================

function showLandingPage() {
  const landing = $("#landingPage");
  const dashboard = $("#dashboard");

  if (landing) landing.classList.remove("hidden");
  if (dashboard) dashboard.classList.add("hidden");
}

function showDashboard() {
  const landing = $("#landingPage");
  const dashboard = $("#dashboard");

  if (landing) landing.classList.add("hidden");
  if (dashboard) dashboard.classList.remove("hidden");

  state.currentPage = "overview";
  renderCurrentPage();
}

// =========================================
// LOGIN-MODAL
// =========================================

function openLoginModal() {
  const modal = $("#loginModal");

  if (modal) {
    modal.classList.remove("hidden");
  }
}

function closeLoginModal() {
  const modal = $("#loginModal");

  if (modal) {
    modal.classList.add("hidden");
  }
}

// =========================================
// ANKÜNDIGUNGEN
// =========================================

function addAnnouncement(title, text) {
  if (!state.managementUnlocked) {
    showMessage("Management access required.");
    return;
  }

  title = title.trim();
  text = text.trim();

  if (!title || !text) {
    showMessage("Please fill in both title and message.");
    return;
  }

  state.announcements.unshift({
    title,
    text,
    date: new Date().toLocaleDateString()
  });

  renderAnnouncements();
  showMessage("Announcement added.");
}

function renderAnnouncements() {
  const container = $("#announcementsList");

  if (!container) return;

  if (state.announcements.length === 0) {
    container.innerHTML = "<p>No announcements yet.</p>";
    return;
  }

  container.innerHTML = state.announcements.map(item => `
    <article class="card list-item">
      <div class="list-meta">${escapeHTML(item.date)}</div>
      <h3>${escapeHTML(item.title)}</h3>
      <p>${escapeHTML(item.text)}</p>
    </article>
  `).join("");
}

// =========================================
// EVENTS
// =========================================

function addEvent(title, date, description) {
  if (!state.managementUnlocked) {
    showMessage("Management access required.");
    return;
  }

  title = title.trim();
  description = description.trim();

  if (!title || !date) {
    showMessage("Please enter an event name and date.");
    return;
  }

  state.events.push({
    id: Date.now(),
    title,
    date,
    description
  });

  state.events.sort((a, b) => a.date.localeCompare(b.date));

  renderEvents();
  showMessage("Event created.");
}

function renderEvents() {
  const container = $("#eventsList");

  if (!container) return;

  if (state.events.length === 0) {
    container.innerHTML = "<p>No upcoming events.</p>";
    return;
  }

  container.innerHTML = state.events.map(event => `
    <article class="card list-item">
      <div class="list-meta">${escapeHTML(event.date)}</div>
      <h3>${escapeHTML(event.title)}</h3>
      <p>${escapeHTML(event.description || "")}</p>
    </article>
  `).join("");
}

// =========================================
// ALPHA / BRAVO TEAM PLANNER
// =========================================

function addTeamMember(team, playerName, role = "Member") {
  if (!state.managementUnlocked) {
    showMessage("Management access required.");
    return;
  }

  if (!["alpha", "bravo"].includes(team)) {
    showMessage("Unknown team.");
    return;
  }

  playerName = playerName.trim();

  if (!playerName) {
    showMessage("Please enter a player name.");
    return;
  }

  const alreadyExists = [
    ...state.teams.alpha,
    ...state.teams.bravo
  ].some(player =>
    player.name.toLowerCase() === playerName.toLowerCase()
  );

  if (alreadyExists) {
    showMessage("This player is already assigned to a team.");
    return;
  }

  state.teams[team].push({
    id: Date.now(),
    name: playerName,
    role: role.trim() || "Member"
  });

  renderTeams();
}

function removeTeamMember(team, playerId) {
  if (!state.managementUnlocked) {
    showMessage("Management access required.");
    return;
  }

  if (!["alpha", "bravo"].includes(team)) return;

  state.teams[team] = state.teams[team].filter(
    player => player.id !== Number(playerId)
  );

  renderTeams();
}

function renderTeams() {
  ["alpha", "bravo"].forEach(team => {
    const container = $(`#${team}TeamList`);

    if (!container) return;

    if (state.teams[team].length === 0) {
      container.innerHTML = "<p>No players assigned.</p>";
      return;
    }

    container.innerHTML = state.teams[team].map(player => `
      <div class="team-member">
        <div>
          <strong>${escapeHTML(player.name)}</strong>
          <div class="list-meta">${escapeHTML(player.role)}</div>
        </div>
        ${
          state.managementUnlocked
            ? `<button class="btn btn-danger btn-small"
                 data-remove-team="${team}"
                 data-player-id="${player.id}">
                 Remove
               </button>`
            : ""
        }
      </div>
    `).join("");
  });
}

// =========================================
// MANAGEMENT-PANEL
// =========================================

function renderManagement() {
  const container = $("#managementContent");

  if (!container) return;

  if (!state.managementUnlocked) {
    container.innerHTML = "<p>Management access required.</p>";
    return;
  }

  container.innerHTML = `
    <div class="management-panel">
      <h3>Management Controls</h3>
      <p>You have unlocked the demo management panel.</p>
      <p class="muted">
        Changes exist only in this browser session.
      </p>
      <button class="btn btn-secondary" id="lockManagementButton">
        Lock Management
      </button>
    </div>
  `;
}

// =========================================
// FORMULAR-EVENTS
// =========================================


document.addEventListener("submit", async event => {
  const form = event.target;

  if (!(form instanceof HTMLFormElement)) return;

  if (form.id === "loginForm") {
    event.preventDefault();

    const username =
      form.querySelector('[name="username"]')?.value || "";

    const password =
      form.querySelector('[name="password"]')?.value || "";

    if (login(username, password)) {
      closeLoginModal();
      form.reset();
    }
  }

  if (form.id === "announcementForm") {
    event.preventDefault();

    const title =
      form.querySelector('[name="title"]')?.value || "";

    const text =
      form.querySelector('[name="text"]')?.value || "";

    await addAnnouncement(title, text);
    form.reset();
  }

  if (form.id === "eventForm") {
    event.preventDefault();

    const title =
      form.querySelector('[name="title"]')?.value || "";

    const date =
      form.querySelector('[name="date"]')?.value || "";

    const description =
      form.querySelector('[name="description"]')?.value || "";

    addEvent(title, date, description);
    form.reset();
  }

  if (form.id === "teamForm") {
    event.preventDefault();

    const team =
      form.querySelector('[name="team"]')?.value || "";

    const player =
      form.querySelector('[name="player"]')?.value || "";

    const role =
      form.querySelector('[name="role"]')?.value || "Member";

    addTeamMember(team, player, role);
    form.reset();
  }
});


// =========================================
// BUTTONS UND NAVIGATION
// =========================================

document.addEventListener("click", event => {
  const target = event.target;

  if (!(target instanceof Element)) return;

  const loginButton = target.closest("[data-open-login]");
  if (loginButton) {
    openLoginModal();
    return;
  }

  const closeButton = target.closest("[data-close-login]");
  if (closeButton) {
    closeLoginModal();
    return;
  }

  const logoutButton = target.closest("[data-logout]");
  if (logoutButton) {
    logout();
    return;
  }

  const navButton = target.closest("[data-nav]");
  if (navButton) {
    event.preventDefault();
    navigateTo(navButton.dataset.nav);
    return;
  }

  const removeButton = target.closest("[data-remove-team]");
  if (removeButton) {
    removeTeamMember(
      removeButton.dataset.removeTeam,
      removeButton.dataset.playerId
    );
    return;
  }

  if (target.closest("#lockManagementButton")) {
    lockManagement();
  }
});

// =========================================
// INITIALISIERUNG
// =========================================

document.addEventListener("DOMContentLoaded", () => {
  showLandingPage();

  renderAnnouncements();
  renderEvents();
  renderTeams();

  console.log("Server 4536 Alliance Hub initialized.");
});


async function addAnnouncement(title, text) {
  if (!state.managementUnlocked) {
    alert("Management-Zugang erforderlich.");
    return;
  }

  title = title.trim();
  text = text.trim();

  if (!title || !text) {
    alert("Bitte Titel und Nachricht eingeben.");
    return;
  }

  // Ankündigung dauerhaft in Supabase speichern
  const { data, error } = await supabaseClient
    .from("announcements")
    .insert([
      {
        title: title,
        content: text
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Fehler beim Speichern:", error);
    alert("Ankündigung konnte nicht gespeichert werden: " + error.message);
    return;
  }

  // Liste nach erfolgreichem Speichern aktualisieren
  await loadAnnouncements();

  alert("Ankündigung wurde erfolgreich gespeichert!");
}

async function loadAnnouncements() {
  const { data, error } = await supabaseClient
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fehler beim Laden:", error);
    alert("Ankündigungen konnten nicht geladen werden: " + error.message);
    return;
  }

  state.announcements = data.map(item => ({
    id: item.id,
    title: item.title,
    text: item.content,
    date: new Date(item.created_at).toLocaleDateString()
  }));

  renderAnnouncements();
}
