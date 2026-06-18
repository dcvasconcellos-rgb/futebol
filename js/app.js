import { store } from './store.js';
import { renderDashboard } from './pages/Dashboard.js';
import { renderFinances }  from './pages/Finances.js';
import { renderPlayers }   from './pages/Players.js';
import { renderTeamDraw }  from './pages/TeamDraw.js';
import { renderProfile }   from './pages/Profile.js';
import { renderNavbar }    from './components/Navbar.js';
import { renderAuthSwitcher } from './components/Auth.js';

let currentView = 'dashboard';

// ── Loading screen ──────────────────────────────────────────
function showLoading(appEl) {
    appEl.innerHTML = `
        <div class="flex flex-col items-center justify-center h-screen gap-4 bg-dark">
            <div class="relative">
                <div class="w-16 h-16 border-4 border-slate-700 rounded-full"></div>
                <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0"></div>
                <div class="absolute inset-0 flex items-center justify-center text-primary text-xl">
                    <i class="fa-solid fa-futbol"></i>
                </div>
            </div>
            <div class="text-center">
                <p class="text-white font-bold text-lg">FutManager</p>
                <p class="text-slate-400 text-sm mt-1">Carregando dados do servidor...</p>
            </div>
        </div>
    `;
}

// ── App shell ───────────────────────────────────────────────
function renderApp() {
    const appEl = document.getElementById('app');

    appEl.innerHTML = `
        <header class="bg-card shadow-md z-10 sticky top-0 px-4 py-3 flex justify-between items-center glass-panel">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    <i class="fa-solid fa-futbol"></i>
                </div>
                <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">FutManager</h1>
            </div>
            <div id="auth-container"></div>
        </header>

        <main id="main-content" class="flex-1 overflow-y-auto p-4 pb-24 fade-in">
            <!-- Dynamic Content goes here -->
        </main>

        <nav id="navbar-container" class="bg-card border-t border-slate-700 fixed bottom-0 w-full glass-panel pb-safe">
            <!-- Navbar goes here -->
        </nav>
    `;

    renderAuthSwitcher(document.getElementById('auth-container'));
    renderNavbar(document.getElementById('navbar-container'), currentView, navigate);
    navigate(currentView);
}

export function navigate(view) {
    currentView = view;
    const mainEl = document.getElementById('main-content');
    if (!mainEl) return;

    // Quick fade animation restart
    mainEl.classList.remove('fade-in');
    void mainEl.offsetWidth;
    mainEl.classList.add('fade-in');

    switch (view) {
        case 'dashboard': renderDashboard(mainEl); break;
        case 'finances':  renderFinances(mainEl);  break;
        case 'players':   renderPlayers(mainEl);   break;
        case 'draw':      renderTeamDraw(mainEl);  break;
        case 'profile':   renderProfile(mainEl);   break;
        default:          renderDashboard(mainEl);
    }

    renderNavbar(document.getElementById('navbar-container'), currentView, navigate);
}

// Realtime & role changes trigger re-render of current view
window.addEventListener('store-updated', () => {
    const mainEl = document.getElementById('main-content');
    if (mainEl) navigate(currentView);
});

// ── Boot ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    const appEl = document.getElementById('app');
    showLoading(appEl);

    await store.init();

    renderApp();
});
