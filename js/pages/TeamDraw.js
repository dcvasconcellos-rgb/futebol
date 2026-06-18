import { store } from '../store.js';

// ─── Mapeamento de posição → grupo ───────────────────────────
const POS_GROUP = {
    'Goleiro':  'goleiro',
    'Zagueiro': 'defesa',
    'Lateral':  'defesa',
    'Meia':     'meio',
    'Atacante': 'ataque'
};

// ─── Formações pré-definidas por tamanho ─────────────────────
const FORMATION_PRESETS = {
    4:  [{ label: '1-2-1 (1D/2M/1A)', d:1, m:2, a:1 }, { label: '2-1-1 (2D/1M/1A)', d:2, m:1, a:1 }, { label: '1-1-2 (1D/1M/2A)', d:1, m:1, a:2 }],
    5:  [{ label: '2-2-1 (2D/2M/1A)', d:2, m:2, a:1 }, { label: '2-1-2 (2D/1M/2A)', d:2, m:1, a:2 }, { label: '1-2-2 (1D/2M/2A)', d:1, m:2, a:2 }, { label: '1-3-1 (1D/3M/1A)', d:1, m:3, a:1 }],
    6:  [{ label: '2-2-2 (2D/2M/2A)', d:2, m:2, a:2 }, { label: '3-2-1 (3D/2M/1A)', d:3, m:2, a:1 }, { label: '2-3-1 (2D/3M/1A)', d:2, m:3, a:1 }, { label: '1-3-2 (1D/3M/2A)', d:1, m:3, a:2 }],
    10: [{ label: '4-3-3 (4D/3M/3A)', d:4, m:3, a:3 }, { label: '4-4-2 (4D/4M/2A)', d:4, m:4, a:2 }, { label: '3-5-2 (3D/5M/2A)', d:3, m:5, a:2 }, { label: '3-4-3 (3D/4M/3A)', d:3, m:4, a:3 }, { label: '5-3-2 (5D/3M/2A)', d:5, m:3, a:2 }],
};

function getPresets(size) {
    return FORMATION_PRESETS[size] || [{ label: `Livre (${size})`, d: Math.floor(size/3), m: Math.floor(size/3), a: size - 2*Math.floor(size/3) }];
}

// ─── Estado local de seleção de jogadores ─────────────────────
// Persistido por sessão via Set de IDs marcados
let _selectedPlayerIds = null; // null = não inicializado ainda

