const express = require("express");
const router = express.Router();
const db = require("../employee-management/db"); // Ensure this file exists and is correctly set up


router.get("/", (req, res) => {
    db.query("SELECT * FROM projects", (err, results) => {
      if (err) {
        console.error("Error fetching projects:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
    });
  });
  
 
  router.post("/add", async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validation
        if (!name || !description) {
            return res.status(400).json({ success: false, message: "Missing fields" });
        }

        const sql = "INSERT INTO projects (name, description) VALUES (?, ?)";
        db.query(sql, [name, description], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ success: false, message: "Database error" });
            }
            res.json({ success: true, message: "Project added successfully" });
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

  module.exports = router;