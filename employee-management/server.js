const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const chalk = require("chalk");
require("dotenv").config(); // Load environment variables



const app = express();
app.use(express.json());
app.use(cors());


const JWT_SECRET = process.env.JWT_SECRET || "supersecret";


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "employeeDB",
});

db.connect(err => {
  if (err) {
    console.error(chalk.red.bold("❌ MySQL Connection Failed:", err));
    process.exit(1);
  }
  console.log(chalk.green.bold("✅ MySQL Connected..."));
});

const bodyParser = require("body-parser");
const projectsRoutes = require("../routes/projects");
app.use("/api", projectsRoutes);


app.post("/add-employee", async (req, res) => {
  try {
    const { id_number, name, email, position, status, password } = req.body;
    if (!id_number || !name || !email || !position || !status || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if employee already exists
    const checkSql = "SELECT * FROM employees WHERE id_number = ?";
    db.query(checkSql, [id_number], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
      if (results.length > 0) {
        return res.status(400).json({ message: "Employee already exists" });
      }

      // Hash password and insert employee
      const hashedPassword = await bcrypt.hash(password, 10);
      const sql = "INSERT INTO employees (id_number, name, email, position, status, password) VALUES (?, ?, ?, ?, ?, ?)";
      db.query(sql, [id_number, name, email, position, status, hashedPassword], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Database error" });
        }
        res.json({ message: "Employee added successfully" });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/change-password", async (req, res) => {
  const { admin_id, new_password } = req.body;

  if (!admin_id || !new_password) {
    return res.status(400).json({ success: false, message: "Missing parameters" });
  }

  const hashedPassword = await bcrypt.hash(new_password, 10); // Hash password before saving
  const updateQuery = "UPDATE admins SET password = ? WHERE id = ?";

  db.query(updateQuery, [hashedPassword, admin_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.json({ success: true, message: "Password updated successfully" });
  });
});


app.post("/admin-login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password required" });

  const sql = "SELECT * FROM admin WHERE username = ?";
  db.query(sql, [username], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "Admin not found" });

    const admin = results[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin.id, role: "admin" }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Admin login successful", token, admin });
  });
});

app.post("/projects/add", (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
      return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const sql = "INSERT INTO projects (name, description) VALUES (?, ?)";
  db.query(sql, [name, description], (err, result) => {
      if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ success: false, message: "Database error" });
      }
      res.json({ success: true, message: "Project added successfully!" });
  });
});

app.get("/attendance-count", (req, res) => {
  const countQuery = `
    SELECT 
      (SELECT COUNT(*) FROM attendance WHERE time_in IS NOT NULL AND DATE(time_in) = CURDATE()) AS totalIn,
      (SELECT COUNT(*) FROM attendance WHERE time_out IS NOT NULL AND DATE(time_out) = CURDATE()) AS totalOut
  `;

  db.query(countQuery, (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results[0]); // { totalIn: X, totalOut: Y }
  });
});


app.get("/attendance-history", async (req, res) => {
    try {
      db.query(`
      SELECT e.name AS employee_name, a.id_number, a.time_in, a.time_out
      FROM attendance a
      JOIN employees e ON a.id_number = e.id_number
  `, (err, results) => {
      if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Server error" });
      }
      res.json(results);
  });
  
    
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: "Server error" });
    }
});


app.get("/get-user-position", (req, res) => {
  const { name } = req.query; // Get the name from the request

  if (!name) {
      return res.status(400).json({ error: "Employee name is required" });
  }

  const sql = "SELECT position FROM employees WHERE name = ?";
  db.query(sql, [name], (err, results) => {
      if (err) {
          console.error("❌ Database error:", err);
          return res.status(500).json({ message: "Database error" });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "Employee not found" });
      }

      res.json({ position: results[0].position });
  });
});


