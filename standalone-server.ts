import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a simple Express app
const app = express();

// Simple middleware for logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve static HTML content for the root route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Simple Pet Grooming App</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h1 {
            color: #4F46E5;
            text-align: center;
          }
          .services {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 30px;
          }
          .service-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
          }
          .service-card h3 {
            margin-top: 0;
            color: #1F2937;
          }
          .price {
            font-weight: bold;
            color: #4F46E5;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Pet Grooming Services</h1>
          <p>Welcome to our pet grooming service! We provide professional care for your furry friends.</p>
          
          <div class="services">
            <div class="service-card">
              <h3>Basic Bath & Brush</h3>
              <p>A gentle cleansing bath followed by a thorough brushing to remove loose fur.</p>
              <p class="price">$30</p>
            </div>
            
            <div class="service-card">
              <h3>Full Grooming</h3>
              <p>Complete service including bath, haircut, nail trimming, ear cleaning, and more.</p>
              <p class="price">$60</p>
            </div>
            
            <div class="service-card">
              <h3>Nail Trimming</h3>
              <p>Professional nail trimming to maintain your pet's paw health.</p>
              <p class="price">$15</p>
            </div>
          </div>
          
          <p style="text-align: center; margin-top: 30px;">This is a standalone static page.</p>
        </div>
      </body>
    </html>
  `);
});

// Start the server
const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Standalone server running on port ${PORT}`);
});