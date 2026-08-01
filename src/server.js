const app = require('./app');

// Use port 5001 (Port 5000 is reserved by macOS AirPlay Receiver)
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Smart Expense Tracker API server running on http://localhost:${PORT}`);
  console.log(`📚 Swagger API Docs available at http://localhost:${PORT}/api-docs`);
});
