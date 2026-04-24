const express = require('express');
const { clockToggle, getMyEntries, getMyStatus } = require('../controllers/timeController');
const { authenticate } = require('../middleware/auth');

const objRouter = express.Router();

objRouter.post('/toggle', authenticate, clockToggle);
objRouter.get('/me', authenticate, getMyEntries);
objRouter.get('/status', authenticate, getMyStatus);

module.exports = objRouter;
