// NOTE: If you see a "Parsing error" about this file not being found by the project service,
// add this file to the "include" array in your tsconfig.json, or adjust your editor/linter settings.

import express from 'express';

const app = express();
const PORT = 7075; // Hardcode for testing

app.use(express.json());

app.post('/api/raw-sms-data', (req, res) => {
  console.log('Simplified POST /api/raw-sms-data HIT!');
  console.log('Body:', req.body);
  res.status(201).json({ message: 'Simplified endpoint hit successfully.' });
});

// Catch-all for 404s to see if any other path is being hit
app.use((req, res, next) => {
  console.log(`404 - Path not found: ${req.method} ${req.originalUrl}`);
  res.status(404).send("Sorry, can't find that!");
});

app.listen(PORT, () => {
  console.log(`Simplified Server is running on port ${PORT}`);
});