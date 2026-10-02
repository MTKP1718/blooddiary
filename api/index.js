const app = require('../backend/src/app');
const { initDb } = require('../backend/src/config/db');

let isInitialized = false;

module.exports = async (req, res) => {
  if (!isInitialized) {
    try {
      await initDb();
    } catch (e) {
      console.warn('Vercel serverless DB initialization notice:', e.message);
    }
    isInitialized = true;
  }

  // Ensure request URL matches the Express /api mount prefix
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url === '/' ? '' : req.url);
  }

  return app(req, res);
};
