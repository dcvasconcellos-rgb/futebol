import { store } from '../store.js';

// Position group mapping
const POS_GROUP = {
    'Goleiro':  'goleiro',
    'Zagueiro': 'defesa',
    'Lateral':  'defesa',
    'Meia':     'meio',
    'Atacante': 'ataque'
};

// Default formation configs per total line players
const FORMATION_PRESETS = {
    4:  [{ label: '1-2-1 (1D/2M/1A)', d: 1, m: 2, a: 1 }, { label: '2-1-1 (2D/1M/1A)', d: 2, m: 1, a: 1 }, { label: '1-1-2 (1D/1M/2A)', d: 1, m: 1, a: 2 }],
    5:  [{ label: '2-2-1 (2D/2M/1A)', d: 2, m: 2, a: 1 }, { label: '2-1-2 (2D/1M/2A)', d: 2, m: 1, a: 2 }, { label: '1-2-2 (1D/2M/2A)', d: 1, m: 2, a: 2 }, { label: '1-3-1 (1D/3M/1A)', d: 1, m: 3, a: 1 }],
    6:  [{ label: '2-2-2 (2D/2M/2A)', d: 2, m: 2, a: 2 }, { label: '3-2-1 (3D/2M/1A)', d: 3, m: 2, a: 1 }, { label: '2-3-1 (2D/3M/1A)', d: 2, m: 3, a: 1 }, { label: '1-3-2 (1D/3M/2A)', d: 1, m: 3, a: 2 }],
    10: [{ label: '4-3-3 (4D/3M/3A)', d: 4, m: 3, a: 3 }, { label: '4-4-2 (4D/4M/2A)', d: 4, m: 4, a: 2 }, { label: '3-5-2 (3D/5M/2A)', d: 3, m: 5, a: 2 }, { label: '3-4-3 (3D/4M/3A)', d: 3, m: 4, a: 3 }, { label: '5-3-2 (5D/3M/2A)', d: 5, m: 3, a: 2 }],
};

function getFormationPresets(size) {
    return FORMATION_PRESETS[size] || [{ label: `Livre (${size} de linha)`, d: Math.floor(size/3), m: Math.floor(size/3), a: size - 2*Math.floor(size/3) }];
}

