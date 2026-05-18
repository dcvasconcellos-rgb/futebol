// LocalStorage wrapper and data models

const INITIAL_DATA = {
    user: {
        role: 'admin', // 'admin' or 'user'
        name: 'Administrador',
        phone: '(00) 00000-0000'
    },
    settings: {
        fieldAddress: 'Arena Fut - Rua das Flores, 123',
        expenseCategories: ['Material', 'Bola', 'Churrasco', 'Goleiro Contratado', 'Árbitro', 'Aluguel do Campo']
    },
    finances: {
        transactions: [] // { id, type: 'in'|'out', amount, date, description, category }
    },
    players: [] // { id, name, pos1, pos2, pass, vision, finish, energy, stamina, totalScore }
};

export const store = {
    data: null,

    init() {
        const stored = localStorage.getItem('futmanager_data');
        if (stored) {
            this.data = JSON.parse(stored);
        } else {
            this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
            this.save();
        }
    },

    save() {
        localStorage.setItem('futmanager_data', JSON.stringify(this.data));
        // Simple event emitter pattern for reactivity
        window.dispatchEvent(new CustomEvent('store-updated'));
    },

    getUser() { return this.data.user; },
    setRole(role) { 
        this.data.user.role = role; 
        this.data.user.name = role === 'admin' ? 'Administrador' : 'Jogador Comum';
        this.save(); 
    },
    updateProfile(phone) {
        this.data.user.phone = phone;
        this.save();
    },

    isAdmin() { return this.data.user.role === 'admin'; },

    getFinances() { return this.data.finances.transactions; },
    getBalance() {
        return this.data.finances.transactions.reduce((acc, t) => {
            return t.type === 'in' ? acc + t.amount : acc - t.amount;
        }, 0);
    },
    addTransaction(transaction) {
        transaction.id = Date.now().toString();
        this.data.finances.transactions.push(transaction);
        this.save();
    },
    deleteTransaction(id) {
        this.data.finances.transactions = this.data.finances.transactions.filter(t => t.id !== id);
        this.save();
    },

    getSettings() { return this.data.settings; },
    updateAddress(address) {
        this.data.settings.fieldAddress = address;
        this.save();
    },
    addCategory(cat) {
        if (!this.data.settings.expenseCategories.includes(cat)) {
            this.data.settings.expenseCategories.push(cat);
            this.save();
        }
    },
    removeCategory(cat) {
        this.data.settings.expenseCategories = this.data.settings.expenseCategories.filter(c => c !== cat);
        this.save();
    },

    getPlayers() { return this.data.players; },
    addPlayer(player) {
        player.id = Date.now().toString();
        this.data.players.push(player);
        this.save();
    },
    updatePlayer(id, updated) {
        const index = this.data.players.findIndex(p => p.id === id);
        if (index > -1) {
            this.data.players[index] = { ...this.data.players[index], ...updated };
            this.save();
        }
    },
    deletePlayer(id) {
        this.data.players = this.data.players.filter(p => p.id !== id);
        this.save();
    }
};

store.init();
