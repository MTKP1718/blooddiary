require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initDb, getDbMode } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('----------------------------------------------------');
    console.log('🩸 BloodConnect Backend REST API Initialization');
    console.log('----------------------------------------------------');

    // Initialize Database
    await initDb();
    console.log(`[Database] Active Storage Engine: ${getDbMode().toUpperCase()}`);

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
      console.log(`🩺 Health check available at http://localhost:${PORT}/api/health`);
      console.log('----------------------------------------------------');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received. Closing HTTP server.');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  }
}

startServer();
