// ============================================================
//  store.js — FutManager
//  Dados compartilhados via Supabase (todos veem o mesmo).
//  Role de Admin/Membro fica no localStorage (por dispositivo).
//  Padrão: cache em memória (leitura síncrona) + Supabase em background.
// ============================================================
import { supabase } from './supabase.js';

// ─── Mappers Supabase ↔ JS ────────────────────────────────
function mapPlayer(row) {
    return {
        id:         String(row.id),
        name:       row.name,
        pos1:       row.pos1,
        pos2:       row.pos2 || '',
        pass:       Number(row.pass),
        vision:     Number(row.vision),
        finish:     Number(row.finish),
        energy:     Number(row.energy),
        stamina:    Number(row.stamina),
        totalScore: Number(row.total_score)
    };
}

function unmapPlayer(p) {
    return {
        id:          p.id,
        name:        p.name,
        pos1:        p.pos1,
        pos2:        p.pos2 || null,
        pass:        p.pass,
        vision:      p.vision,
        finish:      p.finish,
        energy:      p.energy,
        stamina:     p.stamina,
        total_score: p.totalScore
    };
}

function mapTransaction(row) {
    return {
        id:          String(row.id),
        type:        row.type,
        amount:      Number(row.amount),
        date:        row.date,
        description: row.description || '',
        category:    row.category    || ''
    };
}

function mapSettings(row) {
    return {
        fieldAddress:       row?.field_address        || 'Arena Fut - Rua das Flores, 123',
        expenseCategories:  row?.expense_categories   || ['Material', 'Bola', 'Churrasco', 'Goleiro Contratado', 'Árbitro', 'Aluguel do Campo']
    };
}

