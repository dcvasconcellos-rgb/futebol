import { store } from '../store.js';

export function renderProfile(container) {
    const user = store.getUser();

    container.innerHTML = `
        <div class="glass-panel rounded-2xl p-6 shadow-lg border border-slate-700 max-w-sm mx-auto mt-4">
            <div class="flex flex-col items-center justify-center mb-6 relative">
                <div class="w-24 h-24 rounded-full bg-slate-800 border-4 border-primary flex items-center justify-center text-4xl text-primary mb-3 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <i class="fa-solid fa-user"></i>
                </div>
                <h2 class="text-xl font-bold text-white">${user.name}</h2>
                <span class="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-full mt-2 border border-slate-700">${user.role.toUpperCase()}</span>
            </div>

            <form id="profile-form" class="space-y-4">
                <div>
                    <label class="block text-slate-400 mb-1 text-xs">Telefone de Contato</label>
                    <div class="flex gap-2">
                        <input type="text" id="phone-input" class="input-field" value="${user.phone}">
                        <button type="submit" class="bg-primary hover:bg-emerald-400 text-white px-4 rounded-lg transition-colors"><i class="fa-solid fa-save"></i></button>
                    </div>
                </div>
            </form>
            
            <div class="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
                <p class="text-xs text-slate-500 mb-2">Para alterar as permissões de teste, use o botão no topo da tela.</p>
            </div>
        </div>
    `;

    container.querySelector('#profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = document.getElementById('phone-input').value;
        store.updateProfile(phone);
        alert('Perfil atualizado com sucesso!');
    });
}