export function renderTeamDraw(container) {
    const isAdmin = store.isAdmin();
    const players = store.getPlayers();
    const drawHistory = store.getDrawHistory();
    
    let html = `<div class="space-y-6">`;

    if (isAdmin) {
        html += `
            <div class="glass-panel rounded-2xl p-5 shadow-lg border border-slate-700">
                <h3 class="font-bold mb-4 flex items-center gap-2"><i class="fa-solid fa-shuffle text-primary"></i> Sortear Times</h3>
                
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

                    <!-- Formation selector (updates dynamically) -->
                    <div>
                        <label class="block text-slate-400 mb-1 text-xs">Formação / Distribuição por posição</label>
                        <select id="formation-select" class="input-field py-2">
                            ${getFormationPresets(4).map((f, i) => `<option value="${i}">${f.label}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Custom formation row (shown when team-size changes) -->
                    <div id="custom-formation" class="hidden">
                        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                            <p class="text-xs text-slate-400 font-semibold mb-1">Distribuição personalizada <span class="text-primary" id="custom-total-label"></span></p>
                            <div class="grid grid-cols-3 gap-3">
                                <div>
                                    <label class="block text-slate-400 mb-1 text-[10px]">Defesa <span class="text-emerald-400" id="avail-def"></span></label>
                                    <input type="number" id="custom-d" min="0" value="1" class="input-field py-1 text-sm">
                                </div>
                                <div>
                                    <label class="block text-slate-400 mb-1 text-[10px]">Meio <span class="text-emerald-400" id="avail-mid"></span></label>
                                    <input type="number" id="custom-m" min="0" value="2" class="input-field py-1 text-sm">
                                </div>
                                <div>
                                    <label class="block text-slate-400 mb-1 text-[10px]">Ataque <span class="text-emerald-400" id="avail-att"></span></label>
                                    <input type="number" id="custom-a" min="0" value="1" class="input-field py-1 text-sm">
                                </div>
                            </div>
                            <p id="custom-error" class="text-red-400 text-xs hidden">A soma deve ser igual ao total de jogadores de linha por time.</p>
                        </div>
                    </div>

                    <div class="flex gap-2">
                        <button type="submit" class="btn-primary flex-1 text-lg py-3"><i class="fa-solid fa-dice"></i> Realizar Sorteio</button>
                        ${drawHistory.length > 0 ? `<button type="button" id="clear-history-btn" class="btn-secondary px-4 py-3 text-sm" title="Limpar histórico de sorteios"><i class="fa-solid fa-clock-rotate-left"></i></button>` : ''}
                    </div>

                    ${drawHistory.length > 0 ? `
                    <p class="text-[10px] text-slate-500 text-center"><i class="fa-solid fa-shield-halved"></i> ${drawHistory.length} sorteio(s) memorizados — times repetidos serão evitados</p>
                    ` : ''}
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
        <div id="draw-results" class="space-y-4 hidden">
            <!-- Results will be injected here -->
        </div>
    </div>`;

    container.innerHTML = html;

    if (isAdmin) {
        const teamSizeEl = document.getElementById('team-size');
        const formationEl = document.getElementById('formation-select');
        const customFormationEl = document.getElementById('custom-formation');

        // Populate formation presets on team-size change
        function updateFormationOptions() {
            const size = parseInt(teamSizeEl.value);
            const presets = getFormationPresets(size);
            formationEl.innerHTML = presets.map((f, i) => `<option value="${i}">${f.label}</option>`).join('') +
                `<option value="custom">🎛️ Personalizar...</option>`;
            customFormationEl.classList.add('hidden');
            updateAvailabilityHints(size);
        }

        function updateAvailabilityHints(size) {
            const linhaPlayers = players.filter(p => p.pos1 !== 'Goleiro');
            const defPlayers = linhaPlayers.filter(p => POS_GROUP[p.pos1] === 'defesa' || POS_GROUP[p.pos2] === 'defesa').length;
            const midPlayers = linhaPlayers.filter(p => POS_GROUP[p.pos1] === 'meio' || POS_GROUP[p.pos2] === 'meio').length;
            const attPlayers = linhaPlayers.filter(p => POS_GROUP[p.pos1] === 'ataque' || POS_GROUP[p.pos2] === 'ataque').length;
            const totalLinha = linhaPlayers.length;
            const numTeams = Math.ceil(totalLinha / size) || 1;

            const labelEl = document.getElementById('custom-total-label');
            const defEl = document.getElementById('avail-def');
            const midEl = document.getElementById('avail-mid');
            const attEl = document.getElementById('avail-att');

            if (labelEl) labelEl.textContent = `(total: ${size}/time)`;
            if (defEl) defEl.textContent = `(~${defPlayers} disp.)`;
            if (midEl) midEl.textContent = `(~${midPlayers} disp.)`;
            if (attEl) attEl.textContent = `(~${attPlayers} disp.)`;
        }

        teamSizeEl.addEventListener('change', updateFormationOptions);
        updateFormationOptions(); // init

        formationEl.addEventListener('change', () => {
            if (formationEl.value === 'custom') {
                customFormationEl.classList.remove('hidden');
                const size = parseInt(teamSizeEl.value);
                updateAvailabilityHints(size);
                // Pre-fill defaults
                const presets = getFormationPresets(size);
                const first = presets[0];
                document.getElementById('custom-d').value = first.d;
                document.getElementById('custom-m').value = first.m;
                document.getElementById('custom-a').value = first.a;
            } else {
                customFormationEl.classList.add('hidden');
            }
        });

        // Clear history
        const clearBtn = container.querySelector('#clear-history-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Limpar histórico dos últimos sorteios?')) {
                    store.clearDrawHistory();
                    renderTeamDraw(container);
                }
            });
        }

        // Form submit
        container.querySelector('#draw-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const size = parseInt(teamSizeEl.value);
            let formation;

            if (formationEl.value === 'custom') {
                const d = parseInt(document.getElementById('custom-d').value) || 0;
                const m = parseInt(document.getElementById('custom-m').value) || 0;
                const a = parseInt(document.getElementById('custom-a').value) || 0;
                const errEl = document.getElementById('custom-error');
                if (d + m + a !== size) {
                    errEl.classList.remove('hidden');
                    return;
                }
                errEl.classList.add('hidden');
                formation = { d, m, a };
            } else {
                const presets = getFormationPresets(size);
                formation = presets[parseInt(formationEl.value)];
            }

            drawTeams(size, formation, players, container.querySelector('#draw-results'));
        });
    }
}

// ─────────────────────────────────────────────
//  DRAW ALGORITHM
// ─────────────────────────────────────────────

function drawTeams(teamSize, formation, allPlayers, resultsContainer) {
    const drawHistory = store.getDrawHistory();

    // Separate goalkeepers and outfield
    let goleiros = allPlayers.filter(p => p.pos1 === 'Goleiro');
    let linha = allPlayers.filter(p => p.pos1 !== 'Goleiro');

    // Sort outfield players by score descending
    linha.sort((a, b) => b.totalScore - a.totalScore);

    const totalLinha = linha.length;
    const numTeams = Math.max(Math.ceil(totalLinha / teamSize), 1);

    // ── Bucket players by position group (primary first, then secondary) ──
    const buckets = { defesa: [], meio: [], ataque: [] };

    // We'll assign each player to one bucket only (primary position takes priority)
    linha.forEach(p => {
        const grp = POS_GROUP[p.pos1];
        if (grp && grp !== 'goleiro') buckets[grp].push(p);
        else if (p.pos2 && POS_GROUP[p.pos2] && POS_GROUP[p.pos2] !== 'goleiro') {
            buckets[POS_GROUP[p.pos2]].push(p);
        } else {
            buckets['meio'].push(p); // fallback
        }
    });

    // ── Build positional slots per team based on formation ──
    // slots = { defesa: [null×d × numTeams], meio: ..., ataque: ... }
    let teams = Array.from({ length: numTeams }, () => ({
        players: [],
        score: 0,
        slots: { defesa: formation.d, meio: formation.m, ataque: formation.a }
    }));

    // ── Snake draft by position group keeping track of slots ──
    function snakeDraft(bucket, group) {
        let sorted = [...bucket].sort((a, b) => b.totalScore - a.totalScore);
        let idx = 0;
        let dir = 1;

        while (sorted.length > 0) {
            // Find next team that still has a slot for this group
            let attempts = 0;
            while (teams[idx].slots[group] <= 0 && attempts < numTeams) {
                idx = (idx + dir + numTeams) % numTeams;
                attempts++;
            }
            if (teams[idx].slots[group] <= 0) break; // no slots left at all

            const p = sorted.shift();
            teams[idx].players.push({ ...p, assignedGroup: group });
            teams[idx].score += p.totalScore;
            teams[idx].slots[group]--;

            // Snake step
            idx += dir;
            if (idx >= numTeams || idx < 0) {
                dir *= -1;
                idx += dir;
            }
        }
        return sorted; // leftover players
    }

    // Draft each group; collect leftovers
    let leftoverD = snakeDraft(buckets.defesa, 'defesa');
    let leftoverM = snakeDraft(buckets.meio, 'meio');
    let leftoverA = snakeDraft(buckets.ataque, 'ataque');

    // ── Remaining slot filling: fill any remaining slots with leftover / flex players ──
    const allLeftovers = [...leftoverD, ...leftoverM, ...leftoverA].sort((a, b) => b.totalScore - a.totalScore);

    function fillRemainingSlots(leftovers) {
        let sorted = [...leftovers].sort((a, b) => b.totalScore - a.totalScore);
        let order = Array.from({ length: numTeams }, (_, i) => i).sort(
            (a, b) => teams[a].score - teams[b].score
        );

        for (const p of sorted) {
            // Assign to the team with lowest score that still has any open slot
            for (const ti of order) {
                const totalSlots = teams[ti].slots.defesa + teams[ti].slots.meio + teams[ti].slots.ataque;
                if (totalSlots > 0) {
                    // Pick the slot group that has remaining slots (prefer primary pos)
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
            // Re-sort by score after each assignment
            order.sort((a, b) => teams[a].score - teams[b].score);
        }
    }

    fillRemainingSlots(allLeftovers);

    // ── Check draw history and try to reshuffle if result repeats ──
    let bestTeams = teams;
    let bestRepeatScore = computeRepeatScore(teams, drawHistory);

    if (bestRepeatScore > 0) {
        // Try up to 15 shuffles to find a non-repeating draw
        for (let attempt = 0; attempt < 15; attempt++) {
            linha.sort(() => Math.random() - 0.5 + (Math.random() - 0.5) * 0.01);
            const candidate = tryDraw(linha, numTeams, teamSize, formation, goleiros);
            const repeatScore = computeRepeatScore(candidate, drawHistory);
            if (repeatScore < bestRepeatScore) {
                bestTeams = candidate;
                bestRepeatScore = repeatScore;
            }
            if (bestRepeatScore === 0) break;
        }
        teams = bestTeams;
    }

    // ── Assign goalkeepers ──
    goleiros.sort(() => Math.random() - 0.5);
    teams.forEach((t, i) => {
        if (goleiros[i]) t.players.unshift({ ...goleiros[i], assignedGroup: 'goleiro' });
    });

    // ── Fill any remaining missing slots with placeholder ──
    teams.forEach(t => {
        const totalSlots = t.slots.defesa + t.slots.meio + t.slots.ataque;
        for (let i = 0; i < totalSlots; i++) {
            t.players.push({ name: 'Jogador a definir', pos1: '?', totalScore: 0, assignedGroup: 'livre' });
        }
    });

    // ── Save this draw to history (store player IDs) ──
    const drawRecord = teams.map(t =>
        t.players.filter(p => p.id).map(p => p.id)
    );
    store.addDraw(drawRecord);

    // ── Render ──
    renderResults(teams, resultsContainer);
}

// Full draw attempt for reshuffling
function tryDraw(linhaShuffled, numTeams, teamSize, formation, goleiros) {
    const buckets = { defesa: [], meio: [], ataque: [] };
    linhaShuffled.forEach(p => {
        const grp = POS_GROUP[p.pos1];
        if (grp && grp !== 'goleiro') buckets[grp].push(p);
        else if (p.pos2 && POS_GROUP[p.pos2] && POS_GROUP[p.pos2] !== 'goleiro') buckets[POS_GROUP[p.pos2]].push(p);
        else buckets['meio'].push(p);
    });

    let teams = Array.from({ length: numTeams }, () => ({
        players: [],
        score: 0,
        slots: { defesa: formation.d, meio: formation.m, ataque: formation.a }
    }));

    function snakeDraft(bucket, group) {
        let sorted = [...bucket].sort((a, b) => b.totalScore - a.totalScore);
        let idx = 0; let dir = 1;
        while (sorted.length > 0) {
            let attempts = 0;
            while (teams[idx].slots[group] <= 0 && attempts < numTeams) { idx = (idx + dir + numTeams) % numTeams; attempts++; }
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

    const lo = [...snakeDraft(buckets.defesa, 'defesa'), ...snakeDraft(buckets.meio, 'meio'), ...snakeDraft(buckets.ataque, 'ataque')]
        .sort((a, b) => b.totalScore - a.totalScore);

    let order = Array.from({ length: numTeams }, (_, i) => i).sort((a, b) => teams[a].score - teams[b].score);
    for (const p of lo) {
        for (const ti of order) {
            const totalSlots = teams[ti].slots.defesa + teams[ti].slots.meio + teams[ti].slots.ataque;
            if (totalSlots > 0) {
                const grp = POS_GROUP[p.pos1] !== 'goleiro' && teams[ti].slots[POS_GROUP[p.pos1]] > 0
                    ? POS_GROUP[p.pos1]
                    : Object.keys(teams[ti].slots).find(g => teams[ti].slots[g] > 0);
                if (grp) { teams[ti].players.push({ ...p, assignedGroup: grp }); teams[ti].score += p.totalScore; teams[ti].slots[grp]--; }
                break;
            }
        }
        order.sort((a, b) => teams[a].score - teams[b].score);
    }
    return teams;
}

// How many players are repeated across teams vs history (lower = better)
function computeRepeatScore(teams, history) {
    if (!history || history.length === 0) return 0;
    let score = 0;
    for (const draw of history) {
        for (let ti = 0; ti < teams.length; ti++) {
            const currentIds = new Set(teams[ti].players.filter(p => p.id).map(p => p.id));
            const histTeam = draw.teams[ti];
            if (!histTeam) continue;
            let matches = 0;
            for (const hid of histTeam) {
                if (currentIds.has(hid)) matches++;
            }
            score += matches;
        }
    }
    return score;
}

// ─────────────────────────────────────────────
//  RENDER RESULTS
// ─────────────────────────────────────────────

const GROUP_COLORS = {
    goleiro: 'text-orange-400',
    defesa:  'text-blue-400',
    meio:    'text-yellow-400',
    ataque:  'text-red-400',
    livre:   'text-slate-500',
    '?':     'text-slate-500'
};

const GROUP_LABELS = {
    goleiro: 'GOL',
    defesa:  'DEF',
    meio:    'MEI',
    ataque:  'ATA',
    livre:   '?',
};

function renderResults(teams, resultsContainer) {
    resultsContainer.classList.remove('hidden');

    // Compute score range for balance indicator
    const scores = teams.map(t => t.score / Math.max(t.players.filter(p => p.id && p.pos1 !== 'Goleiro').length, 1));
    const maxS = Math.max(...scores);
    const minS = Math.min(...scores);
    const range = maxS - minS;

    resultsContainer.innerHTML =
        `<h3 class="font-bold text-lg mb-2 text-center">Resultado do Sorteio</h3>
         ${range < 0.3 ? '<p class="text-center text-xs text-emerald-400 mb-3"><i class="fa-solid fa-balance-scale"></i> Times bem equilibrados!</p>' :
           range < 0.7 ? '<p class="text-center text-xs text-yellow-400 mb-3"><i class="fa-solid fa-triangle-exclamation"></i> Equilíbrio razoável</p>' :
           '<p class="text-center text-xs text-red-400 mb-3"><i class="fa-solid fa-triangle-exclamation"></i> Diferença técnica elevada — considere ajustar</p>'}` +
        teams.map((t, idx) => {
            const linhaP = t.players.filter(p => p.id && p.pos1 !== 'Goleiro');
            const avgScore = linhaP.length > 0 ? (t.score / linhaP.length) : 0;
            const balanceWidth = maxS > 0 ? Math.round((avgScore / maxS) * 100) : 0;

            // Group players for display
            const grouped = {
                goleiro: t.players.filter(p => p.pos1 === 'Goleiro' || p.assignedGroup === 'goleiro'),
                defesa:  t.players.filter(p => p.assignedGroup === 'defesa'),
                meio:    t.players.filter(p => p.assignedGroup === 'meio'),
                ataque:  t.players.filter(p => p.assignedGroup === 'ataque'),
                livre:   t.players.filter(p => p.assignedGroup === 'livre'),
            };

            const renderGroup = (group, label, players) => {
                if (players.length === 0) return '';
                return `
                    <div class="mt-2">
                        <p class="text-[10px] font-bold uppercase tracking-widest ${GROUP_COLORS[group]} mb-1">${label}</p>
                        ${players.map(p => `
                            <div class="flex justify-between items-center text-sm py-0.5 ${p.name === 'Jogador a definir' ? 'text-slate-500 italic' : 'text-slate-200'}">
                                <div class="flex items-center gap-2">
                                    <span class="w-7 text-center text-[10px] font-bold ${GROUP_COLORS[group]}">${GROUP_LABELS[group] || '?'}</span>
                                    <span>${p.name}</span>
                                </div>
                                ${p.totalScore > 0 ? `<span class="text-xs text-primary font-bold">${Number(p.totalScore).toFixed(1)}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>`;
            };

            return `
            <div class="glass-panel rounded-xl overflow-hidden border border-slate-700 shadow-lg fade-in" style="animation-delay:${idx * 0.08}s">
                <div class="bg-slate-800 p-3 border-b border-slate-700 flex justify-between items-center">
                    <span class="font-bold text-emerald-400 text-base">Time ${idx + 1}</span>
                    <span class="text-[10px] bg-slate-700 px-2 py-1 rounded text-slate-300">Média Técnica: ${avgScore.toFixed(1)}</span>
                </div>
                <!-- Balance bar -->
                <div class="px-3 pt-2">
                    <div class="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                        <div class="h-1 rounded-full bg-gradient-to-r from-emerald-500 to-primary transition-all" style="width:${balanceWidth}%"></div>
                    </div>
                </div>
                <div class="p-3 divide-y divide-slate-700/50">
                    ${renderGroup('goleiro', 'Goleiro', grouped.goleiro)}
                    ${renderGroup('defesa', 'Defesa', grouped.defesa)}
                    ${renderGroup('meio', 'Meio-Campo', grouped.meio)}
                    ${renderGroup('ataque', 'Ataque', grouped.ataque)}
                    ${renderGroup('livre', 'A definir', grouped.livre)}
                </div>
            </div>`;
        }).join('');
}
