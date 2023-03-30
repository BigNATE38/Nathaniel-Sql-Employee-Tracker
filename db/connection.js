const mysql = require("mysql2");

const connection = mysql.createConnection(
    {
        host: "localhost",

        user: "root",

        password: "",

        database: "company",
    },
    console.log("connected to the company database")
)

module.exports = connection;