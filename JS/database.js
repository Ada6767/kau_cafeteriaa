// =============================================================
//  DATABASE.JS — Cloud storage via JSONBin
//  All data (users, tickets, workers) is stored online so it
//  works across ALL devices (phone, laptop, etc.)
// =============================================================

// ── Config (reads from jsonbin-config.js via a global set before this loads) ──
// We can't use ES module import here because this file is loaded with <script src>
// So the config is injected via window.JSONBIN_CONFIG from a small inline script.

const JSONBIN_BASE = 'https://api.jsonbin.io/v3/b';

// ── Internal helpers ──
async function _readBin(binId, apiKey) {
    try {
        const res = await fetch(`${JSONBIN_BASE}/${binId}/latest`, {
            headers: { 'X-Master-Key': apiKey }
        });
        if (!res.ok) throw new Error('Read failed: ' + res.status);
        const json = await res.json();
        return json.record;
    } catch(e) {
        console.error('[DB] read error:', e);
        return null;
    }
}

async function _writeBin(binId, apiKey, data) {
    try {
        const res = await fetch(`${JSONBIN_BASE}/${binId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': apiKey
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Write failed: ' + res.status);
        return true;
    } catch(e) {
        console.error('[DB] write error:', e);
        return false;
    }
}

// ── Default data structure ──
function _defaultData() {
    return {
        users: [],
        tickets: [],
        workers: [
            {
                id: 'worker1',
                email: 'worker@kau.edu.sa',
                password: 'worker123',
                name: 'Cafeteria Worker'
            }
        ]
    };
}

// ── Main DB object ──
// All methods are async and return Promises.
const DB = {

    _cfg: null,

    // Call once on page load — reads config from window.JSONBIN_CONFIG
    init: function() {
        if (!window.JSONBIN_CONFIG ||
            window.JSONBIN_CONFIG.DATA_API_KEY === 'PASTE_YOUR_API_KEY_HERE') {
            console.warn('[DB] JSONBin not configured yet.');
        }
        this._cfg = window.JSONBIN_CONFIG;
    },

    // Read the whole database record
    _read: async function() {
        const cfg  = this._cfg;
        const data = await _readBin(cfg.DATA_BIN_ID, cfg.API_KEY);
        if (!data || !data.users) {
            // First time — initialise with defaults
            const def = _defaultData();
            await _writeBin(cfg.DATA_BIN_ID, cfg.API_KEY, def);
            return def;
        }
        return data;
    },

    // Write the whole database record
    _write: async function(data) {
        const cfg = this._cfg;
        return await _writeBin(cfg.DATA_BIN_ID, cfg.API_KEY, data);
    },

    // ── Users ──
    users: {
        getAll: async function() {
            const data = await DB._read();
            return data.users || [];
        },

        findByEmail: async function(email) {
            const users = await this.getAll();
            return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
        },

        create: async function(user) {
            const data    = await DB._read();
            const newUser = {
                id: 'user_' + Date.now(),
                ...user,
                createdAt: new Date().toISOString()
            };
            data.users.push(newUser);
            await DB._write(data);
            return newUser;
        },

        update: async function(id, updates) {
            const data  = await DB._read();
            const index = data.users.findIndex(u => u.id === id);
            if (index === -1) return null;
            data.users[index] = { ...data.users[index], ...updates };
            await DB._write(data);
            return data.users[index];
        }
    },

    // ── Workers ──
    workers: {
        findByEmail: async function(email) {
            const data = await DB._read();
            const workers = data.workers || _defaultData().workers;
            return workers.find(w => w.email.toLowerCase() === email.toLowerCase()) || null;
        }
    },

    // ── Tickets ──
    tickets: {
        getAll: async function() {
            const data = await DB._read();
            return data.tickets || [];
        },

        getUserTickets: async function(userId) {
            const tickets = await this.getAll();
            return tickets.filter(t => t.userId === userId);
        },

        create: async function(ticket) {
            const data      = await DB._read();
            const newTicket = {
                id: 'ticket_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                ...ticket,
                used: false,
                createdAt: new Date().toISOString()
            };
            data.tickets.push(newTicket);
            await DB._write(data);
            return newTicket;
        },

        findById: async function(id) {
            const tickets = await this.getAll();
            return tickets.find(t => t.id === id) || null;
        },

        markAsUsed: async function(id) {
            const data  = await DB._read();
            const index = data.tickets.findIndex(t => t.id === id);
            if (index === -1) return null;
            data.tickets[index].used   = true;
            data.tickets[index].usedAt = new Date().toISOString();
            await DB._write(data);
            return data.tickets[index];
        }
    }
};

// Auto-init
DB.init();