export function renderTeamDraw(container) {
    const isAdmin     = store.isAdmin();
    const allPlayers  = store.getPlayers();
    const drawHistory = store.getDrawHistory();

    // Inicializa seleção com todos marcados na primeira vez
    if (_selectedPlayerIds === null) {
        _selectedPlayerIds = new Set(allPlayers.map(p => p.id));
    } else {
        // Garante que novos jogadores adicionados entrem selecionados por padrão
        allPlayers.forEach(p => { if (!_selectedPlayerIds.has(p.id)) _selectedPlayerIds.add(p.id); });
        // Remove IDs de jogadores excluídos
        const allIds = new Set(allPlayers.map(p => p.id));
        _selectedPlayerIds.forEach(id => { if (!allIds.has(id)) _selectedPlayerIds.delete(id); });
    }

    // Agrupa por posição para o painel de seleção
    const goleiros = allPlayers.filter(p => p.pos1 === 'Goleiro');
    const linha    = allPlayers.filter(p => p.pos1 !== 'Goleiro');
    const selectedCount = allPlayers.filter(p => _selectedPlayerIds.has(p.id)).length;

    let html = `<div class="space-y-5">`;

    // ── Painel de jogadores disponíveis ─────────────────────────
    html += `
        <div class="glass-panel rounded-2xl p-5 shadow-lg border border-slate-700">
            <div class="flex items-center justify-between mb-3">
                <h3 class="font-bold flex items-center gap-2">
                    <i class="fa-solid fa-clipboard-check text-blue-400"></i>
                    Jogadores Disponíveis
                    <span id="selected-count" class="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                        ${selectedCount}/${allPlayers.length} selecionados
                    </span>
                </h3>
            </div>

            ${allPlayers.length === 0 ? `
                <p class="text-sm text-slate-500 text-center py-4">Nenhum jogador cadastrado ainda.</p>
            ` : `
                <!-- Ações rápidas -->
                <div class="flex gap-2 mb-4">
                    <button id="select-all-btn" class="flex-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 py-1.5 px-3 rounded-lg transition-colors">
                        <i class="fa-solid fa-check-double mr-1"></i> Todos
                    </button>
                    <button id="deselect-all-btn" class="flex-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 py-1.5 px-3 rounded-lg transition-colors">
                        <i class="fa-solid fa-xmark mr-1"></i> Nenhum
                    </button>
                </div>

                <!-- Goleiros -->
                ${goleiros.length > 0 ? `
                <div class="mb-3">
                    <p class="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-2">Goleiros</p>
                    <div class="space-y-1.5">
                        ${goleiros.map(p => playerCheckbox(p, _selectedPlayerIds.has(p.id))).join('')}
                    </div>
                </div>` : ''}

                <!-- Linha -->
                ${linha.length > 0 ? `
                <div>
                    <p class="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">Jogadores de Linha</p>
                    <div class="space-y-1.5">
                        ${linha.map(p => playerCheckbox(p, _selectedPlayerIds.has(p.id))).join('')}
                    </div>
                </div>` : ''}
            `}
        </div>
    `;

    // ── Formulário de sorteio (apenas Admin) ─────────────────────
    if (isAdmin) {
        html += `
            <div class="glass-panel rounded-2xl p-5 shadow-lg border border-slate-700">
                <h3 class="font-bold mb-4 flex items-center gap-2">
                    <i class="fa-solid fa-shuffle text-primary"></i> Sortear Times
                </h3>

                <form id="draw-form" class="space-y-4">
                    <div>
                        <label class="block text-slate-400 mb-1 text-xs">Jogadores de linha por time (sem goleiro)</label>
                        <select id="team-size" class="input-field py-2">
                            <option value="4">4 na linha (Futsal/Society)</option>
                            <option value="5">5 na linha (Society)</option>
                            <option value="6">6 na linha (Society)</option>
                            <option value="10">10 na linha (Campo)</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-slate-400 mb-1 text-xs">Formação / Distribuição por posição</label>
                        <select id="formation-select" class="input-field py-2">
                            ${getPresets(4).map((f, i) => `<option value="${i}">${f.label}</option>`).join('')}
                            <option value="custom">🎛️ Personalizar...</option>
                        </select>
                    </div>

                    <!-- Formação personalizada -->
                    <div id="custom-formation" class="hidden">
                        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                            <p class="text-xs text-slate-400 font-semibold">
                                Distribuição personalizada <span class="text-primary" id="custom-total-label"></span>
                            </p>
                            <div class="grid grid-cols-3 gap-3">
                                <div>
                                    <label class="block text-slate-400 mb-1 text-[10px]">Defesa</label>
                                    <input type="number" id="custom-d" min="0" value="1" class="input-field py-1 text-sm">
                                </div>
                                <div>
                                    <label class="block text-slate-400 mb-1 text-[10px]">Meio</label>
                                    <input type="number" id="custom-m" min="0" value="2" class="input-field py-1 text-sm">
                                </div>
                                <div>
                                    <label class="block text-slate-400 mb-1 text-[10px]">Ataque</label>
                                    <input type="number" id="custom-a" min="0" value="1" class="input-field py-1 text-sm">
                                </div>
                            </div>
                            <p id="custom-error" class="text-red-400 text-xs hidden">A soma deve ser igual ao total de linha por time.</p>
                        </div>
                    </div>

                    <div class="flex gap-2">
                        <button type="submit" class="btn-primary flex-1 text-base py-3">
                            <i class="fa-solid fa-dice"></i> Realizar Sorteio
                        </button>
                        ${drawHistory.length > 0 ? `
                        <button type="button" id="clear-history-btn" class="btn-secondary px-4 py-3 text-sm" title="Limpar histórico de sorteios">
                            <i class="fa-solid fa-clock-rotate-left"></i>
                        </button>` : ''}
                    </div>

                    ${drawHistory.length > 0 ? `
                    <p class="text-[10px] text-slate-500 text-center">
                        <i class="fa-solid fa-shield-halved"></i>
                        ${drawHistory.length} sorteio(s) memorizados — times repetidos serão evitados
                    </p>` : ''}
                </form>
            </div>
        `;
    } else {
        html += `
            <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-center text-sm text-slate-400">
                Apenas o Administrador pode realizar o sorteio.
            </div>
        `;
    }

    html += `
        <div id="draw-results" class="space-y-4 hidden"></div>
    </div>`;

    container.innerHTML = html;

    // ── Listeners: checkboxes de jogadores ───────────────────────
    container.querySelectorAll('.player-sel-cb').forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.checked) _selectedPlayerIds.add(cb.dataset.id);
            else            _selectedPlayerIds.delete(cb.dataset.id);

            // Atualiza contador sem re-render completo
            const counter = container.querySelector('#selected-count');
            if (counter) counter.textContent = `${[...container.querySelectorAll('.player-sel-cb:checked')].length}/${allPlayers.length} selecionados`;
        });
    });

    container.querySelector('#select-all-btn')?.addEventListener('click', () => {
        allPlayers.forEach(p => _selectedPlayerIds.add(p.id));
        container.querySelectorAll('.player-sel-cb').forEach(cb => cb.checked = true);
        const counter = container.querySelector('#selected-count');
        if (counter) counter.textContent = `${allPlayers.length}/${allPlayers.length} selecionados`;
    });

    container.querySelector('#deselect-all-btn')?.addEventListener('click', () => {
        _selectedPlayerIds.clear();
        container.querySelectorAll('.player-sel-cb').forEach(cb => cb.checked = false);
        const counter = container.querySelector('#selected-count');
        if (counter) counter.textContent = `0/${allPlayers.length} selecionados`;
    });

    if (!isAdmin) return;

    // ── Listeners: formulário de sorteio ─────────────────────────
    const teamSizeEl      = container.querySelector('#team-size');
    const formationEl     = container.querySelector('#formation-select');
    const customPanel     = container.querySelector('#custom-formation');

    function refreshFormationOptions() {
        const size    = parseInt(teamSizeEl.value);
        const presets = getPresets(size);
        const current = formationEl.value;
        formationEl.innerHTML = presets.map((f, i) => `<option value="${i}">${f.label}</option>`).join('')
            + `<option value="custom">🎛️ Personalizar...</option>`;
        if (current === 'custom') formationEl.value = 'custom';
        onFormationChange();
    }

    function onFormationChange() {
        const size = parseInt(teamSizeEl.value);
        if (formationEl.value === 'custom') {
            customPanel.classList.remove('hidden');
            const p = getPresets(size)[0];
            document.getElementById('custom-d').value = p.d;
            document.getElementById('custom-m').value = p.m;
            document.getElementById('custom-a').value = p.a;
            document.getElementById('custom-total-label').textContent = `(total: ${size}/time)`;
        } else {
            customPanel.classList.add('hidden');
        }
    }

    teamSizeEl.addEventListener('change', refreshFormationOptions);
    formationEl.addEventListener('change', onFormationChange);

    container.querySelector('#clear-history-btn')?.addEventListener('click', () => {
        if (confirm('Limpar histórico dos últimos sorteios?')) {
            store.clearDrawHistory();
            renderTeamDraw(container);
        }
    });

    container.querySelector('#draw-form').addEventListener('submit', e => {
        e.preventDefault();

        const size = parseInt(teamSizeEl.value);
        let formation;

        if (formationEl.value === 'custom') {
            const d = parseInt(document.getElementById('custom-d').value) || 0;
            const m = parseInt(document.getElementById('custom-m').value) || 0;
            const a = parseInt(document.getElementById('custom-a').value) || 0;
            const errEl = document.getElementById('custom-error');
            if (d + m + a !== size) { errEl.classList.remove('hidden'); return; }
            errEl.classList.add('hidden');
            formation = { d, m, a };
        } else {
            formation = getPresets(size)[parseInt(formationEl.value)];
        }

        // Filtra apenas jogadores selecionados
        const activePlayers = allPlayers.filter(p => _selectedPlayerIds.has(p.id));
        if (activePlayers.length < 2) {
            alert('Selecione ao menos 2 jogadores para sortear.');
            return;
        }

        drawTeams(size, formation, activePlayers, container.querySelector('#draw-results'));
    });
}