app.get("/projects", (req, res) => {
  db.query("SELECT * FROM projects", (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

app.get("/get-projects", async (req, res) => {
  try {
    console.log("Fetching projects...");

    const sql = "SELECT * FROM projects";  // Check if this table exists
    db.query(sql, (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      console.log("Projects fetched successfully:", results);
      res.json(results);
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



app.get("/get-user", (req, res) => {
  const userId = req.query.id_number; // Change this if your frontend sends 'id' instead of 'id_number'
  
  console.log("🔍 Received request for user ID:", userId);

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const query = "SELECT id_number, name FROM employees WHERE id_number = ?"; // Make sure this column exists

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("❌ Database query error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("📋 SQL Query Result:", result); // Debugging SQL response

    if (result.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({
      id_number: result[0].id_number,
      name: result[0].name,
    });
  });
});







// ✅ Get All Employees API
app.get("/employees", (req, res) => {
  db.query("SELECT * FROM employees", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});


app.get("/get-timelogs", async (req, res) => {
  const { id_number } = req.query;

  if (!id_number) {
      return res.status(400).json({ error: "Missing employee ID" });
  }

  try {
      const result = await db.query(
        "SELECT time_in, time_out FROM attendance WHERE id_number = ? ORDER BY log_date DESC LIMIT 1",
          [id_number]
      );

      if (result.length === 0) {
          return res.status(404).json({ error: "No time logs found" });
      }

      res.json({
          timeIn: result[0].time_in,
          timeOut: result[0].time_out,
      });
  } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/activities", (req, res) => {
  const sql = "SELECT * FROM activities"; // Fetch activities from DB
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching activities:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.json(result);
    }
  });
});



app.post("/activities/add", (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  db.query("INSERT INTO activities (name, description) VALUES (?, ?)", 
    [name, description], 
    (err, result) => {
      if (err) {
        console.error("Error adding activity:", err);
        res.status(500).json({ success: false, message: "Database error" });
        return;
      }
      res.json({ success: true, message: "Activity added successfully" });
    }
  );
});

// 📌 3️⃣ Delete an Activity
app.delete("/activities/delete/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM activities WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting activity:", err);
      res.status(500).json({ success: false, message: "Database error" });
      return;
    }
    res.json({ success: true, message: "Activity deleted successfully" });
  });
});




app.get("/check-attendance", (req, res) => {
  try {
      const { id_number } = req.query;
      if (!id_number) {
          return res.status(400).json({ error: "ID number is required" });
      }

      // 🔍 Check if employee exists
      const employeeQuery = "SELECT position FROM employees WHERE id_number = ?";
      db.query(employeeQuery, [id_number], (err, employeeResults) => {
          if (err) {
              console.error("❌ Database error:", err);
              return res.status(500).json({ error: "Database error" });
          }

          if (employeeResults.length === 0) {
              return res.status(404).json({ error: "Employee not found" });
          }

          const employee = employeeResults[0];

          // 🔍 Check today's attendance
          const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
          const attendanceQuery = "SELECT time_out FROM attendance WHERE id_number = ? AND DATE(time_in) = ?";
          db.query(attendanceQuery, [id_number, today], (err, attendanceResults) => {
              if (err) {
                  console.error("❌ Database error:", err);
                  return res.status(500).json({ error: "Database error" });
              }

              res.json({
                  alreadyTimedIn: attendanceResults.length > 0,
                  alreadyTimedOut: attendanceResults.length > 0 && attendanceResults[0].time_out !== null,
                  position: employee.position, // ✅ Include position in response
              });
          });
      });
  } catch (error) {
      console.error("❌ Error checking attendance:", error);
      res.status(500).json({ error: "Server error" });
  }
});

app.delete("/projects/delete/:id", (req, res) => {
  const projectId = req.params.id;

  db.query("DELETE FROM projects WHERE id = ?", [projectId], (error, result) => {
    if (error) {
      console.error("Database Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ success: true, message: "Project deleted successfully!" });
  });
});



app.delete("/delete-employee/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM employees WHERE id = ?";

  db.query(sql, [id], (err, result) => {
      if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({ success: false, message: "Database error" });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: "Employee not found" });
      }

      res.json({ success: true, message: "Employee deleted successfully!" });
  });
});

app.put("/remove-project", async (req, res) => {
  const { projectId } = req.body;

  if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
  }

  try {
      const query = "UPDATE projects SET is_active = 0 WHERE id = ?";
      await db.query(query, [projectId]);

      res.json({ success: true, message: "Project removed successfully" });
  } catch (error) {
      console.error("Error removing project:", error);
      res.status(500).json({ error: "Failed to remove project" });
  }
});




