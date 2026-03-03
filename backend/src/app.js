const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Basic health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'rend-backend' });
});

// API routes
app.use('/api', routes);

// 404 + error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

