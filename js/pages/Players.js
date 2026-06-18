import { store } from '../store.js';
import { calculatePlayerScore } from '../utils/utils.js';

export function renderPlayers(container) {
    const isAdmin = store.isAdmin();
    const players = store.getPlayers();
    
    // Pos options
    const positions = ['Goleiro', 'Zagueiro', 'Lateral', 'Meia', 'Atacante'];
    const rateOptions = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

    const buildSkillSelects = (prefix, player = null) => `
        <div class="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 space-y-3">
            <h4 class="text-xs font-semibold text-slate-300 border-b border-slate-700 pb-1">Nível Técnico</h4>
            <div class="grid grid-cols-4 gap-2">
                <div>
                    <label class="block text-slate-400 mb-1 text-[10px]">Passe</label>
                    <select id="${prefix}-pass" class="input-field py-1 px-2 text-xs">
                        ${rateOptions.map(r => `<option value="${r}" ${player && Number(player.pass) === r ? 'selected' : ''}>${r}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-slate-400 mb-1 text-[10px]">Drible</label>
                    <select id="${prefix}-dribble" class="input-field py-1 px-2 text-xs">
                        ${rateOptions.map(r => `<option value="${r}" ${player && Number(player.dribble ?? 3) === r ? 'selected' : ''}>${r}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-slate-400 mb-1 text-[10px]">Visão</label>
                    <select id="${prefix}-vision" class="input-field py-1 px-2 text-xs">
                        ${rateOptions.map(r => `<option value="${r}" ${player && Number(player.vision) === r ? 'selected' : ''}>${r}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-slate-400 mb-1 text-[10px]">Finalização</label>
                    <select id="${prefix}-finish" class="input-field py-1 px-2 text-xs">
                        ${rateOptions.map(r => `<option value="${r}" ${player && Number(player.finish) === r ? 'selected' : ''}>${r}</option>`).join('')}
                    </select>
                </div>
            </div>
        </div>
        <div class="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 space-y-3">
            <h4 class="text-xs font-semibold text-slate-300 border-b border-slate-700 pb-1">Condicionamento</h4>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block text-slate-400 mb-1 text-[10px]">Energia/Velocidade</label>
                    <select id="${prefix}-energy" class="input-field py-1 px-2 text-xs">
                        ${rateOptions.map(r => `<option value="${r}" ${player && Number(player.energy) === r ? 'selected' : ''}>${r}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-slate-400 mb-1 text-[10px]">Resistência</label>
                    <select id="${prefix}-stamina" class="input-field py-1 px-2 text-xs">
                        ${rateOptions.map(r => `<option value="${r}" ${player && Number(player.stamina) === r ? 'selected' : ''}>${r}</option>`).join('')}
                    </select>
                </div>
            </div>
        </div>
    `;

    let html = `<div class="space-y-6">`;

    if (isAdmin) {
        html += `
            <div class="glass-panel rounded-2xl p-5 shadow-lg border border-slate-700">
                <div class="flex justify-between items-center mb-4 cursor-pointer" id="toggle-add-player">
                    <h3 class="font-bold flex items-center gap-2"><i class="fa-solid fa-user-plus text-primary"></i> Cadastrar Jogador</h3>
                    <i class="fa-solid fa-chevron-down text-slate-400 transition-transform duration-200" id="add-icon"></i>
                </div>
                
                <form id="player-form" class="space-y-4 text-sm hidden">
                    <input type="hidden" id="p-edit-id" value="">
                    <div>
                        <label class="block text-slate-400 mb-1 text-xs">Nome do Jogador</label>
                        <input type="text" id="p-name" required class="input-field py-2" placeholder="Nome">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-slate-400 mb-1 text-xs">Posição 1</label>
                            <select id="p-pos1" class="input-field py-2">
                                ${positions.map(p => `<option value="${p}">${p}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-slate-400 mb-1 text-xs">Posição 2</label>
                            <select id="p-pos2" class="input-field py-2">
                                <option value="">Nenhuma</option>
                                ${positions.map(p => `<option value="${p}">${p}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    ${buildSkillSelects('p')}

                    <div class="flex gap-2">
                        <button type="submit" id="p-submit-btn" class="btn-primary flex-1 mt-2"><i class="fa-solid fa-check"></i> Salvar Jogador</button>
                        <button type="button" id="p-cancel-btn" class="btn-secondary flex-1 mt-2 hidden"><i class="fa-solid fa-xmark"></i> Cancelar</button>
                    </div>
                </form>
            </div>
        `;
    }

    html += `
        <div class="glass-panel rounded-2xl p-5 shadow-lg border border-slate-700">
            <h3 class="font-bold mb-4 flex items-center justify-between">
                <span class="flex items-center gap-2"><i class="fa-solid fa-users text-blue-400"></i> Elenco</span>
                <span class="bg-slate-800 text-xs px-2 py-1 rounded-md border border-slate-700">${players.length} Jogadores</span>
            </h3>
            
            ${players.length === 0 ? '<p class="text-sm text-slate-500 text-center py-4">Nenhum jogador cadastrado.</p>' : ''}
            
            <div class="space-y-3">
                ${players.map(p => `
                    <div class="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 transition-all duration-200 hover:border-slate-600">
                        <!-- Player card (collapsed view) -->
                        <div class="flex justify-between items-center">
                            <div class="flex flex-col">
                                <span class="font-bold text-sm text-white">${p.name}</span>
                                <div class="flex gap-2 mt-1">
                                    <span class="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">${p.pos1}</span>
                                    ${p.pos2 ? `<span class="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">${p.pos2}</span>` : ''}
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="flex flex-col items-center justify-center bg-dark w-10 h-10 rounded-full border border-primary/30">
                                    <span class="text-xs font-bold text-primary">${Number(p.totalScore).toFixed(1)}</span>
                                </div>
                                ${isAdmin ? `
                                <button class="text-slate-400 hover:text-blue-400 edit-p-btn p-1.5 rounded-lg hover:bg-blue-400/10 transition-all" data-id="${p.id}" title="Editar">
                                    <i class="fa-solid fa-pen text-sm"></i>
                                </button>
                                <button class="text-slate-400 hover:text-red-400 delete-p-btn p-1.5 rounded-lg hover:bg-red-400/10 transition-all" data-id="${p.id}" title="Excluir">
                                    <i class="fa-solid fa-trash text-sm"></i>
                                </button>
                                ` : ''}
                            </div>
                        </div>
                        <!-- Inline edit form (hidden by default) -->
                        ${isAdmin ? `
                        <div id="edit-form-${p.id}" class="hidden mt-3 pt-3 border-t border-slate-700 space-y-3 text-sm">
                            <div>
                                <label class="block text-slate-400 mb-1 text-xs">Nome</label>
                                <input type="text" id="edit-name-${p.id}" value="${p.name}" class="input-field py-2">
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-slate-400 mb-1 text-xs">Posição 1</label>
                                    <select id="edit-pos1-${p.id}" class="input-field py-2">
                                        ${positions.map(pos => `<option value="${pos}" ${p.pos1 === pos ? 'selected' : ''}>${pos}</option>`).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-slate-400 mb-1 text-xs">Posição 2</label>
                                    <select id="edit-pos2-${p.id}" class="input-field py-2">
                                        <option value="" ${!p.pos2 ? 'selected' : ''}>Nenhuma</option>
                                        ${positions.map(pos => `<option value="${pos}" ${p.pos2 === pos ? 'selected' : ''}>${pos}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                            ${buildSkillSelects(`edit-${p.id}`, p)}
                            <div class="flex gap-2">
                                <button class="btn-primary flex-1 save-edit-btn" data-id="${p.id}"><i class="fa-solid fa-check"></i> Salvar</button>
                                <button class="btn-secondary flex-1 cancel-edit-btn" data-id="${p.id}"><i class="fa-solid fa-xmark"></i> Cancelar</button>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    </div>`;

    container.innerHTML = html;

    if (isAdmin) {
        // --- Add Player Form Toggle ---
        const toggleBtn = container.querySelector('#toggle-add-player');
        const form = container.querySelector('#player-form');
        const icon = container.querySelector('#add-icon');
        const cancelBtn = container.querySelector('#p-cancel-btn');
        
        toggleBtn.addEventListener('click', () => {
            form.classList.toggle('hidden');
            icon.classList.toggle('rotate-180');
        });

        // --- Add Player Submit ---
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const pass = document.getElementById('p-pass').value;
            const vision = document.getElementById('p-vision').value;
            const finish = document.getElementById('p-finish').value;
            const dribble = document.getElementById('p-dribble').value;
            const energy = document.getElementById('p-energy').value;
            const stamina = document.getElementById('p-stamina').value;
            const totalScore = calculatePlayerScore(pass, vision, finish, dribble, energy, stamina);

            const player = {
                name: document.getElementById('p-name').value.trim(),
                pos1: document.getElementById('p-pos1').value,
                pos2: document.getElementById('p-pos2').value,
                pass, vision, finish, dribble, energy, stamina, totalScore
            };

            store.addPlayer(player);
            renderPlayers(container);
        });

        // --- Cancel Add ---
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                renderPlayers(container);
            });
        }

        // --- Edit Player Buttons ---
        container.querySelectorAll('.edit-p-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const editForm = container.querySelector(`#edit-form-${id}`);
                if (!editForm) return;

                // Toggle this form, close others
                const allForms = container.querySelectorAll('[id^="edit-form-"]');
                allForms.forEach(f => {
                    if (f.id !== `edit-form-${id}`) f.classList.add('hidden');
                });
                editForm.classList.toggle('hidden');
            });
        });

        // --- Save Edit ---
        container.querySelectorAll('.save-edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const pass = document.getElementById(`edit-${id}-pass`).value;
                const vision = document.getElementById(`edit-${id}-vision`).value;
                const finish = document.getElementById(`edit-${id}-finish`).value;
                const dribble = document.getElementById(`edit-${id}-dribble`).value;
                const energy = document.getElementById(`edit-${id}-energy`).value;
                const stamina = document.getElementById(`edit-${id}-stamina`).value;
                const totalScore = calculatePlayerScore(pass, vision, finish, dribble, energy, stamina);

                const updated = {
                    name: document.getElementById(`edit-name-${id}`).value.trim(),
                    pos1: document.getElementById(`edit-pos1-${id}`).value,
                    pos2: document.getElementById(`edit-pos2-${id}`).value,
                    pass, vision, finish, dribble, energy, stamina, totalScore
                };

                store.updatePlayer(id, updated);
                renderPlayers(container);
            });
        });

        // --- Cancel Edit ---
        container.querySelectorAll('.cancel-edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const editForm = container.querySelector(`#edit-form-${id}`);
                if (editForm) editForm.classList.add('hidden');
            });
        });

        // --- Delete Player ---
        container.querySelectorAll('.delete-p-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Excluir jogador? Essa ação não pode ser desfeita.')) {
                    store.deletePlayer(btn.dataset.id);
                    renderPlayers(container);
                }
            });
        });
    }
}
