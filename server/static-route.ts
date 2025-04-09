import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// For ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a router for static pages
export const staticRouter = express.Router();

// Serve a static HTML file directly for the '/static-page' route
staticRouter.get("/static-page", (_req, res) => {
  try {
    // Create path to the static HTML file
    const htmlPath = path.resolve(__dirname, "..", "client", "index.html");
    
    // Read the file synchronously
    const htmlContent = fs.readFileSync(htmlPath, "utf8");
    
    // Set no-cache headers to prevent caching issues
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    
    // Set content type and send the HTML
    res.setHeader("Content-Type", "text/html");
    res.send(htmlContent);
  } catch (error) {
    console.error("Error serving static page:", error);
    res.status(500).send("Error loading page");
  }
});