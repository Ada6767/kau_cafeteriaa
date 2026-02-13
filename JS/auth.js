// =============================================================
//  AUTH.JS — async authentication using cloud DB
// =============================================================

const Auth = {

    customer: {

        register: async function(email, password, name) {
            const existing = await DB.users.findByEmail(email);
            if (existing) return { success: false, message: 'Email already registered.' };

            const isStudent = email.toLowerCase().endsWith('@stu.kau.edu.sa');
            const newUser   = await DB.users.create({ email, password, name, isStudent, balance: 0 });

            return { success: true, user: { ...newUser, password: undefined } };
        },

        login: async function(email, password) {
            const user = await DB.users.findByEmail(email);
            if (!user || user.password !== password) {
                return { success: false, message: 'Invalid email or password.' };
            }
            sessionStorage.setItem('currentUser', JSON.stringify({ ...user, password: undefined }));
            return { success: true, user: { ...user, password: undefined } };
        },

        logout: function() {
            sessionStorage.removeItem('currentUser');
        },

        getCurrentUser: function() {
            const d = sessionStorage.getItem('currentUser');
            return d ? JSON.parse(d) : null;
        },

        // Re-fetch fresh user data from cloud (balance may have changed)
        refreshCurrentUser: async function() {
            const current = this.getCurrentUser();
            if (!current) return null;
            const fresh = await DB.users.findByEmail(current.email);
            if (!fresh) return null;
            const safe = { ...fresh, password: undefined };
            sessionStorage.setItem('currentUser', JSON.stringify(safe));
            return safe;
        }
    },

    worker: {

        login: async function(email, password) {
            const worker = await DB.workers.findByEmail(email);
            if (!worker || worker.password !== password) {
                return { success: false, message: 'Invalid email or password.' };
            }
            sessionStorage.setItem('currentWorker', JSON.stringify({ ...worker, password: undefined }));
            return { success: true, worker: { ...worker, password: undefined } };
        },

        logout: function() {
            sessionStorage.removeItem('currentWorker');
        },

        getCurrentWorker: function() {
            const d = sessionStorage.getItem('currentWorker');
            return d ? JSON.parse(d) : null;
        }
    }
};
