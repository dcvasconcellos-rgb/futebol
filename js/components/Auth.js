import { store } from '../store.js';

export function renderAuthSwitcher(container) {
    const isAdmin = store.isAdmin();
    
    container.innerHTML = `
        <div class="flex items-center gap-2 text-sm bg-slate-800 rounded-full px-3 py-1 border border-slate-600 cursor-pointer" id="auth-toggle">
            <div class="w-2 h-2 rounded-full ${isAdmin ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-slate-400'}"></div>
            <span class="font-medium text-slate-300 select-none">${isAdmin ? 'Admin' : 'Membro'}</span>
        </div>
    `;

    document.getElementById('auth-toggle').addEventListener('click', () => {
        const newRole = store.isAdmin() ? 'user' : 'admin';
        store.setRole(newRole);
        // Page will auto-refresh because of the store-updated event in app.js
    });
}