app.put("/change-password/:id", async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) {
      return res.status(400).json({ success: false, message: "Password is required." });
  }

  try {
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the new password
      const sql = "UPDATE employees SET password = ? WHERE id = ?";
      
      db.query(sql, [hashedPassword, id], (err, result) => {
          if (err) {
              console.error(err);
              return res.status(500).json({ success: false, message: "Database error" });
          }
          if (result.affectedRows === 0) {
              return res.status(404).json({ success: false, message: "Employee not found" });
          }
          res.json({ success: true, message: "Password updated successfully!" });
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error updating password" });
  }
});

// Update Employee
app.put("/update-employee/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, position, status } = req.body;
  const sql = "UPDATE employees SET name = ?, email = ?, position = ?, status = ? WHERE id = ?";

  db.query(sql, [name, email, position, status, id], (err, result) => {
    if (err) {
      console.error("❌ Error updating employee:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    console.log("🔍 Update Result:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee updated successfully" });
  });
});



const cron = require("node-cron");


cron.schedule("30 6 * * *", () => {
  console.log("🔄 Resetting attendance records...");

  const resetQuery = "UPDATE attendance SET time_in = NULL, time_out = NULL WHERE DATE(time_in) = CURDATE()";

  db.query(resetQuery, (err, result) => {
    if (err) {
      console.error("❌ Error resetting attendance:", err);
    } else {
      console.log(`✅ Attendance reset successfully at 6:30 AM! Rows affected: ${result.affectedRows}`);
    }
  });
});
     
app.get("/attendance/:id_number", (req, res) => {
  const { id_number } = req.params;

  const sql = "SELECT * FROM attendance WHERE id_number = ? ORDER BY time_in DESC";
  db.query(sql, [id_number], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});

// ✅ Employee Login API
app.post("/login", async (req, res) => {
  console.log("🛠 Login API Request Body:", req.body);
  const { id_number, password } = req.body;

  if (!id_number || !password) {
    return res.status(400).json({ message: "Missing ID number or password" });
  }

  const sql = "SELECT * FROM employees WHERE id_number = ?";
  db.query(sql, [id_number], async (err, results) => {
    if (err) {
      console.error("❌ Database error", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      console.log("❌ Employee not found");
      return res.status(404).json({ message: "Employee not found" });
    }

    const user = results[0];
    console.log("🔍 Employee found:", user);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Incorrect password");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("✅ Login successful! Returning user:", {
      id_number: user.id_number,
      name: user.name,
      email: user.email,
      position: user.position,
      status: user.status,
    });

    res.json({
      message: "Login successful",
      user: {
        id_number: user.id_number,
        name: user.name,
        email: user.email,
        position: user.position,
        status: user.status,
      },
    });
  });
});

app.post("/time-in", (req, res) => {
  const { id_number } = req.body;

  // 🔍 Check if user has already timed in today
  const checkQuery = "SELECT * FROM attendance WHERE id_number = ? AND DATE(time_in) = CURDATE()";

  db.query(checkQuery, [id_number], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "Already Time In for today" });
    }

    // ✅ Insert only if no existing entry
    const insertQuery = "INSERT INTO attendance (id_number, time_in) VALUES (?, NOW())";
    db.query(insertQuery, [id_number], (err, result) => {
      if (err) {
        console.error("❌ Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ message: "Time In Successful" });
    });
  });
});


app.post("/time-out", (req, res) => {
  const { id_number } = req.body;

  console.log("📥 Received time-out request:", req.body);

  if (!id_number) {
    console.log("❌ Missing id_number in request body");
    return res.status(400).json({ message: "Missing id_number" });
  }

  // 🔍 Check if user has already timed in
  const checkQuery = "SELECT * FROM attendance WHERE id_number = ? AND DATE(time_in) = CURDATE()";

  db.query(checkQuery, [id_number], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    console.log("🔍 Time In Check Results:", results);

    if (results.length === 0) {
      return res.status(400).json({ message: "Please Time In first before Timing Out" });
    }

    // ✅ Time Out
    const updateQuery = "UPDATE attendance SET time_out = NOW() WHERE id_number = ? AND DATE(time_in) = CURDATE()";

    db.query(updateQuery, [id_number], (err, result) => {
      if (err) {
        console.error("❌ Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ message: "Time Out Successful" });
    });
  });
});


// ✅ Start Server
app.listen(5000, () => console.log(chalk.blue.bold("🚀 Server running on port 5000")));