// ─── Helper: checkbox de jogador ─────────────────────────────
function playerCheckbox(p, checked) {
    const posColor = {
        'Goleiro':  'text-orange-400',
        'Zagueiro': 'text-blue-400',
        'Lateral':  'text-blue-400',
        'Meia':     'text-yellow-400',
        'Atacante': 'text-red-400'
    }[p.pos1] || 'text-slate-400';

    return `
        <label class="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors select-none">
            <input type="checkbox"
                class="player-sel-cb w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                data-id="${p.id}"
                ${checked ? 'checked' : ''}>
            <div class="flex-1 flex items-center gap-2 min-w-0">
                <span class="text-[10px] font-bold w-7 shrink-0 ${posColor}">${p.pos1.substring(0,3).toUpperCase()}</span>
                <span class="text-sm font-medium text-slate-200 truncate">${p.name}</span>
                ${p.pos2 ? `<span class="text-[9px] text-slate-500 shrink-0">${p.pos2}</span>` : ''}
            </div>
            <span class="text-xs font-bold text-primary shrink-0">${Number(p.totalScore).toFixed(1)}</span>
        </label>
    `;
}

// ══════════════════════════════════════════════════════════════
//  ALGORITMO DE SORTEIO
// ══════════════════════════════════════════════════════════════

