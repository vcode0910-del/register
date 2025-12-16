// --- KONFIGURASI ---
const MIN_PLAYERS = 5;
const MAX_PLAYERS = 10;
const ADMIN_USER = "Admin";
const ADMIN_PASS = "CreatorOsis";

const ALLOWED_TEAMS = [
    "X A", "X B", "X C", "X D",
    "XI IPA", "XI IPA 2", "XI IPS",
    "XII IPA", "XII IPS", "XII IPS 2"
];

// --- DOM ELEMENTS ---
const loadingScreen = document.getElementById('loading-screen');
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const playersContainer = document.getElementById('players-container');
const addPlayerBtn = document.getElementById('add-player-btn');
const form = document.getElementById('lombaForm');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginModal = document.getElementById('login-modal');
const closeModal = document.querySelector('.close-modal');
const loginForm = document.getElementById('loginForm');
const registrationSection = document.getElementById('registration-section');
const scheduleResult = document.getElementById('schedule-result');
const dynamicScheduleContent = document.getElementById('dynamic-schedule-content');
const adminPanel = document.getElementById('admin-panel');

// --- INIT ---
window.onload = function() {
    // 1. Loading Animation
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.remove(), 500);
    }, 2000); // 2 detik loading

    // 2. Generate Input Pemain (Grid Layout)
    for(let i=1; i<=5; i++) addPlayerInput(i, true);

    // 3. Cek Login
    checkLoginSession();
    
    // 4. Load Admin Data
    if(sessionStorage.getItem('isAdmin') === 'true') {
        loadAdminTable();
    }
};

// --- THEME TOGGLE (Cyber Mode vs Light Mode) ---
themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
});

// --- PLAYER INPUT SYSTEM ---
function addPlayerInput(index, isRequired) {
    const div = document.createElement('div');
    div.className = 'player-input input-wrapper';
    // Style input langsung di sini untuk pemain
    div.innerHTML = `
        <input type="text" name="player[]" class="input-cyber"
            placeholder="Pemain ${index} ${isRequired ? '(Inti)' : ''}" 
            ${isRequired ? 'required' : ''}>
    `;
    playersContainer.appendChild(div);
}

addPlayerBtn.addEventListener('click', () => {
    const count = playersContainer.children.length;
    if(count < MAX_PLAYERS) {
        addPlayerInput(count + 1, false);
    } else {
        showToast("Maksimal 10 pemain!");
    }
});

// --- REGISTRATION LOGIC ---
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const tim = document.getElementById('namaTim').value;
    const kapten = document.getElementById('kapten').value;
    const wa = document.getElementById('whatsapp').value;

    if(!ALLOWED_TEAMS.includes(tim)) {
        showToast("Kelas tidak valid!");
        return;
    }

    const existingTeams = getTeams();
    if(existingTeams.some(t => t.tim === tim)) {
        showToast(`Kelas ${tim} SUDAH TERDAFTAR!`);
        return;
    }

    const playerInputs = document.getElementsByName('player[]');
    let players = [];
    playerInputs.forEach(input => {
        if(input.value.trim() !== "") players.push(input.value);
    });

    if(players.length < MIN_PLAYERS) {
        showToast(`Minimal ${MIN_PLAYERS} pemain!`);
        return;
    }

    const newTeam = {
        id: Date.now(),
        tim, kapten, wa, players
    };

    saveTeam(newTeam);
    
    registrationSection.classList.add('hidden');
    scheduleResult.classList.remove('hidden');
    renderUserSchedule(tim);
    showToast("Pendaftaran Berhasil!");
    form.reset();
});

document.getElementById('back-home-btn').addEventListener('click', () => {
    scheduleResult.classList.add('hidden');
    registrationSection.classList.remove('hidden');
});

