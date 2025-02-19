require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

// Database Connection
const pool = new Pool({
    user: 'u3m7grklvtlo6',
    host: '35.209.89.182',
    database: 'dbzvtfeophlfnr',
    password: 'AekAds@24',
    port: 5432,
});

// Middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Support JSON payloads

// Fetch screens and render index page
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT screenid, screenname, per_screen_rent FROM public.screens ORDER BY screenid ASC");
    res.render("index", { screens: result.rows });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Error fetching screen data" });
  }
});

// Update per_screen_rent
app.post("/update", async (req, res) => {
    const { screenid, per_screen_rent } = req.body;
  
    if (!screenid || !per_screen_rent) {
      return res.status(400).json({ error: "Missing screenid or per_screen_rent" });
    }
  
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
  
      await client.query("UPDATE public.screens SET per_screen_rent = $1 WHERE screenid = $2", [per_screen_rent, screenid]);
      await client.query("UPDATE public.screen_proposal SET per_screen_rent = $1 WHERE screenid = $2", [per_screen_rent, screenid]);
      await client.query("UPDATE public.admin_screens SET per_month_rent = $1 WHERE screenid = $2", [per_screen_rent, screenid]);
  
      await client.query("COMMIT");
      res.json({ success: true, message: "Screen rent updated successfully" });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error updating rent:", err);
      res.status(500).json({ error: "Error updating rent", details: err.message });
    } finally {
      client.release();
    }
  });
  
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