function drawTeams(teamSize, formation, activePlayers, resultsContainer) {
    const drawHistory = store.getDrawHistory();

    let goleiros = activePlayers.filter(p => p.pos1 === 'Goleiro');
    let linha    = activePlayers.filter(p => p.pos1 !== 'Goleiro');

    linha.sort((a, b) => b.totalScore - a.totalScore);

    const totalLinha = linha.length;
    const numTeams   = Math.max(Math.ceil(totalLinha / teamSize), 1);

    let teams = Array.from({ length: numTeams }, () => ({
        players: [], score: 0,
        slots: { defesa: formation.d, meio: formation.m, ataque: formation.a }
    }));

    // Distribui em snake draft por grupo de posição
    function snakeDraft(bucket, group) {
        let sorted = [...bucket].sort((a, b) => b.totalScore - a.totalScore);
        let idx = 0, dir = 1;
        while (sorted.length > 0) {
            let att = 0;
            while (teams[idx].slots[group] <= 0 && att < numTeams) {
                idx = (idx + dir + numTeams) % numTeams; att++;
            }
            if (teams[idx].slots[group] <= 0) break;
            const p = sorted.shift();
            teams[idx].players.push({ ...p, assignedGroup: group });
            teams[idx].score += p.totalScore;
            teams[idx].slots[group]--;
            idx += dir;
            if (idx >= numTeams || idx < 0) { dir *= -1; idx += dir; }
        }
        return sorted;
    }

    // Bucketiza por posição primária
    const buckets = { defesa: [], meio: [], ataque: [] };
    linha.forEach(p => {
        const grp = POS_GROUP[p.pos1];
        if (grp && grp !== 'goleiro') buckets[grp].push(p);
        else if (p.pos2 && POS_GROUP[p.pos2] && POS_GROUP[p.pos2] !== 'goleiro') buckets[POS_GROUP[p.pos2]].push(p);
        else buckets['meio'].push(p);
    });

    const leftovers = [
        ...snakeDraft(buckets.defesa, 'defesa'),
        ...snakeDraft(buckets.meio,   'meio'),
        ...snakeDraft(buckets.ataque, 'ataque')
    ].sort((a, b) => b.totalScore - a.totalScore);

    // Sobras vão para o time com menos pontos + slots disponíveis
    let order = Array.from({ length: numTeams }, (_, i) => i)
        .sort((a, b) => teams[a].score - teams[b].score);

    for (const p of leftovers) {
        for (const ti of order) {
            const total = Object.values(teams[ti].slots).reduce((s, v) => s + v, 0);
            if (total > 0) {
                const grp = POS_GROUP[p.pos1] !== 'goleiro' && teams[ti].slots[POS_GROUP[p.pos1]] > 0
                    ? POS_GROUP[p.pos1]
                    : Object.keys(teams[ti].slots).find(g => teams[ti].slots[g] > 0);
                if (grp) {
                    teams[ti].players.push({ ...p, assignedGroup: grp });
                    teams[ti].score += p.totalScore;
                    teams[ti].slots[grp]--;
                }
                break;
            }
        }
        order.sort((a, b) => teams[a].score - teams[b].score);
    }

    // Anti-repetição: tenta até 15 variações para evitar times já sorteados
    let bestTeams = teams;
    let bestScore = repeatScore(teams, drawHistory);
    if (bestScore > 0) {
        for (let i = 0; i < 15; i++) {
            const candidate = tryDraw(shuffle([...linha]), numTeams, formation, goleiros);
            const rs = repeatScore(candidate, drawHistory);
            if (rs < bestScore) { bestTeams = candidate; bestScore = rs; }
            if (bestScore === 0) break;
        }
        teams = bestTeams;
    }

    // Goleiros (aleatórios)
    shuffle(goleiros).forEach((g, i) => {
        if (teams[i]) teams[i].players.unshift({ ...g, assignedGroup: 'goleiro' });
    });

    // Preenche slots restantes com placeholder
    teams.forEach(t => {
        const remaining = Object.values(t.slots).reduce((s, v) => s + v, 0);
        for (let i = 0; i < remaining; i++)
            t.players.push({ name: 'A definir', pos1: '?', totalScore: 0, assignedGroup: 'livre' });
    });

    // Salva no histórico
    store.addDraw(teams.map(t => t.players.filter(p => p.id).map(p => p.id)));

    renderResults(teams, resultsContainer);
}

