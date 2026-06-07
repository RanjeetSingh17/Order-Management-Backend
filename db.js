const Pool = require("pg").Pool;

require('dotenv').config();

const pool = new Pool({
    connectionString:process.env.CONNECTION_STRING,
    ssl: {
        rejectUnauthorized: false,
      },
});

pool.connect((err) => {
    if (err) {
        console.log("Error Connecting to the Database", err);
        return
    } else {
        console.log("Connected to the Database ")
    }
})

module.exports = pool;