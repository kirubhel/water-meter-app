const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'DAFTech@2024',
  server: '196.190.251.194',
  database: 'WaterMeter',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  }
};

async function testConnection() {
  try {
    console.log('Attempting to connect to SQL Server...');
    console.log('Config:', { ...config, password: '***' });
    
    const pool = await sql.connect(config);
    console.log('✅ Successfully connected to SQL Server!');
    
    const result = await pool.request().query('SELECT @@VERSION as version');
    console.log('SQL Server Version:', result.recordset[0].version);
    
    await pool.close();
    console.log('Connection closed.');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.error('Error details:', err);
  }
}

testConnection(); 