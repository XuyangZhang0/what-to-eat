import app from './app.js';
import dbManager from './database/connection.js';

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Initialize database
    console.log('Initializing database...');
    await dbManager.migrate();
    console.log('Database initialized successfully');

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 What to Eat API server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API endpoints available at: http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📚 API documentation: http://localhost:${PORT}/docs`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(() => {
        console.log('HTTP server closed');
        
        // Close database connection
        try {
          dbManager.close();
          console.log('Database connection closed');
        } catch (error) {
          console.error('Error closing database connection:', error);
        }
        
        console.log('Graceful shutdown completed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.log('Force closing server after 10 seconds');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();