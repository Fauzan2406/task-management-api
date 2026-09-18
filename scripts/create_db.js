import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const client = new pg.Client({
  host: process.env.PG_HOST || '127.0.0.1',
  port: Number(process.env.PG_PORT) || 5432,
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '',
  database: 'postgres',
})

async function createDatabase() {
  const dbName = process.env.PG_DB_NAME || 'task_management'
  try {
    await client.connect()
    console.log('Connected to PostgreSQL server.')

    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName])
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`)
      console.log(`✅ Database "${dbName}" successfully created!`)
    } else {
      console.log(`ℹ️ Database "${dbName}" already exists.`)
    }
  } catch (err) {
    console.error('❌ Error creating database:', err.message)
  } finally {
    await client.end()
  }
}

createDatabase()
