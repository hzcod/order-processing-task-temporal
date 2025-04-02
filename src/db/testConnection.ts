import { query } from './db'

;(async () => {
    try {
        const result = await query('SELECT 1 + 1 AS solution')
        console.log('Database connected successfully! Test result:', result)
    } catch (error) {
        console.error('Database connection failed:', error)
    }
})()
