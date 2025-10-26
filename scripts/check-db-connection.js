#!/usr/bin/env node
(async () => {
  try {
    // Load the CJS DB helper wrapper which validates DATABASE_URL and exposes pingDB
    const mod = require('../config/db.cjs');
    if (!mod || typeof mod.pingDB !== 'function') {
      console.error('pingDB not found in config/db.cjs');
      process.exit(2);
    }

    console.log('Pinging DB...');
    const ok = await mod.pingDB();
    console.log('DB ping result:', ok);
    process.exit(ok ? 0 : 3);
  } catch (err) {
    console.error('Error while checking DB connection:', err);
    process.exit(4);
  }
})();
