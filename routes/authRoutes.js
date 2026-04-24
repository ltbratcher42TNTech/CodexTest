const express = require('express');
const { login, me } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const objRouter = express.Router();

objRouter.post('/login', login);
objRouter.get('/me', authenticate, me);

module.exports = objRouter;
