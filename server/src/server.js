const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const config = require('./config');
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false // Disabled for dev convenience
}));

// CORS policy allowing client origins from environment configuration
app.use(cors({
  origin: config.CORS_ALLOWED_ORIGINS,
  credentials: true
}));

// Express body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session management
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), port: config.PORT });
});

// Register API and Auth routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start server on port 7071
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.PORT, () => {
    console.log(`=======================================================`);
    console.log(` Enterprise Signal Intake Engine Server running!`);
    console.log(` Port: ${config.PORT}`);
    console.log(` Allowed Origin: ${config.CLIENT_ORIGIN}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