// ─── Tentativa de sorteio para anti-repetição ────────────────
function tryDraw(linhaShuffled, numTeams, formation) {
    const buckets = { defesa: [], meio: [], ataque: [] };
    linhaShuffled.forEach(p => {
        const grp = POS_GROUP[p.pos1];
        if (grp && grp !== 'goleiro') buckets[grp].push(p);
        else if (p.pos2 && POS_GROUP[p.pos2] !== 'goleiro') buckets[POS_GROUP[p.pos2]].push(p);
        else buckets['meio'].push(p);
    });

    let teams = Array.from({ length: numTeams }, () => ({
        players: [], score: 0,
        slots: { defesa: formation.d, meio: formation.m, ataque: formation.a }
    }));

    function sd(bucket, group) {
        let sorted = [...bucket].sort((a, b) => b.totalScore - a.totalScore);
        let idx = 0, dir = 1;
        while (sorted.length > 0) {
            let att = 0;
            while (teams[idx].slots[group] <= 0 && att < numTeams) { idx = (idx + dir + numTeams) % numTeams; att++; }
            if (teams[idx].slots[group] <= 0) break;
            const p = sorted.shift();
            teams[idx].players.push({ ...p, assignedGroup: group });
            teams[idx].score += p.totalScore;
            teams[idx].slots[group]--;
            idx += dir; if (idx >= numTeams || idx < 0) { dir *= -1; idx += dir; }
        }
        return sorted;
    }
    const lo = [...sd(buckets.defesa,'defesa'), ...sd(buckets.meio,'meio'), ...sd(buckets.ataque,'ataque')]
        .sort((a, b) => b.totalScore - a.totalScore);
    let order = Array.from({ length: numTeams }, (_, i) => i).sort((a, b) => teams[a].score - teams[b].score);
    for (const p of lo) {
        for (const ti of order) {
            const total = Object.values(teams[ti].slots).reduce((s, v) => s + v, 0);
            if (total > 0) {
                const grp = POS_GROUP[p.pos1] !== 'goleiro' && teams[ti].slots[POS_GROUP[p.pos1]] > 0
                    ? POS_GROUP[p.pos1] : Object.keys(teams[ti].slots).find(g => teams[ti].slots[g] > 0);
                if (grp) { teams[ti].players.push({ ...p, assignedGroup: grp }); teams[ti].score += p.totalScore; teams[ti].slots[grp]--; }
                break;
            }
        }
        order.sort((a, b) => teams[a].score - teams[b].score);
    }
    return teams;
}

