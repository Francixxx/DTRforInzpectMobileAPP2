const mysql = require("mysql");

// ✅ Change these credentials based on your XAMPP MySQL database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",       // Default user in XAMPP is 'root'
  password: "",       // Leave empty if there's no password
  database: "employeeDB", // Change this to your actual database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed: " + err.stack);
    return;
  }
  console.log("✅ Connected to MySQL Database");
});



module.exports = db;
