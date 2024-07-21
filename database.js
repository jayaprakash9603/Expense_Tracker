const mysql = require("mysql");

// Create a connection to the database
const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "123456",
  database: "first_schema", // Replace with your database name
  port: 4000, // Specify the port number
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database: ", err.stack);
    return;
  }
  console.log("Connected to the database as id " + connection.threadId);
});

// Example query
connection.query("SELECT * FROM student_data", (error, results, fields) => {
  if (error) throw error;
  console.log("Results: ", results);
});

// Close the connection
connection.end();
