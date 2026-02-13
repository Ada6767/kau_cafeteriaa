// =============================================================
//  JSONBIN CONFIGURATION
//  You need TWO bins:
//    1. MENU_BIN_ID  — stores the daily menu
//    2. DATA_BIN_ID  — stores users, tickets, workers
//
//  Both use the same API_KEY.
//  See SETUP_GUIDE.md for how to create them.
// =============================================================

// This file is loaded as a plain <script> tag so it sets window globals
window.JSONBIN_CONFIG = {
    API_KEY: "$2a$10$8aAU3ZjrF09kvBzqGZCwG.gkJ3qY9uugDrm.9LQ7H6rnTsvqVpU..",
    BIN_ID:  "698f3d6dae596e708f282537",   // the bin you already created
    DATA_BIN_ID: "698f7917ae596e708f2894f6"    // new bin for users & tickets
};

// Also export for ES module pages (admin, index)
export const JSONBIN_CONFIG = window.JSONBIN_CONFIG;
