import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'order_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
})

// Function to execute queries
export const query = async (sql: string, values?: any) => {
    const [results] = await pool.execute(sql, values)
    return results
}

export default pool
