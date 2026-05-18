import { store } from '../store.js';

export function renderFinances(container) {
    const isAdmin = store.isAdmin();
    const transactions = store.getFinances();
    const balance = store.getBalance();
    const categories = store.getSettings().expenseCategories;

    const formatCurrency = (val) => `R$ ${Math.abs(val).toFixed(2)}`;
    
    // Sort transactions by date descending
    const sortedTx = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    let html = `
        <div class="space-y-6">
            <div class="glass-panel rounded-2xl p-6 shadow-lg border ${balance >= 0 ? 'border-emerald-500/30' : 'border-red-500/30'} flex flex-col items-center justify-center relative overflow-hidden">
                <div class="absolute inset-0 opacity-10 ${balance >= 0 ? 'bg-emerald-500' : 'bg-red-500'}"></div>
                <h2 class="text-sm font-medium text-slate-400 relative z-10 mb-1">Saldo Atual</h2>
                <div class="text-4xl font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'} relative z-10">
                    ${balance < 0 ? '-' : ''}${formatCurrency(balance)}
                </div>
            </div>
    `;

    if (isAdmin) {
        html += `
            <div class="glass-panel rounded-2xl p-5 shadow-lg border border-slate-700">
                <h3 class="font-bold mb-4 flex items-center gap-2"><i class="fa-solid fa-plus text-primary"></i> Novo Lançamento</h3>
                <form id="tx-form" class="space-y-3 text-sm">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-slate-400 mb-1 text-xs">Tipo</label>
                            <select id="tx-type" class="input-field py-2">
                                <option value="in">Entrada (+)</option>
                                <option value="out">Saída (-)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-slate-400 mb-1 text-xs">Valor (R$)</label>
                            <input type="number" id="tx-amount" step="0.01" required class="input-field py-2" placeholder="0.00">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-slate-400 mb-1 text-xs">Categoria</label>
                        <select id="tx-category" class="input-field py-2">
                            <option value="Mensalidade">Mensalidade (Entrada)</option>
                            <option value="Avulso">Avulso (Entrada)</option>
                            ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>

                    <div>
                        <label class="block text-slate-400 mb-1 text-xs">Descrição / Nome</label>
                        <input type="text" id="tx-desc" required class="input-field py-2" placeholder="Ex: João Silva">
                    </div>

                    <button type="submit" class="btn-primary w-full mt-2"><i class="fa-solid fa-check"></i> Registrar</button>
                </form>
            </div>
        `;
    }

    html += `
            <div class="glass-panel rounded-2xl p-5 shadow-lg border border-slate-700">
                <h3 class="font-bold mb-4 flex items-center gap-2"><i class="fa-solid fa-list-ul text-blue-400"></i> Histórico</h3>
                ${sortedTx.length === 0 ? '<p class="text-sm text-slate-500 text-center py-4">Nenhum lançamento encontrado.</p>' : ''}
                <div class="space-y-3">
                    ${sortedTx.map(tx => `
                        <div class="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'in' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}">
                                    <i class="fa-solid ${tx.type === 'in' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                                </div>
                                <div>
                                    <div class="font-medium text-sm text-slate-200">${tx.description}</div>
                                    <div class="text-xs text-slate-400">${tx.category} • ${new Date(tx.date).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="font-bold text-sm ${tx.type === 'in' ? 'text-emerald-400' : 'text-red-400'}">
                                    ${tx.type === 'in' ? '+' : '-'}${formatCurrency(tx.amount)}
                                </div>
                                ${isAdmin ? `<button class="text-slate-500 hover:text-red-400 delete-tx-btn" data-id="${tx.id}"><i class="fa-solid fa-trash"></i></button>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    if (isAdmin) {
        const form = container.querySelector('#tx-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const type = document.getElementById('tx-type').value;
                const amount = parseFloat(document.getElementById('tx-amount').value);
                const category = document.getElementById('tx-category').value;
                const desc = document.getElementById('tx-desc').value;

                store.addTransaction({ type, amount, category, description: desc, date: new Date().toISOString() });
                renderFinances(container); // re-render
            });
        }

        const deleteBtns = container.querySelectorAll('.delete-tx-btn');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(confirm('Tem certeza que deseja excluir?')) {
                    store.deleteTransaction(btn.dataset.id);
                    renderFinances(container);
                }
            });
        });
    }
}
