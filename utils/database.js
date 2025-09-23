const { PrismaClient } = require('@prisma/client');

// Singleton pattern for Prisma client to prevent connection pool exhaustion
class DatabaseConnection {
  constructor() {
    if (!DatabaseConnection.instance) {
      this.prisma = new PrismaClient({
        log: ['warn', 'error'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        }
      });
      
      // Handle process termination
      process.on('beforeExit', async () => {
        await this.disconnect();
      });
      
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });
      
      process.on('SIGTERM', async () => {
        await this.disconnect();
        process.exit(0);
      });
      
      DatabaseConnection.instance = this;
    }
    
    return DatabaseConnection.instance;
  }
  
  async connect() {
    try {
      await this.prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }
  
  async disconnect() {
    try {
      await this.prisma.$disconnect();
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
    }
  }
  
  getClient() {
    return this.prisma;
  }
}

// Export singleton instance
const dbConnection = new DatabaseConnection();
module.exports = dbConnection;