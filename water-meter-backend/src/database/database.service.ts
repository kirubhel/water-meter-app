// src/database/database.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private _pool: sql.ConnectionPool | null = null; // Use a different name like _pool

  constructor(private readonly configService: ConfigService) {} // ConfigService injected

  async onModuleInit() {
    try {
      const dbUser = this.configService.get<string>('DB_USER');
      const dbPassword = this.configService.get<string>('DB_PASSWORD');
      const isWindowsAuth = dbUser?.includes('\\') && (!dbPassword || dbPassword.trim() === '');

      const dbConfig: sql.config = {
        user: dbUser, // Will be undefined if Windows Auth and password is blank
        password: dbPassword,
        server: this.configService.get<string>('DB_SERVER')!,
        database: this.configService.get<string>('DB_NAME')!,
        port: parseInt(this.configService.get<string>('DB_PORT') || '1433'),
        options: {
          encrypt: this.configService.get<string>('DB_OPTIONS_ENCRYPT') === 'true',
          trustServerCertificate:
            this.configService.get<string>(
              'DB_OPTIONS_TRUST_SERVER_CERTIFICATE',
            ) === 'true',
          ...(isWindowsAuth && { trustedConnection: true, enableArithAbort: true })
        },
        pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
      };
      // For Windows Auth, mssql driver expects user/password to be undefined if trustedConnection is true
      if (isWindowsAuth) {
        delete dbConfig.user; // or set to undefined
        delete dbConfig.password; // or set to undefined
      }


      this.logger.log('DatabaseService: Attempting to connect to SQL Server with config:', {
        ...dbConfig, password: dbConfig.password ? '********' : 'WINDOWS_AUTH_OR_EMPTY',
      });
      
      const tempPool = new sql.ConnectionPool(dbConfig); // Create a new pool instance
      await tempPool.connect();                         // Connect this temporary pool
      this._pool = tempPool; // <--- Assign to the class member *AFTER* successful connect
      this.logger.log('DatabaseService: Successfully connected to SQL Server database!');
    } catch (error) {
      this.logger.error('DatabaseService: Failed to connect to SQL Server database on module init:', error);
      this._pool = null; // Ensure class member is null on error
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this._pool) {
      try {
        await this._pool.close();
        this.logger.log('DatabaseService: SQL Server connection pool closed successfully.');
      } catch (error) {
        this.logger.error('DatabaseService: Error closing SQL Server connection pool:', error);
      } finally {
        // Ensure the pool is marked as null after attempting to close,
        // regardless of whether closing succeeded or failed.
        this._pool = null;
      }
    }
  }

  getDbPool(): sql.ConnectionPool {
    // console.log('DatabaseService.getDbPool(): this._pool is currently:', this._pool); // Optional: if you want to log here too
    if (!this._pool) { // Check the class member _pool
      this.logger.error('Database pool is not available (was null). Check connection errors on startup.');
      // This error indicates a critical problem, likely from startup.
      throw new Error('Database pool is not available. Check connection errors on startup.');
    }
    return this._pool;
  }

  getRequest(): sql.Request {
    console.log('DatabaseService.getRequest(): this._pool is currently:', this._pool ? 'Exists' : 'null'); // <--- ADD THIS (logging existence for brevity)
    // If you want to log the whole pool object, be mindful it can be large:
    // console.log('DatabaseService.getRequest(): this._pool is currently:', this._pool);
    return this.getDbPool().request();
  }
}