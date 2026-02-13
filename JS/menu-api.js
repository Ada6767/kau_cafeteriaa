// Menu API — uses MENU_BIN_ID from config
import { JSONBIN_CONFIG } from './jsonbin-config.js';

const BASE = 'https://api.jsonbin.io/v3/b';

export const MenuAPI = {

    async getAll() {
        try {
            const res = await fetch(`${BASE}/${JSONBIN_CONFIG.MENU_BIN_ID}/latest`, {
                headers: { 'X-Master-Key': JSONBIN_CONFIG.API_KEY }
            });
            if (!res.ok) throw new Error('fetch failed');
            const json = await res.json();
            return json.record || {};
        } catch(e) {
            console.error('MenuAPI.getAll:', e);
            return {};
        }
    },

    async getForDate(dateKey) {
        const all = await this.getAll();
        return all[dateKey] || null;
    },

    async saveForDate(dateKey, menuData) {
        try {
            const all = await this.getAll();
            all[dateKey] = menuData;
            const res = await fetch(`${BASE}/${JSONBIN_CONFIG.MENU_BIN_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': JSONBIN_CONFIG.API_KEY
                },
                body: JSON.stringify(all)
            });
            return res.ok;
        } catch(e) {
            console.error('MenuAPI.saveForDate:', e);
            return false;
        }
    }
};