function repeatScore(teams, history) {
    if (!history?.length) return 0;
    let score = 0;
    for (const draw of history) {
        for (let ti = 0; ti < teams.length; ti++) {
            const curr = new Set(teams[ti].players.filter(p => p.id).map(p => p.id));
            (draw.teams?.[ti] || []).forEach(hid => { if (curr.has(hid)) score++; });
        }
    }
    return score;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ══════════════════════════════════════════════════════════════
//  RENDER DOS RESULTADOS
// ══════════════════════════════════════════════════════════════

const GRP_COLOR = {
    goleiro: 'text-orange-400',
    defesa:  'text-blue-400',
    meio:    'text-yellow-400',
    ataque:  'text-red-400',
    livre:   'text-slate-500'
};
const GRP_LABEL = { goleiro:'GOL', defesa:'DEF', meio:'MEI', ataque:'ATA', livre:'?' };

function renderResults(teams, el) {
    el.classList.remove('hidden');

    const scores = teams.map(t => {
        const pl = t.players.filter(p => p.id && p.pos1 !== 'Goleiro');
        return pl.length > 0 ? t.score / pl.length : 0;
    });
    const maxS = Math.max(...scores, 0.01);
    const range = Math.max(...scores) - Math.min(...scores);

    const balanceMsg = range < 0.3
        ? `<p class="text-center text-xs text-emerald-400 mb-3"><i class="fa-solid fa-scale-balanced"></i> Times bem equilibrados!</p>`
        : range < 0.7
        ? `<p class="text-center text-xs text-yellow-400 mb-3"><i class="fa-solid fa-triangle-exclamation"></i> Equilíbrio razoável</p>`
        : `<p class="text-center text-xs text-red-400 mb-3"><i class="fa-solid fa-triangle-exclamation"></i> Diferença técnica elevada</p>`;

    el.innerHTML = `<h3 class="font-bold text-lg mb-2 text-center">Resultado do Sorteio</h3>${balanceMsg}`
        + teams.map((t, idx) => {
            const linhaP  = t.players.filter(p => p.id && p.pos1 !== 'Goleiro');
            const avg     = linhaP.length > 0 ? t.score / linhaP.length : 0;
            const barW    = Math.round((avg / maxS) * 100);
            const grouped = {
                goleiro: t.players.filter(p => p.assignedGroup === 'goleiro'),
                defesa:  t.players.filter(p => p.assignedGroup === 'defesa'),
                meio:    t.players.filter(p => p.assignedGroup === 'meio'),
                ataque:  t.players.filter(p => p.assignedGroup === 'ataque'),
                livre:   t.players.filter(p => p.assignedGroup === 'livre'),
            };

            const renderGrp = (grp, label, pls) => pls.length === 0 ? '' : `
                <div class="mt-2">
                    <p class="text-[10px] font-bold uppercase tracking-widest ${GRP_COLOR[grp]} mb-1">${label}</p>
                    ${pls.map(p => `
                        <div class="flex justify-between items-center text-sm py-0.5 ${p.name === 'A definir' ? 'text-slate-500 italic' : 'text-slate-200'}">
                            <div class="flex items-center gap-2">
                                <span class="w-7 text-center text-[10px] font-bold ${GRP_COLOR[grp]}">${GRP_LABEL[grp]}</span>
                                <span>${p.name}</span>
                            </div>
                            ${p.totalScore > 0 ? `<span class="text-xs text-primary font-bold">${Number(p.totalScore).toFixed(1)}</span>` : ''}
                        </div>
                    `).join('')}
                </div>`;

            return `
            <div class="glass-panel rounded-xl overflow-hidden border border-slate-700 shadow-lg fade-in" style="animation-delay:${idx*0.08}s">
                <div class="bg-slate-800 p-3 border-b border-slate-700 flex justify-between items-center">
                    <span class="font-bold text-emerald-400 text-base">Time ${idx + 1}</span>
                    <span class="text-[10px] bg-slate-700 px-2 py-1 rounded text-slate-300">Média: ${avg.toFixed(1)}</span>
                </div>
                <div class="px-3 pt-2">
                    <div class="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                        <div class="h-1 rounded-full bg-gradient-to-r from-emerald-500 to-primary" style="width:${barW}%"></div>
                    </div>
                </div>
                <div class="p-3 divide-y divide-slate-700/40">
                    ${renderGrp('goleiro','Goleiro',grouped.goleiro)}
                    ${renderGrp('defesa','Defesa',grouped.defesa)}
                    ${renderGrp('meio','Meio-Campo',grouped.meio)}
                    ${renderGrp('ataque','Ataque',grouped.ataque)}
                    ${renderGrp('livre','A Definir',grouped.livre)}
                </div>
            </div>`;
        }).join('');
}
