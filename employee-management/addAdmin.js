const mysql = require("mysql");
const bcrypt = require("bcryptjs");

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "employeeDB",
});

db.connect(err => {
  if (err) throw err;
  console.log("Connected to MySQL");
});

const addAdmin = async () => {
  const adminName = "admin";
  const adminPassword = "admin123"; // Change this if needed
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const sql = "INSERT INTO employees (name, position, status, password) VALUES (?, ?, ?, ?)";
  db.query(sql, [adminName, "Administrator", "Active", hashedPassword], (err, result) => {
    if (err) throw err;
    console.log("Admin added successfully!");
    db.end();
  });
};

addAdmin();
