const { Pool } = require('pg');
const { database_url } = require('../config.json')

const pool = new Pool({
    connectionString: database_url
})

pool.on('connect', () => {
    console.log("Banco de dados conectado")
})

module.exports = {
    query: (text, params) => pool.query(text, params)
}