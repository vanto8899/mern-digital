// proxy-server.js
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8888;

app.use(cors()); // Enable CORS for all routes

app.get("/api/v1/app/config", async (req, res) => {
  try {
    const response = await fetch("https://sider.ai/api/v1/app/config", {
      headers: {
        Origin: "http://localhost:3000", // Specify your frontend origin
        "Content-Type": "application/json",
        // Add other necessary headers
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(port, () => {
  console.log(`Proxy server is running on port ${port}`);
});
