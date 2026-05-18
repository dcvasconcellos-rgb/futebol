import { store } from '../store.js';

export function renderNavbar(container, currentView, navigateCallback) {
    const isAdmin = store.isAdmin();
    
    container.innerHTML = `
        <div class="flex justify-around items-center h-16">
            <button class="nav-link ${currentView === 'dashboard' ? 'active' : ''}" data-view="dashboard">
                <i class="fa-solid fa-house mb-1 text-lg"></i>
                <span>Início</span>
            </button>
            <button class="nav-link ${currentView === 'finances' ? 'active' : ''}" data-view="finances">
                <i class="fa-solid fa-wallet mb-1 text-lg"></i>
                <span>Caixa</span>
            </button>
            <button class="nav-link ${currentView === 'players' ? 'active' : ''}" data-view="players">
                <i class="fa-solid fa-users mb-1 text-lg"></i>
                <span>Jogadores</span>
            </button>
            <button class="nav-link ${currentView === 'draw' ? 'active' : ''}" data-view="draw">
                <i class="fa-solid fa-shuffle mb-1 text-lg"></i>
                <span>Sorteio</span>
            </button>
            <button class="nav-link ${currentView === 'profile' ? 'active' : ''}" data-view="profile">
                <i class="fa-solid fa-user mb-1 text-lg"></i>
                <span>Perfil</span>
            </button>
        </div>
    `;

    // Add event listeners
    const buttons = container.querySelectorAll('.nav-link');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            navigateCallback(view);
        });
    });
}
