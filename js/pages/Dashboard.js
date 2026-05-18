import { store } from '../store.js';

export function renderDashboard(container) {
    const user = store.getUser();
    const balance = store.getBalance();
    const playersCount = store.getPlayers().length;

    container.innerHTML = `
        <div class="space-y-6">
            <div class="glass-panel rounded-2xl p-6 mt-4 shadow-lg border border-slate-700 relative overflow-hidden">
                <!-- Decorative background elements -->
                <div class="absolute -right-10 -top-10 w-32 h-32 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                <div class="absolute -left-10 -bottom-10 w-32 h-32 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                
                <h2 class="text-2xl font-bold mb-2 relative z-10">Olá, ${user.name}!</h2>
                <p class="text-slate-400 text-sm relative z-10 mb-6">Aqui está o resumo do seu grupo de futebol.</p>
                
                <div class="grid grid-cols-2 gap-4 relative z-10">
                    <div class="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50 flex flex-col items-center justify-center">
                        <i class="fa-solid fa-wallet text-2xl text-emerald-400 mb-2"></i>
                        <span class="text-xs text-slate-400">Saldo em Caixa</span>
                        <span class="text-lg font-bold text-white">R$ ${balance.toFixed(2)}</span>
                    </div>
                    <div class="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50 flex flex-col items-center justify-center">
                        <i class="fa-solid fa-users text-2xl text-blue-400 mb-2"></i>
                        <span class="text-xs text-slate-400">Jogadores</span>
                        <span class="text-lg font-bold text-white">${playersCount}</span>
                    </div>
                </div>
            </div>

            <div class="glass-panel rounded-2xl p-6 shadow-lg border border-slate-700">
                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
                    <i class="fa-solid fa-location-dot text-red-400"></i> Local do Jogo
                </h3>
                ${store.isAdmin() ? `
                    <div class="flex gap-2">
                        <input type="text" id="address-input" class="input-field text-sm" value="${store.getSettings().fieldAddress}">
                        <button id="save-address-btn" class="bg-slate-700 hover:bg-slate-600 text-white px-3 rounded-lg"><i class="fa-solid fa-save"></i></button>
                    </div>
                ` : `
                    <div class="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 text-sm text-slate-300">
                        ${store.getSettings().fieldAddress}
                    </div>
                `}
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <button class="glass-panel rounded-xl p-4 flex flex-col items-center justify-center gap-3 hover:bg-slate-800 transition-colors border border-slate-700" onclick="document.querySelector('[data-view=players]').click()">
                    <div class="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl">
                        <i class="fa-solid fa-user-plus"></i>
                    </div>
                    <span class="text-sm font-medium">Escalar Jogador</span>
                </button>
                <button class="glass-panel rounded-xl p-4 flex flex-col items-center justify-center gap-3 hover:bg-slate-800 transition-colors border border-slate-700" onclick="document.querySelector('[data-view=finances]').click()">
                    <div class="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
                        <i class="fa-solid fa-money-bill-transfer"></i>
                    </div>
                    <span class="text-sm font-medium">Lançar Caixa</span>
                </button>
            </div>
        </div>
    `;

    if (store.isAdmin()) {
        const btn = container.querySelector('#save-address-btn');
        const input = container.querySelector('#address-input');
        if (btn && input) {
            btn.addEventListener('click', () => {
                store.updateAddress(input.value);
                alert('Endereço atualizado com sucesso!');
            });
        }
    }
}