// --- JADWAL LOGIC ---
function renderUserSchedule(teamName) {
    const adminImg = localStorage.getItem('mlbb_admin_img');
    if(adminImg) {
        dynamicScheduleContent.innerHTML = `
            <p>Official Bracket:</p>
            <img src="${adminImg}" style="width:100%; border-radius:10px; border:1px solid var(--cyan); margin-top:10px;">
        `;
    } else {
        dynamicScheduleContent.innerHTML = `
            <div style="padding: 20px; border: 1px dashed var(--primary); border-radius: 10px; margin-top:15px; background: rgba(0,0,0,0.2);">
                <h2 style="color: var(--cyan);">${teamName} <span style="color:white; font-size:1rem;">VS</span> ???</h2>
                <p style="color:#aaa;">Menunggu Drawing dari Panitia.</p>
            </div>
        `;
    }
}

// --- DATA HANDLING ---
function getTeams() {
    return JSON.parse(localStorage.getItem('mlbb_teams') || '[]');
}

function saveTeam(team) {
    const teams = getTeams();
    teams.push(team);
    localStorage.setItem('mlbb_teams', JSON.stringify(teams));
    if(sessionStorage.getItem('isAdmin') === 'true') {
        loadAdminTable();
    }
}

// --- LOGIN SYSTEM ---
loginBtn.onclick = () => loginModal.style.display = "block";
closeModal.onclick = () => loginModal.style.display = "none";
window.onclick = (e) => { if(e.target == loginModal) loginModal.style.display = "none"; }

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if(document.getElementById('username').value === ADMIN_USER && 
       document.getElementById('password').value === ADMIN_PASS) {
        sessionStorage.setItem('isAdmin', 'true');
        checkLoginSession();
        loginModal.style.display = "none";
        loadAdminTable();
        showToast("Access Granted");
    } else {
        showToast("Access Denied!");
    }
});

logoutBtn.onclick = () => {
    sessionStorage.removeItem('isAdmin');
    checkLoginSession();
    showToast("Logged Out");
};

function checkLoginSession() {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    if(isAdmin) {
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        adminPanel.classList.remove('hidden');
    } else {
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        adminPanel.classList.add('hidden');
    }
}

// --- ADMIN TABLE ---
function loadAdminTable() {
    const teams = getTeams();
    const tbody = document.querySelector('#adminTable tbody');
    const badge = document.getElementById('total-teams-badge');
    
    tbody.innerHTML = '';
    badge.textContent = teams.length;

    if(teams.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">NO DATA FOUND</td></tr>`;
        return;
    }

    teams.forEach((t, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td style="color:var(--cyan); font-weight:bold;">${t.tim}</td>
                <td>${t.kapten}</td>
                <td><a href="https://wa.me/${t.wa}" target="_blank" style="color:#25D366;"><i class="fab fa-whatsapp"></i> Chat</a></td>
                <td>${t.players.length}</td>
                <td>
                    <button onclick="deleteTeam(${t.id})" style="background:none; border:none; color:var(--pink); cursor:pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

window.deleteTeam = function(id) {
    if(confirm("Hapus tim ini dari database?")) {
        let teams = getTeams();
        teams = teams.filter(t => t.id !== id);
        localStorage.setItem('mlbb_teams', JSON.stringify(teams));
        loadAdminTable();
        showToast("Data Dihapus");
    }
};

window.uploadSchedule = function() {
    const file = document.getElementById('schedule-upload').files[0];
    if(file) {
        const reader = new FileReader();
        reader.onloadend = function() {
            try {
                localStorage.setItem('mlbb_admin_img', reader.result);
                showToast("Bracket Updated!");
            } catch(e) {
                showToast("File terlalu besar!");
            }
        }
        reader.readAsDataURL(file);
    } else {
        showToast("Pilih gambar dulu!");
    }
};

window.clearSchedule = function() {
    localStorage.removeItem('mlbb_admin_img');
    showToast("Bracket Reset.");
};

function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.innerHTML = `<i class="fas fa-terminal"></i> ${msg}`;
    toast.className = "show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}
