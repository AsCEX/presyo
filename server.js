import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3111;

// Serve static files from the 'dist' directory
const distPath = path.join(__dirname, 'dist');

if (!fs.existsSync(distPath)) {
  console.error(`Error: 'dist' directory not found at ${distPath}. Did you run 'npm run build'?`);
}

app.use(express.static(distPath));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Handle SPA routing: serve index.html for all non-file requests
app.get('{*path}', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`Error sending index.html: ${err.message}`);
      res.status(404).send("Production build not found. Please run 'npm run build' first.");
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