// ─── Store ────────────────────────────────────────────────
export const store = {
    _cache: {
        user: { role: 'admin', name: 'Administrador', phone: '(00) 00000-0000' },
        players:      [],
        transactions: [],
        settings:     { fieldAddress: 'Arena Fut', expenseCategories: [] },
        drawHistory:  []
    },

    // ── Init (async, chamado no boot do app) ─────────────
    async init() {
        // Preferências por dispositivo ficam no localStorage
        const savedRole  = localStorage.getItem('futmanager_role')  || 'admin';
        const savedPhone = localStorage.getItem('futmanager_phone') || '(00) 00000-0000';
        this._cache.user = {
            role:  savedRole,
            name:  savedRole === 'admin' ? 'Administrador' : 'Jogador Comum',
            phone: savedPhone
        };

        // Busca tudo no Supabase em paralelo
        try {
            const [playersRes, txRes, settingsRes, historyRes] = await Promise.all([
                supabase.from('players').select('*').order('name'),
                supabase.from('transactions').select('*').order('date', { ascending: false }),
                supabase.from('settings').select('*').eq('id', 1).single(),
                supabase.from('draw_history').select('*').order('date', { ascending: false }).limit(4)
            ]);

            if (playersRes.data)  this._cache.players      = playersRes.data.map(mapPlayer);
            if (txRes.data)       this._cache.transactions  = txRes.data.map(mapTransaction);
            if (settingsRes.data) this._cache.settings      = mapSettings(settingsRes.data);
            if (historyRes.data)  this._cache.drawHistory   = historyRes.data;

            if (playersRes.error)  console.warn('[store] players:', playersRes.error.message);
            if (txRes.error)       console.warn('[store] transactions:', txRes.error.message);
            if (settingsRes.error) console.warn('[store] settings:', settingsRes.error.message);
        } catch (err) {
            console.error('[store] init error:', err);
        }

        // Realtime para changes de outros usuários
        this._setupRealtime();
    },

    _setupRealtime() {
        supabase.channel('futmanager-live')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, async () => {
                const { data } = await supabase.from('players').select('*').order('name');
                if (data) this._cache.players = data.map(mapPlayer);
                this._notifyUpdate();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, async () => {
                const { data } = await supabase.from('transactions').select('*').order('date', { ascending: false });
                if (data) this._cache.transactions = data.map(mapTransaction);
                this._notifyUpdate();
            })
            .subscribe();
    },

    _notifyUpdate() {
        window.dispatchEvent(new CustomEvent('store-updated'));
    },

    // ── User (localStorage) ───────────────────────────────
    getUser()   { return this._cache.user; },
    isAdmin()   { return this._cache.user.role === 'admin'; },

    setRole(role) {
        this._cache.user.role = role;
        this._cache.user.name = role === 'admin' ? 'Administrador' : 'Jogador Comum';
        localStorage.setItem('futmanager_role', role);
        this._notifyUpdate();
    },

    updateProfile(phone) {
        this._cache.user.phone = phone;
        localStorage.setItem('futmanager_phone', phone);
    },

    // ── Players ───────────────────────────────────────────
    getPlayers() { return this._cache.players; },

    addPlayer(player) {
        player.id = Date.now().toString();
        // Optimistic update
        this._cache.players.push(player);
        this._cache.players.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
        // Background persist
        supabase.from('players').insert(unmapPlayer(player))
            .then(({ error }) => { if (error) console.error('[store] addPlayer:', error.message); });
    },

    updatePlayer(id, updated) {
        const idx = this._cache.players.findIndex(p => p.id === id);
        if (idx > -1) {
            this._cache.players[idx] = { ...this._cache.players[idx], ...updated };
            const row = this._cache.players[idx];
            supabase.from('players').update(unmapPlayer(row)).eq('id', id)
                .then(({ error }) => { if (error) console.error('[store] updatePlayer:', error.message); });
        }
    },

    deletePlayer(id) {
        this._cache.players = this._cache.players.filter(p => p.id !== id);
        supabase.from('players').delete().eq('id', id)
            .then(({ error }) => { if (error) console.error('[store] deletePlayer:', error.message); });
    },

    // ── Finances ──────────────────────────────────────────
    getFinances() { return this._cache.transactions; },

    getBalance() {
        return this._cache.transactions.reduce(
            (acc, t) => t.type === 'in' ? acc + t.amount : acc - t.amount, 0
        );
    },

    addTransaction(transaction) {
        transaction.id = Date.now().toString();
        this._cache.transactions.unshift(transaction);
        supabase.from('transactions').insert(transaction)
            .then(({ error }) => { if (error) console.error('[store] addTransaction:', error.message); });
    },

    deleteTransaction(id) {
        this._cache.transactions = this._cache.transactions.filter(t => t.id !== id);
        supabase.from('transactions').delete().eq('id', id)
            .then(({ error }) => { if (error) console.error('[store] deleteTransaction:', error.message); });
    },

    // ── Settings ──────────────────────────────────────────
    getSettings() { return this._cache.settings; },

    updateAddress(address) {
        this._cache.settings.fieldAddress = address;
        supabase.from('settings').update({ field_address: address }).eq('id', 1)
            .then(({ error }) => { if (error) console.error('[store] updateAddress:', error.message); });
    },

    addCategory(cat) {
        if (!this._cache.settings.expenseCategories.includes(cat)) {
            this._cache.settings.expenseCategories.push(cat);
            const cats = this._cache.settings.expenseCategories;
            supabase.from('settings').update({ expense_categories: cats }).eq('id', 1)
                .then(({ error }) => { if (error) console.error('[store] addCategory:', error.message); });
        }
    },

    removeCategory(cat) {
        this._cache.settings.expenseCategories =
            this._cache.settings.expenseCategories.filter(c => c !== cat);
        const cats = this._cache.settings.expenseCategories;
        supabase.from('settings').update({ expense_categories: cats }).eq('id', 1)
            .then(({ error }) => { if (error) console.error('[store] removeCategory:', error.message); });
    },

    // ── Draw History ──────────────────────────────────────
    getDrawHistory() { return this._cache.drawHistory || []; },

    addDraw(teamsOfIds) {
        // Silently persist — does NOT trigger _notifyUpdate to avoid clearing results screen
        supabase.from('draw_history').insert({ teams: teamsOfIds }).select().single()
            .then(({ data, error }) => {
                if (error) { console.error('[store] addDraw:', error.message); return; }
                if (data) {
                    this._cache.drawHistory.unshift(data);
                    if (this._cache.drawHistory.length > 4)
                        this._cache.drawHistory = this._cache.drawHistory.slice(0, 4);
                }
            });
    },

    clearDrawHistory() {
        this._cache.drawHistory = [];
        supabase.from('draw_history').delete().gte('id', 1)
            .then(({ error }) => { if (error) console.error('[store] clearDrawHistory:', error.message); });
        this._notifyUpdate();
    }
};
