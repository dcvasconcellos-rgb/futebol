import { store } from './store.js';

// Global state for current view
let currentView = 'dashboard';

// Import Views (we will mock imports by injecting them dynamically or defining them here for simplicity in vanilla JS without bundler)
import { renderDashboard } from './pages/Dashboard.js';
import { renderFinances } from './pages/Finances.js';
import { renderPlayers } from './pages/Players.js';
import { renderTeamDraw } from './pages/TeamDraw.js';
import { renderProfile } from './pages/Profile.js';
import { renderNavbar } from './components/Navbar.js';
import { renderAuthSwitcher } from './components/Auth.js';

function renderApp() {
    const appEl = document.getElementById('app');
    
    // Main Layout
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
    
    // Quick fade animation restart
    mainEl.classList.remove('fade-in');
    void mainEl.offsetWidth; // trigger reflow
    mainEl.classList.add('fade-in');

    switch (view) {
        case 'dashboard': renderDashboard(mainEl); break;
        case 'finances': renderFinances(mainEl); break;
        case 'players': renderPlayers(mainEl); break;
        case 'draw': renderTeamDraw(mainEl); break;
        case 'profile': renderProfile(mainEl); break;
        default: renderDashboard(mainEl);
    }
    
    // Update navbar active state
    renderNavbar(document.getElementById('navbar-container'), currentView, navigate);
}

// Re-render when store updates if needed (for global data like auth)
window.addEventListener('store-updated', () => {
    // Only re-render specific parts or current view to avoid full refresh, 
    // but for simplicity we can just re-render current view
    const mainEl = document.getElementById('main-content');
    if(mainEl) navigate(currentView);
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderApp();
});
