let appHandler = null;

module.exports = async (req, res) => {
  try {
    if (!appHandler) {
      const app = require('../src/app');
      const { initDb } = require('../src/config/db');
      try {
        await initDb();
      } catch (dbErr) {
        console.warn('[Vercel Serverless] DB init warning:', dbErr.message);
      }
      appHandler = app;
    }

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
