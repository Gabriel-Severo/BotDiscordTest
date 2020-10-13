const { Pool } = require('pg');
const { database_url } = require('../config.json');

const pool = new Pool({
  connectionString: database_url
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};
