import { store } from '../store.js';

export function renderTeamDraw(container) {
    const isAdmin = store.isAdmin();
    const players = store.getPlayers();
    
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
                    
                    <button type="submit" class="btn-primary w-full mt-2 text-lg py-3"><i class="fa-solid fa-dice"></i> Realizar Sorteio</button>
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
        container.querySelector('#draw-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const size = parseInt(document.getElementById('team-size').value);
            drawTeams(size, players, container.querySelector('#draw-results'));
        });
    }
}

function drawTeams(teamSize, allPlayers, resultsContainer) {
    // Separate Goleiros and Linha
    let goleiros = allPlayers.filter(p => p.pos1 === 'Goleiro');
    let linha = allPlayers.filter(p => p.pos1 !== 'Goleiro');

    // Group by positions (Potes)
    const potes = {
        'Zagueiro': [],
        'Lateral': [],
        'Meia': [],
        'Atacante': []
    };
    
    // Sort linha players by score to balance
    linha.sort((a, b) => b.totalScore - a.totalScore);
    
    linha.forEach(p => {
        if(potes[p.pos1]) {
            potes[p.pos1].push(p);
        } else {
            potes['Meia'].push(p); // fallback
        }
    });

    const totalLinha = linha.length;
    const numTeams = Math.ceil(totalLinha / teamSize) || 1;
    
    let teams = Array.from({ length: numTeams }, () => ({ players: [], score: 0 }));
    
    // Distribute from each pot (snake draft to balance score)
    let teamIndex = 0;
    let direction = 1;

    Object.keys(potes).forEach(pos => {
        let pot = potes[pos];
        while(pot.length > 0) {
            let p = pot.shift(); // Takes the highest score in this pot
            teams[teamIndex].players.push(p);
            teams[teamIndex].score += p.totalScore;
            
            teamIndex += direction;
            if (teamIndex >= numTeams || teamIndex < 0) {
                direction *= -1; // Reverse direction
                teamIndex += direction; // Step back in bounds
            }
        }
    });

    // Distribute Goleiros randomly
    goleiros.sort(() => Math.random() - 0.5);
    teams.forEach((t, i) => {
        if (goleiros[i]) {
            t.players.unshift(goleiros[i]); // add to start
        }
    });

    // Fill missing slots with "Jogador a definir"
    teams.forEach(t => {
        const currentLinhaCount = t.players.filter(p => p.pos1 !== 'Goleiro').length;
        const missing = teamSize - currentLinhaCount;
        for (let i = 0; i < missing; i++) {
            t.players.push({ name: 'Jogador a definir', pos1: '?', totalScore: 0 });
        }
    });

    // Render results
    resultsContainer.classList.remove('hidden');
    resultsContainer.innerHTML = `<h3 class="font-bold text-lg mb-4 text-center">Resultado do Sorteio</h3>` + 
        teams.map((t, idx) => {
            const avgScore = t.score / (t.players.filter(p=>p.name!=='Jogador a definir' && p.pos1!=='Goleiro').length || 1);
            return `
            <div class="glass-panel rounded-xl overflow-hidden border border-slate-700 shadow-lg fade-in" style="animation-delay: ${idx * 0.1}s">
                <div class="bg-slate-800 p-3 border-b border-slate-700 flex justify-between items-center">
                    <span class="font-bold text-emerald-400">Time ${idx + 1}</span>
                    <span class="text-[10px] bg-slate-700 px-2 py-1 rounded text-slate-300">Média Técnica: ${avgScore.toFixed(1)}</span>
                </div>
                <div class="p-3 space-y-2">
                    ${t.players.map(p => `
                        <div class="flex justify-between items-center text-sm ${p.name === 'Jogador a definir' ? 'text-slate-500 italic' : 'text-slate-200'}">
                            <div class="flex items-center gap-2">
                                <span class="w-6 text-center text-xs font-bold ${p.pos1 === 'Goleiro' ? 'text-orange-400' : 'text-slate-400'}">${p.pos1 === '?' ? '-' : p.pos1.substring(0,3).toUpperCase()}</span>
                                <span>${p.name}</span>
                            </div>
                            ${p.totalScore > 0 ? `<span class="text-xs text-primary font-bold">${p.totalScore.toFixed(1)}</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            `;
        }).join('');
}
