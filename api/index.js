let appHandler = null;

module.exports = async (req, res) => {
  try {
    if (!appHandler) {
      const app = require('../backend/src/app');
      const { initDb } = require('../backend/src/config/db');
      try {
        await initDb();
      } catch (dbErr) {
        console.warn('[Vercel Serverless] DB init warning:', dbErr.message);
      }
      appHandler = app;
    }

    // Normalize URL for Express routing
    if (!req.url.startsWith('/api')) {
      req.url = '/api' + (req.url === '/' ? '' : req.url);
    }

    return appHandler(req, res);
  } catch (error) {
    console.error('[Vercel Serverless Error]:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      message: 'Serverless Function Execution Error',
      error: error.message
    }));
  }
};
